module.exports={
    evaluator_id: 1,
    start_container_timeout:60*1000,//ms
    run_log_dir:"./logs/",
    run_log_stdout:"log.txt",

    copy_problems_folder:"/Users/zche0040/Codes/mapf_competition/contest-server/debug_problems/.", // with /. to only copy contents under benchmark_problems to docker 
    problems_folder:"/Users/zche0040/Codes/mapf_competition/contest-server/debug_problems",

    max_parallels:20,

    //time limit for single scenario
    benchmark_timelimit: 2.5*60*60*1000, //ms
    simulationTimeConfig: "simulation_time.json",
    planTimeLimit: 1, //s
    preprocessTimeLimit: 30*60, //s


    code_volumne_base:"/Users/zche0040/Codes/mapf_competition/contest-server/codes",// where to put codes, can be same for bench and preprocessing server
    shared_volume_base:"/Users/zche0040/Codes/mapf_competition/contest-server/data",// On preprocessing machine, where the shared data are stored.
    
    evaluation_volume:"evaluation",
    data_volume:"data",

    storage_volume:"/Users/zche0040/Codes/mapf_competition/contest-server/storage",

    compile_script:"./compile.sh",
    run_exec:"./build/lifelong",

    job_script:"./evaluator.js",
    task_per_node:1,

    version_file:"version.txt",
    start_kit_version:"1.1.5",
    unmodifiable_files:["src/ActionModel.cpp","src/Evaluation.cpp","src/Logger.cpp","src/States.cpp","src/driver.cpp",
        "src/CompetitionSystem.cpp","src/Grid.cpp","src/common.cpp", "inc/ActionModel.h","inc/Evaluation.h","inc/Logger.h","inc/SharedEnv.h","inc/Tasks.h",
        "inc/CompetitionSystem.h","inc/Grid.h","inc/States.h","inc/common.h"],
    start_kit_path: "../Start-Kit",


    metrics_collect:["numTaskFinished","sumOfCost","makespan","teamSize","AllValid"],
    main_metric:"final_score",
    track_submissions:{
        overall_best:"Overall Best",
        fast_mover:"Fast Mover",
        most_awarded: "Most Awarded"},

    dev_mode:true
}