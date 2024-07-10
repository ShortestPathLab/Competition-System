const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.account = require("./account.model");
db.submission = require("./submission.model");
db.queue = require("./queue.model");
db.jobs = require("./jobs.model");
db.precomputers = require("./precomputer.model")
db.record = require("./record.model")
db.competition = require("./competition.model")
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;