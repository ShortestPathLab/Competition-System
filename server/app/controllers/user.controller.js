const Account = require("../models/account.model");
const User = require("../models/user.model");
const Record = require("../models/record.model");
const utils = require("../../utils");

const server_config = require("../../config")
const repo_manager = require("../repo/repo.manage")

checkCreateRepo = async (account, user) => {
  var need_save = false;

  if (!account.repo_created) {
    var repo = await repo_manager.getRepo(account.base_name);
    if (repo != null) {
      account.repo_created = true;
      account.repo_accepted = true;
      need_save = true;

    }
    else {
      var [repo_success, repo_msg] = await repo_manager.setupRepoAndInvite(account.base_name, user.username, account.track);
      console.log("create repo", [repo_success, repo_msg])

      if (repo_success) {
        account.repo_created = true;
        account.invt_id = repo_msg;
        need_save = true;
      }
    }
  }

  if (account.repo_created && !account.repo_accepted) {
    var [invt_success, invt_msg] = await repo_manager.acceptInvitation(user.user_token, account.invt_id);
    console.log("accept invite", [invt_success, invt_msg])

    if (invt_success) {
      account.repo_accepted = true;
      need_save = true;
    }
  }

  if (need_save) {
    account.save();
  }
  return;
}

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getBranches = async (req, res) => {
  var account = req.account;

  var branches = await repo_manager.getBranches(account.base_name);
  if (branches == null) {
    res.status(500).send(["None"]);
  }
  res.status(200).send(branches);

}

exports.getContactEmail = async (req, res) => {
  var user = req.user;
  res.status(200).send({
    success: true,
    userContact:{contact_email:user.contact_email,subscribe:user.subscribe}
  }
  );
}

exports.setContactEmail = async (req, res) => {
  var user = req.user;
  var contact_email = req.body.contact_email;
  var subscribe = req.body.subscribe;
  //check if valid email address
  if (contact_email == undefined || contact_email.length == 0 || contact_email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) == null){
    return res.status(500).send({success:false, message:"Invalid email address"});
  }
  //check if subscribe boolean
  if (subscribe == undefined || (subscribe != true && subscribe != false)){
    return res.status(500).send({success:false, message:"Invalid subscribe value"});
  }
  user.contact_email = contact_email;
  user.subscribe = subscribe;
  user.save().then((d) => {
    return res.status(200).send({ success: true });
  }).catch((err) => {
    return res.status(500).send({ success: false, message: err });
  });
}

exports.setEvaluateBranch = async (req, res) => {
  var account = req.account;
  var branch = req.body.branch;
  var branches = await repo_manager.getBranches(account.base_name);
  var found = false;
  for (var b of branches) {
    if (b.name == branch) {
      found = true;
      break;
    }
  }

  if (found) {
    account.evaluate_branch = branch;
    account.save().then(d => {
      res.status(200).send("Done");
    }).catch((err) => {
      res.status(500).send("Set branch failed");
    });
  }
  else {
    res.status(404).send("branch not found");
  }
}

exports.status = async (req, res) => {
  var user = req.user;
  var account = req.account;

  await account.populate("current_submission");

  checkCreateRepo(account, user);

  var result = {
    name: account.base_name,
    nickname: account.nickname,
    status: account.status,
    best_score: account.best_score,
    best_done: account.best_done,
    last_submission: account.current_submission ? account.current_submission.date : undefined,
    all_submissions: account.submissions,
    repo_web: account.repo_link,
    repo_https_git: account.repo_ssh,
    multi_cpu_precomputing: account.multi_cpu_precomputing,
    evaluate_branch: account.evaluate_branch,
  }

  return res.status(200).send(result);

};

