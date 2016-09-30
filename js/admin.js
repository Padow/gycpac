/**
* Admin Controller
*
*/
app.controller("Admin",function($scope, socket) {
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

   $scope.import = function(){
     socket.emit("import",{"dbname": ["games", "categories"]} , function (err, res){
       if(res)
        document.location.href="./#/catalog";
     });
   }
});
