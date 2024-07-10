import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import InfoIcon from '@material-ui/icons/Info';
import {Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from '@material-ui/core/';
import Button  from '@material-ui/core/Button';
import { sum } from 'd3-array';


const useRowStyles = makeStyles((theme)=>({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
    progress:{
        padding:"10px"
    },
    cell:{
        maxWidth:theme.spacing(10),
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    button:{
        margin:theme.spacing(1)
    },
    itemTitle:{
        marginLeft:theme.spacing(1),
    },
    inlineTitle:{
        display:"inline"
    }
  }));

const useStyles = makeStyles((theme)=>({
    root: {
        minHeight:"100%"
    },
}));

const headCells = [
    // { id: 'name', numeric: true, disablePadding: false, label: 'Challenger', description:'The name of the algorithm.'},
    { id: 'final_score', numeric: true, disablePadding: false, label: 'Score', description:'The Score.'},
    // { id: 'Num of Task Finished', numeric: true, disablePadding: false, label: 'Tasks Finished', description:'Num of Task Finished'},
    // { id: 'Sum of Cost', numeric: true, disablePadding: false, label: 'Sum of Cost', description:'Sum of Cost'},
    // { id: 'Makespan', numeric: true, disablePadding: false, label: 'Makespan', description:'Makespan'},
    // { id: 'avg_time', numeric: true, disablePadding: false, label: 'Average Time/Path (ms)' },
    // { id: 'avg_start_time', numeric: true, disablePadding: false, label: 'Average Start Time (ms)(f20m)' },
    // { id: 'max_time_per_segment', numeric: true, disablePadding: false, label: 'Max Time (ms) (per segment)' },
    // { id: 'avg_path_length', numeric: true, disablePadding: false, label: 'Average Path Length' },
    // { id: 'avg_subopt', numeric: true, disablePadding: false, label: 'Average Suboptimality' },
    // { id: 'RAM_changes', numeric: true, disablePadding: false, label: 'Max RAM Usage' },
    // { id: 'storage', numeric: true, disablePadding: false, label: 'Max Storage' },
    // { id: 'preprocess_time', numeric: true, disablePadding: false, label: 'Precomputation Time (total min)' },
  ];

function Summary(props){
    const {data, score_details,vBest} = props;
    const classes = useStyles();
    // console.log(vBest, score_details)
    
    let keys = Object.keys(score_details);

    //sort rows by revered name string in alphabetical order
    keys.sort((a,b)=>{
        if (a == b){
        return 0
        }
        else if (a < b){
        return -1
        }
        return 1
    })


    let rows = [];
    let ttfSum = 0;
    let line_honors = [];
    let final_scores = [];
    for (let i of keys){
        let ttf = score_details[i]["my_metric"]
      rows.push({name:i, ttf:ttf, fast_mover:score_details[i]["fast_mover"] });
      line_honors.push(ttf=== vBest[i].metric ? 1:0);
      final_scores.push(vBest[i].metric === 0? 0:Math.round(ttf/vBest[i].metric * 1000)/1000);
      ttfSum += score_details[i]["my_metric"];
    }
    // console.log(rows)
    // console.log(vBest)

    return (
        <TableContainer>
              <Table className={classes.table} aria-label="simple table" component='table'>
                  <TableHead>
                  <TableRow>
                      <TableCell>Map</TableCell>
                      <TableCell>Errands</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Line Honours</TableCell>
                      <TableCell>Fast Mover</TableCell>


                  </TableRow>
                  </TableHead>
                  <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={row.name}>
                          <TableCell  component="th" scope="row">
                          {row.name}
                          </TableCell>
                          <TableCell component="th" scope="row">
                              {row.ttf}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {/* {console.log(row.ttf,vBest[row.name],row.name)} */}
                              {final_scores[index]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                              {line_honors[index]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                              {row.fast_mover ? "True":"False"}
                          </TableCell>

                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Total
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {ttfSum}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {Math.round(sum(final_scores) * 1000)/1000}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {sum(line_honors)}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {data["fast_mover"]? "True":"False"}
                        </TableCell>
                      </TableRow>

                  </TableBody>
              </Table>
            </TableContainer>
    );
        
    
}
function Row(props) {
    const { value,dt,vBest} = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();
    // console.log(value)

    return (
      <React.Fragment>
        <TableRow className={classes.root}>
            <TableCell>
                <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                    <InfoIcon/>
                </IconButton>
            </TableCell>
            <TableCell align="center">{dt.toLocaleString()}</TableCell>
            <TableCell className={classes.cell} align="center">{value.submission_status}</TableCell>
            {/* <TableCell align="center">
                <p>
                {Math.round(value.evaluated_instances/value.total_instances*100)}%
                </p>
                </TableCell> */}
            <TableCell className={classes.cell} align="left">{value.message}</TableCell>
            <TableCell className={classes.cell} align="center">{value.repo_head}</TableCell>

        </TableRow>

        <Dialog
                open={open}
                onClose={() => setOpen(!open)}
                aria-labelledby="sub-details"
                aria-describedby="sub-details-description"
            >
                <DialogTitle id="sub-details-title">
                    Submission Details
                </DialogTitle>
                
                <DialogContent>
                    <Box margin={1}>
                        <Typography  variant="subtitle1" >
                            Submission ID
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2"  >
                            {value._id}
                        </Typography>
                        <Typography  variant="subtitle1" >
                            Submission Time
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2"  >
                        {dt.toLocaleString()}
                        </Typography>
                        

                        <Typography variant="subtitle1" >
                            Submitted To:
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2"  >
                        {value.competition?value.competition.name:""}
                        </Typography>
                        <br/>
                        
                        <Typography variant="subtitle1" >
                            Status
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2" >
                        {value.submission_status}
                        </Typography>
                        <br/>
                        <Typography variant="subtitle1" >
                            Error Message
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2" >
                        {value.message}
                        </Typography>
                        <br/>
                        <Typography variant="subtitle1" >
                            Commit Info
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2" >
                        {value.repo_head}
                        </Typography>
                        <br/>

                        <Typography variant="subtitle1" >
                        {value.summary == undefined ? "":"Summary"}
                        </Typography>
                        {value.summary == undefined ? "":<Summary data={value.summary} score_details={value.score_details} vBest={vBest}></Summary>}
                        <br/>

                        <Typography variant="subtitle1">
                        Progress Logs
                        </Typography>
                        <Typography className={classes.itemTitle} variant="body2" >
                            {/* <Paper elevation={10} className={classes.progress}> */}
                            {value.progress_log != undefined ? value.progress_log.map((item,key)=>{return (<a key={key}>{item}<br/></a>)}) : ""}
                            {/* </Paper> */}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => setOpen(!open)} variant="contained" className={classes.button} autoFocus>
                    Close
                </Button>
                </DialogActions>
        </Dialog>

        
      </React.Fragment>
    );
  }
  

export default function MySubTable(props) {
    var { all_subs, virtual_best } = props;
    const classes  = useStyles()
    return (
        <Table className={classes.root}>
        <TableHead>
            <TableRow>
                <TableCell align="center">Details</TableCell>
                <TableCell align="center">Submission Time</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Error Message</TableCell>
                <TableCell align="center">Commit Info</TableCell>


            </TableRow>
        </TableHead>
        <TableBody>
        {all_subs.map((value,index)=>{
            var dt = new Date(value.date);
            let comp_id = value.competition?value.competition._id:"test_round";
            // console.log(virtual_best[comp_id]);

            return (
                <Row key={index} value={value} dt={dt} vBest={virtual_best[comp_id]}/>
            )
        })}
        </TableBody>
    </Table>
    );
  }