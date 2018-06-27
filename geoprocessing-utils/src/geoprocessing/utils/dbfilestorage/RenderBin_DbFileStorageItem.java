package geoprocessing.utils.dbfilestorage;

import jandcode.utils.UtFile;
import jandcode.web.IWebRenderStream;
import jandcode.web.WebRequest;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;

/**
 * download файла из хранилища.
 */
public class RenderBin_DbFileStorageItem implements IWebRenderStream {

    public void saveTo(Object data, OutputStream stm, WebRequest request) throws Exception {
        DbFileStorageItem it = (DbFileStorageItem) data;
        File f = it.getFile();
        //
        String fn = it.getOriginalFilename();
        request.setHeaderDownload(fn);
        //
        FileInputStream ins = new FileInputStream(f);
        try {
            UtFile.copyStream(ins, stm);
        } finally {
            ins.close();
        }
    }

}
