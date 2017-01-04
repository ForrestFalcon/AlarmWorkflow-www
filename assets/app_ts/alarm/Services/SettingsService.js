define(["require", "exports"], function (require, exports) {
    "use strict";
    var SettingsService = (function () {
        function SettingsService($http) {
            this.http = $http;
        }
        SettingsService.prototype.GetSections = function (successCallback) {
            return this.http.get(SettingsService.SETTINGS_SECTION_URL + name).then(function (response) {
                successCallback(response.data);
            });
        };
        SettingsService.prototype.GetSection = function (name, successCallback) {
            return this.http.get(SettingsService.SETTINGS_SECTION_URL + name).then(function (response) {
                var settings = {};
                angular.forEach(response.data, function (value, key) {
                    this[key] = value._valueSerialized;
                }, settings);
                successCallback(settings);
            });
        };
        SettingsService.SETTINGS_URL = "/api/settings/";
        SettingsService.SETTINGS_SECTION_URL = "/api/settings/get/";
        return SettingsService;
    }());
    exports.SettingsService = SettingsService;
});
