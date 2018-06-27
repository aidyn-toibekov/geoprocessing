package geoprocessing.main.model.materialtype

import geoprocessing.main.model.sys.*
import jandcode.dbm.data.DataRecord

class MaterialType_updater extends GeoprocessingUpdaterDao {

    @Override
    public DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(this.domain);

        record.setValue("muMin",1);
        record.setValue("muMax",1);
        record.setValue("epsMin",1);
        record.setValue("epsMax",1);
        record.setValue("sigma",1);

        return record;
    }
}
