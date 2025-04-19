const primaryPool=require('../../../../config/db')
const replicaPool=require('../../../../config/db')

class educationModel {
    constructor(school_name, field, degree, grade, start_date, end_date) {
        this.school_name = school_name;
        this.field = field;
        this.degree = degree;  
    }

    static async addEducation(userId,school_name,field,degree,grade,start_date,end_date){
        let primary_DB=primaryPool.getWritePool();
        try{

            let placeHolder=[];
            let values=[];
            let query=
            `INSERT INTO Education (user_id,school_name,field,degree
            `
            placeHolder=[`$1`,`$2`,`$3`,`$4`]
            values.push(userId,school_name,field,degree);

            let cnt=5;
            if(grade!=null){
                query += `, grade`;
                placeHolder.push(`$${cnt++}`)
                values.push(grade);
            }
            if(start_date!=null){
                query += `, start_date`;
                placeHolder.push(`$${cnt++}`)
                values.push(start_date);
            }
            if(end_date!=null){
                query += `, end_date`;
                placeHolder.push(`$${cnt++}`)
                values.push(end_date);
            }
            query+=`) VALUES(${placeHolder.join(', ')}) RETURNING id`

            const res = await primary_DB.query(query,values);
            if (res.rowCount) {
                return res.rows[0].id;
            }
            throw new Error('Failed to add education');

        }catch(err){
            console.log("err in addEducation model",err.message);
            throw err;
        }
    }

    static async getEducation(seekerId){

        let replica_DB=replicaPool.getReadPool();
        try{
            let query=
            `SELECT id,school_name,field,degree,grade,start_date,end_date
            FROM Education 
            WHERE user_id=$1
            ORDER BY end_date DESC
            `
            let value=[seekerId]
            let queryResult=await replica_DB.query(query,value)
            let result=queryResult.rows
            return result
        }catch(err){
            console.log("err in getEducation model",err.message)
            throw err;
        }

    }

    static async deleteEducation(educationId,seekerId){
        let primary_DB=primaryPool.getWritePool();
        try{

            let query=
            `DELETE 
            FROM Education
            WHERE id=$1 AND user_id=$2
            returning *
            `
            let values=[educationId,seekerId]
            await primary_DB.query(query,values)
            return true 

        }catch(err){
            console.log('err in deleteEducation model',err.message)
            throw err;
        }
    }

    static async editEducation(seekerId,educationId,school_name,field,degree,grade,start_date,end_date){
        let primary_DB=primaryPool.getWritePool();
        try{

            let values=[];
            let cnt=4;
            let query=
            `UPDATE Education 
            SET school_name=$1,field=$2,degree=$3
            `
            values=[school_name,field,degree];
            if(grade!=null){
                query+=`,grade=$${cnt++}`
                values.push(grade);
            }
            if(start_date!=null){
                query+=`,start_date=$${cnt++}`
                values.push(start_date)
            }
            if(end_date!=null){
                query+=`,end_date=$${cnt++}`
                values.push(end_date);
            }

            query+=` WHERE id=$${cnt++} AND user_id=$${cnt++}`
            values.push(educationId,seekerId)

            await primary_DB.query(query,values)
            return true;

        }catch(err){
            console.log('err in editEducation model',err.message)
            throw err;
        }
    }

}

module.exports=educationModel