const DB_tools = require("../evaluation/computation/db_tools");


var db = new DB_tools();

db.get_all_users_lean(["meta_data"]).then((all)=>{

    for (let user of all){
        if (user.meta_data && user.meta_data.members){
            for (let i of user.meta_data.members)
            console.log(i.email);
        }

    }
    process.exit(0);
});