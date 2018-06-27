package geoprocessing.mssql;

import jandcode.dbm.db.*;

import java.sql.*;

public class MssqlDbDriver extends DbDriver {

    public void MysqlDbDriver() {
        setDbType("mssql");
    }

    protected String getDbDatatypeName(ResultSetMetaData md, int i) throws Exception {
        int ct = md.getColumnType(i);
        String dt = getDbDatatypeName(ct);
        if ("float".equals(dt)) {
            dt = "double";
            return dt;
        }
        return super.getDbDatatypeName(md, i);
    }
}
