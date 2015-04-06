'use strict';

/* Controllers */
app.controller('MapController', ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
    $scope.options = {
        center: new google.maps.LatLng(40.74, -74.18),
        zoom: 8
    };
    $scope.initialize = function(){
        $scope.map = new google.maps.Map($($element).find('div.map-canvas')[0],
            $.extend($scope.options, $attrs));
    }
    $scope.initialize();
}])