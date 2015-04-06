'use strict';

/* Controllers */
app.controller('MapController', ['$scope', '$element', '$attrs', '$http', '$filter', function($scope, $element, $attrs, $http, $filter){
    $scope.options = {
        center: new google.maps.LatLng(35.1812076,-111.607959),
        zoom: 12
    };
    $scope.markers = [];
    var sizeX = 20,
        sizeY = 20;
    var markerIcon = {
        url: 'img/stop.svg',
        size: new google.maps.Size(sizeX, sizeY),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(sizeX/2, sizeY/2)
    }

    $scope.initialize = function(){
        $scope.map = new google.maps.Map($($element).find('div.map-canvas')[0],
            $.extend($scope.options, $attrs));
    }

    $scope.initialize();
    $http.get('data/stops.json').success(function(stops){
        angular.forEach(stops, function(stop, i){
            var mark = new google.maps.Marker({
                position: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
                title: stop.stop_name,
                icon: markerIcon
            });
            $scope.markers.push(mark);
        })
    });
    $http.get('data/routes.json').success(function(routes){
        $scope.routes = routes;
    });
    $http.get('data/trips.json').success(function(trips){
        $scope.trips = trips;
    });
    $http.get('data/shapes.json').success(function(shapes){
        $scope.shapes = shapes;
    });

    function drawShapes(shapes){
        var points = [];
        angular.forEach(shapes, function(shape){
            points.push(new google.maps.LatLng(shape.shape_pt_lat, shape.shape_pt_lon));
        });
        var flightPath = new google.maps.Polyline({
            path: points,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        flightPath.setMap($scope.map);
    }

    $scope.routeSelectionChanged = function(){
        var trips = $filter('filter')($scope.trips, {route_id: $scope.currentRouteId}, true);
        var shapes = [];
        angular.forEach(trips, function(trip, i){
            var ts = $filter('filter')($scope.shapes, {shape_id: trip.shape_id}, true);
            shapes = shapes.concat(ts);
        });
        drawShapes(shapes);
    }

}])