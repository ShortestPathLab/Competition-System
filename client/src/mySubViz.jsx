import React, { useState,useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,Label,ResponsiveContainer } from 'recharts';
import { Grid } from '@material-ui/core';
import { Button, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';



const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // minHeight: 'calc(100vh - 40px)', // Adjust the value based on your layout
      },
      chartContainer: {
        maxWidth: '100%',
        maxHeight: '100%',
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


const MySubViz = (input) => {
    const classes = useStyles();
    const tick_size=20;
    const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.5); // Adjust the width factor as needed
    const [chartHeight, setChartHeight] = useState(400);

    useEffect(() => {
        const handleResize = () => {
          setChartWidth(window.innerWidth * 0.5); // Adjust the width factor as needed
          // You can set a fixed height or calculate it based on the window size
          setChartHeight(400); // Adjust the height as needed
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, []);
    var submissions = input.data;
    var data = [];

    //data as a copy of submissions
    if (submissions != undefined) {
        data = submissions.slice();
    }
        

    data.sort((a, b) => new Date(a.date) -new Date(b.date));
    var date_list = [];
    var score_list = [];
    var makespan_list=[];
    var soc_list=[];
    var num_tasks_solved_list=[];
    for (var i = 0; i < data.length; i++) {
        

        if(data[i].success==false ||data[i].success==undefined) {
            continue;
        }
        console.log(i,data[i]);
        var dt = new Date(data[i].date);
        // date_list.push(dt.toLocaleDateString("en-US", {
        //     month: "2-digit",
        //     day: "2-digit",
        //     year: "numeric"
        // }));

        date_list.push(dt.toISOString().split('T')[0]); // Convert to ISO 8601 format (yyyy-mm-dd)

        score_list.push(data[i].summary["final_score"]);
      
        makespan_list.push(data[i].summary["Makespan"]);
        soc_list.push(data[i].summary["Sum of Cost"]);
        num_tasks_solved_list.push(data[i].summary["Num of Task Finished"]);
    }


    const score_chart = date_list.map((date, index) => {
        return {
            date: date,
            y: score_list[index]
        };
    });


    const solved_chart = date_list.map((date, index) => {
        return {
            date: date,
            y: num_tasks_solved_list[index]
        };
    });

    const makespan_chart = date_list.map((date, index) => {
        return {
            date: date,
            y: makespan_list[index]
        };
    });


 
    const soc_chart = date_list.map((date, index) => {
        return {
            date: date,
            y: soc_list[index]
        };
    });

   
   

    const [datak, setData] = useState(score_chart); // Initial data
    const [label, setLabel] = useState('Score'); // Initial label

    const handleButtonClick = (newData, newLabel) => {
        setData(newData);
        setLabel(newLabel);
    };

    return (
        <div className={classes.container}>
          
            <div className={classes.chartContainer}>
                <LineChart width={chartWidth} height={chartHeight} data={datak}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#ccc" />
                    <XAxis dataKey="date" tick={{fontSize:tick_size}}/>
                    <YAxis  tick={{fontSize:tick_size}}>
                        <Label value={label} position="insideLeft" angle={-90} />
                    </YAxis>
                    <Tooltip />
                    {/* <Legend /> */}
                    <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={3}/>
                </LineChart>
            <Grid container justifyContent="center" className={classes.buttonContainer}>
                <Button  className={classes.button} size="small" variant="outlined" color="secondary" onClick={()=>handleButtonClick(score_chart,'Score')}>Overall Best</Button>
                <Button className={classes.button} size="small" variant="outlined" color="secondary"  onClick={()=>handleButtonClick(makespan_chart,'Makespan')}>Fast Mover</Button>
                {/* <Button className={classes.button}  size="small" variant="outlined" color="secondary"  onClick={()=>handleButtonClick(soc_chart,'SOC')}>SOC</Button>
                <Button className={classes.button}  size="small" variant="outlined" color="secondary"  onClick={()=>handleButtonClick(solved_chart,'Num Tasks ')}>Task Finished</Button> */}
            </Grid>
        
            </div>
        </div>
    );
}

export default MySubViz;