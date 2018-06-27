<%@ page import="jandcode.dbm.dao.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--
========================================================================= --}%

<gf:attr name="recId" type="long" ext="true"/>

<gf:groovy>
  <%
    GfFrame gf = args.gf
    Map a = gf.attrs
    //
    SGridDataStore st = gf.createSGridStore("ExperimentFile/list")
    st.load(experiment: a.recId)

    a.store = st
  %>
</gf:groovy>

<g:javascript>
  //
  th.title = UtLang.t('Файлы эксперимента');
  th.layout = b.layout('vbox');

  //
  th.recFrame = "js/platform/experimentfile/experimentfile_rec.gf";
  th.updaterDao = "ExperimentFile/updater";

  //
  var sgrid = b.sgrid({
    flex: 1,
    //
    store: th.store,
    refreshRec: true,
    //
    columns: function(b) {
      return [
        b.column("name", {
          tdCls: "td-wrap", flex: 1
        }),
        b.column("dte", {flex: 1}),
        b.column("processed", {flex: 0.5}),
        b.column("cnt", {flex: 0.5}),
        b.column("description", {
          flex: 1, tdCls: "td-wrap"
        })
      ];
    },
    //
    actions: [
      b.actionInsFrame({frame: th.recFrame, onBeforeShow: function(a) {
          a.recData['experiment'] = th.recId;
        }}),
      b.actionRec({
        icon: "operation",
        text: UtLang.t("Обработать"),
        itemId: "PROCESSFILE",
        disabled: true,
        onExec: function(a) {
          var ff = function() {
            sgrid.reload();
            Jc.getComponent(th, 'PROCESSFILE').disable();
            Jc.getComponent(th, 'VIEW').enable();
          }

          Jc.daoinvokeBg("ExperimentFile/updater", "processFile", [a.recId], ff);
        }
      }),
      b.actionDelFrame({daoname: th.updaterDao, disabled: true, itemId: "DEL"}),
      b.actionViewFrame({
        frame: "js/platform/experimentfile/experimentfile_view.gf",
        recId : th.fileId,
        disabled: true,
        itemId: "VIEW"})
    ]
  });

  sgrid.on("select", function(gr, rec) {
    if (!rec) return;

    th.fileId = rec.get('id')

    Jc.getComponent(th, 'VIEW').disable();
    Jc.getComponent(th, 'PROCESSFILE').disable();
    if (rec.get("processed")) {
      Jc.getComponent(th, 'VIEW').enable();
    } else {
      Jc.getComponent(th, 'PROCESSFILE').enable();
    }

    Jc.getComponent(th, 'DEL').enable();
  });

  th.store.on('remove', function() {
    Jc.getComponent(th, 'DEL').disable();
    Jc.getComponent(th, 'PROCESSFILE').disable();
    Jc.getComponent(th, 'VIEW').disable();
  });

  //
  th.items = [
    b.frameheader({
      icon: "storage"
    }),
    sgrid
  ];
</g:javascript>