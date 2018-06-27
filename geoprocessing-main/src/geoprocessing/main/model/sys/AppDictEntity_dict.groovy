package geoprocessing.main.model.sys

import jandcode.dbm.dao.*
import jandcode.dbm.dict.*
import jandcode.lang.Lang
import jandcode.utils.*
import jandcode.wax.core.model.*

public class AppDictEntity_dict extends WaxDao implements ILoadDict {

    private int blockSize = 200;

    /**
     * Размер блока. По умолчанию 200
     */
    public int getBlockSize() {
        return blockSize;
    }

    public void setBlockSize(int blockSize) {
        this.blockSize = blockSize;
    }

    @DaoMethod
    public void loadDict(Dict dict) throws Exception {
        /*CollectionBlockIterator z = new CollectionBlockIterator(dict.getResolveIds(), getBlockSize());
        for (List itms : z) {
            StringBuilder sql = new StringBuilder()
            sql.append("select id, name_ru")
            sql.append(" from ").append(ut.tableName).append(" where id in (")
            sql.append(UtString.join(itms, ',')).append(")")
            ut.loadSql(dict.getData(), sql.toString());
        }*/

        ListNamed<Lang> langs = ut.getModel().getDblangService().getLangs();
        CollectionBlockIterator z = new CollectionBlockIterator(dict.getResolveIds(), getBlockSize());
        for (List itms : z) {
            StringBuilder sql = new StringBuilder()
            sql.append("select id")
            for (lang in langs) {
                sql.append(",name_").append(lang.name)
            }
            sql.append(" from ").append(ut.tableName).append(" where id in (")
            sql.append(UtString.join(itms, ',')).append(")")
            ut.loadSql(dict.getData(), sql.toString());
        }

    }

}
