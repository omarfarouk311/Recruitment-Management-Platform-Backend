
const assessmentsModel = require('./assessmentModel');

module.exports.authorizeCompany=async(req,res,next)=>{
    let assessmentId=req.params.id;

    if(!assessmentId){
        return res.status(400).json({
            success: false,
            message: "Assessment Id is required"
        })
    }
    let companyId=req.body.companyId // will change to be taken from the token
    let returnCompanyId=await assessmentsModel.validateCompanyAssessment(assessmentId);
  
    if(!returnCompanyId){
        return res.status(404).json({
            success: false,
            message: "Assessment not found"
        })
    }
    if(returnCompanyId!=companyId){
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this assessment"
        })
    }
    next();


}

module.exports.authorizeCompanyJob=async(req,res,next)=>{
    let companyId=req.body.companyId // will change to be taken from the token
    let jobId=req.params.jobId

    if(!jobId){
        return res.status(400).json({
            success: false,
            message: "Job Id is required"
        })
    }
    let validate=await validateCompanyJob(jobId);// to check if company is authorized to access this job
    if(!validate){
        return res.status(403).json({
            success: false,
            message: "You are not authorized to access this assessment"
        })
    }

    next();
}