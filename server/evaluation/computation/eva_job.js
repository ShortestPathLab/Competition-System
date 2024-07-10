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
const Deployer = require("./deployer");
const { throws } = require('assert');
const {globSync} = require('glob');
const { time } = require('console');
const { find } = require('../../app/models/user.model');
const storage_manager = require('../storage/storage');



class EvaJob{


    /**
     * A evaluation job. Could be a precomputing job or a benchmark job.
     * @param {DB_tool} db_tool 
     * @param {*} job 
     * @param {*} task 
     * @param {*} cpu 
     */
    constructor(db_tool,job){
        this.db_tool = db_tool
        this.process = null;
        this.job = job;
        this.work_dir_base = config_docker.working_dir; //work dir base in side docker container
        
        //data folder stores all output of benchmarks
        this.host_data_dir_base = path.join(
            config_benchmark.shared_volume_base,
            config_benchmark.data_volume,
            job.user.toString(),
            job.submission.toString()
        )        

        // //preprocessing machine evaluation folder
        // this.host_evaluation_dir_base = path.join(
        //     config_benchmark.shared_volume_base,
        //     config_benchmark.evaluation_volume,
        //     job.user.toString(),
        //     job.submission.toString()
        // )

        this.image_name = job.submission.toString();

        this.container_name = `${job.submission.toString()}`;
        
        this.exe = path.join(config_docker.working_dir, config_benchmark.run_exec);
        this.canceled = false;

        //set-up map and scenario folders based on track.

        this.problems_folder = config_benchmark.problems_folder;

    }

    init = async ()=>{

        let deployer = new Deployer(this.db_tool);
        this.db_tool.update_submission_by_id(this.job.submission,{submission_status:utils.STATE.build_container});
        this.db_tool.update_account_by_id(this.job.account,{status:utils.STATE.build_container});
        this.db_tool.log_to_progress(this.job.submission, `Prepare docker image and container on benchmark server.`);

        if ( !await deployer.prepare_container(this.job)){
            this.db_tool.log_to_progress(this.job.submission, `Failed to prepare docker image and container on benchmark server.`);
            throw new Error("Failed to init container.")
        }
        return [true,""];
    }


    // cancel = () =>{
    //     log.info(`Mark job ${this.job_name} of ${this.sub_id} as canceled.` );
    //     this.canceled = true;
    // }

