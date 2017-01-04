import ng = require("angular");
import {ISettingsService, ISettingSection} from "../Modules/ISettingsService";

export class SettingsService implements ISettingsService {

  private static SETTINGS_URL: string = "/api/settings/";
  private static SETTINGS_SECTION_URL: string = "/api/settings/get/";

  private http: ng.IHttpService;

  constructor($http: ng.IHttpService) {
    this.http = $http;
  }

  GetSections(successCallback: Function): any {
    return this.http.get(SettingsService.SETTINGS_SECTION_URL + name).then((response) => {
      successCallback(response.data);
    });
  }

  GetSection(name: string, successCallback: Function): any {
    return this.http.get(SettingsService.SETTINGS_SECTION_URL + name).then((response) => {
      let settings : ISettingSection = {};

      angular.forEach(response.data, function(value, key) {
        this[key] = value._valueSerialized;
      }, settings);

      successCallback(settings);
    });
  }
}
