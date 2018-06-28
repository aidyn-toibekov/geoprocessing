<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--

========================================================================= --}%

<gf:attr name="recId" type="long" ext="true"/>
%{-- ========================================================================= --}%

<gf:groovy>
  <%
    // получаем ссылку на фрейм
    GfFrame gf = args.gf
    // получаем ссылку на атрибуты
    def a = gf.attrs

    SGridDataStore st = gf.createSGridStore("ExperimentFile/updater")
    st.setDaoMethodLoad("getChartLayers")
    st.load(fileId: a.recId)
    a.store = st

  %>
</gf:groovy>

<g:javascript>
  th.width = 500;
  th.title = "Просмотр данных файла";
  th.layout = b.layout('vbox');

  //
  var sgrid = b.sgrid({
    flex: 1,
    title:"Данные по срезам",
    region: "center",
    //
    store: th.store,
    refreshRec: true,
    //
    columns: function(b) {
      return [
        b.column("layer", { flex: 1})
      ];
    }
  });

  //
  sgrid.on("select", function(gr, rec) {
    if (!rec) return;

    th.reloadChart(rec.get("layer"))
    th.pan.expand();
  });

  //
  th.chart = Ext.create('Jc.control.Fusion', {
    title: UtLang.t("График"),
    border: true,
    chartType: 'msline'
  });

  //
  th.pan = b.panel({
    title: "График",
    flex: 5,
    region: "east",
    items:[th.chart]
  })

  //
  sgrid.on('afterrender', function() {
    var rec = sgrid.store.getAt(0);
    if (rec) {
      sgrid.setCurRec(rec);
    }
  });


  //
  th.items = [
    b.frameheader({
      icon: "log"
    }),
    b.panel({
      layout: b.layout("border"),
      flex: 1,
      items: [
        sgrid,
        th.pan
      ]
    })
  ];


</g:javascript>




<g:javascript method="reloadChart" params="id">
  var param = {};

  param.layer = id;
  param.fileId= th.recId;

  var diagram = Jc.daoinvoke("ExperimentFile/updater", "getChartData",[param]);

  //
  var chart = Ext.create('Jc.control.Fusion', {
    //title: UtLang.t("График"),
    border: true,
    chartType: 'msspline'
  });

  chart.on("chartready", function (p, ch) {
    ch.setJSONData(diagram);
  });

  th.pan.removeAll(true)
  th.pan.add(chart);


</g:javascript>
