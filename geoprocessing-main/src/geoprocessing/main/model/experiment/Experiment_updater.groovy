package geoprocessing.main.model.experiment

import geoprocessing.main.model.sys.*
import jandcode.dbm.data.DataRecord
import org.joda.time.DateTime

class Experiment_updater extends GeoprocessingUpdaterDao {

    @Override
    public DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(getDomain());
        record.setValue("dte", DateTime.now());

        return record;
    }
}
