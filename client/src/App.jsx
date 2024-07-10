import React from 'react';
import './App.css';
import { createTheme,ThemeProvider,withStyles } from '@material-ui/core/styles';
import { Paper,Grid, Typography, Divider,IconButton, Button } from "@material-ui/core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import DiscordIcon from "mdi-react/DiscordIcon";

import {
  Switch,
  Route,
} from "react-router-dom";

import RoundPanel from "./RoundPanel";
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Competition from './competition';
import ExternalPage from './external';
import LoginModule from "./LoginModule";
import Admin from './Admin';
import Setting from './Setting';
import Account from './Account';
import { RoundedCorner, Gavel, GridOn,
   Timeline,Info, Settings, LiveHelp,AccountBox,
   SupervisorAccount,Home, Assignment,Menu,
   Flag,Public, BusinessCenter,Assessment,FiberNew, People} from '@material-ui/icons';

// import banner from './images/banner-mapf.png'


const drawerWidth = 220;


let theme = createTheme({
  palette: {
    primary: {
      light: '#EEEEEE',
      main: '#FFFFFF',
      dark: '#e0e0e0',
    },
    secondary:{
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
    },
    textPrimary:{
      light: '#212121',
      main: '#212121',
      dark: '#EEEEEE',
    }
    

  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  overrides: {
    MuiPaper:{
      root:{
        opacity:0.98
      },
    },
    MuiDrawer: {
      paper: {
        backgroundColor: '#18202c',
      },
    },
    MuiButton: {
      label: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      root: {
        // marginLeft: theme.spacing(1),
        // height:10
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        // backgroundColor: theme.palette.common.white,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        marginLeft: theme.spacing(1),
        minWidth: theme.spacing(2),
        padding: 0,
        // [theme.breakpoints.up('md')]: {
        //   padding: 0,
        //   minWidth: theme.spacing(10),
        // },
      },
    },
    MuiIconButton: {
      root: {
        // padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#404854',
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
        marginRight: 0,
        '& svg': {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
    MuiGrid:{
      root:{
        margin:0
      }
    }
  },
};

const useStyles ={
  root: {
    backgroundColor:theme.palette.primary.light,
    minWidth:"100%",
    minHeight:"100vh",
    flexGrow: 1,
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper:{
    backgroundColor:theme.palette.primary.main,
    width:drawerWidth

  },
  bar_left:{
    alignItems:"center",
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  bar_right:{
    alignItems:"left",
  },
  round_panel:{
    // alignItems:"right",
    textAlign:"right",
    verticalAlign:"bottom",
  },
  menuButton:{
    marginTop:theme.spacing(1),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    width:theme.spacing(5),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  pageNmae:{
    marginTop:theme.spacing(1),
    marginLeft: theme.spacing(1),
    // width:theme.spacing(10),
    overflow:"visible"
  },
  welcome:{
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      // marginLeft: drawerWidth,
    },
    position:"fixed",
    minHeight:theme.spacing(6),
    // width:"100%",
    fontSize:25,
    // backgroundColor:theme.palette.primary.main
  },
  tab:{
    minWidth: theme.spacing(8),
    marginRight: theme.spacing(1)
  },
  tab_div:{
    width:"100%",
    justifyContents:"space-between"
  },
  content:{
    marginBottom:theme.spacing(5),
    width: "100vw",
    [theme.breakpoints.up('sm')]: {
      width: `calc(100vw - ${drawerWidth}px)`,
    },

    // paddingTop:theme.spacing(10),
  },
  drawerContents:{
    // margin: theme.spacing(0.5)
  },
  banner:{
    [theme.breakpoints.up('sm')]: {
      width: `calc(100vw - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    width:"100%",
    // [theme.breakpoints.up('sm')]: {
    //   width: `calc(100% - ${drawerWidth}px)`,
    //   marginLeft: drawerWidth,
    // },
    position: "fixed",
    // zIndex:-5
    backgroundImage:"url('./banner-mapf.jpg')",
    backgroundRepeat:"repeat",
    backgroundSize: "100% auto",
    backgroundPosition:"center top",
    backgroundBlendMode:"normal",
    backgroundColor:theme.palette.primary.light,
    height:"100%",
    overflowY: "auto",
    overflowX: "hidden",

  },
  title:{
    [theme.breakpoints.up('sm')]: {
      width: `calc(100vw - ${drawerWidth}px)`,
    },

    width:`100vw`,
    textAlign:"center",
    paddingTop: theme.spacing(15),

    paddingBottom: theme.spacing(5),
  },
  titleText:{
    // backgroundColor:"rgba(256,256,256,0.9)",
    // padding:theme.spacing(1),

  },
  titleTextContainer:{
    paddingTop:theme.spacing(2),
    paddingBottom:theme.spacing(2),
    width:"100%",
    maxWidth:theme.spacing(100),
    // paddingLeft:theme.spacing(4),
    // paddingRight:theme.spacing(4),
    display:"inline-block",
    backgroundColor:"rgba(256,256,256,0.95)",
    borderRadius:"5px",
  },
  outer: {
    // backgroundColor: theme.palette.primary.main,
    width: "100%",
    borderColor: theme.palette.grey[1000],
    borderRadius: "3px",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",          
    color: "#000",
},
};





class App extends React.Component {

  
  constructor(props) {
    super(props);
    var tab=0;
    this.pages=["/","/news","/setting","/resources","/about","/organisers"]
    this.page_names = ["Home","News","My Submission","Resources","About","Organisers"]
    this.icons = [<Home/>,<FiberNew/>,<AccountBox/>,<BusinessCenter/>,<Public/>,<People/>]

    // this.pages=["/","/news","/leaderboard","/submission","/problem","/evaluation","/instructions","/resources","/rules","/faq","/about_us","/setting","/admin"]
    // this.page_names = ["Home","News","Leaderboard","My Submission","Problem Setup","Evaluation","Instructions","Resources","Rules","FAQ","Organisers","Settings","Admin"]
    // this.icons = [<Home/>,<FiberNew/>,<GridOn/>, <AccountBox/>,<Assignment/>,<Assessment/>,<Flag/>, <BusinessCenter/>, <Gavel/> ,<LiveHelp/>,<Public/>,<Settings/>,<SupervisorAccount/>]
    for(let i=1;i<this.pages.length;i++){
      if(this.props.location.pathname.includes(this.pages[i])){
        tab = i;
        break;
      }
    }

    
    this.state = {    
      tab: tab,
      loading:false,
      login_data :undefined,
      meta_data:undefined,
      current_account:undefined,
      mobileOpen:false,
      current_round:undefined,
      active_round:undefined,
    };
  }

  nextPath(path) {
    localStorage.setItem('last_path', path);
    this.props.history.push(path);
  }
  
  handleChangeTab = (newValue) => {
    this.setState({tab: newValue,mobileOpen: false},() => {

        this.nextPath(this.pages[newValue])
      
    } );
  };

  get_meta_data = async () => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    fetch('/api/get_meta_data', requestOptions)
    .then((res)=>res.json())
    .then((body)=>{
        if (body.success){
          // let local_curr_round = JSON.parse(localStorage.getItem('current_round'));
          // let curr_round = local_curr_round? local_curr_round: body.meta_data.competitions[0]
          //sort competition in body.meta_data.competitions by _id (mongodb ObjectId), in decreasing order
          body.meta_data.competitions.sort((a,b)=>{return b._id.localeCompare(a._id)});
          let active_round = body.meta_data.competitions[0];
          for (let round of body.meta_data.competitions){
            if (round.active)
              active_round = round;
          }
          let curr_round = active_round;
          localStorage.setItem('active_round', JSON.stringify(active_round));
          localStorage.setItem('current_round', JSON.stringify(curr_round));
          this.setState({meta_data:body.meta_data, current_round:curr_round, active_round:active_round});
        }
      }
    )
  }

  set_round = (round) => {
    localStorage.setItem('current_round', JSON.stringify(round));
    this.setState({current_round:round});
  }

  //a function send get to "/api/auth/update_login_data" with "x-access-token": login_data.accessToken, and update the login_data
  update_login_data = async () => {
    if (this.state.login_data){
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' ,
        'x-access-token': this.state.login_data.accessToken}
      };
      fetch('/api/auth/update_login_data', requestOptions)
      .then((res)=>res.json())
      .then((body)=>{
          if (body.success){
            let data = {...this.state.login_data, ...body};
            console.log(data);
            this.set_login(data);
          }
          else{
            this.set_logout();
          }
        }
      )

    }
  }


  
  set_login = (data, callback=undefined)=>{

    localStorage.setItem('login_data', JSON.stringify(data));

    this.setState({login_data:data}, ()=>{
      if (callback) callback();
    });
  }

  set_logout = ()=>{
    localStorage.setItem('grid_account', null);
    localStorage.setItem('anyangle_account', null);
    localStorage.setItem('login_data', null);
    this.setState({login_data:undefined});
  } 

  login_github = async (code,state) => {
    this.setState({loading:true},()=>{
        fetch('/api/auth/github_signin', {
            method: 'POST',
            headers: {
            "Content-type": "application/json",
            },
            body: JSON.stringify({ code: code, state: state }),
        })
        .then((res)=>res.json())
        .then((body)=>{
            if (body.success){
                this.set_login(body)
            }
            else(
                this.set_logout()
            )
        })
        
    })
  };

  componentDidMount(){
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    var login_data = JSON.parse(localStorage.getItem('login_data'));
    if (hasCode){
        const data = url.split("?code=")[1].split("&state=");
        const code = data[0];
        const state = data[1];
        this.login_github(code,state);

        //go to the latest path stored in local storage
        var last_path = localStorage.getItem('last_path');
        if (last_path)
          this.nextPath(last_path);
    }
    else if(login_data == null && !hasCode){
      this.setState({login:false});
    }
    else if (login_data != null ){
        this.set_login(login_data, this.update_login_data);
    }
    this.get_meta_data();

    this.unlisten = this.props.history.listen((location, action) => {
      this.updateTab(location.pathname);
    });

  }

  componentWillUnmount() {
    this.unlisten();
}

  updateTab = (route) => {
    let tab = 0;
    for(let i=1;i<this.pages.length;i++){
      if(route.includes(this.pages[i])){
        tab = i;
        break;
      }
    }
    if (tab !== this.state.tab)
      this.setState({tab:tab});
  }

  drawerContents(){
    const { classes } = this.props;
    let range = 11;
    if (this.state.login_data!==undefined){
      range = 12;
    }
    if (this.state.login_data!==undefined && this.state.login_data.roles.includes("ROLE_ADMIN")){
      range = 13;
    }


    return(
      <div className={classes.drawerContents}>
        <List>
          <ListItem>
          <ListItemText>
            <Typography  variant="h3" aligh="left">
            <b><i>Robot</i></b>
            </Typography>
            <Typography  variant="h4" align="right">
            <u> <i><b>Runners</b></i></u>
            </Typography>

          </ListItemText>
          </ListItem>
          <Divider></Divider>
          {this.page_names.slice(0,range).map((value,index)=>{
            return(
              <ListItem key={value} button onClick={()=>{this.handleChangeTab(index)}}>
                <ListItemIcon>{this.icons[index]}</ListItemIcon>
                <ListItemText>{value}</ListItemText>
              </ListItem>
            )
            })
          }
          <Divider></Divider>

          <ListItem>
            <Button 
            variant="outlined"
            startIcon={<DiscordIcon/>}
            className={classes.outer}
            href={`https://discord.gg/CEYT4g4raR`}
            >
                <span>Find Us on Discord</span>
            </Button>
          </ListItem>

            {/* commeted login */}
          <ListItem>
            <LoginModule set_logout={this.set_logout.bind(this)} login_data={this.state.login_data} ></LoginModule>
          </ListItem>
        </List>
      </div>

    )
  }

  handleDrawerToggle = () => {
    this.setState({mobileOpen: !this.state.mobileOpen});
  };

  drawer(){
    const { classes } = this.props;
    const container = this.props.window !== undefined ? () => window().document.body : undefined;
    return (
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {this.drawerContents()}
            
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {this.drawerContents()}
          </Drawer>
        </Hidden>
      </nav>
    )
  }




  render() {
    const { classes } = this.props;
    const styles = {
      tab: {
          color: '#ffffff'
      }
    }
    return (
      <ThemeProvider theme={theme} >
        <div className={classes.root}>
          {this.drawer()}
          <div className={classes.banner}>          
            <AppBar className={classes.welcome} color="primary" position="static">
              
              <Grid  container alignItems="center" justifyContent='space-between' spacing={1}>
                <Grid item className={classes.bar_left} xs={1} sm={1} md={1} lg={1}>
                  <IconButton
                      color="default"
                      aria-label="open drawer"
                      edge="start"
                      onClick={this.handleDrawerToggle}
                      className={classes.menuButton}
                      >
                        <Menu />
                  </IconButton>
                </Grid>
                <Grid item className={classes.bar_right} xs={6} sm={5} md={3} lg={2}>
                  <Typography className={classes.pageNmae} noWrap={true} variant="h5" color='textPrimary'>
                    {this.page_names[this.state.tab]}
                  </Typography>
                </Grid>

                <Grid item className={classes.round_panel} xs={5} sm={6} md={8} lg={9}>
                  {/* <RoundPanel no_select current_round={this.state.active_round} set_round={this.set_round.bind(this)} meta_data={this.state.meta_data} ></RoundPanel>   */}

                </Grid>
              </Grid>
              {/* <Divider></Divider> */}
            </AppBar>

            <div className={classes.title}>
              <div className={classes.titleTextContainer}>
                <Typography className={classes.titleText}  variant="h5">
                <b><i>The League of</i></b>
                </Typography>
                <Typography className={classes.titleText}  variant="h3">
                <b><i>Robot Runners</i></b>
                </Typography>
                {/* <img src="./title.png" alt="banner" style={{width}}></img> */}

              </div>
              
            </div>

            <div className={classes.content}>
                <Switch>
                  {/* <Route path="/setups" component={Setups}></Route> */}
                {/* <Route path="/leaderboard" render={()=>(
                  <Competition selected_round={this.state.current_round} track={"GRID4"} tab={this.state.tab} set_logout={this.set_logout.bind(this)} login_data={this.state.login_data}>
                    <RoundPanel no_countdown current_round={this.state.current_round} set_round={this.set_round.bind(this)} meta_data={this.state.meta_data} ></RoundPanel>  
                  </Competition>)}
                  ></Route>
                <Route path="/submission" render={()=>(<Account key={"GRID4"} track={"GRID4"} tab={this.state.tab} set_logout={this.set_logout.bind(this)} login_data={this.state.login_data} />)}></Route>
                <Route path="/problem" render={()=>(<ExternalPage md page={"Competition Setup.md"} tab={this.state.tab}/>)}  key={1}></Route>
                <Route path="/evaluation" render={()=>(<ExternalPage md page={"evaluation.md"} tab={this.state.tab}/>)}  key={2}></Route> */}
                <Route path="/news" render={()=>(<ExternalPage md rawTable page={"updates.md"} tab={this.state.tab}/>)}  key={9}></Route>
                {/* <Route path="/instructions" render={()=>(<ExternalPage md page={"instructions.md"} tab={this.state.tab}/>)}  key={3}></Route>
                <Route path="/rules" render={()=>(<ExternalPage md page={"rules.md"} tab={this.state.tab}/>)}  key={4}></Route> */}
                <Route path="/resources" render={()=>(<ExternalPage md page={"resources.md"} tab={this.state.tab}/>)}  key={5}></Route>
                {/* <Route path="/faq" render={()=>(<ExternalPage md page={"faq.md"} tab={this.state.tab}/>)}  key={6}></Route> */}
                <Route path="/about" render={()=>(<ExternalPage md page={"about.md"} tab={this.state.tab}/>)}  key={7}></Route>
                <Route path="/organisers" render={()=>(<ExternalPage md page={"organisers.md"} tab={this.state.tab}/>)}  key={8}></Route>
                <Route path="/setting" render={()=>(<Setting tab={this.state.tab}  set_logout={this.set_logout.bind(this)} set_login_data={(data)=>{this.set_login(data)}}  login_data={this.state.login_data} />)}></Route>
                {/* <Route path="/admin" render={()=>(<Admin tab={this.state.tab}  login_data={this.state.login_data} />)}></Route> */}
                <Route path="/" render={()=>(
                  <div>
                      <ExternalPage news page={"short-news.html"} tab={this.state.tab}/>
                      <ExternalPage md page={"landing_page.md"} tab={this.state.tab}/>
                  </div>
                )} key={8}></Route>
              </Switch>
            </div>
          </div>
        </div>
      </ThemeProvider>


    );
  }
}



export default withStyles(useStyles,{ withTheme: true }) (App);
