Ext.define('Jc.input.Hour', {
    extend: 'Jc.input.Spinner',
    step:1,
    minVal:0,
    maxVal:24,
    width:40,
    onSpinUp: function() {
        var me = this;
        if (!me.readOnly) {
            var val = parseInt(me.getValue())||0;
            if (val >= me.maxVal-1) {
                me.setValue(me.maxVal-1);
            } else {
                me.setValue(val + me.step);
            }
        }
    },
    setValue: function(v) {

        if (!Ext.isEmpty(v)){

            if (Ext.String.startsWith(v,'0') && ( v != '0') ){
                v = v[1];
            }

        }else{
            v = null;
        }

        return this.callParent([v]);
    }
});