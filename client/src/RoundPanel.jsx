import React, { useState,useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import {Typography, Select} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
        panel:{
            fontSize:16,
            // display:"inline",
            overflowX:"wrap",
            // whiteSpace:"nowrap",
            // width:"100%",
            // textAlign:"right",
            paddingRight:theme.spacing(1),
            marginLeft:"auto",
            marginRight:0,
            // alignItems:"right",
            // paddingLeft:"auto",

        },
        select:{
            marginLeft:theme.spacing(1),
            marginRight:theme.spacing(1),
            fontSize:18,
        },
        line:{
            // whiteSpace:"wrap",            
            // width:"100%",
            display:"inline-block",
            width:"auto",
            textAlign:"center",

        },
        line_a:{
            // textAlign:"center",

        }
    }));

//set_round(), current_cround from props, all_rounds from props
//example all_rounds:
// [
//     {
//         "_id": "64e5b22312038ba642c21a56",
//         "name": "2023-Main",
//         "track": "lifelong-mapf",
//         "start_time": "2023-08-16T07:15:00.000Z",
//         "end_time": "2023-09-01T07:15:00.000Z",
//         "active": true,
//     }
// ]
// display current round, have a MUI v4 selector select round, display time left for current round
export default function RoundPanel(props){
    // if props.no_countdown is not true, rerender every second
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        if (props.no_countdown)
            return;
        const interval = setInterval(() => setTime(Date.now()), 1000);
        return () => {
            clearInterval(interval);
        };
    }, [time]);
    
    const classes = useStyles();
    if (props.meta_data === undefined || props.current_round === undefined)
        return null;



    let all_rounds = props.meta_data.competitions;

    let current_end = new Date(props.current_round.end_time);
    let current_start = new Date(props.current_round.start_time);
    let now = new Date();
    let started = true;
    let t = undefined;
    if (current_start > now){
        started = false;
        t = current_start;
    }
    else{
        t = current_end;
    }

    let time_left = t - now;
    if (time_left < 0)
        time_left = 0;
    var seconds = Math.floor((time_left)/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    var comp_map = {};
    const show_countdown = ()=>{
        return(
            <div className={classes.line}>
                {started && seconds === 0 ? <a>{props.current_round.name} round ended</a> 
                    : 
                    <a className={classes.line_a}><b>
                        {started? `Current round ends in: `: `Current round starts in: `}
                        { days>0? `${days}d`:""} {hours > 0? `${hours%24}h`:""}  {minutes > 0 ?`${minutes%60}m` : `${seconds}s` }
                    </b></a>
                }
            </div>

        )

    }

    const show_select = ()=>{
        return(
            <div className={classes.line} >
                Show results for:
                <Select className={classes.select} native onChange={(e)=>{props.set_round(comp_map[e.target.value])}} value={props.current_round._id}>
                    {all_rounds.map((item,key)=>{
                        comp_map[item._id] = item;
                        return(
                            <option key={key} value={item._id}>{item.name}</option>
                        )
                    }
                    )}
                </Select>
            </div>
        )
    }
    return(
        <div className={classes.panel}>
            {props.no_select? null: show_select()}
            {props.no_countdown? null: show_countdown()}
        </div>
    )





}
