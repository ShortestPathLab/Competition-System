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



  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );



  /**
   * evaluate any given account of user
   * @param {String} username
   * @param {String} account_name
   * @return {boolean} success
   */
     app.get(
      "/api/evaluate",
      [authJwt.verifyToken,authJwt.isAdmin],
      admin_controller.evaluate
    )

  /**
   * reser evaluator of any given account of user
   * @param {String} username
   * @param {String} account_name
   * @return {boolean} success
   */
     app.get(
      "/api/reset_evaluator",
      [authJwt.verifyToken,authJwt.isAdmin],
      admin_controller.reset_evaluator
    )

  /**
   * reser evaluator of any given account of user
   * @param {String} username
   * @param {String} account_name
   * @return {boolean} success
   */
       app.get(
        "/api/remove_best",
        [authJwt.verifyToken,authJwt.isAdmin],
        admin_controller.remove_best
      )
  
      app.post(
        "/api/new_competition",
        [authJwt.verifyToken,authJwt.isAdmin],
        admin_controller.new_competition
      ) 

  
};