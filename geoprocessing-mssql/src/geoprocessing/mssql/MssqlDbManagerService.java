package geoprocessing.mssql;

import jandcode.dbm.db.*;
import jandcode.dbm.db.jdbc.*;

public class MssqlDbManagerService extends JdbcDbManagerService {

    public boolean existDatabase() throws Exception {
        return false;
    }

    public void createDatabase() throws Exception {
        Db dbsys = getSystemDb();
        dbsys.connect();
        try {
            dbsys.execSqlNative("create database " +
                    getDbSource().getDatabase());
        } finally {
            dbsys.disconnect();
        }
    }

    public void dropDatabase() throws Exception {
        Db dbsys = getSystemDb();
        dbsys.connect();
        try {
            dbsys.execSqlNative(" USE [master] \n");
            dbsys.execSqlNative(" DROP DATABASE " +
                    "["+getDbSource().getDatabase()+"] \n ");
        } finally {
            dbsys.disconnect();
        }
    }

}
