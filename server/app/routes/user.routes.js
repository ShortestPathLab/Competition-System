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

  /**
   * Get user contact email
   */
  app.get("/api/get_contact_email", [authJwt.verifyToken, permission.getUser], controller.getContactEmail);

  /**
   * Set user contact email
  */
  app.post("/api/set_contact_email", [authJwt.verifyToken, permission.getUser], controller.setContactEmail);

  /**
   * submit a evaluation
   * @param {String} base_name
   * @return {boolean} success
   */
  app.get(
    "/api/submit",
    [authJwt.verifyToken],
    submit_controller.submit
  )


  /**
   * Get account info
   * @param {String} base_name
   * @return {JSON} account info
   */
  app.get("/api/my_account",[authJwt.verifyToken, permission.getUserAndAccount], controller.status);

  /**
   * Get account info
   * @param {String} base_name
   * @return {JSON} submissions
   */
  app.get("/api/my_subs",[authJwt.verifyToken,permission.getUserAndAccount], controller.mySubs);

  /**
   * Get repo branches info
   * @param {String} base_name
   * @return {JSON} submissions
   */
  app.get("/api/branches",[authJwt.verifyToken,permission.getUserAndAccount], controller.getBranches);

  /**
   * Set branch for evaluation
   * @param {String} base_name
   * @return {boolean} success
   */
    app.post("/api/setEvaluateBranch",[authJwt.verifyToken,permission.getUserAndAccount], controller.setEvaluateBranch);

  /**
   * Save new nick name
   * @param {String} nickname
   * @param {String} base_name
   * @param {Number} page
   * @return {boolean} success
   */
  app.post("/api/save_nickname",[authJwt.verifyToken, permission.getUserAndAccount], controller.saveNickname);

    /**
   * Save new user meta data
   * @param {String} meta_data
   * @param {String} base_name
   * @param {Number} page
   * @return {boolean} success
   */
    app.post("/api/save_meta_data",[authJwt.verifyToken, permission.getUser], controller.saveMetaData);


  /**
   * Save setting for multi thread preprocessing
   * @param {Boolean} multi_cpu_precomputing
   * @param {String} base_name
   * @param {Number} page
   * @return {boolean} success
   */
  app.post("/api/save_multiPrecomputing",[authJwt.verifyToken, permission.getUserAndAccount], controller.savePrecomptingCPU);

  /**
   * Create account
   * @param {String} account_name
   * @return {boolean} success
   */
  app.post("/api/create_account",[authJwt.verifyToken], controller.createAccount);


    /**
   * Save setting for multi thread preprocessing
   * @param {Number} file_dize
   * @param {String} base_name
   * @return {JSON} {folder_path,aws_region, bucket, credential}
   */
    app.post("/api/request_upload",[authJwt.verifyToken, permission.getUserAndAccount], storage_controller.s3_temp_credential);

  /**
   * Save setting for multi thread preprocessing
   * @param {String} base_name
   * @return {JSON} {success,usage,limit,files}
   */
    app.post("/api/list_files",[authJwt.verifyToken, permission.getUserAndAccount], storage_controller.s3_list_files);

      /**
   * Save setting for multi thread preprocessing
   * @param {String} base_name
   * @param {String} file_name
   * @return {JSON} {success,usage,limit,files}
   */
    app.post("/api/delete_file",[authJwt.verifyToken, permission.getUserAndAccount], storage_controller.s3_delete_file);

};