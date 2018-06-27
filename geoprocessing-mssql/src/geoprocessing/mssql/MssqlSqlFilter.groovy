package geoprocessing.mssql

import jandcode.dbm.db.*
import jandcode.dbm.sqlfilter.impl.*
import jandcode.utils.*

/**
 * Построитель sql с фильтрацией
 */
public class MssqlSqlFilter extends SqlFilterImpl {

    private HashMapNoCase<String> orderBys = new HashMapNoCase<String>();

    public void orderBy(String name, String expr) {
        orderBys.put(name, expr);
        unprepare();
    }

    public void orderBy(Map orderBy) {
        if (orderBy != null) {
            orderBys.putAll(orderBy);
        }
        unprepare();
    }

    protected String makeSqlPaginate() {
        long pgSt = getParamPaginateStart() + 1;
        long pgEnd = pgSt + getParamPaginateLimit();
        //
        String s = getSqlLoad();

        s = SqlFilterUtils.replaceOrderBy(s, "");
        String pgSql = "select * from ( select ROW_NUMBER() OVER (ORDER BY (SELECT 1)) as r__n, r__all.* from (\n\n" +
                s +
                "\n\n) r__all ) t where r__n>=" + pgSt + " and r__n<" + pgEnd + "\n";

        String ordbs = getParams().getValueString(P_ORDERBY);
        if (!UtString.empty(ordbs)) {
            String expr = orderBys.get(ordbs);
            if (!UtString.empty(expr)) {
                expr = removeTablePrefix(expr);
                pgSql = pgSql.replace("(SELECT 1)", expr)
            }
        };

        return pgSql;
    }

    protected String makeSqlLoad() {
        String s = getSqlPrepared();
        String ordbs = getParams().getValueString(P_ORDERBY);
        if (!UtString.empty(ordbs)) {

            String expr = orderBys.get(ordbs);
            if (!UtString.empty(expr)) {
                s = SqlFilterUtils.replaceOrderBy(s, expr);
            }
        }
        return s;
    }

    private String removeTablePrefix(String orderSql){
        String[] lst = orderSql.split(",");
        List l = new ArrayList();
        for(String s:lst){
            int pNum = s.indexOf(".");
            String ns = s.substring(pNum + 1);
            l.add(ns);
        };
        String rs = l.join(",");
        return rs;
    }

}
