package geoprocessing.utils.dbinfo.impl;

import jandcode.dbm.data.*;
import jandcode.utils.*;
import jandcode.utils.error.*;
import geoprocessing.utils.dbinfo.*;
import geoprocessing.utils.dbinfo.model.*;

public class DbInfoServiceImpl extends DbInfoService {

    protected String dbid;

    public String getDbId() {
        if (dbid == null) {
            synchronized (this) {
                if (dbid == null) {
                    DbInfo_utils dao = (DbInfo_utils) getModel().createDao("DbInfo/utils");
                    try {
                        DataRecord r = dao.loadRec();
                        String s = r.getValueString("dbid");
                        if (UtString.empty(s)) {
                            s = dao.updateDbid();
                        }
                        dbid = s;
                    } catch (Exception e) {
                        throw new XErrorWrap(e);
                    }
                }
            }
        }
        return dbid;
    }

}
