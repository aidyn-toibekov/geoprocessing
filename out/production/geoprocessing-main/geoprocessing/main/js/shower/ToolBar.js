/**
 * Показ фрейма в закладках.
 */
Ext.define('Jc.shower.ToolBar', {

    extend: 'Jc.shower.Base',

    /**
     * Где показываем фреймы
     */
    panel: null,

    /**
     * true - скрываться при удалении последней вкладки
     */
    autoHide: false,

    onInit: function() {
        var th = this;
        //
        if (this.autoHide) {
            this.panel.on("remove", function() {
                th.panel.hide();
            });
        }
    },

    showFrame: function(fr, showConfig) {
        var th = this;

        if (th.panel.isHidden()) {
            th.panel.show();
        }

        var items = this.getFrameToolbarItems(fr);
        if (items.length > 0){
            this.panel.removeAll();
            this.panel.add(items);
            this.panel.show();
        }else{
            this.panel.hide();
        }
    },

    getFrameToolbarItems: function(fr) {
        var items = [];
        var itemsActs = [];
        if (fr.toolbar){
            for (var i=0;i<fr.toolbar.length;i++){
                items.push(fr.toolbar[i]);
            }
        }
        itemsActs = this.createActions(items);
        return itemsActs;
    },

    createActions: function(items) {
        var acts = [];
        var len = items.length;
        for(var i = 0; i < len; i++){
            var itm = items[i];
            var act = this.createAction(itm);
            acts.push(act);
        }
        //
        return acts;
    },

    createAction: function(itm) {
        var chld = itm.children;
        var act;
        var cfg = {
            text: UtLang.t(itm.text),
            iconCls: itm.iconCls,
            showFrame:itm.showFrame,
            onExec:function(act){
                var showFrameCfg = act.showFrame;
                if (showFrameCfg){
                    Jc.showFrame(showFrameCfg)
                }
            }
        }
        if ( chld ){
            var childActs = this.createActions(chld);
            cfg.items = childActs
            if (itm.submenu) {
                act = Jc.menu({
                    text: UtLang.t(itm.text),
                    iconCls: itm.iconCls,
                    items: childActs
                })
            }else
                act = Jc.menu(cfg)

        }else{
            var delim = itm.delim;
            if ( delim ){
                act = delim
            }else{
                act = Jc.action(cfg)
            }
        }
        //
        return act;
    },

    closeOtherFrame: function(fr) {
        this.closeAllFrame()
    },

    closeAllFrame: function() {
        this.closeFrame();
    },

    closeFrame: function(fr) {
        this.panel.removeAll();
    },

    closeActiveFrame: function() {
        this.closeFrame(fr);
    },

    activateFrame: function(id) {
        var f = Ext.getCmp(id);
        if (f && f.ownerCt == this.panel) {
            if (this.panel.isHidden()) {
                this.panel.show();
            }
            return f;
        }
        return null;
    },

    closeFrameById: function(id) {
        var f = Ext.getCmp(id);
        if (f && f.ownerCt == this.panel) {
            this.closeFrame(f);
            return true;
        }
        return false;
    }


});
 