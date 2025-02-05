const assessmentsModel = require('./assessmentModel');


module.exports.add_AssessmentService=async (assessmentData) => {
       
        let numOfQuestions=assessmentData.metaData.length // geth num of questions based on the number of elements in the array of json(meta data)
        assessmentData.numberOfQuestions=numOfQuestions;

        const assessment=await assessmentsModel.save(assessmentData);
        return assessment;

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

module.exports.delete_AssessmentByIdService=async(assessmentId)=>{

     await assessmentsModel.delete(assessmentId);
    
     return true;
}


module.exports.compute_JobSeekerScoreService=async(assessmentId,jobId,jobSeekerId,metaData)=>{
  
    let assessmentData=await assessmentsModel.getAssessmentById(assessmentId);
    let num_of_questions=assessmentData.assessmentInfo.numberOfQuestions
    let score=0;
  
    assessmentData.questions.forEach((Obj)=>{    
        const question=Obj.question;  
        const correctAnswer=Obj.correctAnswers; 

        let jobSeekerObj=metaData.find((jobSeekerMetaData)=>{ 
            
            return jobSeekerMetaData.question==question
        })
        
        const jobSeekerAnswer = jobSeekerObj ? jobSeekerObj.answers : [];
       
        correctAnswer.sort();
        jobSeekerAnswer.sort();
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

