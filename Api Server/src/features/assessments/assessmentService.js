const assessmentsModel = require('./assessmentModel');


module.exports.add_AssessmentService=async (assessmentData) => {
       
        let numOfQuestions=assessmentData.metaData.length // geth num of questions based on the number of elements in the array of json(meta data)
        assessmentData.numberOfQuestions=numOfQuestions;

        const assessment=await assessmentsModel.save(assessmentData);
        if(!assessment){
            console.log("Error in addAssessmentService, assessment not added")
            handleErrors("Assessment not added") 
        }
        return assessment;

}

module.exports.get_All_AssessmentsService=async (companyId,jobTitle) => {
        if(jobTitle){
            const assessments=await assessmentsModel.getAssessmentsByJobTitle(companyId,jobTitle);
            if(!assessments){// more validation can be added here
                console.log("Error in get_All_AssessmentsService, assessments not found")
                handleErrors("assessments not found")  
            }
            return assessments;
        }
        else{
            const assessments=await assessmentsModel.getAssessments(companyId);
            if(!assessments){// more validation can be added here
                console.log("Error in get_All_AssessmentsService, assessments not found")
                handleErrors("assessments not found")  
            }
            return assessments;
        }
}


module.exports.get_AssessmentByIdService=async (assessmentId) => {
  
        const assessment=await assessmentsModel.getAssessmentById(assessmentId);
        if(!assessment){
            console.log("Error inget_AssessmentByIdService, assessments not found")
            handleErrors("assessments not found")  
        }
        return assessment;
}


module.exports.edit_AssessmentByIdService=async (assessmentId,assessmentData) => {

        let numOfQuestions=assessmentData.metaData.length;
        assessmentData.numberOfQuestions=numOfQuestions;

        const updatedAssessment=await assessmentsModel.edit(assessmentId,assessmentData);
        if(!updatedAssessment){
            console.log("Error in update_AssessmentByIdService, assessment not Updated")
            handleErrors("assessment not Updated")  
        }
        return updatedAssessment;
       
}

module.exports.delete_AssessmentByIdService=async(assessmentId)=>{

     let deletedAssessment=await assessmentsModel.delete(assessmentId);
     if(!deletedAssessment){
         console.log("Error in delete_AssessmentByIdService, assessment not deleted")
         handleErrors("assessment not deleted")  
     }
     return true;
}


module.exports.compute_JobSeekerScoreService=async(assessmentId,jobId,jobSeekerId,answers)=>{
    let assessmentData=await assessmentsModel.getAssessmentById(assessmentId);
    let correctAnswers=assessmentData.correct_answers;
    let num_of_questions=assessmentData.num_of_questions
    let assessmentName=assessmentData.name;
    let score=0;
    correctAnswers.forEach((correctAnswerObj)=>{    //const correctAnswers = [   { 1: [1, 2, 3] },   { 2: [1, 2, 3] }]
        const questionId=Object.keys(correctAnswerObj)[0];   // get the question id
        const correctAnswer=correctAnswerObj[questionId];   // get the correct answer of the question

        let jobSeekerObj=answers.find((answerObj)=>{ 
            Object.keys(answerObj)[0]==questionId
        })
        
        const jobSeekerAnswer = jobSeekerObj ? jobSeekerObj[questionId] : [];

        correctAnswer.sort();
        jobSeekerAnswer.sort();
        if(jobSeekerAnswer.length==correctAnswer.length&& correctAnswer.every((value, index) => value === jobSeekerAnswer[index])){
            score++;
        }
    })
    let savedScore=await assessmentsModel.saveAssessmentScore(jobId,jobSeekerId,assessmentName,score,num_of_questions);
    if(!savedScore){
        console.log("Error in compute_JobSeekerScoreService, Assessment score not saved")
        handleErrors("Assessment score not saved")  
    }
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