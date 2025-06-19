const educationModel=require('./educationsModel')
const Pool = require('../../../../config/db');
const { profile_embedding_topic } = require('../../../../config/config');
const Kafka = require('../../../common/kafka')

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

    let client = await Pool.getWritePool().connect();

    try{
        await client.query('BEGIN');
        await educationModel.editEducation(seekerId,educationId,school_name,field,degree,grade,start_date,end_date,client);
        const promise = Kafka.produce(
            {
                id: null,
                userId: seekerId,
                type: 'profile'
            },
            profile_embedding_topic
        );
        await promise;
        await client.query('COMMIT');
        return true;

    }
    catch(err){
        await client.query('ROLLBACK');
        console.log('err in editEducationService',err.message);
        throw err;
    } finally {
        client.release();
    }
}

