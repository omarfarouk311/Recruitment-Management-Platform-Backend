const assessmentsModel = require('./assessmentModel');
const Kafka = require('../../common/kafka')
const { action_types, logs_topic,candidate_status_pending,candidate_status_accepted,candidate_status_rejected,phase_types } = require('../../../config/config')
const { v6: uuid } = require('uuid');
const primaryPool=require('../../../config/db')





module.exports.add_AssessmentService=async (assessmentData) => {
    const primary_DB=primaryPool.getWritePool();
    const client=await primary_DB.connect();  // to open a connection to the database and do not close it until the transaction is done
    try{

        client.query('BEGIN')
        let companyName=await assessmentsModel.getCompanyName(assessmentData.companyId,client)

        let numOfQuestions=assessmentData.metaData.length // get num of questions based on the number of elements in the array of json(meta data)
        assessmentData.numberOfQuestions=numOfQuestions;
       

        const assessment=await assessmentsModel.save(assessmentData,client);


        await Kafka.produce({
            id: uuid(),
            performed_by: companyName,
            company_id: assessmentData.companyId,
            extra_data: null,
            action_type: action_types.create_assessment,
            created_at: new Date(),
        }, logs_topic)
        

        console.log("here")
        client.query('COMMIT')
        return assessment;

    }catch(err){
        client.query('ROLLBACK')
        throw err
    }finally{
        client.release()
    }
     

}

module.exports.get_All_AssessmentsService=async (companyId,jobTitle) => {
        if(jobTitle){
            const assessments=await assessmentsModel.getAssessmentsByJobTitle(companyId,jobTitle);
            return assessments;
        }
        else{
            const assessments=await assessmentsModel.getAssessments(companyId);
            return assessments;
        }
}


module.exports.get_AssessmentByIdService=async (assessmentId) => {
  
        const assessment=await assessmentsModel.getAssessmentById(assessmentId);
    
        return assessment;
}


module.exports.edit_AssessmentByIdService=async (assessmentId,assessmentData) => {

        let numOfQuestions=assessmentData.metaData.length;
        assessmentData.numberOfQuestions=numOfQuestions;
        const updatedAssessment=await assessmentsModel.edit(assessmentId,assessmentData);
        return updatedAssessment;
       
}

module.exports.delete_AssessmentByIdService=async(assessmentId,companyId)=>{
    const primary_DB=primaryPool.getWritePool();
    const client=await primary_DB.connect();
    try{

        client.query('BEGIN')
        let companyName=await assessmentsModel.getCompanyName(companyId,client)
        await assessmentsModel.delete(assessmentId,client);
        Kafka.produce({
            id: uuid(),
            performed_by: companyName,
            company_id:companyId,
            extra_data: null,
            action_type: action_types.remove_assessment,
            created_at: new Date(),
        }, logs_topic)

        client.query('COMMIT')
        return true;


    }catch(err){
        client.query('ROLLBACK')
        throw err
    }finally{
        client.release()
    }
}
    
module.exports.delete_AssessmentByIdService=async(assessmentId,companyId)=>{
    const primary_DB=primaryPool.getWritePool();
    const client=await primary_DB.connect();
    try{

        client.query('BEGIN')
        let companyName=await assessmentsModel.getCompanyName(companyId,client)
        await assessmentsModel.delete(assessmentId,client);
        Kafka.produce({
            id: uuid(),
            performed_by: companyName,
            company_id:companyId,
            extra_data: null,
            action_type: action_types.remove_assessment,
            created_at: new Date(),
        }, logs_topic)

        client.query('COMMIT')
        return true;


    }catch(err){
        client.query('ROLLBACK')
        throw err
    }finally{
        client.release()
    }
    
}


module.exports.compute_JobSeekerScoreService=async(assessmentId,jobId,jobSeekerId,metaData)=>{

    let checkSubmitted=await assessmentsModel.checkSubmitted(jobSeekerId,jobId);
   
    if(checkSubmitted){
        return -2;
    }
    
    let assessmentDeadline=await assessmentsModel.checkStartTime_assessmet(jobSeekerId,jobId);
    assessmentDeadline=assessmentDeadline; 
    let currentTime = new Date();
    const timestamp = currentTime.toISOString();    
    if(assessmentDeadline<timestamp){
        return -1;
    }
  
    await assessmentsModel.updateAssessmentSubmitted(jobSeekerId,jobId,true); // update the status of the assessment to be submitted
    let assessmentData=await assessmentsModel.getAssessmentById(assessmentId);
    let num_of_questions=assessmentData.assessmentInfo.numberOfQuestions
    let score=0;
    assessmentData.questions.forEach((Obj)=>{    
        const questionId=Obj.id;  
        const correctAnswer=Obj.correctAnswers; 

        let jobSeekerObj=metaData.find((jobSeekerMetaData)=>{ 
            
            return jobSeekerMetaData.questionId==questionId
        })
        
        const jobSeekerAnswer = jobSeekerObj ? jobSeekerObj.answers : [];
       
        correctAnswer.sort();
        jobSeekerAnswer.sort();
        console.log(correctAnswer, jobSeekerAnswer);
        if(jobSeekerAnswer.length==correctAnswer.length&& correctAnswer.every((value, index) => value === jobSeekerAnswer[index])){
            score++;
        }
    })
    let savedScore=await assessmentsModel.saveAssessmentScore(jobId,jobSeekerId,assessmentId,score,num_of_questions);

    return savedScore;
}

module.exports.get_JobSeekerScoreService=async(jobId,jobSeekerId)=>{

    let jobSeekerScore=await assessmentsModel.getJobSeekerScore(jobId,jobSeekerId);
    return jobSeekerScore

}

module.exports.get_Seeker_Assessment_DashboardService=async(seekerId,country,city,status,companyName,sorted,page)=>{
    let result
    result=assessmentsModel.get_Seeker_Assessment_Dashboard_Pending(seekerId,country,city,companyName,sorted,page);
    return result
    
}

module.exports.get_Seeker_Assessment_DetailsService=async(assessmentId,seekerId,jobId)=>{

    let checkTimme=await assessmentsModel.checkStartTime_assessmet(seekerId,jobId);
    let result
    if(checkTimme!=null){
        result=await assessmentsModel.get_Seeker_Assessment_DetailsModel(assessmentId,seekerId,jobId,0);//refresh 
    }
    else
    result=await assessmentsModel.get_Seeker_Assessment_DetailsModel(assessmentId,seekerId,jobId,1);//first time
    return result
}


