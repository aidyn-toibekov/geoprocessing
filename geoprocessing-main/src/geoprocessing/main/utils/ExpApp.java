package geoprocessing.main.utils;

import jandcode.app.*;

/**
 * Описание tofi-приложения.
 * <p/>
 * name хранит имя приложения.
 */
public class ExpApp extends CompRt {

    private String title;
    private String jsclass;
    private String icon = "app-platform";
    private boolean system;
    private String appUrl;

    /**
     * Название приложения
     */
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * js класс приложения
     */
    public String getJsclass() {
        return jsclass;
    }

    public void setJsclass(String jsclass) {
        this.jsclass = jsclass;
    }

    /**
     * Иконка приложения
     */
    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    /**
     * Системное приложение. Системные приложения не доступны в списках выбора
     * приложений. Они запускаются индивидуальным способом.
     */
    public boolean isSystem() {
        return system;
    }

    public void setSystem(boolean system) {
        this.system = system;
    }


    /**
     * Адрес где расположено приложение
     */
    public String getAppUrl() {
        return appUrl;
    }

    public void setAppUrl(String appUrl) {
        this.appUrl = appUrl;
    }
}
