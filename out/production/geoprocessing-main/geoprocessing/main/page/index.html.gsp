<%@ page import="jandcode.lang.LangService; jandcode.wax.core.utils.*; jandcode.web.*" %>
<%
  /*
    При обращении к корню абсолютному ("/") - делаем редирект на платформу
    При обращении к корню приложения ("/a/appname/modelname/lang") - открываем приложение
   */

  WaxTml th = new WaxTml(this)

  th.app.service(LangService).setCurrentLang(th.app.service(LangService).getDefaultLang().name)


  th.include("/js/app.gsp")

%>
