const primaryPool=require('../config/db')
const replicaPool=require('../config/db')

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
        
        try{
            
            const primary_DB=primaryPool.getWritePool();
            const client=primary_DB.connect();  // to open a connection to the database and do not close it until the transaction is done
            const assessmentQuery =`
            INSERT INTO Assessment (company_id,name,asseessment_time,job_title,num_of_questions) 
            VALUES(&1,&2,&3,&4,&5) RETURNING *`;
          //  companyId,name,assessmentTime,jobTitle,numberOfQuestions

            const questionsQuery = `
            INSERT INTO Questions (assessment_id, question, answers, correct_answers) 
            VALUES(&1,&2,&3,&4) RETURNING id`;
           // assessmentId, questions, answers, correctAnswers

            let assessmentvalues=[
                assessmentData.companyId,
                assessmentData.name,
                assessmentData.assessmentTime,
                assessmentData.jobTitle,
                assessmentData.numberOfQuestions];


 
            client.query('BEGIN');  // begin the transaction
           
            const assessmentResult = await client.query(assessmentQuery,assessmentvalues); 
            const assessmentId = assessmentResult.rows[0].id;
            if(!assessmentId){
                throw new Error("Failed to add new assessment in assessmentModel")
            }

            let questionsValues = [
                assessmentId, // the foreign key from the assessment table
                assessmentData.questions,
                assessmentData.answers,
                assessmentData.correctAnswers];

            const questionResult=await client.query(questionsQuery,questionsValues)
            const questionId = questionResult.rows[0].id;
            if(!questionId){
                throw new Error("Failed to add new questions in assessmentModel")
            }

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
            WHERE company_id=&1`;
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
            WHERE company_id=&1 AND job_title=&2`;
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
            SELECT * 
            FROM assessment_data JOIN Questions ON assessment_data.id=Questions.assessment_id`;

            const value=[assessmentId]

            const result=await replica_DB.query(assessmentDataQuery,value);
            const assessment=result.rows[0];
            return assessment
            }catch(err){
                console.log("Error in getAssessmentByIdModel", err.message)
                throw new Error("Error while getting the assessment by Id in assessmentModel" )
            }
    }

    static async edit(assessmentId,assessmentData){
        try{
            const primary_DB=primaryPool.getWritePool();
            const client=primary_DB.connect();  

            const assessmentQuery =`
            UPDATE Assessment 
            SET name=$1,asseessment_time=$2,job_title=$3,num_of_questions=$4 
            WHERE id=$5 RETURNING *`;
            const values=[
                assessmentData.name,
                assessmentData.assessmentTime,
                assessmentData.jobTitle,
                assessmentData.numberOfQuestions,
                assessmentId];

            const questionsQuery = `
            UPDATE Questions 
            SET question=$1,answers=$2,correct_answers=$3 
            WHERE assessment_id=$4 RETURNING *`;
            const questionsValues = [
                assessmentData.questions,
                assessmentData.answers,
                assessmentData.correctAnswers,
                assessmentId];


                client.query('BEGIN');  // begin the transaction

            const assessmentResult = await client.query(assessmentQuery,values);
            if(assessmentResult.rowCount===0){           // check if any rows have been updated or not
                throw new Error("Failed to update assessment in assessmentModel")
            }

            const questionResult=await client.query(questionsQuery,questionsValues)
            if(questionResult.rowCount===0){
                throw new Error("Failed to update questions in assessmentModel")
            }

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

            let deleteQuery=`DELETE FROM Assessment WHERE id=&1`;
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
            primary_DB=primaryPool.getWritePool();
            const query=
            `INSERT INTO Assessment_Score(job_id,seeker_id,phase_name,score,total_score)
             values(&1,&2,&3,&4,&5)`
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
            WHERE job_id=&1 AND seeker_id=&2`
    
            const values=[jobId,jobSeekerId]

            const result=await replica_DB.query(query,values);
            return result.rows[0];

        }catch(err){
            console.log("Error in getJobSeekerScoreModel", err.message)
            throw new Error("Error while getting the job seeker score in assessmentModel" )
        }
    }

    static async validateCompanyJob(companyId,jobId){
        try{
            let primary_DB=primaryPool.getWritePool();
            let client=primary_DB.connect();

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
            client.query('BEGIN')

            let companyId=await client.query(jobQuery,values)

            client.query('COMMIT')

            return companyId

        }catch(err){
            console.log("Error in validateCompanyJobModel", err.message)
            client.query('ROLLBACK')
            throw new Error("Error while validating the company job in assessmentModel" )
        }finally{
            client.release();
        }

    }
}
module.exports = assessmentsModel;