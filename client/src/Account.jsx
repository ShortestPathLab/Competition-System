import React, { useState,useEffect } from 'react';
import './App.css';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Button, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Switch from '@material-ui/core/Switch';
import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';

import MySubTable from './my_subs';
import LoginButton from './LoginButton';
import MySubViz from './mySubViz';

import Divider from '@material-ui/core/Divider';

import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import InfoIcon from '@material-ui/icons/Info';
import Grid from "@material-ui/core/Grid";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ExternalPage from './external';
import StorageModule from './Storage';

const startkit = "https://github.com/MAPF-Competition/Start-Kit"

const config = require("./config")

const StyledTabs = withStyles({
    root: {
      height:"20px",
      flexGrow: 1,
    },
    indicator: {
      display: 'float',
      height:'1px',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      '& > span': {
        width: '100%',
        backgroundColor: '#FFFFFF',
      },
    },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const useStyles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    account:{
        padding: theme.spacing(2),
        textAlign: 'center',
        marginTop:theme.spacing(2),
        minHeight: theme.spacing(40),
    },
    header:{
    },
    header_short:{
        width:"60%",
        marginRight:0,
        display:"inline-block",


    },
    viz: {
        padding: theme.spacing(2),
        textAlign: 'left',
        marginTop:theme.spacing(2),
        minHeight: theme.spacing(40),
    },
    alignLeft:{
        textAlign: 'left',
    },
    alignRight:{
        textAlign: 'right',
    },
    nickname:{
        height:theme.spacing(7),
    },
    margin: {
        margin: theme.spacing(1),
    },
    textField: {
        width: "90%",
    },
    button:{
        margin: theme.spacing(1),
    },
    button_alone:{
        margin: theme.spacing(5),
    },

    divider:{
        position:"relative",
        top:"48px"
    },
    buttonLeft:{
        margin: theme.spacing(1),
        alignItems:"center"
    },
    switchButton:{
        // float: "right",
        marginRight: theme.spacing(2),

    },
    logoutButton:{
        float: "right",
        marginLeft: theme.spacing(2),
    },
    switchLine:{
        display:"inline-block",
        width:"40%",
        textAlign:"right"
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
    require_metadata:{
        padding:theme.spacing(2),
        textAlign:"center"
    },
    layout:{
        [theme.breakpoints.down('sm')]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
            marginLeft: theme.spacing(0),
            marginRight: theme.spacing(0),
        },
        width:"100%",
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        margin:0,
        paddingTop: theme.spacing(2),
    },
    mySubs:{
        padding: theme.spacing(2),
        // margin: theme.spacing(2),
        // marginTop:theme.spacing(2),
        minHeight: "100%",
        display:"block",
        position: "relative"
    },
    refreshButton:{
        float:"right"
    },
    subsControl:{
        position:"absolute",
        bottom:0,
        right:0
    },
    instroButtons:{
        width: "100%",
        textAlign: 'center',
    
    },
    introButton:{
        textAlign: 'center',
        // width: "100%",
        margin: theme.spacing(0.2)

    },

    tab:{
        borderLeft: '1px solid #000000',
        borderRight: '1px solid #000000',
        borderTop: '1px solid #000000',
    },

    tabs:{
    
        // borderBottom: '1px solid #000000',
    },

});



class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message:"",
            nickname:"",
            no_account: false,
            status: {},  
            loading:false,
            show_submissions:false,
            show_repo_link:false,
            all_subs:[],
            virtual_best:{},
            my_subs_page:0,
            current_account:"",
            show_account_select:false,
            new_account_name:"",
            multi_cpu_p: false,
            branch_open: false,
            require_metadata: false,
            branches:[],
            tab: 0,
            show_terms: false,
            agree_terms: false,
        }
    }



