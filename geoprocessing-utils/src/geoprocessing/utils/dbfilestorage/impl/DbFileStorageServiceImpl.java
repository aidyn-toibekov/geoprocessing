package geoprocessing.utils.dbfilestorage.impl;

import jandcode.app.*;
import jandcode.dbm.data.*;
import jandcode.utils.*;
import jandcode.utils.error.*;
import org.apache.commons.io.*;
import geoprocessing.utils.dbfilestorage.*;
import geoprocessing.utils.dbfilestorage.model.*;
import geoprocessing.utils.dbinfo.*;

import java.io.*;

public class DbFileStorageServiceImpl extends DbFileStorageService {

    protected FnCnv fnCnv = new FnCnv(500);  // НЕ МЕНЯТЬ 500! сломается генерация уникальных
    protected String storagePath;

    public String getStoragePath() {
        if (storagePath == null) {
            synchronized (this) {
                if (storagePath == null) {
                    String sp = getApp().service(DataDirService.class).getDataDir("dbfilestorage");
                    String dbid = getModel().service(DbInfoService.class).getDbId();
                    String s = UtFile.join(sp, dbid);
                    if (!UtFile.exists(s)) {
                        UtFile.mkdirs(s);
                    }
                    storagePath = s;
                }
            }
        }
        return storagePath;
    }

    protected DbFileStorageItemImpl createItem(long id, String path, String originalFilename) {
        return new DbFileStorageItemImpl(this, id, path, originalFilename);
    }

    public DbFileStorageItem getFile(long id) throws Exception {
        DbFileStorage_updater dao = (DbFileStorage_updater) getModel().createDao("DbFileStorage/updater");
        DataRecord r = dao.loadRec(id);
        //
        String realpath = UtFile.join(getStoragePath(), r.getValueString("path"));
        //
        return createItem(r.getValueLong("id"), realpath, r.getValueString("originalFilename"));
    }

    public DbFileStorageItem addFile(File f, String originalFilename) throws Exception {
        if (UtString.empty(originalFilename)) {
            originalFilename = f.getName();
        }
        DbFileStorage_updater dao = (DbFileStorage_updater) getModel().createDao("DbFileStorage/updater");
        long id = dao.getNextId();
        //
        String path = fnCnv.toFileName(id);
        String realpath = UtFile.join(getStoragePath(), path);
        if (UtFile.exists(realpath)) {
            throw new XError("File {0} already exists. Check storage and database!", realpath);
        }
        //
        DbFileStorageItemImpl it = createItem(id, realpath, originalFilename);
        // копируем во временный
        File fTmp = new File(realpath + ".tmp");
        FileUtils.copyFile(f, fTmp);
        // после копирования переименовываем
        fTmp.renameTo(new File(realpath));
        // записываем в базу
        DataRecord rec = getModel().createRecord("DbFileStorage");
        rec.set("id", id);
        rec.set("path", path); // относительный путь!
        rec.set("originalFilename", originalFilename);
        dao.ins(rec);
        //
        return it;
    }

    public void removeFile(long id) throws Exception {
        if (id == 0) {
            return;
        }

        DbFileStorage_updater dao = (DbFileStorage_updater) getModel().createDao("DbFileStorage/updater");

        // берем файл
        DbFileStorageItem it = getFile(id);
        File f = it.getFile();

        // удаляем из базы
        dao.del(id);

        // удаляем файл
        f.delete();
    }
}
