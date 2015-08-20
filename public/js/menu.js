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
    });



   $("#remove").click(function(){
       //Get the ranges to delete
       var r = (willBeDeletedData.concat(willBeDeletedByTime)).concat(willBeDeletedLocations);
       console.log("envoi :");
       console.log(r);
       $.get('/clean', {ranges:r}, function(data){
           document.location.href="http://localhost:2323/";
       })
   })
});