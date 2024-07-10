import React from "react";
import { Paper,Grid, Button } from "@material-ui/core";
import Account from "./Account";
import LeaderBoard from "./LeaderBoard";
import { withStyles } from "@material-ui/core/styles";
import ExternalPage from './external';


const useStyles = theme => ({
    my_head: {
    //   textAlign: 'center',
      color: theme.palette.text.primary,
    //   fontSize: 25,
      padding:theme.spacing(2)
    },
    introHead:{
        textAlign: 'center',
        width: "100%",

    },
    intro:{

    },
    competition:{
        width:"100%",
        [theme.breakpoints.down('sm') ]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
        },
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        margin:0,
        paddingTop: theme.spacing(2),
    }
  });

class Competition extends React.Component {

  
    constructor(props) {
      super(props);
    }


    render(){
        const { classes, track } = this.props;
        
        return (
        <Grid container justifyContent="center" spacing={0} className={classes.competition}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <LeaderBoard selected_round={this.props.selected_round} key={this.props.track} >{this.props.children}</LeaderBoard>
            </Grid> 
        </Grid>
        )
    }
}

export default withStyles(useStyles) (Competition);