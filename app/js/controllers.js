'use strict';

/* Controllers */
app.controller('MapController', ['$scope', '$element', '$attrs', '$http', '$filter', function($scope, $element, $attrs, $http, $filter){
    function MyOverlay(stop){
        this.stop = stop;
        this.div_ = null;
        this.setMap($scope.map);
    };
    MyOverlay.prototype = new google.maps.OverlayView();
    MyOverlay.prototype.updateStop = function(stop){
        this.stop = stop;
        $(this.div_).find("h4")[0].innerHTML = stop.stop_name;
        $(this.div_).find("span.lat")[0].innerHTML = stop.stop_lat;
        $(this.div_).find("span.lng")[0].innerHTML = stop.stop_lon;
    };
    MyOverlay.prototype.hide = function() {
        if (this.div_) {
            // The visibility property must be a string enclosed in quotes.
            this.div_.style.visibility = 'hidden';
        }
    };

    MyOverlay.prototype.show = function() {
        if (this.div_) {
            this.div_.style.visibility = 'visible';
        }
    };
    MyOverlay.prototype.onAdd = function(){
        var rs = document.createElement('span');
        rs.className = 'glyphicon glyphicon-remove';
        rs.style.float = "right";
        rs.onclick = this.remove;
        var div = document.createElement('div');
        div.style.borderRadius = '5px';
        div.style.padding = '5px';
        div.style.backgroundColor = "#FFFFFF"
        div.style.border = '1px solid black';
        div.style.position = 'absolute';
        div.style.boxShadow = '10px 10px 5px #888888';
        var h = document.createElement('h4');
        h.innerHTML = this.stop.stop_name
        var latd = document.createElement('div');
        latd.innerHTML = "Latitude : <span class='lat'>" + this.stop.stop_lat + "</span>";
        var lond = document.createElement('div');
        lond.innerHTML = "Longitude : <span class='lng'>" + this.stop.stop_lon + "</span>";
        div.appendChild(rs);
        div.appendChild(h);
        div.appendChild(latd);
        div.appendChild(lond);
        this.div_ = div;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    };
    MyOverlay.prototype.draw = function(){
        var overlayProjection = this.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel($scope.map.getBounds().getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel($scope.map.getBounds().getNorthEast());
        var div = this.div_;
        div.style.left = (sw.x + 25) + 'px';
        div.style.top = (ne.y + 25) + 'px';
        div.style.width = (ne.x - sw.x)/3 + 'px';
        div.style.height = (sw.y - ne.y)/8 + 'px';
    };
    MyOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    };
    $scope.options = {
        center: new google.maps.LatLng(35.1812076,-111.607959),
        zoom: 12,
        disableDefaultUI: true

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
            strokeOpacity: 0.4,
            strokeWeight: 10
        });
        $scope.currentPath.addListener('mouseover', function(){
            this.setOptions({strokeOpacity: 0.7});
        })
        $scope.currentPath.addListener('mouseout', function(){
            this.setOptions({strokeOpacity: 0.4});
        })
        $scope.currentPath.addListener('click', function(){
            this.setOptions({strokeOpacity: 1.0});
        })
        $scope.currentPath.setMap($scope.map);


        var stopTimes = $filter('filter')($scope.stopTimes, {trip_id: $scope.currentTrip.trip_id}, true);
        $scope.stopHash = [];
        angular.forEach(stopTimes, function(stopTime){
            var stop = $filter('filter')($scope.stops, {stop_id: stopTime.stop_id}, true)[0];
            var mark = new google.maps.Circle({
                fillColor: '#000000',
                strokeColor: '#' + $scope.currentRoute.route_color,
                strokeWeight: 5,
                strokeOpacity: 0.4,
                map:$scope.map,
                center: new google.maps.LatLng(stop.stop_lat, stop.stop_lon),
                radius: 100
            })
            $scope.stopHash.push({stop: stop, mark: mark});
            mark.addListener('mouseover', function(){
                this.setOptions({strokeOpacity: 0.7})
            })
            mark.addListener('mouseout', function(){
                if($scope.selectedMark != this){
                    this.setOptions({strokeOpacity: 0.4})
                }
            })
            mark.addListener('click', function(){

                if($scope.selectedMark){
                    $scope.selectedMark.setOptions({strokeOpacity: 0.4});
                }
                $scope.selectedMark = this;
                if(!$scope.infoOverlay){
                    $scope.infoOverlay = new MyOverlay(stop);
                    $scope.infoOverlay.addListener('click', function(){
                        this.hide();
                    })
                }else{
                    $scope.infoOverlay.updateStop(stop)
                }
                $scope.infoOverlay.show();
                this.setOptions({strokeOpacity: 1.0})
            })

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