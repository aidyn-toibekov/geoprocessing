package geoprocessing.utils.dbinfo;

import jandcode.dbm.ModelMember;

/**
 * Информация о базе данных
 */
public abstract class DbInfoService extends ModelMember {

    /**
     * id экземпляра базы. Если явно не установлено, пропысывается сгенерированным uuid
     *
     * @return
     */
    public abstract String getDbId();


}
