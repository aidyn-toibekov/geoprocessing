package geoprocessing.utils.dblog.impl;

import jandcode.dbm.data.*;
import jandcode.utils.error.*;
import org.apache.commons.logging.*;
import org.joda.time.*;
import geoprocessing.utils.dblog.*;

public class DbLogServiceImpl extends DbLogService {

    protected Log log = LogFactory.getLog(DbLogService.class);

    protected void addMsg(String lev, String name, String msg) {
        DataRecord r = getModel().createRecord("DbLog");
        r.setValue("lev", lev);
        r.setValue("dt", new DateTime());
        r.setValue("name", name);
        r.setValue("msg", msg);
        try {
            getModel().daoinvoke("DbLog/updater", "ins", r);
        } catch (Exception e) {
            throw new XErrorWrap(e);
        }
    }

    public DbLog getLog(String name) {
        return new DbLogImpl(name, this);
    }

}
