package geoprocessing.main.model.experiment.data

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class ProcessedExperimentData_list extends WaxLoadSqlFilterDao {

    ProcessedExperimentData_list() {
        domainResult = "ProcessedExperimentData"
        domainFilter= "ProcessedExperimentData.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from ProcessedExperimentData h where 0=0
        """

    }
}




