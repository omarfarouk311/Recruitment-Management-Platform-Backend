
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
        let companyId=req.userId

        await recruiterService.deleteRecruiterService(companyId,recruiterId)

        return res.status(200).json({
            success:true,
            message:"Recruiter deleted successfully"
        })

    }catch(err){
        console.log("err in deleteRecruiterController",err.message)
        next(err);
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

module.exports.getJobOfferSentController=async(req,res,next)=>{
    try{
        let recruiterId=req.userId;
        let jobTitle=req.query.jobTitle;
        let sorted=req.query.sorted;
        let page=req.query.page
        let limit=config.pagination_limit
        let result=await recruiterService.getJobOfferSentService(recruiterId,jobTitle,sorted,page,limit)

        res.status(200).json({
            success:true,
            jobOffers:result
        })


    }catch(err){
        console.log("err in getJobOfferSentController")
        next(err)
    }
}

module.exports.getJobTitleList=async(req,res,next)=>{
    try{
        let recruiterId=req.userId;
        let result=await recruiterService.getJobTitleListService(recruiterId)
        res.status(200).json({
            success:true,
            jobTitles:result
        })
    }catch(err){
        console.log("err in getJobTitleList")
        next(err)
    }
}

module.exports.getRecruiterDataController=async(req,res,next)=>{
    try{

        let recruiteId=req.userId
        let result=await recruiterService.getRecruiterDataService(recruiteId);
      
        res.status(200).json({
            success:true,
            recruiterData:result
        })

    }catch(err){
        console.log("err in getRecruiterDataController")
        next(err)
    }
}

module.exports.getProfilePicController=async(req,res,next)=>{

    try {
        let recruiterId=req.userId

        const {
            metaData: { 'content-type': contentType, filename: fileName },
            size,
            stream
        } = await getProfilePicService(recruiterId); // once the object return the await will finish but the stream will not
                                                                                // be fully read as it came in chunks and will resond it as soon as chunk came from the readable stream

        res.header({
            'Content-Type': contentType,
            'Content-Length': size,
            'Content-Disposition': `inline; filename = ${fileName}` // inline to display the image not download it
        }).status(200);

        stream.on('error', (err) => next(err));

        stream.pipe(res);
    }
    catch (err) {
        if (err.code === 'NotFound') {
            err.msg = 'Company photo not found';
            err.status = 404;
            return next(err);
        }
        next(err);
    }
}