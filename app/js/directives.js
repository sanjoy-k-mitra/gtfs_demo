'use strict';

/* Directives */
app.directive('map', function(){
    return {
        restrict: 'E',
        template: '<div class="map-canvas"></div>',
        controller: 'MapController',
        controllerAs: 'mapCtrl'
    }
})