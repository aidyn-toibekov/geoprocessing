package geoprocessing.main.utils;

import jandcode.app.*;
import jandcode.dbm.*;

/**
 * Модель tofi.
 * Содержит ссылку на зарегистрированную модель dbm.
 */
public class ExpModel extends Comp {

    private Model model;

    public Model getModel() {
        return model;
    }

    public void setModel(Model model) {
        this.model = model;
        this.setName(model.getName());
    }
}
