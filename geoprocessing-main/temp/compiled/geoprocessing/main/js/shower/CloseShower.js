/**
 * Диалоговое окно без кнопок.
 */
Ext.define('Jc.shower.CloseShower', {
    extend: 'Jc.shower.Dialog',

    /**
     * При true - окно будет maximized. showConfig может перекрыть это значение
     */
    maximized: false,

    showFrame: function(fr, showConfig) {
        var th = this;

        fr.header = false;
        //fr.autoScroll = false;

        var wincfg = {
            header: false,
            items: [fr],
            listeners: {
                show: function() {
                    fr.fireEvent("activate");
                }
            }
        };
        if (fr.showConfig.maximized === undefined) {
            fr.showConfig.maximized = th.maximized;
        }
        if (fr.showConfig.maximized) {
            wincfg.maximizable = true;
            wincfg.maximized = true;
        }
        var layType = th.getFrameLayoutType(fr);
        if (layType == "fit") {
            // фрейм желает заполнить все что можно. Начальный размер определяется фреймом
            //wincfg.autoScroll = false;
            wincfg.layout = {type: "fit"};
        }
        //wincfg.autoScroll = false;
        wincfg.layout = {type: "fit"};
        //
        if (!wincfg.title) {
            wincfg.title = '';
        }
        //
        if (fr.toolbar) {
            wincfg.tbar = Ext.create("Ext.toolbar.Toolbar", {
                items: fr.toolbar,
                itemId: 'frame-toolbar'
            });
            fr.toolbar = null;
        }
        //
        fr.on("titlechange", function(fr, tit) {
            win.setTitle(tit);
        });
        //
        fr.on("toolbarchange", function(fr) {
            th.createFrameToolbar(win, fr);
        });
        //
        fr.on('afterloadframe', function(fr, firstLoad) {
            th.onAfterLoadFrame(fr, firstLoad);
        });
        //
        fr.on('errorloadframe', function(fr, firstLoad) {
            if (firstLoad) {
                fr.close();
            }
        });
        //
        th.onWinCfg(wincfg, fr, showConfig);
        var win = Ext.create('Ext.window.Window', wincfg);
        win.show();
        if (!(fr instanceof Jc.frame.Gsp)) {
            if (!fr.showConfig.maximized) {
                Jc.fixWindowSize(win);
                win.center();
            }
        }
    },

    createButtons: function(cfg) {
        return [this.createButtonClose(cfg)];
    },

    createButtonClose: function(cfg) {
        var text = UtLang.t('Закрыть');
        if (cfg.cancel && cfg.cancel.text) text = cfg.cancel.text;
        return {
            iconCls: 'icon-cancel',
            text: text,
            handler: function() {
                var win = this.up("window");
                var fr = win.items.get(0);
                fr.doClose("cancel", cfg.onOk);
            }
        };
    }

});
 