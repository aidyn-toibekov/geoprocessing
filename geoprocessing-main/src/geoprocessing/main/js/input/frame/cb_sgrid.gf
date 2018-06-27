<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 

Фрейм предок для выбора из гриды

В потомке обычно перекрываем:

<g:javascript id="gridFilters">
</g:javascript>

<g:javascript id="gridColumns">
</g:javascript>

<g:javascript id="gridOrderBy">
</g:javascript>

========================================================================= --}%

<gf:attr name="daoname" type="string" value="NONE"/>
<gf:attr name="title" type="string" value=""/>

<gf:groovy id="loadData" method="loadData">
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
    //
    SGridDataStore st = gf.createSGridStore(a.daoname)
    st.load()

    a.store = st
  %>
</gf:groovy>

%{-- ========================================================================= --}%
<g:javascript>
  //
  th.layout = b.layout('fit');
  th.nopadding = true;
  th.width = 800;
  th.resizable = true;
  //
  var sgridCfg = {
    //
    store: th.store,
    paginate: true,
    border: false,
    //
    columns: function(b) {
      var res = [];
      th.gridColumns(b, res);
      return res;
    },
    //
    actions: function(b) {
      var res = [];
      th.gridActions(b, res);
      th.gridFilters(b, res);
      return res;
    }
  };

  //
  var orderByCfg = [];
  th.gridOrderBy(b, orderByCfg);
  if (orderByCfg.length > 0) {
    sgridCfg.orderBy = orderByCfg;
  }
  th.gridConfig(b, sgridCfg);
  var sgrid = b.sgrid(sgridCfg);

  //
  th.items = [
    sgrid
  ];

  // enter на toolbar = find
  var tb = Jc.getComponent(sgrid, "mainToolbar");
  tb.on("render", function() {
    var m = new Ext.util.KeyMap(tb.el, {
      key: Ext.EventObject.ENTER,
      fn: function() {
        Jc.execAction(sgrid, "find");
      },
      scope: th
    });
  });

  //
  th.onSetChoiceValue = function(v, t) {
    var a = Jc.getComponent(th, "defaultInpFilter");
    if (a && t) {
      a.setValue(t);
      a.focus(false, 100);
    }
  };

  sgrid.on('cellclick', function(){
    var vw = Jc.getComponent(th, "view");
    vw.enable();
  });

  sgrid.on("afterrender", function() {
    var cb = th.pickerField;

    var val = cb.getValue();
    var cr = this.store.getById(val);
    if (cr){
      this.setCurRec(cr);
    }

  });
</g:javascript>

%{-- =========================================================================

  Конфигурация колонок

--}%
<g:javascript id="gridColumns" method="gridColumns" params="b, res">
  res.push(
      b.column('cod'),
      b.column('name', {tdCls: "td-wrap", flex: 1}),
      b.column('fullName', {tdCls: "td-wrap", flex: 1})
  );
</g:javascript>

%{-- =========================================================================

  Конфигурация actions

--}%
<g:javascript method="gridActions" params="b, res">
  res.push(
      b.actionRec({text: 'Выбрать', icon: 'ok', itemId: 'view', disabled: true, onExec: function(a) {
        th.choice(a.recId);
      }}),
      '->'


  );
</g:javascript>

%{-- =========================================================================

Дополнительная конфигурация grid
для получения параметров из комбобокса для передачи фрейму

--}%

<g:javascript id="gridConfig" method="gridConfig" params="b, cfg">
  var th = this;
  var filterParams = {};

  if (th.pickerField){
    filterParams = th.pickerField.filterParams;
  }
  var config = Ext.apply(cfg.store.daoparams[0], filterParams);

  th.gridConfigExt(b, config);
</g:javascript>

%{-- =========================================================================

Дополнительная конфигурация grid

--}%
<g:javascript method="gridConfigExt" params="b, cfg"/>


%{-- =========================================================================

  Конфигурация фильтров

--}%
<g:javascript id="gridFilters" method="gridFilters" params="b, res">
  res.push(
      b.label('Код'),
      b.input("cod", {width: 'small', itemId: 'defaultInpFilter'}),
      b.label('Наименование'),
      b.input("name", {jsclass: "String", width: 'small'}),
      b.actionGrid({text: 'Фильтр', icon: 'find', itemId: 'find', onExec: function(a) {
        a.grid.controlToData();
        a.grid.reload();
      }}),
      b.actionGrid({text: 'Сброс', icon: 'clear', itemId: 'clear', onExec: function(a) {
        a.grid.clearFilter();
      }})
  );
</g:javascript>

%{-- =========================================================================

  Конфигурация сортировки

--}%
<g:javascript id="gridOrderBy" method="gridOrderBy" params="b, res">
  res.push(
//      {name: "id", title: "По ID"},
      {name: "cod", title: "По коду"},
      {name: "name", title: "По краткому наименованию"},
      {name: "fullName", title: "По полному наименованию"}
  );
</g:javascript>