import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LinearGradient, Stop } from "recharts";

const data = {
    "instance_name1": [
        { "date": "2023-11-01", "score": 30, "color": "blue", "beginPercent": 0, "endPercent": 33.33 },
        { "date": "2023-11-02", "score": 45, "color": "red", "beginPercent": 33.333, "endPercent": 66.6660 },
        { "date": "2023-11-03", "score": 20, "color": "green", "beginPercent": 66.666, "endPercent": 100 },
        { "date": "2023-11-04", "score": 20, "color": "yellow", "beginPercent": 100, "endPercent": 100 },
        // Add more data points for instance_name1
    ],
      "instance_name2": [
        { "date": "2023-11-01", "score": 70, "color": "#0000ff", "beginPercent": 0, "endPercent": 33.33  },
        { "date": "2023-11-02", "score": 85, "color": "#ffff00", "beginPercent": 0, "endPercent": 33.33  },
        // Add more data points for instance_name2
      ],
    // Add more instances as needed
};

const StatisticViz = ({ overall }) => {
    return (
        <LineChart width={600} height={400} data={data.instance_name1} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date"  domain={['auto', 'auto']}/>
            <YAxis />
            <Tooltip />
            <Legend />

            {Object.keys(data).map((instanceName) => (
                <Line
                    key={instanceName}
                    type="monotone"
                    data={data[instanceName]}
                    dataKey="score"
                    name={instanceName}
                    stroke={`url(#color-${instanceName})`}
                />
            ))}

            <defs>
                {Object.keys(data).map((instanceName) => (

                    <linearGradient id={`color-${instanceName}`} x1="0" y1="0" x2="100%" y2="0">
                        {data[instanceName].map((point, index) => (
                            <React.Fragment key={index}>
                                <stop offset={`${point.beginPercent}%`} stopColor={point.color} />
                                {console.log("debug begin percent", point.beginPercent)}
                                <stop offset={`${point.endPercent}%`} stopColor={point.color} />
                                {console.log("debug end percent", point.endPercent)}
                            </React.Fragment>
                        ))}
                    </linearGradient>

                ))}
            </defs>







        </LineChart>
    );
};

export default StatisticViz;





// import React, { useState, useEffect } from 'react';
// import { Grid } from '@material-ui/core';
// import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
// import Toolbar from '@material-ui/core/Toolbar';
// import { Button, Typography } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';


// const useStyles = makeStyles((theme) => ({
//     container: {
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         // fontFamily: 'LaTeX Font, Arial, sans-serif', // Replace 'LaTeX Font' with the name of the LaTeX-like font
//         // margin: "auto", width: "80%",
//     },
//     chartContainer: {
//         maxWidth: '90%',
//         maxHeight: '90%',
//         width: 'auto',
//         height: 'auto',
//     },
//     buttonContainer: {
//         display: 'flex',
//         justifyContent: 'center',
//         marginTop: theme.spacing(2),
//         gap: theme.spacing(2),
//     },
//     button: {
//         margin: theme.spacing(1),
//     },
// }));


// const StatisticViz = ({ overall }) => {
//     const tick_size = 20;
//     const classes = useStyles();
//     const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Adjust the width factor as needed
//     const [chartHeight, setChartHeight] = useState(400);

//     useEffect(() => {
//         const handleResize = () => {
//             setChartWidth(window.innerWidth * 0.7); // Adjust the width factor as needed
//             // You can set a fixed height or calculate it based on the window size
//             setChartHeight(400); // Adjust the height as needed
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, []);



//     var date_list = [];
//     var index_list = [];
//     for (var i = 0; i < overall.length; i++) {
//         var subi = overall[i].submissions;

//         // subi.sort((a,b)=>new Date(a.sub_date)-new Date(b.sub_date));
//         for (var j = 0; j < subi.length; j++) {
//             if (date_list.includes(subi[j].sub_date) == false) {
//                 date_list.push(subi[j].sub_date);
//             }
//         }
//     }

//     const COLORS = [
//         "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
//         "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
//         "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
//         "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
//         "#393b79", "#637939", "#e7cb94", "#843c39", "#5e738b",
//         "#f98c28", "#474d50", "#5f9ed1", "#d73627", "#b0a18f"
//     ];
//     var colorx = {};
//     for (var i = 0; i < overall.length; i++) {
//         colorx[overall[i].name] = COLORS[i];
//     }


//     date_list.sort();


//     for (var k = 0; k < date_list.length; k++) index_list.push(k);

//     var virtual_best_data = {};
//     var current_best_score = {}
//     var current_best_team = {}
//     if (overall.length > 0) {
//         // Iterate through the keys in A_dict and initialize corresponding keys in B_dict to 0
//         for (const key in overall[0].score_details) {
//             if (overall[0].score_details.hasOwnProperty(key)) {
//                 virtual_best_data[key] = [];
//                 current_best_score[key] = -1
//                 current_best_team[key] = -1
//             }
//         }
//     }
//     for (var k = 0; k < date_list.length; k++) {
//         for (var i = 0; i < overall.length; i++) {
//             var name = overall[i].name
//             for (var j = 0; j < overall[i].submissions.length; j++) {
//                 if (overall[i].submissions[j].sub_date <= date_list[k]) {
//                     for (const [key, value] of Object.entries(overall[i].submissions[j].score_details)) {
//                         if (value.my_metric > current_best_score[key]) {
//                             current_best_score[key] = value.my_metric
//                             current_best_team[key] = name
//                         }
//                     }
//                 }
//             }
//         }
//         for (const [key, value] of Object.entries(current_best_score)) {
//             var datapoint = { "date": date_list[k], "score": current_best_score[key], "team": current_best_team[key], "color": colorx[current_best_team[key]], "beginPercent": k / (date_list.length - 1) * 100, "endPercent": (k + 1) / (date_list.length - 1) * 100 }
//             virtual_best_data[key].push(datapoint)
//         }
//     }

//     console.log(virtual_best_data)
//     var instance_key = Object.keys(virtual_best_data)
//     return (
//         <div className={classes.container}>
//             <div className={classes.chartContainer}>
//                 {overall && (
//                     <LineChart width={chartWidth} height={chartHeight} margin={{ top: 5, right: 50, bottom: 5, left: 0 }}>
//                         <XAxis dataKey="date" />
//                         <YAxis type="number" scale="log" domain={[500, 'dataMax']} />
//                         <Tooltip />
//                         <Legend />
//                         {Object.keys(virtual_best_data).map((instanceName) => (
//                             <Line
//                                 key={instanceName}
//                                 type="monotone"
//                                 data={virtual_best_data[instanceName]}
//                                 dataKey="score"
//                                 name={instanceName}
//                                 stroke={`url(#color-${instanceName})`}
//                             />
//                         ))}

//                         <defs>
//                             {Object.keys(virtual_best_data).map((instanceName) => (
//                                 <linearGradient id={`color-${instanceName}`} x1="0" y1="0" x2="100%" y2="0">
//                                     {console.log("instance Name", instanceName)}
//                                     {virtual_best_data[instanceName].map((point, index) => (
//                                         <React.Fragment key={index}>
//                                             <stop offset={`${point.beginPercent}%`} stopColor={point.color} />
//                                             <stop offset={`${point.endPercent}%`} stopColor={point.color} />
//                                         </React.Fragment>
//                                     ))}
//                                 </linearGradient>

//                             ))}
//                         </defs>
//                     </LineChart>
//                 )}
//             </div>
//         </div>
//     );



// }

// export default StatisticViz;