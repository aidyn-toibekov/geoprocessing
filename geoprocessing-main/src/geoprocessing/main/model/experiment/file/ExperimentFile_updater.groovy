package geoprocessing.main.model.experiment.file

import geoprocessing.main.model.experiment.*
import geoprocessing.main.model.sys.*
import geoprocessing.utils.dbfilestorage.*
import jandcode.dbm.dao.*
import jandcode.dbm.data.*
import jandcode.utils.*
import jandcode.wax.core.utils.upload.*
import org.joda.time.DateTime

class ExperimentFile_updater extends GeoprocessingUpdaterDao {

    DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(getDomain());
        record.setValue("dte", DateTime.now());

        return record;
    }

    protected void onBeforeSave(DataRecord rec, boolean ins) throws Exception {
        if (rec.isValueNull("fn")) {
            ut.errors.addError("Файл не выбран")
        }

        setFileStorageId(rec);
    }

    protected void setFileStorageId(DataRecord rec) {
        UploadFile uf = (UploadFile) rec.get("fn");
        if (uf) {
            File f = new File(uf.fileName)
            String fn = uf.clientFileName.substring(uf.clientFileName.lastIndexOf(String.valueOf("\\")) + 1);

            if (fileExists(fn)) {
                ut.errors.addErrorFatal(UtLang.t("Файл с таким наименованием уже загружен"))
            } else {
                DbFileStorageService fstorage = model.service(DbFileStorageService)
                DbFileStorageItem md_file = fstorage.addFile(f, fn)
                rec.set("fileStorage", md_file.getId());
                rec.set("fileName", md_file.getOriginalFilename())
            }
            f.delete()
        }
    }

    protected boolean fileExists(String fileName) {
        DataStore st = ut.loadSql("select * from ExperimentFile s where s.fileName=:fileName ", UtCnv.toMap("fileName", fileName))
        return st.size() > 0
    }


    @DaoMethod
    public void processFile(long recId) {
        ExperimentUtils experimentUtils = new ExperimentUtils(ut, recId);
        experimentUtils.process();
    }


}
