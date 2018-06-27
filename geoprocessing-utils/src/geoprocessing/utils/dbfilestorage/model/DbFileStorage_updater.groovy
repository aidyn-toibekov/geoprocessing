package geoprocessing.utils.dbfilestorage.model

import jandcode.dbm.dao.DaoMethod
import jandcode.dbm.data.DataRecord
import jandcode.wax.core.model.WaxUpdaterDao

class DbFileStorage_updater extends WaxUpdaterDao {

    @DaoMethod
    long getNextId() throws Exception {
        return ut.getNextId(ut.tableName)
    }

    protected long onIns(DataRecord rec) throws Exception {
        return ut.insertRec(ut.getTableName(), rec, false);
    }

}
