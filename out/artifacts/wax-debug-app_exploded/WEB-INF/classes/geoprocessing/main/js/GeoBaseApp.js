Ext.define('Jc.GeoBaseApp', {
    extend: 'Jc.BaseApp',

    title: UtLang.t("Алгоритмы обработки геоданных"),
    logoWidth: 300,

    init: function () {
        this.callParent();
        //
        // shower для master
        Jc.app.theme.setShower("dialogmaster", Ext.create('Jc.shower.Dialogmaster'));

        // =====================================
        // Заменяем стандартную функцию Ext.JSON.encodeString
        // =====================================
        console.info("Заменяем стандартную функцию Ext.JSON.encodeString");
        // было: charToReplace = /[\\\"\x00-\x1f\x7f-\uffff]/g
        var tofi_charToReplace = /[\\\"\x00-\x1f]/g;
        //
        var tofi_m = {
            "\b": '\\b',
            "\t": '\\t',
            "\n": '\\n',
            "\f": '\\f',
            "\r": '\\r',
            '"': '\\"',
            "\\": '\\\\',
            '\x0b': '\\u000b' //ie doesn't handle \v
        };
        //
        /*Ext.JSON.encodeString = function (s) {
            return '"' + s.replace(tofi_charToReplace, function (a) {
                var c = tofi_m[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"';
        };*/
        // =====================================

    },


    /**
     * Возвращает массив action для меню приложения.
     */
    createMainMenu: function () {
        var logo = Ext.create('Jc.control.PageHeader', {
            text: this.title,
            icon: Jc.url("page/geodata.png"),
            width: this.logoWidth,
            listeners: {
                click: {
                    element: 'el',
                    fn: function () {
                        Jc.app.home();
                    }
                }
            }
        });


        

            return [].concat(logo, this.createAppMenu())
    },

    /**
     * Возвращает массив action для меню приложения.
     */
    createAppMenu: function () {
        return []
    },

    /**
     * Возвращает массив action для гостевого меню.
     */
    createGuestMenu: function () {
        return [
            '->',
            this.createModelButton(),
            this.createLangButton()
        ];
    },

    //////

    createLangButton: function () {
        var th = this;
        var items = [];
        Ext.each(Jc.ini.langs, function (z) {
            items.push(Jc.action({text: z.title + ' (' + z.name + ')',
                icon: 'lang_' + z.name, lang: z.name, onExec: function (a) {
                    var url = Jc.baseUrl.substring(0, Jc.baseUrl.length - 3) + a.lang;
                    window.location = url;
                }}));
        });
        return Jc.menu({text: Jc.ini.lang, icon: 'lang_' + Jc.ini.lang, items: items});
    },

    //////

    createModelButton: function () {
        return Jc.action({text: Jc.realModelName, icon: 'database', onExec: function () {
            window.location = Jc.realBaseUrl + "a/platform/" + Jc.ini.lang;
        }});
    },

    //////

    createUserButton: function () {
        return Jc.action({text: Jc.ini.userInfo.name, icon: 'user', onExec: function () {
            Jc.showFrame({frame: 'js/auth/userProfile.html', id: 'app-user-profile', params: {id: Jc.ini.userInfo.id}});
        }});
    },

    createLogoutButton: function () {
        return Jc.action({text: UtLang.t('Выход'), icon: 'logout', onExec: function () {
            Jc.requestText({
                url: "auth/logout"
            });
            window.location = Jc.baseUrl;
        }});
    },

    //////

    createCloseButton: function () {
        return Jc.menu({iconCls: 'icon-shower-tab-close', tooltip: UtLang.t('Закрыть текущую вкладку'),
            onExec: function () {
                Jc.app.theme.getShower('main').closeActiveFrame();
            },
            items: [
                Jc.action({text: UtLang.t('Закрыть все вкладки, кроме текущей'), iconCls: 'icon-shower-tab-close', onExec: function () {
                    Jc.app.theme.getShower('main').closeOtherFrame();
                }}),
                Jc.action({text: UtLang.t('Закрыть все вкладки'), iconCls: 'icon-shower-tab-close', onExec: function () {
                    Jc.app.theme.getShower('main').closeAllFrame();
                }})
            ]
        });
    },

    createWhatnewButton: function () {
        return Jc.action({text: UtLang.t('Что нового'), icon: 'help', onExec: function () {
            Jc.showFrame({
                frame: "Jc.frame.HtmlView", id: 'app-frame-whatnew',
                title: UtLang.t('Что нового'),
                url: Jc.url('help/whatnew.html')
            });
        }});
    },

    //
    __end__: null

});
 