const assessmentService=require('./assessmentService');


module.exports.add_AssessmentController = async (req, res) => {
   try{
    const assessmentData=req.body;
    assessmentData.companyId=req.params.id; // will change later to be taken from the token
   

    const assessment=await assessmentService.add_AssessmentService(assessmentData);
    
    return res.status(201).json({
        success: true,
      //  assessment: assessment, in case front will need the assessment data
        message:"Assessment added successfully"
    })
    }catch(err){
        console.log("Error in addAssessmentController", err.message) // may be changed later to be handled by error handler function
         return res.status(500).json({
              success: false,
              message: err.message
        })
   } 
}

module.exports.get_All_AssessmentController=async(req,res)=>{
    try{
        let {jobTitle}=req.query;
        let companyId=req.body.companyId; // will change later to be taken from the token
        const assessments=await assessmentService.get_All_AssessmentsService(companyId,jobTitle);
        return res.status(200).json({
            success: true,
            assessments: assessments
        })
    }
    catch(err){
        console.log("Error in getAssessmentController", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

}

module.exports.get_AssessmentByIdController=async(req,res)=>{
    try{
        let assessmentId=req.params.id;
        const assessment=await assessmentService.get_AssessmentByIdService(assessmentId);
        return res.status(200).json({
            success: true,
            assessment: assessment
        })
    }
    catch(err){
        console.log("Error in getAssessmentByIdController", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

}


module.exports.edit_AssessmentByIdController=async(req,res)=>{
    try{
        let assessmentId=req.params.id;
        const updatedAssessmentData=req.body;
        const updatedAssessment=await assessmentService.edit_AssessmentByIdService(assessmentId,updatedAssessmentData);

        return res.status(200).json({
            success: true,
            //assessment: updatedAssessment, // in case front will need the updated assessment data
            message: "Assessment updated successfully"
        })

    }catch(err){
        console.log("Error in updateAssessmentByIdController", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports.delete_AssessmentByIdController=async(req,res)=>{
    try{

        let assessmentId=req.params.id;
        await assessmentService.delete_AssessmentByIdService(assessmentId);
        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully"
        })

    }catch(err){
        console.log("Error in deleteAssessmentByIdController", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports.compute_JobSeekerScore=async(req,res)=>{
    try{
        let assessmentId=req.params.id;
        let jobId=req.params.jobId;
        let jobSeekerId=req.body.jobSeekerId // will change later to be taken from the token
        let answers=req.body.answers;

        const savedScore=await assessmentService.compute_JobSeekerScoreService(assessmentId,jobId,jobSeekerId,answers);
        if(!savedScore){
            console.log("Error in compute_JobSeekerScore")
            throw new Error("Failed to save the score in compute_JobSeekerScore")
        }

        return res.status(200).json({
            success: true,
            message: "submitted successfully"
        })
    }catch(err){
        console.log("Error in compute_JobSeekerScore", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports.get_JobSeekerScore=async(req,res)=>{
    try{
        let jobId=req.params.jobId;
        let jobSeekerId=req.params.jobSeekerId;
        const scoreData=await assessmentService.get_JobSeekerScoreService(jobId,jobSeekerId);
        let returnedData = {
            assessmentName: scoreData.phase_name,
            AssessmentScore: scoreData.score,
            numberOfQuestions: scoreData.total_score
        };
        return res.status(200).json({
            success: true,
            jobSeekerScore: returnedData
        })
    }catch(err){
        console.log("Error in get_JobSeekerScore", err.message) // may be changed later to be handled by error handler function
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }


}