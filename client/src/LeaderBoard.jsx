import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core/';
import InfoIcon from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';

import LeaderBoardViz from './leaderBoardViz';
import StatisticViz from './statistics';
import AllSubmissions from './AllSubmissions';

// function createData(rank,user, score, done,runtime, sub_date) {
//   return { rank, user, score, done,runtime, sub_date  };
// }
// const AntTabs = withStyles((theme)=>({
//   root: {
//     borderBottom: '1px solid #FFFFFF',
//   },
//   indicator: {
//     backgroundColor: '#000000',
//   },
// }))((props) => <Tabs {...props} />);
const StyledTabs = withStyles({
  root: {
    height: "20px",
    flexGrow: 1,
  },
  indicator: {
    display: 'float',
    height: '1px',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    '& > span': {
      width: '100%',
      backgroundColor: '#FFFFFF',
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
    // marginRight: theme.spacing(2),
    // marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(2),
    // marginLeft: theme.spacing(2),
  },
  paper: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      margin: theme.spacing(1),
    },
    padding: theme.spacing(4),
    margin: theme.spacing(2),
    // maxHeight:"70vh"


  },
  competition_selector: {
    textAlign: "right",
    width: "100%",
    display: "inline",
  },
  tabs: {
    width: "100%",

    // borderBottom: '1px solid #000000',
  },
  tab: {

    borderLeft: '1px solid #000000',
    borderRight: '1px solid #000000',
    borderTop: '1px solid #000000',
    // borderBottom: '1px solid #000000', // Black bottom border line
    // '&$selected': {
    //   borderBottomColor: '#FFFFFF', // Transparent bottom border for the selected tab
    // },

  },
  divider: {
    position: "relative",
    top: "48px"
  },
  tabSelected: {
    // borderBottomColor: '#FFFFFF'
  },
  table: {
    width: "100%",

  },
  headText: {
    verticalAlign: "top"
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
  virtualBest: {
    // backgroundColor: theme.palette.grey[200],
    width: "100%",
  },
  virtualBestTitle: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    //element space-between, go to two sides
    display: "flex",
    justifyContent: "space-between",
    // maxHeight:theme.spacing(2)
  },
  title: {
    display: "inline",
    //nowrap
    whiteSpace: "nowrap",
  }

}));

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'final_score', numeric: true, disablePadding: false, align: "center", label: 'Score', description: 'The Score.' },
  { id: 'name', numeric: false, disablePadding: false, align: "center", label: 'Algorithm Name', description: 'The name of the algorithm.' },
  { id: 'team_name', numeric: false, disablePadding: false, align: "center", label: 'Team Name', description: 'The name of the team.' },

  // { id: 'Num of Task Finished', numeric: true, disablePadding: false, label: 'Tasks Finished', description:'Num of Task Finished'},
  // { id: 'Sum of Cost', numeric: true, disablePadding: false, label: 'Sum of Cost', description:'Sum of Cost'},
  // { id: 'Makespan', numeric: true, disablePadding: false, label: 'Makespan', description:'Makespan'},
  // { id: 'total_time', numeric: true, disablePadding: false, label: 'Total Time (s)' , description:'This is the total time to find the solution to all problems.'},
  // { id: 'avg_time', numeric: true, disablePadding: false, label: 'Average Time per Path (ns)' , description:'This is the average time in nanoseconds to find a single path.'},
  // { id: 'avg_start_time', numeric: true, disablePadding: false, label: 'Average Start Time (ns) ' , description:'This is the average time in nanoseconds to find the first 20 steps of a path. This measures how quickly a path is available to follow, which is important in real-time applications such as games or robotics.'},
  // { id: 'max_time_per_segment', numeric: true, disablePadding: false, label: 'Average Max Time per Segment (ns)' , description:'This is the average of the maximum time required to produce any individual segment (any part of a start-to-target path, for example, a single action, a set of actions, or the complete path.). This measures the worst-case real-time performance.'},
  // { id: 'avg_path_length', numeric: true, disablePadding: false, label: 'Average Path Length' , description:'This is the average length of a returned path. If an entry is optimal on long paths and suboptimal on short paths this will be close to the average length, since most of the length comes from the longest paths.'},
  // { id: 'avg_subopt', numeric: true, disablePadding: false, label: 'Average Suboptimality' , description:'This is the average suboptimality of each path. If an entry is optimal on long paths and highly sub-optimal on short paths this measure will be large since most paths are short paths.'},
  // { id: 'RAM_changes', numeric: true, disablePadding: false, label: 'Max RAM Usage (MB)' , description:'The memory usage in MB after running the full problem set of a map minus the memory usage before running.'},
  // { id: 'storage', numeric: true, disablePadding: false, label: 'Max Storage (MB)' , description:'This is the disk space used for all the precomputed storage.'},
  // { id: 'preprocess_time', numeric: true, disablePadding: false, label: 'Precomputation Time (min)' , description:'This is the time (in minutes) required for the full pre-computation. Entries that perform parallel pre-computation are marked with a † in the results table in the next section.'},
  { id: 'date', numeric: false, disablePadding: false, align: "center", label: 'Achieved Date', description: 'Submission time on your local time' },
];

