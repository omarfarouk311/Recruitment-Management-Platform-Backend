const recruiterModel=require('./recruiterModel')


module.exports.getRecruitersService=async(companyId,recruiter,department,sorted,page,limit)=>{
    //1 or null sort by assigned cnt asc
    //-1 sort by assigned cnt desc
    
   let result=await recruiterModel.getRecruiters(companyId,recruiter,department,sorted,page,limit)
   return result
}

module.exports.deleteRecruiterService=async(companyId,recruiterId)=>{
    return await recruiterModel.deleteRecruiter(companyId,recruiterId)
}

module.exports.sendInvitationService=async(email,department,deadline,companyId)=>{
    return await recruiterModel.sendInvitation(email,department,deadline,companyId)
}

module.exports.getUniquetDepartmentsService=async(companyId)=>{
    return await recruiterModel.getUniqueDepartments(companyId)
}

module.exports.getJobOfferSentService=async(recruiterId,jobTitle,sorted,page,limit)=>{
    return await recruiterModel.getJobOfferSent(recruiterId,jobTitle,sorted,page,limit)
}

module.exports.getJobTitleListService=async(recruiterId)=>{
    return await recruiterModel.getJobTitleList(recruiterId)
}