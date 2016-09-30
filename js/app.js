var app = angular.module("gycpac", ['ngRoute']);
// define controller to use for routes
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/catalog', {
        templateUrl: 'views/catalog.html',
        controller: 'Catalog'
      }).
      when('/admin', {
        templateUrl: 'views/admin.html',
        controller: 'Admin'
      }).
      otherwise({
        redirectTo: '/catalog'
      });
  }]);
// load cfg
var config = (function n() {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "../config.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

// allows to use angular scope with socket IO
app.factory('socket', ['$rootScope', function ($rootScope) {
    var socket = io.connect('http://'+config.server.address+':'+config.server.port+'/');
    console.log("socket created");
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

app.factory('httpServices', ['$http',
  function ($http) {
    var httpService = {
      asyncGet: function (path, scope) {
        var promise = $http.get(path).then(
          function (successResponse) {
            // Success
            console.log(successResponse);
            return successResponse.data;
          },
          function (errorResponse) {
            // Error
            console.log(errorResponse);
            displayError(scope, errorResponse);
            return errorResponse.data;
          });
        return promise;
      },
      asyncPut: function (path, data, scope) {
        var promise = $http.put(path, data)
          .then(
            function (response) {
              // Success
              return response;
            },
            function (errorResponse) {
              // Error
              displayError(scope, errorResponse);
              return null;
            });
        return promise;
      },
      asyncPost: function (path, data, scope) {
        var promise = $http.post(path, data)
          .then(
            function (response) {
              // Success
              return response;
            },
            function (errorResponse) {
              // Error
              displayError(scope, errorResponse);
              return null;
            });
        return promise;
      },
      asyncDelete: function (path, data, scope) {
        var config = {
          'method': 'DELETE',
          'url': path,
          'data': data
        };
        var promise = $http(config)
          .then(
            function (response) {
              return response;
            },
            function (errorResponse) {
              // Error
              displayError(scope, errorResponse);
              return null;
            });
        return promise;
      }
    };
    return httpService;
  }
]);
