const mongoose = require("mongoose");

const Submission = mongoose.model(
  "Submission",
  new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    competition:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Competition",
    },
    submission_status: String, //"running","quening","done","failed"
    debug_status:String, //"awaiting","done","failed"
    date:Date,
    success:Boolean,
    message: String,
    progress_log:[String],// public logß
    private_log:[String],// hidden log with error message.
    repo_head: String,
    total_instances:Number,
    evaluated_instances:Number,
    summary: Object,
    score_details:Object,
    evaluation_data:[Object], // validator output data from each single benchmark job.
    evaluated_branch: String,
    score: Number,
    multi_cpu_precomputing: Boolean,
    is_best_sub_for:[String]
  })
);

module.exports = Submission;