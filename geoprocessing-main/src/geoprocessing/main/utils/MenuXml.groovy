package geoprocessing.main.utils

import jandcode.auth.*
import jandcode.utils.*
import jandcode.utils.easyxml.*
import jandcode.web.*

/**
 * Утилиты для работы с файлами описания меню в xml
 */
class MenuXml {

    /**
     * Конвертация menu.xml в текст json для использования в качестве узлов дерева
     * @param fileName имя файла vfs
     */
    static String toJsonTreeNodes(String fileName) {
        def xx = new EasyXml()
        xx.load().fromFileObject(fileName)
        //
        def ar = []
        for (x1 in xx) {
            ar.add(toMapTree(x1))
        }
        //
        return UtJson.toString(ar)
    }

    /**
     * Конвертация menu.xml в текст json для использования в качестве узлов дерева
     * @param fileName имя файла vfs
     */
    static List toJson(String fileName) {
        def xx = new EasyXml()
        xx.load().fromFileObject(fileName)
        //
        def ar = []
        for (x1 in xx) {
            Map map = toMapTree(x1)
            if (map.size() > 0)
                ar.add(map)
        }
        //
        return ar
    }

    /**
     * Конвертирует узел xml в map(json) для использования в дереве
     */
    protected static Map toMapTree(EasyXml x) {

        if (x.attrs.containsKey("target")) {
            if (!checkUserPriv(x.attrs["target"])) return [:]
        }

        def showFrameAttrs = [:]
        def res = [:]
        for (a in x.attrs) {
            def an = a.key
            def av = a.value
            if (an in ["frame", "id"]) {
                // эти атрибуты передаем в showFrame
                if (an == "id" && UtCnv.toBoolean(av)) {
                    av = true
                }
                showFrameAttrs[an] = av
            } else if (an.startsWith("f.")) {
                String an1 = UtString.removePrefix(an, "f.")
                showFrameAttrs[an1] = av
            } else {
                // адаптируем атрибуты для дерева
                if (an == "title") {
                    an = "text"
                }
                if (an == "text") {
                    av = UtLang.t(av)
                }
                if (an == "icon") {
                    an = "iconCls"
                    av = 'icon-' + av
                }
                if (an == "expanded") {
                    av = UtCnv.toBoolean(av);
                }
                res[an] = av
            }
        }
        // bold
        if (res["bold"]) {
            res["text"] = "<b>" + res["text"] + "</b>"
            res.remove("bold")
        }
        // если есть showFrame-атрибуты, создаем их
        if (showFrameAttrs.size() > 0) {
            res['showFrame'] = showFrameAttrs
        }
        // дочерние элементы
        if (x.hasChilds()) {
            def ch = []
            res['children'] = ch
            for (x1 in x) {
                boolean hasAccess = true
                for (a in x1.attrs) {
                    if (a.key == "target") {
                        hasAccess = checkUserPriv(a.value)
                    }
                }
                if (hasAccess) {
                    ch.add(toMapTree(x1))
                }
                //ch.add(toMapTree(x1))
            }
        } else {
            res['leaf'] = true
        }
        if(x.name.equalsIgnoreCase("submenu")){
            res['submenu'] = true
        }
        return res
    }

    public static IUserInfo ui

    /**
     * проверяет доступ пользователя к цели (к пункту меню)
     */
    protected static boolean checkUserPriv(String target) {
        return ui.checkTarget(target, false)

    }

}
