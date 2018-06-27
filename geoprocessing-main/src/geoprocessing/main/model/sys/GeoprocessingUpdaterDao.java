package geoprocessing.main.model.sys;

import jandcode.auth.*;
import jandcode.dbm.*;
import jandcode.dbm.dao.*;
import jandcode.dbm.data.*;
import jandcode.dbm.dblang.*;
import jandcode.lang.*;
import jandcode.wax.core.model.*;

import java.util.*;

/**
 * Базовый updater для таблиц ТОФИ с поведением по умолчанию.
 */
public abstract class GeoprocessingUpdaterDao extends WaxUpdaterDao {

    protected Map<Long, List<Long>> parentEntities = new HashMap<Long, List<Long>>();

    /**
     * Удалить запись с указанной id
     */
    @DaoMethod
    public void del(long id) throws Exception {
        onBeforeDel(id);
        onValidateDel(id);
        ut.checkErrors();

        //
        onDel(id);
        onAfterDel(id);
    }

    @DaoMethod
    public long ins(DataRecord rec) throws Exception {
        DataStore st = ut.createStore(rec);
        rec = st.getCurRec();
        //
        onBeforeSave(rec, true);
        onValidateSave(rec, true);
        ut.checkErrors();

        //
        long recId = onIns(rec);
        //
        onAfterSave(rec, true);

        return recId;
    }

    @DaoMethod
    public void upd(DataRecord rec) throws Exception {
        DataStore st = ut.createStore(rec);
        rec = st.getCurRec();
        //
        onBeforeSave(rec, false);
        onValidateSave(rec, false);
        ut.checkErrors();
        //
        onUpd(rec);
        //
        onAfterSave(rec, false);
    }

    protected void onBeforeSave(DataRecord rec, boolean ins) throws Exception {
        // Замена Даты начала
        Field f = rec.getDomain().findField("dBeg");
        if (f != null) {
            if (AppConst.isDateEmpty(rec.getValueDateTime("dBeg"))) {
                rec.setValue("dBeg", AppConst.DBEG_EMPTY);
            }
        }

        // Замена Даты Конца
        f = rec.getDomain().findField("dEnd");
        if (f != null) {
            if (AppConst.isDateEmpty(rec.getValueDateTime("dEnd"))) {
                rec.setValue("dEnd", AppConst.DEND_EMPTY);
            }
        }

        // Замена Комментариев (Очистка от "<br>")
        DblangService svc = ut.getModel().getDblangService();
        for (Lang lang : svc.getLangs()) {
            f = rec.getDomain().findField("cmt_" + lang.getName());
            if (f != null) {
                if (rec.getValueString(f.getName()).equalsIgnoreCase("<br>")) {
                    rec.setValue(f.getName(), null);
                }
            }
        }
    }

    protected void onAfterSave(DataRecord rec, boolean ins) throws Exception {
    }

    protected void onBeforeDel(long id) {
    }

    protected void onAfterDel(long id) {
    }


    /**
     * Реализация физического добавления записи c добавлением в поле ord значение поля id
     */
    protected long onIns(DataRecord rec) throws Exception {

        long id = rec.getValueLong("id");
        if (id == 0) {
            id = ut.getNextId(ut.getTableName());
            rec.setValue("id", id);
        }

        Field f = rec.getDomain().findField("ord");
        if (f != null) {
            rec.setValue("ord", id);
        }
        //
        ut.insertRec(ut.getTableName(), rec, false);
        //
        return id;
    }

    protected void addParentEntityId(long parentEntityConst, long parentEntityId) {
        if (!parentEntities.containsKey(parentEntityConst)) {
            List<Long> list = new ArrayList<Long>();
            parentEntities.put(parentEntityConst, list);
        }
        List<Long> list = parentEntities.get(parentEntityConst);
        list.add(parentEntityId);
    }

}
