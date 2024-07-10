const config = require("../config/auth.config");
const db = require("../models");
const server_config = require("../../config")
const repo_manager = require("../repo/repo.manage")
const utils = require("../../utils");
const fs = require("fs");

const User = db.user;
const Role = db.role;
const Account = db.account;
const Competition = db.competition;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var license_templates = {}
for (let value of Object.keys(utils.LICENSE)){
  let template = fs.readFileSync("./license_templates/"+utils.LICENSE[value]).toString();
  license_templates[value] = template
}


github_sign_up = (user_profile)=>{
  var user = new User({
    username: user_profile.login,
    email: user_profile.email,
    github_id: user_profile.id,
    contact_email: user_profile.email,
    subscribe: true,
    password: null,
    user_token: null,
    accounts:[],
  });
  var base_name = `${server_config.gppc_repo_prefix}${user_profile.login}`
  var repo_link = `${server_config.repo_web_base}/${base_name}.git`
  var repo_ssh = `${server_config.repo_ssh_base}/${base_name}.git`

  // var account = new Account({
  //   user: user._id,
  //   status:"idle",
  //   quene: "-1",
  //   repo_link:repo_link,
  //   repo_ssh: repo_ssh,
  //   base_name: base_name,
  //   nickname: user_profile.login,
  //   repo_created: false,
  //   repo_accepted: false,
  //   evaluate_branch:"main"
  // })

  return new Promise(function (resolve, reject) {
    Role.findOne({ name: "user" }).then((role) => {
      user.roles = [role._id];
      // user.accounts.push(account._id);
      user.save()
      // .then(d => {
        // account.save().then(account => {
        //   resolve([true,base_name,user,account,""]);
        // }).catch( (err)=>{
        //   resolve([false,base_name,user,account, err]);
        // });
      // })
      .then(()=>{
        resolve([true,base_name,user,null,""]);
      })
      .catch((err)=>{
        resolve([false,base_name,user,account, err]);
      });
    }).catch((err)=>{
      resolve([false,base_name,user,account, err]);
    });
  });

}

// exports.signup = (req, res) => {
//   const user = new User({
//     username: req.body.username,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8)
//   });

  
//   var name_base = req.body.username.split("@")[0];
//   name_base = name_base.toLowerCase();
//   var repo_link = server_config.repo_ssh_base + name_base+".git"

//   const account = new Account({
//     user: user._id,
//     status:"idle",
//     quene: "-1",
//     repo_link:repo_link,
//     base_name: name_base
//   })

//   user.save((err, user) => {
//     if (err) {
//       res.status(500).send({ success:false,message: err });
//       return;
//     }

//     if (req.body.roles) {
//       Role.find(
//         {
//           name: { $in: req.body.roles }
//         },
//         (err, roles) => {
//           if (err) {
//             res.status(500).send({success:false, message: err });
//             return;
//           }

//           user.roles = roles.map(role => role._id);
//           user.save(err => {
//             if (err) {
//               res.status(500).send({success:false, message: err });
//               return;
//             }
//             account.save(()=>{
//               repo_manager.setupRepoAndInvite(name_base,req.body.username,account.track);// TODO: change username to gihub userbame
//             })

//             res.send({ success:true, message: "User was registered successfully!" });
//           });
//         }
//       );
//     } else {
//       Role.findOne({ name: "user" }, (err, role) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         user.roles = [role._id];
//         user.save(err => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }
//           account.save(()=>{
//             repo_manager.setupRepoAndInvite(name_base,req.body.username,account.track);// TODO: change username to gihub userbame
//           })
//           res.send({success:true, message: "User was registered successfully!" });
//         });
//       });
//     }
//   });
// };

// exports.signin = (req, res) => {
//   User.findOne({
//     username: req.body.username
//   })
//     .populate("roles", "-__v")
//     .exec((err, user) => {
//       if (err) {
//         res.status(500).send({success:false, message: err });
//         return;
//       }

//       if (!user) {
//         return res.status(404).send({success:false, message: "User Not found." });
//       }

//       var passwordIsValid = bcrypt.compareSync(
//         req.body.password,
//         user.password
//       );

