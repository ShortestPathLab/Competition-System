import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LoginButton from "./LoginButton";
import Typography from '@material-ui/core/Typography';
import { Grid } from "@material-ui/core";
import DiscordIcon from './discord-icon.svg';
import IconButton from '@material-ui/core/IconButton';

const config = require("./config")

const useStyles = makeStyles((theme) => ({
    
    module:{
    },
    logo:{
        maxHeight:theme.spacing(4)
    },
    item:{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
    },
    itemRight:{
        textAlign:"right"
    }

  }));


export default function LoginModule(props) {
    const classes = useStyles();

    if (props.login_data === undefined){
        return(<LoginButton></LoginButton>);
    }
    else{
        return(
        <Grid direction="row" container justifyContent='space-between' spacing={1} className={classes.module}>


            <Grid item className={classes.item} xs={12} sm={12}  >
                <Typography variant="body2" noWrap={true} color="textPrimary">Hi, {props.login_data.username}</Typography>
            </Grid>
            <Grid item className={classes.item} xs={12} sm={12}  >
                <Button  size="small" color="secondary" variant="outlined" onClick={props.set_logout}>Logout</Button>
            </Grid>
               
        </Grid>
        )
    }
}