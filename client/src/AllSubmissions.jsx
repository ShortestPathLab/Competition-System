import React, { useState,useEffect } from 'react';
import { lighten, makeStyles } from '@material-ui/core/styles';
// import a loading spinner
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button, Typography, Table, TableHead,TableBody,TableRow,TableCell } from '@material-ui/core';
import { set } from 'mongoose';

const useStyles = makeStyles((theme) => ({
    content:{
        minHeight: 'calc(30vh - 40px)', // Adjust the value based on your layout
        //center
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width:"100%",

    },
    table:{
        //occupy the entire width winthin the flex parent div
        width:"100%",


    },
    page_button_div:{
        display:"flex",
        width:"100%",
        justifyContent:"center",
        alignContent:"center",
        alignItems:"center",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    page_button:{
        margin: theme.spacing(1),
    },

}));


function get_all_submissions(page, competition, setAllSubmissions){
    // get all submissions from backend
    // return all submissions
    fetch(`/api/all_submissions?comp_id=${competition?competition._id : undefined}&page=${page}`, {method: 'GET'})
    .then(res => res.json())
    .then(data => {
        if (data.success){
            setAllSubmissions(data.all_submissions);
        }
        else{
            console.log("Error getting all submissions");
        }
    })
}


export default function AllSubmissions(props){
    const [page, setPage] = useState(0);
    const [all_submissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const classes = useStyles();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        setLoading(true);
        get_all_submissions(newPage, props.competition, setAllSubmissions);
    };

    // if setAllSubmissions is called, setLoading(false)
    useEffect(() => {
        setLoading(false);
    }, [all_submissions]);

    useEffect(() => {
        setLoading(true);
        get_all_submissions(page, props.competition, setAllSubmissions);
    }, [props.competition]);

    return (
        <div>

        
        <div className={classes.content}>
        {/* if loading, display a loading spinner */}
        {loading && <CircularProgress color="secondary" />}
        {/* display all submissions in a material ui Table, with table head, table body, table row, table cell */}
        {!loading && <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Algorithm Name</TableCell>
                    <TableCell>Team Name</TableCell>
                    <TableCell>Submission Time</TableCell>

                </TableRow>
            </TableHead>
            <TableBody>
                {all_submissions.map((submission) => {
                    var dt = new Date(submission.date);
                    //round score to 3 decimal places
                    var score = Math.round(submission.score*1000)/1000;
                    var status =submission.success===undefined? submission.submission_status :  submission.success?"Success":"Failed";
                    return(
                    <TableRow>
                        <TableCell>{submission.score === 0?"-":score}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{submission.display_name}</TableCell>
                        <TableCell>{submission.team_name}</TableCell>
                        <TableCell>{dt.toLocaleDateString()+" "+dt.toLocaleTimeString()}</TableCell>
                    </TableRow>
                    )
                }
                )}
            </TableBody>
        </Table>
        }
        
        </div>
        {/* buttons for previous page and next page, hide previous if on page 0, high next if page empty */}
        {!loading &&
            <div className={classes.page_button_div} >
                <Button
                    className={classes.page_button}
                    variant="contained"
                    color="secondary"
                    onClick={() => handleChangePage(null, page-1)}
                    disabled={page==0}
                >
                    Previous
                </Button>
                <a> Page: {page} </a>
                <Button
                    className={classes.page_button}
                    variant="contained"
                    color="secondary"
                    onClick={() => handleChangePage(null, page+1)}
                    disabled={all_submissions.length<20}
                >
                    Next
                </Button>

            </div>
        }
        </div>
    )







}