/**
 * Диалоговое окно с мастером.
 */
Ext.define('Jc.shower.Dialogmaster', {
    extend: 'Jc.shower.Dialog',

    createButtons: function(cfg) {
        return [
            this.createButtonBack(cfg),
            this.createButtonForward(cfg),
            this.createButtonCancel(cfg)
        ];
    },

    createButtonBack: function(cfg) {
        return {
            iconCls: 'icon-master-back',
            itemId: 'button-master-back',
            text: UtLang.t("Назад")
        };
    },

    createButtonForward: function(cfg) {
        return {
            func_onOk: cfg.onOk,
            iconCls: 'icon-master-forward',
            itemId: 'button-master-forward',
            text: UtLang.t("Вперед")
        };
    }

});
 