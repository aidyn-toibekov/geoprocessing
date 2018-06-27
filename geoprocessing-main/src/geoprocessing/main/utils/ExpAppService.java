package geoprocessing.main.utils;

import jandcode.app.*;
import jandcode.dbm.*;
import jandcode.utils.*;
import jandcode.utils.rt.*;
import jandcode.web.*;

/**
 * Сервис для поддержки инфраструктуры платформы tofi
 */
public class ExpAppService extends CompRt implements IActivate {

    /**
     * атрибут http-запроса, в котором хранится имя текущего приложения
     */
    public static final String REQATTR_EXPAPP_NAME = "exp.app.name";


    protected ListComp<ExpModel> expModels = new ListComp<ExpModel>();
    protected ListComp<ExpApp> expApps = new ListComp<ExpApp>();

    
    public ExpAppService() {
        expModels.setNotFoundMessage(UtLang.t("Модель {0} не найдена"));
    }

    protected void onSetRt(Rt rt) {
        super.onSetRt(rt);

        // приложения
        Rt z = getApp().getRt().findChild("app/expapp");
        if (z != null) {
            for (Rt z1 : z.getChilds()) {
                ExpApp a = (ExpApp) getApp().getObjectFactory().create(z1, ExpApp.class);
                expApps.add(a);
            }
        }
    }

    public void activate() throws Exception {
        registerExpModels();
    }

    protected void registerExpModels() {
        ListComp<Model> models = getApp().service(ModelService.class).getModels();
        for (Model model : models) {
            if (model.getRt().getValueBoolean("exp")) {
                // это база данных tofi
                ExpModel m = getApp().getObjectFactory().create(ExpModel.class);
                m.setModel(model);
                expModels.add(m);
            }
        }
    }

    ////// models

    /**
     * Зарегистрированные модели tofi
     */
    public ListComp<ExpModel> getExpModels() {
        return expModels;
    }

    /**
     * Установить для потока модель по умолчанию.
     *
     * @param expModelName имя tofi-модели. Если null, то моделью по умолчанию становится
     *                      системная модель dbsys
     */
    public void setDefaultModel(String expModelName) {
        ExpModelProvider prv = null;
        if (expModelName != null) {
            prv = new ExpModelProvider(this, expModelName);
        }
        getApp().service(ModelService.class).setThreadModelProvider(prv);
    }

    ////// apps

    /**
     * Список зарегистрированных приложений
     */
    public ListComp<ExpApp> getExpApps() {
        return expApps;
    }

    /**
     * Текущее приложение tofi.
     * Возвращает приложение с именем 'none', если вызывается вне контекста приложения
     */
    public ExpApp getCurrentExpApp() {
        // вот и имя приложения
        String appName = UtCnv.toString(getApp().service(WebService.class).getRequest().getHttpRequest().getAttribute(REQATTR_EXPAPP_NAME));
        //
        ExpApp a = getExpApps().find(appName);
        if (a == null) {
            a = getApp().getObjectFactory().create(ExpApp.class);
            a.setName("none");
        }
        return a;
    }

    /**
     * Приложение tofi по умолчанию. platform
     */
    public ExpApp getDefaultExpApp() {
        return getExpApps().get("platform");
    }

}
