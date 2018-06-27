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
  th.width = 260;
  th.shower = "dialogclose";
  th.title = UtLang.t("О программе...");
  th.layout = b.layout('vbox');
  //
      this.items = [
        b.pageheader("АРМ \"Экспедитор\"", Jc.url("page/factor.png")),
        b.databox({
          items: [
            b.datalabel("(c) КСИ \"Фактор\",  Астана - 2014".bold())
          ]
        })
      ];


</g:javascript>
