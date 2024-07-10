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
    submission_status: String, //"running","quening","done","failed"
    debug_status:String, //"awaiting","done","failed"
    date:Date,
    success:Boolean,
    message: String,
    progress_log:[String],// public logß
    private_log:[String],// hidden log with error message.
    repo_head: String,
    total_instances:Number,
    total_debug_instances:Number,
    precomputed_instances: Number,
    failed_precomputing_instances: Number,
    evaluated_instances:Number,
    failed_evaluation_instances: Number,
    debuged_instances:Number,
    failed_debug_instances:Number,
    summary: Object,
    debug_precomputing_data:[Object],
    debug_evaluation_data:[Object],
    precomputing_data:[Object], // [{instance:String,type:String,data:Any}] data from each single job.
    evaluation_data:[Object], // validator output data from each single benchmark job.
    precomputer:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Precomputer",
    },
    evaluated_branch: String,
    score: Number,
    multi_cpu_precomputing: Boolean,
  })
);

module.exports = Submission;