const config = require("../../config")
const https = require('https')
const { exec } = require('child_process');
const userPass = Buffer.from(`${config.bitbucket_username}:${config.bitbucket_password}`).toString('base64');
const fs = require("fs")
const axios = require('axios').default;
const utils = require("../../utils");
const  octokit = require("octokit");

//oAuthSecret is used get user access token, so that we can act as the user to accept invitations in our organization.
const oAuthSecret = fs.readFileSync(config.GITHUB_SECRET_PATH).toString().trim();

//privateKey is used to get an installation access token, act as a bot in our organization.
const appPrivateKey = fs.readFileSync(config.GITHUB_APP_KEY).toString().trim();


const app = new octokit.App({
    appId: config.GITHUB_APP_ID,
    privateKey: appPrivateKey,
});

var authorizedApp;
app.getInstallationOctokit(config.GITHUB_INSTALLATION_ID).then((out)=>{
    authorizedApp = out;
});



exports.inviteUser = async (repoName,username) =>{
    // var url = `${config.github_api}/repos/${config.github_org}/${repoName}/collaborators/${username}`
    // var request_config = {
    //     headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'X-GitHub-Api-Version': '2022-11-28',
    //         'Content-Length':0
    //     },
    // }
    try {
        var response = await authorizedApp.request(`PUT /repos/${config.github_org}/${repoName}/collaborators/${username}`, {
            permission: 'Maintain',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        // var response = await axios.put(url,{},request_config)
        if (response.status == 201){
            return [true,response.data.id];
        }
        else if (response.status == 204){
            return [true,null];
        }
        else{
            console.log("Invite user failed: ", response.status, response.statusText, response.data)

            return [false,null];
        }
    }
    catch (e){
        console.log("Invite user failed:", username, e);
        return [false,null];
    }
}


exports.deleteUser = async (repoName,username) =>{
    // var url = `${config.github_api}/repos/${config.github_org}/${repoName}/collaborators/${username}`
    // var request_config = {
    //     headers: {'Authorization': `Bearer ${token}`},
    // }
    try {
        var response = await authorizedApp.request(`DELETE /repos/${config.github_org}/${repoName}/collaborators/${username}`, {
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        // var response = await axios.delete(url,request_config)
        if (response.status == 204){
            return true;
        }
        else{
            return false;
        }
    }
    catch (e){
        console.log("Delete user failed:", username);

        return false;
    }
}

// exports.createRepo = async (repoName)=>{
//     var data = {
//         name:repoName,
//         private:true
//     }
//     var url = `${config.github_api}/orgs/${config.github_org}/repos`
//     var request_config = {headers: {'Authorization': `token ${token}`,'Accept': 'application/vnd.github.v3+json'}}
//     try {
//         var response = await axios.post(url,data,request_config)
//         if (response.status == 201){
//             return true;
//         }
//         else{
//             console.log("Create repo failed: ", response.status, response.statusText, response.data)
//             return false;
//         }
//     }
//     catch (e){
//         console.log("Create repo failed:", repoName, e);
//         return false;
//     }
// }

exports.createRepo = async (repoName, start_kit)=>{
    // var data = {
    //     owner:config.github_org,
    //     name:repoName,
    //     private:true
    // }
    // var url = `${config.github_api}/repos/${config.start_kit_owner}/${start_kit}/generate`
    // var request_config = {headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Accept': 'application/vnd.github+json',
    //     'X-GitHub-Api-Version': '2022-11-28',
    //     'X-OAuth-Scopes': 'repo',
    //     'X-Accepted-OAuth-Scopes': 'repo',
    //     'Content-Type':'application/json'
    // }}



    try {
        var response = await authorizedApp.request(`POST /repos/${config.start_kit_owner}/${start_kit}/generate`, {
            owner: config.github_org,
            name: repoName,
            private:true,
            include_all_branches: false,
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        // var response = await axios.post(url,JSON.stringify(data),request_config)
        if (response.status == 201){
            return true;
        }
        else{
            console.log("Create repo failed: ", response.status, response.statusText, response.data)
            return false;
        }
    }
    catch (e){
        console.log("Create repo failed:", repoName, e);
        return false;
    }
}

exports.getToken = async (code)=>{
    //var data = `code=${code}&client_id=${config.GITHUB_CLIENT_ID}&client_secret=${oAuthSecret}`
    var data = {
        code: code,
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: oAuthSecret
    }
    var url = `https://github.com/login/oauth/access_token`
    var request_config={headers:{'Accept': 'application/vnd.github+json'}}
    try {
        var response = await axios.post(url,data,request_config)
        if ("access_token" in response.data){
            //var res_data = response.data.split("&");
            //var token = res_data[0].split("=")[1];
            //var type = res_data[2].split("=")[1];
		var token = response.data["access_token"];
		var type = response.data["token_type"];
            return [true,token,type];
        }
        else{
		console.log(data);
		console.log(response);
            return [false,JSON.stringify(response.data),""];
        }
    }
    catch (e){
        console.log("Get token failed",e);

        return [false,"",""];
    }
}

exports.deleteRepo = async (repoName)=>{

    // var url = `${config.github_api}/repos/${config.github_org}/${repoName}`
    // var config = {headers: {'Authorization': `Bearer ${token}`}}
    try {
        var response = await authorizedApp.request(`DELETE /repos/${config.github_org}/${repoName}`, {
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        // var response = await axios.delete(url,config)
        if (response.status == 204){
            return true;
        }
        else{
            return false;
        }
    }
    catch (e){
        return false;
    }
}


exports.getRepo = async (repoName)=>{

    // var url = `${config.github_api}/repos/${config.github_org}/${repoName}`
    // var request_config = {headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Accept': 'application/vnd.github+json',
    //     'X-GitHub-Api-Version': '2022-11-28'

    // }}
    try {
        var response = await authorizedApp.request(`GET /repos/${config.github_org}/${repoName}`, {
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        // var response = await axios.get(url,request_config)
        if (response.status == 200){
            return response.data;
        }
        else{
            return null;
        }
    }
    catch (e){
        console.log("Get repo failed:", repoName, e);

        return null;
    }
}

exports.getBranches = async (repoName)=>{

    // var url = `${config.github_api}/repos/${config.github_org}/${repoName}/branches`
    // var request_config = {headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Accept': 'application/vnd.github+json',
    //     'X-GitHub-Api-Version': '2022-11-28',

    // }}
    try {
        var response = await authorizedApp.request(`GET /repos/${config.github_org}/${repoName}/branches`, {
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
        // var response = await axios.get(url,request_config)
        if (response.status == 200){
            return response.data;
        }
        else{
            return null;
        }
    }
    catch (e){
        console.log("Get branches failed:", repoName, e);

        return null;
    }
}

exports.getUser = async (user_token)=>{

    var url = `${config.github_api}/user`
    var request_config = {headers: {'Authorization': `Bearer ${user_token}`}}
    try {
        var response = await axios.get(url,request_config)
        if (response.status == 200){
            return [true,response.data];
        }
        else{
            return [false,response.statusText];
        }
    }
    catch (e){
        return [false,null];
    }
}

exports.acceptInvitation = async (user_token, invt_id)=>{

    var url = `${config.github_api}/user/repository_invitations/${invt_id}`
    var request_config = {headers: {
        'Authorization': `Bearer ${user_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Accept': 'application/vnd.github+json'

    }}
    try {
        var response = await axios.patch(url,{},request_config)
        if (response.status == 204){
            return [true,response.statusText];
        }
        else{
            console.log("Accept invitation failed: ", response.status, response.statusText, response.data)
            return [false,response.statusText];
        }
    }
    catch (e){
        return [false,null];
    }
}



exports.setupRepoAndInvite = async (repoName,username, track) => {

    try {
        template = config.start_kit_classic
        if (track == utils.TRACK.ANYANGLE){
            template = config.start_kit_anyangle
        }

        if (! await exports.createRepo(repoName, template)){
            return [false, "Repo Failed"]
        }

        var [success, invt_id] = await exports.inviteUser(repoName,username)

        if (! success){
            return [false,"Invitation Failed"]
        }

        return [true,invt_id]
    }
    catch(err){
        console.log(err);
        return [false,"Unknown Error"]
    }
}


