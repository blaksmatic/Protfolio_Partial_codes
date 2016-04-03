var app = angular.module("mainApp" ,["ngRoute"]);

/**
 * This is the angular's config where angular turns you to the target website
 */
app.config(function ($routeProvider) {
    $routeProvider
        .when('/about', {
            templateUrl: './about.html',
            controller: 'aboutController'
        })
        .when('/assignment/:filters', {
            templateUrl: './partials/list.html',
            controller: 'mainController'
        })
        .when('/detail/:id', {
            templateUrl: './partials/detail.html',
            controller: 'detailController'
        })
        .otherwise({
            redirectTo: '/assignment/All'
        });
});

/**
 * This is the official factory function that enables
 * the $scope to be dicovered every where. Not written by me.
 * http://stackoverflow.com/questions/14389049/improve-this-angularjs-factory-to-use-with-socket-io
 */


app.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://localhost:3000');

    return {
        on: function (eventName, callback) {
            function wrapper() {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            }

            socket.on(eventName, wrapper);

            return function () {
                socket.removeListener(eventName, wrapper);
            };
        },

        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if(callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);