/**
 *  Account loading related functions
 * 
 */

   


    valid_account=(account)=>{
        if(account===null||account===undefined ||account==="undefined"||account==='null'||account===""){
            return false;
        }
        return true;
    }


    

    set_account= () =>{
        if (this.props.login_data!==undefined && !this.valid_account(this.state.current_account)){
            
            var current_account;
            if (this.props.track === "ANYANGLE"){
                current_account = localStorage.getItem('anyangle_account');
            }
            else{
                localStorage.getItem('grid_account');
            }


            if(!this.valid_account(current_account)){
                if (this.props.track === "ANYANGLE"){
                    current_account = this.props.login_data.anyangle_accounts[0];
                    localStorage.setItem('anyangle_account',current_account);
                }
                else{
                    current_account = this.props.login_data.accounts[0];
                    localStorage.setItem('grid_account',current_account);
                }
                if (!this.valid_account(current_account)){
                    current_account = "";
                }
            }

            if (this.valid_account(current_account)){
                this.setState({current_account:current_account},()=>{this.getAccountStatus()});
            }
            else{
                this.setState({no_account:true});
            }
            
        }   
    }
    componentDidUpdate=()=>{
        if (!this.state.no_account){
            this.set_account();
        }
    }
    componentDidMount=()=>{
        if (!this.state.no_account){
            this.set_account();
        }
        this.statusTimer = setInterval(()=>{
            this.getAccountStatus();
        },30000);
    }

    componentWillUnmount=()=>{
        clearInterval(this.statusTimer);
    }

    getAccountStatus = ()=>{
        if (this.props.login_data==undefined|| !this.valid_account(this.state.current_account)){
            this.setState({all_subs:[], virtual_best:{}});
            return;
        }
        fetch(`/api/my_account?base_name=${this.state.current_account}`, {
            method: 'GET',
            headers:{
                "x-access-token": this.props.login_data.accessToken
            }
        })
        .then(res => {
            if (res.status != 200){
                this.props.set_logout();
            }
            return res.json()
        })
        .then(data => {
            var mtp = data.multi_cpu_precomputing == undefined? false: data.multi_cpu_precomputing;
 
            this.setState({status:data, loading:false, multi_cpu_p: mtp, nickname:data.nickname==undefined? "" :data.nickname}, 
                ()=>{this.fetch_my_subs(this.state.my_subs_page)});

        })
        .catch(err => {
            console.log(err);
            this.props.set_logout();
        });

    }
    

