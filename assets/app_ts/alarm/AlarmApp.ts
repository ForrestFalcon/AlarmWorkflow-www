import angular = require("angular");

import {AlarmCtrl} from "./Controllers/AlarmCtrl";

import {SettingsService} from "./Services/SettingsService";

import {AwClock} from "./Directives/AwClock";
import {AwWeather} from "./Directives/AwWeather";
import {AwCalendar} from "./Directives/AwCalendar";
import {AwWarnings} from "./Directives/AwWarnings";

/**
 * The main Alarm app module.
 *
 * @type {angular.Module}
 */
var alarmApp: ng.IModule = angular.module('alarmApp', [])
  .controller('alarmCtrl', AlarmCtrl)
  .directive('awClock', AwClock)
  .directive('awWeather', AwWeather.factory())
  .directive('awCalendar', AwCalendar.factory())
  .directive('awWarnings', AwWarnings.factory())
  .service("SettingsService", SettingsService)

function bootstrapApplication() {
  angular.element(document).ready(function() {
    angular.bootstrap(document, ["alarmApp"]);
  });
}

var initInjector: ng.auto.IInjectorService = angular.injector(["ng"]);
var $http: ng.IHttpService = < ng.IHttpService > initInjector.get("$http");
var $q: ng.IQService = < ng.IQService > initInjector.get("$q");

var service: SettingsService = new SettingsService($http);
var ret = [
  service.GetSection("WebService", (response) => alarmApp.constant("ConfigWebService", response)),
  service.GetSection("Shared", (response) => alarmApp.constant("ConfigShared", response))
];

$q.all(ret).then(() => {
  bootstrapApplication();
});