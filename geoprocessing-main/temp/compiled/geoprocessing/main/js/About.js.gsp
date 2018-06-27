<%@ page import="jandcode.dbm.*; jandcode.utils.*" %>
<%
  def version = new VersionInfo("geoprocessing").version
  def version_jandcode = new VersionInfo("jandcode.wax.core").version
%>
<script type="text/javascript">
  Ext.define('Jc.About', {
    extend: 'Jc.Frame',

    onInit: function() {
      this.callParent(arguments);
      //
      var th = this;

      var b = th.createBuilder();

      Ext.apply(this, {
        title: 'О программе',
        shower: 'dialogclose'
      });

      this.items = [
        b.pageheader(Jc.ini.app.title, Jc.url("page/logo-small.png")),
        b.databox({
          items: [
            b.label("Версия приложения"), b.datalabel('${version}'),
            b.label("Версия платформы"), b.datalabel('${version_jandcode}')
          ]
        })
      ];
    }

  });
</script>
