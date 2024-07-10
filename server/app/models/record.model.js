const mongoose = require("mongoose");

const Record = mongoose.model(
  "Record",
  new mongoose.Schema({
    instance:{
      type: String,
      index: true
    },
    competition:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Competition",
      index: true
    },
    metric: Number,
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Submission"
    },
    history:[mongoose.Schema.Types.ObjectId],
  })
);


module.exports = Record;