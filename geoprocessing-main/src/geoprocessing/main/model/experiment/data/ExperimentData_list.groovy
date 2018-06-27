package geoprocessing.main.model.experiment.data

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class ExperimentData_list extends WaxLoadSqlFilterDao {

    ExperimentData_list() {
        domainResult = "ExperimentData"
        domainFilter= "ExperimentData.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from ExperimentData h where 0=0
        """

    }
}




