
const recruiterService = require('./recruiterService');
const config = require('../../../config/config');

module.exports.getRecruitersContoller = async (req, res, next) => {  

   try{
     let companyId=req.params.companyId
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