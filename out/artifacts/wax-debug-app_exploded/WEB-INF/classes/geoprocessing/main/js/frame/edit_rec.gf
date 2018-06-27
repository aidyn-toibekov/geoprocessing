<%@ page import="jandcode.utils.UtLang; jandcode.dbm.data.DataRecord; jandcode.wax.core.utils.gf.*" %>
%{--
    Редактирование одной записи по id
--}%

%{-- id записи. Если =0, то новая запись --}%
<gf:attr name="recId" type="long" ext="true"/>

%{--данные записи по умолчанию. Накладываются на загруженную или новую запись--}%
<gf:attr name="recData" type="map" ext="true"/>

%{--имя dao для чтения/записи--}%
<gf:attr name="daoname" type="string" value="NONE"/>

%{--метод для записи. По умолчанию равен режиму mode (ins/upd)--}%
<gf:attr name="daomethod" type="string"/>

<gf:groovy>
  <%
    // получаем ссылку на фрейм
    GfFrame gf = args.gf
    // получаем ссылку на атрибуты
    def a = gf.attrs

    // определяем режим
    a.mode = "ins"
    if (a.recId != 0) {
      a.mode = "upd"
    }

    // определяем метод записи
    if (a.daomethod == "") {
      a.daomethod = a.mode
    }

    // title
    if (a.mode == "ins") {
      a.title = UtLang.t("Новая запись")
    } else {
      a.title = UtLang.t("Редактирование записи")
    }

    // грузим запись
    DataRecord rec
    if (a.mode == "ins") {
      rec = gf.daoinvoke(a.daoname, "newRec")
    } else {
      rec = gf.daoinvoke(a.daoname, "loadRec", a.recId)
    }
    a.store = rec

    // данные по умолчанию с клиента
    Map recData = a.recData
    if (recData.size() > 0) {
      rec.setValues(recData)
      gf.resolveDicts(rec)
    }

  %>
</gf:groovy>

<g:javascript>
  th.layout = b.layout('table', {columns: 2});
  th.shower = "dialog";
</g:javascript>

<g:javascript id="onOk" method="onOk">
  th.controlToData();
  if (th.mode == "ins") {
    return th.onIns();
  } else {
    return th.onUpd();
  }
</g:javascript>

<g:javascript id="onIns" method="onIns">

  th.recId = Jc.daoinvoke(th.daoname, th.daomethod, [th.store]);
  th.store.set("id", th.recId);
</g:javascript>

<g:javascript id="onUpd" method="onUpd">
  Jc.daoinvoke(th.daoname, th.daomethod, [th.store]);
</g:javascript>
