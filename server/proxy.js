const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const db = require("./app/models");
const config = require("./config");
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');


var https = require('https');
var http = require('http');


var privateKey  = fs.readFileSync(config.https_prv, 'utf8');
var certificate = fs.readFileSync(config.https_cert, 'utf8');
var credentials = {key: privateKey, cert: certificate};

const app = express();
const port = process.env.PORT || 8443;
const http_port = process.env.HTTP_PORT || 5001;

app.use(cors());
app.enable('trust proxy')

//redirect rules
app.use(function(request, response, next) {
  if (request.hostname == 'expo.leagueofrobotrunners.org'){
    return response.redirect("https://expo24.leagueofrobotrunners.org")
  }

  if (process.env.NODE_ENV != 'development' && !request.secure) {
     return response.redirect("https://" + request.headers.host + request.url);
  }
  next();
})

//proxy rules
const proxy_table={
  'leagueofrobotrunners.org':8888,
  'www.leagueofrobotrunners.org':8888,
  '2023.leagueofrobotrunners.org':82023,
  'dev.leagueofrobotrunners.org':8080,
}

for (const [key, value] of Object.entries(proxy_table)) {
  let filter = (pathname,req)=> {
    if (pathname.match('^/.well-known')){
      //for certbot
      return false;
    }
    if (req.hostname == key) {
        return true;
    }
    return false;
  };
  app.use( createProxyMiddleware(filter,{
    target: `http://localhost:${value}`,
    changeOrigin: true,
    ws:true,
  }));
}

//for certbot verification
app.use(express.static(path.join(__dirname, config.client_path)));

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => console.log(`Listening on port ${port} for https`));

var httpServer = http.createServer(app);

httpServer.listen(http_port, () => console.log(`Listening on port ${http_port} for http`));
