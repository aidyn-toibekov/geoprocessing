package geoprocessing.main.model.experiment.file

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class ExperimentFile_list extends WaxLoadSqlFilterDao {

    ExperimentFile_list() {
        domainResult = "ExperimentFile"
        domainFilter= "ExperimentFile.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from ExperimentFile h where 0=0
        """

    }
}




