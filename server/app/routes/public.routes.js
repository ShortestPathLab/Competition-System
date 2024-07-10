const { authJwt,permission } = require("../middlewares");

const controller = require("../controllers/user.controller");
const submit_controller = require("../controllers/submit.controller");
const general_controller = require("../controllers/general.controller");
const admin_controller = require("../controllers/admin.controller");
const storage_controller = require("../controllers/storage.controller");
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/external_page/*", general_controller.external_page);
  app.get("/external_page_resource/*", general_controller.external_page_resource);


  app.get("/api/test/all", controller.allAccess);
  app.get("/api/leader_board", general_controller.leader_board);
  app.get("/api/all_submissions", general_controller.all_submissions);

  app.get("/api/get_meta_data", general_controller.get_meta_data);

};