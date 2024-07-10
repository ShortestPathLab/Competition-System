import React, { useState, useEffect} from "react";
import { createPortal } from 'react-dom';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { Button, Dialog, DialogActions, DialogTitle, DialogContent, TextField, Typography, Table, TableBody, TableRow, TableCell, TableHead, Snackbar, SnackbarContent } from "@material-ui/core";
import { lighten, makeStyles } from '@material-ui/core/styles';
import {Delete} from '@material-ui/icons'

// import Paper from '@material-ui/core/Paper';


const useStyles = makeStyles((theme) => ({
    root: {
  
    },
    table:{
        minHeight: theme.spacing(5)
    },
    choose_file:{
        marginTop: theme.spacing(1),
        width:"100%"
    }
  }));

const UploadDialog = ({ deleteFile, open, onClose, onUpload, exFiles }) => {
  const [file, setFile] = useState(null);
  const classes = useStyles();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    onUpload(file);
    setFile(null);
    onClose();
  };
//   console.log(file, exFiles)

  return (
    <Dialog open={open} onClose={()=>{onClose();setFile(null);}}>
      <DialogTitle>Large File Storage</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2">
            Usage: {Math.round(exFiles.size/(1024*1024*1024))} GB / {Math.round(exFiles.limit/(1024*1024*1024))} GB
        </Typography>
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                <TableCell>
                   <b>File</b> 
                </TableCell>
                <TableCell>
                    <b>Size</b>
                </TableCell>
                <TableCell>
                    <b>Last Modified Time</b>
                </TableCell>
                <TableCell>
                    <b>Delete</b>
                </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            {exFiles.files.filter((value)=>{return (value.Key!=undefined && value.Key.split("/")[2])}).map((value,index)=>{
    
                return(
                    <TableRow key={index}>
                        <TableCell>
                            {value.Key.split("/")[2]}
                        </TableCell>
                        <TableCell>
                            {Math.round(value.Size/(1024*1024*1024))==0?
                            `${Math.round(value.Size/(1024*1024))} MB`: `${Math.round(value.Size/(1024*1024*1024))} GB`} 
                        </TableCell>
                        <TableCell>
                            {value.LastModified.toLocaleString()}
                        </TableCell>
                        <TableCell>
                            <Button onClick={()=>{deleteFile(value.Key.split("/")[2]);}}><Delete></Delete></Button>
                        </TableCell>
                    </TableRow>
                )

            })}

            </TableBody>
        </Table>



        <TextField
        className={classes.choose_file}
          type="file"
          size="small"
          onChange={handleFileChange}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="secondary" disabled={!file}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StorageModule = (props) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [closeDur, setCloseDur] = useState(6000);

  const [message, setMessage] = useState("");

  const [exFiles, setExFiles] = useState({size:0,limit:0,files:[]});
  const [upload, setUpload] = useState(null);
  
  useEffect(()=>{

    return ()=>{
        if(upload){
            console.log("cancel");
            upload.abort();
            setUpload(null);
        }

    };
    },[upload]);
  
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const handleSnackOpen = () => {
    setSnackOpen(true);
  };

  const handleDeleteFile = (file_name)=>{
    fetch("/api/delete_file", {
        method: "POST",
        body: JSON.stringify({base_name:props.base_name,file_name:file_name}),
        headers: {
            "x-access-token": props.login_data.accessToken,
            "Content-type": "application/json",
        },
    })
    .then((res=>{return res.json()}))
    .then((data)=>{
        // console.log(data);
        if (data.success){
            setExFiles({size:data.usage,limit:data.limit,files:data.files});
        }
        else{
            setCloseDur(3000);
            handleSnackOpen();
            setMessage("Failed to delete file.");
        }

    })
    .catch((err)=>{
        setCloseDur(3000);
        handleSnackOpen();
        setMessage("Failed to delete file.");
    })
  }

  const handleOpenDialog = async () => {
    fetch("/api/list_files", {
        method: "POST",
        body: JSON.stringify({base_name:props.base_name}),
        headers: {
            "x-access-token": props.login_data.accessToken,
            "Content-type": "application/json",
        },
    })
    .then((res=>{return res.json()}))
    .then((data)=>{
        // console.log(data);
        if (data.success){
            setExFiles({size:data.usage,limit:data.limit,files:data.files});
            setDialogOpen(true);
        }
        else{
            setCloseDur(3000);
            handleSnackOpen();
            setMessage("Failed to access storage service.");
        }
    }).catch((err)=>{
        console.log(err);
        setCloseDur(3000);
        handleSnackOpen();
        setMessage("Failed to access storage service.");
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };



  const handleFileUpload = (file) => {
    // Function to upload the file using temporary access credentials
    const uploadFileWithCredentials = async (file, region, bucket, path, credentials) => {
      const s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
      });

      const uploadParams = {
        Bucket: bucket,
        Key: `${path}/${file.name}`,
        Body: file,
      };

      try {
        // const response = await s3Client.send(new PutObjectCommand(uploadParams));
        const managedUpload = new Upload({
            client: s3Client,
            params: uploadParams,
          });

        // Add an event listener to track progress
        managedUpload.on("httpUploadProgress", (progress) => {
            let percent = Math.round((progress.loaded / progress.total) * 100);
            // console.log(progress);
            if (closeDur !== null)
                setCloseDur(null);
            if (!snackOpen)
                handleSnackOpen();
            
            setMessage(`Upload Progress: ${percent}% (Please stay on this tab).`);
        });
        try {
            setUpload(managedUpload);
            setCloseDur(null);
            setMessage(`Upload Start. (Please stay on this tab)`);
            handleSnackOpen();
            // Upload the object and wait for the upload to complete
            const data = await managedUpload.done();
            // console.log("Upload completed successfully");
            setCloseDur(3000);
            setUpload(null);
            handleSnackOpen();
            setMessage("Upload Completed Successfully.");
        } catch (error) {
            if (error.name === "AbortError"){
                setCloseDur(3000);
                setUpload(null);
                handleSnackOpen();
                setMessage("Upload Canceled.");                
            }
            else{
                console.error("Error on upload object:", error);
                setCloseDur(3000);
                setUpload(null);
                handleSnackOpen();
                setMessage("Upload failed.");
            }
            
        }

      } catch (error) {
        console.error("Failed to upload file:", error);
        setCloseDur(3000);
        setUpload(null);
        handleSnackOpen();
        setMessage("Failed to upload file.");
      }
    };

    // Make a request to the Node.js backend and handle the response
    const handleFileUploadRequest = async (file) => {
      const fileSizeInBytes = file.size;
      const response = await fetch("/api/request_upload", {
        method: "POST",
        body: JSON.stringify({ fise_size: fileSizeInBytes, base_name:props.base_name }),
        headers: {
            "x-access-token": props.login_data.accessToken,
            "Content-type": "application/json",
        },
      });

      if (response.ok) {
        // If the response is successful, parse the JSON response
        const {aws_region,bucket,path,credentials} = await response.json();

        // Upload the file using the temporary access credentials
        uploadFileWithCredentials(file,aws_region,bucket,path,credentials);
      } else {
        // Handle error response from the Node.js backend
        console.error("Failed to get temporary access credentials:", response.statusText);
      }
    };

    handleFileUploadRequest(file);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenDialog}>
        Large File Storage
      </Button>
      <UploadDialog deleteFile={handleDeleteFile} exFiles={exFiles} open={dialogOpen} onClose={handleCloseDialog} onUpload={handleFileUpload} />
      {createPortal(
        <Snackbar 
        message={message} 
        open={snackOpen} 
        autoHideDuration={closeDur} 
        onClose={handleSnackClose}
        // anchorOrigin={{vertical:'bottom',horizontal:'left'}}
        action={
        (<div>
            {upload!==null?
            <Button 
                color="secondary" 
                size="small" 
                onClick={()=>{    
                    if (upload) upload.abort();
                }}
              >
            Cancel
            </Button>:<a></a>
            }

        </div>
        )
        }
        >

      </Snackbar>,
      document.body)}
      
    </div>
  );
};

export default StorageModule;