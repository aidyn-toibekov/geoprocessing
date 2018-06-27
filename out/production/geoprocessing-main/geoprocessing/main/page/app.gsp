<%@ page import="geoprocessing.main.utils.ExpAppService; jandcode.web.*; jandcode.app.*; jandcode.wax.core.utils.*" %>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<%
  WaxTml th = new WaxTml(this)
//  def waxapp = th.app.service(WaxAppService)
  //
  def expapp = th.app.service(ExpAppService).currentExpApp
  def pageTitle = expapp.title
  if (th.model.name != "default") {
    pageTitle = th.model.name + " - " + pageTitle
  }
%>

<head>
  <title>${pageTitle}</title>

  <% th.includeRel("header.gsp") %>

  <script type="text/javascript">
      Jc.createApp('${expapp.jsclass}');
  </script>

  ${th.args.headertext}

</head>

<body>
<jc:theme type="body"/>
</body>
</html>
