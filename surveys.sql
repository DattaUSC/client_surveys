create table client (
  id bigint not null primary key,
  phone decimal(10) unique,
  email varchar(50) unique,
  postal varchar(1000),
  name varchar(50));

create table industry (
  id int not null auto_increment primary key,
  description varchar(50) not null unique);

insert into industry values(
  'Non-profit',
  'Information technology',
  'Education',
  'Retail',
  'Customer service / Help desk',
  'Health care',
  'Hospitality');

create table intake_survey (
  barriers_survey int not null primary key,
  client_id bigint not null,
  date datetime not null default now(),
  education_level enum(
    'less_than_hs',
    'hs',
    'some_college',
    'associate',
    'bachelor',
    'masters',
    'doctorate'),
  education_desc varchar(50),
  prev_work_experience text,
  industry_interest int,
  other_industry varchar(50),
  current_resume boolean not null,
  home_internet boolean not null,
  benefits_received set(
    'ga',
    'ssi',
    'calworks',
    'gahc',
    'unemployment',
    'food_stamps') not null,
  other_benefits text,
  areas_of_support set(
    'resume',
    'interview',
    'choose_industry',
    'referrals',
    'tech_skills',
    'edu_referrals') not null,
  other_supports text,
  unique (client_id, date),
  foreign key (barriers_survey) references barriers_survey (id),
  foreign key (client_id) references client (id),
  foreign key (industry_interest) references industry (id));

create table barriers_survey(
  id int auto_increment not null primary key,
  barriers_to_employment set(
    'transport',
    'child_care',
    'housing',
    'drugs',
    'mental',
    'education',
    'criminal',
    'tech_skills') not null,
  other_barriers text,
  housing_status enum(
    'stable',
    'unstable',
    'homeless') not null)

create table course_enrollment (
  client_id bigint not null,
  session_start date not null,
  course int not null,
  primary key (client_id, course),
  foreign key (client_id) references client (id));

create table job_survey (
  barriers_survey int not null primary key,
  client_id bigint not null,
  date datetime not null default now(),
  eligible_for_employment boolean not null,
  seeking_employment boolean not null,
  has_resume boolean not null,
  eligibility_note text,
  freeform_note text,
  foreign key (barriers_survey) references barriers_survey (id),
  foreign key (client_id) references client (id),
  unique (client_id, date));

create table company (
  id int not null auto_increment primary key,
  name varchar(250) not null unique);

create table job (
  id int not null auto_increment primary key,
  survey_id int not null,
  company_placed int,
  hours_per_week unsigned decimal(4,2) not null,
  wages unsigned decimal(5,2) not null,
  benefits set('health', 'dental', 'vision') not null,
  is_temporary boolean not null,
  commute_minutes unsigned decimal(3) not null,
  commute_method enum(
    'car',
    'carpool',
    'transit',
    'walk',
    'bicycle') not null,
  industry int,
  other_industry varchar(50),
  foreign key (survey_id) references survey (id),
  foreign key (industry) references industry (id),
  foreign key (company_placed) references company (id));
