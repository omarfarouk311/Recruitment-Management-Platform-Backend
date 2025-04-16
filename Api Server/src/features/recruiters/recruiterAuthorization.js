const recruiterModel=require('./recruiterModel')
const {role}=require('../../../config/config')

module.exports.authorizeCompanyRecruiter=async(req,res,next)=>{  //check if company has authority to delete recruiter

    try{
        
        let recruiterId=req.params.recruiterId;

        let checkRecruiter=await recruiterModel.getRecruiterById(recruiterId) // see if recruiter exists in this company
        if(!checkRecruiter){
            let err=new Error()
            err.msg="Recruiter does not exist"
            err.status=404
            throw err
        }
        
        next();

    }catch(err){
        console.log("err in authorizeCompanyRecruiter ")
        next(err);
    }

}


module.exports.authorizeRecruiter=async(req,res,next)=>{
     if(req.userRole!=role.recruiter){
        let err=new Error();
        err.msg="You are not authorized to do this action"
        err.status=403
        return next(err);
     }else{
        next();
     }
}

module.exports.authorizeCompany=async(req,res,next)=>{
    if(req.userRole!=role.company){
        let err=new Error();
        err.msg="The company only authorized to do this action"
        err.status=403
        return next(err);
    }else{
        next();
    }
}
