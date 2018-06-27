package geoprocessing.main.model.experiment

import geoprocessing.main.model.sys.OrderByUtils
import jandcode.dbm.sqlfilter.*
import jandcode.wax.core.model.*

class Experiment_list extends WaxLoadSqlFilterDao {

    Experiment_list() {
        domainResult = "Experiment"
        domainFilter= "Experiment.filter"

    }

    @Override
    protected void onCreateFilter(SqlFilter f) throws Exception {


        String sN = OrderByUtils.getOrderByLangField("h.name", ut)

        f.orderBy("dteDesc", "h.dte desc")
        f.orderBy("dte", "h.dte")
        f.orderBy("name", sN)

        f.sql = """
        select * from Experiment h where 0=0 order by h.dte desc
        """

    }
}




