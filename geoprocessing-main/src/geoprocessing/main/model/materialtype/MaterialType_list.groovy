package geoprocessing.main.model.materialtype

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class MaterialType_list extends WaxLoadSqlFilterDao {

    MaterialType_list() {
        domainResult = "MaterialType"
        domainFilter= "MaterialType.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from MaterialType h where 0=0  order by id
        """

    }
}




