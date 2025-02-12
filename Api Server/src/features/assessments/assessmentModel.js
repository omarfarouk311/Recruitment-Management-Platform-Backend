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

    static async save(assessmentData,client){
       
        
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

           
            const assessmentResult = await client.query(assessmentQuery,assessmentvalues); 
            const assessmentId = assessmentResult.rows[0].id;
            if(!assessmentId){
                throw new Error()
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
                    throw new Error()
                }
            })

            return assessmentResult.rows[0];

        }catch(err){
            console.log("Error in addAssessmentModel", err.message)
            err.msg="error during saving the assessment,please try again"
            err.status=500
            throw err;
            
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
            throw new Error("Error while getting the assessments" )
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
            if(result.rowCount==0){
                throw new Error("error while getting assessment")
            }
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
                err.msg=err.message;
                err.status=500
                throw new Error(err)
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
            err.msg="Failed to edit assessment,try again"
            throw new Error(err)
        }finally{
            client.release();
        }

    }

    static async delete(assessmentID,client){
        try{
            const primary_DB=primaryPool.getWritePool();

            let CheckQuery=`
            SELECT recruitment_process_id
            FROM recruitment_phase
            WHERE assessment_id=$1
            `
            let CheckValue=[assessmentID]
            let CheckResult=await primary_DB.query(CheckQuery,CheckValue);
          
            if(CheckResult.rowCount>0){
              
                let err=new Error();
                err.msg="The assessment has been already assigned to recruitment process,you can not delete it right now";
                err.status=400;
                throw err;
            }
            let deleteQuery=`DELETE FROM Assessment WHERE id=$1`;
            let value=[assessmentID]

            const result=await primary_DB.query(deleteQuery,value); // will delete the entery of table questions because we make it on delete cascade om the foreign key
            if(result.rowCount===0){
                throw new Error("Failed to delete assessment")
            }

            return true;

        }catch(err){
            console.log("Error in deleteAssessmentModel", err.message)
            throw err
        }
    }

    static async saveAssessmentScore(jobId,jobSeekerId,assessmentId,score,num_of_questions){
        try{
            const primary_DB=primaryPool.getWritePool();
            const query=        // to get phase num and phase name
            `WITH getAssessment as(
            SELECT id
            FROM Assessment 
            WHERE id=$1),

            getJob as(
            SELECT recruitment_process_id
            FROM job
            WHERE id=$2)
            
            SELECT recruitment_phase.phase_num as phase_num,recruitment_phase.name as phase_name
            FROM getAssessment 
            JOIN recruitment_phase ON getAssessment.id=recruitment_phase.assessment_id
            JOIN getJob on getJob.recruitment_process_id=recruitment_phase.recruitment_process_id

            `
            const insertQuery=    // to insert in table assesment score
            ` INSERT INTO assessment_score (job_id,seeker_id,phase_num,phase_name,score,total_score)
              VALUES($1,$2,$3,$4,$5,$6)`


            const queryValue=[assessmentId,jobId];
            const returnedPhase=await primary_DB.query(query,queryValue)

            if(returnedPhase.rowCount==0){
                throw new Error("submition failedd,please try again")
            }

            const insertValues=[jobId,jobSeekerId,returnedPhase.rows[0].phase_num,returnedPhase.rows[0].phase_name,score,num_of_questions]
            const checkInsert=await primary_DB.query(insertQuery,insertValues)

            if(checkInsert.rowCount==0){
                throw new Error("submition failed,please try again")
            }
          
            return true;

        }catch(err){
            console.log("Error in saveAssessmentScoreModel", err.message)
            err.msg=err.message;
            err.status=500
            throw err
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
            return result.rows;

        }catch(err){
            console.log("Error in getJobSeekerScoreModel", err.message)
            throw err
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
            throw err
        }

    }

    static async validJob(jobId){
        let replica_DB=replicaPool.getReadPool();
        try{

            let query=
            `SELECT id 
            FROM job
            WHERE id=$1
            `
            let value=[jobId]
            let id=await replica_DB.query(query,value);
            if(id.rowCount==0){
                return false;
            }
            return true

        }catch(err){
            console.log("Error in validJobAssessmentModel", err.message)
            throw err
        }
    }

    static async validateCompanyJob(jobId){
        
        let replica_DB=replicaPool.getWritePool();
        try{

            const jobQuery=
            `
            SELECT company_id
            FROM job
            WHERE id=$1
            `
            const values=[jobId]

            let companyId=await replica_DB.query(jobQuery,values)
            
            return companyId.rows[0].company_id

        }catch(err){
            console.log("Error in validateCompanyJobModel", err.message)
            throw err
        }

    }
}
module.exports = assessmentsModel;