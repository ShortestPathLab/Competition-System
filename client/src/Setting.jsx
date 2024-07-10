import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import LoginButton from "./LoginButton";
import Typography from '@material-ui/core/Typography';
import { Paper,Grid, Table, TableRow, TableCell, TableBody,Checkbox } from "@material-ui/core";
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import { TextField } from '@material-ui/core';

const config = require("./config")

const useStyles = makeStyles((theme) => ({
    
    setting:{
        width:"100%",
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        margin:0,
        paddingTop: theme.spacing(2),
    },
    header:{
        width:"100%"
    },
    content:{
        // width:"100%",
        // height:theme.spacing(20),
        paddingLeft:theme.spacing(4),
        paddingRight:theme.spacing(4),
        paddingTop:theme.spacing(4),
        paddingBottom:theme.spacing(4),
        textAlign:"center",

    },
    cell: {
        borderBottom: "none",
        textAlign: "left",
        width:"50%",
        whiteSpace:"pre-line",
      },
    description:{
        width:"100%",
        marginTop:theme.spacing(1),
    },
    table:{
    },
    login:{
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
        padding: theme.spacing(10),
        minHeight: "30vh",
        alignContent: "center",
    },
    login_button:{
        maxWidth:"400px",
        margin:"auto",
    },
    title:{
        margin: "auto"
    }
  }));

function login_page(classes){
    return(
        <Paper elevation={10} className={classes.login}>
            <div className={classes.login_button}>
            <span>To continue, please login:</span>
            <p></p>
            <LoginButton></LoginButton>
            </div>
        </Paper>
    )
}

