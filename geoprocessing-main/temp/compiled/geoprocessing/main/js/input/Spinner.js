Ext.define('Jc.input.Spinner', {
    extend: 'Ext.form.field.Spinner',
    step:1,
    minVal:0,
    maxVal:24,
    onSpinUp: function() {
        var me = this;
        if (!me.readOnly) {
            var val = parseInt(me.getValue())||0;
            if (val >= me.maxVal) {
                me.setValue(me.maxVal);
            } else {
                me.setValue(val + me.step);
            }
        }
    },

    onSpinDown: function() {
        var me = this;
        if (!me.readOnly) {
            var val = parseInt(me.getValue())||0;
            if (val <= me.minVal) {
                me.setValue(0);
            } else {
                me.setValue(val - me.step);
            }
        }
    }
});