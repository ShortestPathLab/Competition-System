const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const db = require("./app/models");
const config = require("./config");
const path = require('path');
const fs = require('fs');


var http = require('http');



const uri = config.mongoose_string;

var env = process.env.NODE_ENV || 'development';

console.log("Production mode.")
db.mongoose
.connect(uri,{
  useUnifiedTopology: true,
  useNewUrlParser: true
})
.then(() => {
  console.log("Successfully connect to MongoDB.");
  initial();
})
.catch(err => {
  console.error("Connection error", err);
  process.exit();
});


const app = express();
const port = process.env.PORT || 5500;

app.use(cors());


app.enable('trust proxy')

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const Role = db.role;


// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/public.routes')(app);
require('./app/routes/admin.routes')(app);

// Serve any static files

app.use(express.static(path.join(__dirname, config.client_path)));
// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, config.client_path, 'index.html'));
});



var httpServer = http.createServer(app);

httpServer.listen(port, () => console.log(`Listening on port ${port} for http`));

function initial() {
  Role.estimatedDocumentCount().then((count) => {
    if (count === 0) {
      new Role({
        name: "user"
      }).save().then(() => {
        console.log("added 'user' to roles collection");
      }).catch((err)=>{
        console.log("error", err);
      });

      new Role({
        name: "moderator"
      }).save().then(() => {
        console.log("added 'moderator' to roles collection");
      }).catch((err)=>{
        console.log("error", err);
      });

      new Role({
        name: "admin"
      }).save().then(d => {

        console.log("added 'admin' to roles collection");
      }).catch((err)=>{
        console.log("error", err);
      });
    }
  });
}