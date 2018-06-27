<%@ page import="jandcode.utils.*; jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 

Home page

========================================================================= --}%

<gf:groovy>
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
    //
  %>
</gf:groovy>

%{-- ========================================================================= --}%
<g:javascript>
  //
  th.title = UtLang.t('Главная');
  th.layout = b.layout('border');
  //

  var httml = "<div align=\"center\"><h2>РАЗРАБОТКА И ПРОГРАММНАЯ РЕАЛИЗАЦИЯ АЛГОРИТМОВ ДЛЯ ОБРАБОТКИ ГЕОДАННЫХ</h2> </div>";
  httml += "<div align=\"center\"><h4>Пройдите пожалуйста по вкладкам для просмотра экспериментов или данных по материалам</h4> </div>";



  //
  var httml2 = "<div align=\"center\"><h2>Автор приложения</h2> </div> " +
  "<div align=\"center\"><h4>Есебаева Б.Е.</h4> </div>" +
  "<div align=\"center\"><h5>Республика Казахстан, Астана "
  httml2 += new Date().getFullYear()
  httml2 += "г. &copy;</h5> </div>"
  th.items = [
    b.pageheader("Добро пожаловать!", "globe"),
    b.panel({
      border: false,
      region: "center",
      html: httml
    }),
    b.panel({
      border: false,
      region: "south",
      html: httml2
    })
  ];


  th.toolbar = [
    b.action({
      text: UtLang.t('Материалы'),
      icon: 'station',
      menu: [
        b.action({text: UtLang.t('Типы материалов'), icon: 'layers', onExec: function() {
            Jc.showFrame({
              frame: "js/materialtype/materialType_list.gf",
              id: "1"
            });
          }}),

        b.action({text: UtLang.t('Объекты экспериментов'), icon: 'station', onExec: function() {
            Jc.showFrame({
              frame: "js/obj/obj_list.gf",
              id: "2"
            });
          }})
      ]
    }),
    b.action({text: UtLang.t('Эксперименты'), icon: 'storage', onExec: function() {
        Jc.showFrame({
          frame: "js/geoprocessing/seismicdata_list.gf",
          id: "3"
        });
      }})
  ];
</g:javascript>
