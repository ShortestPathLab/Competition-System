const mongoose = require("mongoose");

const Jobs = mongoose.model(
  "Jobs",
  new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
      },
    date:Date,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    precomputer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Precomputer",
    },
    base_name:String,
    state: String,
    multi_cpu: Boolean,

  })
);

module.exports = Jobs;