const defaultDominanceKey = new Set(["total_time", "avg_time", "avg_start_time", "max_time_per_segment", "avg_subopt", "preprocess_time"]);

const eps = 0.00001;

function dominate(d1, d2, undomiKeys) {
  if (undomiKeys.size == 0) {
    return false;
  }
  let allequal = true;
  let dominate = true;
  undomiKeys.forEach((item) => {
    if (d1[item] - d2[item] > eps) {
      dominate = false;
    }
    if (Math.abs(d1[item] - d2[item]) > eps) {
      allequal = false;
    }
  })
  return dominate && !allequal
}

function filterDominatedEntries(rows, undomiKeys) {
  let filteredRows = new Set();
  for (let i = 0; i < rows.length; i++) {
    let not_dominated = true;
    let list = Array.from(filteredRows);
    for (let j = 0; j < list.length; j++) {
      // console.log(rows[i], list[j],dominate(rows[i], list[j], undomiKeys), dominate( list[j], rows[i], undomiKeys));
      if (dominate(rows[i], list[j], undomiKeys)) {
        filteredRows.delete(list[j]);
      }
      else if (dominate(list[j], rows[i], undomiKeys)) {
        not_dominated = false;
      }
    }
    if (not_dominated) {
      filteredRows.add(rows[i]);
    }

  }

  return Array.from(filteredRows);
}

function EnhancedTableHead(props) {
  const { classes, lineHonours, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, undomiOnly, undomiKeys, setUndomiKeys } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const setUndomi = (id) => {
    undomiKeys.has(id) ? undomiKeys.delete(id) : undomiKeys.add(id);
    setUndomiKeys(new Set(undomiKeys));
  }

  return (
    <TableHead>
      <TableRow>

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            // align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            className={classes.headText}

          >
            {/* {undomiOnly && headCell.id!="name" && headCell.id!="date" ? 
            <Checkbox checked={undomiKeys.has(headCell.id)} onClick={()=>{setUndomi(headCell.id)}}></Checkbox>
            : (undomiOnly?<div><br></br><br></br></div>:"")} */}

            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              <Tooltip title={headCell.description}>
                <span>
                  {(lineHonours && headCell.label === "Score") ?
                    "Line Honours"
                    :
                    (lineHonours && headCell.label === "Submission Date") ?
                      "Update Time"
                      :
                      headCell.label
                  }

                </span>
              </Tooltip>

              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell> Details </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    verticalAlign: "top"
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 50%',
  },
  undominated: {
    // minWidth:theme.spacing(10),
    textAlign: "center"
  }

}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { handleRefresh, numSelected, optimalOnly, setOptimalOnly, suboptimalOnly, setSuboptimalOnly, undomiOnly, setUndomiOnly } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          LEADERBOARD
        </Typography>
      )}
      <Tooltip title="refresh">
        <Button
          size="small"
          variant="outlined"
          onClick={handleRefresh}

        >
          Refresh
        </Button>
      </Tooltip>



    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const refreshLeader = (track, callback) => {
  let competition = JSON.parse(localStorage.getItem("current_round"));

  fetch(`/api/leader_board?track=${track}&comp_id=${competition ? competition._id : undefined}`, { method: 'GET' })
    .then(res => res.json())
    .then(data => {
      let scores = {
        0: data.leader_board["Overall Best"],
        1: data.leader_board["Most Awarded"],
        2: data.leader_board["Fast Mover"],
      }

      callback(scores, data.leader_board["virtual_best"]);

    })
    .catch(err => console.error(err));
}

function parse_data(data, optimalOnly, suboptimalOnly) {
  let copy = JSON.parse(JSON.stringify(data))
  let rows = []
  for (var i in copy) {

    var dt = new Date(copy[i].sub_date);
    copy[i].date = dt.toLocaleDateString() + " " + dt.toLocaleTimeString();
    copy[i].team_name = copy[i].team_info.team_name;

    rows.push(copy[i])
  }

  return rows
}

