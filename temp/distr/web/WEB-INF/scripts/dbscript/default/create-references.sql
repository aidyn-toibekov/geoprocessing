
alter table ExperimentData add constraint fk_ExperimentData_exp_0b248f88
foreign key(experimentFile) references ExperimentFile(id) 
~~

alter table ProcessedExperimentData add constraint fk_ProcessedExperimen_132ad4bd
foreign key(experimentFile) references ExperimentFile(id) 
~~

alter table ProcessedExperimentData add constraint fk_ProcessedExperimen_e5e772ea
foreign key(veilvetType) references FD_VeilvetType(id) 
~~

alter table ExperimentFile add constraint fk_ExperimentFile_experiment
foreign key(experiment) references Experiment(id) 
~~

alter table Obj add constraint fk_Obj_materialType
foreign key(materialType) references MaterialType(id) 
~~

~~
