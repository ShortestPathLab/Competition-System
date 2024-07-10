const config = require("../../config");
const db = require("../models");
const utils = require("../../utils")
const fetch = require('node-fetch');
const config_benchmark = require("../../config_benchmark");

const User = db.user;
const Account = db.account;
const Submission=db.submission;
const Record = db.record;
const Competition = db.competition;



var leader_boards = {};
var refresh_time = {};

var submissions_history = {};
var submissions_history_refresh_time = {};

var page_size = 20;


async function get_virtual_best(comp_id_for_query) {
    var virtual_best = await Record.find({competition:comp_id_for_query}, ["instance", "metric","submission","history"]);
   
    var best_scores = {}
    for (let record of virtual_best){
        best_scores[record.instance] = record.metric;

    }
 
    return [best_scores, virtual_best];

}

exports.get_virtual_best = get_virtual_best;



async function get_all_submissions(options, best_scores) {

    var all_submissions=[]
    //find submissions with is_best_sub_for field not length zero or not undefined
    var test= await Submission.find(options)
            .select("user score_details account date summary is_best_sub_for submission_status success")
            .populate("user","meta_data")
            .populate("account","base_name nickname")
            .exec();
    for(var i=0;i<test.length;i++){
        let final_score = 0;
        let num_best = 0;
        if(test[i].score_details!=undefined){

            for (let instance of Object.keys(test[i].score_details)){
                let score = test[i].score_details[instance];
                if ( best_scores[instance] == score.my_metric){
                    num_best +=1;
                }
                // console.log(score.my_metric, best_scores[instance],instance);
                if (best_scores[instance] === 0)
                    continue;
                final_score += score.my_metric /best_scores[instance];
            }
        }

        var dt=new Date(test[i].date)

        var sub_info = {
            name: test[i].account.base_name,
            display_name: test[i].account.nickname==undefined?test[i].account.base_name : test[i].account.nickname,
            team_name: test[i].user.meta_data ? test[i].user.meta_data.team_name : "N/A",
            score: final_score,
            summary: test[i].summary,
            score_details: test[i].score_details,
            submission_status: test[i].submission_status,
            is_best_sub_for: test[i].is_best_sub_for,
            date:test[i].date,
            success: test[i].success,
            sub_date: dt.toISOString().split('T')[0] // Convert to ISO 8601 format (yyyy-mm-dd)
        };
        // console.log("SCORE_DETAIL",sub_info.score_details["I-10"])
        all_submissions.push(Object.assign({},sub_info));
       
    }
    // console.log(all_submissions)
    // console.log(k);
    return all_submissions;

}

function get_final_score(submission, best_scores){
    let final_score = 0;
    let num_best = 0;

    for (let instance of Object.keys(submission.score_details)){
        let score = submission.score_details[instance];
        if ( best_scores[instance] == score.my_metric){
            num_best +=1;
        }
        // console.log(score.my_metric, best_scores[instance],instance);
        if (best_scores[instance] === 0)
            continue;
        final_score += score.my_metric /best_scores[instance];
    }
    //round to 3 decimal places
    final_score = Math.round(final_score * 1000) / 1000;
    return [final_score, num_best]
}

exports.get_final_score = get_final_score;


