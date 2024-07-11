const { S3Client, GetObjectCommand, HeadObjectCommand,PutObjectCommand, ListObjectsV2Command} = require("@aws-sdk/client-s3");
const path = require("path");
const config = require("../../config");
const config_benchmark = require("../../config_benchmark");
const fs =require("fs");
const awsAccessKey = fs.readFileSync(config.aws_secretAccessKey, 'utf8').toString().trim();
const log = require('loglevel');
log.setDefaultLevel("info");

const s3Client = new S3Client({ 
    region: config.aws_region,
    credentials:{
        accessKeyId:config.aws_accessKeyId,
        secretAccessKey:awsAccessKey
    }
 });


getFolderSize =  async (folderPath) => {
  
    // Check if the folder exists
    const headFolderParams = {
      Bucket: config.aws_bucket,
      Key: `${folderPath}/`,
    };
  
    try {
      await s3Client.send(new HeadObjectCommand(headFolderParams));
    } catch (error) {
      // If the folder does not exist, return 0
      if (error.name === 'NotFound') {
        log.info("folder not found. create folder");
        try{
            await s3Client.send( new PutObjectCommand(headFolderParams));
        }
        catch (e){
            console.error('Failed to create folder', e);
            return [-1,[]];
        }
        return [0,[]];
        
      }
  
      console.error('Failed to get the folder size:', error);
      return [-1,[]];
    }
  
    // List objects in the folder
    const listObjectsParams = {
      Bucket: config.aws_bucket,
      Prefix: folderPath,
    };
  
    let totalSize = 0;
  
    try {
      const response = await s3Client.send(new ListObjectsV2Command(listObjectsParams));
      const objects = response.Contents;

      //Each object contains:
    //   {
    //     Key: 'test/Zoom__0023_Fac-IT.jpg',
    //     LastModified: 2023-05-18T11:35:19.000Z,
    //     ETag: '"db5edfff0d91db908fe1d8b102f64e23"',
    //     Size: 585424,
    //     StorageClass: 'STANDARD'
    //   }
  
      for (const object of objects) {
        // Get the size of each object
        // const headObjectParams = {
        //   Bucket: config.aws_bucket, 
        //   Key: object.Key,
        // };
  
        // const objectMetadata = await s3Client.send(new HeadObjectCommand(headObjectParams));
        // const objectSize = objectMetadata.ContentLength;
  
        totalSize += object.Size;
      }
  
      return [totalSize, objects];
    } catch (error) {
      console.error('Failed to get the folder size:', error);
      return [-1,[]];
    }
}

function collectFilesWithLastModifiedDateTime(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const fileDetails = [];

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const lastModified = stats.mtime; // Last modified datetime
        fileDetails.push({
          file: file,
          lastModified: lastModified,
        });
      }
    });

    return fileDetails;
  } catch (error) {
    console.error('Error collecting files:', error);
    return [];
  }
}

collectFilesWithLastModifiedDateTime = (folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    var fileDetails = {};

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const lastModified = stats.mtime; // Last modified datetime
        fileDetails[file] = lastModified;
      }
    });

    return fileDetails;
  } catch (error) {
    console.error('Error collecting files:', error);
    return [];
  }
}


downloadFile =async (bucketName, objectKey, localFilePath)=>{

  const getObjectCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const response = await s3Client.send(getObjectCommand);

  // Read the object data stream and write it to a local file
  const { Body } = response;
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(localFilePath);
    Body.pipe(fileStream);
    Body.on("error", (err) => {
      fileStream.close();
      reject(err);
    });
    fileStream.on("finish", resolve);
  });

  log.info("File downloaded successfully");
}
exports.downloadFile = downloadFile;


//upload all files in src_folder to aws s3 could storage bucket under config.log_storage_root/base_name/submission_id/
exports.uploadLogFiles = async (src_folder, base_name, submission_id)=>{
  let folderPath = path.join(config.log_storage_root,base_name,submission_id);
   // Check if the folder exists
   const headFolderParams = {
    Bucket: config.aws_bucket,
    Key: `${folderPath}/`,
  };

  try {
    await s3Client.send(new HeadObjectCommand(headFolderParams));
  } catch (error) {
    // If the folder does not exist, return 0
    if (error.name === 'NotFound') {
      log.info("folder not found. create folder");
      try{
          await s3Client.send( new PutObjectCommand(headFolderParams));
      }
      catch (e){
          log.error('Failed to create folder', e);
          return false;
      }      
    }
    else{
      log.error('Failed to get the folder info:', error);
      return false;
    }
  }

  let files = fs.readdirSync(src_folder);
  for (let file of files){
    let filePath = path.join(src_folder, file);
    let key = path.join(folderPath, file);
    const body = fs.readFileSync(filePath);
    const objectParams = {
      Bucket: config.aws_bucket,
      Key: key,
      Body: body,
    };
    try{
      await s3Client.send(new PutObjectCommand(objectParams));
    }
    catch(e){
      log.error('Failed to upload file:', error);
    }
  }
  return true;
  
}

downloadAll = async (base_name)=>{
  try{
    let folderPath = path.join(config.storage_root,base_name);
    log.info("Sync files for: ",folderPath);
    let [size, objects] = await getFolderSize(folderPath);
    log.info(objects);
    let targetFolder = path.join(config_benchmark.storage_volume, base_name);
    
    if (!fs.existsSync(targetFolder)){
        fs.mkdirSync(targetFolder, {recursive:true});
    }

    let localFiles = collectFilesWithLastModifiedDateTime(targetFolder);
    // log.info(localFiles);
    for (let object of objects){
      if (object.Key == folderPath+"/"){
        continue;
      }
      let fileName = path.basename(object.Key);
      if (localFiles[fileName] != undefined 
        && object.LastModified <= localFiles[fileName]){
          localFiles[fileName] = undefined; 
          continue;
        }
      if (localFiles[fileName] != undefined){
        fs.rmSync(path.join(targetFolder, fileName));
      }

      

      await downloadFile(config.aws_bucket, object.Key, path.join(targetFolder, fileName));
      localFiles[fileName] = undefined; 
    }

    // log.info(localFiles);

    for (let key of Object.keys(localFiles)){

      if (localFiles[key]!==undefined){
        fs.rmSync(path.join(targetFolder, key));
      }
    }
    return true;


  }
  catch(e){
    log.info("Failed to sync files from cloud storage: ",e);
    return false;
  }

}

exports.downloadAll = downloadAll;

//delete all files for uase with base_name
exports.clearAll = async (base_name)=>{
  let targetFolder = path.join(config_benchmark.storage_volume, base_name);
  if (!fs.existsSync(targetFolder)){
    return true;
  }
  try{
    fs.rmSync(targetFolder, {recursive:true});
    return true;
  }
  catch(e){
    log.info("Failed to clear files from local storage: ",e);
    return false;
  }
}
