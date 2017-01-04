/// <amd-dependency path="jquery-stopwatch" />

declare var H: any;
declare var emkResources: any;

import $ = require("jquery");
import ng = require("angular");
import L = require("leaflet");

import {ISettingsService, ISettingSection} from "../Modules/ISettingsService";

export class AlarmCtrl {

  private static OPERATION_URL: string = "/api/operation/latest";

  //Maps
  private gmap;
  private hmap;
  private hPlatform;
  private osm: L.Map;

  private osmMarker: L.Marker = null;

  //Current Operation. -1 for no Operation
  private currentOpId: number = -1;

  // $inject annotation.
  // It provides $injector with information about dependencies to be injected into constructor
  // it is better to have it close to the constructor, because the parameters must match in count and type.
  // See http://docs.angularjs.org/guide/di
  public static $inject = [
    '$scope',
    '$interval',
    '$http',
    '$timeout',
    'ConfigWebService',
    'ConfigShared'
  ];

  private scope: any;

  // dependencies are injected via AngularJS $injector
  // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
  constructor(
    private $scope: any,
    private $interval: ng.IIntervalService,
    private $http: ng.IHttpService,
    private $timeout: ng.ITimeoutService,
    private configWebService: ISettingSection,
    private configShared: ISettingSection
    ) {
    console.log("controller start");

    console.log(configWebService);
    console.log(configShared);

    this.$scope.configShared = configShared;
    this.$scope.configWebService = configWebService;
    this.$scope.op = null;

    this.loadMapData();
    this.loadOperationData();

    let refreshTime: number = this.$scope.configWebService['UpdateInterval'];
    console.log("Operation refresh Time: " + (refreshTime / 1000) + "s");
    $interval(this.loadOperationData.bind(this), refreshTime);
  }

  private setResources(currentOpId: number) {
    var orsc = "";

    // Resources
    $.get("/api/operation/getFilteredResources/" + currentOpId, function(data) {
      var value;

      emkResources.forEach(function(emkResource) {
        var isAlarmed = false;
        data.forEach(function(resource) {
          if (resource.Emk != null && resource.Emk.DisplayName == emkResource.DisplayName)
            isAlarmed = true;
        });

        if (isAlarmed)
          value = "<div class=\"oresource alarmed\">" + emkResource.DisplayName + "</div>";
        else
          value = "<div class=\"oresource\">" + emkResource.DisplayName + "</div>";

        orsc += value;
      });

      $("#orsc").html(orsc);
    });
  }

  private startStopwatch(op) {
    var text = '{M}:{ss} min seit Alarmierung';

    //German Timezone
    var time = op.TimestampIncome + "+0100";

    //Stopwatch
    var watch: any = $('#stopwatch');
    var startWatch = new Date().getTime() - new Date(time).getTime();
    try {
      //Destroy old stopwatch for a new operation
      watch.stopwatch('destroy');
    } catch (err) { }

    watch.stopwatch({ format: text, startTime: startWatch });
    watch.stopwatch('start');
  }

  private loadMapData() {
    //OSM
    this.osm = L.map('oosm');
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.osm);
    L.tileLayer('http://www.openfiremap.org/hytiles/{z}/{x}/{y}.png').addTo(this.osm);
    this.osm.setView([0, 0], 12);


    //Step 1: initialize communication with the platform
    this.hPlatform = new H.service.Platform({
      app_id: this.$scope.configWebService["HereAppId"],
      app_code: this.$scope.configWebService["HereAppCode"],
      useCIT: true,
      useHTTPS: true
    });

    // set up containers for the map  + panel
    var mapContainer = document.getElementById('ohere');

