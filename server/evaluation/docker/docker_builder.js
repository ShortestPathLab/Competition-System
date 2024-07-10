const fs = require('fs')
const readline = require('readline');
const { compileFunction } = require('vm');
const config = require('../../config');
const docker_config = require("../../config_docker")
const { exec,spawn } = require('child_process');



exports.parse_apt = async (apt_file)=>{
    error = ""
    if (!fs.existsSync(apt_file)) {
        error += "apt.txt file does not exist.\n"
        return [false,script,error]

    }

    const fileStream = fs.createReadStream(apt_file);
    const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
    });
    var packages = []
    var success = true;

    for await (const line of rl) {
        var pkg = line.split("#")[0].trim();
        if (!pkg){
            continue;
        }
        if (pkg.match("^[a-z0-9.+-]+") == null){
            error += `${pkg} is not a valid package name;\n`;
            success = false;
            continue;
        }
            
        packages.push(`"${pkg}"`)
    }
    var script = ""
    if (packages.length > 0){
        script = `
RUN apt-get -qq update
RUN ["apt-get", "install", "--yes", "--no-install-recommends", ${packages.join(",")}]
RUN apt-get -qq purge
RUN apt-get -qq clean
`
    }
    
    return [success,script,error]
}

exports.create_dockerfile = async (out_file,code_path, package_script)=>{
    var writeStream = fs.createWriteStream(out_file,{flags:"w"});
    writeStream.write(`FROM ${docker_config.base_image}\n`);
    writeStream.write(package_script);
    writeStream.write(`COPY ./. ${docker_config.code_path}\n`);
    writeStream.write(`WORKDIR ${docker_config.working_dir}\n`);
    
    return await new Promise((resolve)=>{
        writeStream.close(()=>{resolve(true)});
    })
}

exports.build_image = (image_name,code_path, dockerfile_path, call_back)=>{
    console.log(dockerfile_path)
    if (!fs.existsSync(dockerfile_path)){
        call_back(false,`Docker file do not exist.`)
        return
    }
    var cmd =  `docker build -t ${image_name} ${code_path} --no-cache`
    // var cmd =  `docker build -t ${image_name} ${code_path}`

    exec(cmd,(error,out,err)=>{
        if (error){
            console.log(error)
            console.log(err)

            call_back(false, `Docker building failed: ${error} ${err}`)
            return
        }
        call_back(true,"")
    })
}