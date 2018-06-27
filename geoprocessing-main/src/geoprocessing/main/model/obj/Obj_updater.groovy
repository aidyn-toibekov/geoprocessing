package geoprocessing.main.model.obj

import geoprocessing.main.model.sys.*
import jandcode.dbm.data.DataRecord

class Obj_updater extends GeoprocessingUpdaterDao {


    @Override
    public DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(this.domain);

        record.setValue("length",1);
        record.setValue("width",1);
        record.setValue("height",1);

        return record;
    }

    protected void onBeforeSave(DataRecord rec, boolean ins) throws Exception {

        if(rec.getValueDouble("length") == 0){
            ut.errors.addErrorFatal("Длина объекта не может быть равна 0!")
        }

        if(rec.getValueDouble("width") == 0){
            ut.errors.addErrorFatal("Ширина объекта не может быть равна 0!")
        }

        if(rec.getValueDouble("height") == 0){
            ut.errors.addErrorFatal("Высота объекта не может быть равна 0!")
        }

        if(rec.getValueDouble("lon") == 0 || rec.getValueDouble("lat") == 0 ||
                rec.getValueDouble("lon") >= 180 || rec.getValueDouble("lat") >= 180){
            ut.errors.addErrorFatal("Укажите корректную долготу и широту!")
        }

        if(rec.getValueDouble("materialType") == 0){
            ut.errors.addErrorFatal("Укажите тип материала!")
        }

        super.onBeforeSave(rec, ins)
    }
}
