import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import GithubIcon from "mdi-react/GithubIcon";

const config = require("./config")

const useStyles = makeStyles((theme) => ({
    outer: {
        backgroundColor: "#000",
        width: "100%",
        borderRadius: "3px",
        justifyContent: "center",
        display: "flex",
        alignItems: "center",          
        color: "#fff",
    },
    iner:{
        textDecoration: "none",
        color: "#fff",
        textTransform: "uppercase",
        cursor: "default",
        display: "flex",
        alignItems: "center",          
        height: "50px",
    }
  }));


export default function LoginButton() {
    const classes = useStyles();

    return(
    <Button 
    startIcon={<GithubIcon/>}
    className={classes.outer}
    href={`https://github.com/login/oauth/authorize?scope=repo:invite,user:email&client_id=${config.GITHUB_CLIENT_ID}&redirect_uri=${config.GITHUB_REDIRECT_URI}&state=gppc_2021`}
    >
        <span>Login with GitHub</span>
    </Button>
    )
}