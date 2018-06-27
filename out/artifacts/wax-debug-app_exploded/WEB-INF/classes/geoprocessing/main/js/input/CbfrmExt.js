Ext.define('Jc.input.CbfrmExt', {
    extend: 'Jc.input.Cbfrm',
    getShowFrameConfig: function() {
        var th = this;
        var cfg = {
            local: {
                pickerField: th  // для gf-фреймов ссылка для onInit
            }
        };
        //Добавление внешник параметров для фрейма из комбабокса
        Ext.apply(cfg, th.extParams);

        if (Ext.isString(th.frame)) {
            cfg.frame = th.frame;
        } else {
            cfg = Ext.apply(cfg,th.frame);
            var loc = cfg.local;
            if (!loc){
                loc = {};
            }
            loc = Ext.apply(loc,{
                pickerField: th
            });
            //
            cfg.local = loc;
        }
        return cfg;
    },
    reload:function(cfg){
        var nCgf = {
        };
        Ext.apply(nCgf, cfg);

        this.extParams = nCgf;
        this.picker = null;
        this.frame = this.frame;
    }
});