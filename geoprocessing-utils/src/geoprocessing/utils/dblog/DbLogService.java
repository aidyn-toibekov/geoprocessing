package geoprocessing.utils.dblog;

import jandcode.dbm.ModelMember;

/**
 * Сервис логирования в базе данных.
 * По принципу "сильно упрощенный log4j"
 */
public abstract class DbLogService extends ModelMember {

    /**
     * Получить логгер
     *
     * @param name имя. например 'mymodule.mysubsystem'
     * @return
     */
    public abstract DbLog getLog(String name);

}
