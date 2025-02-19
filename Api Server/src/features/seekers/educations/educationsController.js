const educationService=require('./educationsService')

module.exports.addEducationController=async(req,res,next)=>{
    try{
        let userId=req.userId;
        let{school_name,field,degree,grade,start_date,end_date}=req.body;

        await educationService.addEducationService(userId,school_name,field,degree,grade,start_date,end_date);
        
        res.status(201).json({
            success:"true",
            message:"Education added successfully" 
        })
    
    }catch(err){
        console.log("err in addEducationController",err.message)
        next(err);
    }
}

module.exports.getEducationController=async(req,res,next)=>{
    try{
        let seekerId=req.params.seekerId
        let result=await educationService.getEducationService(seekerId);

        res.status(200).json({
            success:true,
            education:result
        })

    }catch(err){
        console.log("err in getEducationController",err.message)
        next(err);
    }
}

module.exports.deleteEducationController=async(req,res,next)=>{
    try{
        let educationId=req.params.educationId;
        let seekerId=req.userId;
        await educationService.deleteEducationService(educationId,seekerId); 
        res.status(200).json({
            success:true,
            message:"Education deleted successfully"
        })
    }catch(err){
        console.log("err in deleteEducationController",err.message)
        next(err);
    }
}