//example data in for virtual_best object:
// virtual_best: {
//   "warehouse_large_1000": 36,
//   "sortation_large_2000": 0,
//   "random-32-32-20_1": 1226,
//   "brc202d_1": 0,
//   "Paris_1_256_1": 11
// }
// react function module to display the virtual best (object) in a simple html table
function VirtualBest(props) {
  const classes = useStyles();
  const data = props.data;
  const rows = [];
  for (var i in data) {
    rows.push({ name: i, ttf: data[i] })
  }

  //sort rows by revered name string in alphabetical order
  rows.sort((a, b) => {
    if (a.name == b.name) {
      return 0
    }
    else if (a.name < b.name) {
      return -1
    }
    return 1
  })



  return (
    <TableContainer className={classes.virtualBest}>
      <div className={classes.virtualBestTitle} >
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          THE VIRTUAL BEST
        </Typography>
        {props.children}
      </div>

      <Table className={classes.table} aria-label="simple table" component='table'>
        <TableHead>
          <TableRow>
            <TableCell>Instance Name</TableCell>
            {rows.map((row) => (
              <TableCell key={row.name} component="th" scope="row">
                {row.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Total Errands Finished</TableCell>

            {rows.map((row) => (
              <TableCell key={row.name} component="th" scope="row">
                {row.ttf}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}






export default function LeaderBoard(props) {
  const classes = useStyles();
  const track = props.key;
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('final_score');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(30);

  const [data, setData] = useState({ 0: [], 1: [], 2: [] });
  const [vBest, setVBest] = useState({});

  const [undomiKeys, setUndomiKeys] = useState(defaultDominanceKey);
  const [undomiOnly, setUndomiOnly] = useState(false);
  const [optimalOnly, setOptimalOnly] = useState(false);
  const [suboptimalOnly, setSuboptimalOnly] = useState(false);
  const [tab, setTab] = useState(0);

  const handleRefresh = () => {
    refreshLeader(track, (data, virtual_best) => {
      setData(data);
      setVBest(virtual_best);
    });
  }


  useEffect(() => {
    handleRefresh()
  }, [props.selected_round]);

  var rows;
  var rows_fast;


  if (tab < 3)
    rows = parse_data(data[tab], optimalOnly, suboptimalOnly);
  else {

    rows = parse_data(data[0], optimalOnly, suboptimalOnly);

    rows_fast = parse_data(data[2], optimalOnly, suboptimalOnly);
  }

  // console.log("rows=",rows);

  if (undomiOnly) {
    rows = filterDominatedEntries(rows, undomiKeys);
  }
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  const handleTabChange = (event, newValue) => {

    setTab(newValue);
    // console.log("tab=",tab);
  };

  function displayStatistic() {
    return (<div>
      {/* <Typography variant="h6" align="justify" display="inline">
            TRENDS
        </Typography> */}
      <StatisticViz
        overall={rows}
      />
    </div>);
  }

  function displayTable() {
    return (
      <div>
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >

            <EnhancedTableHead
              lineHonours={tab === 1}
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              undomiKeys={undomiKeys}
              undomiOnly={undomiOnly}
              setUndomiKeys={setUndomiKeys}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, name) => {
                  const isItemSelected = isSelected(name);
                  const labelId = `enhanced-table-checkbox-${name}`;

                  return (
                    <TableRow
                      hover
                      // onClick={(event) => handleClick(event, name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={name}
                      selected={isItemSelected}
                    >
                      {headCells.map((item, item_index) => {
                        return (<TableCell key={item_index} align={item.align}>{row[item.id]}</TableCell>)
                      })}

                      <TableCell>
                        <DetailsDialog data={row} vBest={vBest}></DetailsDialog>
                      </TableCell>

                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 13 : 33) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    );
  }


  function displayTrends() {
    return (<div>
      {/* <Typography variant="h6" align="justify" display="inline">
            TRENDS
        </Typography> */}
      <LeaderBoardViz
        overall={rows}
      />
    </div>);

  }

  return (
    <div className={classes.root}>
      <Paper elevation={10} className={classes.paper}>

        <VirtualBest data={vBest} >
          <div className={classes.competition_selector}>
            {props.children}
          </div>
        </VirtualBest>
      </Paper>
      <Paper elevation={10} className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          optimalOnly={optimalOnly}
          setOptimalOnly={setOptimalOnly}
          suboptimalOnly={suboptimalOnly}
          setSuboptimalOnly={setSuboptimalOnly}
          undomiOnly={undomiOnly}
          setUndomiOnly={setUndomiOnly}
          handleRefresh={handleRefresh}
        />

        <Divider className={classes.divider} ></Divider>
        <StyledTabs
          className={classes.tabs}
          value={tab}
          onChange={handleTabChange}
          aria-label="Tab"
          variant="scrollable"

        >
          <Tab className={classes.tab} label="Overall Best" />
          <Tab className={classes.tab} label="Line Honours" />
          <Tab className={classes.tab} label="Fast Mover" />
          <Tab className={classes.tab} label="Trends" />
          <Tab className={classes.tab} label="All Submissions" />
          <Tab className={classes.tab} label="Statistic test" />
        </StyledTabs>
        {tab < 3 && displayTable()}
        {tab == 3 && displayTrends()}
        {tab == 4 && <AllSubmissions competition={props.selected_round} ></AllSubmissions>}
        {tab == 5 && displayStatistic()}

      </Paper>

    </div>
  );
}

//display a dialog box to show the score_details for clicked row
function DetailsDialog(props) {
  const { data, vBest } = props;
  const classes = useStyles();
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleOpen = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  let score_details = data["score_details"];
  let team_info = data["team_info"];
  let rows = [];
  let ttfSum = 0;
  for (var i in score_details) {
    rows.push({ name: i, ttf: score_details[i]["my_metric"], fast_mover: score_details[i]["fast_mover"], update_time: score_details[i]["update_time"], sub_id: score_details[i]["sub_id"] });
    ttfSum += score_details[i]["my_metric"];
  }

  //sort rows by revered name string in alphabetical order
  rows.sort((a, b) => {
    if (a.name === b.name) {
      return 0
    }
    else if (a.name < b.name) {
      return -1
    }
    return 1
  })

  return (
    <div>
      <IconButton aria-label="expand row" size="small" onClick={handleOpen}>
        <InfoIcon />
      </IconButton>

      <Dialog onClose={handleCloseDialog} aria-labelledby="simple-dialog-title" open={openDialog}>
        <DialogTitle id="simple-dialog-title" disableTypography={true}>
          <Typography variant="h4"> Submission Details </Typography>
        </DialogTitle>
        <DialogContent>
          {data["sub_id"] != undefined && <span>
            <h4>Submission ID</h4>
            {data["sub_id"]}
            <br />
          </span>
          }
          <h4>Team Details</h4>
          <TableContainer>
            <Table className={classes.table} aria-label="simple table" component='table'>
              <TableBody>
                <TableRow><TableCell>Algorithm Name:</TableCell><TableCell>{data["name"]}</TableCell></TableRow>
                <TableRow><TableCell>Team Name:</TableCell><TableCell>{team_info["team_name"]}</TableCell></TableRow>
                {team_info["affiliation"] && <TableRow><TableCell>Affiliation:</TableCell><TableCell>{team_info["affiliation"]}</TableCell></TableRow>}
                {team_info["country"] && <TableRow><TableCell>Country:</TableCell><TableCell>{team_info["country"]}</TableCell></TableRow>}
                <TableRow><TableCell>Team Size:</TableCell><TableCell>{team_info["number_members"]}</TableCell></TableRow>
                {team_info["team_info"] && <TableRow><TableCell>Team Description:</TableCell><TableCell>{team_info["description"]}</TableCell></TableRow>}
              </TableBody>
            </Table>

          </TableContainer>
          <br />
          <h4>Score Details</h4>
          <TableContainer>
            <Table className={classes.table} aria-label="simple table" component='table'>
              <TableHead>
                <TableRow>
                  <TableCell>Instance</TableCell>
                  <TableCell>Errands</TableCell>
                  {data["sub_id"] !== undefined && <TableCell>Score</TableCell>}
                  <TableCell>Line Honours</TableCell>
                  {data["sub_id"] !== undefined && <TableCell>Fast Mover</TableCell>}
                  {data["sub_id"] === undefined && <TableCell>Achieved Date</TableCell>}


                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.ttf}
                    </TableCell>
                    {data["sub_id"] !== undefined &&
                      <TableCell component="th" scope="row">
                        {vBest[row.name] === 0 ? 0 : Math.round(row.ttf / vBest[row.name] * 1000) / 1000}
                      </TableCell>
                    }
                    <TableCell component="th" scope="row">
                      {row.ttf === vBest[row.name] ? 1 : 0}
                    </TableCell>
                    {data["sub_id"] !== undefined &&
                      <TableCell component="th" scope="row">
                        {row.fast_mover ? "True" : "False"}
                      </TableCell>
                    }
                    {data["sub_id"] === undefined &&
                      <TableCell component="th" scope="row">
                        {row.update_time}
                      </TableCell>
                    }
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell component="th" scope="row">
                    Total
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {ttfSum}
                  </TableCell>
                  {data["sub_id"] !== undefined &&
                    <TableCell component="th" scope="row">
                      {data["overall_best_score"]}
                    </TableCell>
                  }
                  <TableCell component="th" scope="row">
                    {data["line_honours_score"]}
                  </TableCell>
                  {data["sub_id"] !== undefined &&
                    <TableCell component="th" scope="row">
                      {data["valid_fast_mover"] ? "True" : "False"}
                    </TableCell>
                  }
                </TableRow>



              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>


  );
}

