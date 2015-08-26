/**
 * Created by Maxime on 24/08/2015.
 */


var util = {
    /**
     * Put a group (<g>) of elements at the end of the parent element.
     * Works with classes, with each element of the class.
     * @param groupClass : name of the class, without "."
     */
    putGroupOnTheTop : function (groupClass)
        {
            var group = $("."+groupClass);


            group.each(function(id, one){
                var groupe = $(one)[0];
                groupe.parentNode.appendChild(groupe);
            });
        }
};
