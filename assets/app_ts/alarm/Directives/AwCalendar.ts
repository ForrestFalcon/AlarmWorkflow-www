import $ = require("jquery");

export class AwCalendar implements ng.IDirective {
    //Expose a static func so that it can be used to register directive.
    static factory(): ng.IDirectiveFactory {
        var directive: ng.IDirectiveFactory =
        ($interval: ng.IIntervalService) => new AwCalendar($interval);
        directive.$inject = ["$interval"];
        return directive;
    }


    intervalTime: number = 1000 * 60 * 60; //Update cal every 60 mins
    restrict: string = 'AE';
    scope: any = {};
    replace: boolean = true;
    template: string = `<table class="table table-striped cal-content"></table>`;

    interval: ng.IIntervalService;
    constructor(private $interval: ng.IIntervalService) {
        this.interval = $interval;
    }

    link: ng.IDirectiveLinkFn = (scope, elem: any, attrs) => {
        var summaryLength:number = 36;

        var updateCalendar = () => {
            //Next Events
            $.getJSON("/api/calendar", function(data) {
                var items = [];
                var i = 0;
                
                $.each(data, function(key, val) {
                    var date = new Date(val["Start"]);
                    var summary: string = val["Summary"];
                    if (summary.length > summaryLength)
                        summary = summary.substring(0, summaryLength) + "...";

                    items.push('<tr><td><span style="display:inline-block; width: 160px;">' 
                        + date.format('d M.') + "</span>" 
                        + date.format('H:i') + "</td><td>" 
                        + summary + "</td></tr>");
                });

                $(elem).html(`<tbody class="tile-cal-list">${items.join("")}</tbody>`);
            });

        };
        
        updateCalendar();
        this.interval(updateCalendar, this.intervalTime);
    }

}