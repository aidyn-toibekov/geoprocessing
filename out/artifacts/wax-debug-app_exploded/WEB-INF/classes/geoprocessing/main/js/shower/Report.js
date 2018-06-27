/**
 * Диалоговое окно с мастером.
 */
Ext.define('Jc.shower.Report', {
    extend: 'Jc.shower.Dialog',

    onWinCfg: function(wincfg, fr, showConfig){
        this.callParent(arguments);
        this.fr = fr;
    },

    onReport: Ext.emptyFn,

    createButtons: function(cfg) {
        return [
            this.createButtonReport(cfg),
            this.createButtonClose(cfg)
        ];
    },

    createButtonReport: function(cfg) {
        var th = this;
        return {
            iconCls: 'icon-report',
            itemId: 'button-report',
            text: UtLang.t("Сформировать"),
            handler: function() {
                th.fr.ctrl.onReport();
            }
        };
    }

});
 