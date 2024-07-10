const { exec,execSync,spawn } = require('child_process');
const fs= require('fs');
const path=require("path")
const docker_config = require("../../config_docker");
const promisify = require("util").promisify;
const exec_p = promisify(exec);
const log = require('loglevel');

exports.start_container = async (image_name,container_name, mount_volume)=>{
    var process = spawn("docker",["run","-d","-i","--network","none",
        `--cpuset-cpus=0-${docker_config.cpu_limit-1}`,
        // "--cpus", `${docker_config.cpu_limit}`,
        "-m", `${docker_config.mem_g_per_cpu*docker_config.cpu_limit}g`, 
        "--name",`${container_name}`, 
        "--mount", `type=bind,source=${mount_volume},target=${docker_config.volume_mount_target},readonly`,
        `${image_name}`])
    msg = "";
    log.info(process.spawnargs)
    process.stdout.on("data",(data)=>{msg+=data});
    process.stderr.on("data",(data)=>{msg+=data});
    success = await new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(process.exitCode == 0)});
    })
    return [success,msg];
}

exports.start_container_on_cpus = async (image_name,container_name, mount_volume, cpu)=>{
    let cpu_string = cpu.join(",")
    var process = spawn("docker",["run","-d","-i","--network","none",
        `--cpuset-cpus=${cpu_string}`,
        // "--cpus", `${docker_config.cpu_limit}`,
        "-m", `${docker_config.mem_g_per_cpu*cpu.length}g`, 
        "--name",`${container_name}`, 
        "--mount", `type=bind,source=${mount_volume},target=${docker_config.volume_mount_target}`,
        `${image_name}`])
    msg = "";
    console.log(process.spawnargs)
    process.stdout.on("data",(data)=>{msg+=data});
    process.stderr.on("data",(data)=>{msg+=data});
    success = await new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(process.exitCode == 0)});
    })
    return [success,msg];
}

exports.start_container_no_limit = async (image_name,container_name, mount_volume)=>{
    var process = spawn("docker",["run","-d","-i","--network","none",
        // `--cpuset-cpus=${cpu_string}`,
        // "--cpus", `${docker_config.cpu_limit}`,
        // "-m", `${docker_config.mem_g_per_cpu*cpu.length}g`, 
        "--name",`${container_name}`, 
        "--mount", `type=bind,source=${mount_volume},target=${docker_config.volume_mount_target}`,
        `${image_name}`])
    msg = "";
    console.log(process.spawnargs)
    process.stdout.on("data",(data)=>{msg+=data});
    process.stderr.on("data",(data)=>{msg+=data});
    success = await new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(process.exitCode == 0)});
    })
    return [success,msg];
}

exports.commit_container = async (image_name,container_name)=>{
    var process = spawn("docker",["container","commit",
        `${container_name}`, 
        `${image_name}`])
    msg = "";
    process.stdout.on("data",(data)=>{msg+=data});
    process.stderr.on("data",(data)=>{msg+=data});
    success = await new Promise(function (resolve, reject) {
        process.addListener("close", ()=>{resolve(process.exitCode == 0)});
    })
    return [success,msg];
}


//copy the contents of src folder to container
exports.copy_to_container =  async (src, container_name, dest)=>{
    var result = await new Promise((resolve)=>{
        var p =exec(`docker cp ${src} ${container_name}:${dest}`);
        p.on("close",(code)=>{resolve([code,p.stdout.read(),p.stderr.read()])});
    });

    return result
}

//copy file from container to host
exports.copy_from_container = async (src, container_name, dest)=>{
    if (!fs.existsSync(path.dirname(dest))){
        fs.mkdirSync(path.resolve(path.dirname(dest)),{recursive:true})
    }
    var out = "";
    var err = ""
    var result = await new Promise((resolve)=>{
        var p =exec(`docker cp ${container_name}:${src} ${dest}`);
        p.stdout.on("data",(data)=>{out += data})
        p.stderr.on("data",(data)=>{err += data})
        p.on("close",(code)=>{resolve([code,out,err])});
    });

    return result
}

//get container current working directory
exports.get_pwd = async(container_name) => {
    var out = "";
    var err = ""
    var result = await new Promise((resolve)=>{
        var p =exec(`docker exec ${container_name} pwd`);
        p.stdout.on("data",(data)=>{out += data})
        p.stderr.on("data",(data)=>{err += data})
        p.on("close",(code)=>{resolve([code,out,err])});
    });

    return result
}

// exports.get_peak_mem = (container_name) => {

//     var p_id = await new Promise(function (resolve) {
//         var process = exec(`docker inspect -f '{{.State.Pid}}' ${container_name}`);
//         var std_out = "";
//         process.stdout.on("data",(data)=>{
//             std_out += data;
//         })
//         process.addListener("close", ()=>{resolve(std_out)});
//     });

//     var result = await new Promise(function (resolve) {
//         var process = exec(`grep VmPeak /proc/${p_id}/status`);
//         var std_out = "";
//         process.stdout.on("data",(data)=>{
//             std_out += data;
//         })
//         process.addListener("close", ()=>{resolve(std_out)});
//     });

//     if (result.includes("VmPeak:")){
//         var data = result.split(":")
//         var peak_mem = data[1].trim()
//         return peak_mem
//     }
//     else{
//         return "None"
//     }
// }

exports.get_container_size= async (container_name) => {

    var result = await new Promise(function (resolve) {
        var process = exec(`docker ps --filter "name=${container_name}" --format "{{.Size}}"`);
        console.log(`docker ps --filter "name=${container_name}" --format "{{.Size}}"`)
        var std_out = "";
        process.stdout.on("data",(data)=>{
            std_out += data;
        })
        process.addListener("close", ()=>{resolve(std_out)});
    });

    if (result && result.length > 0){
        var data = result.split(" ")
        var size = data[0].trim().toLowerCase()
        var size_mb = -1;
        if (size.includes("kb")){
            size_mb = Number(size.slice(0,-2)) / 1024
        }
        else if (size.includes("mb")){
            size_mb = Number(size.slice(0,-2))
        }
        else if (size.includes("gb")){
            size_mb = Number(size.slice(0,-2)) * 1024
        }
        return size_mb
    }
    else{
        return -1
    }
}

exports.delete_container = (container_name) => {
    return new Promise( (resolve,reject) =>{
        exec(`docker stop ${container_name}; docker rm -f ${container_name}`,(error)=>{resolve(true)})
    });
}

exports.stop_container = (container_name) => {
    return exec(`docker stop ${container_name};`);
}

exports.get_container_of = async (image_name) =>{
    return await exec_p(`docker ps -q -a --filter ancestor=${image_name}`);
}

exports.get_all_image_names = async () =>{
    var {stdout,stderr} =  await exec_p(`docker images --format "{{.Repository}}"`);
    return stdout.split("\n");
}

exports.is_image_name_exist = async (image_name) =>{
    var images = await exports.get_all_image_names();
    return images.findIndex(image_name) == -1;
}

exports.delete_image = async (image_name) => {
    log.info("Delete image and container of ", image_name);
    var {stdout,stderr} = await exports.get_container_of(image_name);
    var containers =stdout.split("\n")
    log.info("Find containers ", containers);
    for (let con of containers){
        await exports.delete_container(con.trim());
    }
    log.info("Delete image", image_name);
    return await exec_p(`docker image rmi -f ${image_name}`);
}

exports.clean_docker = async (image_name, container_name)=>{
    await exec(`docker stop ${container_name}; docker rm -f ${container_name}`);
    await exec(`docker image rm -f ${image_name}`);
}

