const DB_tools = require("../evaluation/computation/db_tools");


var db = new DB_tools();

console.log("Warning! This will delete all users and accounts.");


const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Type YES to confirm:', name => {
    if (name == "YES"){
        db.reset_user_account().then((out)=>{
            console.log("Deleted");
        });
    }
    readline.close();
    process.exit(0)
});





