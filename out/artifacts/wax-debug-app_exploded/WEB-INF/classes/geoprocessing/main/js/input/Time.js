Ext.define('Jc.input.Time', {
    extend: 'Jc.control.Box',
    value: null,
    hour:null,
    minute:null,
    separator:":",
    initComponent: function() {
        var th = this;
        var h = Ext.create("Jc.input.Hour",{colspan: 1, time:th});
        var m = Ext.create("Jc.input.Minute",{colspan: 1, time:th});
        var l = Ext.create("Jc.control.Label",{text:th.separator});

        th.layout = {
            type: 'table',
            columns: 3
        },
        th.items = [h,l,m]

        th.hour = h;
        th.minute = m;

        this.callParent();
    },
    setValue: function(v) {
        if (v && Ext.isDate(v)) {
            /*if (Jc.isDateEmpty(v)) {
                v = null;
            }*/
        }

        if (!v) {
            v = new Date('1970-01-01')
        }

        var h = Ext.Date.format(v, 'H')
        var m = Ext.Date.format(v, 'i')

        this.hour.setValue(h)
        this.minute.setValue(m)

        this.value = v;
        //return this.callParent([v]);
    },
    getValue: function() {

        var d = this.value;
        var h = this.hour.getValue()
        var m = this.minute.getValue()
        d.setHours(h)
        d.setMinutes(m)

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