export default function Setting(props) {
    
    const classes = useStyles();
    const [userContact, setUserContact] = useState({"contact_email":"", "subscribe":false});
    const [serverUserContact, setServerUserContact] = useState({"contact_email":"", "subscribe":false});
    //if logged in or when logged in fetch user contact information from /api/get_contact_email
    useEffect(() => {
        if (props.login_data){
            fetch('/api/get_contact_email', {
                method: 'GET',
                headers: {
                "x-access-token": props.login_data.accessToken,
                "Content-type": "application/json",
                },
            })
            .then((res)=>res.json())
            .then((body)=>{
                if (body.success){
                    setUserContact(body.userContact);
                    setServerUserContact(body.userContact);
                }
                else{
                    props.set_logout();
                }
            })
        }
    }, [props.login_data]);

    var handleChange = (key,value)=>{
        let data = userContact;
        data[key] = value;
        setUserContact({...data});
    }

    // var addMember = ()=>{
    //     let data = userContact;
    //     if (!data.members)
    //         data.members = [];
    //     data.members.push({name:"",email:""});
    //     setUserContact({...data});
    // }

    var saveChanges = ()=>{
        //check if all members are valid, at least one member
        // if (userContact.members){
        //     for (let i=0;i<userContact.members.length;i++){
        //         if (userContact.members[i].name === "" || userContact.members[i].email === ""){
        //             alert("Please fill in all the member's name and email");
        //             return;
        //         }
        //         //check if email is valid
        //         if (!userContact.members[i].email.includes("@")){
        //             alert("Please fill in a valid email");
        //             return;
        //         }

        //     }
        // }else{
        //     alert("Please add at least one member");
        //     return;
        // }

        //check if team name is filled and if license is selected
        // if (userContact.team_name === "" || userContact.license === ""){
        //     alert("Please fill in all required the fields");
        //     return;
        // }
        
        fetch('/api/set_contact_email', {
            method: 'POST',
            headers: {
            "x-access-token": props.login_data.accessToken,
            "Content-type": "application/json",
            },
            body: JSON.stringify(userContact),
        }) //alert if error
        .then((res)=>res.json())
        .then((body)=>{
            if (!body.success){
                alert("Error saving changes: "+body.message||"");
            }
            else{
                setServerUserContact(userContact);                
            }
        })

    }

    if (!props.login_data)
    return(login_page(classes));

    // var license_template=undefined;
    // if ( props.login_data.license_templates !== undefined && props.login_data.license_templates[userContact.license]!= undefined){
    //     license_template = props.login_data.license_templates[userContact.license];
    //     license_template = license_template.replaceAll("{{ organization }}", userContact.organisation_name||"");
    //     license_template = license_template.replaceAll("{{ year }}", (new Date).getFullYear());
    //     license_template = license_template.replaceAll("{{ project }}", userContact.project_name||"");

    // }

    return(
        <Grid container justifyContent="center" spacing={2} className={classes.setting}>
            <Grid item xs={12} sm={10} md={10} lg={10}>
                <Paper elevation={10} className={classes.content}>
                    <Grid container spacing={2} alignItems="center" alignContent="space-between" justifyContent="space-between" className={classes.header}>
                        <Grid item xs={12}>
                            <h2 className={classes.title}>🚀 The 2024 League of Robot Runners is coming soon... 🤖</h2>                            <Table>
                                <TableBody>
                                    <TableRow>
                                    <TableCell component="th" scope="row">
                                        <Typography variant="body1">Your contact email:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                        fullWidth
                                        placeholder="Contact Email"
                                        color="secondary"
                                        value={userContact.contact_email}
                                        type="email"
                                        onChange={(event) => handleChange("contact_email", event.target.value)}
                                        />
                                    </TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell component="th" scope="row">
                                        <Typography variant="body1">Subscribe to the latest updates on 2024 competition:</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                        color="secondary"
                                        checked={userContact.subscribe}
                                        onChange={(event) => handleChange("subscribe", event.target.checked)}
                                        />
                                    </TableCell>
                                    </TableRow>
                                </TableBody>
                                </Table>
                        </Grid>
                        <Grid item xs={12} style={{textAlign: "right"}}>
                            <Button onClick={saveChanges} size="small" variant="outlined" color='secondary' disabled={userContact===serverUserContact}>Save Changes</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    

    )

    // return (
    // <Grid container justifyContent="center" spacing={2} className={classes.admin}>
    //     <Grid item xs={12} sm={10} md={10} lg={10}>
    //         <Paper elevation={10} className={classes.Liscense}>
    //             <Grid container spacing={2} alignItems="center" alignContent="space-between" justifyContent="space-between" className={classes.header}>
    //                 <Grid item xs={7}>
    //                     <h2>About This Page</h2>
    //                 </Grid>
    //                 <Grid item xs={5} style={{textAlign: "right"}}>
    //                     <Button onClick={saveChanges} size="small" variant="outlined" color='secondary' disabled={metaData===props.login_data.meta_data}>Save All Changes</Button>
    //                 </Grid>
    //             </Grid>
    //             <Typography> 
    //                 This page records the team information, contacts and license information for your team and your submissions. 
    //                 The "*" items are required for submission evaluation.
    //             </Typography>

    //             <Typography>
    //                 <b>Click the "Save All Changes" button to save any changes you made.</b>
    //             </Typography>
    //         </Paper>
    //     </Grid>
    //     <Grid item xs={12} sm={10} md={10} lg={10}>
    //         <Paper elevation={10} className={classes.Liscense}>
    //             <h2>Team Information</h2>
    //             <Typography>
    //                 The information regarding your team and submissions. 
    //                 Each team should have at least one member.
    //                 We will reach you or sending announcements through the provided email for each team member.
    //             </Typography>


    //             <Table size="small" >
    //                     <TableBody>

    //                     <TableRow>
    //                         <TableCell className={classes.cell}>Team Name:* </TableCell>
    //                         <TableCell className={classes.cell}>
    //                         <Input
    //                             color={"secondary"}
    //                             value = {metaData.team_name|| ''}
    //                             onChange={(event)=>{handleChange("team_name",event.target.value)}}
    //                         >
    //                         </Input>
    //                         </TableCell>
    //                     </TableRow>
                        

    //                     <TableRow>
    //                             <TableCell className={classes.cell}>Affiliations: </TableCell>
    //                             <TableCell className={classes.cell}>
    //                                 <Input
    //                                     color={"secondary"}
    //                                     value = {metaData.affiliation|| ''}
    //                                     onChange={(event)=>{handleChange("affiliation",event.target.value)}}
    //                                 >
    //                                 </Input>
    //                             </TableCell>
                                
    //                         </TableRow>

    //                         <TableRow>
    //                             <TableCell className={classes.cell}>Countries: </TableCell>
    //                             <TableCell className={classes.cell}>
    //                                 <Input
    //                                     color={"secondary"}
    //                                     value = {metaData.country|| ''}
    //                                     onChange={(event)=>{handleChange("country",event.target.value)}}
    //                                 >
    //                                 </Input>
    //                             </TableCell>
                                
    //                         </TableRow>
    //                         <TableRow>
    //                         <TableCell className={classes.cell}>
    //                             Team Members and Contacts:* 
    //                         </TableCell>
    //                         <TableCell className={classes.cell}>
    //                             <Button onClick={addMember} size="small" variant="outlined" color='secondary'>Add Member</Button>
    //                         </TableCell>
    //                     </TableRow>
    //                     </TableBody>
    //                 </Table>
    //                     {/* example data in metaData.members=[{name:zhe,email:zhe@xx.xx}]
    //                      inputs to edit the name and email for each member, then with a button to add member
    //                      */}
    //                 <Table size="small" >
    //                     <TableBody>
                        
    //                      {metaData.members && metaData.members.map((member,index)=>{
    //                             return(
    //                                 <TableRow key={index}>
    //                                     <TableCell className={classes.cell}>
    //                                         Name: &nbsp;
    //                                         <Input
    //                                             label="Name"
    //                                             color={"secondary"}
    //                                             value = {member.name|| ''}
    //                                             onChange={(event)=>{
    //                                                 let data = metaData;
    //                                                 data.members[index].name = event.target.value;
    //                                                 setMetaData({...data})
    //                                             }}
    //                                         >
    //                                         </Input>
    //                                     </TableCell>
    //                                     <TableCell className={classes.cell}>
    //                                         Email: &nbsp;
    //                                         <Input
    //                                             label="Email"
    //                                             type='email'
    //                                             color={"secondary"}
    //                                             value = {member.email|| ''}
    //                                             onChange={(event)=>{
    //                                                 let data = metaData;
    //                                                 data.members[index].email = event.target.value;
    //                                                 setMetaData({...data})
    //                                             }}
    //                                         >
    //                                         </Input>
    //                                     </TableCell>
    //                                     {/* with a button to delete the member */}
    //                                     <TableCell className={classes.cell}>
    //                                         <Button onClick={()=>{
    //                                             let data = metaData;
    //                                             data.members.splice(index,1);
    //                                             setMetaData({...data})
    //                                         }} size="small" variant="outlined" color='secondary'>Delete</Button>
    //                                     </TableCell>
    //                                 </TableRow>
    //                             )
    //                      }
    //                     )}
    //                     </TableBody>
    //                 </Table>
                

                

    //             <Typography>
    //                 Short description to your team and submissions:
    //             </Typography>
    //             <TextField 
    //             className={classes.description} id="outlined-basic" 
    //             label="Tell us about your submissions*" 
    //             variant="outlined" 
    //             value={metaData.description||''} multiline={true}
    //             onChange={(event)=>{handleChange("description",event.target.value)}}
    //             />

    //         </Paper>
    //     </Grid>

    //     <Grid item xs={12} sm={10} md={10} lg={10}>
    //         <Paper elevation={10} className={classes.Liscense}>
    //             <h2>License</h2>
    //             <Typography>
    //             All submissions will be released under an open source license after the competition.

    //             Select an open source license for your submissions here:
    //             </Typography>
    //             <Table size="small" >
    //                 <TableBody>
    //                 <TableRow>
    //                         <TableCell className={classes.cell} >Select License:* </TableCell>
    //                         <TableCell className={classes.cell} >
    //                             <Select
    //                             native
    //                             color={"secondary"}
    //                             value={metaData.license|| ''}
    //                             onChange={(event)=>{handleChange("license",event.target.value)}}
    //                             >
    //                             <option aria-label="None" key={0} value={undefined}>Please Select</option>
    //                             {Object.keys(props.login_data.license_options).map(function(key, index) {
    //                                 return(<option key={index+1} value={key}>{key}</option>)
    //                             })}
    //                             </Select>
    //                         </TableCell>
    //                     </TableRow>
    //                     <TableRow>
    //                         <TableCell className={classes.cell}>Organisation/Author Name: </TableCell>
    //                         <TableCell className={classes.cell}>
    //                             <Input
    //                                 color={"secondary"}
    //                                 value = {metaData.organisation_name|| ''}
    //                                 onChange={(event)=>{handleChange("organisation_name",event.target.value)}}
    //                             >
    //                             </Input>
    //                         </TableCell>
    //                     </TableRow>
    //                     <TableRow>
    //                         <TableCell className={classes.cell}>Project Name: </TableCell>
    //                         <TableCell className={classes.cell}>
    //                             <Input
    //                                 color={"secondary"}
    //                                 value = {metaData.project_name|| ''}
    //                                 onChange={(event)=>{handleChange("project_name",event.target.value)}}
    //                             >
    //                             </Input>
    //                         </TableCell>
    //                     </TableRow>
    //                     <TableRow>
    //                         <TableCell className={classes.cell}>
    //                             License Preview:
    //                          </TableCell>
    //                         <TableCell className={classes.cell}>{license_template}</TableCell>
    //                     </TableRow>

    //                 </TableBody>
    //             </Table>

                

    //         </Paper>
    //     </Grid>

        
        
    //     {/* <Grid item xs={12} sm={12} md={12} lg={12}>
    //         <Paper elevation={10} className={classes.content}>
            
    //         </Paper>
    //     </Grid> */}
    // </Grid>
    // )
    
    
}