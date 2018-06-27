package geoprocessing.main.utils;

import jandcode.utils.*;
import jandcode.web.*;

import java.io.*;

/**
 * download файла из хранилища.
 */
public class RenderBin_FileWrapper implements IWebRenderStream {

    public void saveTo(Object data, OutputStream stm, WebRequest request) throws Exception {
        FileWrapper w = (FileWrapper) data;
        File f = w.getFile();
        //
        String fn = w.getOriginalFileName();
        if (UtString.empty(fn))
            fn = f.getName();
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
