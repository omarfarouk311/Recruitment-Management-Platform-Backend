
const recruiterService = require('./recruiterService');
const config = require('../../../config/config');

module.exports.getRecruitersContoller = async (req, res, next) => {  

   try{
     let companyId=req.userId
     let {recruiter,department,sorted,page}=req.query
     let limit=config.pagination_limit

     let result=await recruiterService.getRecruitersService(companyId,recruiter,department,sorted,page,limit)
     res.status(200).json({
        success: true,
        recruiters:result
    })
   }catch(err){
      console.log("Err in getRecruiters controller ")
      next(err)
   }
};

module.exports.deleteRecruiterController=async(req,res,next)=>{
    try{
        let recruiterId=req.params.recruiterId


        await recruiterService.deleteRecruiterService(recruiterId)

        return res.status(200).json({
            success:true,
            message:"Recruiter deleted successfully"
        })

    }catch(err){
        console.log("err in deleteRecruiterController",err.message)
        next(err);
    }


}

module.exports.sendInvitationController=async(req,res,next)=>{

    try{
        
        const {email,department,deadline}=req.body 
     
        await recruiterService.sendInvitationService(email,department,deadline,req.userId)
        res.status(200).json({
            success:true,
            message:"Invitation sent successfully"
        })

    }catch(err){
        console.log('err in sendInvitationController',err.message)
        next(err)
    }
}

module.exports.getUniquetDepartmentsController=async(req,res,next)=>{
    try{
        let result=await recruiterService.getUniquetDepartmentsService(req.userId)
        res.status(200).json({
            success:true,
            departments:result
        })

    }catch(err){
        console.log("err in getUniquetDepartmentsController")
        next(err)
    }
}