import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { LineChart, Label, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

const LeaderBoardViz = ({ overall }) => {

  const tick_size = 20;
  const classes = useStyles();
  const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Adjust the width factor as needed
  const [chartHeight, setChartHeight] = useState(400);
  const [selectedButton, setSelectedButton] = useState('score'); 

  // const [nameList, setNameList] = useState([]);


  var data=overall;


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
  for (var i = 0; i < data.length; i++) {

    var subi = data[i].submissions;

    // subi.sort((a,b)=>new Date(a.sub_date)-new Date(b.sub_date));
    for (var j = 0; j < subi.length; j++) {
      if (date_list.includes(subi[j].sub_date) == false) {
        date_list.push(subi[j].sub_date);
      }
    }
  }


  date_list.sort();



  for (var k = 0; k < date_list.length; k++) index_list.push(k);

  var scoreData = [];
  var fastMoverData = [];
  var lineHonorData = [];



  var best_scores = {};
  var best_fast_mover = {};
  var best_line_scores = {};
  const instance_dict = {};
  if (data.length > 0) {


    // Iterate through the keys in A_dict and initialize corresponding keys in B_dict to 0
    for (const key in data[0].score_details) {
      if (data[0].score_details.hasOwnProperty(key)) {
        instance_dict[key] = -1;
      }
    }
  }

  // console.log("instance_dict", instance_dict);
  for (var k = 0; k < date_list.length; k++) {

    var score_datak = { "date": date_list[k] };
    var line_honork = { "date": date_list[k] };
    var fastmoverk = { "date": date_list[k] };
    var instance_best = Object.assign({}, instance_dict);
    var instance_best_name = Object.assign({}, instance_dict);

    for (var i = 0; i < data.length; i++) {
      var name = data[i].name;
      if (best_scores[name] == undefined) {
        best_scores[name] = 0;
        best_fast_mover[name] = 0;
        best_line_scores[name] = 0;
      }
      for (var j = 0; j < data[i].submissions.length; j++) {

        if (data[i].submissions[j].sub_date == date_list[k]) {
          best_scores[name] = Math.max(data[i].submissions[j].score, best_scores[name]);
          if (data[i].submissions[j].summary.fast_mover == true)

            best_fast_mover[name] = Math.max(data[i].submissions[j].score, best_fast_mover[name]);
        }
        if (data[i].submissions[j].sub_date <= date_list[k]) {
          for (const [key, value] of Object.entries(data[i].submissions[j].score_details)) {
            if (value.my_metric > instance_best[key]) {
              instance_best[key] = value.my_metric;
              instance_best_name[key] = new Set([name]);
            }
            if (value.my_metric == instance_best[key]) {
              instance_best_name[key].add(name);
            }
          }
        }
      }
      score_datak[name] = best_scores[name];
      fastmoverk[name] = best_fast_mover[name];
    }

    // console.log("instance_best_name", instance_best_name, date_list[k], "instance best", instance_best)
    for (var i = 0; i < data.length; i++) {
      var counti = 0;

      for (const [key, value] of Object.entries(instance_best_name)) {
        for (const vn of value)
          if (vn == data[i].name) counti++;

      }
      line_honork[data[i].name] = counti;
      best_line_scores[data[i].name] = Math.max(counti, best_line_scores[data[i].name]);
    }


    lineHonorData.push(line_honork);

    fastMoverData.push(fastmoverk);

    scoreData.push(score_datak);

    //delete all-zero user


    

  }
  // console.log("BEST_FAST_MOVER",best_fast_mover);

  for (var i = 0; i < scoreData.length; i++) {
    for (const [key, value] of Object.entries(fastMoverData[i])) {
      // console.log("key=",key)
      if (best_fast_mover[key] != undefined && best_fast_mover[key] == 0) {
        // console.log("delete item", key)
        delete fastMoverData[i][key];
      }
    }
    for (const [key, value] of Object.entries(lineHonorData[i])) {
      if (best_line_scores[key] != undefined && best_line_scores[key] == 0) {
        delete lineHonorData[i][key];
      }
    }
  }

  //test if it can fix the bug


  // console.log("fastMOVER DATA",fastMoverData)

  // suport 30 distinct colors
  const COLORS = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
    "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
    "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
    "#393b79", "#637939", "#e7cb94", "#843c39", "#5e738b",
    "#f98c28", "#474d50", "#5f9ed1", "#d73627", "#b0a18f"
  ];
  var colorx = {};
  for (var i = 0; i < data.length; i++) {
    colorx[data[i].name] = COLORS[i];
  }



  const [datak, setData] = useState(scoreData); // Initial data
  const [label, setLabel] = useState("score"); // Initial label
  var lineKeys = [];
  try {
    lineKeys = Object.keys(datak[0]).filter(key => key !== 'date');
  }
  catch (e) {

  }
  console.log("line key",lineKeys)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      return (
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p>{`Date: ${label}`}</p>
        </div>
      );
    }

    return null;
  };

  console.log(datak)

  // var datak=scoreData;
  // var label="Score";
  const handleButtonClick = (newData, newLabel) => {
    
    setData(newData);
    setLabel(newLabel);
    setSelectedButton(newLabel); 

  };

  
  return (
    <div className={classes.container}>
      <div className={classes.chartContainer}>
        {datak && label && (
          <LineChart

            width={chartWidth}
            height={chartHeight}
            data={datak}
            margin={{ top: 5, right: 50, bottom: 5, left: 5 }}
          >
            <CartesianGrid stroke="#cccc" strokeDasharray="8 8" />
            <XAxis dataKey="date" tick={{ fontSize: tick_size }} />
            {/* <XAxis dataKey="x" type="number" domain={[0,index_list.length-1]}x={index_list}ticks={index_list}tickFormatter={(tick)=>date_list[tick]}/> */}
            <YAxis tick={{ fontSize: tick_size }}>
              <Label value={label} position="insideLeft" angle={-90} fontSize={20} />

            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            {/* <Tooltip /> */}
            <Legend />
            {lineKeys.map((lineKey, index) => (
              <Line
                key={lineKey}
                type="monotone"
                dataKey={lineKey}
                name={lineKey}
                stroke={colorx[lineKey]}
                strokeWidth={4}
                style={{ zIndex: 2 }}
                animationBegin={500}
                animationDuration={3000}
                dot={false} // Disable the markers
              />
            ))}
          </LineChart>
        )}
        <Grid container justifyContent="center" className={classes.buttonContainer}>
          <Button className={classes.button} size="small" variant="outlined"  color="secondary"   onClick={() => { handleButtonClick(scoreData, 'Overall Best') }}>Overall Best</Button>
          <Button className={classes.button} size="small" variant="outlined" color="secondary"  onClick={() => { handleButtonClick(fastMoverData, 'Fast Mover') }}>Fast Mover</Button>
          <Button className={classes.button} size="small" variant="outlined" color="secondary"  onClick={() => { handleButtonClick(lineHonorData, 'Line Honors') }}>Line Honours</Button>
        </Grid>
      </div>
    </div>
  );
};

export default LeaderBoardViz;
