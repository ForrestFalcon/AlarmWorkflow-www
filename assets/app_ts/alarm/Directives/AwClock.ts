/// <amd-dependency path="jquery-time" />

export function AwClock(): ng.IDirective {
  return {
    restrict: 'AE',
    replace: true,
    template: `<div>
    <div id="time"></div>
    <div id="date"></div>
    </div>`,

    link: function(scope, elem : any, attrs) {
      elem.simpleClock();
    }
  };
}
