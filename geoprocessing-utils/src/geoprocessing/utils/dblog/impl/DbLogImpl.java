package geoprocessing.utils.dblog.impl;


import geoprocessing.utils.dblog.*;

public class DbLogImpl extends DbLog {

    private String name;
    private DbLogServiceImpl service;

    public DbLogImpl(String name, DbLogServiceImpl service) {
        this.name = name;
        this.service = service;
    }

    public void info(String msg) {
        service.addMsg("info", name, msg);
    }

    public void warn(String msg) {
        service.addMsg("warn", name, msg);
    }

    public void error(String msg) {
        service.addMsg("error", name, msg);
    }

}
