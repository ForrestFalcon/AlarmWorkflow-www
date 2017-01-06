/// <amd-dependency path="jquery-weather" />

import $ = require("jquery");

export class AwWeather implements ng.IDirective {

  dayArray = {
    "Fri": "Freitag",
    "Sat": "Samstag",
    "Sun": "Sonntag",
    "Mon": "Montag",
    "Tue": "Dienstag",
    "Wed": "Mittwoch",
    "Thu": "Donnerstag"
  };

  weatherTranslationArray = {
    "AM Light Snow": "Leichter Schneefall",
    "Snow Early": "Vormittags Schneefall",
    "Severe thunderstorms": "starke Gewitter",
    "Thunderstorms": "Gewitter",
    "Mixed rain and snow": "Schneeregen",
    "Mixed rain and sleet": "Regen und Graupel",
    "Mixed snow and sleet": "Schnee und Graupel",
    "Freezing drizzle": "Gefrierender Regen",
    "Drizzle": "Nieselregen",
    "Freezing rain": "Eisregen",
    "Showers": "Regenschauer",
    "Snow flurries": "Schneetreiben",
    "Light snow showers": "Leichter Schneeregen",
    "Blowing snow": "Schneesturm",
    "Snow": "Schnee",
    "Hail": "Hagel",
    "Sleet": "Schneeregen",
    "Dust": "Staubig",
    "Foggy": "Neblig",
    "Fog": "Nebel",
    "AM Fog\/PM Sun": "Nebel \/ Sonne",
    "Mist": "Nebel",
    "Haze": "Dunst",
    "Smoky": "Verraucht",
    "Blustery": "Stürmisch",
    "Windy": "Windig",
    "Cold": "Kalt",
    "Cloudy": "Bewölkt",
    "Partly Cloudy": "Teilweise Bewölkt",
    "Clear (night)": "Klare Nacht",
    "Sunny": "Sonnig",
    "Fair (night)": "Schöne Nacht",
    "Fair (day)": "Schöner Tag",
    "Mixed rain and hail": "Regen und Hagel",
    "Hot": "Heiß",
    "Isolated thunderstorms": "Vereinzelte Gewitter",
    "Scattered thunderstorms": "Vereinzelte Gewitter",
    "Scattered Showers": "Vereinzelte Schauer",
    "Heavy snow": "Starke Schneefälle",
    "Scattered snow showers": "Vereinzelt Schneeregen",
    "Thundershowers": "Gewitter",
    "Snow showers": "Schneeregen",
    "Isolated thundershowers": "Vereinzelte Gewitterschauer",
    "Not available": "Nicht verfügbar",
    "Mostly Clear": "Großteils Klar",
    "Mostly Sunny": "Großteils Sonnig",
    "Mostly Cloudy": "Großteils Bewölkt",
    "PM Showers": "Abends Regen",
    "AM Showers": "Vormittags Regen",
    "Rain": "Regen",
    "Heavy Rain": "Starker Regen",
    "Light Rain": "Leichter Regen",
    "Rain Shower": "Regenschauer",
    "Light Rain Early": "Leichter Regen",
    "Clear": "Klar",
    "PM Thunderstorms": "Abends Gewitter",
    "Cloudy\/Wind": "Bewölkt\/Wind",
    "Mostly Cloudy\/Wind": "Bewölkt\/Wind",
    "Thunderstorms Early": "Gewitter",
    "Isolated Thunderstorms": "Vereinzelte Gewitter",
    "Light Drizzle": "Leichter Niesel",
    "Showers Late": "Abends Regen",
    "AM Light Rain": "Leichter Regen",
    "Scattered Thunderstorms": "Vereinzelt Donner",
    "Light Rain Shower": "Leichte Schauer",
    "Showers Early": "Vormittags Regen",
    "PM Light Rain": "Leichter Regen",
    "PM Drizzle": "Abends Nieselregen",
    "Rain/Snow Late": "Regen/Schnee",
    "AM Rain/Snow Showers": "Schneeregen",
    "Rain/Snow Showers Late": "Schneeregen",
    "AM Snow": "Vormittags Schnee",
    "Rain And Snow": "Schneeregen",
	"Snow Showers": "Schneeschauer"
  };

  private getWeatherTranslationText(text) {
    var ret = this.weatherTranslationArray[text];
    if (!ret)
      return text;
    else
      return ret;
  }


  //Expose a static func so that it can be used to register directive.
  static factory(): ng.IDirectiveFactory {
    var directive: ng.IDirectiveFactory =
      ($interval: ng.IIntervalService) => new AwWeather($interval);
    directive.$inject = ["$interval"];
    return directive;
  }

  intervalTime: number = 1000 * 60 * 60; //Upate weather every hour
  scope: any = {};
  restrict: string = 'A';
  replace: boolean = false;
  templateUrl: string = `/assets/app_ts/alarm/Directives/AwWeather.htm`;

  interval: ng.IIntervalService;
  constructor(private $interval: ng.IIntervalService) {
    this.interval = $interval;
  }

  link: ng.IDirectiveLinkFn = ($scope, elem: any, attrs) => {
    var tmp: any = $;

    var weather = () => {
      tmp.simpleWeather({
        location: attrs.awWeather,
        unit: 'c',
        success: (weather) => {
          weather.forecast[0].day = this.dayArray[weather.forecast[0].day];
          weather.forecast[0].text = this.getWeatherTranslationText(weather.forecast[0].text);


          weather.forecast[1].day = this.dayArray[weather.forecast[1].day];
          weather.forecast[1].text = this.getWeatherTranslationText(weather.forecast[1].text);


          weather.forecast[2].day = this.dayArray[weather.forecast[2].day];
          weather.forecast[2].text = this.getWeatherTranslationText(weather.forecast[2].text);

          $scope.$apply(() => $scope.weather = weather);
        }
      });
    };

    weather();
    this.interval(weather, this.intervalTime);
  };
}