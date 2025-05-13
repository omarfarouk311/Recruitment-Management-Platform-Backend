const assessmentService=require('./assessmentService');



module.exports.add_AssessmentController = async (req, res,next) => {
   try{
    const assessmentData=req.body;
    // assessmentData.companyId=req.body.companyId; // will change later to be taken from the token
    assessmentData.companyId=req.userId

   
   
    const assessment=await assessmentService.add_AssessmentService(assessmentData);
    
    return res.status(201).json({
        success: true,
        assessment: assessment,// in case front will need the assessment data
        message:"Assessment added successfully"
    })
    }catch(err){
        console.log("Error in addAssessmentController", err.message)
        next(err)
   } 
}

module.exports.get_All_AssessmentController=async(req,res,next)=>{
    try{
        let {jobTitle}=req.query;
        // let companyId=req.body.companyId; // will change later to be taken from the token
        let companyId=req.userId
        const assessments=await assessmentService.get_All_AssessmentsService(companyId,jobTitle);
        return res.status(200).json({
            success: true,
            assessments: assessments
        })
    }
    catch(err){
        console.log("Error in getAssessmentController", err.message) 
        next(err)
    }

}

module.exports.get_AssessmentByIdController=async(req,res,next)=>{
    try{
        let assessmentId=req.params.id;
        const assessment=await assessmentService.get_AssessmentByIdService(assessmentId);
        return res.status(200).json({
            success: true,
            assessment: assessment
        })
    }
    catch(err){
        console.log("Error in getAssessmentByIdController", err.message) 
        next(err)
    }

}


module.exports.edit_AssessmentByIdController=async(req,res,next)=>{
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
        console.log("Error in updateAssessmentByIdController", err.message) 
        next(err)
    }
}


module.exports.delete_AssessmentByIdController=async(req,res,next)=>{
    try{

        let assessmentId=req.params.id;
        let companyId=req.userId
        await assessmentService.delete_AssessmentByIdService(assessmentId,companyId);
        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully"
        })

    }catch(err){
        console.log("Error in deleteAssessmentByIdController", err.message) 
        next(err)
    }
}


module.exports.compute_JobSeekerScore=async(req,res,next)=>{
    try{
        let assessmentId=req.params.id;
        let jobId=req.params.jobId;
        // let jobSeekerId=req.body.jobSeekerId // will change later to be taken from the token
        let jobSeekerId=req.userId
        let metaData=req.body.metaData;
        // console.log(metaData)
        // console.log(assessmentId)
        // console.log(jobSeekerId)
        // console.log(jobId)

        let result=await assessmentService.compute_JobSeekerScoreService(assessmentId,jobId,jobSeekerId,metaData);

        if(result==-2){  // for more than one submission
            return res.status(409).json({
                success: false,
                message: "You have already submitted the assessment"
            })
        }
        else if(result==-1){ // for time exceeds
            return res.status(404).json({
                success: false,
                message: "you have exceed the time of the assessment,submition failed"
            })
        }
        return res.status(200).json({
            success: true,
            message: "submitted successfully"
        })
    }catch(err){
        console.log("Error in compute_JobSeekerScore", err.message) 
        next(err)
    }
}

module.exports.get_JobSeekerScore=async(req,res,next)=>{
    try{
        let jobId=req.params.jobId;
        let jobSeekerId=req.params.jobSeekerId;
        const scoreData=await assessmentService.get_JobSeekerScoreService(jobId,jobSeekerId);
    
        let returnedData=[]
        scoreData.forEach((curObj)=>{
             returnedData.push({
                PhaseName: curObj.phase_name,
                AssessmentScore: curObj.score,
                numberOfQuestions: curObj.total_score})
        })
      
        return res.status(200).json({
            success: true,
            jobSeekerScore: returnedData
        })
    }catch(err){
        console.log("Error in get_JobSeekerScore", err.message) 
        next(err)
    }


}
module.exports.get_Seeker_Assessment_Dashboard=async(req,res,next)=>{
    try{
        let seekerId=req.userId;
        let{country,city,status,companyName,sorted,page}=req.query;
        let result=await assessmentService.get_Seeker_Assessment_DashboardService(seekerId,country,city,status,companyName,sorted,page);
        return res.status(200).json({
            success: true,
            result: result 
        })

    }catch(err){
        console.log("Error in get_Seeker_Assessment_Dashboard", err.message)
        next(err);
    }
}

module.exports.get_Seeker_Assessment_Details=async(req,res,next)=>{

    try{

        let assesmentId=req.params.assessmentId;
        let seekerId=req.userId;
        let jobId=req.params.jobId;

        let assessmentDetails=await assessmentService.get_Seeker_Assessment_DetailsService(assesmentId,seekerId,jobId);
        if(!assessmentDetails){
            let err=new Error()
            err.status=404;
            err.msg="Assessment not found"
            throw err;
        }
        return res.status(200).json({
            success: true,
            assessmentDetails: assessmentDetails
        })



    }catch(err){
        console.log("Error in get_Seeker_Assessment_Details", err.message)
        next(err);
    }

}