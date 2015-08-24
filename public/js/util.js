/**
 * Created by Maxime on 24/08/2015.
 */


function putGroupOnTheTop(groupClass)
{
    var group = $("."+groupClass);


    group.each(function(id, one){
        var groupe = $(one)[0];
       groupe.parentNode.appendChild(groupe);
    });
}