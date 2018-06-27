package geoprocessing.main.model.experiment;

import geoprocessing.utils.dbfilestorage.*;
import jandcode.dbm.data.*;
import jandcode.dbm.db.*;
import jandcode.utils.*;
import jandcode.wax.core.model.*;

import java.io.*;
import java.util.*;
import java.util.regex.*;

public class ExperimentUtils {

    WaxDaoUtils ut;

    long experimentFileId;

    List<DataRecord> recordList = new ArrayList<DataRecord>();

    public ExperimentUtils(WaxDaoUtils ut, long experimentFileId) {
        this.ut = ut;
        this.experimentFileId = experimentFileId;
    }

    public void process() throws Exception {

        DataRecord rec = ut.loadRec("ExperimentFile", experimentFileId);

        DbFileStorageService fstorage = ut.getModel().service(DbFileStorageService.class);
        DbFileStorageItem md_file = fstorage.getFile(rec.getValueLong("fileStorage"));

        FileInputStream fstream = new FileInputStream(md_file.getFile());
        BufferedReader br = new BufferedReader(new InputStreamReader(fstream));

        String fileStrLine;

        Pattern p = Pattern.compile("^\\d+(.\\d)?;\\d+(.\\d)?;\\d+(.\\d)?;$");

        while ((fileStrLine = br.readLine()) != null) {
            Matcher m = p.matcher(fileStrLine.replaceAll(",", "."));
            if (m.matches()) {
                setToRecordList(processFileLine(experimentFileId, fileStrLine));
            }
        }

        br.close();

        insRecords();

        rec.setValue("processed", true);
        ut.updateRec("ExperimentFile", rec);
    }

    private void setToRecordList(DataRecord record) throws Exception {
        this.recordList.add(record);

        if (recordList.size() > 900) {
            insRecords();
        }
    }

    private void insRecords() throws Exception {
        if (recordList.size() == 0) {
            return;
        }

        int recCount = recordList.size();

        GenIdService genIdService = ut.getDb().getDbSource().getGenIdService();

        GenIdService.GenIdCached genId = genIdService.getGenIdCached("ExperimentData", recCount);

        Iterator<DataRecord> iterator = recordList.iterator();

        List<String> sqlList = new ArrayList<String>();

        while (iterator.hasNext()){
            DataRecord record = iterator.next();
             SqlBuilder builder = new SqlBuilder();
             builder.append(" (");
             builder.append(genId.getNextId()+",");
             builder.append(record.getValue("experimentFile")+",");
             builder.append(record.getValue("x")+",");
             builder.append(record.getValue("y")+",");
             builder.append(record.getValue("a")+") ");
             sqlList.add(builder.toString());
        }

        Db db = ut.getDb();

        try {
            db.startTran();
            String sql = "insert into ExperimentData (id, experimentFile, x, y, a) values ";
            db.execSqlNative(sql+ UtString.join(sqlList,","));
            db.commit();
        } catch (Exception e){
            db.rollback();
            e.printStackTrace();
        } finally {
            recordList.clear();
        }
    }


    private DataRecord processFileLine(long experimentId, String s) {
        String[] str = s.split(";");
        DataRecord record = ut.createRecord("ExperimentData");
        record.setValue("experimentFile", experimentId);
        record.setValue("x", str[0]);
        record.setValue("y", str[1]);
        record.setValue("a", str[2]);
        return record;
    }
}
