package geoprocessing.main.model.experiment.file

import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class ExperimentFile_list extends WaxLoadSqlFilterDao {

    ExperimentFile_list() {
        domainResult = "ExperimentFile.full"
        domainFilter= "ExperimentFile.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {

        f.filter(field: "experiment", type: "equal", hidden:true)

        f.sql = """
        select h.*, coalesce(t.cnt,0) as cnt from ExperimentFile h 
        left join (select experimentFile, count(*) as cnt from ExperimentData group by experimentFile) t on t.experimentFile = h.id
        where 0=0 
        order by h.id
        """

    }
}




