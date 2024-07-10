// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LinearGradient, Stop } from 'recharts';

// const data = [
//   {
//     "date": "2023-01-01",
//     "instanceName1": {"score": 20, "color": "#ff0000"},
//     "instanceName2": {"score": 30, "color": "#00ff00"}
//   },
//   {
//     "date": "2023-01-02",
//     "instanceName1": {"score": 25, "color": "#0000ff"},
//     "instanceName2": {"score": 35, "color": "#ffff00"}
//   },
//   // Add more data points as needed
// ];

// const StatisticViz = () => {
//   return (
//     <LineChart width={800} height={400} data={data}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis dataKey="date" />
//       <YAxis />
//       <Tooltip />
//       <Legend />

//       {/* Map through each instance and create a Line for each */}
//       {Object.keys(data[0]).filter(key => key !== 'date').map((instanceName, index) => (
//         <Line
//           key={index}
//           type="monotone"
//           dataKey={`${instanceName}.score`}
//           name={instanceName}
//           stroke={`url(#color${index})`}
//         />
//       ))}

//       {/* Create linear gradients for each instance's color */}
//       <defs>
//       {Object.keys(data[0]).filter(key => key != 'date').map((instanceName, index) => (
//         <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="100%" y2="1">
//           <stop offset="5%" stopColor={data[0][instanceName].color} />
//           <stop offset="95%" stopColor={data[0][instanceName].color} />
//         </linearGradient>
//       ))}
//       </defs>
//     </LineChart>
//   );
// }

// export default StatisticViz;





import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Toolbar from '@material-ui/core/Toolbar';
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // fontFamily: 'LaTeX Font, Arial, sans-serif', // Replace 'LaTeX Font' with the name of the LaTeX-like font
        // margin: "auto", width: "80%",
    },
    chartContainer: {
        maxWidth: '90%',
        maxHeight: '90%',
        width: 'auto',
        height: 'auto',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
        gap: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
    },
}));


