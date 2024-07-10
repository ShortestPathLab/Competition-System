import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LoginButton from "./LoginButton";
import Typography from '@material-ui/core/Typography';
import { Paper,Grid } from "@material-ui/core";
import Input from '@material-ui/core/Input';

const config = require("./config")

const useStyles = makeStyles((theme) => ({
    
    admin:{
        width:"100%",
        height:"100%",
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
    },
    content:{
        // width:"100%",
        // height:"100%",
        padding:theme.spacing(2)
    },
    history_board:{
        // width:"100%",
        height:theme.spacing(20),
        padding:theme.spacing(2),
        overflow:"scroll"

    }
  }));

function evaluate(user_name, account_name, token, appendHistory){

    appendHistory(`Evaluate ${user_name} ${account_name} send.`)
        fetch(`/api/evaluate?username=${user_name}&account_name=${account_name}`, {
            method: 'GET',
            headers:{
                "x-access-token": token
            }
        })
        .then((res)=>res.json())
        .then((body)=>{
            appendHistory(`Evaluate ${user_name} ${account_name} response: ${JSON.stringify(body)}`)
        })
        .catch((err)=>{
            appendHistory(`Evaluate ${user_name} ${account_name} response: ${JSON.stringify(err)}`)
        })
    
}

function reset_evaluator(user_name, account_name, token, appendHistory){
    appendHistory(`Reset evaluator ${user_name} ${account_name} send.`)

    fetch(`/api/reset_evaluator?username=${user_name}&account_name=${account_name}`, {
        method: 'GET',
        headers:{
            "x-access-token": token
        }
    })
    .then((res)=>res.json())
    .then((body)=>{
        appendHistory(`Reset evaluator ${user_name} ${account_name} response: ${JSON.stringify(body)}`)
    })
    .catch((err)=>{
        appendHistory(`Reset evaluator ${user_name} ${account_name} response: ${JSON.stringify(err)}`)
    })

}

function remove_best(user_name, account_name, token, appendHistory){
    appendHistory(`Remove best ${user_name} ${account_name} send.`)

    fetch(`/api/remove_best?username=${user_name}&account_name=${account_name}`, {
        method: 'GET',
        headers:{
            "x-access-token": token
        }
    })
    .then((res)=>res.json())
    .then((body)=>{
        appendHistory(`Remove best ${user_name} ${account_name} response: ${JSON.stringify(body)}.`)
    })
    .catch((err)=>{
        appendHistory(`Remove best ${user_name} ${account_name} response: ${JSON.stringify(err)}.`)
    })

}

function create_competition(login_data,appendHistory){
    let name = document.getElementById("name").value;
    let track = document.getElementById("track").value;
    //convert start_time/end_time to DateTime
    let start_time = new Date(document.getElementById("start_time").value);
    let end_time = new Date(document.getElementById("end_time").value);
    let now = new Date();
    let new_comp = {
        name: name,
        track: track,
        start_time: start_time,
        end_time: end_time,
        active: start_time < now && now < end_time
    };
    
    console.log(JSON.stringify(new_comp))

    // post to api/create_competition
    // body: name, track, start_time, end_time
    fetch(`/api/new_competition`, {
        method: 'POST',
        headers:{
            "x-access-token": login_data.accessToken,
            "Content-Type": "application/json"
        },
        //with active = true if current time > start_time and current time < end_time
        body: JSON.stringify(new_comp)
    })
    .then((res)=>res.json())
    .then((body)=>{
        appendHistory(`Success: ${JSON.stringify(body)}`);
    }
    )
    .catch((err)=>{
        appendHistory(`Failed: ${JSON.stringify(err)}`)
    }
    )
}
    




//list all competitions from login_data.competitions
//input section to create new competitions
// a competition contains name, track, start_time (DateTime), end_time (DateTime), and active (boolean, is true if current time larger than start_time and smaller than end_time)
const CompetitionPanel = (props) => {
    const classes = useStyles();
    let appendHistory = props.appendHistory;
    return (
        <Paper elevation={10} className={classes.content}>

            {/* list competitions here */}
            {props.login_data && props.login_data.competitions &&  props.login_data.competitions.map((item, key)=>{
                return(
                <div key={item.name + item.track + toString(key)}>
                    <Typography>
                            Competition: {item.name}, Track: {item.track}, Range: {item.start_time} to {item.end_time}, Active: {item.active? "True": "False"} 
                        </Typography>
                </div>
                )
                        
            }
            )}
            
            <Typography>
                Create new competition: <br></br>
            </Typography>

            <Input id="name" placeholder="Competition Name"  />
            <br/>
            <Input id="track" placeholder="Track"  />
            <br/>
            Time here are local time:
            <br/>
            <Input id="start_time" placeholder="Start Time" type='datetime-local'  />
            <br/>
            <Input id="end_time" placeholder="End Time" type='datetime-local' />
            <br/>
            <Button  size="small"  variant="contained" onClick={()=>{create_competition(props.login_data,appendHistory)}}>Create</Button>

        </Paper>
    )
}

var account_name="";
var username = "";
export default function Admin(props) {
    
    const classes = useStyles();
    const [history,setHistory] = useState([]);

    let appendHistory = (content) =>{
        setHistory(history.concat([` ${new Date().toLocaleTimeString()}: ${content}`]))
    }


    return (
    <Grid container justifyContent="center" spacing={2} className={classes.admin}>

        <Grid item xs={12} sm={12} md={12} lg={12}>
            <Paper elevation={10} className={classes.history_board}>
                {history.map((item, key)=>{
                    return <p key={"history"+key} id={"history"+key} >{item}</p>
                })}
                
            </Paper>
        </Grid>
        
        <Grid item xs={12} sm={12} md={12} lg={12}>
            <Paper elevation={10} className={classes.content}>
                <Typography>
                    Run evaluation for: <br></br>
                </Typography>
                    <Input id="username" onChange={(e)=>{username = e.target.value}} placeholder="Username"  />
                    <Input id="account_name" onChange={(e)=>{account_name = e.target.value}} placeholder="Account Name"  />
                    <Button  size="small"  variant="contained" onClick={()=>{evaluate(username,account_name,props.login_data.accessToken, appendHistory)}}>Evaluate</Button>
                    <Button  size="small"  variant="contained" onClick={()=>{reset_evaluator(username,account_name,props.login_data.accessToken, appendHistory)}}>Reset Evaluator</Button>
                    <Button  size="small"  variant="contained" onClick={()=>{remove_best(username,account_name,props.login_data.accessToken, appendHistory)}}>Remove Best</Button>

                
            </Paper>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12}>
            <CompetitionPanel login_data={props.login_data} appendHistory={appendHistory}/>

        </Grid>

        




    </Grid>
    )
    
    
}