/**
 * Left Panel setting related
 */

    submitNickname = async () => {
        if (this.props.login_data === undefined){
            this.props.set_logout();
            return;
        }
        this.setState({loading:true},()=>{
            fetch('/api/save_nickname', {
                method: 'POST',
                headers: {
                "x-access-token": this.props.login_data.accessToken,
                "Content-type": "application/json",
                },
                body: JSON.stringify({ 
                    nickname: this.state.nickname,
                    base_name: this.state.current_account
                 }),
            })
            .then((res)=>res.json())
            .then((body)=>{
                var status = this.state.status;
                status.nickname = this.state.nickname;
                if (body.success){
                    this.setState({message:body.message,loading:false})
                }
                else{
                    this.setState({nickname:status.nickname==undefined? "" :status.nickname,loading:false})
                }
            })
            
        })

    };

    submitMultiP = async () => {
        if (this.props.login_data === undefined){
            this.props.set_logout();
            return;
        }
        var new_multi_cpu_p = !this.state.multi_cpu_p
        this.setState({multi_cpu_p: new_multi_cpu_p,loading:true},()=>{
            fetch('/api/save_multiPrecomputing', {
                method: 'POST',
                headers: {
                "x-access-token": this.props.login_data.accessToken,
                "Content-type": "application/json",
                },
                body: JSON.stringify({ 
                    multi_cpu_precomputing: new_multi_cpu_p,
                    base_name: this.state.current_account
                 }),
            })
            .then((res)=>res.json())
            .then((body)=>{

                if (body.success){
                    this.setState({message:body.message,loading:false})
                }
                else{
                    this.setState({multi_cpu_p:!new_multi_cpu_p, loading:false})
                }
            })
            
        })

    };

    submitNewAccount = async () => {
        if (this.props.login_data===undefined){
            this.props.set_logout();
            return;
        }
        this.setState({show_account_select:false,loading:true},()=>{
            fetch('/api/create_account', {
                method: 'POST',
                headers: {
                "x-access-token": this.props.login_data.accessToken,
                "Content-type": "application/json",
                },
                body: JSON.stringify({ 
                    account_name: this.state.new_account_name,
                    track: this.props.track,
                 }),
            })
            .then((res)=>res.json())
            .then((body)=>{
                if (body.success){
                    var status = this.state.status;
                    status.nickname = this.state.nickname;
                    var new_login_data = this.props.login_data;
                    if (this.props.track == "ANYANGLE"){
                        new_login_data.anyangle_accounts = [...new_login_data.accounts, body.base_name]
                    }
                    else{
                        new_login_data.accounts = [...new_login_data.accounts, body.base_name]
                    }
                    localStorage.setItem("login_data", JSON.stringify(new_login_data))
                    this.setState({current_account: body.base_name, login_data: new_login_data, no_account:false},
                        ()=>{
                            this.getAccountStatus();
                    })
                }
                else{
                    this.setState({message: body.message, loading:false})
                }
            })
            
        })

    };
    
    handleChange = (prop) => (event) => {
        this.setState({ ...this.state, [prop]: event.target.value });
    };

    handleEvaluate= async() =>{
        if(!this.props.login_data.meta_data ||
            !this.props.login_data.meta_data.team_name ||
            !this.props.login_data.meta_data.members ||
               !this.props.login_data.meta_data.license  ){
            this.setState({require_metadata: true});
            return;
        }
        //show terms and conditions if this.state.agree_terms is false and this.state.status.last_submission is undefined
        if (!this.state.agree_terms && (!this.state.status.last_submission || this.state.status.last_submission === "Invalid Date")){
            this.setState({show_terms:true});
            return;
        }
        if (this.props.login_data === undefined){
            this.props.set_logout();
            return;
        }

        this.setState({loading:true},()=>{
            let competition = JSON.parse(localStorage.getItem("active_round"));
            fetch(`/api/submit?base_name=${this.state.current_account}&comp_id=${competition._id}`, {
                method: 'GET',
                headers:{
                    "x-access-token": this.props.login_data.accessToken
                }
            })
            .then((res)=>res.json())
            .then((body)=>{
                if (body.success){
                    console.log(body);
                    this.getAccountStatus();
                }
                else{
                    console.log(body);
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        })
        
    }

    handleShowRepoLink(){
        this.setState({show_repo_link: !this.state.show_repo_link})
    }

    login_page(){
        const { classes } = this.props;        

        return(
            <Paper elevation={10} className={classes.account}>
                <h2>Submit</h2>
                <span>To continue, please login:</span>
                <p></p>
                <LoginButton></LoginButton>
            </Paper>
        )
    }

    viz_data(){
        return(
            <div>
                <Typography variant="h6" aligh="justify" display="inline">
                    Competitive Performance: The Visual Analysis of My Submissions
                </Typography>
                <MySubViz data={this.state.all_subs} />
            </div>
        )
    }
    

    changeAccount(e){
        const name = e.target.name;
        this.setState({current_account: name});
    }

    accountDialog(props) {
        const { classes } = this.props;
      
        const handleClose = () => {
          this.setState({show_account_select:false})
        };
      
        const handleListItemClick = (value) => {
            if (this.props.track == "ANYANGLE"){
                localStorage.setItem("anyangle_account", value);
            }
            else{
                localStorage.setItem("grid_account", value);
            }
          this.setState({current_account: value,loading:true, show_account_select:false},()=>this.getAccountStatus())
        };
        var accounts;
        if (this.props.track == "ANYANGLE"){
            accounts = this.props.login_data.anyangle_accounts
        }
        else{
            accounts = this.props.login_data.accounts
        }
      
        return (
          <Dialog onClose={handleClose} aria-labelledby="account_select_dialog" open={this.state.show_account_select}>
            <DialogTitle id="account_select_dialog">Select Account</DialogTitle>
            <List>
              {accounts.map((account, index) => (
                <ListItem button onClick={() => handleListItemClick(account)} key={account}>
                  <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={account} />
                </ListItem>
              ))}
      
              <ListItem autoFocus >
                  
                <ListItemAvatar >
                    <Avatar>
                        <IconButton disabled={this.state.new_account_name==""||this.state.new_account_name.length >=10} 
                            onClick={this.submitNewAccount.bind(this)} >
                            <AddIcon />
                        </IconButton>
                    </Avatar>
                </ListItemAvatar>
                <TextField
                    className={classes.new_account}
                    id="new_account"
                    label="New Account"
                    value={this.state.new_account_name}
                    onChange={this.handleChange('new_account_name').bind(this)}
                    />
              </ListItem>
            </List>
          </Dialog>
        );
      }

    account_page(){
        const { classes } = this.props;
        const clickSwitch = () => {
            this.setState({show_account_select:true})
          };

        const handleChange = (event) => {
            fetch('/api/setEvaluateBranch', {
                method: 'POST',
                headers: {
                "x-access-token": this.props.login_data.accessToken,
                "Content-type": "application/json",
                },
                body:JSON.stringify({
                    "base_name": this.state.current_account,
                    "branch":this.state.branches[event.target.value]})
            })
            .then((res)=>{if(res.status==200){this.getAccountStatus()}});
        };
    
        const handleClose = () => {
            this.setState({branch_open:false});
        };
    
        const handleOpen = () => {
            fetch(`/api/branches?base_name=${this.state.current_account}`, {
                method: 'GET',
                headers: {
                "x-access-token": this.props.login_data.accessToken,
                "Content-type": "application/json",
                },
            })
            .then((res)=>res.json())
            .then((body)=>{
                let names = [];
                for(let b of body){
                    names.push(b.name);
                }
                this.setState({branches:names,branch_open:true})
            });
        };

        let competition = JSON.parse(localStorage.getItem("active_round"));

        let now = new Date();
        let end = new Date(competition.end_time);
        let start = new Date(competition.start_time);
        let open = now < end && now > start;

        return(
            <Paper elevation={10} className={classes.account}>
                {
                    this.props.login_data.roles.includes("ROLE_ADMIN")? 
                    <div >
                        <div className={classes.header_short}>
                        <h3 >{this.state.current_account.toUpperCase()}</h3>
                        </div>
                        <div className={classes.switchLine}>
                        <Button size="small" className={classes.switchButton} variant="contained" onClick={()=>clickSwitch()}>Switch</Button> 
                        </div>
                    </div>
                    :
                    <div>
                        <h3 className={classes.header}>{this.state.current_account.toUpperCase()}</h3>
                    </div>
                }
                {this.accountDialog()}
                <Table>
                    <TableBody>
                        <TableRow>
                           <TableCell className={classes.alignLeft}>
                               <TextField
                                className={classes.nickname}
                                id="nickname"
                                label="Algorithm Name"
                                value={this.state.nickname}
                                onChange={this.handleChange('nickname').bind(this)}
                                variant="outlined"
                                />
                                </TableCell> 
                            <TableCell className={classes.alignRight}>
                            <Button disabled={this.state.nickname ==  this.state.status.nickname || this.state.nickname=="" }
                                className={classes.nickname} 
                                onClick={this.submitNickname.bind(this)} 
                                variant="contained" >Save</Button>
                            </TableCell>
                        </TableRow>
                    <TableRow>
                        <TableCell align="left">Evaluator Status:</TableCell>
                        <TableCell align="right">{this.state.status.status}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left">Last Submission:</TableCell>
                        <TableCell align="right">{this.state.status.last_submission ? new Date(this.state.status.last_submission).toLocaleString(): ""}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left">Total Attemps:</TableCell>
                        <TableCell align="right">{this.state.status.all_submissions ? this.state.status.all_submissions.length : 0}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><a href={this.state.status.repo_web} target='_blank'>My Repo</a></TableCell>
                        <TableCell align="right"><Button onClick={this.handleShowRepoLink.bind(this)}>Show Git Link</Button> </TableCell>
                    </TableRow>
                    {/* <TableRow>
                        <TableCell align="left">My Entry Support Multi-thread Preprocessing</TableCell>
                        <TableCell align="right"><Switch checked={this.state.multi_cpu_p} onClick={this.submitMultiP.bind(this)} name="multi_p_check" /> </TableCell>
                    </TableRow> */}
                    <TableRow>
                        <TableCell align="left">Evaluate the Branch:</TableCell>
                        <TableCell align="right">
                            <FormControl className={classes.formControl}>
                                <Select
                                open={this.state.branch_open}
                                onClose={handleClose}
                                onOpen={handleOpen}
                                value={999}
                                onChange={handleChange}
                                >
                                {
                                    this.state.branch_open?
                                        this.state.branches.map((item, index)=>{
                                            return <MenuItem value={index} key={"branch"+index}>{item}</MenuItem>
                                        }): <MenuItem value={999} >{this.state.status.evaluate_branch}</MenuItem>
                                    
                                }
                                </Select>
                            </FormControl>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell colSpan="2" align="left">
                            <a href="https://forms.gle/eFoyTFMheVFojCGW9" target="_blank">Preprocessing or Model Training Credits Application</a>
                        </TableCell>
                    </TableRow>

                    <TableRow>
                        <TableCell align="left">
                        <StorageModule login_data={this.props.login_data} base_name={this.state.current_account}></StorageModule>
                        </TableCell> 
                        <TableCell align="right">
                        {!open? 
                            <Button disabled={true}>{competition.name} not active</Button>
                            : 
                            <Button disabled={this.state.status.status == "idle" ? false:true}
                            className={classes.button}
                            variant="contained"
                            onClick={this.handleEvaluate.bind(this)}>Start Evaluation</Button>
                        }
                        </TableCell> 
                    </TableRow>

                    </TableBody>
                </Table>
               
                <Dialog aria-labelledby="must have meta data"  open={this.state.require_metadata}>
                    <Paper elevation={10} className={classes.require_metadata}>
                    <InfoIcon></InfoIcon>
                    <br></br>
                    <Typography>
                        Before evaluation, please fill in your team information and contact information, 
                        select an open source license, and write a short description for your team and submission.</Typography>
                    <br></br>
                    <Typography>Click Save All Changes Before Comming Back</Typography>
                    <Button component={Link} to="/setting" variant="contained" color="secondary" >Go</Button>
                    </Paper>
                </Dialog>

            </Paper>
        )
    }

    newAccountButton(){
        const { classes } = this.props;
        if (this.props.track == "ANYANGLE"){
            this.state.new_account_name = "AT"      
        }
        else{
            this.state.new_account_name = "GT"      
        }

        return(
            <Paper elevation={10} className={classes.account}>
                 <Button variant="contained" className={classes.button_alone} color="default"
                    onClick={this.submitNewAccount.bind(this)} >
                        Join the Track
                </Button>
            </Paper>
        )

    }


    closeSubs(){
        this.setState({show_submissions:false})
    }
    subsPre(){
        this.fetch_my_subs(this.state.my_subs_page-1);
    }
    subsNext(){
        this.fetch_my_subs(this.state.my_subs_page+1);
    }


    fetch_my_subs(page){
        if (!this.state.current_account){
            return;
        }
        if (this.props.login_data === undefined){
            this.props.set_logout();
            return;
        }
        let comp_id = JSON.parse(localStorage.getItem("current_round"))._id;
        
        fetch(`/api/my_subs?base_name=${this.state.current_account}&page=${page}`, {
            method: 'GET',
            headers:{
                "x-access-token": this.props.login_data.accessToken
            }
        })
        .then(res => {
            if (res.status != 200){
                this.props.set_logout();
            }
            return res.json()
        })
        .then(data => {
            this.setState({all_subs:data.submissions, my_subs_page:page, virtual_best:data.virtual_best})

        })
        .catch(err => {
            console.error(err);
            this.props.set_logout();
        });
    }

    intro(){
        const { classes, track } = this.props;

        return(
        <div>
            <ExternalPage page={"competition.html"} noMargin={true}> 
                <div className={classes.instroButtons}>
                    <Button className={classes.introButton} size="small" variant="outlined" color="secondary" href={"https://github.com/MAPF-Competition/Start-Kit#start-kit"}>
                        Start-Kit
                    </Button>
                    <Button className={classes.introButton} size="small" variant="outlined" color="secondary" href={"https://github.com/MAPF-Competition/MAPF_analysis#planviz"}>
                        PlanViz
                    </Button>

                </div>
            </ExternalPage>
        </div>)
    }

    displayTable(){
        const { classes } = this.props;
        return ( <div>
            <Typography variant="h6" aligh="justify" display="inline">
                My Submissions
                <Button className={classes.refreshButton} size="small" variant="outlined" onClick={()=>{this.fetch_my_subs(this.state.my_subs_page)}}>
                Refresh
                </Button>
            </Typography>
            
            <MySubTable all_subs={this.state.all_subs} virtual_best={this.state.virtual_best}></MySubTable>
            <div className={classes.subsControl}>
                <Button onClick={this.subsPre.bind(this)} variant="contained" disabled={this.state.my_subs_page===0?true:false} className={classes.buttonLeft}>
                    Previous
                </Button>
                Page: {this.state.my_subs_page}
                <Button onClick={this.subsNext.bind(this)} variant="contained" disabled={this.state.all_subs.length<10?true:false} className={classes.buttonLeft}>
                    Next
                </Button>
            </div>
            </div>);
    }

    handleTabChange = (event, newValue) => {
        this.setState({ tab: newValue });
    };

    handleShowTerms = () => {
        this.setState({ show_terms: !this.state.show_terms });
    };

    handleAgreeTerms = () => {
        this.setState({show_terms: false, agree_terms: true }, ()=>{
            // call handleEvaluate
            this.handleEvaluate();
        });
    };





    
    render() {
        // const [tab, setTab] = useState(0);    
        const { tab } = this.state;
      
        const { classes } = this.props;
        if ((this.props.login_data === undefined ||this.state.no_account) && this.state.all_subs.length !=0  ){
            this.setState({all_subs:[],virtual_best:{}})
        }
        let round = JSON.parse(localStorage.getItem("current_round"));
        return (
        <div>
            <Grid container justifyContent="center" spacing={2} className={classes.layout}>
                <Grid item xs={12} sm={12} md={12} lg={4}>
                {this.intro()}
                {/* loging commented */}
                {this.props.login_data !== undefined  ?  (this.state.no_account? this.newAccountButton():this.account_page()):this.login_page()}
                </Grid> 
                <Grid item xs={12} sm={12} md={12} lg={8}>
                    <Paper elevation={10} className={classes.mySubs}>
                    <Divider className={classes.divider} ></Divider>
                    <StyledTabs 
                        className={classes.tabs} 
                        value={tab} 
                        onChange={this.handleTabChange}  
                        aria-label="Tab" 
                        // centered
                        // indicatorColor="white"
                        >
                        <Tab className={classes.tab} label="My Submissions" />
                        <Tab className={classes.tab} label="Trends" />
                    </StyledTabs>
                    {tab==0 &&(this.displayTable())}
                    {tab==1 &&this.viz_data()}
                    </Paper>
                    
                </Grid> 
            </Grid>

            {/* <Grid container justifyContent="flex-end" spacing={2} className={classes.layout}>
                <Grid item xs={12} sm={12} md={12} lg={8}>
                    {this.viz_data()}
                </Grid>
            </Grid> */}
            

            <Backdrop className={classes.backdrop} open={this.state.loading} >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Dialog
                open={this.state.show_repo_link}
                onClose={this.handleShowRepoLink.bind(this)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Git Repo Link"}</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <a href={this.state.status.repo_web} target='_blank'>Remote repo web page</a>.
                    <br/><br/>
                    HTTP git repo link: <br/> <code>{this.state.status.repo_web}</code>
                    <br/><br/>
                    SSH git repo link: <br/> <code>{this.state.status.repo_web == undefined? "":this.state.status.repo_web.replace("https://github.com/","git@github.com:")}</code>
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={this.handleShowRepoLink.bind(this)} variant="contained" className={classes.button} autoFocus>
                    Close
                </Button>
                </DialogActions>
            </Dialog>

            {/* a dialog shows terms and conditions. Pop out the dialog if it is the first time the user click start evaluation  */}
            <Dialog
                open={this.state.show_terms}
                onClose={this.handleShowTerms.bind(this)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                {/* <DialogTitle id="alert-dialog-title">{"Terms and Conditions"}</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description"> */}
                    {/* call ExternalPage with page "rules.md" for contents*/}
                    <ExternalPage md page={"rules.md"} noMargin={true}>
                        <Button onClick={this.handleShowTerms.bind(this)} variant="contained" className={classes.button} autoFocus>
                        Close
                        </Button>
                        <Button onClick={this.handleAgreeTerms.bind(this)} variant="contained" className={classes.button} autoFocus>
                            Agree and Start Evaluation
                        </Button>
                    </ExternalPage>
                {/* </DialogContentText>
                </DialogContent>
                <DialogActions> */}
                    {/* one button close and one button agree and start evaluation */}
                
                {/* </DialogActions> */}
            </Dialog>

        </div>
    );
    }
}



export default withStyles(useStyles) (Account);