const StatisticViz = ({ overall }) => {
    const tick_size = 20;
    const classes = useStyles();
    const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Adjust the width factor as needed
    const [chartHeight, setChartHeight] = useState(400);

    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth * 0.7); // Adjust the width factor as needed
            // You can set a fixed height or calculate it based on the window size
            setChartHeight(400); // Adjust the height as needed
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);



    var date_list = [];
    var index_list = [];
    for (var i = 0; i < overall.length; i++) {
        var subi = overall[i].submissions;

        // subi.sort((a,b)=>new Date(a.sub_date)-new Date(b.sub_date));
        for (var j = 0; j < subi.length; j++) {
            if (date_list.includes(subi[j].sub_date) == false) {
                date_list.push(subi[j].sub_date);
            }
        }
    }

    const COLORS = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
        "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
        "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
        "#393b79", "#637939", "#e7cb94", "#843c39", "#5e738b",
        "#f98c28", "#474d50", "#5f9ed1", "#d73627", "#b0a18f"
    ];
    var colorx = {};
    for (var i = 0; i < overall.length; i++) {
        colorx[overall[i].name] = COLORS[i];
    }


    date_list.sort();


    for (var k = 0; k < date_list.length; k++) index_list.push(k);

    var cumulative_sumbissions_vs_time=[];
    var cumulative_submissions_team={};
    var submissions_each_day=[]
    var virtual_best_data = [];
    var current_best_score = {}
    var current_best_team = {}
    if (overall.length > 0) {
        // Iterate through the keys in A_dict and initialize corresponding keys in B_dict to 0
        for (const key in overall[0].score_details) {
            if (overall[0].score_details.hasOwnProperty(key)) {
                current_best_score[key] = -1
                current_best_team[key] = -1
            }
        }
    }
    for (var k = 0; k < date_list.length; k++) {
        var sumbssion_sum=0
        var submissions_today=0
        for (var i = 0; i < overall.length; i++) {
            var name = overall[i].name
            if(cumulative_submissions_team.hasOwnProperty(name)==false){
                cumulative_submissions_team[name]=0
                cumulative_submissions_team[name]+=overall[i].submissions.length
            }
            
            
            for (var j = 0; j < overall[i].submissions.length; j++) {
                if (overall[i].submissions[j].sub_date == date_list[k]) submissions_today++;
                if (overall[i].submissions[j].sub_date <= date_list[k]) {
                    sumbssion_sum++;
                    for (const [key, value] of Object.entries(overall[i].submissions[j].score_details)) {
                        if (value.my_metric > current_best_score[key]) {
                            current_best_score[key] = value.my_metric
                            current_best_team[key] = name
                        }
                    }
                }
            }
        }
        cumulative_sumbissions_vs_time.push({"date":date_list[k],"sum": sumbssion_sum})
        submissions_each_day.push({"date":date_list[k], "number of sumbissions":submissions_today})
        var date_data = {}
        date_data["date"] = date_list[k]
        for (const [key, value] of Object.entries(current_best_score)) {
            date_data[key] = { "score": current_best_score[key], "team": current_best_team[key], "color": colorx[current_best_team[key]], "beginPercent": k / (date_list.length - 1) * 100, "endPercent": (k + 1) / (date_list.length - 1) * 100 }

        }
        virtual_best_data.push(date_data)
    }

    console.log(virtual_best_data)
    const jsonString = JSON.stringify(virtual_best_data, null, 2);

    // Now you can save the JSON string to a file or use it as needed
    console.log(jsonString);
    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'output.json';

    // Append the link to the body
    document.body.appendChild(downloadLink);

    // Trigger a click on the link to start the download
    downloadLink.click();

    // Remove the link from the DOM
    document.body.removeChild(downloadLink);
    // fs.writeFile ("output.json", jsonString, function(err) {
    //     if (err) throw err;
    //     console.log('complete');
    //     }
    // );

    return (
        <div className={classes.container}>
            <div className={classes.chartContainer}>
                {overall && (
                    <LineChart data={virtual_best_data} width={chartWidth} height={chartHeight} margin={{ top: 5, right: 50, bottom: 5, left: 0 }}>

                        <XAxis dataKey="date" />
                        <YAxis type="number" scale="log" domain={[500, 'dataMax']} />
                        {/* <YAxis /> */}
                        <Tooltip />
                        <Legend />

                        {/* Map through each instance and create a Line for each */}
                        {/* {console.log(Object.keys(data[0]).filter(key => key != 'date'))} */}
                        {Object.keys(virtual_best_data[0]).filter(key => key != 'date').map((instanceName, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dot={false}
                                strokeWidth={4}
                                dataKey={`${instanceName}.score`}
                                // dataKey="score"
                                name={instanceName}
                                stroke={`url(#color${index})`}
                            />
                        ))}

                        {/* Create linear gradients for each instance's color */}
                        <defs>
                            {Object.keys(virtual_best_data[0]).filter(key => key != 'date').map((instanceName, index) => (
                                <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="100%" y2="1">
                                    {virtual_best_data.map((point, index) => (
                                        <React.Fragment key={index}>
                                            <stop offset={`${point[instanceName].beginPercent}%`} stopColor={point[instanceName].color} />
                                            {/* {console.log("debug begin percent", point.beginPercent)} */}
                                            <stop offset={`${point[instanceName].endPercent}%`} stopColor={point[instanceName].color} />
                                            {/* {console.log("debug end percent", point.endPercent)} */}
                                        </React.Fragment>
                                    ))}
                                    {/* <stop offset="5%" stopColor={virtual_best_data[0][instanceName].color} />
                                    <stop offset="95%" stopColor={virtual_best_data[0][instanceName].color} /> */}
                                </linearGradient>
                            ))}
                        </defs>
                    </LineChart>
                )}
            </div>
        </div>
    );



}

export default StatisticViz;