package geoprocessing.main.filter;

import geoprocessing.main.utils.*;
import jandcode.lang.*;
import jandcode.utils.*;
import jandcode.utils.error.*;
import jandcode.utils.vdir.*;
import jandcode.web.*;

/**
 * Фильтр запросов для tofi.
 * <p/>
 * Для запроса вида: 'a/platform/LANG' устанавливает контекст приложения 'platform'
 * и системную базу dbsys как базу по умолчанию.
 * <p/>
 * Для запроса вида: 'a/APPNAME/MODELNAME/LANG' устанавливает контекст приложения 'APPNAME'
 * и базу MODELNAME как базу по умолчанию.
 * <p/>
 * Текущий язык устанавливается как LANG.
 */
public class ExpAppWebFilter extends WebFilter {

    protected void onBeforeHandleRequest() throws Exception {
        WebRequest request = getRequest();
        //
        String pi = request.getPathInfo();
        if (pi.startsWith("a/platform/")) {
            // возможно платформа
            String[] ar = pi.split("/");
            if (ar.length >= 3) {
                // точно платформа
                changeContext("platform", null, ar[2], "a/platform/" + ar[2]);
            }
        } else if (pi.startsWith("a/")) {
            // возможно приложение
            String[] ar = pi.split("/");
            if (ar.length >= 4) {
                // точно приложение
                changeContext(ar[1], ar[2], ar[3], "a/" + ar[1] + "/" + ar[2] + "/" + ar[3]);
            }
        } else {
            // обычный запрос
            changeContext(null, null, null, null);
        }
    }

    private void changeContext(String appName, String modelName, String langName, String virtualRoot) {
        ExpAppService svc = getApp().service(ExpAppService.class);

        // устанавливаем приложение
        if (appName != null) {
            // проверяем наличие
            ExpApp a = svc.getExpApps().find(appName);
            if (a == null) {
                throw new XError("Не найдено приложение {0}", appName);
            }
        }
        getRequest().getHttpRequest().setAttribute(ExpAppService.REQATTR_EXPAPP_NAME, appName);

        // ставим модель
        if (modelName != null) {
            // проверяем наличие
            ExpModel a = svc.getExpModels().find(modelName);
            if (a == null) {
                throw new XError("Не найдена модель {0}", modelName);
            }
        }
        getApp().service(ExpAppService.class).setDefaultModel(modelName);

        // ставим язык
        getApp().service(LangService.class).setCurrentLang(langName);

        // формируем pathinfo
        if (virtualRoot != null) {
            String pi = getRequest().getPathInfo();
            String newPi = UtString.removePrefix(pi, virtualRoot);
            if (newPi != null) {
                getRequest().setVrtualRoot(virtualRoot);
                getRequest().setPathInfo(VDir.normalize(newPi));
            }
        }
    }

}
