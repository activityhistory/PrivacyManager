/**
 * Created by Maxime on 19/08/2015.
 */



$( document ).ready(function(){
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