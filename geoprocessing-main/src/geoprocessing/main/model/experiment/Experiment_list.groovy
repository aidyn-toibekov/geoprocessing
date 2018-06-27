package geoprocessing.main.model.experiment

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class Experiment_list extends WaxLoadSqlFilterDao {

    Experiment_list() {
        domainResult = "Experiment"
        domainFilter= "Experiment.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.sql = """
        select * from Experiment h where 0=0
        """

    }
}




