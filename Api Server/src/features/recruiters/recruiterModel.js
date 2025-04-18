
let primaryPool=require('../../../config/db')
let replicaPool=require('../../../config/db')
let {desc_order,asc_order}=require('../../../config/config')

class RecruiterModel {
    
    constructor(id,company_id,name,assigned_candidates_cnt,department){
        this.id=id,
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
      
        if(sorted==desc_order){
            query+=` ORDER BY assigned_candidates_cnt DESC`
        }
        else{
            query+=` ORDER BY assigned_candidates_cnt ASC`
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

    static async deleteRecruiter(recruiterId,client){
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

           

            await client.query(updateRecruiterQuery,updateRecruiterValue)
            await client.query(updateCandidateTable,updateQueryValue)

            return true;

        }catch(err){
            console.log("err in delete recruiter model",err.message)
            throw err;
        }
    }

    static async getCompanyName(companyId,client){
        try{

            let query=`SELECT name from Company WHERE id=$1`
            let value=[companyId]
            let companyName=await client.query(query,value)
             
            return companyName.rows[0].name

        }catch(err){
            console.log("err in getCompanyName model",err.message)
            throw err;
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
    static async getRecruiterByEmail(email){
        const replica_DB=replicaPool.getReadPool()
        try{
            let query=
            `WITH usr as(
            SELECT id as id
            FROM Users
            WHERE email=$1)
            
            SELECT Recruiter.id
            FROM usr 
            JOIN Recruiter
            on usr.id=Recruiter.id
            `

            let queryValue=[email]

            let queryResult=await replica_DB.query(query,queryValue)
            return queryResult.rowCount;
        }catch(err){
            console.log('err in getRecruiterByEmail model',err.message)
            throw err;
        }
    }

    static async getUniqueDepartments(companyId){
        let replica_DB=await replicaPool.getReadPool()
        try{

            let query=
            `SELECT DISTINCT department as departments
            FROM Recruiter
            WHERE company_id=$1`

            let queryValue=[companyId]
            let departments=await replica_DB.query(query,queryValue)
            return departments.rows

        }catch(err){
            console.log('err in getUniqueDepartments model',err.message)
            throw err;
        }
    }

    static async getJobOfferSent(recruiterId,jobTitle,sorted,page=1,limit){
        let replica_DB=replicaPool.getReadPool()
        try{
    
            let value=[recruiterId],cnt=1;
          

            let query=
            `
            WITH candidatesIdsJobIds as(
            SELECT seeker_id as seeker_id,job_id as job_id,date_applied as date_applied
            FROM Candidates
            WHERE recruiter_id=$${cnt++} AND template_id IS NOT NULL)

            SELECT Job_Seeker.name as candidateName,Job_Seeker.id,Job.title as jobTitle,candidatesIdsJobIds.date_applied as dateSent
            FROM candidatesIdsJobIds
            JOIN Job on candidatesIdsJobIds.job_id=Job.id
            JOIN Job_Seeker on candidatesIdsJobIds.seeker_id=Job_Seeker.id`
           if(jobTitle){
            query+=` WHERE Job.title=$${cnt++}`
            value.push(jobTitle)
           }
          
           if(sorted==desc_order){
           
            query+=` ORDER BY candidatesIdsJobIds.date_applied DESC`
           }
           else{        // sort by date by default
            query+=` ORDER BY candidatesIdsJobIds.date_applied ASC`
           }
           
          
            let offset=(page-1)*limit
            query+=` OFFSET $${cnt++} LIMIT $${cnt++}`
            
            value.push(offset)
            value.push(limit)
            
           let queryResult=await replica_DB.query(query,value)
            return queryResult.rows

        }catch(err){
            console.log('err in getJobOfferSent model',err.message)
            throw err;
        }
    }
    static async getJobTitleList(recruiterId){
        let replica_DB=replicaPool.getReadPool()

        try{

            let query=
            `
            SELECT Job.title as Titles,Job.id as id
            FROM (
            SELECT DISTINCT job_id
            FROM Candidates
            WHERE recruiter_id=$1) as t1
            JOIN Job on t1.job_id=Job.id
            `
            let value=[recruiterId]
            let queryResult=await replica_DB.query(query,value)
            return queryResult.rows

        }catch(err){
            console.log('err in getJobTitleList model',err.message)
            throw err;
        }
    }
    static async getRecruiterData(recruiteId){
        let replica_DB=replicaPool.getReadPool()
        try{
            let query=
            `
            SELECT t1.name as recruiterName,Company.name as companyName,Company_Location.city as companyCity,
            Company_Location.country as companyCountry,t1.department as recruiterDepartment
            FROM(
            SELECT id,company_id,name,department
            FROM Recruiter
            WHERE id=$1) as t1
            JOIN Company ON Company.id=t1.company_id
            JOIN Company_Location ON Company.id=Company_Location.company_id
            `

            let value=[recruiteId]
            let queryResult=await replica_DB.query(query,value)
           
            return queryResult.rows[0];

        }catch(err){
            console.log('err in getRecruiterData model',err.message)
            throw err;
        }
    }
}

   

module.exports=RecruiterModel;