'use strict';

/* Controllers */
app.controller('MapController', ['$scope', '$element', '$attrs', '$http', '$filter', function($scope, $element, $attrs, $http, $filter){
    $scope.options = {
        center: new google.maps.LatLng(35.1812076,-111.607959),
        zoom: 12
    };


    $scope.initialize = function(){
        $scope.map = new google.maps.Map($($element).find('div.map-canvas')[0],
            $.extend($scope.options, $attrs));
    }

    $scope.initialize();
    $http.get('data/stops.json').success(function(stops){
        $scope.stops = stops;
        $scope.currentStops = [];
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
    $http.get('data/stop_times.json').success(function(stopTimes){
        $scope.stopTimes = stopTimes;
    })

    function drawShapes(){
        if($scope.currentPath){
            $scope.currentPath.setMap(null);
        }
        if($scope.currentStops.length > 0){
            angular.forEach($scope.currentStops, function(marker){
                marker.setMap(null);
            })
            $scope.currentStops = [];
        }
        var shapes = $filter('filter')($scope.shapes, {shape_id: $scope.currentTrip.shape_id}, true);
        var points = [];
        angular.forEach(shapes, function(shape){
            points.push(new google.maps.LatLng(shape.shape_pt_lat, shape.shape_pt_lon));
        });
        $scope.currentPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: '#' + $scope.currentRoute.route_color,
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        $scope.currentPath.setMap($scope.map);


        $scope.stopIcon = {
            path: 'M10,0 C4.5,0 0,4.5 0,10 C0,15.5 4.5,20 10,20 C15.5,20 20,15.5 20,10 C20,4.5 15.5,0 10,0 L10,0 Z M10,18 C5.6,18 2,14.4 2,10 C2,5.6 5.6,2 10,2 C14.4,2 18,5.6 18,10 C18,14.4 14.4,18 10,18 L10,18 Z',
            fillColor: '#' + $scope.currentRoute.route_color,
            fillOpacity: 0.8,
            scale: 1,
            strokeColor: '#' + $scope.currentRoute.route_color,
            strokeWeight: 5,
            anchor: new google.maps.Point(10, 10)
        }
        var stopTimes = $filter('filter')($scope.stopTimes, {trip_id: $scope.currentTrip.trip_id}, true);
        angular.forEach(stopTimes, function(stopTime){
            var stop = $filter('filter')($scope.stops, {stop_id: stopTime.stop_id}, true)[0];
            var mark = new google.maps.Marker({
                position: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
                title: stopTime.arrival_time,
                map: $scope.map,
                icon: $scope.stopIcon
            });
            $scope.currentStops.push(mark);

        })
    }

    $scope.routeSelectionChanged = function(){
        $scope.currentRoute = $filter('filter')($scope.routes, {route_id: $scope.currentRouteId}, true)[0];
    }
    $scope.tripSelectionChanged = function(){
        $scope.currentTrip = $filter('filter')($scope.trips, {trip_id: $scope.currentTripId}, true)[0];
        drawShapes();
    }

}])