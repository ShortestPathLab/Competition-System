const fs = require('fs'); 
const config = require("../../config");
const pidusage = require('pidusage');
const path = require("path");
const DB_tool = require("./db_tools");
const SlurmJob = require("./slurm_job");
const log = require("loglevel");
const docker_tools = require("../docker/docker_tools")
const Deployer = require("./deployer");
const config_benchmark = require('../../config_benchmark');
const utils = require("../../utils")
const config_docker = require('../../config_docker');
const { urlToHttpOptions } = require('url');
const assert = require('assert');

class Initiator {
    /**
     * 
     * @param {DB_tool} db 
     * @param {Number} pool_size 
     */
    constructor(db, pool_size){
        this.db_tools = db;
        this.pool_size = pool_size;
        this.task_pool = new Map();
    }


    init_benchmarks = async ()=>{
        while (this.task_pool.size < this.pool_size){
            let num_in_queue = await this.db_tools.count_jobs();
            if (num_in_queue == 1){
                num_in_queue += 1;
            }
            let awaiting_jobs = await this.db_tools.get_awaiting_jobs(this._get_running_accounts());
            if (awaiting_jobs == undefined || awaiting_jobs.length==0){
                break;
            }
            for(let job of awaiting_jobs){

                try{
                    if (job.state == utils.JOB_STATE.canceled){
                        //if the evalution failed and ask precomputing to stop
                        log.info(`Job canceled ${job.submission}. Remove from pool`);
                        this.db_tools.log_to_progress(job.submission,`Job canceled.`);
                        
                        //TODO: Kill slurm job.
                        await this.db_tools.delete_job_by_id(job._id);
                        this.task_pool.delete(this._to_task_id(job._id));

                    }
                    else if (job.state == utils.JOB_STATE.done){
                        //if the evalution failed and ask precomputing to stop
                        log.info(`Job done ${job.submission}. Remove from pool`);
                        this.db_tools.log_to_progress(job.submission,`Job done.`);
                        
                        // cancel job with slurm.
                        await this.db_tools.delete_job_by_id(job._id);
                        this.task_pool.delete(this._to_task_id(job._id));

                    }
                    else{
                        if (this.task_pool.size >= this.pool_size || this.task_pool.has(this._to_task_id(job._id))){
                            continue;
                        }

                        this.db_tools.update_submission_by_id(job.submission,{submission_status:utils.STATE.initiating});
                        this.db_tools.update_account_by_id(job.account,{status:utils.STATE.initiating});
                        this.db_tools.log_to_progress(job.submission,`Init evaluation job`);

                        this.task_pool.set(this._to_task_id(job._id), new SlurmJob(this.db_tools, job));            
                        this.task_pool.get(this._to_task_id(job._id) ).slurm_run(this.job_fail_callback);
                        
                    }
                }
                catch (e){
                    log.error("Error in precomputing: ",e)
                    this.db_tools.log_to_progress_private(job.submission,`Error in precomputing: ${e}`);
                    this._prepare_job_failed(job);

                }
            }
        }
        setTimeout(this.init_benchmarks.bind(this),5000);
    }




    job_fail_callback = (slurm_job,success, msg, failure_state)=>{
        //call back for error on calling a slurm job.
        let job = slurm_job.job
        log.error(`Job ${job._id} Failed: ${msg} ${failure_state}.`);
        this._evaluation_failed(job,failure_state,msg);
        this.task_pool.delete(this._to_task_id(job._id));

    }

    _evaluation_failed = async (job, failure_state = utils.FAILURE_STATE.none,msg = "") => {
        this.db_tools.update_submission_by_id(job.submission,
            {
                success:false,
                submission_status: failure_state,
                message: msg
            }
        );
        await this._delete_job_of(job._id); 
        this.db_tools.reset_evaluator_status(job.account);
    }

    _to_task_id = (job_id) => {
        return `${job_id.toString()}`;
    }


    /**
     * Mark job in job queue as canceled.
     * @param {*} job_id 
     * @returns 
     */
    _delete_job_of = (job_id) =>{
        return this.db_tools.delete_job_by_id(job_id)
    }


    /**
     * Clean data on precomputing machine
     * @param {*} user_id 
     * @param {*} sub_id 
     */
    _clean_data_of = (user_id, sub_id)=>{
        fs.rm(
            path.join(
                config_benchmark.shared_volume_base,
                config_benchmark.evaluation_volume,
                user_id.toString(),
                sub_id.toString()
                ),
            {force:true, recursive :true},(err)=>{
                log.error(err);
            });
    }

    _get_running_accounts = () =>{
        let excluded_accounts = [];
        for (let [_id, slurm_job] of this.task_pool){
            if (!excluded_accounts.includes(slurm_job.job.account)){
                excluded_accounts.push(slurm_job.job.account);
            }
        }
        return excluded_accounts;
    }
    

    _prepare_job_failed = (job)=>{
        this.db_tools.update_submission_by_id(job.submission,
            {
                success:false,
                submission_status : utils.FAILURE_STATE.eva_crashed,
                message : "Failed to init a job. Please contact adminastors for details.",
            }
        );
        log.trace("Job failed. Remove from JOB queue");
        this._delete_job_of(job._id); 
        this.db_tools.reset_evaluator_status(job.account);
    }



    
}

module.exports = Initiator



