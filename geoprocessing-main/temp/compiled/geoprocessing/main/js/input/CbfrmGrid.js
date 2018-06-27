Ext.define('Jc.input.CbfrmGrid', {
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
        }
        return cfg;
    },
    reload:function(cfg){
        var nCgf = {
        };
        Ext.apply(nCgf, cfg);

        this.extParams = {daoparams:nCgf};
        this.picker = null;
        this.frame = this.frame;
    }
});