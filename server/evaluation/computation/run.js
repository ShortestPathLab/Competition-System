const { exec,spawn } = require('child_process');
const promisify = require("util").promisify;
const fs= require('fs');
const path=require("path")
const utils=require("../../utils")
const log = require("loglevel");

const benchmark_config = require("../../config_benchmark")
const docker_config = require("../../config_docker");
const docker_tools = require("../docker/docker_tools")
const { exit } = require('process');
const { fail } = require('assert');
const config_benchmark = require('../../config_benchmark');
const config_docker = require('../../config_docker');

const exec_prefix = "docker container exec"
const exec_p = promisify(exec);


/**
 * Run pre-processing
 * @param {String} container_name 
 * @param {String} exe_path 
 * @param {String} map_path 
 * @param {String} work_dir 
 * @returns 
 */

exports.slurm_run = (job_path, name)=>{
    if (config_benchmark.dev_mode){
        var process = spawn("node", [`${benchmark_config.job_script}`, `${job_path}`,'--log-to-file']);
    }
    else{
        var process = spawn("srun", [`--job-name=${name}`, '--exclusive', `node`,
         `${benchmark_config.job_script}`, `${job_path}`,'--log-to-file']);
    }
    log.info("Run command ", process.spawnfile, process.spawnargs);
    return [ process,new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(true)});
    })];
}

exports.preprocessing = (container_name,exe_path, map_path, work_dir)=>{
    var process = spawn("docker",
        ["container","exec", "-w", `${work_dir}`, `${container_name}`, `${exe_path}`, `-pre`, `${map_path}`, `none`]);
    return [ process,new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(true)});
    })];
}

/**
 * Run validation in a given container with a map path
 * @param {String} container_name 
 * @param {String} map_path 
 * @param {String} scenario_path 
 * @returns process, promise
 */
exports.validation = (container_name, exe_path,map_path, scenario_path,work_dir)=>{
    var process = spawn("docker",
        ["container","exec", "-w", `${work_dir}`,`${container_name}`, `${exe_path}`, `-check`,`${map_path}`, `${scenario_path}`]);


    return [process,new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(true)});
    })];
}

/**
 * Validate validation mode result with grid validator or anyangle validator.
 * @param {String} output_file 
 * @param {String} map_file 
 * @param {String} scenario_file 
 * @param {String} info_file 
 * @returns 
 */
exports.validate = async (output_file,map_file, scenario_file,info_file,track = undefined) =>{
    var stdout="";
    var stderr="";
    var err = "";
    var cwd = path.dirname(benchmark_config.dev_validator);
    var validator = benchmark_config.dev_validator;
    if (track == utils.TRACK.ANYANGLE){
        validator = benchmark_config.dev_anya_validator;
    }

    var result = await new Promise(function (resolve, reject) {
        var process = spawn(benchmark_config.python,[validator,
             path.resolve(output_file), path.resolve(map_file),
             path.resolve(scenario_file),path.resolve(info_file)],{cwd:cwd});
        process.stdout.on("data", (data)=>{stdout += data});
        process.stderr.on("data", (data)=>{stderr += data});
        process.on("error", (error)=>{stderr += error});

        process.addListener("close", (code)=>{
            var data = {}
            try{
                data = JSON.parse(stdout);
            }
            catch (e){
                data = {
                    "success":false,
                    "message":"Failed to parse json output"        
                    }
            }
            resolve([code,data,stdout,stderr])
        });
    });
    return result;
}

/**
 * Validate anyangle validation mode result.
 * @param {String} output_file 
 * @param {String} map_file 
 * @param {String} scenario_file 
 * @param {String} info_file 
 * @returns 
 */
 exports.validate_anya = async (output_file,map_file, scenario_file,info_file) =>{
    var stdout="";
    var stderr="";
    var err = "";
    var cwd = path.dirname(benchmark_config.dev_validator);
    var result = await new Promise(function (resolve, reject) {
        var process = spawn(benchmark_config.python,[benchmark_config.dev_anya_validator,
             path.resolve(output_file), path.resolve(map_file),
             path.resolve(scenario_file),path.resolve(info_file)],{cwd:cwd});
        process.stdout.on("data", (data)=>{stdout += data});
        process.stderr.on("data", (data)=>{stderr += data});
        process.on("error", (error)=>{stderr += error});

        process.addListener("close", (code)=>{
            var data = {}
            try{
                data = JSON.parse(stdout);
            }
            catch (e){
                data = {
                    "success":false,
                    "message":"Failed to parse json output"        
                    }
            }
            resolve([code,data,stdout,stderr])
        });
    });
    return result;
}

//validate user code output
exports.validate_benchmark = async (validation_file,benchmark_file,info_file) => {
    var stdout="";
    var stderr="";
    var err = "";
    var cwd = path.dirname(benchmark_config.bench_validator);
    var result = await new Promise(function (resolve, reject) {
        var process = spawn(benchmark_config.python,[benchmark_config.bench_validator, 
            path.resolve(validation_file),
            path.resolve(benchmark_file),
            path.resolve(info_file)],{cwd: cwd});
        process.stdout.on("data", (data)=>{stdout += data});
        process.stderr.on("data", (data)=>{stderr += data});
        process.on("error", (error)=>{stderr += error});

        process.addListener("close", (code)=>{
            var data = {}
            try{
                data = JSON.parse(stdout);
            }
            catch (e){
                data = {
                    "success":false,
                    "message":"Failed to parse json output"        
                    }
            }
            resolve([code,data,stdout,stderr])
        });
    });
    return result;
}

/**
 * Run benchmark in a given container with a map path
 * @param {String} container_name 
 * @param {String} exe_path
 * @param {String} map_path 
 * @param {String} scenario_path 
 * @param {String} work_dir 
 * @returns process, promise
 */
