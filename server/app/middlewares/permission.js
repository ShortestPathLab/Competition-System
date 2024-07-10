const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Account = db.account;

/**
 * Check if user has account base_name
 */
getUserAndAccount = (req, res, next) => {
    var base_name = req.query.base_name;

    if (base_name == undefined){
        base_name = req.body.base_name;
    }

    if (base_name == undefined){
        return res.status(404).send({ success:false, message: "No Base_name"});
        
    }

    User.findById(req.userId).populate("roles").populate({
        path: 'accounts',
        match: { base_name:  base_name}}).exec().then((user) => {

        if (user == undefined || user.accounts == null || user.accounts.length!== 1){
            return res.status(404).send({ success:false, message: "Not Found"});
        }

        req.account = user.accounts[0];
        req.roles = []
        for(let r of user.roles){
            req.roles.push(r.name);
        }
        req.user = user;
        next()
        return;
    
    }).catch((err)=>{
        res.status(500).send({ message: err });
        return;
    });
};

/**
 * Check if user has account base_name
 */
getUser = (req, res, next) => {


    User.findById(req.userId).populate("roles").exec().then((user) => {

        if (user == undefined){
            return res.status(404).send({ success:false, message: "Not Found"});
        }

        req.roles = []
        for(let r of user.roles){
            req.roles.push(r.name);
        }
        req.user = user;
        next()
        return;
    
    }).catch((err)=>{
        res.status(500).send({ message: err });
        return;
    });
};


const permission = {
    getUserAndAccount, getUser
};
module.exports = permission;