    run_evaluation = async ()=>{
        this.db_tool.update_submission_by_id(this.job.submission,{submission_status:utils.STATE.running});
        this.db_tool.update_account_by_id(this.job.account,{status:utils.STATE.running});
        this.db_tool.log_to_progress(this.job.submission, `Evaluation start`);

        const problems = globSync(`${config_benchmark.problems_folder}/*/*.json`);
        const simulation_time = path.join(config_benchmark.problems_folder,config_benchmark.simulationTimeConfig);

        //load simulation time
        let sim_time;
        try{
            sim_time = JSON.parse(fs.readFileSync(simulation_time));
        }
        catch(e){
            this.db_tool.log_to_progress(this.job.submission, `Failed to read simulation time config file.`);
            this._evaluation_failed(this.job, utils.FAILURE_STATE.run_eva_failed, `Failed to read simulation time config file.`);
            log.error(`Failed to read simulation time config file.`,e)
            return [false,[],`Failed to read simulation time config file.`,utils.FAILURE_STATE.run_eva_failed];
        }

        log.info("Evaluate:",problems)
        let all_results = []

        for (let i = 0 ; i < problems.length; i++){
            let task = path.relative(config_benchmark.problems_folder, problems[i]);
            let task_name = path.basename(problems[i]).split(".")[0];
            let sim_time_task = sim_time[task_name];
            this.db_tool.log_to_progress(this.job.submission, `Start an instance Evaluation.`, true);
            this.db_tool.log_to_progress_private(this.job.submission, `Start an instance Evaluation: ${task_name}`);


            var  [work_dir,output_file,problem_path, log_file] = this._get_paths_in_container(task_name, task);
            
            var running_process = undefined;
            var timeout = false;
            var timeout_checker = setTimeout(()=>{
                if (running_process != undefined){
                    running_process.kill();
                }
                timeout = true;
            },config_benchmark.benchmark_timelimit);

            var [process,exec_promise] = run_tool.benchmark(this.container_name,
                this.exe,
                problem_path,
                config_docker.problems_dir,
                output_file,
                work_dir,
                log_file,
                sim_time_task);
            this.process =process;
            running_process = process;

            process.stdout.on("data",(data)=>{log.info(data.toString())});
            process.stderr.on("data",(data)=>{log.error(data.toString())});
                
            await exec_promise;
            clearTimeout(timeout_checker);
            var data_file = path.join(this.host_data_dir_base,`${task_name}.json`)
            var log_data_file = path.join(this.host_data_dir_base,`${task_name}.log`)

            await docker_tools.copy_from_container(output_file,this.container_name,data_file);
            await docker_tools.copy_from_container(log_file,this.container_name,log_data_file);

            let find_output = fs.existsSync(data_file);
            log.info(data_file,find_output);
            
            if (find_output){
                try{
                    let data = JSON.parse(fs.readFileSync(data_file));
                    let output = this.collect(data);
                    output["task"] = task_name;
                    all_results.push(output);
                    await this.db_tool.push_evaluation_data(this.job.submission,output);
                    this.db_tool.log_to_progress(this.job.submission, `One evaluation done.`, true);
                    this.db_tool.log_to_progress_private(this.job.submission, `${task_name} done.`);

                    if (process.exitCode!=0){
                        this.db_tool.log_to_progress(this.job.submission, `Warning: the program exit with non-zero code ${process.exitCode}`);
                    }
                    
                }
                catch(e){
                    this.db_tool.log_to_progress(this.job.submission, `Failed to read and upload the output of the evaluation task.`, true);
                    this.db_tool.log_to_progress_private(this.job.submission, `Failed to read and upload the output of task: ${task_name}, ${e}`);

                    this._evaluation_failed(this.job, utils.FAILURE_STATE.run_eva_failed, `Failed to read and upload the output of an evaluation task`);
                    log.error(`Failed to read and upload the output of task ${task_name} : ${e}`)
                    return [false,[],`Evaluation failed: ${task_name}`,utils.FAILURE_STATE.run_failed];
                }
            }
            else if (process.exitCode!=0 || timeout){
                let fail_state = utils.FAILURE_STATE.run_eva_failed
                if (timeout) fail_state = utils.FAILURE_STATE.timeout
                this.db_tool.log_to_progress(this.job.submission, `Evaluation failed on a task; Exit Code: ${process.exitCode}; Timeout: ${timeout}`, true);
                this.db_tool.log_to_progress_private(this.job.submission, `Evaluation failed on ${task_name}; Exit Code: ${process.exitCode}; Timeout: ${timeout}`);

                this._evaluation_failed(this.job, fail_state, `Evaluation failed on a task; Exit Code: ${process.exitCode}; Timeout: ${timeout}`);
                return [false,[],`Evaluation failed: ${task_name}`,fail_state]; 
            }
            else{
                this.db_tool.log_to_progress(this.job.submission, `No output found for an evaluation task.`, true);
                this.db_tool.log_to_progress_private(this.job.submission, `No output found for an evaluation task: ${task_name}`);

                this._evaluation_failed(this.job, utils.FAILURE_STATE.run_eva_failed, `No output found for an evaluation task.`);
                log.error(`No output found for task: ${task_name} `)
                return [false,[],`Evaluation failed`,utils.FAILURE_STATE.run_failed];

            }
            



        }

        await this._evaluation_success(this.job, all_results);
        this.db_tool.log_to_progress(this.job.submission, `Benchmark Finished. Clean up... ...`);
        return [true,[],"",utils.FAILURE_STATE.none];
    }

    collect(data){
        let output = {}
        for (let metrics of config_benchmark.metrics_collect){
            output[metrics] = data[metrics];
        }
        return output;
    }


