<%@ page import="jandcode.web.*; jandcode.wax.core.utils.theme.*; jandcode.app.*; jandcode.wax.core.utils.*" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<%
  WaxTml th = new WaxTml(this)
  def waxapp = th.app.service(WaxAppService)
%>
<head>
  <title>${"Алгоритмы обработки геоданных"}</title>

  <% th.includeRel("header.gsp") %>

  <script type="text/javascript">
    Jc.createApp('Jc.App');
  </script>

  ${th.args.headertext}

</head>

<body>
<jc:theme type="body"/>
</body>
</html>
