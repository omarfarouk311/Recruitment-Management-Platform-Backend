
const assessmentsModel = require('./assessmentModel');
const { role } = require('../../../config/config')

module.exports.authorizeCompanyAssessment=async(req,res,next)=>{

    try{
        let assessmentId=parseInt(req.params.id);

    
        if(req.userRole!=role.company){
            let err=new Error();
            err.msg="You are not authorized to access this assessment only company can"
            err.status=404;
            throw err;
        }
        let companyId=req.userId
        let returnCompanyId=await assessmentsModel.validateCompanyAssessment(assessmentId);
      
        if(!returnCompanyId){
             let err=new Error()
                err.status=400;
                err.msg="Assessment not found"
                throw err;
        }
        if(returnCompanyId!=companyId||req.userRole!=role.company){
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
        let companyId=req.userId 
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

        if(returnedCompanyId!=companyId||req.userRole!=role.company){
            let err=new Error()
            err.status=403;
            err.msg="You are not authorized to access this assessment"
            throw err
        }
        next();
    }catch(err){
        next(err);
    }
}

module.exports.authorizeCompany=async(req,res,next)=>{
    try{
        let userRole=req.userRole
        if(userRole!=role.company){
            let err=new Error();
            err.msg="Only company can do this action"
            err.status=403
            throw err
        }
        next()

    }catch(err){
        next(err)
    }
}

module.exports.authorizeSeeker=async(req,res,next)=>{
    try{
        let userRole=req.userRole
        if(userRole!=role.jobSeeker){
            let err=new Error();
            err.msg="Only job seeker can do this action"
            err.status=403
            throw err
        }
        next()

    }catch(err){
        next(err)
    }
}