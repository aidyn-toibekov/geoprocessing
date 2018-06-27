<%@ page import="jandcode.lang.*" %>
<script type="text/javascript">
    Ext.define("Jc.platform.App", {
        extend: "Jc.GeoBaseApp",

        title: UtLang.t("Алгоритмы обработки геоданных"),
        logoWidth: 350,

        createAppMenu: function() {
            var mm = [


                '->',
                Jc.action({
                    text: UtLang.t('О программе...'),
                    icon: "help",
                    scope: this,
                    onExec: this.about
                }),
                '-',
            ];
            return mm;
        },

        //

        home: function() {
            Jc.app.toolsMenu();
            Jc.showFrame({frame: 'js/platform/home.gf', id: true});
        },

        toolsMenu: function() {
            Jc.showFrame({frame: 'js/platform/tools_menu.gf', id: true});
        },

        help: function() {
            Jc.showFrame({
                frame: "Jc.frame.HtmlView", id: 'app-frame-help',
                title: 'Помощь',
                url: Jc.url('help/index.html')
            });
        },

        about: function() {
            Jc.showFrame({frame: "js/platform/about.gf"});
        },


        //

        __end__: null

    });
</script>
