const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Account = db.account;
const Submission = db.submission;
const Queue = db.queue;
const Jobs = db.jobs;
const Competition = db.competition;
const utils = require("../../utils");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 * 
 * Evaluate only current user's account
 */
exports.submit = async (req, res) => {
    var userid = req.userId;
    var base_name = req.query.base_name;
    let comp_id = req.query.comp_id;
    if (base_name == undefined){
        return res.status(404).send({ success:false, message: "No Base_name"});
        
    }
    try{
        user = await User.findById(req.userId).populate("accounts").exec();

        var account = undefined;

        for (var i in user.accounts){
            if (user.accounts[i].base_name == base_name){
                account = user.accounts[i];
            }
        }

        if(account == undefined){
            return res.status(404).send({ success:false,message: "Base name not found" });
        }

        if(account.status != utils.STATE.idle){
            return res.status(500).send({ success:false,message: "Evaluator busy" });
        }
        let branch = account.evaluate_branch;
        let sub_date = Date.now();

        let competitions = await Competition.find({}).exec();
        let competition;

        for (let comp of competitions){
            if (comp.active){
                competition = comp;
            }
        }

        // if (comp_id != utils.TEST_ROUND._id){
            // competition = await Competition.findById(comp_id);
        

        let now = new Date();
        if (competition != undefined){
            if (now < new Date(competition.start_time)){
                return res.status(500).send({ success:false,message: "Competition not yet started" });
            }
            if (now > new Date(competition.end_time)){
                return res.status(500).send({ success:false,message: "Competition already ended" });
            }
        }
        // }
        // else{
        //     return res.status(500).send({ success:false,message: "Test round closed." });
        // }


        
        
        var new_sub = new Submission({
            account: account._id,
            user: userid,
            submission_status: utils.SUB_STATE.queueing, //"running","quening","done"
            date:sub_date,
            message:"",
            total_instances:0,
            precomputed_instances: 0,
            failed_precomputing_instances: 0,
            evaluated_instances:0,
            failed_evaluation_instances: 0,
            debuged_instances:0,
            failed_debug_instances:0,
            multi_cpu_precomputing: account.multi_cpu_precomputing == undefined? false: account.multi_cpu_precomputing,
            evaluated_branch: branch,
            competition: competition            
        })

        var new_que = new Queue({
            submission: new_sub._id,
            date:sub_date,
            user: userid,
            account: account._id,
            multi_cpu: account.multi_cpu_precomputing == undefined? false: account.multi_cpu_precomputing

        })


        await new_sub.save();
        await new_que.save();
        await append_submission(account._id,new_sub._id);
        res.send({ success:true, message: "Successfully add new submission" });

    }
    catch(err) {
        console.log(err)
        res.status(500).send({success:false, message: err });
    }
    
    
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 * 
 * Evaluate any account.
 */
exports.evaluate = async (req, res) => {
    var username = req.query.username;
    var base_name = req.query.account_name;

    if (base_name == undefined){
        return res.status(404).send({ success:false, message: "No Base_name"});
    }

    var user = await User.findOne({username:username}).populate("accounts").exec();


    try{
        if(user == undefined){
            return res.status(404).send({ success:false,message: "User not found" });
        }
        var userid = user._id;
        var account = undefined;

        for (var i in user.accounts){
            if (user.accounts[i].base_name == base_name){
                account = user.accounts[i];
            }
        }

        if(account == undefined){
            return res.status(404).send({ success:false,message: "Base name not found" });
        }

        if(account.status != utils.STATE.idle){
            return res.status(500).send({ success:false,message: "Evaluator busy" });
        }
        var sub_date = Date.now();
        
        var new_sub = new Submission({
            account: account._id,
            user: userid,
            submission_status: utils.SUB_STATE.queueing, //"running","quening","done"
            date:sub_date,
            message:"",
            total_instances:0,
            precomputed_instances: 0,
            failed_precomputing_instances: 0,
            evaluated_instances:0,
            failed_evaluation_instances: 0,
            debuged_instances:0,
            failed_debug_instances:0,
            multi_cpu_precomputing: account.multi_cpu_precomputing == undefined? false: account.multi_cpu_precomputing,
            evaluated_branch:account.evaluate_branch
            
        })

        var new_que = new Queue({
            submission: new_sub._id,
            date:sub_date,
            user: userid,
            account: account._id,
            multi_cpu: account.multi_cpu_precomputing == undefined? false: account.multi_cpu_precomputing

        })


        await new_sub.save();
        await new_que.save();
        await append_submission(account._id,new_sub._id);
        res.send({ success:true, message: "Successfully add new submission" });

    }
    catch(err) {
        console.log(err)
        res.status(500).send({success:false, message: err });
    }
    
    
};

exports.reset_evaluator = async (req, res) => {
    var username = req.query.username;
    var base_name = req.query.account_name;

    if (base_name == undefined){
        return res.status(404).send({ success:false, message: "No Base_name"});
    }

    var user = await User.findOne({username:username}).populate("accounts").exec();


    try{
        if(user == undefined){
            return res.status(404).send({ success:false,message: "User not found" });
        }
        var userid = user._id;
        var account = undefined;

        for (var i in user.accounts){
            if (user.accounts[i].base_name == base_name){
                account = user.accounts[i];
            }
        }

        if(account == undefined){
            return res.status(404).send({ success:false,message: "Base name not found" });
        }
        Account.updateOne(
            {_id: account},
            {status: utils.STATE.idle}
        ).exec();

        Jobs.deleteMany({account: account});


        res.send({ success:true, message: "Successfully reset evaluator" });

    }
    catch(err) {
        console.log(err)
        res.status(500).send({success:false, message: err });
    }
};

async function append_submission(account_id,sub_id){
    await Account.updateOne({_id: account_id},
        {
            $set:{current_submission:sub_id,status:utils.STATE.quening},
            $push:{submissions:sub_id}
        }
    ).exec();

}

