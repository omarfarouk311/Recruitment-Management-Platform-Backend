
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

       console.log(query)
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
           
            let updateRecruiterQuery=
            `UPDATE Recruiter
            SET company_id=NULL, department=NULL, assigned_candidates_cnt=0
            WHERE id=$1`

            let updateRecruiterValue=[recruiterId]

            let updateCandidateTable=
            `UPDATE Candidates
            SET recruiter_id=NULL 
            WHERE recruiter_id=$1`

            let updateQueryValue=[recruiterId]

            await client.query('BEGIN')

            await client.query(updateRecruiterQuery,updateRecruiterValue)
            await client.query(updateCandidateTable,updateQueryValue)

            await client.query('COMMIT')
            return true;

        }catch(err){
            client.query('ROLLBACK')
            console.log("err in delete recruiter model",err.message)
            throw err;
        }finally{
            client.release()
        }
    }

    static async getRecruiterById(recruiterId){

        const replica_DB=replicaPool.getReadPool();
        try{
            let query=
            `SELECT company_id
            FROM Recruiter
            WHERE id=$1`

            let queryValue=[recruiterId]

            let queryResult=await replica_DB.query(query,queryValue)
            if(queryResult.rowCount==0){
                return false
            }
            return queryResult.rows[0]


        }catch(err){
            console.log('err in deleteRecruiter model',err.message)
            throw err;
        }


    }
    static async sendInvitation(email,department,deadline,companyId){
        const primary_DB=primaryPool.getWritePool()
        try{

            let currentDate=new Date()
            let query=
            `WITH usr as(
             SELECT id as id
             FROM Users
             WHERE email=$1
            )
            
            INSERT INTO Company_Invitations (recruiter_id, company_id, department, created_at, deadline)
            VALUES ((SELECT COALESCE(id, NULL) FROM usr), $2, $3, $4, $5)
            RETURNING recruiter_id
            `
            let recruiterValue=[email,companyId,department,currentDate,deadline]

            let result=await primary_DB.query(query,recruiterValue)
            if(result.rowCount==0){
                let err=new Error();
                err.msg="invitation has not sent successfully ,please try again"
                err.status=500;
                throw err;
            }
            
           return true;

        }catch(err){
            console.log('err in sendInvitation model',err.message)
            throw err;
        }
        
    }
}

module.exports=RecruiterModel;