
create table Wax_VerDb (
  id bigint not null,
  ver bigint
)
~~

alter table Wax_VerDb add constraint pk_Wax_VerDb primary key (id)
~~

create table DbLog (
  id bigint not null,
  lev varchar(10),
  dt datetime,
  name varchar(60),
  msg varchar(255)
)
~~

alter table DbLog add constraint pk_DbLog primary key (id)
~~

create table DbInfo (
  id bigint not null,
  dbid varchar(40)
)
~~

alter table DbInfo add constraint pk_DbInfo primary key (id)
~~

create table DbFileStorage (
  id bigint not null,
  path varchar(255),
  originalFilename varchar(255)
)
~~

alter table DbFileStorage add constraint pk_DbFileStorage primary key (id)
~~

create table Experiment (
  id bigint not null,
  name_ru text,
  name_kz text,
  name_en text,
  dte date,
  description_ru text,
  description_kz text,
  description_en text
)
~~

alter table Experiment add constraint pk_Experiment primary key (id)
~~

create table ExperimentData (
  id bigint not null,
  experimentFile bigint,
  x float,
  y float,
  a float
)
~~

alter table ExperimentData add constraint pk_ExperimentData primary key (id)
~~

create table ProcessedExperimentData (
  id bigint not null,
  experimentFile bigint,
  veilvetType bigint,
  x float,
  y float,
  a float
)
~~

alter table ProcessedExperimentData add constraint pk_ProcessedExperimentData primary key (id)
~~

create table ExperimentFile (
  id bigint not null,
  experiment bigint,
  name_ru text,
  name_kz text,
  name_en text,
  fileId bigint,
  description_ru text,
  description_kz text,
  description_en text
)
~~

alter table ExperimentFile add constraint pk_ExperimentFile primary key (id)
~~

create table FD_VeilvetType (
  id bigint not null,
  name_ru varchar(200),
  name_kz varchar(200),
  name_en varchar(200),
  fullName_ru varchar(300),
  fullName_kz varchar(300),
  fullName_en varchar(300),
  ord bigint,
  vis int
)
~~

alter table FD_VeilvetType add constraint pk_FD_VeilvetType primary key (id)
~~

create table MaterialType (
  id bigint not null,
  name_ru varchar(200),
  name_kz varchar(200),
  name_en varchar(200),
  muMin float,
  muMax float,
  epsMin float,
  epsMax float,
  sigma float
)
~~

alter table MaterialType add constraint pk_MaterialType primary key (id)
~~

create table Obj (
  id bigint not null,
  name_ru varchar(200),
  name_kz varchar(200),
  name_en varchar(200),
  length float,
  width float,
  height float,
  materialType bigint
)
~~

alter table Obj add constraint pk_Obj primary key (id)
~~

~~
insert into Wax_VerDb (id, ver) values (1, 0)
~~
~~
create table sys_jc_GenId (
    name varchar(64) not null,
    val bigint
)
~~

alter table sys_jc_GenId add constraint pk_sys_jc_GenId primary key (name)
~~

insert into sys_jc_GenId (name, val) values('WAX_VERDB', 1000)
~~
insert into sys_jc_GenId (name, val) values('DBLOG', 1000)
~~
insert into sys_jc_GenId (name, val) values('DBINFO', 1000)
~~
insert into sys_jc_GenId (name, val) values('DBFILESTORAGE', 1000)
~~
insert into sys_jc_GenId (name, val) values('EXPERIMENT', 1000)
~~
insert into sys_jc_GenId (name, val) values('EXPERIMENTDATA', 1000)
~~
insert into sys_jc_GenId (name, val) values('PROCESSEDEXPERIMENTDATA', 1000)
~~
insert into sys_jc_GenId (name, val) values('EXPERIMENTFILE', 1000)
~~
insert into sys_jc_GenId (name, val) values('FD_VEILVETTYPE', 1000)
~~
insert into sys_jc_GenId (name, val) values('MATERIALTYPE', 1000)
~~
insert into sys_jc_GenId (name, val) values('OBJ', 1000)
~~

~~
