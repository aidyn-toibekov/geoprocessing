<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--

Редактор для записи

========================================================================= --}%


<jc:include url="js/frame/edit_rec.gf"/>
<gf:attr name="daoname" value="Obj/updater"/>

%{-- ========================================================================= --}%
<g:javascript>
  th.width = 500;

  th.items = [
      b.input2("name"),
      b.input2("length"),
      b.input2("width"),
      b.input2("height"),
      b.input2("lon"),
      b.input2("lat"),
      b.input2("materialType",{jsclass:"Cb_MaterialType"})

  ];
</g:javascript>
