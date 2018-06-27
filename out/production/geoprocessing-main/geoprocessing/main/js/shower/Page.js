/**
 * Показ фрейма в закладках.
 */
Ext.define('Jc.shower.Page', {

    extend: 'Jc.shower.Base',

    /**
     * Где показываем фреймы
     */
    centerPanel: null,

    showFrame: function(fr, showConfig) {
        var th = this;

        fr.header = false;
        th.centerPanel.removeAll(true);
        th.centerPanel.add(fr);

    }

});
 