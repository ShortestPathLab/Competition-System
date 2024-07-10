const readline = require('readline');
const fs = require('fs'); 
const { exec,spawn } = require('child_process');
const config = require("../../config")
const path = require("path")
var pidusage = require('pidusage');
const DB_tool = require('./db_tools');
const log = require('loglevel');
const docker_builder = require("../docker/docker_builder");
const run_tool = require("./run.js");
const docker_tools = require("../docker/docker_tools");
const benchmark_config = require("../../config_benchmark");
const docker_config = require("../../config_docker");

const { Resolver } = require('dns');
const config_benchmark = require('../../config_benchmark');
const utils = require("../../utils");

var task_pool = [];
const base_folder = config_benchmark.code_volumne_base;

class Deployer{
    /**
     * Deploy user code and build docker container.
     * @param {DB_tool} db_tool 
     */
    constructor(db_tool){
        this.db_tool = db_tool;
    }

    /**
     * 
     * @typedef {Object} Job
     * @property {ObjectID} submission
     * @property {ObjectID} user
     * @property {ObjectID} account
     * 
     * @param {Job} que 
     * @returns {[Boolean,String]} success, message
     */
    deploy_one = async (que) => {
        try{
           var account = await this.db_tool.get_account_by_id(que.account);
        }
        catch(e){
            return [false,e];
        }
        if (account == null){
            return [false,"Account does not exist"];
        }

        var account_id = que.account.toString();
        var code_path = path.join(base_folder,account_id);
        var repo_link = account.repo_ssh;

        let [success, msg] = await this._cloneRepo(repo_link,base_folder,code_path,account_id,que,account);
        if (!success){
            return [false,msg];
        }

        //read version.txt under code_path and check version
        var version_path = path.join(code_path,config_benchmark.version_file);
        var version = undefined;
        try{
            version = fs.readFileSync(version_path).toString();
        }
        catch(e){
            log.error(`Failed to read version file: ${e}`);
            this.db_tool.log_to_progress(que.submission,`Failed to read version file!`);
            this.db_tool.log_to_progress_private(que.submission,`Failed to read version file: ${e}`);
            return [false,`Failed to read version file: ${e}`];
        }
        //trim space \n in version and compare
        version = version.trim();
        if (version != config_benchmark.start_kit_version){
            this.db_tool.log_to_progress(que.submission,`Warning: startk-kit version ${version} is not the latest. Update to ${config_benchmark.start_kit_version} is recommended. Otherwise the evaluation may fail.`);
        }
        for (let file of config_benchmark.unmodifiable_files){
            fs.copyFileSync(path.join(config_benchmark.start_kit_path, file), path.join(code_path, file));
        }
        return [true,""]
    }

    /**
     * Build image, run container, compile codes and prepare container.
     * @param {Job} que 
     * @returns {Boolean} success
     */
    prepare_container = async (que) =>{
        var user = que.user;
        var sub = que.submission;
        var account = que.account;
        var code_path = path.join(base_folder, account.toString());
        var repo_link = account.repo_link;
        var image_name = sub.toString();
        var base_name = que.base_name;

        var problem_folder = config_benchmark.problems_folder

        // Parse apt.txt
        log.info("Parse apt.txt")
        this.db_tool.log_to_submission(sub,`Parse apt.txt`);
        var [parse_success,pkg_script,parse_error] = await docker_builder.parse_apt(path.join(code_path,docker_config.apt_file));
        if(!parse_success){
            this.db_tool.log_to_progress(sub,`Failed to parse apt.txt`);
            this.db_tool.log_to_progress_private(sub,`Failed to parse apt.txt: ${parse_error}`);
            return false;
        }
    
        var dockerfile_path = `${code_path}/Dockerfile`;
        await docker_builder.create_dockerfile(dockerfile_path,code_path,pkg_script);
        this.db_tool.log_to_submission(sub,`Building docker image`);
        
        try{
                    //build docker image
            await new Promise((resolve,reject)=>{
                docker_builder.build_image(image_name,code_path,dockerfile_path,async (success, message)=>{
                    if (!success){
                        this.db_tool.log_to_progress(sub,`Building docker image failed ${message}`);
                        this.db_tool.log_to_progress_private(sub, `Building docker image failed ${message}`)
                        log.error(`Building docker image failed ${message}`);
                        reject(false);
                        return;
                    }
                    resolve(true);
                    return
                })
            })
        }
        catch(e){
            this.db_tool.log_to_progress(sub,`Failed to build docker image`);
            this.db_tool.log_to_progress_private(sub,`Failed to build docker image: ${e}`);

            log.error(`Failed to build docker image: ${e}`);
            return false;

        }

        this.db_tool.log_to_submission(sub,`Building docker image success`);

        var container_name = image_name;
        var env = process.env;
        var mount_folder = path.join(config_benchmark.storage_volume,base_name);

        // var [pre_dir_success, precomputing_mount_volume,precomputing_data_volume] = run_tool.prepare_shared_folders(user.toString(),sub.toString());
        // if(! pre_dir_success){
        //     this.db_tool.log_to_submission(sub, `Failed to create shared volume.`)
        //     log.error(`Failed to create shared volume.`)
        //     return false;
        // }
        // mount_folder = precomputing_mount_volume;
        

        //run docker image
        this.db_tool.log_to_progress_private(sub,`Run docker container`);
        var [start_success, start_msg] = await docker_tools.start_container(image_name,container_name,mount_folder,[0]);
        if (!start_success){
            this.db_tool.log_to_progress(sub, `Run docker container failed with output`);
            this.db_tool.log_to_progress_private(sub, `Run docker container failed with output: ${start_msg}`);
            log.error(`Run docker container failed with output: ${start_msg}`);
            return false;
        }
        this.db_tool.log_to_submission(sub,`Run docker container success`);

        //compile user code
        this.db_tool.log_to_submission(sub,`Start compiling codes`,true);
        var [compile_code,compile_out,compile_err] = await run_tool.compile(container_name);
        if (compile_code!=0){
            this.db_tool.log_to_submission(sub,`Compile code failed: ${compile_out} ${compile_err}`,true);

            log.error(`Compile code failed: ${compile_out} ${compile_err}`)
            return false;
        }
        this.db_tool.log_to_submission(sub,`Run docker container success`);

        //create folders for map and scenarios
        if(!await run_tool.prepare_folders(container_name)){
            this.db_tool.log_to_submission(sub,`Prepare container path failed`,true);
            log.error(`Prepare container path failed`)
            return false;
        };

        if (!await this._prepare_instances(container_name,sub, config_benchmark.copy_problems_folder)){
            this.db_tool.log_to_submission(sub,"Failed to prepare instances and maps.",true)
            return false;
        }

        // //commit container changes to image
        // this.db_tool.log_to_progress_private(sub,`commit container changes`);
        // var [commit_success, commit_msg] = await docker_tools.commit_container(image_name,container_name);
        // if (!commit_success){
        //     this.db_tool.log_to_progress(sub, `Failed to commit container changes.`)
        //     this.db_tool.log_to_progress_private(sub, `Failed to commit container changes: ${commit_msg}`)
        //     log.error(`Failed to commit container changes: ${commit_msg}`)
        //     return false;
        // }

        this.db_tool.log_to_progress_private(sub,`Prepare docker container/image success`);

        return true;
    }

