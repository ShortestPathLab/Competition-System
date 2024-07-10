const DB_tools = require("../evaluation/computation/db_tools");


var db = new DB_tools();

// get account with length of submissions, which is an array, larger than 0
db.Account.find({},["user"]).populate("user","meta_data").then((accounts)=>{
    console.log("Total Teams: ",accounts.length);
    let members = 0;
    for(var i=0;i<accounts.length;i++){
        if(accounts[i].user.meta_data){
            if (accounts[i].user.meta_data.members){
                members += accounts[i].user.meta_data.members.length;
            } 
            else{
                members += 1;
            }  
        }
        else{
            members += 1;
        }
    }
    console.log("Total Members: ",members);
}
)

db.Account.find({submissions:{$exists:true,$not:{$size:0}}},["submissions","user"]).populate("user","meta_data").then((accounts)=>{
    console.log("Total Teams with Submissions: ",accounts.length);
    let members = 0;
    for(var i=0;i<accounts.length;i++){
        if(accounts[i].user.meta_data){
            if (accounts[i].user.meta_data.members){
                members += accounts[i].user.meta_data.members.length;
            }   
        }
    }
    console.log("Total Members with Submissions: ",members);
    }
)

//print out the total number of submissions, fetch submissions with only submission id
db.Submission.find({},["account"]).then((subs)=>{
    console.log("Total Submissions: ",subs.length);
    }
)

