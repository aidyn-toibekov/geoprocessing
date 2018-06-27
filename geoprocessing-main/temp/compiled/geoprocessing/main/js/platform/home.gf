<%@ page import="jandcode.auth.AuthService; jandcode.utils.*; exp.utils.dbinfo.*; exp.main.utils.*; jandcode.web.*; jandcode.dbm.*; jandcode.dbm.data.*; jandcode.wax.core.utils.gf.*" %>
%{-- 

Home page

========================================================================= --}%

<gf:groovy>
  <%
    GfFrame gf = args.gf
    GfAttrs a = gf.attrs
    //

    // информация о приложении

    def expApp = gf.app.service(ExpAppService.class).getCurrentExpApp()
    a.appIcon = expApp.icon
    a.appTitle = expApp.title
    def usr = gf.app.service(AuthService.class).currentUser;
    a.fn = usr.fullname;

    // информация о базе
    def model = gf.model
    a.dbName = model.name
    a.dbDriver = model.dbSource.dbType
    a.dbUrl = model.dbSource.url
    a.dbInfo = model.dbSource.database
    if ("oracle".equals(a.dbDriver)) {
      a.dbInfo = model.dbSource.username
    }

    a.dbId = model.service(DbInfoService).getDbId()

    // информация о приложении
    a.versionApp = new VersionInfo("exp.main").version
//    a.versionJc = new VersionInfo("jandcode.wax.core").version

  %>
</gf:groovy>

%{-- ========================================================================= --}%
<g:javascript>
  //
  th.title =UtLang.t('Главная');
  th.layout = b.layout('vbox');
  //
  th.items = [

    b.databox({
      items: [
        b.delim(UtLang.t("Информация о базе данных модели")),
        b.label(UtLang.t("Имя модели")),
        b.datalabel(th.dbName),
        b.label(UtLang.t("ID модели")),
        b.datalabel(th.dbId),
        b.label(UtLang.t("Драйвер")),
        b.datalabel(th.dbDriver),
        b.label(UtLang.t("url базы")),
        b.datalabel(th.dbUrl),
        b.label(UtLang.t("База данных")),
        b.datalabel(th.dbInfo)

        ,
        b.delim(UtLang.t("Информация о версии приложения")),
        b.label(UtLang.t("Версия")),
        b.datalabel(th.versionApp),

        b.delim(UtLang.t("Текущий пользователь")),
        b.datalabel(th.fn)

      ]
    })


  ];

/*
  th.toolbar = [
    b.action({text: 'Что нового', icon: 'help', onExec: function() {
      Jc.showFrame({
        frame: "Jc.frame.HtmlView", id: 'app-frame-whatnew',
        title: 'Что нового',
        url: Jc.url('help/whatnew.html')
      });
    }})
  ];
*/


</g:javascript>
