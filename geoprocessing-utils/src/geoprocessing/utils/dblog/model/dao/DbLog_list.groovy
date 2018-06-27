package geoprocessing.utils.dblog.model.dao

import jandcode.dbm.sqlfilter.SqlFilter
import jandcode.wax.core.model.WaxLoadSqlFilterDao

/**
 * Загрузка списка факторов c фильтрацией для гриды
 */
class DbLog_list extends WaxLoadSqlFilterDao {

    DbLog_list() {
        domainResult = "DbLog"
        domainFilter = "DbLog.filter"
    }

    protected void onCreateFilter(SqlFilter f) {
        f.filter(field: "name", type: "log.name")
        f.filter(field: "lev", type: "equal")
        //
        f.paginate = true
        //
        f.sql = "select t.* from DbLog t where 0=0 order by t.dt desc"
    }

}
