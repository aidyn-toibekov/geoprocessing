<%@ page import="geoprocessing.utils.dbinfo.DbInfoService; geoprocessing.main.utils.ExpAppService; jandcode.auth.AuthService; jandcode.utils.*; jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 

Home page

========================================================================= --}%

<gf:groovy>
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
  %>
</gf:groovy>

%{-- ========================================================================= --}%
<g:javascript>
  //
  th.title =UtLang.t('Главная');
  th.layout = b.layout('vbox');
  //
  var httml = "<div align=\"center\"><h2>РАЗРАБОТКА И ПРОГРАММНАЯ РЕАЛИЗАЦИЯ АЛГОРИТМОВ ДЛЯ ОБРАБОТКИ ГЕОДАННЫХ</h2> </div>";
  httml += "<div align=\"center\"><h4>Пройдите пожалуйста по вкладкам для просмотра экспериментов или данных по материалам</h4> </div>";



  //
  var httml2 = "<div align=\"center\"><h2>Добро пожаловать!</h2> </div>";
  th.items = [
    b.panel({
      border: false,
      region: "center",
      html: httml
    })
  ];



</g:javascript>
