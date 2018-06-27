package geoprocessing.main.js.platform;

import geoprocessing.main.utils.*;
import jandcode.app.*;
import jandcode.dbm.dao.*;
import jandcode.dbm.data.*;
import jandcode.wax.core.model.*;

/**
 * Информация по моделям и приложениям
 */
public class ModelsInfo extends WaxDao {

    protected String dname = "/geoprocessing/main/js/platform/ModelsInfo.domain.xml";

    /**
     * Список моделей
     */
    @DaoMethod
    public DataStore listModels() throws Exception {
        DataStore st = ut.createStore(dname);
        ListComp<ExpModel> md = getApp().service(ExpAppService.class).getExpModels();
        for (ExpModel m : md) {
            if ( !m.getModel().getRt().getValueBoolean("show") ) {
                continue;
            }
            String driver = m.getModel().getDbSource().getDbType();
            DataRecord r = st.add();
            r.set("id", m.getName());
            r.set("driver", driver);
            r.set("url", m.getModel().getDbSource().getUrl());
            r.set("username", m.getModel().getDbSource().getUsername());
            if ("oracle".equals(driver)) {
                r.set("info", m.getModel().getDbSource().getUsername());
            } else {
                r.set("info", m.getModel().getDbSource().getDatabase());
            }
        }
        return st;
    }

    /**
     * Список приложений
     */
    @DaoMethod
    public DataStore listApps() throws Exception {
        DataStore st = ut.createStore(dname);
        ListComp<ExpApp> apps = getApp().service(ExpAppService.class).getExpApps();
        for (ExpApp a : apps) {
            if (a.isSystem()) {
                continue;
            }
            DataRecord r = st.add();
            r.set("id", a.getName());
            r.set("info", a.getTitle());
            r.set("icon", a.getIcon());
            r.set("url",a.getAppUrl());
        }
        return st;
    }

}
