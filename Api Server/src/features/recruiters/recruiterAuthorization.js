const recruiterModel=require('./recruiterModel')

module.exports.authorizeCompanyRecruiter=async(req,res,next)=>{  //check if company has authority to delete recruiter

    try{
        let companyId=req.userId // from token later
        let recruiterId=req.params.recruiterId;

        let checkRecruiter=await recruiterModel.getRecruiterById(recruiterId) // see if recruiter exists in this company
        if(!checkRecruiter){
            let err=new Error()
            err.msg="Recruiter does not exist"
            err.status=404
            throw err
        }
        
        if(companyId!=checkRecruiter.company_id){
            let err=new Error()
            err.msg="you are not authorized to delete this recruiter"
            err.status=403
            throw err
        }
        next();

    }catch(err){
        console.log("err in authorizeCompanyRecruiter ")
        next(err);
    }

}

module.exports.authorizeInvitationData=async(req,res,next)=>{
    try{
        let {email}=req.body

        let checkRecruiter=await recruiterModel.getRecruiterByEmail(email)
        if(!checkRecruiter){
           let err=new Error();
           err.msg="No recruiter with this email"
           err.status=404
          throw err;
        }
        next()
    }catch(err){
        next(err);
    }
}