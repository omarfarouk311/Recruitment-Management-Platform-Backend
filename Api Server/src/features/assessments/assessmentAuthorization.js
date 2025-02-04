
const assessmentsModel = require('./assessmentModel');

module.exports.authorizeCompany=async(req,res,next)=>{

    try{
        let assessmentId=parseInt(req.params.id);

        if(!assessmentId){
            throw err;
        }
        let companyId=req.body.companyId // will change to be taken from the token
        let returnCompanyId=await assessmentsModel.validateCompanyAssessment(assessmentId);
      
        if(!returnCompanyId){
             let err=new Error()
                err.status=404;
                err.msg="Assessment not found"
                throw err;
        }
        if(returnCompanyId!=companyId){
            let err=new Error()
            err.status=404;
            err.msg="You are not authorized to access this assessment"
            throw err;
        }    
        next();

    }catch(err){
        next(err)
    }
   



}

module.exports.authorizeCompanyJob=async(req,res,next)=>{

    try{
        let companyId=req.body.companyId // will change to be taken from the token
        let jobId=parseInt(req.params.jobId)


        if(!jobId){

            throw new Error()
        }
        let validJob=await assessmentsModel.validJob(jobId) //check whether the job is there or not from beginning
        if(!validJob){

            let err=new Error()
            err.status=404;
            err.msg="Job not found"
            throw err;
        }

        let returnedCompanyId=await assessmentsModel.validateCompanyJob(jobId);// to check if company is authorized to access this job
        if(returnedCompanyId!=companyId){
            let err=new Error()
            err.status=404;
            err.msg="You are not authorized to access this assessment"
            throw err
        }
        next();
    }catch(err){
        next(err);
    }
}