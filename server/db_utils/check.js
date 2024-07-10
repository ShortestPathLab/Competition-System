const DB_tools = require("../evaluation/gppc_evaluation/db_tools");
const config_benchmark = require('../config_benchmark');


var db = new DB_tools();

let sub_id = "62d82cc918c9ef1984317c14"
// let sub_id = "62d82beb18c9ef1984317bce"

db.get_evaluation_data_by_id(sub_id).then(
    async (sub)=>{
        let all_results = sub.evaluation_data;
        let server_data = sub.precomputing_data;

        let d3 = await import('d3-array');
    
        for (let i in all_results) {
            all_results[i]["RAM_changes"] = all_results[i]["RAM_after"]-all_results[i]["RAM_before"];
        }
        var server_data_array = Object.values(server_data);
        var result_array = Object.values(all_results)
        var summary = {};
        var total_sum = d3.sum(result_array, d=>d["total"]);

        for (let i in config_benchmark.metrics_mean_int){
            let metric = config_benchmark.metrics_mean_int[i];
            summary[metric]= Math.floor(d3.sum(result_array, d=>{return d[metric]*d["total"]})/total_sum) ;
        }

        for (let i in config_benchmark.metrics_mean_float){
            let metric = config_benchmark.metrics_mean_float[i];
            summary[metric]= d3.sum(result_array, d=>{return d[metric]*d["total"]})/total_sum ;
        }
    
        for (let i in config_benchmark.metrics_max){
            let metric = config_benchmark.metrics_max[i];
            summary[metric]= d3.max(result_array, d=>d[metric]);
        }
    
        for (let i in config_benchmark.metrics_sum){
            let metric = config_benchmark.metrics_sum[i];
            summary[metric]= d3.sum(result_array, d=>d[metric]);
        }
    
        for (let i in config_benchmark.metrics_server){
            let metric = config_benchmark.metrics_server[i];
            summary[metric] = d3.sum(server_data_array, d=>d[metric]);
        }
        console.log(summary);
    }
)


