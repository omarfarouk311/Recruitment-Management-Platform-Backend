const primaryPool=require('../../../config/db')
const replicaPool=require('../../../config/db')

class assessmentsModel{
     
    constructor(data){
        this.id = data.id;
        this.companyId = data.companyId;
        this.name = data.name;
        this.assessmentTime = data.assessmentTime;
        this.jobTitle = data.jobTitle;
        this.numberOfQuestions = data.numberOfQuestions;
        this.questions = data.questions;
        this.answers = data.answers;
        this.correctAnswers = data.correctAnswers;
    }

    static async save(assessmentData){
        const primary_DB=primaryPool.getWritePool();
        const client=await primary_DB.connect();  // to open a connection to the database and do not close it until the transaction is done
        
        try{
            
            const assessmentQuery =`
            INSERT INTO Assessment (company_id,name,assessment_time,job_title,num_of_questions) 
            VALUES($1,$2,$3,$4,$5) RETURNING *`;
          //  companyId,name,assessmentTime,jobTitle,numberOfQuestions

            const Questionquery=
            `INSERT INTO Questions (assessment_id,question,answers,correct_answers)
             VALUES($1,$2,$3,$4) RETURNING *`

            let assessmentvalues=[
                assessmentData.companyId,
                assessmentData.name,
                assessmentData.assessmentTime,
                assessmentData.jobTitle,
                assessmentData.numberOfQuestions];


 
            await client.query('BEGIN');  // begin the transaction
           
            const assessmentResult = await client.query(assessmentQuery,assessmentvalues); 
            const assessmentId = assessmentResult.rows[0].id;
            if(!assessmentId){
                throw new Error("Failed to add new assessment in assessmentModel")
            }


            // console.log(assessmentData.questions)
            // console.log(assessmentData.answers)
            // console.log(assessmentData.correctAnswers)
            assessmentData.metaData.forEach(async(Obj,index) => {
                let question=Obj.questions;
                let answers=Obj.answers;
                let correctAnswers=Obj.correctAnswers;

                const Questionvalues=[assessmentId,question,answers,correctAnswers]
                const questionResult=await client.query(Questionquery,Questionvalues)

                const questionId = questionResult.rows[0].id;
                if(!questionId){
                    throw new Error("Failed to add new questions in assessmentModel")
                }
            })

            await client.query('COMMIT');
            return assessmentResult.rows[0];

        }catch(err){
            console.log("Error in addAssessmentModel", err.message)
            await client.query('ROLLBACK'); // rollback the transaction in case of error
            throw new Error("Error while adding the assessment in assessmentModel" )
        }finally{
            client.release();  // release the connection to the pool
        }
    }

    static async getAssessments(companyId){
        try{
            const replica_DB=replicaPool.getReadPool();
            const query=`
            SELECT * 
            FROM Assessment 
            WHERE company_id=$1`;
            const value=[companyId];
    
            const result=await replica_DB.query(query,value);
            const assessments=result.rows;
            return assessments;
        }catch(err){
            console.log("Error in getAssessmentsModel", err.message)
            throw new Error("Error while getting the assessments in assessmentModel" )
        }
    }
    
    static async getAssessmentsByJobTitle(companyId,jobTitle){
        try{
            const replica_DB=replicaPool.getReadPool();
            const query=`
            SELECT * 
            FROM Assessment 
            WHERE company_id=$1 AND job_title=$2`;
            const values=[companyId,jobTitle]
            const result=await replica_DB.query(query,values);
            const assessments=result.rows;
            return assessments;

        }catch(err){
            console.log("Error in getAssessmentsByJobTitleModel", err.message)
            throw new Error("Error while getting the assessments by job title in assessmentModel" )
        }
    }

    static async getAssessmentById(assessmentId){
        try{

            const replica_DB=replicaPool.getReadPool();

            // first get the asssessment row from table assessment then join with table question to be better in performance
            const assessmentDataQuery=
            `WITH assessment_data AS(
              SELECT *
              FROM Assessment 
              WHERE id=$1 
            )
            SELECT assessment_data.name,assessment_data.assessment_time,assessment_data.job_title,assessment_data.num_of_questions,Questions.question,Questions.answers,Questions.correct_answers
            FROM assessment_data JOIN Questions ON assessment_data.id=Questions.assessment_id`;

            const value=[assessmentId]

            const result=await replica_DB.query(assessmentDataQuery,value);

            let returnedData={
                assessmentInfo:{
                    name:result.rows[0].name,
                    assessmentTime:result.rows[0].assessment_time,
                    jobTitle:result.rows[0].job_title,
                    numberOfQuestions:result.rows[0].num_of_questions
                },
                questions:result.rows.map(row=>({
                    question:row.question,
                    answers:row.answers,
                    correctAnswers:row.correct_answers,
                }))
            }

            return returnedData
            }catch(err){
                console.log("Error in getAssessmentByIdModel", err.message)
                throw new Error("Error while getting the assessment by Id in assessmentModel" )
            }
    }

