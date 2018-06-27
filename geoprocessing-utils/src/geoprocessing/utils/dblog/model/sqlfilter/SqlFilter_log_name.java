package geoprocessing.utils.dblog.model.sqlfilter;

import jandcode.dbm.sqlfilter.ISqlFilterBuilder;
import jandcode.dbm.sqlfilter.SqlFilterItem;
import jandcode.utils.UtString;
import jandcode.utils.variant.IVariantMap;

/**
 * Для выбора логов начиная с уровня.
 * Например для 'testlog' найдется 'testlog','testlog.mod1'...
 */
public class SqlFilter_log_name extends SqlFilterItem {
    protected void onBuild(ISqlFilterBuilder b, IVariantMap params) throws Exception {
        String sv = params.getValueString(getParam());
        if (UtString.empty(sv)) {
            return;
        }
        //
        String pname_eq = b.getParamName("eq");
        String pname_sw = b.getParamName("sw");
        //
        b.addParam(pname_sw, sv + ".%");
        b.addParam(pname_eq, sv);
        b.addWhere("(" + getSqlField() + "=:" + pname_eq + " or " +
                getSqlField() + " like :" + pname_sw + ")");
        b.addTitle(getTitle(), sv);
    }
}
