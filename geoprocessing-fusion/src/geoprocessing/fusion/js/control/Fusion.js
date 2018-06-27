Ext.define ( 'Jc.control.Fusion', {
    extend : 'Ext.Component',
    //
    renderTpl: [
        '<div id="{id}-chartcontainer" style="width:100%; height:100%"></div>'
    ],
    //
    chartId:null,
    chart : null,
    //
    XMLUrl:null,
    JSONUrl:null,
    //
    XMLData:null,
    JSONData:null,
    //
    chartConfigText:{
         ChartNoDataText    : "Нет данных" ,
         PBarLoadingText    : "Загрузка графика, пожалуйста подождите" ,
         XMLLoadingText     : "Загрузка данных, пожалуйста подождите" ,
         ParsingDataText    : "Идет чтение полученных данных, пожалуйста подождите" ,
         RenderingChartText : "Загрузка графика, пожалуйста подождите" ,
         LoadDataErrorText  : "Ошибка при загрузке данных, пожалуйста обратитесь к разработчикам.." ,
         InvalidXMLText     : "Ошибка в данных, пожалуйста обратитесь к разработчикам.."
    },
    //
    flex : 1,
    border : false,
    //
    constructor : function ( options ) {
        var th = this;

        th.chart = null;
        th.chartId = null
            //
        th.XMLUrl = null;
        th.JSONUrl = null;
            //
        th.XMLData = null;
        th.JSONData = null;

        var opt = Ext.apply ( {
        }, options );
        //

        th.callParent( [opt] );
    },

    initComponent: function() {

        this._buildChartId();
        //
        this.addEvents( "chartready" );
        this.addEvents( "barclick" );
        //
        this.callParent(arguments);
    },
    //
    _buildChartId:function(){
        var chartId = this.chartId;
        if ( !chartId ){
            this.chartId = this.id + "-chartId";
        }
    },
    //
    listeners : {
        boxready : function(thc, width, height, eOpts ){
            var th = this;
            //
            th._onBoxReady ();
        }
    },

    _onBoxReady : function () {
        var th = this;
        //
        var chartContainerId =  th.id + "-chartcontainer";
        //
        var chart = th.renderChart( chartContainerId );
        th.chart = chart;
        //
        th.fireEvent("chartready", th, chart);
    },

    renderChart : function ( chartContainerId ) {
        var th = this;

        var chartOpt = {
            chartId:th.chartId,
            id:th.chartId,
            type : th.chartType,
            width : '100%',
            height : '100%',
            debugMode : false
        };

        var chart = FusionCharts( th.chartId );
        if ( chart ){
             chart.dispose();
        }

        chart = new FusionCharts( chartOpt );

        //Добавление реакции на проваливание
        chart.onBarClick = function(dataId){
            th.fireEvent("barclick", th, chart, dataId);
        }
        //
        var XMLUrl = th.XMLUrl;
        var JSONUrl = th.JSONUrl;
        var XMLData = th.XMLData;
        var JSONData = th.JSONData;
        //
        if ( XMLUrl ){
            chart.setXMLUrl(XMLUrl);
        }
        if ( JSONUrl ){
            chart.setJSONUrl(JSONUrl);
        }
        if ( XMLData ){
            chart.setDataXML(XMLData);
        }
        if ( JSONData ){
            chart.setJSONData(JSONData);
        }
        //
        Ext.Object.each(th.chartConfigText, function(key, value, myself) {
            chart.configure ( key, value );
        });
        //
        chart.render( chartContainerId );
        //
        return chart;
    },

    setDataXML      : function ( XMLData ) {
        var th = this;
        if ( XMLData ){
            if (th.chart){
                th.chart.setDataXML ( XMLData );
            }
        }
    },

    setJSONData      : function ( JSONData ) {
        var th = this;
        if ( JSONData ){
            if (th.chart){
                th.chart.setJSONData ( JSONData );
            }
        }
    }
} );