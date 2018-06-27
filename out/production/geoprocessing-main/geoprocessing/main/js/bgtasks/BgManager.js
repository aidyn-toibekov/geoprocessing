/**
 * Поддержка bgtasks на клиенте
 *
 * Jc.ini.bgtasksDisabled=true => если этот параметр установить, то Jc.requestBg будет
 * вести себя как обычный Ext.Ajax.request
 *
 * Jc.ini.bgtasksPeriod=MSEC => период опроса сервера на предмет получения результата.
 * Jc.ini.bgtasksPeriodFirst=MSEC => первый период опроса сервера (сразу после запроса)
 */

Ext.define('Jc.bgtasks.BgManager', {

    // периодичность опроса
    period: 200,

    // первый период - сразу после запроса
    periodFirst: 75,

    constructor: function() {
        this._que = [];
        if (Jc.ini.bgtasksPeriod) {
            this.period = Jc.ini.bgtasksPeriod;
        }
        if (Jc.ini.bgtasksPeriodFirst) {
            this.periodFirst = Jc.ini.bgtasksPeriodFirst;
        }
    },

    addTask: function(cfg) {
        if (this._que.length == 0) {
            if (!cfg.showWait) {
                cfg.showWait = 'bgtasks';
            }
            Jc.app.showWait(cfg.showWait, true);
            // update showWait
            var sw = Jc.app.getShowWaitControl();
            if (sw) {
                if (Ext.isFunction(sw.initBgStatus)) {
                    sw.initBgStatus(cfg);
                }
            }
        }
        this._que.push(cfg);
    },

    removeTask: function(task) {
        Ext.Array.remove(this._que, task);
        if (this._que.length == 0) {
            Jc.app.hideWait();
        }
    },

    isEmptyQue: function() {
        return this._que.length == 0;
    },

    getNextCompletedTask: function() {
        var res = null;
        Ext.each(this._que, function(z) {
            if (z.taskCompleted && !z.resultRequestSend) {
                res = z;
                return false;
            }
        });
        return res;
    },

    getNotCompletedTaskIds: function() {
        var res = [];
        Ext.each(this._que, function(z) {
            if (!z.taskCompleted) {
                res.push(z.taskId);
            }
        });
        return res;
    },

    getTask: function(id) {
        var res = null;
        Ext.each(this._que, function(z) {
            if (z.taskId == id) {
                res = z;
                return false;
            }
        });
        return res;
    },

    /**
     * Вызывает оригинальный callback (или success, или failure) для запроса
     */
    callCallback: function(task, opt, success, response) {
        if (task._save_callback) {
            task._save_callback(opt, success, response);
        } else {
            if (success) {
                if (task._save_success) {
                    task._save_success(response, opt);
                }
            } else {
                if (task._save_failure) {
                    task._save_failure(response, opt);
                } else {
                    Jc.error(response);
                }
            }
        }
    },

    requestBg: function(config) {
        var th = this;
        var cfg = Ext.apply({}, config);

        if (!cfg.headers) cfg.headers = {};
        cfg.headers['Jandcode-BgTasks-Start'] = 1;
        cfg._save_callback = cfg.callback;
        cfg._save_success = cfg.success;
        cfg._save_failure = cfg.failure;

        cfg.success = null;
        cfg.failure = null;

        cfg.callback = function(opt, success, response) {
            if (success) {
                // запрос на start был выполнен успешно. Запоминаем id задачи
                var jsonData = Ext.decode(response.responseText);
                cfg.taskId = jsonData.taskId;
                // добавляем в cписок отслеживаемых задач
                th.addTask(cfg);
                th.timerOn(th.periodFirst);
            } else {
                th.callCallback(cfg, opt, success, response);
            }
        };

        Ext.Ajax.request(cfg);

    },

    timerOn: function(period) {
        var th = this;
        if (!period) {
            period = th.period;
        }
        setTimeout(Jc.bgtasks._doTimerTask, period);
    },

    doTimerTask: function() {
        var th = this;
        if (th.isEmptyQue()) {
            return; // все
        }
        var task = th.getNextCompletedTask();
        if (task) {
            // есть уже выполненные на сервере. Забираем результат
            task.resultRequestSend = true; // помечаем как отправленную за результатом
            Ext.Ajax.request({
                url: Jc.url('bgtasks/result'),
                params: {
                    taskId: task.taskId
                },
                callback: function(opt, success, response) {
                    try {
                        th.callCallback(task, opt, success, response);
                    } finally {
                        th.removeTask(task);
                        th.timerOn();
                    }
                }
            });
        } else {
            var taskIds = th.getNotCompletedTaskIds();
            Ext.Ajax.request({
                url: Jc.url('bgtasks/status'),
                params: {
                    taskIds: Ext.encode(taskIds)
                },
                callback: function(opt, success, response) {
                    var needTimerOn = true;
                    try {
                        if (success) {
                            // запрос был выполнен успешно. Запоминаем id задачи
                            var jsonData = Ext.decode(response.responseText);
                            var tasks = jsonData.tasks;
                            for (var tid in tasks) {
                                var task = th.getTask(tid);
                                var resInfo = tasks[tid];
                                var taskStatus = resInfo.status;
                                if (task) {
                                    if (taskStatus == -1) {
                                        th.removeTask(task);
                                    }
                                    if (taskStatus == 2) {
                                        task.taskCompleted = true;
                                        needTimerOn = false;
                                    }
                                }
                                // update showWait
                                var sw = Jc.app.getShowWaitControl();
                                if (sw) {
                                    if (Ext.isFunction(sw.updateBgStatus)) {
                                        sw.updateBgStatus(resInfo);
                                    }
                                }
                            }
                        } else {
                            Jc.error(response);
                        }
                    } finally {
                        if (needTimerOn) {
                            th.timerOn();
                        } else {
                            th.doTimerTask();
                        }
                    }
                }
            });
        }

    }

});

