const Initiator = require("./evaluation/computation/initiator");
const config_benchmark = require('./config_benchmark');
const DB_tool = require("./evaluation/computation/db_tools")
const log = require("loglevel");

const db_tool = new DB_tool();
log.setDefaultLevel("trace");

var initiator  = new Initiator(db_tool,config_benchmark.max_parallels);
initiator.init_benchmarks();