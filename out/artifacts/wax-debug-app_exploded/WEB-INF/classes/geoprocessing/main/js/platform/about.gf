<%@ page import="jandcode.utils.*; exp.utils.dbinfo.*; exp.main.utils.*; jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 


========================================================================= --}%

<gf:groovy>
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
    //
  %>
</gf:groovy>

%{-- ========================================================================= --}%
<g:javascript>
  //
  th.width = 360;
  th.shower = "dialogclose";
  th.title = UtLang.t("О программе...");
  th.layout = b.layout('vbox');

  //
  var httml2 = "<div align=\"center\"><h2>Автор приложения</h2> </div> " +
  "<div align=\"center\"><h5>Выпускник ЕНУ им. Л.Н. Гумилева</h5> </div>" +
  "<div align=\"center\"><h5>по специальности 6M70400 \"Вычислительная техника</h5> </div>" +
  "<div align=\"center\"><h5> и програмное обеспечение\"</h5> </div>" +
  "<div align=\"center\"><h4>Есебаева Б.Е.</h4> </div>" +
  "<div align=\"center\"><h5>Республика Казахстан, Астана "
  httml2 += new Date().getFullYear()
  httml2 += "г. &copy;</h5> </div>"


  //
  this.items = [
    b.pageheader("Алгоритмы обработки геоданных", Jc.url("page/geodata.png")),

    b.panel({
      nopadding : true,
      border: false,
      html: httml2
    })
  ];


</g:javascript>
