<%@ page import="jandcode.wax.core.utils.*" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<%
  WaxTml th = new WaxTml(this)
%>
<head>
  <title>${th.args.title}</title>

  <% th.includeRel("header.gsp") %>

  ${th.args.headertext}

</head>

<body>
${th.args.bodytext}
</body>
</html>
