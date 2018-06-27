package geoprocessing.utils.dbinfo.model

import jandcode.dbm.dao.DaoMethod
import jandcode.dbm.data.DataRecord
import jandcode.wax.core.model.WaxDao

class DbInfo_utils extends WaxDao {

    @DaoMethod
    public DataRecord loadRec() throws Exception {
        return ut.loadRec(ut.tableName, 1)
    }

    @DaoMethod
    public String updateDbid() throws Exception {
        UUID z = UUID.randomUUID()
        String dbid = z.toString()
        ut.updateRec(ut.tableName, [id: 1, dbid: dbid])
        return dbid
    }

}
