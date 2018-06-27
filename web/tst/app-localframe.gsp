<jc:page tml="app">
  <script type="text/javascript">
    Ext.define("LocalFrame1", {
      extend: "Jc.Frame",

      onInit: function() {
        var th = this;
        th.callParent();
        //
        var b = th.createBuilder();
        //
        Ext.apply(this, {
          title: "Заголовок",
          layout: b.layout("autobox")
        });
        //
        th.items = [
        ];

        //
        th.toolbar = [
          b.action({text: "Action1", icon: "tool", onExec: function() {
            //
          }})
        ];
      }

    });

    //////
    Ext.onReady(function() {
      var f = Ext.create('LocalFrame1');
      f.showFrame();
    });

  </script>
</jc:page>
