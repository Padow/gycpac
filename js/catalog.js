/**
* Catalog Controller
*
*/
app.controller("Catalog",function($scope, socket) {
// stuff
  $scope.listDatabases = function(){
    socket.emit("listDatabases", {}, function (err, res){
       console.log(res);
       console.log(err);
    });
  }

  var datacsv = false;
    $scope.file_changed = function(element) {
        datacsv = true;
        var csv = element.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          $scope.$apply(function() {
            $scope.prev_orchestrator = e.target.result;
            var data = e.target.result;
            socket.emit('uploadcsv', {data: data});
          });
        };
        reader.readAsDataURL(csv);
     };
});