async function get_leader_board(comp_id = undefined) {
    console.log("Refresh leader_board");
    try{
        let comp_id_for_query = comp_id == utils.TEST_ROUND._id?undefined:comp_id;
        
        var [best_scores,virtual_best] = await get_virtual_best(comp_id_for_query);
        var list = {};
        list["virtual_best"] = best_scores;

        //find submissions with is_best_sub_for field not length zero or not undefined
        let options = { 
            competition:comp_id_for_query,
            // is_best_sub_for: { $ne: null },
            score_details: { $ne: null }
            // is_best_sub_for: { $not: { $size: 0 } } 
        }
        var all_submissions= await get_all_submissions(options, best_scores);
        
        var all = await Account.find({best_subs: { $ne: null }}, ["nickname", "base_name","best_subs","user"]).populate("user",["meta_data"]).exec();
        // console.log("all= ",all);


        // console.log("what is this?",config_benchmark.track_submissions);
        //get the catagory of tracking creteria/sub-tracks on leaderboard
        for (let k of Object.keys(config_benchmark.track_submissions)){
            let m = config_benchmark.track_submissions[k];
            if (list[m] == undefined){
                list[m] = [];
            }
        }
        
        

        for (var i = 0; i<all.length;i++){
            let best_subs = all[i].best_subs.get(comp_id);
            
            // console.log("best_subs=",best_subs, " comp_id:", comp_id);
            if (best_subs == undefined || best_subs.length == 0){
                continue;
            }
            for (let k of Object.keys(config_benchmark.track_submissions)){
                //skip line honours here, it will be collected in a different way
                if (k === config_benchmark.track_submissions.most_awarded)
                {
                    continue;
                }
                let m = config_benchmark.track_submissions[k];
                if (best_subs.get(m) ==undefined){
                    continue;
                }
                // console.log(best_subs.get(m));
                var best = await Submission.findById(best_subs.get(m), ["date","score_details","summary"]).exec();
                if (best.score_details == undefined){
                    continue;
                }
                let [final_score,num_best] = get_final_score(best, best_scores);


                var display_name = all[i].nickname==undefined?all[i].base_name : all[i].nickname;
                var sub_info = {name:display_name,sub_date:best.date};
                // console.log(m,final_score, num_best )
                if (m == config_benchmark.track_submissions.overall_best || m == config_benchmark.track_submissions.fast_mover){
                    sub_info["final_score"] = final_score;
                }
                if (m == config_benchmark.track_submissions.most_awarded)
                    sub_info["final_score"] = num_best;
                sub_info["overall_best_score"] = final_score;
                sub_info["line_honours_score"] = num_best;
                sub_info["valid_fast_mover"] = best.summary.fast_mover;
                sub_info["sub_id"] = best._id;
                var display_name = all[i].nickname==undefined?all[i].base_name : all[i].nickname;
                var submissionsByName = all_submissions.filter((submission) => {
                    // console.log("debugging",submission);
                    return (
                        submission.name == all[i].base_name
                        // && submission.is_best_sub_for.includes(m)

                        );});  
                // console.log("submission BY NAME",submissionsByName)
                submissionsByName.sort((a,b)=>new Date(a.sub_date) - new Date(b.sub_date));
                sub_info["submissions"]=submissionsByName;
                sub_info["score_details"] = best.score_details;

                let team_info={};
                if (all[i].user.meta_data != undefined){
                    team_info["team_name"] = all[i].user.meta_data.team_name;
                    team_info["affiliation"]= all[i].user.meta_data.affiliation;
                    team_info["country"] = all[i].user.meta_data.country;
                    team_info["number_members"] = all[i].user.meta_data.members.length;
                    team_info["description"] = all[i].user.meta_data.description;
                }
                sub_info["team_info"] = team_info;


                list[m].push(sub_info);

            }
           
        }
        
        //collect the line honours
        temp_vbest = {};
        history={};
        for (let vbest of virtual_best){
            history[vbest.instance]=[]
            var best = await Submission.findById(vbest.submission, ["date","score_details","summary","account"]).populate("user",["meta_data"]).populate("account",["base_name","nickname"]).exec();
            // for(let h of vbest.history){
            //     var h_submission=await Submission.findById(h, ["date","account"]).populate("user",["meta_data"]).populate("account",["base_name","nickname"]).exec();
              
            //     var display_name = h_submission.account.nickname==undefined? h_submission.account.base_name : h_submission.account.nickname;
            //     var hsubdata={"name":display_name, "date": h_submission.date}
            //     // console.log("h_submission",hsubdata)
            //     history[vbest.instance].push(hsubdata)
            // }
            
            if (temp_vbest[best.account.base_name] == undefined){
                temp_vbest[best.account.base_name] = {};
                let team_info={};
                if (best.user.meta_data != undefined){
                    team_info["team_name"] = best.user.meta_data.team_name;
                    team_info["affiliation"]= best.user.meta_data.affiliation;
                    team_info["country"] = best.user.meta_data.country;
                    team_info["number_members"] = best.user.meta_data.members.length;
                    team_info["description"] = best.user.meta_data.description;
                }
                temp_vbest[best.account.base_name]["team_info"] = team_info;
                temp_vbest[best.account.base_name]["score_details"] = {};
                temp_vbest[best.account.base_name]["name"] = best.account.nickname==undefined?best.account.base_name : best.account.nickname;
                temp_vbest[best.account.base_name]["sub_date"] = best.date;
            }
            if (new Date(best.date) > new Date(temp_vbest[best.account.base_name]["sub_date"])){
                temp_vbest[best.account.base_name]["sub_date"] = best.date;
            }

            temp_vbest[best.account.base_name]["score_details"][vbest.instance] = best.score_details[vbest.instance];
            temp_vbest[best.account.base_name]["score_details"][vbest.instance]["update_time"] = best.date;
            temp_vbest[best.account.base_name]["score_details"][vbest.instance]["sub_id"] = best._id;

        }
        list[config_benchmark.track_submissions.most_awarded] = [];
        // console.log("debug linehonors",temp_vbest);
        for(let k of Object.keys(temp_vbest)){
            let num_best = Object.keys(temp_vbest[k]["score_details"]).length;
            temp_vbest[k]["final_score"] = num_best;
            temp_vbest[k]["line_honours_score"] = num_best;
            list[config_benchmark.track_submissions.most_awarded].push(temp_vbest[k]);
        }

        // list[config_benchmark.track_submissions.overall_best]["history"]=history



        leader_boards[comp_id] = list;
        // console.log(list)
        // console.log("leader board=",leader_boards);
        refresh_time[comp_id] =  Date.now();
    }
    catch(e){
        console.log(e);
    }
}


