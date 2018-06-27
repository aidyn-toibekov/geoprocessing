package geoprocessing.main.model.experiment.file;

import jandcode.bgtasks.BgTask;
import jandcode.dbm.*;
import jandcode.dbm.data.DataRecord;
import jandcode.wax.core.model.WaxDaoUtils;


class FileProcessTask  extends BgTask{

    Model model;

    private long recId;


    FileProcessTask(long recId) {
        this.model = getApp().service(ModelService.class).getModel();

        this.recId = recId;
    }

    public void run() throws Exception {
        //DataRecord record = model.daoinvoke("")
    }
}
