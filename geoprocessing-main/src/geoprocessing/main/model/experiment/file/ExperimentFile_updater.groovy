package geoprocessing.main.model.experiment.file

import geoprocessing.main.model.experiment.*
import geoprocessing.main.model.sys.*
import geoprocessing.utils.dbfilestorage.*
import jandcode.dbm.dao.*
import jandcode.dbm.data.*
import jandcode.utils.*
import jandcode.wax.core.utils.upload.*
import jandcode.web.UtJson
import org.joda.time.DateTime

class ExperimentFile_updater extends GeoprocessingUpdaterDao {

    protected void onBeforeDel(long id) {
        ut.execSql("delete ExperimentData where experimentFile = :experimentFile", UtCnv.toMap("experimentFile", id))
        super.onBeforeDel(id)
    }

    @Override
    public DataRecord newRec() throws Exception {
        DataRecord record = ut.createRecord(getDomain());
        record.setValue("dte", DateTime.now());

        return record;
    }

    protected void onBeforeSave(DataRecord rec, boolean ins) throws Exception {
        if (rec.isValueNull("fn")) {
            ut.errors.addError("Файл не выбран")
        }

        setFileStorageId(rec);
    }

    protected void setFileStorageId(DataRecord rec) {
        UploadFile uf = (UploadFile) rec.get("fn");
        if (uf) {
            File f = new File(uf.fileName)
            String fn = uf.clientFileName.substring(uf.clientFileName.lastIndexOf(String.valueOf("\\")) + 1);

            if (fileExists(fn)) {
                ut.errors.addErrorFatal(UtLang.t("Файл с таким наименованием уже загружен"))
            } else {
                DbFileStorageService fstorage = model.service(DbFileStorageService)
                DbFileStorageItem md_file = fstorage.addFile(f, fn)
                rec.set("fileStorage", md_file.getId());
                rec.set("fileName", md_file.getOriginalFilename())
            }
            f.delete()
        }
    }

    protected boolean fileExists(String fileName) {
        DataStore st = ut.loadSql("select * from ExperimentFile s where s.fileName=:fileName ", UtCnv.toMap("fileName", fileName))
        return st.size() > 0
    }


    @DaoMethod
    public void processFile(long recId) {
        ExperimentUtils experimentUtils = new ExperimentUtils(ut, recId);
        experimentUtils.process();
    }


    @DaoMethod
    public DataStore getChartLayers(Map param) {
        DataStore store = ut.createStore("ExperimentFile.chartData");

        DataStore dataStore = ut.loadSql("select x from ExperimentData where experimentFile = :fileId group by x order by x", param);

        for (DataRecord record : dataStore) {
            DataRecord r = ut.createRecord("ExperimentFile.chartData")
            r.setValue("layer", record.getValue("x"));

            store.add(r);
        }
        return store;
    }

    @DaoMethod
    public String getChartData(Map param) {

        DataStore ds = ut.loadSql("select y, a from ExperimentData where experimentFile = :fileId and x = :layer order by y", param)
        Map map = new HashMap()

        // Генерация данных, выявление мин и мах

        List dataWihOutClearing = new ArrayList()
        List dataHaar = new ArrayList()
        List dataDobeshy = new ArrayList()

        Haar haar = new Haar();
        Dobeshy dobeshy = new Dobeshy();

        List category = new ArrayList()

        double min = ds.getCurRec().getValue("a")
        double max = ds.getCurRec().getValue("a");



        for (DataRecord record : ds) {
            double val = record.getValue("a")
            min = Math.min(val, min)
            max = Math.max(val, max)


            // Подписи
            category.add(label: record.getValueString("y"));
            // Данные
            Map mm = new HashMap()
            mm.put("value", val);
            dataWihOutClearing.add(mm)

            Map mmH = new HashMap()
            haar.setValue(val);
            mmH.put("value", haar.getValue());
            dataHaar.add(mmH)

            Map mmD = new HashMap()
            dobeshy.setValue(val);
            mmD.put("value", dobeshy.getValue());
            dataDobeshy.add(mmD)
        }

        Map chart = new HashMap()

        chart.put("canvaspadding", "10")
        //Растояние между графиком и вертикальными стенками контейнера
        // chart.put("caption", "График")
        //Заголовок
        chart.put("yaxisname", "Срез № " + param.get("layer"))
        //Заголовок Легенды У
        chart.put("bgcolor", "F7F7F7, E9E9E9")                //Фоновый цвет графика
        chart.put("numvdivlines", "10")
        //Растояние между вертикальными линиями за графиком
        chart.put("divlinealpha", "30")
        //Контрастность линий за графиком
        //    chart.put("divlinecolor", "F7F7F7")
        //    chart.put("labelpadding", "10")                             //Растояние между графиком и горизонтальными измерителями
        //   chart.put("yaxisvaluespadding", "10")                       //Растояние между графиком и вертикальными измерителями
        //   chart.put("anchorbgcolor", "F7F7F7")
        chart.put("showvalues", "0")
        
        //Показать значение на точках графика
        //    chart.put("rotatevalues", "0")                        //Повернуть на 90 градусов значение на точках графика
        chart.put("valueposition", "auto")
        chart.put("yAxisMaxvalue", max + (Math.abs(max) * 0.1))
        chart.put("yAxisMinValue", min - (Math.abs(min) * 0.1))


        chart.put("animation", true)
        chart.put("showLabels", "1")
        chart.put("showShadow", false)
        chart.put("lineColor", "2C6BA1")
        chart.put("drawAnchors", false)


        map.put("chart", chart)


        Map categoryMap = new HashMap()
        categoryMap.put("category", category)
        map.put("categories", [categoryMap])

        List dataSet = new ArrayList()
        Map m = new HashMap()
        m.put("seriesname", "Без очистки") //Название графика
        m.put("color", "B0171F")                            //Цвет графика
        m.put("data", dataWihOutClearing)
        dataSet.add(m)

        Map mH = new HashMap()
        mH.put("seriesname", "Хаар") //Название графика
        mH.put("color", "171fb0")                            //Цвет графика
        mH.put("data", dataHaar)
        dataSet.add(mH)

        Map mD = new HashMap()
        mD.put("seriesname", "Добеши") //Название графика
        mD.put("color", "0ddd48")                            //Цвет графика
        mD.put("data", dataDobeshy)
        dataSet.add(mD)


        map.put("dataset", dataSet);



        return UtJson.toString(map);
    }


}
