const mongoose = require("mongoose");

const Queue = mongoose.model(
  "Queue",
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
    multi_cpu: Boolean,
  })
);

module.exports = Queue;