const fs = require('fs'); 
const config = require("../../config");
const run_tool = require("./run.js");
const utils = require("../../utils");
const path = require("path");
const DB_tool = require("./db_tools");
const docker_tools = require("../docker/docker_tools");
const fastFolderSize = require('fast-folder-size')

const config_benchmark = require('../../config_benchmark');
const config_docker = require('../../config_docker');
const log = require('loglevel');

const storage_manager = require('../storage/storage');

const JOB_STATE={
    NONE:0,
    PREPROCESSING:1,
    VALIDATING:2,
    BENCHMARKING:3,
    DONE:4,
    FAILED:5
}


class SlurmJob{


    /**
     * A evaluation job. Could be a precomputing job or a benchmark job.
     * @param {*} db_tool 
     * @param {*} job 
     * @param {*} task 
     * @param {*} cpu 
     */
    constructor(db_tool,job){
        this.db_tool = db_tool
        this.process = null;
        this.job = job;
        this.work_dir_base = config_docker.volume_mount_target; //work dir base in side docker container
        this.slurm_job_name = this.job.base_name
        //preprocessing machine data folder
        this.host_data_dir_base = path.join(
            config_benchmark.shared_volume_base,
            config_benchmark.data_volume,
            job.user.toString(),
            job.submission.toString()
        )

        //preprocessing machine evaluation folder
        this.host_evaluation_dir_base = path.join(
            config_benchmark.shared_volume_base,
            config_benchmark.evaluation_volume,
            job.user.toString(),
            job.submission.toString()
        )

        this.image_name = job.submission.toString();

        this.container_name = `${job.submission.toString()}`;
        
        this.exe = path.join(config_docker.working_dir, config_benchmark.run_exec);
        this.canceled = false;

        //set-up map and scenario folders based on track.

        this.problems_folder = config_benchmark.problems_folder;

    }

    // init = async ()=>{
    //     var [start_success, start_msg] = await docker_tools.start_container(
    //         this.image_name,
    //         this.container_name,
    //         this.host_evaluation_dir_base, this.cpu);
    //     if (!start_success){
    //         throw `Failed to start job container: ${start_msg}`;
    //     }
    // }

    // init_benchmark = async () =>{

    // }

    // cancel = () =>{
    //     log.info(`Mark job ${this.job_name} of ${this.sub_id} as canceled.` );
    //     this.canceled = true;
    // }

    /**
     * 
     * @param {Function} callback 
     * @returns {None}
     */
    slurm_run = async (callback)=>{
        try{
            var success = await this.syncLargeFiles();
            
        }
        catch(e){
            callback(this,false,`Failed to sync large files`, utils.FAILURE_STATE.file_sync_failed);
            log.error(`Failed to sync large files`,e)
            return;
        }
        this.db_tool.log_to_progress(this.job.submission,`Awaiting evaluation resources.`);
        this.db_tool.update_submission_by_id(this.job.submission,{submission_status:utils.STATE.awaiting});
        this.db_tool.update_account_by_id(this.job.account,{status:utils.STATE.awaiting});

        try{
            var stdout="";
            var stderr="";
            var p_err="";
            var job_path = path.join(this.host_evaluation_dir_base,`${this.job.submission}.json`)
            fs.mkdirSync(this.host_evaluation_dir_base,{recursive:true});
            fs.writeFileSync(job_path, JSON.stringify(this.job))
            var [process,exec_promise] = run_tool.slurm_run(job_path, `${this.slurm_job_name}`);
            this.process = process;
            process.stdout.on("data",(data)=>{ stdout+=data; log.info(data.toString())});
            process.stderr.on("data",(data)=>{ stderr+=data; log.error(data.toString())});
            process.on("error",(error)=>{p_err+=error; log.error(error)});

            await exec_promise; //wait for preprocessing end.
            // clearTimeout(timeout_checker);

            
            await this.clearLargeFiles();
            //catch srun: error and srun: Job step aborted
            if (stderr.includes("srun: error") || stderr.includes("srun: Job step aborted") ||
                p_err.includes("srun: error") || p_err.includes("srun: Job step aborted")){
                this.db_tool.log_to_progress(this.job.submission,`Slurm run failed with error: ${p_err} ${stderr}`);
                log.error(`Job ${this.job.submission} failed with error: ${p_err} ${stderr}`);
                callback(this,false,`Slurm run failed with error: ${p_err} ${stderr}`, utils.FAILURE_STATE.slurm_job_error);
                return;
            }

            if (this.process.exitCode!=0){
               
                callback(this,false,`Evaluation Job Error`, utils.FAILURE_STATE.slurm_job_error);
                return;
            }
            
            // var size_bytes = await run_tool.get_size(host_evaluation_dir);
            log.info(`Job ${this.job.submission} finished.`);


            this.process = undefined;
        }
        catch(e){
            callback(this,false,`Internal Error ${e}`,utils.FAILURE_STATE.crashed)
        }
    }

    syncLargeFiles = async () =>{
        this.db_tool.update_submission_by_id(this.job.submission,{submission_status:utils.STATE.syncing});
        this.db_tool.update_account_by_id(this.job.account,{status:utils.STATE.syncing});
        this.db_tool.log_to_progress(this.job.submission,`Sync large files.`);
        log.info("Sync large files... ...");
        return await storage_manager.downloadAll(this.job.base_name);
    }

    clearLargeFiles = async()=>{
        this.db_tool.log_to_progress(this.job.submission,`Clear large files.`);
        log.info("Clear large files... ...");
        let success =  await storage_manager.clearAll(this.job.base_name);
        if (!success){
            this.db_tool.log_to_progress(this.job.submission,`Failed to clear large files.`);
            log.error("Failed to clear large files... ...");
        }
        return success;
    }

}

module.exports = SlurmJob;