    static async edit(assessmentId,assessmentData){
        const primary_DB=primaryPool.getWritePool();
        const client=await primary_DB.connect();  
        
        try{

            const updateAssessmentQuery =`
            UPDATE Assessment 
            SET name=$1,assessment_time=$2,job_title=$3,num_of_questions=$4 
            WHERE id=$5 RETURNING *`;
            const values=[
                assessmentData.name,
                assessmentData.assessmentTime,
                assessmentData.jobTitle,
                assessmentData.numberOfQuestions,
                assessmentId];

            const deleteQuestionsQuery = `
            DELETE FROM Questions 
            WHERE assessment_id=$1 RETURNING *`;
            const deleteQuestionsValues = [assessmentId];

            const insertQuestionsQuery=
            `INSERT INTO Questions (assessment_id,question,answers,correct_answers)
             VALUES($1,$2,$3,$4) RETURNING *`

            
        
            await client.query('BEGIN');  // begin the transaction

            const assessmentResult = await client.query(updateAssessmentQuery,values);
            if(assessmentResult.rowCount===0){           // check if any rows have been updated or not
                throw new Error("Failed to update assessment in assessmentModel")
            }

            const deletedQuestions=await client.query(deleteQuestionsQuery,deleteQuestionsValues)
            if(deletedQuestions.rowCount===0){
                throw new Error("Failed to delete questions in assessmentModel")
            }

            assessmentData.metaData.forEach(async(Obj) => {
                let question=Obj.questions;
                let answers=Obj.answers;
                let correctAnswers=Obj.correctAnswers;

                const Questionvalues=[assessmentId,question,answers,correctAnswers]
                const questionResult=await client.query(insertQuestionsQuery,Questionvalues)

                const questionId = questionResult.rows[0].id;
                if(!questionId){
                    throw new Error("Failed to add new questions in assessmentModel")
                }
            })


            await client.query('COMMIT');
            return assessmentResult.rows[0];

        }catch(err){
            console.log("Error in updateAssessmentModel", err.message)
            await client.query('ROLLBACK'); // rollback the transaction in case of error
            throw new Error("Error while updating the assessment in assessmentModel" )
        }finally{
            client.release();
        }

    }

    static async delete(assessmentID){
        try{
            const primary_DB=primaryPool.getWritePool();

            let deleteQuery=`DELETE FROM Assessment WHERE id=$1`;
            let value=[assessmentID]

            const result=await primary_DB.query(deleteQuery,value); // will delete the entery of table questions because we make it on delete cascade om the foreign key
            if(result.rowCount===0){
                throw new Error("Failed to delete assessment in assessmentModel")
            }

            return true;

        }catch(err){
            console.log("Error in deleteAssessmentModel", err.message)
            throw new Error("Error while deleting the assessment in assessmentModel" )
        }
    }

    static async saveAssessmentScore(jobId,jobSeekerId,assessmentName,score,num_of_questions){
        try{
            const primary_DB=primaryPool.getWritePool();
            const query=
            `INSERT INTO Assessment_Score(job_id,seeker_id,phase_name,score,total_score)
             values($1,$2,$3,$4,$5)`
            const values=[jobId,jobSeekerId,assessmentName,score,num_of_questions]
            const result=await primary_DB.query(query,values);
            if(result.rowCount===0){
                throw new Error("Failed to save the score in assessmentModel")
            }
            return true;

        }catch(err){
            console.log("Error in saveAssessmentScoreModel", err.message)
            throw new Error("Error while saving the assessment score in assessmentModel" )
        }
    }

    static async getJobSeekerScore(jobId,jobSeekerId){
        try{

            let replica_DB=replicaPool.getReadPool();
            const query=
            `SELECT phase_name,score,total_score
            FROM Assessment_Score
            WHERE job_id=$1 AND seeker_id=$2`
    
            const values=[jobId,jobSeekerId]

            const result=await replica_DB.query(query,values);
            return result.rows[0];

        }catch(err){
            console.log("Error in getJobSeekerScoreModel", err.message)
            throw new Error("Error while getting the job seeker score in assessmentModel" )
        }
    }

    static async validateCompanyAssessment(assessmentId){
        let replica_DB=replicaPool.getWritePool();
        
        try{

            let query=
            `SELECT company_id
            FROM Assessment
            WHERE id=$1`

            let values=[assessmentId]
            let companyId=await replica_DB.query(query,values)
            if(companyId.rowCount==0){
                return null;
            }
            return companyId.rows[0].company_id
          
        }catch(err){
            console.log("Error in validateCompanyAssessmentModel", err.message)
            throw new Error("Error while validating the company assessment in assessmentModel" )
        }

    }

    static async validateCompanyJob(jobId){
        
        let replica_DB=replicaPool.getWritePool();
        try{

            const jobQuery=
            `WITH job_data AS
            SELECT company_id
            FROM job
            WHERE id=$1

            SELECT j.company_id
            FROM Company C JOIN job_data j on C.id=j.company_id
            WHERE j.company_id=$2
            `
            const values=[jobId,companyId]

            let companyId=await replica_DB.query(jobQuery,values)

            return companyId

        }catch(err){
            console.log("Error in validateCompanyJobModel", err.message)
            throw new Error("Error while validating the company job in assessmentModel" )
        }

    }
}
module.exports = assessmentsModel;