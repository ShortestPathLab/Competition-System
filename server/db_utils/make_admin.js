const DB_tools = require("../evaluation/computation/db_tools");


var db = new DB_tools();

db.make_admin(process.argv[2]).then((success)=>{
    if (success)
        console.log("done");
    else
        console.log("failed");
});
