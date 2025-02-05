const recruiterModel=require('./recruiterModel')

module.exports.authorizeCompanyRecruiter=async(req,res,next)=>{  //check if company has authority to delete recruiter

    try{
        let companyId=req.body.companyId // from token later
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