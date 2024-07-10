const Initiator = require("./evaluation/computation/initiator");
const config_benchmark = require('./config_benchmark');
const job_creater = require('./evaluation/computation/job_creater');
const DB_tool = require("./evaluation/computation/db_tools")
const Deployer = require("./evaluation/computation/deployer")

const db_tool = new DB_tool();
const deployer = new Deployer(db_tool);

job_creater.queue_fetcher(deployer,db_tool);