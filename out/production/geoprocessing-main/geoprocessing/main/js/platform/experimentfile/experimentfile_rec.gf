<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--

Редактор для записи

========================================================================= --}%


<jc:include url="js/frame/edit_rec.gf"/>
<gf:attr name="daoname" value="ExperimentFile/updater"/>

%{-- ========================================================================= --}%
<g:javascript>
  th.width = 500;

  th.items = [
      b.input2("name"),
      b.input2("dte"),
      b.input2("fn"),
      b.input2("description")

  ];
</g:javascript>
