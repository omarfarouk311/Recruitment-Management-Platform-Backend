const recruiterModel=require('./recruiterModel')
const{getImageService}=require('../../common/util')
const{imagesBucketName}=require('../../../config/config')
let primaryPool=require('../../../config/db')
const Kafka = require('../../common/kafka')
const { action_types, logs_topic , role} = require('../../../config/config')
const { v6: uuid } = require('uuid');


module.exports.getRecruitersService=async(companyId,recruiter,department,sorted,page,limit)=>{
    //1 or null sort by assigned cnt asc
    //-1 sort by assigned cnt desc
    
   let result=await recruiterModel.getRecruiters(companyId,recruiter,department,sorted,page,limit)
   return result
}

module.exports.deleteRecruiterService=async(companyId,recruiterId)=>{
    const primary_DB=primaryPool.getWritePool()
    const client=await primary_DB.connect()
    try{
        client.query('BEGIN')
        await recruiterModel.deleteRecruiter(recruiterId,client)
        let companyName=await recruiterModel.getCompanyName(companyId,client)
        
        await Kafka.produce({
            id: uuid(),
            performed_by: companyName,
            company_id: companyId,
            extra_data: null,
            action_type: action_types.deleteRecruiter,
            created_at: new Date(),
        },logs_topic)
        
        console.log('ack from kafka');
        client.query('COMMIT')
        return true

    }catch(err){
        client.query('ROLLBACK')
        throw err
    }finally{
        client.release()
    }
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

module.exports.getRecruiterDataService=async(recruiterId)=>{
    return await recruiterModel.getRecruiterData(recruiterId)
}

module.exports.getProfilePicService=async(recruiterId)=>{
    const imageData = {
        bucketName: imagesBucketName,
        objectName: `${role.recruiter}${recruiterId}`
    };
    
    return await getImageService(imageData);
}