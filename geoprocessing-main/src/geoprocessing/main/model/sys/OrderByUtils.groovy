package geoprocessing.main.model.sys

import jandcode.dbm.db.*
import jandcode.dbm.dblang.*
import jandcode.lang.*

public class OrderByUtils {

    private static String desc = ""

    /**
     * Метод возвращает часть текста для запроса для упорядывания по многоязычным полям
     * Сначала текущий язык, потом остальные
     * @param fieldName Наименование поле
     * @param ut Утилиты для dao объектов
     * @param isDesc необязательный параметр, если isDesc = 1,
     * @return
     * Например: v.name_ru,v.name_kz,v.name_en
     *  Пример использования: /xtofi/main/model/prop/Prop_tree.groovy
     */
    public static String getOrderByLangField(String fieldName, DbUtils ut, Boolean isDesc = false) {

        if (isDesc)
            desc = " desc"

        String s = ""
        if (ut.getModel()) {

            DblangService svc = ut.getModel().getDblangService()
            Lang curLang = svc.getCurrentLang()

            s = fieldName + "_" + curLang.getName() + desc

            for (Lang lang : svc.getLangs()) {
                if (!lang.equals(curLang)) {
                    s = s + "," + fieldName + "_" + lang.getName() + desc
                }
            }
        }

        return s
    }

}