exports.mySubs = async (req, res) => {
  var user = req.user;
  var account = req.account;
  var page = parseInt(req.query.page);
  var sub_length = account.submissions.length;
  var comp_id = req.query.comp_id;
  var fields = [
    "score",
    "runtime",
    "suboptimality_ratio",
    "num_tasks_solved",
    "submission_status",
    "date",
    "success",
    "message",
    "competition",
    "progress_log",// public logß
    "repo_head",
    "total_instances",
    "evaluated_instances",
    "score_details",
    "summary"];
  if (req.roles.includes(utils.ROLE.admin)) {
    fields.push("private_log")
  }
  account.submissions = account.submissions.slice(sub_length - (page + 1) * 10, sub_length - page * 10);
  await account.populate({path:"submissions",fields:fields,populate:{path:"competition"}});
  // console.log(account.submissions.length,sub_length, page, 1, (page + 1) , 10,sub_length - (page + 1) * 10, sub_length - page * 10,page);
  let records = await Record.find({}).exec();
  let virtual_best = {};
  for (let r of records){
    let key = r.competition;
    if (key == undefined)
      key = utils.TEST_ROUND._id;

    if (virtual_best[key] == undefined)
      virtual_best[key] = {};

    virtual_best[key][r.instance] = r;
  }

  var subs = account.submissions.reverse();
  var result = {
    submissions: subs,
    total_subs: sub_length,
    virtual_best: virtual_best,
  }
  // console.log("subs", result);
  return res.status(200).send(result);

};


exports.saveNickname = (req, res) => {
  var nickname = req.body.nickname;
  var account = req.account;


  account.nickname = nickname;
  account.save().then((d) => {
    return res.status(200).send({ success: true });
  }).catch((err) => {
    return res.status(500).send({ success: false, message: err });
  });
};

exports.saveMetaData = (req, res) => {
  var meta_data = req.body.meta_data;
  var user = req.user;


  user.meta_data = meta_data;
  user.save().then((d) => {
    return res.status(200).send({ success: true });
  }).catch((err) => {
    return res.status(500).send({ success: false, message: err });
  });
};


exports.savePrecomptingCPU = (req, res) => {
  var multi_cpu_precomputing = req.body.multi_cpu_precomputing;
  var account = req.account;

  account.multi_cpu_precomputing = multi_cpu_precomputing;
  account.save().then((d) => {

    return res.status(200).send({ success: true });
  }).catch((err) => {
    return res.status(500).send({ success: false, message: err });
  });
};

exports.createAccount = (req, res) => {
  var userid = req.userId;
  var account_name = req.body.account_name;
  var track = req.body.track;

  if (account_name.length == 0 || account_name.length >= 50 || account_name.match("^[a-z0-9A-Z\-\.\_]+$") == null) {
    return res.status(500).send({ success: false, message: "Invalid account name, only '- _ .' are allowed." });
  }

  if (!(track in utils.TRACK)) {
    return res.status(500).send({ success: false, message: "Invalid track" });
  }


  User.findById(userid).populate("roles").exec().then((user) => {


    let admin = false
    for (let role of user.roles) {
      if (role.name == utils.ROLE.admin) {
        admin = true;
      }
    }
    if (!admin && user.accounts.length >= 2) {
      return res.status(500).send({ success: false, message: "Exceed account limit: 2" });

    }

    var base_name = `${server_config.gppc_repo_prefix}${user.username}_${account_name}`
    var repo_link = `${server_config.repo_web_base}/${base_name}.git`
    var repo_ssh = `${server_config.repo_ssh_base}/${base_name}.git`

    var account = new Account({
      user: userid,
      status: "idle",
      quene: "-1",
      repo_link: repo_link,
      repo_ssh: repo_ssh,
      base_name: base_name,
      nickname: account_name,
      repo_created: false,
      repo_accepted: false,
      track: track,
      evaluate_branch: 'master'
    })

    account.save().then(account => {

      user.accounts.push(account._id);
      user.save();


      // checkCreateRepo(account, user);

      return res.status(200).send({ success: true, base_name: base_name });


    }).catch((err) => {
      return res.status(404).send({ success: false, message: err });
    });
  }).catch((err) => {
    return res.status(404).send({ success: false, message: err });
  });


};
