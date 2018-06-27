<%@ page import="jandcode.lang.*" %>
<script type="text/javascript">
  Ext.define("Jc.App", {
    extend: "Jc.BaseApp",
      title: UtLang.t("Алгоритмы обработки геоданных"),
      logoWidth: 300,

    createMainMenu: function() {
      //
      var menu = Jc.menu;
      var item = Jc.action;
      //
      var logo = Ext.create('Jc.control.PageHeader', {
        text: "Алгоритмы обработки геоданных",
        icon: Jc.url("page/geodata.png"),
        width: 350,
        listeners: {
          click: {
            element: 'el',
            fn: function() {
              Jc.app.home();
            }
          }
        }
      });
      //
      return [logo, '-'].concat(this.createMenuForUser());
    },

    createMenuForUser: function() {
      var mm = [
      // ToDO Тут может быть "о программе" Закоментировал пока
        /*Jc.menu({text: UtLang.t('Помощь'), icon: "help", scope: this, onExec: this.help, items: [
          Jc.action({text: 'О программе', scope: this, onExec: this.about})
        ]}),*/
        '->'
      ];
      return mm;
    },

    home: function() {
        Jc.showFrame({frame: 'js/home.gf', id: true});
    },

    help: function() {
      Jc.showFrame({
        frame: "Jc.frame.HtmlView", id: 'app-frame-help',
        title: 'Помощь',
        url: Jc.url('help/index.html')
      });
    },

    about: function() {
      Jc.showFrame({frame: "Jc.About"});
    },

    //

    __end__: null

  });
</script>
