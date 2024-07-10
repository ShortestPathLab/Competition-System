const DB_tools = require("../evaluation/computation/db_tools");

const general_controller = require("../app/controllers/general.controller");
const fs = require("fs");
const { exec } = require('child_process');


var log = console.log;
var db = new DB_tools();

var comp_id = process.argv[2];
if (comp_id === "none"){
    comp_id = undefined;
}
var tracks = ["Overall Best","Fast Mover"]

const s3_storage = require("../evaluation/storage/storage");

const target_folder = "./best_solutions/test_round/";

//create target_folder
if (!fs.existsSync(target_folder)){
    fs.mkdirSync(target_folder);
}


const instance_configs = {
    "I-10":[5000, 10000, "Warehouse"],
    "I-06":[5000, 10000, "Sortation"],
    "I-01":[1500, 1500, "Paris"],
    "I-02":[3500, 3000, "Paris"],
    "I-09":[5000, 6500, "Game"],
    "I-04":[500, 100, "Random"],
    "I-03":[500, 200, "Random"],
    "I-05":[1000, 400, "Random"],
    "I-07":[1000, 600, "Random"],
    "I-08":[2000, 800, "Random"],
    "Paris":[5000, 250, "Paris"],
    "brc202d":[5000, 500, "Game"],
    "random":[5000, 100, "Random"],
    "sortation_large":[5000, 2000, "Sortation"],
    "warehouse_large":[5000, 5000, "Warehouse"]
}


db.Record.find({competition:comp_id})
.populate({path:"submission",populate:{ path:"account"}})
.populate({path:"submission",populate:{ path:"user"}})
.populate({path:"submission",populate:{ path:"score_details"}})
.then(
    // let [best_scores, virtual_best] = await general_controller.get_virtual_best(comp_id);

    async (records) => {

        // let header = "Instance, Team, Submission ID, Commit, Total Errands Finished";
        // print header in markdown table
        console.log("| Instance | Total Errands Finished | Domain | # Agents | Simulation Time  | Solution | Team | Implementation | Submission ID |");
        console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
        records.sort((a,b) => {
            if (a.instance < b.instance){
                return -1;
            }
            return 1;
        });
            

        for (let record of records){
            let account = record.submission.account;
            let user = record.submission.user;
            let submission = record.submission;
            let meta_data = user.meta_data;
            let team_name = "";
            let team_members = "";
            let affiliation = "";
            let country = "";
            let liscense = "";
            let algorithm_description = "";
            let organisation_name = "";
            let project_name = "";
            // let [final_score, num_best] = await general_controller.get_final_score(submission, best_scores);

            let user_name = user.username;
            let submission_id = record.submission._id.toString();
            // let path = "log_storage/"+account.base_name+"/"+submission_id+"/"+record.instance+".json";
            let solution_file = "MR23-"+record.instance+".json";
            // s3_storage.downloadFile("mapf-participants-data",path,target_folder+"/"+solution_file);
            let path = "/home/ubuntu/shared/data/data/"+user._id+"/"+submission_id+"/"+record.instance+".json";
            //execuate a cli command
            // exec('scp ubuntu@mapf_host:'+path+' '+target_folder+"/"+solution_file, (err, stdout, stderr) => {
            //     if (err) {
            //         console.error(err);
            //         return;
            //     }
            //     console.log(stdout);
            // });


            let commit_info = submission.repo_head.replaceAll("\n"," ; ").split(";")[0].split("commit ")[1].trim();

            // create a markdown table with the following columns:
            // Instance, Team, Submission ID, Commit, Total Errands Finished
            // For Commit, include a link to the commit on the github repo
            // The github repo link is in this format: https://github.com/MAPF-Competition/Code_Archive/tree/master/2023%20Main%20Round/Team_[team name]/[commit hash]

            if (meta_data) {
                for (let member of meta_data.members){
                    team_members += member.name + " - " + member.email + "; ";
                }
                team_name = meta_data.team_name;
                affiliation = meta_data.affiliation;
                country = meta_data.country;
                liscense = meta_data.license;
                algorithm_description = meta_data.description;
                organisation_name = meta_data.organisation_name;
                project_name = meta_data.project_name;

            }

            // let line = record.instance + "," + "Team_"+team_name + "," + submission_id + "," + commit_info + "," + final_score;
            let line = "| TR23-" + record.instance + " | " + 
                record.metric + " | " + instance_configs[record.instance][2] + " | " + instance_configs[record.instance][1] + " | " + instance_configs[record.instance][0] + " | " + 
                "[" + solution_file+".zip]("+ "./Test Round Evaluation Instances/best_solutions/"+ solution_file + ".zip" + ") | " + 
                "Team_"+team_name +  
                " | [" + commit_info + "](https://github.com/MAPF-Competition/Code_Archive/tree/master/2023%20Competition/Team_" + team_name + "/" + commit_info + ") " +
                " | " + submission_id + " |";
            console.log(line);
        }
    }
)





