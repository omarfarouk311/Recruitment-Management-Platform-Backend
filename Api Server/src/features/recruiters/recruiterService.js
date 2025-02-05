const recruiterModel=require('./recruiterModel')


module.exports.getRecruitersService=async(companyId,recruiter,department,sorted,page,limit)=>{
    //1 sort by assigned cnt asc
    //2 sort by assigned cnt desc
    // no sorted passes then do not order by
   let result=await recruiterModel.getRecruiters(companyId,recruiter,department,sorted,page,limit)
   return result
}

module.exports.deleteRecruiterService=async(companyId,recruiterId)=>{
    return await recruiterModel.deleteRecruiter(companyId,recruiterId)
}