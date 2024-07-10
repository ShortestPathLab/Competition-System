const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Account = db.account;
const Submission = db.submission;
const Queue = db.queue;
const Jobs = db.jobs;
const Competition  = db.competition;
const utils = require("../../utils");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


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

        if(account.status != "idle"){
            return res.status(500).send({ success:false,message: "Evaluator busy" });
        }
        var sub_date = Date.now();
        
        var new_sub = new Submission({
            account: account._id,
            user: userid,
            submission_status: "quening", //"running","quening","done"
            date:sub_date,
            message:"",
            total_instances:0,
            precomputed_instances: 0,
            failed_precomputing_instances: 0,
            evaluated_instances:0,
            failed_evaluation_instances: 0,
            debuged_instances:0,
            failed_debug_instances:0,
            
        })

        var new_que = new Queue({
            submission: new_sub._id,
            date:sub_date,
            user: userid,
            account: account._id
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

exports.remove_best = async (req, res) => {
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
            {best_submission: null}
        ).exec();


        res.send({ success:true, message: "Successfully remove best submission" });

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

exports.new_competition = async (req, res) => {
    //create a new competition and add it to the database.
    let comp = {
    name: req.body.name,
    track :req.body.track,
    start_time : req.body.start_time,
    end_time : req.body.end_time,
    active : req.body.active,
    }
    try{
        var new_comp = new Competition(comp);
        await new_comp.save();
        res.send({ success:true, message: "Successfully add new competition" });
    }
    catch(err) {
        console.log(err)
        res.status(500).send({success:false, message: err });
    }


}

