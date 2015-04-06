/**
 * Created by sanjoy on 4/6/2015.
 */
angular.module('GtfsDemo', [])

    .controller('MapController', ['$scope','$http', function($scope, $http){
        var options = {
            center: {lat: -34.397, lng: 150.644},
            zoom: 9
        };
        console.log($scope);
    }])
    .controller('HeadController', function(){

    })
    .controller('BodyController', function(){

    })
    .directive('map', function(){
        return {
            restrict: 'E',
            templateUrl: 'assets/templates/map.html',
            controller: 'MapController',
            controllerAs: 'mapCtrl'
        }
    })