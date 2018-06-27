package geoprocessing.main.model.sys;

import jandcode.dbm.*;
import jandcode.dbm.field.*;
import jandcode.lang.*;
import jandcode.utils.*;

public class LangString2Field extends LangStringField {

    protected void onAddField() {
        doAddField(this);
        //
        String realFieldType = getRt().getValueString("realfield", "string");
        ListNamed<Lang> langs = getModel().getDblangService().getLangs();
        for (Lang lang : langs) {
            Field f = getOwner().addField(getName() + "_" + lang.getName(), realFieldType);
            f.setReq(false);
            f.setNotNull(false);
            f.setTitle(getTitle() + " (" + lang.getName() + ")");
            if (!f.getTitle().equals(f.getTitleShort())) {
                f.setTitleShort(getTitleShort() + " (" + lang.getName() + ")");
            }
            f.setSize(getSize());
        }
    }

}
