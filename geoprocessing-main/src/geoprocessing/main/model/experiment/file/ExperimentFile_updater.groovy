package geoprocessing.main.model.experiment.file

import geoprocessing.main.model.sys.*
import geoprocessing.utils.dbfilestorage.DbFileStorageItem
import geoprocessing.utils.dbfilestorage.DbFileStorageService
import jandcode.bgtasks.BgTask
import jandcode.bgtasks.BgTasksService
import jandcode.dbm.dao.DaoMethod
import jandcode.dbm.data.DataRecord
import jandcode.dbm.data.DataStore
import jandcode.utils.UtCnv
import jandcode.utils.UtLang
import jandcode.wax.core.utils.upload.UploadFile
import org.joda.time.DateTime

class ExperimentFile_updater extends GeoprocessingUpdaterDao {


    protected void onBeforeSave(DataRecord rec, boolean ins) throws Exception {
        if (rec.isValueNull("fn")) {
            ut.errors.addError("Файл не выбран")
        }

        rec.setValue("dte", DateTime.now());

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
        DataStore st = ut.loadSql("select * from ExperimentFile s where s.fileName=:fileName ", UtCnv.toMap("fileName",fileName))
        return st.size() > 0
    }


    @DaoMethod
    public void processFile(long recId){
        BgTask task = new FileProcessTask(recId);

        BgTasksService service = getApp().service(BgTasksService);
        service.addTask(task);
    }


}
