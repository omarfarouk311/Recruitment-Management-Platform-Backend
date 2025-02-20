const educationModel=require('./educationsModel')

module.exports.addEducationService=async(userId,school_name,field,degree,grade,start_date,end_date)=>{
    return await educationModel.addEducation(userId,school_name,field,degree,grade,start_date,end_date)
}

module.exports.getEducationService=async(seekerId)=>{
    return await educationModel.getEducation(seekerId);
}
module.exports.deleteEducationService=async(educationId,seekerId)=>{
    return await educationModel.deleteEducation(educationId,seekerId);
}

module.exports.editEducationService=async(seekerId,educationId,school_name,field,degree,grade,start_date,end_date)=>{
    return await educationModel.editEducation(seekerId,educationId,school_name,field,degree,grade,start_date,end_date); 
}

