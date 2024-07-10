const mongoose = require("mongoose");

const Account = mongoose.model(
  "Account",
  new mongoose.Schema({
    base_name: {
      type: String,
      unique: true,
      index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    status: String, //"running","quening","idle"
    quene: Number,
    nickname:String,
    current_submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
      },
    best_subs:{
      type: Map,
      of: {
        type: Map,
        ref: "Submission"
      },
    },
    // best_submission:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Submission",
    //     index:true
    // },
    multi_cpu_precomputing: Boolean,
    support_precomputing: Boolean,
    track:String,
    best_score:Number,
    best_done:Number,
    repo_link:String,
    repo_ssh:String,
    repo_created: Boolean,
    repo_accepted: Boolean,
    invt_id:Number,
    evaluate_branch: String,
    submissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
      }
    ]
  })
);

module.exports = Account;