    // clean_preprocessing_data = ()=>{
    //     fs.rm(
    //         path.join(this.host_evaluation_dir_base, this.job_name)
    //         ,{force :true, recursive :true});
    // }

    delete_container = ()=>{
        return docker_tools.delete_container(this.container_name);
    }

    uploadCleanEvaluationOutput = async ()=>{
        this.db_tool.log_to_progress(this.job.submission, `Upload evaluation output files.`);
        log.info("Upload evalution output files to S3.");
        let success  = await storage_manager.uploadLogFiles(this.host_data_dir_base, this.job.base_name, this.job.submission);
        if (success){
            log.info("Successfully upload evalution output files to S3.", this.host_data_dir_base);
            this.db_tool.log_to_progress(this.job.submission, `Successfully upload evaluation output files.`);
            fs.rm(
                path.join(this.host_data_dir_base)
                ,{force :true, recursive :true},(err)=>{
                    if (err){
                        log.error("Error on clearing files:", err);
                    }
                });
        }
        else{
            log.error("Failed to upload log files to S3.", this.host_data_dir_base);
        }
        
    }


    _get_paths_in_container = (ins_name, inputfile) =>{
        var work_dir = this.work_dir_base;
        var problem_path = path.join(
            config_docker.problems_dir,
            `${inputfile}`
            );
        var output_file = path.join(work_dir, `${ins_name}.json`)
        var log_file = path.join(work_dir, `${ins_name}.log`)


        return [work_dir,output_file,problem_path, log_file];
    }

    _parse_results = async (all_results, server_data, submission)=>{
        // let d3 = await import('d3-array');
    
        // for (let i in all_results) {
        //     all_results[i]["RAM_changes"] = all_results[i]["RAM_after"]-all_results[i]["RAM_before"];
        // }
        // var server_data_array = Object.values(server_data);
        // var result_array = Object.values(all_results)
        let score = {};
        let final_score = 0;
        let fast_mover = true;
        for(let data of all_results){
            let instance = data["task"];
            let newMetric = data["numTaskFinished"];
            let newSubmission = submission;
            try{
                let record = await this.db_tool.update_record(instance,newMetric,newSubmission);
                let thescore = newMetric / record.metric;
                if (record.metric === 0)
                    thescore = 0;
                score[instance] = {
                    instance: instance,
                    best_metric: record.metric,
                    my_metric: newMetric,
                    score: thescore,
                    fast_mover: data["AllValid"] === utils.VALID_ACTIONS.yes
                };
                final_score += thescore;
            }
            catch(e){
                log.error("Failed to record results for ",submission, instance,e);
            }

            if (data["AllValid"] == utils.VALID_ACTIONS.no){
                fast_mover = false;
            }
        }
        var summary = {};
        summary[config_benchmark.main_metric] = final_score;
        summary["fast_mover"] = fast_mover; 
        console.log(summary);
        return [summary,score]
    }

