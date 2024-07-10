const { S3Client, HeadObjectCommand, ListObjectsV2Command,PutObjectCommand,DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
const path = require("path");
const fs = require("fs");

const config = require("../../config");

const awsAccessKey = fs.readFileSync(config.aws_secretAccessKey, 'utf8').toString().trim();

// Create the S3 client with the specified credentials
const s3Client = new S3Client({ 
    region: config.aws_region,
    credentials:{
        accessKeyId:config.aws_accessKeyId,
        secretAccessKey:awsAccessKey
    }
 });
 
const stsClient = new STSClient({ 
    region: config.aws_region,
    credentials:{
        accessKeyId:config.aws_accessKeyId,
        secretAccessKey:awsAccessKey
    }
 });

exports.getFolderSize =  async (folderPath) => {
  
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
        console.log("folder not found. create folder");
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

exports.deleteFile =  async (key) => {
  
    // Check if the folder exists
    const deleteObjectParams = {
      Bucket: config.aws_bucket,
      Key: `${key}`,
    };
  
    try {
      await s3Client.send(new DeleteObjectCommand(deleteObjectParams));
    } catch (error) {
  
      console.error('Failed to delete object', error);
      return false;
    }
    return true;
  
}


exports.generateTemporaryCredentials = async (session_name,folder_path)=> {

  // Assume role to generate temporary credentials
  const assumeRoleParams = {
    RoleArn: `arn:aws:iam::631157706423:role/assumed-role`,
    RoleSessionName: session_name,
    DurationSeconds: 43200,
    Policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "s3:PutObject",
            "s3:ListBucket"
          ],
          Resource: [
            `arn:aws:s3:::${config.aws_bucket}/${folder_path}/*`,
            `arn:aws:s3:::${config.aws_bucket}/${folder_path}`
          ]
        }
      ]
    })
  };
  console.log(assumeRoleParams);

  try {
    const response = await stsClient.send(new AssumeRoleCommand(assumeRoleParams));
    const credentials = response.Credentials;

    return {
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken
    };
  } catch (error) {
    throw error;
  }
}

exports.s3_list_files = async (req, res) => {
    var user = req.user;
    var account = req.account;
    var base_name = account.base_name;

    var folder_path = path.join(config.storage_root, base_name);
    console.log("list file request: ", base_name, folder_path)
    let [current_size, files] = await exports.getFolderSize(folder_path);
    if (current_size == -1)    
        return res.status(400).json({success:false, message: "Error on retrieving files" });
    return res.json({success:true,usage:current_size,limit: config.storage_limit, files:files});

}

exports.s3_delete_file = async (req, res) => {
    var user = req.user;
    var account = req.account;
    var base_name = account.base_name;
    var file_name = req.body.file_name;

    var key = path.join(config.storage_root,base_name,file_name);
    var folder_path = path.join(config.storage_root, base_name);


    var success = await exports.deleteFile(key);

    if (success) {
        let [current_size, files] = await exports.getFolderSize(folder_path);
        if (current_size == -1)    
            return res.status(400).json({success:false, message: "Error on retrieving files" });
        return res.json({success:true,usage:current_size,limit: config.storage_limit, files:files});
    }
    return res.status(400).json({success:false, message: "Failed to delete the file" });


}



exports.s3_temp_credential = async (req, res) => {
    var user = req.user;
    var account = req.account;
    var base_name = account.base_name;
    var file_size = req.body.file_size;

    var folder_path = path.join(config.storage_root, base_name);
    console.log("Storage request: ", base_name, folder_path)
    let [current_size, files] = await exports.getFolderSize(folder_path);
    if (file_size + current_size > config.storage_limit) {
        return res.status(400).json({success:false, message: "File size exceeds the limit" });
    }

    // Generate temporary access credentials
    try{
        var credentials = await exports.generateTemporaryCredentials(base_name, folder_path);

        var data = {
            success:true,
            path:folder_path,
            bucket: config.aws_bucket,
            aws_region: config.aws_region,
            credentials:credentials
        }
        

        // Return the temporary access credentials to the React front end
        res.json(data);
    }
    catch(e){
        console.log(e);
        return res.status(400).json({success:false, message: "Failed to generate temporary credential" });

    }
}