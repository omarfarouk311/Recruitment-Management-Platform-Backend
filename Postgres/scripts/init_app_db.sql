CREATE EXTENSION pg_trgm;
CREATE EXTENSION vector;

CREATE TABLE Users (
  id serial PRIMARY KEY NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  has_image BOOLEAN NOT NULL
);

CREATE TABLE Job_Seeker (
  id serial PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  gender BOOLEAN NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE Recruiter (
  id serial PRIMARY KEY ,
  company_id int,
  name TEXT NOT NULL,
  assigned_candidates_cnt smallint NOT NULL
);

CREATE TABLE Company (
  id serial PRIMARY KEY,
  overview TEXT NOT NULL,
  type BOOLEAN NOT NULL,
  founded_on DATE NOT NULL,
  company_size INTEGER NOT NULL,
  rating float NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE Company_Industry (
  company_id int NOT NULL,
  industry_id smallint NOT NULL,
  PRIMARY KEY (company_id, industry_id)
);

CREATE TABLE Company_Location (
  company_id int,
  country TEXT NOT NULL,
  city TEXT NOT NULL
);

CREATE TABLE Job_Skill (
  job_id int,
  skill_id int,
  PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE Skills (
  id serial PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE Education (
  user_id int PRIMARY KEY,
  school_name TEXT NOT NULL,
  field TEXT NOT NULL,
  degree TEXT NOT NULL,
  grade TEXT,
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE Company_Invitations (
  recruiter_id int,
  company_id int,
  department text NOT NULL,
  created_at date NOT NULL,
  deadline TIMESTAMP NOT NULL,
  PRIMARY KEY (recruiter_id, company_id)
);

CREATE TABLE Candidates (
  seeker_id int NOT NULL,
  phase SMALLINT NOT NULL,
  recruiter_id int,
  job_id int NOT NULL,
  date_applied date NOT NULL,
  last_status_update date NOT NULL,
  similarity_score float NOT NULL,
  cv_id int NOT NULL,
  phase_deadline TIMESTAMP,
  template_id INTEGER,
  placeholders_params JSON,
  recruitment_process_id int NOT NULL
);

CREATE TABLE Job (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at date NOT NULL,
  recruitment_process_id int,
  company_id int,
  field TEXT NOT NULL,
  country TEXT,
  city TEXT,
  remote BOOLEAN NOT NULL,
  applied_cnt smallint NOT NULL,
  closed BOOLEAN NOT NULL
);

CREATE TABLE Job_Embedding (
  job_id int PRIMARY KEY,
  embedding vector(300) NOT NULL
);

CREATE TABLE User_Skills (
  user_id int,
  skill_id int,
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE User_Experience (
  user_id int NOT NULL,
  company_name text NOT NULL,
  start_date TEXT,
  end_date TEXT,
  description text,
  job_title text NOT NULL,
  country text,
  city text
);

CREATE TABLE CV (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  name text NOT NULL,
  created_at date NOT NULL,
  deleted BOOLEAN NOT NULL
);

CREATE TABLE CV_Embedding (
  cv_id int PRIMARY KEY,
  vector vector(300) NOT NULL
);

CREATE TABLE Industry (
  id smallserial PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE Job_Offer_Template (
  id serial PRIMARY KEY,
  name Text NOT NULL,
  description Text NOT NULL,
  company_id int NOT NULL,
  upadated_at date NOT NULL,
  placeholders TEXT[] NOT NULL
);

CREATE TABLE Recruitment_Process (
  id serial PRIMARY KEY,
  name text NOT NULL,
  num_of_phases smallint NOT NULL,
  company_id int NOT NULL
);

CREATE TABLE Recruitment_Phase (
  phase_num smallint NOT NULL,
  name text NOT NULL,
  recruitment_process_id int NOT NULL,
  type int NOT NULL,
  deadline smallint,
  assessment_id int,
  PRIMARY KEY (recruitment_process_id, phase_num)
);

CREATE TABLE Phase_Type (
  id smallserial PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE Assessment (
  id serial PRIMARY KEY,
  company_id int NOT NULL,
  name text NOT NULL,
  assessment_time smallint NOT NULL,
  job_title text NOT NULL,
  num_of_questions smallint NOT NULL
);

CREATE TABLE Assessment_Score (
  job_id int NOT NULL,
  seeker_id int NOT NULL,
  phase_num smallint NOT NULL,
  score smallint NOT NULL
);

CREATE TABLE Candidate_History (
  seeker_id int NOT NULL,
  job_id int NOT NULL,
  job_title text NOT NULL,
  phase_name text NOT NULL,
  status BOOLEAN NOT NULL,
  score smallint,
  company_name text NOT NULL,
  date_applied date NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  remote BOOLEAN NOT NULL,
  PRIMARY KEY (seeker_id, job_id)
);

CREATE TABLE Questions (
  id serial PRIMARY KEY,
  assessment_id int NOT NULL,
  question text NOT NULL,
  answers text[] NOT NULL,
  correct_answers smallint[] NOT NULL
);

CREATE TABLE Job_Seeker_Embeddings (
  seeker_id int,
  embedding vector(300) NOT NULL
);

CREATE TABLE CV_Keywords (
  CV_id int PRIMARY KEY,
  skills text[] NOT NULL,
  experiences JSON[]
);

CREATE TABLE Recommendations (
  job_id int NOT NULL,
  seeker_id int NOT NULL,
  similarity_score float NOT NULL
) PARTITION BY RANGE (seeker_id);

CREATE TABLE Recommendations_1_10000 PARTITION OF Recommendations FOR VALUES FROM (1) TO (10001);

CREATE TABLE Reviews (
  company_id int NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  rating smallint NOT NULL,
  role text NOT NULL,
  created_at date NOT NULL
);

CREATE TABLE Report (
  id serial PRIMARY KEY,
  job_id int NOT NULL,
  seeker_id int NOT NULL,
  created_at timestamp NOT NULL,
  title text NOT NULL,
  description text NOT NULL
);

CREATE TABLE Action (
  id smallserial PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE Logs (
  performed_by text NOT NULL,
  company_id int NOT NULL,
  created_at timestamp NOT NULL,
  extra_data JSON,
  action_type smallint NOT NULL
);

CREATE INDEX ON Company USING GIN (name gin_trgm_ops);

CREATE INDEX ON Job USING GIN (title gin_trgm_ops);

CREATE INDEX ON Job USING GIST (title gist_trgm_ops);

CREATE INDEX ON Company USING GIST (name gist_trgm_ops);

CREATE INDEX ON Candidate_History (seeker_id, status);

CREATE INDEX ON Candidate_History (seeker_id, company_name);

CREATE INDEX ON Candidate_History (seeker_id, remote);

CREATE INDEX ON Candidate_History (seeker_id, country, city);

CREATE INDEX ON Company (company_size);

CREATE INDEX ON Company (type);

CREATE INDEX ON Company (rating);

CREATE INDEX ON Company_Location (country, city);

CREATE INDEX ON Company_Location (company_id);

CREATE INDEX candidates_recruiter_id_status_index ON Candidates (recruiter_id, phase);

CREATE INDEX candidates_seeker_id_status_index ON Candidates (seeker_id, phase);

CREATE INDEX candidates_job_id_status_index ON Candidates (job_id, phase);

CREATE INDEX candidates_last_status_update_index ON Candidates (last_status_update);

CREATE INDEX candidates_score_index ON Candidates (similarity_score);

CREATE INDEX phase_metadata_deadline_index ON Candidates (phase_deadline);

CREATE INDEX ON Job (country, city);

CREATE INDEX ON Job (remote);

CREATE INDEX ON Job (field);

CREATE INDEX ON Job (created_at);

CREATE INDEX ON Job (company_id);

CREATE INDEX ON Job_Offer_Template (name);

CREATE INDEX ON Recruitment_Process (company_id);

CREATE INDEX ON Assessment (company_id);

CREATE INDEX ON Questions (assessment_id);

CREATE INDEX ON Recommendations (seeker_id, similarity_score);

CREATE INDEX ON Reviews (company_id);

CREATE INDEX ON Reviews (rating);

CREATE INDEX ON Reviews (created_at);

CREATE INDEX ON Report (seeker_id);

CREATE INDEX ON Assessment_Score (job_id, seeker_id, phase_num);

CREATE INDEX ON Logs (company_id);

CREATE INDEX ON Logs (company_id, action_type);

CREATE INDEX ON Logs (company_id, performed_by);

CREATE INDEX ON Logs (company_id, created_at);

ALTER TABLE Candidate_History ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Candidate_History ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE SET NULL;

ALTER TABLE Job_Seeker ADD FOREIGN KEY (id) REFERENCES Users (id) ON DELETE CASCADE;

ALTER TABLE Recruiter ADD FOREIGN KEY (id) REFERENCES Users (id) ON DELETE CASCADE;

ALTER TABLE Recruiter ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE SET NULL;

ALTER TABLE Company ADD FOREIGN KEY (id) REFERENCES Users (id) ON DELETE CASCADE;

ALTER TABLE Company_Location ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Job_Skill ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Job_Skill ADD FOREIGN KEY (skill_id) REFERENCES Skills (id) ON DELETE CASCADE;

ALTER TABLE Education ADD FOREIGN KEY (user_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Company_Invitations ADD FOREIGN KEY (recruiter_id) REFERENCES Recruiter (id) ON DELETE CASCADE;

ALTER TABLE Company_Invitations ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Candidates ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Candidates ADD FOREIGN KEY (recruiter_id) REFERENCES Recruiter (id) ON DELETE SET NULL;

ALTER TABLE Candidates ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Candidates ADD FOREIGN KEY (template_id) REFERENCES Job_Offer_Template (id) ON DELETE RESTRICT;

ALTER TABLE Candidates ADD FOREIGN KEY (recruitment_process_id) REFERENCES Recruitment_Process (id) ON DELETE RESTRICT;

ALTER TABLE Job ADD FOREIGN KEY (recruitment_process_id) REFERENCES Recruitment_Process (id) ON DELETE SET NULL;

ALTER TABLE Job ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE SET NULL;

ALTER TABLE Job_Embedding ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Job_Offer_Template ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Recruitment_Process ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Recruitment_Phase ADD FOREIGN KEY (recruitment_process_id) REFERENCES Recruitment_Process (id) ON DELETE CASCADE;

ALTER TABLE Recruitment_Phase ADD FOREIGN KEY (type) REFERENCES Phase_Type (id) ON DELETE CASCADE;

ALTER TABLE Recruitment_Phase ADD FOREIGN KEY (assessment_id) REFERENCES Assessment (id) ON DELETE RESTRICT;

ALTER TABLE Assessment ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Questions ADD FOREIGN KEY (assessment_id) REFERENCES Assessment (id) ON DELETE CASCADE;

ALTER TABLE Job_Seeker_Embeddings ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE CV_Keywords ADD FOREIGN KEY (CV_id) REFERENCES CV (id) ON DELETE CASCADE;

ALTER TABLE Recommendations_1_10000 ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Recommendations_1_10000 ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Reviews ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Report ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Report ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE SET NULL;

ALTER TABLE Assessment_Score ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Assessment_Score ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Company_Industry ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Company_Industry ADD FOREIGN KEY (industry_id) REFERENCES Industry (id) ON DELETE CASCADE;

ALTER TABLE Logs ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE;

ALTER TABLE Logs ADD FOREIGN KEY (action_type) REFERENCES Action (id) ON DELETE CASCADE;

ALTER TABLE User_Skills ADD FOREIGN KEY (user_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE User_Skills ADD FOREIGN KEY (skill_id) REFERENCES Skills (id) ON DELETE CASCADE;

ALTER TABLE User_Experience ADD FOREIGN KEY (user_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE CV ADD FOREIGN KEY (user_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE CV_Embedding ADD FOREIGN KEY (cv_id) REFERENCES CV (id) ON DELETE CASCADE;

ALTER TABLE Candidates ADD FOREIGN KEY (cv_id) REFERENCES CV (id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant sequence usage for app users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;