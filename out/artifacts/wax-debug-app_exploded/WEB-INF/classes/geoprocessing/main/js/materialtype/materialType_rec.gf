<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--

Редактор для записи

========================================================================= --}%


<jc:include url="js/frame/edit_rec.gf"/>
<gf:attr name="daoname" value="MaterialType/updater"/>

%{-- ========================================================================= --}%
<g:javascript>
  th.width = 500;

  th.items = [
      b.input2("name"),
      b.input2("muMin"),
      b.input2("muMax"),
      b.input2("epsMin"),
      b.input2("epsMax"),
      b.input2("sigma")

  ];
</g:javascript>
