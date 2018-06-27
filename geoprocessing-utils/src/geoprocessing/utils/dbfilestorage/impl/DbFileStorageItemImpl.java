package geoprocessing.utils.dbfilestorage.impl;


import geoprocessing.utils.dbfilestorage.*;

import java.io.*;

public class DbFileStorageItemImpl extends DbFileStorageItem {

    private long id;
    private String originalFilename;
    private String path;
    private DbFileStorageServiceImpl service;

    public DbFileStorageItemImpl(DbFileStorageServiceImpl service, long id, String path, String originalFilename) {
        this.service = service;
        this.id = id;
        this.path = path;
        this.originalFilename = originalFilename;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public File getFile() {
        return new File(path);
    }

}
