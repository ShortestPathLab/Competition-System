const config = require("../../config");
const db = require("../../app/models");
const utils = require("../../utils");
const log = require("loglevel");
const config_benchmark = require("../../config_benchmark");


const Queue = db.queue;
const Account = db.account;
const Submission = db.submission;
const Jobs = db.jobs;
const User = db.user;
const Record = db.record;
const Role = db.role;

const uri = config.mongoose_string;
db.mongoose.set('strictQuery', false);
db.mongoose
.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    //  maxIdleTimeMS : 270000, minPoolSize : 2, maxPoolSize : 4,
    tls: true, 
    // sslValidate: false, 
    tlsCAFile: config.sslCA_path,
    tlsAllowInvalidHostnames: true,
    directConnection: true
})
.then(() => {
    console.log("Successfully connect to MongoDB.");
})
.catch(err => {
    console.error("Connection error", err);
    process.exit();
});

class DB_tool{
    constructor (){
        this.Queue = Queue;
        this.Account = Account;
        this.Submission = Submission;
        this.Jobs = Jobs;
        this.User = User;
        this.Record = Record;
        this.Role = Role;
        
    };

    reset_user_account = async ()=>{
        await User.deleteMany({});
        await Account.deleteMany({});
        return;
    }

    reset_submissions = async ()=>{
        await Submission.deleteMany({});
        return;
    }

    reset_queue = async ()=>{
        await Queue.deleteMany({});
        await Jobs.deleteMany({});
        return;
    }



