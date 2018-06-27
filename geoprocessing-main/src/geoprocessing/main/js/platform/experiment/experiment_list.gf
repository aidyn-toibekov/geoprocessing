<%@ page import="jandcode.dbm.dao.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--
========================================================================= --}%
<gf:groovy>
  <%
    GfFrame gf = args.gf
    Map a = gf.attrs
    //
    SGridDataStore st = gf.createSGridStore("Experiment/list")
    st.load()

    a.store = st
  %>
</gf:groovy>

<g:javascript>
  //
  th.title = UtLang.t('Эксперименты');
  th.layout = b.layout('vbox');

  //
  th.recFrame = "js/platform/experiment/experiment_rec.gf";
  th.updaterDao = "Experiment/updater";

  //
  var sgrid = b.sgrid({
    flex: 1,
    //
    store: th.store,
    refreshRec: true,

    //
    orderBy: [
      {
        name: "dteDesc", title: UtLang.t("По дате, на на убывание")
      },
      {name: "dte", title: UtLang.t("По дате, на возрастание")},
      {
        name: "name", title: UtLang.t("По наименованию ")
      }
    ],
    //
    columns: function(b) {
      return [
        b.column("name", {tdCls: "td-wrap", flex: 1}),
        b.column("dte", {
          flex: 1
        }),
        b.column("description", {
          flex: 1, tdCls: "td-wrap"
        })
      ];
    },
    //
    actions: [
      b.actionInsFrame({frame: th.recFrame}),
      b.actionUpdFrame({
        frame: th.recFrame, disabled: true, itemId: "UPD"
      }),
      b.actionDelFrame({daoname: th.updaterDao, disabled: true, itemId: "DEL"}),
      b.actionViewFrame({frame: "js/platform/experimentfile/experimentfile_list.gf", recId:th.recId,  disabled: true, itemId: "VIEW"})
    ]
  });

  sgrid.on("select", function(gr, rec) {
    if (!rec) return;
    
    th.recId = rec.get("id");

    Jc.getComponent(th, 'UPD').enable();
    Jc.getComponent(th, 'DEL').enable();
    Jc.getComponent(th, 'VIEW').enable();
  });

  th.store.on('remove', function() {
    Jc.getComponent(th, 'UPD').disable();
    Jc.getComponent(th, 'DEL').disable();
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