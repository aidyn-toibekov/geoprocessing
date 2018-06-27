<%@ page import="jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 

Выбор типа

========================================================================= --}%

<jc:include url="js/input/frame/cb_sgrid.gf"/>

<gf:attr name="daoname" value="MaterialType/list"/>
<gf:attr name="title" value="Типы материалов"/>

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

  sgrid.on('cellclick', function() {
    var vw = Jc.getComponent(th, "view");
    vw.enable();
  });

  sgrid.on("afterrender", function() {
    var cb = th.pickerField;

    var val = cb.getValue();
    var cr = this.store.getById(val);
    if (cr) {
      this.setCurRec(cr);
    }

  });
</g:javascript>

<g:javascript id="gridColumns" method="gridColumns" params="b, res">
  res.push(
      b.column('name', {tdCls: "td-wrap", flex: 1})
  );
</g:javascript>

<g:javascript id="gridFilters" method="gridFilters" params="b, res">
  res.push(
  );
</g:javascript>

<g:javascript id="gridOrderBy" method="gridOrderBy" params="b, res">
  res.push(

  );
</g:javascript>