    count_jobs = async ()=>{
        return await Jobs.estimatedDocumentCount().exec()
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    done_one_debug = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{debuged_instances:1}});
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    done_one_pre = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{precomputed_instances:1}});
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    done_one_eva = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{evaluated_instances:1}});
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    fail_one_pre = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{failed_precomputing_instances:1}});
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    fail_one_eva = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{failed_evaluation_instances:1}});
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @returns {Promise}
     */
    fail_one_dbug = (sub_id) =>{
        return this.update_submission_by_id(sub_id,
             {$inc:{failed_debug_instances:1}});
    }



    create_job = async (job)=>{
        return await Jobs.create(job);
    }

    /**
     * 
     * @param {ObjectId} id 
     * @returns {Account}
     */
    get_account_by_id= async (id,fields = undefined)=>{
        if (fields){
            return await Account.findById(id,fields).exec();
        }
        return await Account.findById(id).exec();
    }


    /**
     * 
     * @param {ObjectId} id 
     * @returns {Submission}
     */
     get_submission_by_id= async (id,fields = undefined)=>{
        if (fields){
            return await Submission.findById(id, fields).exec();
        }
        return await Submission.findById(id).exec();


    }

    

    /**
     * 
     * @param {ObjectId} sub_id 
     * @returns {Submission}
     */
     get_progress_count_by_id= async (sub_id)=>{
        return await Submission.findById(sub_id,["total_instances","evaluated_instances","failed_evaluation_instances","message"]).exec();
    }


    /**
     * 
     * @param {ObjectId} sub_id 
     * @returns {Submission}
     */
     get_evaluation_data_by_id= async (sub_id)=>{
        return await Submission.findById(sub_id,["precomputing_data","evaluation_data"]).exec();
    }

    pop_queue = async ()=>{
        return await Queue.findOneAndDelete({},{sort:{_id: 1}}).exec();
    }
    
    pop_job = async (excluded_accounts)=>{
        return await Jobs.findOneAndDelete({
            $or:[
                {
                    $and:[
                        {account:{$nin:excluded_accounts}},
                    ]
                },
                {

                    state: utils.JOB_STATE.canceled,

                },
                {
                    state:  utils.JOB_STATE.done,
                }
            ]
        },{sort:{_id: 1}}).exec();
    }
    
    delete_job_by_id = async (job_id) =>{
        return await Jobs.findOneAndDelete({_id: job_id}).exec();
    }
    get_awaiting_jobs = async (excluded_accounts)=>{
        return await Jobs.find({
            $or:[
                {
                    account:{$nin:excluded_accounts}
                },
                {

                    state: utils.JOB_STATE.canceled,

                },
                {
                    state:  utils.JOB_STATE.done,
                }
            ]
        }).exec();
    }

    /**
     * 
     * @param {ObjectId} job_id 
     * @param {Promise} [Query] 
     */
        update_job_by_id = (job_id, content)=>{
        return Jobs.updateOne(
            {_id: job_id},
            content
        ).exec();
    }


    is_job_canceled = async (job_id) =>{

        try{
        let job =await Jobs.findById(job_id, ["state"]).exec();
        return job==undefined || utils.JOB_STATE.canceled == job.state ;
        }
        catch(e){
            return false;
        }
    }

    /**
     * 
     * @param {ObjectID} sub_id 
     * @param {Object} data 
     * @param {Boolean} debug 
     * @returns {Query}
     */
    push_preprocessing_data = (sub_id, data, debug = false)=>{
        if(debug){
            return this.update_submission_by_id(sub_id,
                {$push:{debug_precomputing_data:data}});
        }
        else {
            return this.update_submission_by_id(sub_id,
                {$push:{precomputing_data:data}});
        }
    }

    push_evaluation_data = (sub_id, data)=>{
        return this.update_submission_by_id(sub_id,
            {$push:{evaluation_data:data}});
    }
    /**
         * 
         * @param {ObjectId} sub_id 
         * @param {Promise} [Query] 
         */
    update_job_by_sub = (sub_id, content)=>{
        return Jobs.updateOne(
            {submission: sub_id},
            content
        ).exec();
    }
    /**
     * 
     * @param {ObjectId} sub_id 
     * @param {Promise} [Query] 
     */
    update_submission_by_id = (sub_id, content)=>{
        return Submission.updateOne(
            {_id: sub_id},
            content
        ).exec();
    }

    /**
     * 
     * @param {ObjectId} account_id 
     * @param {Promise} [Query] 
     */
        update_account_by_id = (account_id, content)=>{
        return Account.updateOne(
            {_id: account_id},
            content
        ).exec();
    }
    


    submission_failed = (sub_id, status, message)=>{
        log.warn(`Submission Failed: ${sub_id} ${status} ${message}`)
        Submission.updateOne(
            {_id: sub_id},
            {
                success:false,
                submission_status : status,
                message : message,
            }
        ).exec(); 
    }

    reset_evaluator_status = (account_id)=>{
        log.info(`Reset evaluator of: ${account_id}`)

        return Account.updateOne(
            {_id: account_id},
            {status: utils.STATE.idle}
        ).exec();
    }

    log_to_submission = (sub_id,data,both = true)=>{
        this.log_to_progress(sub_id,data);
        this.log_to_progress_private(sub_id,data);

    }

    log_to_progress = (sub_id, data, no_time = false)=>{
        log.info(sub_id,":",data);
        Submission.updateOne(
            { _id: sub_id }, 
            { $push: { progress_log: `${no_time?utils.day():utils.timestamp()} ${data}` } }).exec();
    }

    log_to_progress_private = (sub_id, data)=>{
        log.info(sub_id,":",data);
        Submission.updateOne(
            { _id: sub_id }, 
            { $push: { private_log: `${utils.timestamp()} ${data}` } }).exec();
    }

    reset_evaluator= async (base_name) => {

        var account =  await Account.find({base_name:base_name}).exec();


        if(account == undefined){
            return false;
        }

        await Account.updateOne(
            {_id: account._id},
            {status: utils.STATE.idle}
        ).exec();

        await Jobs.deleteMany({account: account._id});
        return true;

    }

    make_admin = async (user_name) => {
        var user = await User.findOne({username:user_name}).exec();
        if(user == undefined){
            return false;
        }
        var admin_role = await Role.findOne({name: "admin"}).exec();
        if(admin_role == undefined){
            return false;
        }
        //append the admin role to roles
        var out = await User.updateOne(
            {_id: user._id},
            {$push: {roles: admin_role._id}}
        ).exec();
        console.log(out);
        return true;
    }

    get_all_accounts_lean = async (fields)=>{
        return await Account.find({},fields).lean().exec();
    }

    get_all_users_lean = async (fields)=>{
        return await User.find({},fields).lean().exec();
    }



    update_record = async (instance, newMetric, newSubmission)=>{
      
        try {
            let submission = await this.get_submission_by_id(newSubmission,["competition"]);
            let competition = submission.competition;


            const update = { $setOnInsert: {
                instance:instance,
                competition:competition,
                metric: newMetric,
                submission: newSubmission,
                history: []
              } };
            const options = { upsert: true, new: true };
          let record = await Record.findOneAndUpdate({ instance:instance,competition:competition }, update, options);
      
          if (record.metric < newMetric) {
            const update = {
              $set: { metric: newMetric,submission: newSubmission },
              $push: { history: record.submission }
            };
      
            record = await Record.findOneAndUpdate({ instance:instance,competition:competition }, update, { new: true });
          }
      
          return record;
        } catch (error) {
      
          console.error(error);
          throw error;
        }

    }
}
module.exports = DB_tool;