exports.leader_board = async (req, res) => {
    let comp_id = req.query.comp_id;
    
    if (refresh_time[comp_id] == undefined || Date.now() - refresh_time[comp_id] > 30000){
        await get_leader_board(comp_id);
    }
    res.status(200).send({
        success: true,
        leader_board:leader_boards[comp_id],
        
    });
    
   
};

exports.all_submissions = async (req, res) => {
    let comp_id = req.query.comp_id;
    let page = req.query.page

    if (page == undefined){
        page = 0;
    }
    else{
        page = parseInt(page);
    }
    
    if (submissions_history_refresh_time[comp_id] == undefined || Date.now() - submissions_history_refresh_time[comp_id] > 30000){
        let comp_id_for_query = comp_id == utils.TEST_ROUND._id?undefined:comp_id;
        try{
            var [best_scores, virtual_best] = await get_virtual_best(comp_id_for_query);

            let options = { 
                competition:comp_id_for_query,
            }
            var all_subs= await get_all_submissions(options, best_scores);
            all_subs.sort((a,b)=>new Date(b.date) - new Date(a.date));
            submissions_history[comp_id] = all_subs;
        }
        catch(e){
            console.log(e);
            res.status(500).send({
                success:false,
                message:"Error when querying all submissions",
                all_submissions:[],
            });
            return;
        }

        submissions_history_refresh_time[comp_id] = Date.now();
    }

    // return submissions for the page
    res.status(200).send({
        success: true,
        all_submissions:submissions_history[comp_id].slice(page*page_size,page*page_size+page_size)
    });
    
   
};


exports.external_page =async (req, res) => {
    var url = `${config.external_resource}/${req.path.replace("/external_page/","")}`;
    console.log("Load landing page:", url);
    
    fetch(url).then(data=>data.body.pipe(res));
};

exports.external_page_resource = (req, res) => {
    
    var url = `${config.external_resource}/${req.path}`;
    console.log("Load landing page resource:", url);
    if(url.includes(".css")){
             res.setHeader('content-type', 'text/css');
    }
    fetch(url).then(data=>data.body.pipe(res));
};

exports.get_meta_data = async (req, res) => {
    //collect all competitions
    var competitions = await Competition.find({}).exec();
    competitions.push({_id:utils.TEST_ROUND._id,name:"Test Round", track:"test",start_time:"2023-08-16T07:15:00.000Z",end_time:"2023-08-24T00:00:00.000Z",active:false}); 
    var meta_data = {
        success: true,
        competitions: competitions,
    };
    res.status(200).send({
        success: true,
        meta_data: meta_data,
    });
};