//////

/**
 * Пример реализации showWait
 */
Ext.define('Jc.bgtasks.ShowWaitExample', {
    extend: 'Ext.Panel',
    initComponent: function() {
        this.hidden = true;
        this.cls = "x-mask-msg x-mask-msg-default jc-mask-msg jc-showwait-control";
        this.bodyStyle = 'border: none; background-color: transparent;';
        this.width = 100;
        this.waitLabel = Ext.create('Ext.form.Label', {style: '', text: UtLang.t('Подождите...')});
        this.items = [this.waitLabel];
        //
        this.logmsgs = [];
        //
        this.callParent();
    },

    /**
     * Эта функция вызывается после того, как задача стартовала на сервере
     * @param cfg конфигурация задачи и запроса. Имеется свойство taskId
     */
    initBgStatus: function(cfg) {
    },

    /**
     * Эта функция вызывается после получения статуса задачи.
     * @param cfg:
     *  taskId: id задачи
     *  status: статус задачи
     *  logmsgs: список сообщений из лога
     *  logdata: данные лога
     */
    updateBgStatus: function(cfg) {
        if (cfg.logmsgs.length > 0 || cfg.logdata.max) {
            if (!this.logMemo) {
                this.setWidth(400);

                this.logProgress = Ext.create('Ext.ProgressBar', {
                    width: '100%',
                    hidden: true,
                    style: 'margin-top:8px'
                });
                this.add(this.logProgress);

                //
                this.logMemo = Ext.create('Ext.Component', {
                    hidden: true,
                    width: '100%',
                    height: 93,
                    autoScroll: true,
                    style: 'border-top: 1px #888888 solid;margin-top:8px;padding-top:8px;font-size:11px'
                });
                this.add(this.logMemo);
            }
            if (cfg.logdata.max) {
                this.logProgress.setVisible(true);
                var v = Jc.toInt(cfg.logdata.cur);
                var count = Jc.toInt(cfg.logdata.max);
                if (count > 0) {
                    this.logProgress.updateProgress(v / count);
                }
            }
            if (cfg.logmsgs.length > 0) {
                this.logMemo.setVisible(true);
                this.logmsgs = this.logmsgs.concat(cfg.logmsgs);
                var s = this.logmsgs.join('<br>');
                this.logMemo.update(s);
                this.logMemo.getEl().scroll('b', Infinity);
            }

            this.center();
        }
    }

});

