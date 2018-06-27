<jc:page tml="unittest">
  <script type="text/javascript">
    Ext.onReady(function() {

      new Test.Unit.Runner({
        //////////////////////////////////////////////////////////////////////

        setup: function() {
        },

        teardown: function() {
        },

        test1: function() {
          this.assertEqual(10, 10);
        }

        //////////////////////////////////////////////////////////////////////
      }).runTests();

    });
  </script>
</jc:page>
