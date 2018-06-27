/**
 * Тема ide. Вариант 2.
 * Табы сверху, фреймы сами формируют свои заголовки.
 */
Ext.define('Jc.theme.Ide3', {
    extend: 'Jc.theme.Base',

    requires: [
        'Jc.shower.TabPanel'
    ],

    toolsRegion: 'north',
    toolsWidth: 275,

    createToolbar: function() {
        return Jc.app.createMainMenu();
    },

    onInit: function() {
        this.callParent();
        var th = this;

        //
        th.topPanel = Ext.createWidget("toolbar", {
            id: "jc-app-top",
            region: 'north',
            items: this.createToolbar()
        });

        //
        th.centerPanel = Ext.createWidget("tabpanel", {
            id: "jc-app-center",
            cls: "jc-app-tabpanel",
            plain: true,
            tabPosition: 'top',
            region: "center",
            tabBar: {
                cls: 'jc-app-tabbar'
            }
        });

        //
        th.toolsPanel = Ext.createWidget("toolbar", {
            id: "jc-app-top2",
            region: this.toolsRegion,
            plain: true,
            hidden: true
        });

        // showers
        th.setShower("main", Ext.create('Jc.shower.TabPanel', {
            tabPanel: th.centerPanel,
            titleOnToolbar: false,
            showToolbar: true,
            autoHideToolbar: true,
            closeButtonOnToolbar: false
        }));

        th.setShower("tools", Ext.create('Jc.shower.ToolBar', {
            panel: th.toolsPanel,
            autoHide: true
        }));

        th.setShower("report", Ext.create('Jc.shower.Report'));
        th.setShower("closeShower", Ext.create('Jc.shower.CloseShower'));

        //
        th.viewPort = Ext.createWidget("viewport", {
            id: "jc-app-viewport",
            layout: {
                type: 'border'
            },
            items: [th.topPanel, this.centerPanel, this.toolsPanel]
        });

    }

});
 