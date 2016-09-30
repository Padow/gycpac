// load cfg and add socketio script link to index.html
$(window).ready(function(){
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
    $('#socketio').append('<script src="http://'+config.server.address+':'+config.server.port+'/socket.io/socket.io.js"></script>');
});
