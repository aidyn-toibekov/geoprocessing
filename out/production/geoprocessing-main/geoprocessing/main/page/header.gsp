<%@ page import="jandcode.lang.*; jandcode.dbm.*; jandcode.web.*; jandcode.wax.core.utils.theme.*; jandcode.wax.core.utils.*; jandcode.app.*" %>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>

<%
  WaxTml th = new WaxTml(this)

  // не кэшируем главную страницу
  th.request.noCache()

  //
  def waxapp = th.getApp().service(WaxAppService)

  // языки интерфейса
  def curlang = th.app.service(LangService).currentLang
  def langs = th.app.service(LangService).langs

  // языки модели
  def dblangs = th.model.dblangService.langs
  def curlangdb = th.model.dblangService.currentLang

%>

<jc:theme type="head"/>
<% th.includeRel("header-js.gsp") %>


<script type="text/javascript">
  //
  Jc.baseUrl = '${th.ref("/")}';
  Jc.ini.debug = ${th.getApp().isDebug()};
  Jc.ini.app.title = '${waxapp.title}';

  // языки интерфейса
  Jc.ini.lang = "${curlang.name}";
  Jc.ini.langs = [];
  <% for (z in langs) { %>
  Jc.ini.langs.push({name: "${z.name}", title: "${z.title}"});
  <% } %>

  // языки модели
  Jc.model.lang = "${curlangdb.name}";
  Jc.model.langs = [];
  <% for (z in dblangs) { %>
  Jc.model.langs.push("${z.name}");
  <% } %>

  //
  Ext.Loader.setConfig({enabled: true});
  Ext.Loader.setPath('Jc', Jc.baseUrl + 'js');
  Ext.Loader.setPath('Ext.ux', Jc.baseUrl + 'js/ext4/ux');

  //

</script>