    delete_all_of = (sub_id) =>{
        var con_img_name = sub_id.toString()
        exec(`docker stop ${con_img_name}; docker rm -f ${con_img_name}`);
        exec(`docker image rm -f ${con_img_name}`);     
    }

    /**
     * 
     * @param {String} container_name 
     * @param {ObjectID} sub 
     * @returns {Boolean} success
     */
    _prepare_instances = async (container_name,sub, problem_folder) => {

        
        var [cp_code, out, err] = await docker_tools.copy_to_container(problem_folder,container_name,docker_config.problems_dir);
        if (cp_code!=0){
            this.db_tool.log_to_progress_private(sub, `Failed to copy scenarios to container: ${out} ${err}`);
            return false;
        }

        return true
        
    }

    /**
     * 
     * @param {String} repo_link 
     * @param {String} base_folder 
     * @param {String} code_path 
     * @param {String} account_id 
     * @param {Queue} que 
     * @param {Account} account 
     */
    _cloneRepo = async (repo_link,base_folder,code_path,account_id,que,account) => {

        if (! fs.existsSync(base_folder) ){
            fs.mkdirSync(base_folder);
        }
        var path_stat = undefined;
        var cmd = "";
        var branch = 'main';
        if(account.evaluate_branch!=undefined){
            branch = account.evaluate_branch
        }

        try {
            path_stat = await fs.promises.stat(code_path);
            cmd = `git -C ${code_path} reset --hard && git -C ${code_path} fetch  && git -C ${code_path} checkout ${branch} && git -C ${code_path} pull --rebase`;
            log.info("Pull updates from "+repo_link);
            this.db_tool.log_to_submission(que.submission, "Pull updates from "+repo_link,false);

        }
        catch (e) {
            cmd = `git -C ${base_folder} clone ${repo_link} ${account_id} && git -C ${code_path} checkout ${branch}`;
            log.info("Clone repo from "+repo_link);
            this.db_tool.log_to_submission(que.submission, "Clone repo from "+repo_link,false);

        }
        var [result,msg] = await new Promise((resolve,reject)=>{
            exec(cmd,(error, stdout, stderr) => {
                if (error){
                    log.error("Get codes error: ",error);
                    fs.promises.rmdir(code_path,{recursive: true});
                    this.db_tool.log_to_progress(que.submission, "Failed to clone/pull repo.");
                    this.db_tool.log_to_progress_private(que.submission, `Failed to clone/pull repo: ${error}`);

                    resolve([false, error]);
                    return;
                }
    
                var get_head = `git log -1`
                exec(get_head,{cwd:code_path},(error,stdout,stderr)=>{
                    this.db_tool.update_submission_by_id(que.submission, {repo_head: stdout});
                });
                log.info("Get codes done.");
                this.db_tool.log_to_progress_private(que.submission, "Get codes done.");
                resolve([true, ""]);
                return;
            })

        })

        return [result,msg];
    }


}

module.exports = Deployer;