/**
 * Created by Maxime on 13/08/2015.
 */


module.exports = {

    test : function(xdb){
        xdb.set("mmfdgdfm", "nnn");
        window.console.log(xdb.get("mmm"));

    },


    madeAllActivity: function(xdb, db){

        var res = [];
        db.all("SELECT * FROM snapshot ; ", function (err, rows) {
            var encours = {start:"undefined", stop:"undefined", apps:"undefined"};
            var theVeryLastTime = NaN;
            for(var i = 0 ; i != rows.length; i++){
                var row = rows[i];
                if(encours.start == "undefined")
                {
                    encours.start = row.created_at;
                    encours.apps = row.state;
                    theVeryLastTime = row.created_at;
                    continue;
                }
                if(encours.apps != row.state || new Date(row.created_at) - new Date(theVeryLastTime) > 120000 )
                {
                    res.push({start:encours.start, stop:theVeryLastTime, apps:encours.apps});
                    encours.start = row.created_at;
                    encours.apps = row.state;

                    theVeryLastTime = row.created_at;
                    continue;
                }
                if(i == (rows.length -1))
                {
                    res.push({start:encours.start, stop:theVeryLastTime, apps:encours.apps});
                }
                theVeryLastTime = row.created_at;
            }
            xdb.set("backgroundActivity", res);
        });

    }


};