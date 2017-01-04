export interface ISettingsService {
      GetSection(name:string, successCallback: Function);
      GetSections(successCallback: Function);
}

export interface ISettingSection {
  [id: string] : any;
}