// showWait по умолчанию для всех фоновых задач
// установите пустую строку, что бы не использовать специализированный wait
Jc.ini.showWait.control['bgtasks'] = 'Jc.bgtasks.ShowWaitExample';

//////

Jc.bgtasks._inst = Ext.create('Jc.bgtasks.BgManager');
Jc.bgtasks._doTimerTask = Ext.Function.alias(Jc.bgtasks._inst, "doTimerTask");

/**
 * Выполнение dao в фоновом режиме.
 * Функция onOk выполняется при удачном выполнении.
 * Параметр - типизированный результат daoinvoke.
 */
Jc.daoinvokeBg = function(daoname, daomethod, daoparams, onOk) {
    var model = Jc.model;
    if (Ext.isObject(daoname)) {
        daomethod = daoname.daomethod;
        daoparams = daoname.daoparams;
        daoname = daoname.daoname;
        onOk = daoname.onOk;
    }
    if (!daoparams) {
        daoparams = [];
    }
    if (!Ext.isArray(daoparams)) {
        throw new Error("daoparams must be array");
    }
    var dpjson = model.daoparamsToJson(daoparams);
    Jc.requestBg({
        url: Jc.baseUrl + 'dbm/daoinvoke?_=' + daoname + "," + daomethod, //url только для наглядности!
        params: {
            model: model.name,
            daoname: daoname,
            daomethod: daomethod,
            daoparams: dpjson,
            cacheinfo: model._cacheVersion
        },
        success: function(resp) {
            var jsonData;
            try {
                jsonData = Ext.decode(resp.responseText);
            } catch(e) {
                Jc.error(e);
            }
            if (jsonData.success === false || jsonData.success === "false") {
                Jc.error(new Jc.Error({err: jsonData, type: 'json'}));
            }
            var res = Jc.dbm.Cnv.fromJson(jsonData, model);
            model._checkCacheInfo(res);
            if (onOk) {
                onOk(res);
            }
        }
    });
};


/**
 * Фикс для GfFrame с поддержкой вызова через фоновые задачи
 */
Ext.define('Jc.patch.bgtasks.GfFrame', {
    override: 'Jc.frame.GfFrame',

    reloadContentBg: function(onLoad) {
        var th = this;
        // собираем параметры
        var reqParams = th.getReqParams();
        //
        Jc.requestBg({  //fix!
            url: th.contentUrl,
            params: {
                gfparams: Ext.encode(reqParams)
            },
            success: function(response, opts) {
                // загрузка прошла удачно
                try {
                    if (onLoad) {
                        onLoad(response.responseText);
                    } else {
                        th.updateContent(response.responseText);
                    }
                } catch(e) {
                    Jc.error(e);
                }
            },
            failure: function(response, opts) {
                Jc.error(response, false);
            }
        });
    },

    reloadContent: function(onLoad) {
        if (this.bgModeEnabled) {
            return this.reloadContentBg(onLoad);
        } else {
            return this.callParent(arguments);
        }
    },

    parseParams: function(cfg) {
        if (cfg && cfg.bgModeEnabled) {
            this.bgModeEnabled = cfg.bgModeEnabled;
            delete cfg.bgModeEnabled;
        }
        this.callParent(arguments);
    }

});

Jc.showFrameBg = function(config) {
    if (!config) {
        config = {};
    }
    config.bgModeEnabled = true;
    return Jc.showFrame(config);
};

if (!Jc.ini.bgtasksDisabled) {
    Jc.requestBg = Ext.Function.alias(Jc.bgtasks._inst, "requestBg");
    Ext.Ajax.requestBg = Jc.requestBg;
} else {
    Jc.requestBg = Ext.Ajax.request;
    Ext.Ajax.requestBg = Ext.Ajax.request;
    Jc.showFrameBg = Jc.showFrame;
}