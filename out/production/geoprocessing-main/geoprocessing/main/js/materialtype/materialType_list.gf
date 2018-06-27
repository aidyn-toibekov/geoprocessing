<%@ page import="jandcode.dbm.dao.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{--

Список пользователей

========================================================================= --}%
<gf:groovy>
  <%
    GfFrame gf = args.gf
    Map a = gf.attrs
    //
    SGridDataStore st = gf.createSGridStore("MaterialType/list")
    st.load()

    a.store = st
  %>
</gf:groovy>

<g:javascript>
  //
  th.title = UtLang.t('Типы материалов');
  th.layout = b.layout('vbox');

  //
  th.recFrame = "js/materialtype/materialType_rec.gf";
  th.updaterDao = "MaterialType/updater";

  //
  var sgrid = b.sgrid({
    flex: 1,
    //
    store: th.store,
    refreshRec: true,
    //
    columns: function(b) {
      return [
        b.column("name", {tdCls: "td-wrap", flex: 1}),
        b.column("muMin", {flex: 1}),
        b.column("muMax", {flex: 1}),
        b.column("epsMin", {flex: 1}),
        b.column("epsMax", {flex: 1}),
        b.column("sigma", {flex: 1})
      ];
    },
    //
    actions: [
      b.actionInsFrame({frame: th.recFrame}),
      b.actionUpdFrame({
        frame: th.recFrame, disabled: true, itemId: "UPD"
      }),
      b.actionDelFrame({daoname: th.updaterDao, disabled: true, itemId: "DEL"})
    ]
  });

  sgrid.on("select", function(gr, rec) {
    if (!rec) return;

    Jc.getComponent(th, 'UPD').enable();
    Jc.getComponent(th, 'DEL').enable();
  });

  th.store.on('remove', function() {
    Jc.getComponent(th, 'UPD').disable();
    Jc.getComponent(th, 'DEL').disable();
  });

  //
  th.items = [
    b.frameheader({
      icon: "layers"
    }),
    sgrid
  ];
</g:javascript>