    var defaultLayers = this.hPlatform.createDefaultLayers();
    this.hmap = new H.Map(mapContainer, defaultLayers.normal.map);
  }

  /**
   * This function will be called if a communication error occurs during the JSON-P request
   * @param  {Object} error  The error message received.
   */
  private onError(error) {
    console.error("Error HereMaps: ", error);
  }

  private startHereMap(op) {

    var sText = this.$scope.configShared["FD.ZipCode"] + " "
      + this.$scope.configShared["FD.City"] + ", "
      + this.$scope.configShared["FD.Street"] + " "
      + this.$scope.configShared["FD.StreetNumber"];

    var geocoder = this.hPlatform.getGeocodingService(),
      geocodingParameters = {
        searchText: sText,
        jsonattributes: 1
      };

    geocoder.geocode(
      geocodingParameters,
      (result) => {
        var locations = result.response.view[0].result;
        var position = {
          lat: locations[0].location.displayPosition.latitude,
          lng: locations[0].location.displayPosition.longitude
        };
        this.hmap.setCenter(position);
        this.hmap.setZoom(parseInt(this.$scope.configWebService["HereZoomLevel"]));

        if (op.Einsatzort.HasGeoCoordinates == true) {
          this.calculateRouteFromAtoB(position, op.Einsatzort)
        }
      },
      this.onError
      );
  }

  private calculateRouteFromAtoB(from, to) {
    var waypoint0 = from.lat + "," + from.lng;
    var waypoint1 = to.GeoLatitudeString + "," + to.GeoLongitudeString;

    var router = this.hPlatform.getRoutingService(),
      routeRequestParams = {
        mode: 'fastest;car',
        representation: 'display',
        routeattributes: 'waypoints,summary,shape',
        waypoint0: waypoint0,
        waypoint1: waypoint1
      };

    router.calculateRoute(
      routeRequestParams,
      (result) => {
        var route = result.response.route[0];
        this.addRouteShapeToMap(route);
      },
      this.onError
      );
  }

  /**
   * Creates a H.map.Polyline from the shape of the route and adds it to the map.
   * @param {Object} route A route as received from the H.service.RoutingService
   */
  private addRouteShapeToMap(route) {
    var strip = new H.geo.Strip(),
      routeShape = route.shape,
      polyline;

    routeShape.forEach(function(point) {
      var parts = point.split(',');
      strip.pushLatLngAlt(parts[0], parts[1]);
    });

    if (this.routeLine != undefined) {
      this.hmap.removeObject(this.routeLine);
      this.hmap.removeObject(this.startMarker);
      this.hmap.removeObject(this.stopMarker);
    }

    this.routeLine = new H.map.Polyline(strip, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 255, 0.7)'
      }
    });
    // Add the polyline to the map
    this.hmap.addObject(this.routeLine);
    // And zoom to its bounding rectangle
    this.hmap.setViewBounds(this.routeLine.getBounds(), true);
    //Add Markers
    this.startMarker = new H.map.Marker({
      lat: route.waypoint[0].mappedPosition.latitude,
      lng: route.waypoint[0].mappedPosition.longitude
    });
    this.hmap.addObject(this.startMarker);
    this.stopMarker = new H.map.Marker({
      lat: route.waypoint[1].mappedPosition.latitude,
      lng: route.waypoint[1].mappedPosition.longitude
    });
    this.hmap.addObject(this.stopMarker);
  }

  private startMarker;
  private stopMarker;
  private routeLine;

  private startOFMap(op) {
    var location = [op.Einsatzort.GeoLatitudeString, op.Einsatzort.GeoLongitudeString];
    this.osm.setView(location, parseInt(this.$scope.configWebService["OSMZoomLevel"]));
    if (this.osmMarker == null) {
      this.osmMarker = L.marker(location);
      this.osmMarker.addTo(this.osm);
    } else {
      this.osmMarker.setLatLng(location);
    }
  }

  private loadOperationData() {
    this.$http.get(AlarmCtrl.OPERATION_URL).then((result) => {
      this.$scope.hasErrors = (result.status != 200);

      var op: any = result.data;

      if (!(op.length == 0)) {
        if (this.currentOpId != op.Id) {
          console.log("New Operation", op);
          this.currentOpId = op.Id;
          this.$scope.op = op;

          var oaddress = "";
          if (op.Einsatzort.Street != null) {
            oaddress += op.Einsatzort.Street + " ";
          }
          if (op.Einsatzort.StreetNumber != null) {
            oaddress += op.Einsatzort.StreetNumber + ", ";
          }
          if (op.Einsatzort.ZipCode != null) {
            oaddress += op.Einsatzort.ZipCode + " ";
          }
          if (op.Einsatzort.City != null) {
            oaddress += op.Einsatzort.City;
          }
          oaddress = oaddress.replace("  ", " ");
          this.$scope.oaddress = oaddress;

          this.setResources(op.Id);

          this.startOFMap(op);
          this.startHereMap(op);
          this.startStopwatch(op);
        }
      } else {
        this.currentOpId = -1;
        this.$scope.op = null;
      }
    }).catch((result) => this.$scope.hasErrors = true);
  }
}
