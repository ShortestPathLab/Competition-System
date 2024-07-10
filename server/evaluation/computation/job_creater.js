const fs = require('fs'); 
const { assert } = require("console");
const util = require("../../utils")
const log = require("loglevel");
const config_benchmark = require('../../config_benchmark');
const {globSync} = require('glob');

const problems = globSync(`${config_benchmark.problems_folder}/*/*.json`)

log.setDefaultLevel("info");

exports.queue_fetcher = async (deployer, db_tool) => {

    let jobs_count = await db_tool.count_jobs();
    if (jobs_count < config_benchmark.max_parallels){
        let submission_que = await db_tool.pop_queue();
        if (submission_que != null  &&  submission_que!= undefined){
            try{
                
                let account = (await db_tool.get_account_by_id(submission_que.account,["base_name","track"]));
                let track =account.track;
                db_tool.log_to_progress(submission_que.submission, `Find submission ${submission_que.submission}, start evaluation process.`)
                db_tool.log_to_progress(submission_que.submission, `Deploy Codes on preprocessing machine.`);
                log.info(`Find submission ${submission_que.submission}, start evaluation process.`)

                db_tool.update_submission_by_id(submission_que.submission,{total_instances:problems.length,submission_status:util.STATE.deploying});
                db_tool.update_account_by_id(submission_que.account,{status:util.STATE.deploying});

                let [deploy_success,deploy_msg] = await deployer.deploy_one(submission_que);
                if (!deploy_success) {
                    log.error(`Deploy code failed: `,deploy_msg)
                    db_tool.submission_failed(submission_que.submission,util.FAILURE_STATE.deploy_failed,"Failed to get deploy codes.");
                    db_tool.reset_evaluator_status(submission_que.account);
                    setTimeout(() =>{exports.queue_fetcher(deployer,db_tool)},5000);
                    return;
                }
                
                db_tool.log_to_progress(submission_que.submission, `Creating evaluation job.`);

                try{
                    db_tool.update_submission_by_id(submission_que.submission,{submission_status:util.STATE.initiating});
                    db_tool.update_account_by_id(submission_que.account,{status:util.STATE.initiating});

                    let job = {
                        submission: submission_que.submission,
                        date: Date.now(),
                        user: submission_que.user,
                        account: submission_que.account,
                        base_name:account.base_name,
                        state:util.JOB_STATE.running,
                        multi_cpu: submission_que.multi_cpu,
                        track:track,
                    }

                    await db_tool.create_job(job);

                }
                catch(e){
                    log.error("Error in job/bjob creating:",e);
                    db_tool.submission_failed(submission_que.submission,util.FAILURE_STATE.creat_job_failed,"Failed to create jobs.");
                    db_tool.reset_evaluator_status(submission_que.account);
                }
            }
            catch(e){
                log.error("Error when deploy and create submission:",e);
                deployer.delete_all_of(submission_que.submission);
                db_tool.log_to_progress_private(submission_que.submission,e);
                db_tool.submission_failed(submission_que.submission,util.FAILURE_STATE.crashed,"Internal Error.");
                db_tool.reset_evaluator_status(submission_que.account);

            }
        }
    }

    setTimeout(() =>{exports.queue_fetcher(deployer,db_tool)},5000);
    return;

    
}