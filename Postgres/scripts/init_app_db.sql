CREATE EXTENSION pg_trgm;
CREATE EXTENSION vector;

CREATE TABLE Users (
  id serial PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role smallint NOT NULL
);

CREATE TABLE Job_Seeker (
  id int PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  gender BOOLEAN NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE Recruiter (
  id int PRIMARY KEY ,
  company_id int,
  name TEXT NOT NULL,
  assigned_candidates_cnt smallint NOT NULL,
  department text
);

CREATE TABLE Company (
  id int PRIMARY KEY,
  overview TEXT NOT NULL,
  type BOOLEAN NOT NULL,
  founded_in SMALLINT NOT NULL,
  size int NOT NULL,
  rating real NOT NULL,
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
  city TEXT NOT NULL,
  PRIMARY KEY (company_id, country, city)
);

CREATE TABLE Job_Skill (
  job_id int,
  skill_id int,
  PRIMARY KEY (job_id, skill_id),
  importance smallint NOT NULL
);

CREATE TABLE Skills (
  id serial PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE Education (
  id serial PRIMARY KEY,
  user_id int,
  school_name TEXT NOT NULL,
  field TEXT NOT NULL,
  degree TEXT NOT NULL,
  grade TEXT,
  start_date Date,
  end_date Date
);

CREATE TABLE Company_Invitations (
  id serial PRIMARY KEY,
  recruiter_id int NOT NULL,
  company_id int NOT NULL,
  department text NOT NULL,
  created_at TIMESTAMP NOT NULL,
  deadline TIMESTAMP NOT NULL,
  status SMALLINT NOT NULL
);

CREATE TABLE Candidates (
  seeker_id int NOT NULL,
  phase SMALLINT NOT NULL,
  recruiter_id int,
  job_id int NOT NULL,
  date_applied timestamp NOT NULL,
  last_status_update timestamp NOT NULL,
  similarity_score float NOT NULL,
  cv_id int NOT NULL,
  phase_deadline TIMESTAMP,
  interview_link TEXT,
  template_id INTEGER,
  placeholders_params JSON,
  recruitment_process_id int NOT NULL,
  assessment_deadline TIMESTAMP,
  PRIMARY KEY (job_id, seeker_id)
);

CREATE TABLE Job (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  recruitment_process_id int,
  company_id int,
  industry_id smallint NOT NULL,
  country TEXT,
  city TEXT,
  remote BOOLEAN NOT NULL,
  applied_cnt smallint NOT NULL,
  closed BOOLEAN NOT NULL,
  applied_cnt_limit smallint NOT NULL
);

CREATE TABLE Job_Embedding (
  job_id int PRIMARY KEY,
  embedding vector(768) NOT NULL
);

CREATE TABLE User_Skills (
  user_id int,
  skill_id int,
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE User_Experience (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  company_name text NOT NULL,
  start_date Date,
  end_date Date,
  description text,
  job_title text NOT NULL,
  country text,
  city text
);

CREATE TABLE CV (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  name text NOT NULL,
  created_at timestamp NOT NULL,
  deleted BOOLEAN NOT NULL
);

CREATE TABLE CV_Embedding (
  cv_id int PRIMARY KEY,
  vector vector(768) NOT NULL
);

CREATE TABLE Industry (
  id smallserial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE Job_Offer_Template (
  id serial PRIMARY KEY,
  name Text NOT NULL,
  description Text NOT NULL,
  company_id int NOT NULL,
  updated_at timestamp NOT NULL,
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
  phase_name text NOT NULL,
  score smallint NOT NULL,
  total_score smallint NOT NULL
);

CREATE TABLE Candidate_History (
  seeker_id int,
  job_id int,
  job_title text NOT NULL,
  phase_name text NOT NULL,
  phase_type smallint NOT NULL,
  status BOOLEAN NOT NULL,
  score smallint,
  total_score smallint,
  company_name text NOT NULL,
  date_applied timestamp NOT NULL,
  country text,
  city text,
  remote BOOLEAN NOT NULL,
  template_description TEXT,
  placeholders_params JSON,
  last_status_update timestamp NOT NULL,
  PRIMARY KEY (seeker_id, job_id)
);

CREATE TABLE Questions (
  id serial PRIMARY KEY,
  question_num smallint NOT NULL,
  assessment_id int NOT NULL,
  question text NOT NULL,
  answers text[] NOT NULL,
  correct_answers smallint[] NOT NULL
);

CREATE TABLE Job_Seeker_Embeddings (
  seeker_id int PRIMARY KEY,
  embedding vector(768) NOT NULL
);

CREATE TABLE CV_Keywords (
  CV_id int PRIMARY KEY,
  skills text[] NOT NULL,
  experiences JSON[]
);

CREATE TABLE Recommendations (
  job_id int NOT NULL,
  seeker_id int NOT NULL,
  similarity_score float NOT NULL,
  PRIMARY KEY (seeker_id, job_id)
) PARTITION BY RANGE (seeker_id);

CREATE TABLE Recommendations_1_10000 PARTITION OF Recommendations FOR VALUES FROM (1) TO (10001);

CREATE TABLE Reviews (
  id serial PRIMARY KEY,
  creator_id int,
  company_id int NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  rating smallint NOT NULL,
  role text NOT NULL,
  created_at timestamp NOT NULL
);

CREATE TABLE Report (
  id serial PRIMARY KEY,
  job_id int NOT NULL,
  creator_id int,
  created_at timestamp NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  UNIQUE (job_id, creator_id)
);

CREATE TABLE Action (
  id smallserial PRIMARY KEY,
  name text NOT NULL
);

CREATE TABLE Logs (
  id uuid PRIMARY KEY,
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

CREATE INDEX ON Candidate_History (company_name);

CREATE INDEX ON Candidate_History (country, city);

CREATE INDEX ON Candidate_History (job_id);

CREATE INDEX ON Recruiter (company_id);

CREATE INDEX ON Recruiter (department);

CREATE INDEX ON Company (size);

CREATE INDEX ON Company (rating);

CREATE INDEX ON Company_Location (country, city);

CREATE INDEX ON Company_Location (company_id);

CREATE INDEX ON Company_Invitations (company_id);

CREATE INDEX ON Company_Invitations (recruiter_id);

CREATE INDEX ON Candidates (recruiter_id, phase);

CREATE INDEX ON Candidates (phase);

CREATE INDEX ON Candidates (last_status_update);

CREATE INDEX ON Candidates (job_id, similarity_score);

CREATE INDEX ON Candidates (phase_deadline);

CREATE INDEX ON Candidates (seeker_id);

CREATE INDEX ON Job (country, city);

CREATE INDEX ON Job (remote);

CREATE INDEX ON Job (industry_id);

CREATE INDEX ON Job (created_at);

CREATE INDEX ON Job (title);

CREATE INDEX ON Job (company_id);

CREATE INDEX ON Job_Offer_Template (name);

CREATE INDEX ON Recruitment_Process (company_id);

CREATE INDEX ON Assessment (company_id);

CREATE INDEX ON Questions (assessment_id);

CREATE INDEX ON Recommendations (seeker_id, similarity_score);

CREATE INDEX ON Recommendations (job_id);

CREATE INDEX ON Reviews (company_id);

CREATE INDEX ON Reviews (rating);

CREATE INDEX ON Reviews (created_at);

CREATE INDEX ON Reviews (creator_id);

CREATE INDEX ON Report (creator_id);

CREATE INDEX ON Assessment_Score (job_id, seeker_id, phase_name);

CREATE INDEX ON Logs (company_id);

CREATE INDEX ON Logs (company_id, action_type);

CREATE INDEX ON Logs (company_id, performed_by);

CREATE INDEX ON Logs (company_id, created_at);

CREATE INDEX ON Recruitment_Phase (type);

CREATE INDEX ON Users (email);

ALTER TABLE Candidate_History ADD FOREIGN KEY (seeker_id) REFERENCES Job_Seeker (id) ON DELETE CASCADE;

ALTER TABLE Candidate_History ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE NO ACTION;

ALTER TABLE Candidate_History ADD FOREIGN KEY (phase_type) REFERENCES Phase_Type (id) ON DELETE SET NULL;

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

ALTER TABLE Candidates ADD FOREIGN KEY (cv_id) REFERENCES CV (id);

ALTER TABLE Job ADD FOREIGN KEY (recruitment_process_id) REFERENCES Recruitment_Process (id) ON DELETE SET NULL;

ALTER TABLE Job ADD FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE SET NULL;

ALTER TABLE Job ADD FOREIGN KEY (industry_id) REFERENCES Industry (id) ON DELETE CASCADE;

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

ALTER TABLE Reviews ADD FOREIGN KEY (creator_id) REFERENCES Job_Seeker (id) ON DELETE SET NULL;

ALTER TABLE Report ADD FOREIGN KEY (job_id) REFERENCES Job (id) ON DELETE CASCADE;

ALTER TABLE Report ADD FOREIGN KEY (creator_id) REFERENCES Job_Seeker (id) ON DELETE SET NULL;

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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant sequence usage for app users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Populate tables with predefined data
INSERT INTO Phase_Type (id, name) VALUES
(1, 'assessment'),
(2, 'interview'),
(3, 'cv screening'),
(4, 'job offer');

INSERT INTO Action (id, name) VALUES
(1, 'Move Candidate'),
(2, 'Create Template'),
(3, 'Remove Recruiter'),
(4, 'Add Recruiter'),
(5, 'Create Assessment'),
(6, 'Remove Assessment'),
(7, 'Create Recruitment Process'),
(8, 'Remove Recruitment Process'),
(9, 'Assign Candidate'),
(10, 'Unassign Candidate'),
(11, 'Create Job'),
(12, 'Close Job'),
(13, 'Update Job'),
(14, 'Update Recruitment Process'),
(15, 'Modify Interview Date'),
(16, 'Remove Template'),
(17, 'Update Template'),
(18, 'Send Invitation');

-- Insert 30 diverse industries
INSERT INTO Industry (name) VALUES
('Technology'), ('Healthcare'), ('Finance'), ('Education'), ('Manufacturing'),
('Retail'), ('Real Estate'), ('Transportation'), ('Telecommunications'), ('Hospitality'),
('Entertainment'), ('Media'), ('Advertising'), ('Energy'), ('Construction'),
('Agriculture'), ('Pharmaceuticals'), ('Biotechnology'), ('Aerospace'), ('Defense'),
('Automotive'), ('Fashion'), ('Food & Beverage'), ('E-commerce'), ('Non-profit'),
('Government'), ('Legal Services'), ('Consulting'), ('Insurance'), ('Cryptocurrency');

INSERT INTO Skills (name) VALUES
('javascript'), ('python'), ('java'), ('c++'), ('c#'), ('php'), ('html'), ('css'), ('react'), ('angular'),
('vue.js'), ('node.js'), ('express.js'), ('django'), ('flask'), ('spring boot'), ('ruby on rails'), ('sql'), ('postgresql'), ('mysql'),
('mongodb'), ('redis'), ('docker'), ('kubernetes'), ('aws'), ('azure'), ('google cloud'), ('restful apis'), ('graphql'), ('git'),
('ci/cd'), ('jenkins'), ('ansible'), ('terraform'), ('linux'), ('windows server'), ('agile'), ('scrum'), ('kanban'), ('project management'),
('data analysis'), ('machine learning'), ('tensorflow'), ('pytorch'), ('data science'), ('data visualization'), ('tableau'), ('power bi'), ('excel'), ('sas'),
('r'), ('statistical analysis'), ('deep learning'), ('natural language processing'), ('computer vision'), ('big data'), ('hadoop'), ('spark'), ('kafka'), ('elasticsearch'),
('devops'), ('microservices'), ('serverless'), ('security'), ('cybersecurity'), ('penetration testing'), ('firewalls'), ('vpn'), ('cryptography'), ('blockchain'),
('ethereum'), ('solidity'), ('smart contracts'), ('frontend development'), ('backend development'), ('full stack development'), ('ui/ux design'), ('figma'), ('adobe xd'), ('wireframing'),
('prototyping'), ('user research'), ('information architecture'), ('interaction design'), ('mobile development'), ('ios'), ('swift'), ('android'), ('kotlin'), ('react native'),
('flutter'), ('quality assurance'), ('testing'), ('selenium'), ('junit'), ('cypress'), ('manual testing'), ('automated testing'), ('performance testing'), ('load testing'),
('networking'), ('tcp/ip'), ('dns'), ('http/https'), ('routing'), ('switching'), ('voip'), ('sdn'),
('cloud computing'), ('virtualization'), ('vmware'), ('hyper-v'), ('storage'), ('san'), ('nas'), ('backup solutions'), ('disaster recovery'), ('itil'),
('service management'), ('incident management'), ('change management'), ('problem management'), ('customer support'), ('technical support'), ('help desk'), ('crm'), ('salesforce'), ('zendesk'),
('marketing'), ('digital marketing'), ('seo'), ('sem'), ('google analytics'), ('content marketing'), ('social media marketing'), ('email marketing'), ('ppc'), ('affiliate marketing'),
('copywriting'), ('content creation'), ('technical writing'), ('blogging'), ('video editing'), ('final cut pro'), ('adobe premiere'), ('after effects'), ('motion graphics'), ('3d modeling'),
('blender'), ('maya'), ('autocad'), ('architectural design'), ('interior design'), ('photography'), ('photo editing'), ('photoshop'), ('lightroom'), ('illustrator'),
('graphic design'), ('branding'), ('logo design'), ('typography'), ('print design'), ('packaging design'), ('animation'), ('game development'), ('unity'), ('unreal engine'),
('ar/vr'), ('augmented reality'), ('virtual reality'), ('iot'), ('embedded systems'), ('robotics'), ('pcb design'), ('microcontrollers'), ('arduino'), ('raspberry pi'),
('product management'), ('market research'), ('product strategy'), ('go-to-market'), ('user stories'), ('requirements gathering'), ('business analysis'), ('stakeholder management'), ('leadership'), ('team management'),
('object-oriented programming'), ('functional programming'), ('procedural programming'), ('scripting'), ('algorithm design'),
('data structures'), ('computational thinking'), ('problem solving'), ('debugging'), ('code optimization'),
('software architecture'), ('system design'), ('api design'), ('microarchitecture'), ('parallel computing'),
('distributed systems'), ('cloud architecture'), ('network architecture'), ('database design'), ('data modeling'),
('information security'), ('risk management'), ('governance'), ('incident response'),
('threat modeling'), ('security auditing'), ('vulnerability assessment'), ('cryptographic principles'), ('secure coding practices'),
('user interface design'), ('user experience design'), ('visual design'), ('information design'),
('design thinking'), ('design systems'), ('accessibility design'), ('responsive design'), ('prototype design'),
('statistical modeling'), ('predictive analytics'), ('quantitative analysis'), ('qualitative analysis'),
('business intelligence'), ('data warehousing'), ('etl processes'), ('data mining'), ('data governance'),
('pattern recognition'), ('neural networks'), ('reinforcement learning'), ('supervised learning'),
('unsupervised learning'), ('feature engineering'), ('model validation'), ('hyperparameter tuning'), ('natural language understanding'),
('computer vision principles'), ('robotics fundamentals'), ('iot systems'), ('embedded systems design'), ('firmware development'),
('systems integration'), ('solution architecture'), ('technical documentation'), ('requirements analysis'),
('agile methodologies'), ('scrum mastery'), ('kanban implementation'), ('lean principles'), ('waterfall methodology'),
('project planning'), ('resource allocation'), ('budget management'), ('timeline estimation'),
('test planning'), ('test case design'), ('defect tracking'), ('regression testing'),
('performance engineering'), ('load testing strategy'), ('stress testing methodology'), ('usability testing'), ('compatibility testing'),
('network design'), ('network security'), ('network optimization'), ('protocol analysis'), ('traffic management'),
('cloud migration'), ('cloud security'), ('cloud cost optimization'), ('hybrid cloud solutions'), ('multi-cloud strategy'),
('virtualization technologies'), ('container orchestration'), ('service mesh implementation'), ('infrastructure automation'), ('configuration management'),
('process modeling'), ('workflow optimization'), ('organizational development'),
('competitive intelligence'), ('product lifecycle management'), ('go-to-market planning'),
('persona development'), ('journey mapping'), ('usability studies'), ('a/b testing'),
('content strategy'), ('technical communication'), ('instructional design'), ('e-learning development'),
('digital marketing strategy'), ('search engine marketing'), ('social media strategy'), ('email campaign management'),
('brand management'), ('marketing analytics'), ('customer segmentation'), ('conversion rate optimization'), ('marketing automation'),
('sales techniques'), ('lead generation'), ('account management'), ('negotiation skills'),
('customer success'), ('support ticket management'), ('service level agreements'), ('knowledge management'), ('customer feedback analysis'),
('financial analysis'), ('budget forecasting'), ('cost-benefit analysis'), ('financial modeling'), ('investment analysis'),
('supply chain management'), ('logistics planning'), ('inventory control'), ('vendor management'), ('procurement strategies'),
('human resources'), ('talent acquisition'), ('employee engagement'), ('performance management'), ('compensation planning'),
('team building'), ('conflict resolution'), ('emotional intelligence'), ('decision making'),
('strategic planning'), ('business development'), ('partnership development'), ('contract negotiation'), ('mergers & acquisitions'),
('entrepreneurship'), ('startup management'), ('venture capital'), ('pitching'), ('business modeling'),
('creative direction'), ('art direction'), ('color theory'), ('layout composition'),
('photography principles'), ('videography'), ('audio production'), ('3d modeling concepts'),
('game design'), ('level design'), ('character design'), ('narrative design'), ('game mechanics'),
('grant writing'), ('proposal writing'), ('editing'),
('public speaking'), ('presentation skills'), ('facilitation'), ('mediation'), ('coaching'),
('research methodology'), ('experimental design'), ('data collection'), ('hypothesis testing'), ('academic writing'),
('sustainability practices'), ('environmental management'), ('corporate social responsibility'), ('ethical sourcing'), ('diversity & inclusion'),
('regulatory compliance'), ('quality control'), ('supply chain optimization'), ('operations management'),
('process improvement'), ('lean manufacturing'), ('six sigma'), ('continuous improvement'), ('facility management'),
('maintenance planning'), ('production scheduling'), ('workforce planning'), ('occupational safety'), ('environmental compliance'),
('hazard analysis'), ('waste management'), ('energy efficiency'), ('renewable energy systems'), ('carbon footprint reduction'),
('clinical research'), ('patient care'), ('medical ethics'), ('health informatics'), ('epidemiology'),
('pharmaceutical development'), ('drug safety'), ('clinical trials'), ('medical device regulation'), ('healthcare administration'),
('financial planning'), ('investment management'), ('risk analysis'), ('auditing'), ('tax strategy'),
('insurance underwriting'), ('claims processing'), ('actuarial science'), ('fraud detection'), ('wealth management'),
('curriculum development'), ('instructional coaching'), ('educational leadership'), ('student assessment'), ('special education'),
('learning technology'), ('academic advising'), ('educational policy'), ('vocational training'), ('literacy development'),
('retail merchandising'), ('visual merchandising'), ('buying strategy'), ('store operations'), ('customer experience'),
('e-commerce strategy'), ('omnichannel retailing'), ('sales forecasting'), ('category management'), ('brand positioning'),
('property valuation'), ('real estate development'), ('property management'), ('commercial leasing'), ('real estate law'),
('urban planning'), ('zoning regulations'), ('land use analysis'), ('real estate investment'), ('facility planning'),
('logistics management'), ('fleet management'), ('route optimization'), ('import/export compliance'), ('customs clearance'),
('supply chain visibility'), ('transport economics'), ('warehouse design'), ('distribution strategy'), ('transit planning'),
('network planning'), ('spectrum management'), ('telecom regulation'), ('wireless technologies'), ('fiber optics'),
('satellite communications'), ('unified communications'), ('telecom infrastructure'), ('service provisioning'), ('network reliability'),
('hospitality management'), ('food safety'), ('culinary arts'), ('menu engineering'), ('restaurant operations'),
('hotel revenue management'), ('event planning'), ('tourism development'), ('guest relations'), ('resort management'),
('media production'), ('content distribution'), ('broadcast operations'), ('journalistic ethics'), ('digital publishing'),
('media relations'), ('public affairs'), ('entertainment law'), ('talent management'), ('intellectual property'),
('advertising strategy'), ('media buying'), ('creative concepting'), ('brand storytelling'),
('consumer behavior'), ('campaign analytics'), ('account planning'), ('direct marketing'), ('promotional strategy'),
('oil & gas exploration'), ('petroleum engineering'), ('refinery operations'), ('power generation'), ('grid management'),
('energy trading'), ('energy policy'), ('sustainable resources'), ('nuclear safety'), ('renewable integration'),
('construction management'), ('structural engineering'), ('building codes'), ('project estimation'), ('contract administration'),
('construction safety'), ('sustainable building'), ('civil engineering'), ('site supervision'),
('crop science'), ('soil management'), ('precision farming'), ('livestock management'), ('agricultural economics'),
('food security'), ('irrigation systems'), ('agribusiness'), ('commodity trading'), ('organic farming'),
('drug discovery'), ('biochemical analysis'), ('genomics'), ('clinical laboratory'), ('biomanufacturing'),
('bioinformatics'), ('tissue engineering'), ('molecular biology'), ('bioreactor design'), ('bioprocess optimization'),
('aircraft design'), ('avionics'), ('flight operations'), ('aerospace materials'), ('propulsion systems'),
('space systems'), ('flight testing'), ('aircraft maintenance'), ('aviation safety'), ('air traffic management'),
('military strategy'), ('defense procurement'), ('cybersecurity defense'), ('intelligence analysis'), ('homeland security'),
('combat systems'), ('defense logistics'), ('tactical planning'), ('crisis management'), ('national security'),
('automotive design'), ('powertrain engineering'), ('vehicle dynamics'), ('automotive electronics'), ('manufacturing engineering'),
('supplier development'), ('assembly line'), ('automotive safety'), ('emissions control'),
('fashion design'), ('textile science'), ('apparel production'), ('fashion marketing'), ('trend forecasting'),
('supply chain ethics'), ('retail buying'), ('fashion styling'), ('costume design'), ('sustainable fashion'),
('food science'), ('nutrition'), ('food processing'), ('product development'), ('sensory evaluation'),
('food distribution'), ('haccp implementation'), ('beverage management'), ('culinary innovation'),
('non-profit management'), ('fundraising'), ('grant management'), ('program evaluation'), ('community outreach'),
('advocacy'), ('volunteer coordination'), ('donor relations'), ('social impact'), ('mission alignment'),
('public policy'), ('legislative affairs'), ('government relations'), ('regulatory affairs'), ('public budgeting'),
('civic engagement'), ('intergovernmental relations'), ('policy analysis'), ('public administration'), ('election management'),
('legal research'), ('contract law'), ('litigation'), ('corporate law'),
('dispute resolution'), ('legal writing'), ('due diligence'),
('management consulting'), ('strategy development'), ('organizational design'), ('change implementation'), ('process consulting'),
('financial advisory'), ('human capital'), ('operations consulting'), ('technology consulting'), ('benchmarking'),
('insurance products'), ('policy administration'), ('reinsurance'), ('claims investigation'),
('actuarial consulting'), ('employee benefits'), ('underwriting strategy'), ('insurance regulation'),
('blockchain technology'), ('cryptocurrency trading'), ('smart contract development'), ('tokenomics'), ('decentralized finance'),
('digital wallets'), ('crypto regulation'), ('initial coin offerings'), ('mining operations'), ('distributed ledger technology'),
('organizational behavior'), ('talent development'), ('succession planning'), ('knowledge transfer'), ('business continuity planning');