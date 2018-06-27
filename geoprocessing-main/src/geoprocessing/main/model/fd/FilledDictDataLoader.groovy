package geoprocessing.main.model.fd

import groovy.transform.*
import jandcode.dbm.data.*
import jandcode.dbm.dataloader.*
import jandcode.utils.error.*
import jandcode.utils.rt.*

/**
 * Загрузчик данных предопределенного словаря из тега dictdata домена
 */
@CompileStatic
class FilledDictDataLoader extends DataLoader {

    protected void onLoad() throws Exception {
        Rt dd = getData().getDomain().getRt().findChild("dictdata");
        if (dd == null) {
            throw new XError("Для домена {0} не определен тег <dictdata>", getData().getDomain().getName())
        }
        //
        def st = getData()
        //
        for (x in dd.getChilds()) {
            def rec = st.add()
            for (a in x.attrs) {
                if (rec.domain.findField(a.name) == null) {
                    continue
                }
                rec.set(a.name, a.value)
            }
            normalizeNames(rec)
        }

    }

    protected void normalizeNames(DataRecord rv) {
        def langs = getModel().getDblangService().getLangs()
        for (lang in langs) {
            def nameShort = rv.getValueString('name_' + lang.name)
            def nameFull = rv.getValueString('fullName_' + lang.name)
            if (nameShort == "" && nameFull != "") {
                rv.setValue('name_' + lang.name, nameFull)
            } else if (nameShort != "" && nameFull == "") {
                rv.setValue('fullName_' + lang.name, nameShort)
            }
        }
    }

}
