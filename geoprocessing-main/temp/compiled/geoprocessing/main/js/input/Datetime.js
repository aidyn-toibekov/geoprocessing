Ext.define('Jc.input.Datetime', {
    extend: 'Jc.control.Box',
    value: null,
    date:null,
    time:null,
    separator:":",
    initComponent: function() {
        var th = this;
        var d = Ext.create("Jc.input.Date",{colspan: 1});
        var t = Ext.create("Jc.input.Time",{colspan: 1});
        var l = Ext.create("Jc.control.Label",{text:th.separator});

        th.layout = {
            type: 'table',
            columns: 3
        },
        th.items = [d,l,t]

        th.date = d;
        th.time= t;

        this.callParent();
    },
    setValue: function(v) {
        if (v && Ext.isDate(v)) {
        }

        if (!v) {
            v = Jc.DBEG_EMPTY
        }

        var h = Ext.Date.format(v, 'H')
        var m = Ext.Date.format(v, 'i')

        this.date.setValue(v)
        this.time.setValue(v)

        this.value = v;
    },
    getValue: function() {

        var d = this.date.getValue()

        if (!d) {
            d = Jc.DBEG_EMPTY
        }
            var t = this.time.getValue()
            //
            var h = Ext.Date.format(t, 'H')
            var m = Ext.Date.format(t, 'i')
            d.setHours(h)
            d.setMinutes(m)

        this.value = d;

        return d;
    },

    dataToControl: function() {
        if (!this.dataIndex) return;
        //
        var v = Jc.dbm.DataBinder.getFieldValue(this, this.dataIndex);

        this.setValue(v);
    },

    controlToData: function() {
        var v = this.getValue();
        Jc.dbm.DataBinder.setFieldValue(this, this.dataIndex, v);
    }

});