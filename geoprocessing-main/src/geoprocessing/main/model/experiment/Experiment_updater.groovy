package geoprocessing.main.model.experiment

import geoprocessing.main.model.sys.*
import jandcode.dbm.data.DataRecord
import jandcode.dbm.data.DataStore
import jandcode.utils.UtCnv
import org.joda.time.DateTime

class Experiment_updater extends GeoprocessingUpdaterDao {

    protected void onBeforeDel(long id) {
        DataStore store = ut.loadSql("select id from ExperimentFile where experiment = :experiment",
                UtCnv.toMap("experiment", id));
        for (DataRecord record : store) {
            ut.daoinvoke("ExperimentFile/updater","del", record.getValueLong("id"));
        }
        super.onBeforeDel(id)
    }

    @Override
    public DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(getDomain());
        record.setValue("dte", DateTime.now());

        return record;
    }
}
