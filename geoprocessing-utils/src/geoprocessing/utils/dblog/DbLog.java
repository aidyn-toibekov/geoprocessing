package geoprocessing.utils.dblog;

/**
 * Интерфейс логгера
 */
public abstract class DbLog {

    public abstract void info(String msg);

    public abstract void warn(String msg);

    public abstract void error(String msg);

}
