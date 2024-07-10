module.exports = {
    contest_name:"MAPF2023",
    base_image: "ubuntu:jammy",
    code_path: "/MAPF2023/codes/", //where to put user codes under container
    apt_file:"apt.txt",
    working_dir:"/MAPF2023/codes/",//where the compiling happens and the run executable located.
    problems_dir: "/MAPF2023/instances/",
    volume_mount_target: "/storage", //The path to mount external volume
    cpu_limit:2,
    mem_g_per_cpu:4, //a positive integer,  gigabytes.

}