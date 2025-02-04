const assessmentsModel = require('./assessmentModel');


module.exports.add_AssessmentService=async (assessmentData) => {
       
        let numOfQuestions=assessmentData.metaData.length // geth num of questions based on the number of elements in the array of json(meta data)
        assessmentData.numberOfQuestions=numOfQuestions;

        const assessment=await assessmentsModel.save(assessmentData);
        if(!assessment){
            console.log("Error in addAssessmentService, assessment not added")
        }
        return assessment;

}

module.exports.get_All_AssessmentsService=async (companyId,jobTitle) => {
        if(jobTitle){
            const assessments=await assessmentsModel.getAssessmentsByJobTitle(companyId,jobTitle);
            // if(!assessments){
            //     // console.log("Error in get_All_AssessmentsService, assessments not found")
            //     handleErrors("No asssessment found")  
            // }
            return assessments;
        }
        else{
            const assessments=await assessmentsModel.getAssessments(companyId);
            // if(!assessments){// more validation can be added here
            //     // console.log("Error in get_All_AssessmentsService, assessments not found")
            //     handleErrors("No assessment found")  
            // }
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
    if(!jobSeekerScore){    // in authorization will check of company have this job id and here if the database return nothing then that means no jobseeker with this id
        console.log("Error in get_JobSeekerScoreService, JobSeeker score not found")
        handleErrors("JobSeeker score not found")  
    }
    return jobSeekerScore

}


const handleErrors=(msg)=>{
     throw new Error(msg); // will be caught by controllers
}