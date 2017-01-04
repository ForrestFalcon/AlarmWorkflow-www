declare var require: any;

function getBool(val) {
    return !!JSON.parse(String(val).toLowerCase());
}

interface String {
    isEmpty(): boolean;
}

interface Date {
  format(String): any;
}

require.config({
    baseUrl: '/assets/app/alarm',
    paths: {
        'jquery': '/modules/jquery/dist/jquery.min',
        'angular': '/modules/angular/angular',
        'angular-route': '/modules/angular-route/angular-route',
        'async': '/assets/scripts/require/async',
        'font': '/assets/scripts/require/font',
        'goog': '/assets/scripts/require/goog',
        'image': '/assets/scripts/require/image',
        'json': '/assets/scripts/require/json',
        'jquery-time' : '/assets/scripts/jquery.time',
        'jquery-weather': '/assets/scripts/jquery.simpleWeather',
        'jquery-stopwatch': '/assets/scripts/jquery.stopwatch',
        'leaflet':'/modules/leaflet/dist/leaflet-src'
    },
    shim: {
      leaflet: {
    exports: 'L'
},
        'jquery': { exports: 'jquery'},
        'jquery-time': { deps: ['jquery']},
        'jquery-weather': { deps: ['jquery']},
        'jquery-stopwatch': { deps: ['jquery']},
        'angular': { exports: 'angular', deps: ['jquery']},
        'angular-route': { exports: 'angular-route', deps: ['angular', 'jquery'] }
    },
});

require(['angular', 'AlarmApp']);

// TypeScript declarations useful for importing angular modules
declare module 'angular' {
    export var angular: ng.IAngularStatic;
}
declare module 'angular-route' {

}