    _reset_update_best_= async (job, summary,score_details, new_sub)=>{
        let account = await this.db_tool.get_account_by_id(job.account,["best_subs"]);
        let best_for = [];
        let submission = await this.db_tool.get_submission_by_id(new_sub,["competition"]);
        let competition = submission.competition;
        if (competition == undefined)
            competition == utils.TEST_ROUND._id;

        let final_score = summary[config_benchmark.main_metric];

        if (account.best_subs == undefined)
            account.best_subs = new Map();
        
        let best_subs = account.best_subs.get(competition);

        console.error(best_subs)

        if (best_subs == undefined){
            best_subs = new Map();
        }

        if (best_subs.get(config_benchmark.track_submissions.overall_best) == undefined){
            best_subs.set(config_benchmark.track_submissions.overall_best, new_sub);
            best_for.push(config_benchmark.track_submissions.overall_best);
        }
        else{
            let submission = await this.db_tool.get_submission_by_id(best_subs.get(config_benchmark.track_submissions.overall_best),["summary","score_details"]);
            let old_final_score = 0;
            if (submission.score_details != undefined){
                for(let instance of Object.keys(score_details)){
                    if (submission.score_details[instance] == undefined || score_details[instance].best_metric == 0)
                        continue;
                    old_final_score += submission.score_details[instance].my_metric/score_details[instance].best_metric;
                }

            }
            if (submission.summary == undefined || 
                final_score > old_final_score){
                best_subs.set(config_benchmark.track_submissions.overall_best, new_sub);
                best_for.push(config_benchmark.track_submissions.overall_best);
            }
        }

        if (best_subs.get(config_benchmark.track_submissions.most_awarded) == undefined){
            best_subs.set(config_benchmark.track_submissions.most_awarded, new_sub);
            best_for.push(config_benchmark.track_submissions.most_awarded);
        }
        else{
            let submission = await this.db_tool.get_submission_by_id(best_subs.get(config_benchmark.track_submissions.most_awarded),["summary","score_details"]);
            let old_num_best = 0;
            let new_num_best = 0;
            if (submission.score_details != undefined){
                for(let instance of Object.keys(score_details)){
                    if (submission.score_details[instance] != undefined && 
                        submission.score_details[instance].my_metric == score_details[instance].best_metric)
                        old_num_best +=1 ;
                    if (score_details[instance].my_metric == score_details[instance].best_metric)
                        new_num_best +=1 ;
                }
            }
            if (submission.summary == undefined || 
                new_num_best > old_num_best){
                best_subs.set(config_benchmark.track_submissions.most_awarded, new_sub);
                best_for.push(config_benchmark.track_submissions.most_awarded);
            }
        }

        if (best_subs.get(config_benchmark.track_submissions.fast_mover) == undefined && summary["fast_mover"]){
            best_subs.set(config_benchmark.track_submissions.fast_mover, new_sub);
            best_for.push(config_benchmark.track_submissions.fast_mover);
        }
        else if (summary["fast_mover"]){

            let submission = await this.db_tool.get_submission_by_id(best_subs.get(config_benchmark.track_submissions.fast_mover),["summary","score_details"]);
            let old_final_score = 0;
            if (submission.score_details != undefined){
                for(let instance of Object.keys(score_details)){
                    if (submission.score_details[instance] == undefined || score_details[instance].best_metric == 0)
                        continue;
                    old_final_score += submission.score_details[instance].my_metric/score_details[instance].best_metric;
                }

            }
            if (submission.summary == undefined || 
                final_score > old_final_score){
                best_subs.set(config_benchmark.track_submissions.fast_mover, new_sub);
                best_for.push(config_benchmark.track_submissions.fast_mover);
            }


        }
        log.info("After result parse, best:", best_subs);
        let new_best_subs = account.best_subs;

        new_best_subs.set(competition, best_subs);
        
        log.info("Set new best:", new_best_subs);
        this.db_tool.update_account_by_id(job.account,{status: utils.STATE.idle, best_subs:new_best_subs});

        return best_for
    }

    _evaluation_success = async (job, all_results) => {

        // var data = await this.db_tools.get_evaluation_data_by_id(job.submission);
        // var summary = await this._parse_bench_data(data.evaluation_data,data.precomputing_data);
        let [summary, score_details] =  await this._parse_results(all_results, [], job.submission);

        let best_for = await this._reset_update_best_(job, summary, score_details, job.submission);

        this.db_tool.update_submission_by_id(job.submission,
            {
                success:true,
                submission_status : utils.SUCCESS_STATE.success,
                summary: summary,
                score_details: score_details,
                is_best_sub_for: best_for
            }
        );
        this.db_tool.update_job_by_id(job._id, {state: utils.JOB_STATE.done});
    }

    _evaluation_failed = async (job, failure_state = utils.FAILURE_STATE.none,msg = "") => {
        this.db_tool.update_submission_by_id(job.submission,
            {
                success:false,
                submission_status: failure_state,
                message: msg
            }
        );
        this.db_tool.update_job_by_id(job._id, {state: utils.JOB_STATE.done});
        this.db_tool.reset_evaluator_status(job.account);
    }

}

module.exports = EvaJob;