//       if (!passwordIsValid) {
//         return res.status(401).send({
//           accessToken: null,
//           success:false,
//           message: "Invalid Password!"
//         });
//       }

//       var token = jwt.sign({ id: user.id }, config.secret, {
//         expiresIn: 86400 // 24 hours
//       });

//       var authorities = [];

//       for (let i = 0; i < user.roles.length; i++) {
//         authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
//       }
//       res.status(200).send({
//         success:true,
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         roles: authorities,
//         accessToken: token
//       });
//     });
// };

exports.github_signin = async (req, res) => {
  const code = req.body.code;
  const state = req.body.state;
  if (state != server_config.github_state){
    return res.status(404).send({success:false, message: "Invalid sign in." });

  }

  

  if (code == null){
    return res.status(404).send({success:false, message: "Invalid sign in code." });
  }

  var [success, user_token, token_type] = await repo_manager.getToken(code);

  if (!success){
    return res.status(404).send({success:false, message: `Request token failed: ${user_token}`});
  }

  var [success, user_profile] = await repo_manager.getUser(user_token);

  if(!success){
    return res.status(404).send({success:false, message: `Get user profile failed: ${user_profile}`});
  }

  
  User.findOne({
    username: user_profile.login,
    github_id: user_profile.id
  })
    .populate("roles", "-__v")
    .populate("accounts",["base_name","track"])
    .exec()
    .then(async (user) => {      
      if (!user) { //user does not exist, create one now.

        var [reg_success,base_name,new_user,new_account, msg] = await github_sign_up(user_profile);

        if (!reg_success){
          return res.status(500).send({success:false, message: msg });
        }
        user = new_user;  
        await user.populate("accounts",["base_name","track"]);
      }
      user.user_token = user_token;
      user.save();

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      var accounts = [];
      var anyangle_accounts = [];

      for (let i = 0; i < user.roles.length; i++) {
        if (user.roles[i].name == undefined){
          await user.populate("roles", "-__v");
        }
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }


      for (let j = 0; j<user.accounts.length;j++){
        if (user.accounts[j].track == utils.TRACK.ANYANGLE){
          anyangle_accounts.push(user.accounts[j].base_name);
        }
        else{
          accounts.push(user.accounts[j].base_name);
        }
      }

      //collect all competitions
      var competitions = await Competition.find({}).exec();


      res.status(200).send({
        success:true,
        id: user._id,
        username: user.username,
        email: user.email,
        meta_data: user.meta_data===undefined?{}:user.meta_data,
        license_options: utils.LICENSE,
        roles: authorities,
        accessToken: token,
        accounts:accounts,
        anyangle_accounts:anyangle_accounts,
        license_templates: license_templates,
        competitions:competitions,

      });
    }).catch((err)=>{
      return res.status(500).send({success:false, message: err });
    });
};

exports.update_login_data = async (req, res) => {
  let id = req.user._id;


  User.findById(id)
    .populate("roles", "-__v")
    .populate("accounts",["base_name","track"])
    .exec()
    .then(async (user) => {      
      if (!user) { //user does not exist, create one now.


        return res.status(404).send({success:false, message: "User not found" });
        
      }

      var authorities = [];
      var accounts = [];
      var anyangle_accounts = [];

      for (let i = 0; i < user.roles.length; i++) {
        if (user.roles[i].name == undefined){
          await user.populate("roles", "-__v");
        }
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }


      for (let j = 0; j<user.accounts.length;j++){
        if (user.accounts[j].track == utils.TRACK.ANYANGLE){
          anyangle_accounts.push(user.accounts[j].base_name);
        }
        else{
          accounts.push(user.accounts[j].base_name);
        }
      }

      //collect all competitions
      var competitions = await Competition.find({}).exec();


      res.status(200).send({
        success:true,
        id: user._id,
        username: user.username,
        email: user.email,
        meta_data: user.meta_data===undefined?{}:user.meta_data,
        license_options: utils.LICENSE,
        roles: authorities,
        accounts:accounts,
        anyangle_accounts:anyangle_accounts,
        license_templates: license_templates,
        competitions:competitions,

      });
    }).catch((err)=>{
      return res.status(500).send({success:false, message: err });
    });
};