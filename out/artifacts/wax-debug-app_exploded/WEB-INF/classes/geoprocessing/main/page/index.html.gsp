<%@ page import="geoprocessing.main.utils.ExpAppService; jandcode.lang.LangService; jandcode.wax.core.utils.*; jandcode.web.*" %>
<%
  /*
    При обращении к корню абсолютному ("/") - делаем редирект на платформу
    При обращении к корню приложения ("/a/appname/modelname/lang") - открываем приложение
   */

  WaxTml th = new WaxTml(this)

  def expapp = th.app.service(ExpAppService).currentExpApp
  def curlang = th.app.service(LangService).currentLang

  if (expapp.name == "none") {
    th.request.redirect("a/platform/${curlang.name}", false, [:])
  } else {
    th.include("/js/${expapp.name}/expapp.gsp")
  }

%>

