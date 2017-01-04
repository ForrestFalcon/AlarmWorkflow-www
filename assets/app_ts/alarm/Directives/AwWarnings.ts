/// <amd-dependency path="jquery-weather" />

import $ = require("jquery");

export class AwWarnings implements ng.IDirective {

  //Expose a static func so that it can be used to register directive.
  static factory(): ng.IDirectiveFactory {
    var directive: ng.IDirectiveFactory =
      ($interval: ng.IIntervalService) => new AwWarnings($interval);
    directive.$inject = ["$interval"];
    return directive;
  }

  intervalTime: number = 1000 * 60 * 10;
  restrict: string = 'A';
  scope: any = {};
  replace: boolean = true;
  template: string = `<div class="dwdwarnings"></div>`;

  interval: ng.IIntervalService;
  constructor(private $interval: ng.IIntervalService) {
    this.interval = $interval;
  }

  link: ng.IDirectiveLinkFn = (scope, elem: any, attrs) => {
    var updateWarnings = () => {
      $.getJSON("/api/dwd", (data) => {
        var items = [];
        console.log("Warnings", data);
        if (data.length > 0) {
          var val = data[0];

          var status = this.getStatusText(val.Level);

          var start = new Date(val.Start).format("d.m, H:i");
          var end = new Date(val.End).format("d.m, H:i");

          var image = "G5_Flower.png";
          switch (val.Type) {
            case 0:
              image = "warn_icons_gewitter.png";
              break;
            case 1:
              image = "warn_icons_sturm.png";
              break;
            case 2:
              image = "warn_icons_regen.png";
              break;
            case 3:
              image = "warn_icons_schnee.png";
              break;
            case 4:
              image = "warn_icons_nebel.png";
              break;
            case 5:
              image = "warn_icons_frost.png";
              break;
            case 6:
              image = "warn_icons_glatteis.png";
              break;
            case 7:
              image = "warn_icons_tauwetter.png";
              break;
            case 8:
              image = "warn_icons_hitze.png";
              break;
            case 9:
              image = "warn_icons_uv.png";
              break;
          }

          items.push(`<div class="warnLevel${val.Level} warning">
            <div class="warnIconBox">
              <img class="warnIcon" src="/images/warnings/${image}" />
              <img class="warnIconFrame" src="/images/warnings/level${val.Level}.png" />
            </div>
            <h1>${val.Headline}</h1>
            <p>Gültig von ${start} Uhr bis ${end} Uhr</p>
            </div>`);

          $(".hidden-warnings").css("display", "none");
          $(".show-warnings").css("display", "block");
        } else {
          $(".hidden-warnings").css("display", "block");
          $(".show-warnings").css("display", "none");
        }

        $(elem).html(items.join("\n"));
      });
    };

    updateWarnings();
    this.interval(updateWarnings, this.intervalTime);
  };

  private getStatusText(level: Number) {
    switch (level) {
      case 1:
      case 2:
        return "Wetterwarnung";
      case 3:
        return "Warnung vor markanten Unwetter";
      case 4:
        return "Unwetterwarnung";
      case 5:
        return "Warnung vor extremen Unwetter";
      default:
        return "Warnung";
    }
  }
}