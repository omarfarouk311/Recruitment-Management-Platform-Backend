
let primaryPool=require('../../../config/db')
let replicaPool=require('../../../config/db')

class RecruiterModel {
    
    constructor(id,company_id,name,assigned_candidates_cnt,department){
        thid.id=id,
        this.company_id=company_id
        this.name=name
        this.assigned_candidates_cnt=assigned_candidates_cnt
        this.department=department
    }

    
    static async getRecruiters(companyId,recruiter,department,sorted,page=1,limit){

      const replica_DB= replicaPool.getReadPool();  
      try{
    
        let cnt=1;
        let values=[]
        let query=
        `SELECT id,name,department,assigned_candidates_cnt
        FROM Recruiter 
        WHERE company_id=$${cnt++}`
        values.push(companyId);
        
        if(recruiter){
         query+=` AND name=$${cnt++}`
         values.push(recruiter)
        }
        if(department){
         query+=` AND department=$${cnt++}`
         values.push(department)
        }
      
        if(sorted==1){
            query+=` ORDER BY assigned_candidates_cnt ASC` 
        }
        if(sorted==2){
            query+=` ORDER BY assigned_candidates_cnt DESC`
        }
        
       let offset=(page-1)*limit
       query+=` offset ${offset} limit ${limit}`

    
       let queryResult=await replica_DB.query(query,values)
       let result=queryResult.rows
       return result
      }catch(err){
        console.log("err in get recruiters model", err.message)
        throw err;
      }
    }

    static async deleteRecruiter(recruiterId){
        const primary_DB=primaryPool.getWritePool()
        const client=await primary_DB.connect()
        try{
           
            let deleteQuery=
            `DELETE FROM recruiter
            WHERE id=$1`

            let deleteQuesryValue=[recruiterId]

            let updateCandidateTable=
            `UPDATE Candidates
            SET recruiter_id=NULL 
            WHERE recruiter_id=$1`

            let updateQueryValue=[recruiterId]

            await client.query('BEGIN')

            await client.query(deleteQuery,deleteQuesryValue)
            await client.query(updateCandidateTable,updateQueryValue)

            await client.query('COMMIT')
            return true;

        }catch(err){
            console.log("err in delete recruiter model",err.message)
            throw err;
        }finally{
            client.release()
        }
    }
}

module.exports=RecruiterModel;