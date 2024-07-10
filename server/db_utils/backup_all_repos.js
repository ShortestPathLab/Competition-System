const DB_tools = require("../evaluation/computation/db_tools");
const { exec,spawn } = require('child_process');



var db = new DB_tools();
db.Account.find({submissions:{$exists:true,$not:{$size:0}}},["repo_ssh","user"]).populate("user","meta_data").then((accounts)=>{
    console.log("Total Teams with Submissions: ",accounts.length);
    for(var i=0;i<accounts.length;i++){
        let repo_ssh_link = accounts[i].repo_ssh;
        let team_name = accounts[i].user.meta_data.team_name;
        //clone code to local
        if(repo_ssh_link){
            console.log("git clone "+repo_ssh_link);
            // issue command to clone repo to folder ./archive
            const git_clone = spawn('git', ['clone',repo_ssh_link,"./archive/"+team_name]);
            git_clone.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            git_clone.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            git_clone.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        }
    }
    }
)