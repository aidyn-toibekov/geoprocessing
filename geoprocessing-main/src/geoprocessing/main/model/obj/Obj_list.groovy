package geoprocessing.main.model.obj

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class Obj_list extends WaxLoadSqlFilterDao {

    Obj_list() {
        domainResult = "Obj"
        domainFilter= "Obj.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from Obj h where 0=0
        """

    }
}




