const fs = require("fs");
const DB_tool = require("./evaluation/computation/db_tools");
const EvaJob = require("./evaluation/computation/eva_job");
const docker_tool = require("./evaluation/docker/docker_tools");
const log = require("loglevel")
const utils = require("./utils")
const path = require("path");
const config_docker = require("./config_docker");
const config_benchmark = require("./config_benchmark");


log.setDefaultLevel("info");

main = async ()=>{
    const db_tool = new DB_tool();
    try{
        //example job: 
        // {"_id":"64ead9f92a3debc3ed25a22e","submission":"64ead9f3f32a393b4cb9e821",
        // "date":"2023-08-27T05:07:05.689Z","user":"64221a3cbcee5dbdcea2b0ef",
        // "account":"64221a3cbcee5dbdcea2b0f0",
        // "base_name":"nobodyczcz",
        // "state":"running","multi_cpu":false,"__v":0}

        var job_path = process.argv[2];
        var job = JSON.parse(fs.readFileSync(job_path).toString());
        var o_stdout = process.stdout.write;
        var o_stderr = process.stderr.write;
        if (process.argv.length >= 4 && process.argv[3] == "--log-to-file"){
            fs.mkdirSync(path.join(
                config_benchmark.shared_volume_base,
                config_benchmark.data_volume,
                job.user.toString(),
                job.submission.toString()),{recursive:true})
            var access = fs.createWriteStream(path.join(
                config_benchmark.shared_volume_base,
                config_benchmark.data_volume,
                job.user.toString(),
                job.submission.toString(),
                "evaluation.log"
                ));
            
            process.stdout.write = process.stderr.write = access.write.bind(access);
        }


        
        db_tool.log_to_progress(job.submission,`Start evaluation preparation.`);

        var evaluation = new EvaJob(db_tool, job);

        try{
            await evaluation.init();
            await evaluation.run_evaluation();
        }
        catch(e){
            log.error("Failed to evaluate ",job._id, "\n",e);
            db_tool.log_to_progress(job.submission,`Evaluation Failed`);
            evaluation._evaluation_failed(evaluation.job,utils.FAILURE_STATE.run_eva_failed);
        }
        try{
            //process.stdout.write back to stdout and process.stderr.write back to stderr
            process.stdout.write = o_stdout;
            process.stderr.write = o_stderr;
            await evaluation.uploadCleanEvaluationOutput();
        }
        catch(e){
            log.error("Failed to upload evaluation output ",job._id, "\n",e);
            db_tool.log_to_progress(job.submission,`Warning: Failed to upload evaluation output.`);
            evaluation._evaluation_failed(evaluation.job,utils.FAILURE_STATE.run_eva_failed);
        }
        
        try{
            await docker_tool.delete_image(evaluation.image_name);
        }
        catch(e){
            log.error("Failed to delete image ",job._id, "\n",e);
            db_tool.log_to_progress(job.submission,`Warning: failed to clear docker container`);
        }
        process.exit(0);
    }
    catch(e){
        log.error("Failed to start evaluation ",job._id, "\n",e);
        db_tool.log_to_progress(job.submission,`Failed to initiate the evaluation`);
    }
    process.exit(100);


}


main()


