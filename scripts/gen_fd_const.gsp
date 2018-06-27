<%@ page import="jandcode.utils.rt.Rt; jandcode.utils.UtString; jandcode.dbm.*" %>
<%

  // генератор файла FD_Const

  Model m = model
%>
package geoprocessing.main.model.sys;

// НЕ ИЗМЕНЯЙТЕ ЭТОТ ФАЙЛ, ОН - СГЕНЕРИРОВАН!!!

/**
 * Константы из таблиц FD_xxx.
 */
public class FD_Const {
<%
  for (d in m.domainsDb) {
    String pfx = UtString.removePrefix(d.name, "FD_")
    if (pfx == null) continue
    //
    Rt dd = d.getRt().findChild("dictdata")
    if (dd == null) {
      log "NO dictdata for ${d.name}"
      continue
    }

    // значения
    for (x in dd.getChilds()) {
      // значение
      def id = x.getValueString("id")
      if (!id) {
        log "NO id for ${d.name}"
        continue
      }
      // суффикс константы
      def sfx = id
      def cnst = x.getValueString("const")
      if (cnst) sfx = cnst
%>


/**
 * ${d.title}: ${x.getValue("name_ru")}
*/
public static final long ${pfx}_${sfx} = ${id};  // СГЕНЕРИРОВАНО, НЕ ИЗМЕНЯТЬ
<%
    }
  }
%>
}
