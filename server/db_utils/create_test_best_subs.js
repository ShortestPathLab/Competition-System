const DB_tools = require("../evaluation/computation/db_tools");


var db = new DB_tools();

db.get_all_accounts_lean(["best_subs"]).then((all)=>{
    for (let account of all){
        console.log(account);
        let best_subs = account.best_subs;
        if (best_subs == undefined){
            best_subs = new Map();
        }
        console.log(best_subs);
        let test = best_subs["test_round"]
        if (test == undefined){
            let test_subs = {...best_subs};
            best_subs = {};
            best_subs["test_round"] = test_subs;
            db.update_account_by_id(account._id,{best_subs:best_subs});
            console.log("update to : ", best_subs);
        }
        else{
            console.log("already have test_round");
        }
        
        
    }
});