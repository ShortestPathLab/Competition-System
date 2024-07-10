exports.timestamp = () =>{
    return `[${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}] `  
}

exports.day = () =>{
    return `[${new Date().toISOString().split('T')[0]}] `  
}

exports.TEST_ROUND={
    _id:"test_round"
}

exports.FAILURE_STATE = {
    deploy_failed:"Deploy Code Failed",
    docker_failed:"Docker Failed",
    crashed:"Crashed",
    timeout:"Runtime Error",
    check_failed:"-check Run Failed",
    pre_failed:"-pre Run Failed",
    run_failed:"-run Run Failed",
    run_val_failed:"Run Validation Failed",
    validation_failed:"Validation Failed",
    bench_val_failed:"Benchmark Validation Failed",
    eva_crashed:"Evaluator Crashed",
    run_eva_failed:"Run Evaluation Failed",
    slurm_job_error:"Evaluation Job Error",
    none:"None",
    creat_job_failed:"Job Creating Failed",
    file_sync_failed:"Large File Sync Error"
}

exports.SUCCESS_STATE = {
    success:"Succeed",
}

exports.VALIDATION_STATE = {
    optimal:"Optimal",
    suboptimal:"Suboptimal",
    invalid:"Invalid",
}

exports.STATE= {
    deploying:"deploying",
    initiating:"initiating",
    syncing:"syncing files",
    awaiting:"awaiting resource",
    build_container:"building container",
    running:"running",
    quening:"queueing",
    idle:"idle"    
}

exports.SUB_STATE={
    queueing:"queueing",
    running:"running",
    done:"done"
}

exports.JOB_STATE= {
    debugging:"debugging",
    running:"running",
    done:"done",
    canceled:"canceled"    
}

exports.TRACK = {
    GRID4:"GRID4",
    ANYANGLE:"ANYANGLE"
}

exports.JOB_TYPE={
    DEPLOY:"DEPLOY",
    DELETE_IMAGE_DATA:"DELETE_IMAGE_DATA"
}

exports.ROLE = {
    admin:"admin",
    moderator:"moderator",
    user:"user"
}

exports.new_evaluation_data = (instance=undefined,type=undefined, data=undefined)=>{
    return {
        instance:instance,
        type:type,
        data:data,
    }
}

exports.VALID_ACTIONS={
    yes:"Yes",
    no:"No"
}

exports.LICENSE={
    "MIT": "mit.txt",
    "AGPL3":"agpl3-header.txt",
    "APACHE":"apache-header.txt",
    "BSD3":"bsd3.txt",
    "CC0" :"cc0-header.txt",
    "EPL" :"epl.txt",
    "GPL3":"gpl3-header.txt",
    "GPL2":"gpl2.txt",
    "LGPL":"lgpl.txt",
    "MPL":"mpl-header.txt",
    "CC-BY-NC": "cc_by_nc-header.txt",
}
