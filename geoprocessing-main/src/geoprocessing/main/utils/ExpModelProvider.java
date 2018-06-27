package geoprocessing.main.utils;

import jandcode.dbm.*;

/**
 * Провайдер моделей для ModelService.
 * Для модели "default" возвращает текущую модель tofi, определяемую контекстом
 * выполнения запроса.
 */
public class ExpModelProvider implements IModelProvider {

    private ExpAppService service;
    private String defaultModelName;

    public ExpModelProvider(ExpAppService service, String defaultModelName) {
        this.service = service;
        this.defaultModelName = defaultModelName;
    }

    public Model getModel(String name) {
        if ("default".equals(name)) {
            name = defaultModelName;
        }
        ExpModel m = service.getExpModels().find(name);
        if (m == null) {
            return null;
        }
        return m.getModel();
    }

}
