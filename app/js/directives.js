'use strict';

/* Directives */
app.directive('map', function(){
    return {
        restrict: 'E',
        templateUrl: 'partials/map.html',
        controller: 'MapController',
        controllerAs: 'mapCtrl'
    }
})