<%@ page import="geoprocessing.main.utils.MenuXml; jandcode.web.UtJson; jandcode.utils.UtCnv; jandcode.auth.AuthService; jandcode.wax.core.utils.gf.*;" %>
%{--

tools menu - базовый фрейм для организации меню инструментов

========================================================================= --}%

<!-- vfs-путь до файла с описанием меню, например таким:
        res:xtofi/main/js/webmod/menu.xml
     Этот файл можно рассматривать как пример меню
-->
<gf:attr name="menuXml" type="string" value="NONE" local="true"/>
<gf:attr name="menuItems" type="list"/>

<gf:attr name="menuXml2" type="string" value="NONE"/>
<gf:attr name="menuItems2" type="list"/>

<gf:groovy name="init">
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
    //

    MenuXml.ui = gf.app.service(AuthService.class).currentUser
    a.menuItems = MenuXml.toJson(a.menuXml);

    if (a.menuXml2 != "NONE")
      a.menuItems2 = MenuXml.toJson(a.menuXml2);

    a.menuItems = UtJson.toString(a.menuItems);
  %>
</gf:groovy>


<g:javascript>
  //
  th.title = UtLang.t('Меню');
  th.layout = 'fit';
  th.shower = 'tools';
  th.nopadding = true;

  th.toolbar = Jc.eval(th.menuItems);

</g:javascript>