exports.benchmark = (container_name, exe_path,input_file, input_folder, output_file, work_dir,log_file, sim_time) => {
    var process = spawn("docker",["container","exec", "-w", `${work_dir}`, `${container_name}`,
     `${exe_path}`,
     "--inputFile",`${input_file}`,
     "-o", `${output_file}`,
      "-l", `${log_file}`,
      "--fileStoragePath", `${config_docker.volume_mount_target}`,
      "--planTimeLimit",   `${config_benchmark.planTimeLimit}`,
      "--simulationTime",  `${sim_time}`,
      "--preprocessTimeLimit", `${config_benchmark.preprocessTimeLimit}`

    ]);

    log.info(process.spawnargs);
    return [process,new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(true)});
    })];
}


//create folders to store maps and scenarios in the container
exports.prepare_folders = async(container_name)=>{
    var exit_code = await new Promise((resolve)=>{
        var p =exec(`${exec_prefix} ${container_name} mkdir -p ${docker_config.problems_dir}`);
        p.on("close",(code)=>{resolve(code)});
    });
    if (exit_code!=0){
        return false;
    }
   
    return true
}

/**
 * 
 * @param {String} user_id 
 * @param {String} submission_id 
 * @returns 
 */
exports.prepare_shared_folders = (user_id,submission_id) =>{

    try{
        var precompute_folders = path.join(config_benchmark.shared_volume_base,config_benchmark.evaluation_volume,user_id,submission_id);
        if (!fs.existsSync(precompute_folders)){
            fs.mkdirSync(precompute_folders, {recursive:true})
        }

        var precomute_data_folers = path.join(config_benchmark.shared_volume_base,config_benchmark.data_volume,user_id,submission_id);
        if (!fs.existsSync(precomute_data_folers)){
            fs.mkdirSync(precomute_data_folers, {recursive:true})
        }
    }
    catch (e){
        return [false,"",""];
    }
    return [true,precompute_folders,precomute_data_folers];
}

/**
 * 
 * @param {String} user_id 
 * @param {String} submission_id 
 * @returns 
 */
 exports.prepare_evaluator_folders = (user_id,submission_id) =>{

    try{
        var evaluator_folders = path.join(config_benchmark.bench_volume_base,user_id,submission_id);
        if (!fs.existsSync(evaluator_folders)){
            fs.mkdirSync(evaluator_folders, {recursive:true})
        }

    }
    catch (e){
        return [false,"",""];
    }
    return [true,evaluator_folders];
}

exports.compile = async (container_name)=>{
    var stdout="";
    var stderr="";
    var compile_mod_code = await new Promise((resolve)=>{
        var p =exec(`${exec_prefix} ${container_name} chmod u+x ${benchmark_config.compile_script}`);
        p.stdout.on("data",(data)=>{stdout+=data});
        p.stderr.on("data",(data)=>{stderr+=data});
        p.on("close",(code)=>{resolve(code)});
    });
    if (compile_mod_code!=0){
        return [compile_mod_code,stdout,stderr];
    }

    var process = spawn("docker",["container","exec", `${container_name}`, `${benchmark_config.compile_script}`]);

    var build_code  = await new Promise(function (resolve, reject) {
        process.stdout.on("data",(data)=>{stdout+=data});
        process.stderr.on("data",(data)=>{stderr+=data});
        process.addListener("close", (code)=>{resolve(code)});
    });
    if (build_code!=0){
        return [build_code,stdout,stderr];
    }

    var run_mod_code = await new Promise((resolve)=>{
        var p =exec(`${exec_prefix} ${container_name} chmod u+x ${benchmark_config.run_exec}`);
        p.stdout.on("data",(data)=>{stdout+=data});
        p.stderr.on("data",(data)=>{stderr+=data});
        p.on("close",(code)=>{resolve(code)});
    });
    if (run_mod_code!=0){
        return [run_mod_code,stdout,stderr];
    }
    return [0,stdout,stderr];

}

/**
 * 
 * @param {String} folder Path to the folder
 * @returns {Number} size in bytes
 */
exports.get_size = async (folder)=>{
    const {stdout,stderr} = await exec_p(`du -sk '${path.resolve(folder)}'`);

    var size = stdout.match("^[0-9]+");
    return Number(size);
}


exports.cpFolder = async (source,destination) =>{
    await exec_p(`cp -rf '${path.resolve(source)}' '${path.resolve(destination)}'`);
}

exports.parse_benchmark_data = async (all_results, server_data)=>{
    const d3 = await import('d3-array');

    for (var i in all_results) {
        all_results[i]["RAM_changes"] = all_results[i]["RAM_after"]-all_results[i]["RAM_before"];
    }

    var result_array = Object.values(all_results)
    var summary = {};
    var total_sum = d3.sum(result_array, d=>d["total"]);
    var decimal_number = 10**benchmark_config.decimal_palces;
    for (var i in benchmark_config.metrics_mean){
        var metric = benchmark_config.metrics_mean[i];
        summary[metric]= d3.sum(result_array, d=>{return d[metric]*d["total"]})/total_sum ;
    }

    for (var i in benchmark_config.metrics_max){
        var metric = benchmark_config.metrics_max[i];
        summary[metric]= d3.max(result_array, d=>d[metric]);
    }

    for (var i in benchmark_config.metrics_sum){
        var metric = benchmark_config.metrics_sum[i];
        summary[metric]= d3.sum(result_array, d=>d[metric]);
    }

    for (var i in benchmark_config.metrics_server){
        var metric = benchmark_config.metrics_server[i];
        summary[metric] = server_data[metric];
    }
    return summary;

}