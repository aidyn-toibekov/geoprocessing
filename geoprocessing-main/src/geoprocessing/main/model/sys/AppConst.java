package geoprocessing.main.model.sys;

import jandcode.utils.*;
import org.joda.time.*;

/**
 * Различные глобальные константы
 */
public class AppConst {

    /**
     * Специальная дата, которая рассматривается как пустая дата начала периода
     */
    public static DateTime DBEG_EMPTY = new DateTime("1800-01-01");

    /**
     * Специальная дата, которая рассматривается как пустая дата конца периода
     */
    public static DateTime DEND_EMPTY = new DateTime("3333-12-31");


    /**
     * Проверка, что дата пустая
     */
    public static boolean isDateEmpty(DateTime d) {
        return UtDate.isEmpty(d) || d.equals(DBEG_EMPTY);
    }

    /**
     * Формат короткой даты без времени
     */
    public static String DATE_SHORT = "yyyy-MM-dd";

}
