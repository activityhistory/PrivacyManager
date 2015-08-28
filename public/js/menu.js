/**
 * Created by Maxime on 19/08/2015.
 */



$( document ).ready(function(){
    //check the folder path location, if not, go to params
    $.get("/getSelfspyFolderLocation", function(data){
        if(data.status == "ko")
        {
            alert("No .selfspy folder found, please fill it.");
            $('#settingsModal').openModal();
        }
        else
        {
            $("#filePath").val(data.value);
        }
    });



   $("#remove").click(function(){
       Materialize.toast(_t.confirmDeleteFiltered + '<a class="btn-flat red-text" href="#!" onclick="javascript:deleteIndicated()">YES<a>', 10000);

   });

    $('#help').click(function () {
        if ($('.help').is(":visible")) {
            $('.help').hide();

        }
        else {
            $('.help').show();
        }
    });


    $('.modal-trigger').leanModal();


    $('#removeRange').click(function(){
        Materialize.toast(_t.confirmDeleteRange + '<a class="btn-flat red-text" href="#!" onclick="javascript:deleteAllRange()">YES<a>', 10000);
    });


});

function deleteIndicated(){
    //Get the ranges to delete
    var r = (willBeDeletedData.concat(willBeDeletedByTime).concat(willBeDeletedLocations));
    $.get('/clean', {ranges:r}, function(data){
        document.location.href="http://localhost:2323/";
    })
}


function deleteAllRange(){
    if(typeof interVal.start !== 'undefined' && typeof interVal.stop !== 'undefined' ){
        var r = [];
        var range = {start : interVal.start, stop: interVal.stop};
        r.push(range);
        $.get('/clean', {ranges:r, isRangeRemove: true}, function(data){
            document.location.href="http://localhost:2323/";
        });
    }
    else{
        Materialize.toast(_t.pleaseRange, 4000);
    }
}