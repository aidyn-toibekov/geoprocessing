package geoprocessing.utils.dbfilestorage;

import jandcode.dbm.ModelMember;

import java.io.File;

/**
 * Сервис файлового хранилища
 */
public abstract class DbFileStorageService extends ModelMember {

    /**
     * Возвращает путь до хранилища файлов
     */
    public abstract String getStoragePath();

    /**
     * Получить файл из хранилища по id
     */
    public abstract DbFileStorageItem getFile(long id) throws Exception;

    /**
     * Добавить файл в хранилище
     *
     * @param f                оригинал файла
     * @param originalFilename оригинальное имя файла
     * @return добавленный файл
     */
    public abstract DbFileStorageItem addFile(File f, String originalFilename) throws Exception;

    /**
     * Добавить файл в хранилище
     *
     * @param f оригинал файла
     * @return добавленный файл
     */
    public DbFileStorageItem addFile(File f) throws Exception {
        return addFile(f, null);
    }

    /**
     * Удалить файл из хранилища по id
     */
    public abstract void removeFile(long id) throws Exception;

}
