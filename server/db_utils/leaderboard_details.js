const DB_tools = require("../evaluation/computation/db_tools");

const general_controller = require("../app/controllers/general.controller");

var log = console.log;
console.log = function() {}
var db = new DB_tools();

var comp_id = process.argv[2];
if (comp_id == "None")
    comp_id = undefined;
var tracks = ["Overall Best","Fast Mover"]


async function get_details(account,best_sub,leaderboard){
    var submission_id = best_sub;
    var submission = await db.Submission.findById(submission_id);
    var meta_data = account.user.meta_data;
    let repo_ssh_link = account.repo_ssh;
    var team_name = "";
    var team_members = "";
    var affiliation = "";
    var country = "";
    var liscense = "";
    var algorithm_description = "";
    var organisation_name = "";
    var project_name = "";

    let [best_scores, virtual_best] = await general_controller.get_virtual_best(comp_id);
    let [final_score, num_best] = await general_controller.get_final_score(submission, best_scores);

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
    var commit_info = submission.repo_head.replaceAll("\n"," ; ");
    var algorithm_name = account.nickname;
    var account_name = account.base_name;
    return '"'+leaderboard +'","'+ account_name +'","'+
     team_name +'","'+ algorithm_name +'","'+ 
     submission._id +'","'+ commit_info +'","'+ 
     algorithm_description +'","'+ team_members +'","'+ 
     affiliation +'","'+ country +'","'+ liscense + '","'+ 
     organisation_name + '","' + project_name + '", "' + 
     repo_ssh_link + '","' + final_score + '","' + JSON.stringify(submission.score_details).replaceAll('"','\\"') + '"';
}

db.Account.find({best_subs: { $ne: null }}, ["nickname", "base_name","best_subs","user","repo_ssh"])
.populate("user",["meta_data"]).then(async (accounts) => {
    console.log = log;
    console.log("leaderboard,account_name,team_name,algorithm_name,submission_id,commit info,algorithm_description,team_members,affiliation,country,liscense,organisation_name,project_name,repo_ssh,score,score_details")
    
    let comp_name = comp_id === undefined? "test_round" : comp_id.toString();
    for (let account of accounts){
        var best_sub = account.best_subs.get(comp_name);
        // console.log(best_sub);
        if (best_sub) {
            let sub = best_sub.get(tracks[0])
            if (sub){
                let line = await get_details(account,sub,tracks[0]);
                console.log(line);
            }
        }
    }

    for (let account of accounts){
        var best_sub = account.best_subs.get(comp_name);
        if (best_sub) {
            let sub = best_sub.get(tracks[1])
            if (sub){
                let line = await get_details(account,sub,tracks[1]);
                console.log(line);
            }
        }
    }

    let [best_scores, virtual_best] = await general_controller.get_virtual_best(comp_id);


    db.Record.find({competition:comp_id})
    .populate({path:"submission",populate:{ path:"account"}})
    .populate({path:"submission",populate:{ path:"user"}})
    .populate({path:"submission",populate:{ path:"score_details"}})
    .then(
        async (records) => {

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
                let [final_score, num_best] = await general_controller.get_final_score(submission, best_scores);

    
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
                let commit_info = submission.repo_head.replaceAll("\n"," ; ");
                let algorithm_name = account.nickname;
                let account_name = account.base_name;
                let repo_ssh_link = account.repo_ssh;
                let leaderboard = "Line Honors " + record.instance;
                let line = '"'+leaderboard +'","'+ account_name +'","'+ team_name +'","'+ algorithm_name +'","'+ 
                submission._id +'","'+ commit_info +'","'+ algorithm_description +'","'+ team_members +'","'+ 
                affiliation +'","'+ country +'","'+ liscense + '","'+ organisation_name + '","' + project_name + '","' + 
                repo_ssh_link + '","' + final_score + '","' + JSON.stringify(record.submission.score_details).replaceAll('"','\\"') + '"';
                console.log(line);
            }
        }
    )
})




