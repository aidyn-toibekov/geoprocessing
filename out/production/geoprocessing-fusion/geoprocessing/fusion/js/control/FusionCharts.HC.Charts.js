/**!
 * @license FusionCharts JavaScript Library
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @author FusionCharts Technologies LLP
 * @version fusioncharts/3.2.4-sr1.9888
 */

FusionCharts(['private', 'modules.renderer.highcharts-charts', function () {
    var global = this,
        lib = global.hcLib,

        //strings
        BLANKSTRING = lib.BLANKSTRING,

        createTrendLine = lib.createTrendLine,

        //add the tools thats are requared
        pluck = lib.pluck,
        getValidValue = lib.getValidValue,
        pluckNumber = lib.pluckNumber,
        defaultPaletteOptions = lib.defaultPaletteOptions,
        getFirstValue = lib.getFirstValue,
        getDefinedColor = lib.getDefinedColor,
        parseUnsafeString = lib.parseUnsafeString,
        FC_CONFIG_STRING = lib.FC_CONFIG_STRING,
        extend2 = lib.extend2,//old: jarendererExtend / margecolone
        getDashStyle = lib.getDashStyle, // returns dashed style of a line series

        toPrecision = lib.toPrecision,

        stubFN = lib.stubFN,

        Highcharts = lib.Highcharts,
        Series = Highcharts.Series,
        hasSVG = Highcharts.hasSVG,
        hasTouch = Highcharts.hasTouch,
        isIE = Highcharts.isIE,
        extend = Highcharts.extend,
        merge = Highcharts.merge,
        pick = Highcharts.pick,
        each = Highcharts.each,
        attr = Highcharts.attr,
        map = Highcharts.map,
        seriesTypes = Highcharts.seriesTypes,
        addEvent = Highcharts.addEvent,
        getPosition = Highcharts.getPosition,
        getTouchEvent = Highcharts.getTouchEvent,

        defaultOptions = Highcharts.getOptions(),
        defaultPlotOptions = defaultOptions.plotOptions,

        defined = function  (obj) {
            return obj !== UNDEFINED && obj !== null;
        },
        pInt = function (s, mag) {
            return parseInt(s, mag || 10);
        },
        isObject = function (obj) {
            return typeof obj === 'object';
        },
        isString = function (s) {
            return typeof s === 'string';
        },
        docMode8 = document.documentMode === 8,
        UNDEFINED,
        TRACKER_FILL = 'rgba(192,192,192,'+ (hasSVG ? 0.000001 : 0.002) +')', // invisible but clickable
        NORMAL_STATE = '',
        SELECT_STATE = 'select',
        HIDDEN = 'hidden',
        VISIBLE = docMode8 ? 'visible' : '',
        SHOW = 'show',
        HIDE = 'hide',

        PX = 'px',
        NONE = 'none',
        M = 'M',
        L = 'L',
        A = 'A',
        AT = 'AT',
        WA = 'WA',
        Z = 'Z',

        math = Math,
        mathSin = math.sin,
        mathCos = math.cos,
        mathATan2 = math.atan2,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathAbs = math.abs,
        mathPI = math.PI,
        mathCeil = math.ceil,
        mathFloor = math.floor,
        mathSqrt = math.sqrt,
        mathLog = math.log,
        mathPow = math.pow,
        deg2rad = mathPI / 180,
        pi = Math.PI,
        piBy2 = pi / 2,
        pi2 = 2 * pi,
        pi3By2 = pi + piBy2,
        pi4 = 4 * pi,
        getColumnColor = lib.graphics.getColumnColor,
        getFirstColor = lib.getFirstColor,
        setLineHeight = lib.setLineHeight,
        pluckFontSize = lib.pluckFontSize, // To get the valid font size (filters negative values)
        pluckColor = lib.pluckColor,
        getFirstAlpha = lib.getFirstAlpha,
        getDarkColor = lib.graphics.getDarkColor,
        getLightColor = lib.graphics.getLightColor,
        convertColor = lib.graphics.convertColor,
        COLOR_TRANSPARENT = lib.COLOR_TRANSPARENT,
        POSITION_CENTER = lib.POSITION_CENTER,
        POSITION_TOP = lib.POSITION_TOP,
        POSITION_BOTTOM = lib.POSITION_BOTTOM,
        POSITION_RIGHT = lib.POSITION_RIGHT,
        POSITION_LEFT = lib.POSITION_LEFT,
        INT_ZERO = 0,

        chartAPI = lib.chartAPI,

        titleSpaceManager = lib.titleSpaceManager,
        placeLegendBlockBottom = lib.placeLegendBlockBottom,
        placeLegendBlockRight = lib.placeLegendBlockRight,
        mapSymbolName = lib.graphics.mapSymbolName,
        singleSeriesAPI = chartAPI.singleseries,
        multiSeriesAPI = chartAPI.multiseries,

        COMMASTRING = lib.COMMASTRING,
        STRINGUNDEFINED  = lib.STRINGUNDEFINED ,
        ZEROSTRING = lib.ZEROSTRING,
        ONESTRING = lib.ONESTRING,
        HUNDREDSTRING = lib.HUNDREDSTRING,
        PXSTRING = lib.PXSTRING,
        COMMASPACE = lib.COMMASPACE,
        creditLabel = false && !/fusioncharts\.com$/i.test(location.hostname),

        /**
         * Reduces the pain of writing loads of object structures while creating
         * FusionCharts specific color configurations
         */
        colorize = function (original, obj) {
            if (!obj) {
                return {
                    FCcolor: original
                };
            }
            else {
                return extend(original.FCcolor, obj);
            }

        };





    /////////////////  column2d //////////////
    //add the charts
    //only the point and default series will differ from singleSeriesAPI
    chartAPI('column2d', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.column2dbase);


    /////////////// column3d ///////////
    // we inherit Column2D for data manipulation
    // and change the defaultSeriesType to column3d
    chartAPI('column3d', {
        defaultSeriesType : 'column3d',
        defaultPlotShadow: 1,
        defaultZeroPlaneHighlighted: false
    }, chartAPI.column2d);


    /////////////// Bar2D ///////////
    // we inherit Column2D for data manipulation
    // and change the defaultSeriesType to bar and space management to barbase
    chartAPI('bar2d', {
        isBar : true,
        defaultSeriesType : 'bar',
        spaceManager : chartAPI.barbase
    }, chartAPI.column2d);


    /////////////// Line ///////////
    chartAPI('line', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.linebase);


    /////////////// Area ///////////
    chartAPI('area2d', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.area2dbase);


    /////////////// pie2d ///////////
    chartAPI('pie2d', {
        standaloneInit: true,
        defaultSeriesType : 'pie',
        defaultPlotShadow: 1,
        sliceOnLegendClick: true,

        point : function (chartName, series, data, FCChartObj, HCObj) {
            var name, index, dataValue, dataObj, pointShadow,
            conf = HCObj[FC_CONFIG_STRING],
            is3D = conf.is3d,
            setColor, setAlpha, setRatio, setPlotBorderColor, setPlotBorderAlpha,
            totalValue = 0, displayValueText, labelText, toolText, pValue, value,
            TTValue, dataIndex = 0, dataArr = [], displayValue,
            // thickness of pie slice border
            setBorderWidth = pluckNumber(FCChartObj.plotborderthickness , is3D ? 0.1 : 1),
            // whether to use 3d lighing effect on pie
            use3DLighting = pluckNumber(FCChartObj.use3dlighting, 1),
            // radius of the pie 3d lighting effect
            radius3D = use3DLighting ? pluckNumber(FCChartObj.radius3d,
                FCChartObj['3dradius'], 90) : 100,
            // whether to show the zero values on pie
            showZeroPies = pluckNumber(FCChartObj.showzeropies, 1),
            showPercentInToolTip = pluckNumber(FCChartObj.showpercentintooltip, 1),
            showLabels = pluckNumber(FCChartObj.showlabels, 1),
            showValuesDef = pluckNumber(FCChartObj.showvalues, 1),
            showPercentValues = pluckNumber(FCChartObj.showpercentvalues, FCChartObj.showpercentagevalues, 0),
            toolTipSepChar = pluck(FCChartObj.tooltipsepchar, FCChartObj.hovercapsepchar, COMMASPACE),
            labelSepChar = pluck(FCChartObj.labelsepchar, toolTipSepChar),
            piebordercolor = pluck(FCChartObj.plotbordercolor, FCChartObj.piebordercolor),
            NumberFormatter = HCObj[FC_CONFIG_STRING].numberFormatter,
            length = data.length, HcDataObj, isSliced,
            pointDashStyle,
            plotBorderDashed =  pluckNumber(FCChartObj.plotborderdashed, 0),
            // length of the dash
            seriesDashLen = pluckNumber(FCChartObj.plotborderdashlen, 5),
            // distance between dash
            seriesDashGap = pluckNumber(FCChartObj.plotborderdashgap, 4),
            showValue;

            // radius3d can not be greater than 100 and can not be less than 0
            if (radius3D > 100) {
                radius3D = 100;
            }
            if (radius3D < 0) {
                radius3D = 0;
            }

            //enable the legend for the pie
            if (pluckNumber(FCChartObj.showlegend, 0)) {
                HCObj.legend.enabled = true;
                HCObj.legend.reversed =
                !Boolean(pluckNumber(FCChartObj.reverselegend , 0));
                series.showInLegend = true;
            }

            // Filtering null and 0 values from data
            for (index = 0; index < length; index += 1) {
                dataObj = data[index];

                dataValue = NumberFormatter.getCleanValue(dataObj.value, true);

                if (!(dataValue === null || (!showZeroPies && dataValue === 0))) {
                    dataArr.push(dataObj);
                    totalValue += dataValue;
                }
            }
            //Issue #FCXT-175
            if (totalValue === 0) {
                dataArr = [];
            }

            // Pass the configuration whether user wants to supprss rotation.
            series.enableRotation = dataArr.length > 1 ? pluckNumber(FCChartObj.enablerotation, 1) : 0;
            //requared in 3d
            series.is3D = is3D;
            series.use3DLighting = use3DLighting;
            series.pieYScale = pluckNumber(FCChartObj.pieyscale, 40);
            if (series.pieYScale < 1) {
                series.pieYScale = 1;
            }
            //fix for FCXT-296
            if (series.pieYScale >=  100) {
                series.pieYScale = 80;
            }
            series.pieYScale /= 100;

            series.pieSliceDepth = pluckNumber(FCChartObj.pieslicedepth, 15);
            if (series.pieSliceDepth < 1) {
                series.pieSliceDepth = 1;
            }
            series.managedPieSliceDepth = series.pieSliceDepth;

            for (index = dataArr.length - 1; index >= 0; index -= 1) {
                // numberFormatter.getCleanValue(dataObj.value, true);
                // individual data obj
                // for further manipulation
                dataObj = dataArr[index];

                // Taking the value
                // we multiply the value with 1 to convert it to integer
                dataValue = NumberFormatter.getCleanValue(dataObj.value, true);


                // Label provided with data point
                name = parseUnsafeString(pluck(dataObj.label, dataObj.name, BLANKSTRING));

                // parsing slice cosmetics attribute supplied in data points
                // Color for each slice
                setColor = pluck(dataObj.color,
                    HCObj.colors[index % HCObj.colors.length]);
                // Alpha for each slice
                setAlpha = pluck(dataObj.alpha, FCChartObj.plotfillalpha, HUNDREDSTRING);
                // each slice border color
                setPlotBorderColor = pluck(dataObj.bordercolor, piebordercolor, getLightColor(setColor, is3D ? 90 : 25)).
                split(COMMASTRING)[0];
                // each slice border alpha
                setPlotBorderAlpha = FCChartObj.showplotborder == ZEROSTRING ?
                ZEROSTRING : pluck(dataObj.borderalpha, FCChartObj.plotborderalpha,
                    FCChartObj.pieborderalpha, '80');


                // Used to set alpha of the shadow
                pointShadow = {
                    opacity: Math.max(setAlpha, setPlotBorderAlpha) / 100
                };

                // Check if pre-sliced
                isSliced = Boolean(pluckNumber(dataObj.issliced, FCChartObj.issliced, 0));
                if (isSliced) {
                    conf.preSliced = isSliced;
                }

                pointDashStyle = pluckNumber(dataObj.dashed, plotBorderDashed) ?
                getDashStyle(pluck(dataObj.dashlen, seriesDashLen),
                    pluck(dataObj.dashgap, seriesDashGap), setBorderWidth) : undefined;

                // Finally insert the value and other point cosmetics in HighChart's series.data array
                series.data.push({
                    showInLegend: !(name === BLANKSTRING), // prevent legend item when no label
                    y: dataValue,
                    name: name,
                    shadow: pointShadow,
                    toolText: parseUnsafeString(getValidValue(dataObj.tooltext)),
                    color: this.getPointColor(setColor, setAlpha, radius3D),
                    _3dAlpha: setAlpha,
                    borderColor: convertColor(setPlotBorderColor,
                        setPlotBorderAlpha),
                    borderWidth: setBorderWidth,
                    link : getValidValue(dataObj.link),
                    sliced: isSliced,
                    dashStyle: pointDashStyle,
                    doNotSlice: pluck(FCChartObj.enableslicing, ONESTRING) != ONESTRING
                });

                // Adding label, tooltext, and display value
                toolText = name;
                pValue = NumberFormatter.percentValue(dataValue / totalValue * 100);
                value = NumberFormatter.dataLabels(dataValue) || BLANKSTRING;
                TTValue = showPercentInToolTip === 1 ? pValue : value;
                labelText = pluckNumber(dataObj.showlabel, showLabels) === 1 ? toolText : BLANKSTRING;
                displayValueText = (showValue = pluckNumber(dataObj.showvalue, showValuesDef)) === 1 ?
                (showPercentValues === 1 ? pValue : value ) : BLANKSTRING;

                displayValue = getValidValue(parseUnsafeString(dataObj.displayvalue));

                if (displayValue  !== undefined && showValue) {
                    displayValueText = displayValue;
                } else {
                    //create the datalabel str
                    if (displayValueText !== BLANKSTRING && labelText !== BLANKSTRING) {
                        displayValueText = labelText + labelSepChar + displayValueText;
                    }
                    else {
                        displayValueText = pluck(labelText, displayValueText);
                    }
                }

                // Create the Tooltext
                if (toolText != BLANKSTRING) {
                    toolText = toolText + toolTipSepChar + TTValue;
                }
                else {
                    toolText = TTValue;
                }
                HcDataObj = series.data[dataIndex];
                HcDataObj.displayValue = displayValueText;
                HcDataObj.toolText = pluck(HcDataObj.toolText, toolText);
                dataIndex += 1;
            }

            ///special conf for pie/doughnut
            HCObj.legend.enabled = FCChartObj.showlegend == ONESTRING ? true : false;
            HCObj.chart.startingAngle = pluck(dataArr.length > 1 ? FCChartObj.startingangle : 0, 0);

            //return series
            return series;
        },
        // Function that produce the point color
        getPointColor : function (color, alpha, radius3D) {
            var colorObj, shadowIntensity, shadowColor, highLightIntensity, highLight;
            color = getFirstColor(color);
            alpha = getFirstAlpha(alpha);
            if (radius3D < 100 && hasSVG) { //radial gradient is not supported in VML
                shadowIntensity = Math.floor((0.85*(100-0.35*radius3D))*100)/100;
                shadowColor = getDarkColor(color, shadowIntensity);
                highLightIntensity = Math.floor((0.5*(100+radius3D))*100)/100;
                highLight = getLightColor(color, highLightIntensity);
                colorObj = {
                    FCcolor : {
                        color : highLight + COMMASTRING + shadowColor,
                        alpha : alpha + COMMASTRING + alpha,
                        ratio : radius3D + ',100',
                        radialGradient : true
                    }
                };
            }
            else {
                colorObj = {
                    FCcolor : {
                        color : color + COMMASTRING + color,
                        alpha : alpha + COMMASTRING + alpha,
                        ratio : '0,100'
                    }
                };
            }

            return colorObj;
        },

        //add the axis configurar function
        configureAxis: function (hcJSON, fcJSON) {
            var length = 0, conf = hcJSON[FC_CONFIG_STRING], labelArr, dataArr, index = 0;
            //fix for pie datalabels style issue
            hcJSON.plotOptions.series.dataLabels.style = hcJSON.xAxis.labels.style;
            hcJSON.plotOptions.series.dataLabels.color = hcJSON.xAxis.labels.style.color;


            delete conf.x;
            delete conf[0];
            delete conf[1];
            // Making plotBorder and plotBackground transpatent
            //temp: added color to border
            hcJSON.chart.plotBorderColor =  hcJSON.chart.plotBackgroundColor = COLOR_TRANSPARENT;


            labelArr = conf.pieDATALabels = [];
            if (hcJSON.series.length === 1) {
                if ((dataArr = hcJSON.series[0].data) && (length = hcJSON.series[0].data.length) > 0 &&
                    hcJSON.plotOptions.series.dataLabels.enabled) {
                    for (; length --;) {
                        if (dataArr[length] && getValidValue(dataArr[length].displayValue) !== undefined) {
                            labelArr.push(dataArr[length].displayValue)
                        }
                    }
                }
            }

        },
        spaceManager: function (hcJSON, fcJSON, width, height) {
            var conf = hcJSON[FC_CONFIG_STRING], textWidthArr = [],
            is3D = conf.is3d,
            FCchartName = this.name,
            SmartLabel = conf.smartLabel, length = pluckNumber(conf.pieDATALabels && conf.pieDATALabels.length, 0), labelMaxW = 0,
            textObj, fcJSONChart = fcJSON.chart,
            manageLabelOverflow = pluckNumber(fcJSONChart.managelabeloverflow, 0),
            slicingDistance = !conf.preSliced && (fcJSONChart.enableslicing == ZEROSTRING) &&
            (fcJSONChart.showlegend != ONESTRING || fcJSONChart.interactivelegend == ZEROSTRING) ?
            0 : pluckNumber(fcJSONChart.slicingdistance, 20),
            pieRadius = pluckNumber(fcJSONChart.pieradius, 0),
            enableSmartLabels = pluckNumber(fcJSONChart.enablesmartlabels, fcJSONChart.enablesmartlabel, 1),
            skipOverlapLabels = enableSmartLabels ? pluckNumber(fcJSONChart.skipoverlaplabels, fcJSONChart.skipoverlaplabel, 1) : 0,
            isSmartLineSlanted = pluckNumber(fcJSONChart.issmartlineslanted, 1),
            labelDistance = pluckNumber(fcJSONChart.labeldistance, fcJSONChart.nametbdistance, 5),
            smartLabelClearance = pluckNumber(fcJSONChart.smartlabelclearance, 5),
            chartWorkingWidth = width - (hcJSON.chart.marginRight + hcJSON.chart.marginLeft),
            chartWorkingHeight = height - (hcJSON.chart.marginTop + hcJSON.chart.marginBottom),
            minOfWH = Math.min(chartWorkingHeight, chartWorkingWidth),
            smartLineColor = pluck(fcJSONChart.smartlinecolor, defaultPaletteOptions.plotFillColor[hcJSON.chart.paletteIndex ]),
            smartLineAlpha = pluckNumber(fcJSONChart.smartlinealpha, 100),
            smartLineThickness = pluckNumber(fcJSONChart.smartlinethickness, 1),
            dataLebelsOptions = hcJSON.plotOptions.series.dataLabels,
            style = dataLebelsOptions.style,
            lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),//2px padding
            series = hcJSON.series[0] || {},//FCXT-230 fixecd
            pieYScale = series.pieYScale,
            pieSliceDepth = series.pieSliceDepth,
            pieMinRadius = pieRadius === 0 ? minOfWH * 0.15 : pieRadius,
            avableRedius = 0, pieMinDia = 2 * pieMinRadius;

            dataLebelsOptions.connectorWidth = smartLineThickness;
            dataLebelsOptions.connectorColor = convertColor(smartLineColor, smartLineAlpha);

            chartWorkingHeight -= titleSpaceManager(hcJSON, fcJSON, chartWorkingWidth,
                pieMinDia < chartWorkingHeight ? chartWorkingHeight - pieMinDia : chartWorkingHeight / 2);

            if (fcJSONChart.showlegend == ONESTRING) {
                if (pluck(fcJSONChart.legendposition, POSITION_BOTTOM).toLowerCase() != POSITION_RIGHT) {
                    chartWorkingHeight -= placeLegendBlockBottom(hcJSON, fcJSON, chartWorkingWidth,
                        chartWorkingHeight / 2, true);
                } else {
                    chartWorkingWidth -= placeLegendBlockRight(hcJSON, fcJSON,
                        chartWorkingWidth / 3, chartWorkingHeight, true);
                }
            }



            //now get the max width requared for all display text
            //set the style
            SmartLabel.setStyle(style);
            if (length !== 1) { // Fix for single data in Pie makes pie very small in size.
                for (; length --;) {
                    textWidthArr[length] = textObj = SmartLabel.getOriSize(conf.pieDATALabels[length]);
                    labelMaxW = Math.max(labelMaxW, textObj.width);
                }
            }

            //if the smart label is on then modify the label distance
            if (enableSmartLabels) {
                labelDistance = smartLabelClearance + slicingDistance;
            }
            //if redius not supplyed then auto calculate it
            if (pieRadius === 0) {
                if (is3D) {
                    chartWorkingHeight -= pieSliceDepth;
                    avableRedius = Math.min((chartWorkingWidth / 2) - labelMaxW, ((chartWorkingHeight / 2) - lineHeight) / pieYScale) - labelDistance;
                }
                else {
                    avableRedius = Math.min((chartWorkingWidth / 2) - labelMaxW, (chartWorkingHeight / 2) - lineHeight) - labelDistance;
                }
                if (avableRedius >= pieMinRadius) {//there has space for min width
                    pieMinRadius = avableRedius;
                }
                else {
                    var shortFall = pieMinRadius - avableRedius;
                    labelDistance = Math.max(labelDistance - shortFall, slicingDistance);
                }
            }

            if (is3D) {
                var avaiableMaxpieSliceDepth = chartWorkingHeight - (2 * ((pieMinRadius * pieYScale) + lineHeight));
                if (pieSliceDepth > avaiableMaxpieSliceDepth) {
                    series.managedPieSliceDepth = pieSliceDepth - avaiableMaxpieSliceDepth;
                }
            }

            //add the slicing distance
            hcJSON.plotOptions.pie3d.slicedOffset = hcJSON.plotOptions.pie.slicedOffset  = slicingDistance;
            hcJSON.plotOptions.pie3d.size = hcJSON.plotOptions.pie.size  =  2 * pieMinRadius;
            hcJSON.plotOptions.series.dataLabels.distance =  labelDistance;
            hcJSON.plotOptions.series.dataLabels.isSmartLineSlanted =  isSmartLineSlanted;
            hcJSON.plotOptions.series.dataLabels.enableSmartLabels =  enableSmartLabels;
            hcJSON.plotOptions.series.dataLabels.skipOverlapLabels =  skipOverlapLabels;
            hcJSON.plotOptions.series.dataLabels.manageLabelOverflow =  manageLabelOverflow;


            //if the chart is a doughnut charts
            if (FCchartName === 'doughnut2d' || FCchartName === 'doughnut3d') {
                var doughnutRadius = pluckNumber(fcJSONChart.doughnutradius, 0), x,
                innerradius, innerpercentR, ratioStr, diff50Percent, radius3Dpercent,
                use3DLighting = pluckNumber(fcJSONChart.use3dlighting, 1), poin2nd, point, data,
                radius3D = use3DLighting ? pluckNumber(fcJSONChart.radius3d, fcJSONChart['3dradius'], 50) : 100;
                if (radius3D > 100) {
                    radius3D = 100;
                }
                if (radius3D < 0) {
                    radius3D = 0;
                }

                /*
                 *decide inner redius
                 */
                if (doughnutRadius === 0 || doughnutRadius >= pieMinRadius) {
                    innerradius =  pieMinRadius / 2;
                }
                else {
                    innerradius = doughnutRadius;
                }

                hcJSON.plotOptions.pie3d.innerSize =  hcJSON.plotOptions.pie.innerSize = 2 * innerradius;

                /*
                 *create doughnut type 3d lighting
                 */
                if (radius3D > 0 && hasSVG) { //radial gradient is not supported in VML
                    innerpercentR = parseInt(innerradius / pieMinRadius * 100, 10);
                    diff50Percent = (100 - innerpercentR) / 2;
                    radius3Dpercent = parseInt(diff50Percent * radius3D / 100, 10);
                    poin2nd = 2 * (diff50Percent - radius3Dpercent);
                    ratioStr = innerpercentR + COMMASTRING + radius3Dpercent + COMMASTRING + poin2nd + COMMASTRING + radius3Dpercent;
                    //loop for all points
                    if (hcJSON.series[0] && hcJSON.series[0].data) {
                        data = hcJSON.series[0].data;
                        for (x = 0, length = data.length; x < length; x += 1) {
                            point = data[x];
                            if (point.color.FCcolor) {
                                point.color.FCcolor.ratio = ratioStr;
                            }
                        }
                    }

                }
            }

        },

        creditLabel : creditLabel,

        eiMethods: {
            sliceDataItem: function (index) {
                var vars = this.jsVars,
                hcObj = vars.hcObj,
                series;

                if (hcObj && hcObj.series &&
                    (series = hcObj.series[0]) && series.data &&
                    series.data[index] && series.data[index].slice) {

                    return series.data[series.xIncrement - 1 - index].slice();
                }
            }
        }
    }, singleSeriesAPI);
    // add legacy function
    chartAPI.pie2d.eiMethods.togglePieSlice =
        chartAPI.pie2d.eiMethods.sliceDataItem;


    /////////////// pie3d ///////////
    // we inherit pie3d for data manipulation
    chartAPI('pie3d', {
        defaultSeriesType : 'pie3d',
        creditLabel : creditLabel,
        getPointColor : function (color, alpha, radius3D) {
            return color;
        },
        // Pie2D (base) has defaultPlotShadow, but 3d does not.
        defaultPlotShadow: 0
    }, chartAPI.pie2d);




    /////////////// Doughnut2d ///////////
    // we inherit Pie2D for data manipulation
    // and change the getPointColor function to get the Doughnut chart color shade
    chartAPI('doughnut2d', {
        //function that produce the point color
        getPointColor : function (color, alpha, radius3D) {
            var colorObj, shadowIntensity, shadowColor, highLightIntensity, highLight;
            color = getFirstColor(color);
            alpha = getFirstAlpha(alpha);
            if (radius3D < 100 && hasSVG) { //radial gradient is not supported in VML
                shadowIntensity = Math.floor((85-0.2*(100-radius3D))*100)/100;
                shadowColor = getDarkColor(color, shadowIntensity);
                highLightIntensity = Math.floor((100-0.5*radius3D)*100)/100;
                highLight = getLightColor(color, highLightIntensity);
                colorObj = {
                    FCcolor : {
                        color : shadowColor + COMMASTRING + highLight+ COMMASTRING + highLight +
                        COMMASTRING + shadowColor,
                        alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                        radialGradient : true
                    }
                };
            }
            else {
                colorObj = {
                    FCcolor : {
                        color : color + COMMASTRING + color,
                        alpha : alpha + COMMASTRING + alpha,
                        ratio : '0,100'
                    }
                };
            }

            return colorObj;
        }
    }, chartAPI.pie2d);


    /////////////// Doughnut3d ///////////
    // we inherit doughnut2d for Doughnut3d
    chartAPI('doughnut3d', {
        defaultSeriesType : 'pie3d',
        // Diughnut2D (base derived from Pie2D) has defaultPlotShadow,
        // but 3D does not.
        getPointColor: chartAPI.pie3d,
        defaultPlotShadow: 0
    }, chartAPI.doughnut2d);


    /////////////// Pareto2d ///////////
    chartAPI('pareto2d', {
        standaloneInit: true,
        point :
        function (chartName, series, data, FCChartObj, HCObj) {

            var itemValue,
                index,
                setColor,
                setAlpha,
                setRatio,
                dataLabel,
                lineAlpha,
                lineThickness,
                lineDashed,
                lineDashLen,
                lineDashGap,
                lineShadowOptions,
                anchorBgColor,
                anchorBgAlpha,
                anchorAlpha,
                anchorBorderColor,
                dashStyle,
                anchorBorderThickness,
                anchorRadius,
                anchorSides,
                toolText,
                countPoint,
                displayValue,
                columnDataObj,
                dataObj,
                colorArr,
                lineColor,
                showLabel,
                pointShadow,
                plotBorderAlpha,
                drawAnchors,
                displayValuePercent,

                // length of the data
                length = data.length,
                sumValue = 0,
                seriesLine = {},
                paletteIndex = HCObj.chart.paletteIndex,
                is3d = /3d$/.test(HCObj.chart.defaultSeriesType),
                isBar = this.isBar,
                setAngle = pluck(360 - FCChartObj.plotfillangle, 90),
                setBorderWidth = pluckNumber(FCChartObj.plotborderthickness, 1),
                isRoundEdges = HCObj.chart.useRoundEdges,
                toolTipSepChar = pluck(FCChartObj.tooltipsepchar, ", "),
                setPlotBorderColor = pluck(FCChartObj.plotbordercolor,
                    defaultPaletteOptions.plotBorderColor[paletteIndex])
                    .split(COMMASTRING)[0],
                setPlotBorderAlpha = FCChartObj.showplotborder == ZEROSTRING  ?
                ZEROSTRING : pluck(FCChartObj.plotborderalpha,
                    FCChartObj.plotfillalpha, HUNDREDSTRING),
                xAxisObj = HCObj.xAxis,
                showCumulativeLine = pluckNumber(FCChartObj.showcumulativeline,
                    1),
                conf = HCObj[FC_CONFIG_STRING],
                axisGridManager = conf.axisGridManager,
                xAxisConf = conf.x,
                showtooltip = FCChartObj.showtooltip != ZEROSTRING,
                dataOnlyArr = [],
                tempLineSeries = [],
                // use3DLighting to show gredient color effect in 3D Column
                // charts
                use3DLighting = pluckNumber(FCChartObj.use3dlighting, 1),
                NumberFormatter = HCObj[FC_CONFIG_STRING].numberFormatter,
                showLineValues = pluckNumber(FCChartObj.showlinevalues,
                    FCChartObj.showvalues),

                plotBorderDashed =  pluckNumber(FCChartObj.plotborderdashed, 0),
                // length of the dash
                seriesDashLen = pluckNumber(FCChartObj.plotborderdashlen, 5),
                // distance between dash
                seriesDashGap = pluckNumber(FCChartObj.plotborderdashgap, 4);

            // Managing plot border color for 3D column chart
            // 3D column chart doesn't show the plotborder by default
            // until we set showplotborder true
            setPlotBorderAlpha = is3d ? (FCChartObj.showplotborder ?
                setPlotBorderAlpha : ZEROSTRING) : setPlotBorderAlpha;
            // Default  plotBorderColor  is FFFFFF for this 3d chart
            setPlotBorderColor = is3d ? pluck(FCChartObj.plotbordercolor,
                '#FFFFFF') : setPlotBorderColor;

            for (index = 0, countPoint = 0; index < length; index += 1) {
                dataObj = data[index];
                // vLine
                if (data[index].vline) {
                    axisGridManager.addVline(xAxisObj, dataObj,
                        countPoint, HCObj);
                }
                else {
                    itemValue = NumberFormatter.getCleanValue(dataObj.value,
                        true);
                    //if valid data then only add the point
                    if (itemValue !== null) {
                        // Save the malid value so that no further
                        // parsePointValue needed
                        dataObj.value = itemValue;
                        dataOnlyArr.push(dataObj)
                        countPoint += 1;
                    }

                }
            }

            length = dataOnlyArr.length;

            //short the data
            dataOnlyArr.sort(function (a, b) {
                return b.value - a.value;
            });

            if (showCumulativeLine) {
                // If line is a dashed line
                lineDashed = pluckNumber(FCChartObj.linedashed, 0);
                // Managing line series color
                lineColor = getFirstColor(pluck(FCChartObj.linecolor,
                    defaultPaletteOptions.plotBorderColor[paletteIndex]));
                // alpha of the line series
                lineAlpha = pluck(FCChartObj.linealpha, 100);
                // length of the dash
                lineDashLen = pluckNumber(FCChartObj.linedashlen, 5);
                // distance between dash
                lineDashGap = pluckNumber(FCChartObj.linedashgap, 4);
                // Thickness of the line
                lineThickness = pluckNumber(FCChartObj.linethickness, 2);
                // Line shadow options is created here once and this object
                // is later passed on to every data-point of the line-series.
                lineShadowOptions = {
                    opacity: lineAlpha / 100
                };

                // Whether to draw the anchors or not
                drawAnchors = pluckNumber(FCChartObj.drawanchors,
                    FCChartObj.showanchors);
                if (drawAnchors === undefined) {
                    drawAnchors = lineAlpha != ZEROSTRING;
                }

                // Anchor cosmetics
                // Thickness of anchor border
                anchorBorderThickness = pluckNumber(
                    FCChartObj.anchorborderthickness, 1);
                // sides of the anchor
                anchorSides = pluckNumber(FCChartObj.anchorsides, 0);
                // radius of anchor
                anchorRadius = pluckNumber(FCChartObj.anchorradius, 3);
                anchorBorderColor = getFirstColor(
                    pluck(FCChartObj.anchorbordercolor, lineColor));
                anchorBgColor = getFirstColor(pluck(FCChartObj.anchorbgcolor,
                    defaultPaletteOptions.anchorBgColor[paletteIndex]));
                anchorAlpha = getFirstAlpha(pluck(FCChartObj.anchoralpha,
                    HUNDREDSTRING));
                // anchorBGalpha should not inherit from anchoralpha.
                // But to replicate flash comented
                anchorBgAlpha = (getFirstAlpha(pluck(FCChartObj.anchorbgalpha,
                    anchorAlpha))* anchorAlpha) / 100;

                // Dash Style
                dashStyle = lineDashed ? getDashStyle(lineDashLen, lineDashGap,
                    lineThickness) : undefined;

                // Create line-series object
                seriesLine = {
                    yAxis: 1,
                    data: [],
                    type: 'line',
                    color: convertColor(lineColor, lineAlpha),
                    lineWidth: lineThickness,
                    marker: {
                        enabled: drawAnchors,
                        fillColor: convertColor(anchorBgColor, anchorBgAlpha),
                        lineColor: convertColor(anchorBorderColor, anchorAlpha),
                        lineWidth: anchorBorderThickness,
                        radius: anchorRadius,
                        symbol: mapSymbolName(anchorSides),
                        startAngle: pluck(FCChartObj.anchorstartangle, 90)
                    }
                };
            }
            else {
                if (FCChartObj.showsecondarylimits !== '1') {
                    FCChartObj.showsecondarylimits = '0';
                }
                if (FCChartObj.showdivlinesecondaryvalue !== '1') {
                    FCChartObj.showdivlinesecondaryvalue = '0';
                }
            }


            // Iterate through all level data
            for (index = 0; index < length; index += 1) {
                // individual data obj
                // for further manipulation
                dataObj = dataOnlyArr[index];
                // we check showLabel in individual data
                // if its set to 0 than we do not show the particular label
                showLabel = pluckNumber(dataObj.showlabel,
                    FCChartObj.showlabels, 1);

                // Label of the data
                // getFirstValue returns the first defined value in arguments
                // we check if showLabel is not set to 0 in data
                // then we take the label given in data, it can be given using
                // label as well as name too
                // we give priority to label if label is not there,
                // we check the name attribute
                // dataLabel = parseUnsafeString(!showLabel ? BLANKSTRING :
                // getFirstValue(dataObj.label, dataObj.name));
                dataLabel = parseUnsafeString(!showLabel ? BLANKSTRING :
                    getFirstValue(dataObj.label, dataObj.name));

                // adding label in HighChart xAxis categories
                // increase category counter by one
                axisGridManager.addXaxisCat(xAxisObj, index, index, dataLabel);
                sumValue += itemValue = dataObj.value;

                // Color of the each data point
                setColor = pluck(dataObj.color, HCObj.colors[index %
                        HCObj.colors.length]) +
                COMMASTRING + (pluckNumber(
                    FCChartObj.useplotgradientcolor, 1) ?
                    getDefinedColor(FCChartObj.plotgradientcolor,
                        defaultPaletteOptions.plotGradientColor[paletteIndex]) :
                    BLANKSTRING);
                // Alpha of the data
                setAlpha = pluck(dataObj.alpha, FCChartObj.plotfillalpha,
                    HUNDREDSTRING);
                // Fill ratio of the data
                setRatio = pluck(dataObj.ratio, FCChartObj.plotfillratio);

                // Used to set alpha of the shadow
                pointShadow = {
                    opacity: setAlpha / 100
                };
                plotBorderAlpha = pluck(dataObj.alpha, setPlotBorderAlpha) +
                    BLANKSTRING;

                //calculate the color object for the set
                colorArr = getColumnColor (setColor, setAlpha, setRatio,
                    setAngle, isRoundEdges, setPlotBorderColor,
                    plotBorderAlpha, isBar, is3d);

                // Finally add the data
                // we call getPointStub function that manage displayValue,
                // toolText and link
                series.data.push(extend2(this.getPointStub(dataObj, itemValue,
                    dataLabel, HCObj), {
                    y : itemValue,
                    shadow: pointShadow,
                    color: colorArr[0],
                    borderColor: colorArr[1],
                    borderWidth: setBorderWidth,
                    use3DLighting : use3DLighting,
                    dashStyle: pluckNumber(dataObj.dashed, plotBorderDashed)
                        == 1 ? getDashStyle(seriesDashLen, seriesDashGap,
                        setBorderWidth) : '',
                    tooltipConstraint : this.tooltipConstraint
                }));

                // Set the maximum and minimum found in data
                // pointValueWatcher use to calculate the maximum and
                // minimum value of the Axis
                this.pointValueWatcher(HCObj, itemValue);

                // If we need we need to show the line series in pareto chart
                if (showCumulativeLine) {
                    // add the data to temp Line series data for farther
                    // calculation
                    tempLineSeries.push({
                        value : sumValue,
                        dataLabel : dataLabel,
                        tooltext : getValidValue(dataObj.tooltext)
                    });
                }
            }
            // set the xAxisConf catCount for further use
            xAxisConf.catCount = length;
            // create the dummy situation so that it work same as DYaxis with
            // percentStacking, create the dummy axis conf object
            if (!conf[1]) {
                conf[1] = {};
            }
            // configure this axis to show this axis values as percent
            conf[1].stacking100Percent = true;

            // Line series on pareto
            if (showCumulativeLine && sumValue > 0) {
                // Iterate through line series and calculate the
                // line series point values
                for (index = 0, length = tempLineSeries.length; index < length;
                        index += 1) {
                    // individual data obj
                    dataObj = tempLineSeries [index];
                    // individual data object of column series
                    columnDataObj = series.data[index];
                    //value upto 2 decimal
                    itemValue = (dataObj.value / sumValue * 100);
                    displayValuePercent =
                        NumberFormatter.percentValue(itemValue);

                    // display value for the line series data point
                    displayValue = columnDataObj.displayValue !== BLANKSTRING ?
                    displayValuePercent : BLANKSTRING;

                    if (showLineValues == 1) {
                        displayValue = displayValuePercent;
                    }
                    if (showLineValues == 0) {
                        displayValue = BLANKSTRING;
                    }

                    dataLabel = dataObj.dataLabel;

                    // Manipulating tooltext of the line series
                    toolText = showtooltip ? (dataObj.tooltext !== undefined ?
                        dataObj.tooltext : ((dataLabel !== BLANKSTRING ?
                            dataLabel  + toolTipSepChar : BLANKSTRING) +
                            displayValuePercent)) : BLANKSTRING;

                    seriesLine.data.push({
                        shadow: lineShadowOptions,
                        y: itemValue,
                        toolText: toolText,
                        displayValue: displayValue,
                        //retrive link from column series
                        link: columnDataObj.link,
                        dashStyle: dashStyle
                    });
                }

                //return series
                return [series, seriesLine];
            }
            else {
                //remove all s axis text
                return series;
            }
        },
        defaultSeriesType : 'column',
        isDual: true,
        creditLabel : creditLabel
    }, singleSeriesAPI);


    /////////////// Pareto3d ///////////
    // we inherit pareto2d
    // and change the defaultSeriesType to column3d to render 3D Column
    chartAPI('pareto3d', {
        defaultSeriesType : 'column3d',
        defaultPlotShadow: 1
    }, chartAPI.pareto2d);


    /////////////// mscolumn2d ///////////
    chartAPI('mscolumn2d', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.mscolumn2dbase);


    /////////////// mscolumn3d ///////////
    // we inherit mscolumn2d
    // and change the defaultSeriesType to column3d to render mscolumn3d chart
    chartAPI('mscolumn3d', {
        defaultSeriesType : 'column3d',
        // Default shadow is visible for 3D variant of MSColumn2D chart
        defaultPlotShadow: 1,
        defaultZeroPlaneHighlighted: false
    }, chartAPI.mscolumn2d);


    /////////////// msbar2d ///////////
    // we inherit mscolumn2d
    // and change the defaultSeriesType to bar to render msbar2d chart
    chartAPI('msbar2d', {
        isBar : true,
        defaultSeriesType : 'bar',
        spaceManager : chartAPI.barbase
    }, chartAPI.mscolumn2d);


    /////////////// msbar2d ///////////
    // we inherit msbar2d to render msbar3d chart
    chartAPI('msbar3d', {
        defaultSeriesType : 'bar3d',
        defaultPlotShadow: 1,
        defaultZeroPlaneHighlighted: false
    }, chartAPI.msbar2d);


    /////////////// msline ///////////
    chartAPI('msline', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.mslinebase);


    /////////////// msline ///////////
    chartAPI('msarea', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.msareabase);


    /***************  STACKED CHARTS  *********/
    //////  stackedcolumn2d  //////
    chartAPI('stackedcolumn2d', {
        isStacked: true
    }, chartAPI.mscolumn2d);


    ////// stackedcolumn3d //////
    chartAPI('stackedcolumn3d', {
        isStacked: true
    }, chartAPI.mscolumn3d);




    ////// stackedbar2d //////
    chartAPI('stackedbar2d', {
        isStacked: true
    }, chartAPI.msbar2d);


    ////// stackedbar3d //////
    chartAPI('stackedbar3d', {
        isStacked: true
    }, chartAPI.msbar3d);


    ////// stackedarea2d  //////
    chartAPI('stackedarea2d', {
        isStacked: true,
        showSum : 0
    }, chartAPI.msarea);

    ///******* NOT OPTIMIZE  ******////////
    chartAPI('marimekko', {
        isValueAbs : true,
        distributedColumns : true,
        isStacked: true,
        xAxisMinMaxSetter : stubFN,
        postSeriesAddition : function (HCObj, FCObj, width, height) {
            var conf = HCObj[FC_CONFIG_STRING],
            total = 0,
            xAxis = HCObj.xAxis,
            volumeXratio = 100 / conf.marimekkoTotal,
            catArr = [],
            series = HCObj.series,
            startPosition = 0,
            plotBorderThickness = pluckNumber(FCObj.chart.plotborderthickness,
                1),
            rotateValues = HCObj.chart.rotateValues,
            rotatePercentVals = pluckNumber(
                FCObj.chart.rotatexaxispercentvalues, 0),
            // this calculation is to properly align the vLine label border
            // with plotbottom
            vLineLabelYOffset = plotBorderThickness * -0.5 -
            (plotBorderThickness % 2 + (rotatePercentVals ? 0 : 4)),
            vLineLabelXOffset = rotatePercentVals ? 3 : 0,
            vLineLabelRotation = rotateValues ? 270 : 0,

            style = extend2({}, HCObj.plotOptions.series.dataLabels.style),
            labelFontSize = parseInt(style.fontSize, 10),
            // For the first y axis
            axisStack = conf[0],
            isVline = !axisStack.stacking100Percent,
            inCanvasStyle = conf.inCanvasStyle,
            numberFormatter = this.numberFormatter,
            axisConfStack,
            length,
            stackArr,
            value,
            catPosition,
            y,
            catObj,
            midposition,
            xdistance,
            endPosition,
            stack;

            conf.isXYPlot = true;
            conf.distributedColumns = true;

            xAxis.min = 0;
            xAxis.max = 100;

            // Remove all grid related conf
            xAxis.labels.enabled = false;
            xAxis.gridLineWidth = INT_ZERO;
            xAxis.alternateGridColor = COLOR_TRANSPARENT;

            axisConfStack = axisStack.stack;

            // Stop interactive legend for marimekko
            FCObj.chart.interactivelegend = '0';

            // Save the ref of the cat labels to set the position
            for (y = 0, length = HCObj.xAxis.plotLines.length;
                y < length; y += 1) {
                catObj = xAxis.plotLines[y];
                if (catObj.isGrid) {
                    // Add the isCat attr so that it will work
                    // like scatter cat label
                    catObj.isCat = true
                    catArr[catObj.value] = catObj;
                }
            }

            if (axisConfStack.floatedcolumn &&
                (stackArr = axisConfStack.floatedcolumn[0])) {
                for (catPosition = 0, length = stackArr.length;
                    catPosition < length; ) {
                    stack = stackArr[catPosition];
                    total += value = (stack.p || 0);
                    xdistance = value * volumeXratio;
                    midposition = startPosition + (xdistance / 2);
                    endPosition = startPosition + xdistance;
                    for (y = 0; y < series.length; y+= 1) {
                        HCObj.series[y].data[catPosition]['_FCX'] =
                        startPosition;
                        HCObj.series[y].data[catPosition]['_FCW'] = xdistance;
                    }

                    // Add the total value
                    if (conf.showStackTotal) {
                        HCObj.xAxis.plotLines.push({
                            value : midposition,
                            width : 0,
                            isVline : isVline,
                            isTrend : !isVline,
                            zIndex: 4,
                            label : {
                                align : POSITION_CENTER,
                                textAlign : vLineLabelRotation,
                                rotation : rotateValues ? 270 : 0,
                                style : style,
                                verticalAlign : POSITION_TOP,
                                offsetScale: isVline ? (value < 0 ? stack.n :
                                    stack.p) : undefined,
                                offsetScaleIndex : 0,
                                y : value < 0 ?
                                (rotateValues === 270 ? 4 : labelFontSize)
                                : -4,
                                x : 0,
                                text : numberFormatter.yAxis(
                                    toPrecision(value, 10))
                            }
                        });
                    }

                    // Position the cat labels
                    if (catArr[catPosition]) {
                        catArr[catPosition].value = midposition;
                        // In case of marimekko charts we need the width
                        // (xdistance) of each column also to render the
                        // horizontal axis. Hence saving here for future use.
                        catArr[catPosition]._weight = xdistance;
                    }

                    catPosition += 1;

                    // Add the stack %
                    if (conf.showXAxisPercentValues && catPosition < length) {
                        HCObj.xAxis.plotLines.push({
                            value : endPosition,
                            width : 0,
                            isVine : true,
                            label : {
                                align : POSITION_CENTER,
                                textAlign :  rotatePercentVals ? POSITION_LEFT
                                : POSITION_CENTER,
                                rotation : rotatePercentVals ? 270 : 0,
                                style : {
                                    color: inCanvasStyle.color,
                                    fontSize : inCanvasStyle.fontSize,
                                    fontFamily : inCanvasStyle.fontFamily,
                                    lineHeight : inCanvasStyle.lineHeight,
                                    border: '1px solid',
                                    borderColor: inCanvasStyle.color,
                                    backgroundColor: '#ffffff',
                                    backgroundOpacity: 1
                                },
                                verticalAlign : POSITION_BOTTOM,
                                y : vLineLabelYOffset,
                                x : vLineLabelXOffset,
                                text : this.numberFormatter.percentValue(
                                    endPosition)
                            },
                            zIndex  : 5
                        });
                    }
                    startPosition = endPosition;
                }
            }
        },
        defaultSeriesType : 'floatedcolumn'
    }, chartAPI.stackedcolumn2d);

    ///// msstackedcolumn2d //////
    chartAPI('msstackedcolumn2d', {
        series: function (FCObj, HCObj, chartName, width, height) {
            var i, len, index, length,
            conf = HCObj[FC_CONFIG_STRING], lineset, totalDataSets = 0,
            series, minDataLength, seriesArr = [], innerDataSet;

            //enable the legend
            HCObj.legend.enabled = Boolean(pluckNumber(FCObj.chart.showlegend, 1))

            if (FCObj.dataset && FCObj.dataset.length > 0) {
                // add category
                this.categoryAdder(FCObj, HCObj);
                //add data series
                for (i = 0, len = FCObj.dataset.length; i < len; i += 1) {
                    if (innerDataSet = FCObj.dataset[i].dataset){
                        for (index = 0, length = innerDataSet.length; index < length; index += 1, totalDataSets += 1) {
                            series = {
                                data : [],
                                stack : i
                            };
                            minDataLength = Math.min(conf.oriCatTmp.length,
                                innerDataSet[index].data && innerDataSet[index].data.length)
                            //add data to the series
                            seriesArr = this.point(chartName, series,
                                innerDataSet[index], FCObj.chart, HCObj, minDataLength, totalDataSets, i);
                            // Turn of shadow for this chart in order to avoid series shadow
                            // overflow.
                            //seriesArr.shadow = false;
                            //push the data at the series array
                            HCObj.series.push(seriesArr);
                        }
                    }
                }

                // Adding lineset to HighChart series
                //if dual then it is the combi series
                if (this.isDual && FCObj.lineset && FCObj.lineset.length > 0) {
                    for (index = 0, length = FCObj.lineset.length; index < length; index += 1, totalDataSets += 1) {
                        series = {
                            data: [],
                            yAxis: 1,
                            type: 'line'
                        };
                        lineset = FCObj.lineset[index];
                        minDataLength = Math.min(conf.oriCatTmp.length,
                            lineset.data && lineset.data.length);

                        HCObj.series.push(chartAPI.msline.point.call(this, "msline", series,
                            lineset, FCObj.chart, HCObj, minDataLength, totalDataSets));
                    }
                }

                ///configure the axis
                this.configureAxis(HCObj, FCObj);
                ///////////Trend-lines /////////////////
                if (FCObj.trendlines) {
                    createTrendLine(FCObj.trendlines, HCObj.yAxis, HCObj[FC_CONFIG_STRING], false, this.isBar);
                }
            }
        }
    }, chartAPI.stackedcolumn2d)


    /*
     * *** Combination Charts ***
     * MSCombi2D
     * MSCombi3D
     * MSColumnLine3D
     * StackedColumn2DLine
     * StackedColumn3DLine
     * MSCombiDY2D
     * MSColumn3DLineDY
     * StackedColumn3DLineDY
     * MSStackedColumn2DLineDY
     */

    /////// mscombi2d ///////
    chartAPI('mscombi2d', {
        standaloneInit: true,
        creditLabel : creditLabel
    }, chartAPI.mscombibase);


    /////// mscombi3d ///////
    chartAPI('mscombi3d', {
        series : chartAPI.mscombi2d.series,
        eiMethods: 'view2D,view3D,resetView,rotateView,getViewAngles,fitToStage'
    },
    chartAPI.mscolumn3d);


    ///// MSColumnLine3D //////
    chartAPI('mscolumnline3d', {}, chartAPI.mscombi3d);


    ///// stackedcolumn2dline //////
    chartAPI('stackedcolumn2dline', {
        isStacked: true,
        stack100percent: 0
    }, chartAPI.mscombi2d);


    ///// stackedcolumn3dline //////
    chartAPI('stackedcolumn3dline', {
        isStacked: true,
        stack100percent: 0
    },
    chartAPI.mscombi3d);

    /// Stacked with dual Y aixs
    ///// mscombidy2d ////////
    chartAPI('mscombidy2d', {
        isDual: true,
        secondarySeriesType: undefined
    }, chartAPI.mscombi2d);


    /////   MSColumn3DLineDY ////////
    chartAPI('mscolumn3dlinedy', {
        isDual: true,
        secondarySeriesType: 'line'
    }, chartAPI.mscolumnline3d);


    /////   StackedColumn3DLineDY ////////
    chartAPI('stackedcolumn3dlinedy', {
        isDual: true,
        secondarySeriesType: 'line'
    }, chartAPI.stackedcolumn3dline);


    ///// msstackedcolumn2dlinedy //////
    chartAPI('msstackedcolumn2dlinedy', {
        isDual: true,
        stack100percent : 0,
        secondarySeriesType: 'line'
    }, chartAPI.msstackedcolumn2d);

    //////////////// ------  End of Combination Charts ----- ////////////


    //////////////******* NOT OPTIMIZE ********/////////////


    ////////////// scroll charts /////////////
    ////scrollcolumn2d////
    chartAPI('scrollcolumn2d', {
        postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        tooltipConstraint : 'plot',
        avgScrollPointWidth : 40
    }, chartAPI.mscolumn2d);

    ////scrollline2d////
    chartAPI('scrollline2d', {
        postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        tooltipConstraint : 'plot',
        avgScrollPointWidth : 75
    }, chartAPI.msline);

    ////scrollarea2d////
    chartAPI('scrollarea2d', {
        postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        tooltipConstraint : 'plot',
        avgScrollPointWidth : 75
    }, chartAPI.msarea);

    ////scrollstackedcolumn2d////
    chartAPI('scrollstackedcolumn2d', {
        postSeriesAddition: function (hcObj, fcObj, width, height) {
            // issue #FCXT-37 fixed
            chartAPI.base.postSeriesAddition.call(this, hcObj, fcObj, width, height);
            chartAPI.scrollbase.postSeriesAddition.call(this, hcObj, fcObj, width, height);
        },
        tooltipConstraint : 'plot',
        //postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        avgScrollPointWidth : 75
    }, chartAPI.stackedcolumn2d);

    ////scrollcombi2d////
    chartAPI('scrollcombi2d', {
        postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        tooltipConstraint : 'plot',
        avgScrollPointWidth : 40
    }, chartAPI.mscombi2d);

    ////scrollcombidy2d////
    chartAPI('scrollcombidy2d', {
        postSeriesAddition: chartAPI.scrollbase.postSeriesAddition,
        tooltipConstraint : 'plot',
        avgScrollPointWidth : 40
    }, chartAPI.mscombidy2d);


    ////////////// XY charts /////////////

    chartAPI('scatter', {
        standaloneInit: true,
        defaultSeriesType: 'scatter',
        defaultZeroPlaneHighlighted: false,
        creditLabel: creditLabel
    }, chartAPI.scatterbase);




    /////   Bubble  ////////
    chartAPI('bubble', {
        standaloneInit: true,
        standaloneInut: true,
        defaultSeriesType: 'bubble',
        point: function (chartName, series, dataset, FCChartObj, HCObj, catLength, seriesIndex) {
            if (dataset.data) {
                var itemValueY, index, drawAnchors, dataObj,
                setColor, setAlpha,
                plotFillAlpha,
                showPlotBorder,
                plotBorderColor,
                plotBorderThickness,
                plotBorderAlpha,
                seriesAnchorBorderColor,
                seriesAnchorSymbol,
                hasValidPoint = false,
                seriesAnchorBorderThickness, seriesAnchorBgColor,
                itemValueX, itemValueZ, pointStub,
                chartTypeConf = chartAPI[chartName],
                // Data array in dataset object
                data = dataset.data,
                dataLength = data.length,
                conf = HCObj[FC_CONFIG_STRING],
                // showValues attribute in individual dataset
                datasetShowValues = pluckNumber(dataset.showvalues, conf.showValues),
                bubbleScale = pluckNumber(FCChartObj.bubblescale, 1),
                negativeColor = pluck(FCChartObj.negativecolor, "FF0000"),
                bubblePlotOptions = HCObj.plotOptions.bubble,
                NumberFormatter = this.numberFormatter,
                //Regratation line
                showRegressionLine = pluckNumber(dataset.showregressionline,
                    FCChartObj.showregressionline, 0);

                bubblePlotOptions.bubbleScale = bubbleScale;

                // Dataset seriesname
                series.name = getValidValue(dataset.seriesname);
                // If showInLegend set to false
                // We set series.name blank
                if (pluckNumber(dataset.includeinlegend) === 0 || series.name === undefined) {
                    series.showInLegend = false;
                }

                // Managing line series markers
                // Whether to drow the Anchor or not
                drawAnchors = Boolean(pluckNumber(dataset.drawanchors , dataset.showanchors , FCChartObj.drawanchors, 1));

                // Plot Border Cosmetics
                plotFillAlpha = pluck(dataset.plotfillalpha, dataset.bubblefillalpha, FCChartObj.plotfillalpha, HUNDREDSTRING);
                showPlotBorder = pluckNumber(dataset.showplotborder, FCChartObj.showplotborder, 1);
                plotBorderColor = getFirstColor(pluck(dataset.plotbordercolor, FCChartObj.plotbordercolor, "666666"));
                plotBorderThickness = pluck(dataset.plotborderthickness, FCChartObj.plotborderthickness, 1);
                plotBorderAlpha = pluck(dataset.plotborderalpha, FCChartObj.plotborderalpha, "95");

                // Anchor cosmetics
                // We first look into dataset then chart obj and then default value.
                seriesAnchorSymbol = 'circle';
                seriesAnchorBorderColor = plotBorderColor;
                seriesAnchorBorderThickness = showPlotBorder == 1 ? plotBorderThickness : 0;
                seriesAnchorBgColor = pluck(dataset.color, dataset.plotfillcolor,
                    FCChartObj.plotfillcolor, HCObj.colors[seriesIndex % HCObj.colors.length]);

                series.marker = {
                    enabled: drawAnchors,
                    fillColor: this.getPointColor(seriesAnchorBgColor, HUNDREDSTRING),
                    lineColor: {
                        FCcolor: {
                            color: seriesAnchorBorderColor,
                            alpha: plotBorderAlpha
                        }
                    },
                    lineWidth: seriesAnchorBorderThickness,
                    symbol: seriesAnchorSymbol
                };

                if (showRegressionLine) {
                    series.events = {
                        hide : this.hideRLine,
                        show : this.showRLine
                    };
                    //regration object used in XY chart
                    //create here to avoid checking always
                    var regrationObj = {
                        sumX : 0,
                        sumY : 0,
                        sumXY : 0,
                        sumXsqure : 0,
                        sumYsqure : 0,
                        xValues : [],
                        yValues : []
                    }, regSeries,
                    showYOnX = pluckNumber(dataset.showyonx, FCChartObj.showyonx, 1),
                    regressionLineColor = getFirstColor(pluck(dataset.regressionlinecolor,
                        FCChartObj.regressionlinecolor, seriesAnchorBgColor)),
                    regressionLineThickness = pluckNumber(dataset.regressionlinethickness,
                        FCChartObj.regressionlinethickness, 1),
                    regressionLineAlpha = getFirstAlpha(pluckNumber(dataset.regressionlinealpha,
                        FCChartObj.regressionlinealpha, 100)),
                    regLineColor = convertColor(regressionLineColor, regressionLineAlpha);
                }

                // Iterate through all level data
                for (index = 0; index < dataLength; index += 1) {
                    // Individual data obj
                    // for further manipulation
                    dataObj = data[index];
                    if (dataObj) {
                        itemValueY = NumberFormatter.getCleanValue(dataObj.y);
                        itemValueX = NumberFormatter.getCleanValue(dataObj.x);
                        itemValueZ = NumberFormatter.getCleanValue(dataObj.z, true);

                        // If value is null we assign
                        if (itemValueY === null) {
                            series.data.push({
                                y: null,
                                x: itemValueX
                            });
                            continue;
                        }

                        hasValidPoint = true;

                        setColor = getFirstColor(pluck(dataObj.color, (dataObj.z < 0 ? negativeColor : seriesAnchorBgColor)));
                        setAlpha = pluck(dataObj.alpha, plotFillAlpha);

                        // Get the point stubs like disPlayValue, tooltext and link
                        pointStub = chartTypeConf
                        .getPointStub(dataObj, itemValueY, itemValueX, HCObj, dataset, datasetShowValues);

                        setColor = pluckNumber(FCChartObj.use3dlighting) === 0 ?
                        setColor : chartTypeConf.getPointColor(setColor, setAlpha);

                        // storing the absolute value of the z-value
                        // (since this will be used to calculate radius which can't be negative)
                        if (itemValueZ !== null) {
                            // getting the larger vaue
                            bubblePlotOptions.zMax = bubblePlotOptions.zMax > itemValueZ ? bubblePlotOptions.zMax : itemValueZ;
                            bubblePlotOptions.zMin = bubblePlotOptions.zMin < itemValueZ ? bubblePlotOptions.zMin : itemValueZ;
                        }

                        // Finally add the data
                        // we call getPointStub function that manage displayValue, toolText and link
                        series.data.push({
                            y: itemValueY,
                            x: itemValueX,
                            z: itemValueZ,
                            displayValue : pointStub.displayValue,
                            toolText : pointStub.toolText,
                            link: pointStub.link,
                            marker : {
                                enabled: drawAnchors,
                                fillColor: setColor,
                                lineColor: {
                                    FCcolor: {
                                        color: seriesAnchorBorderColor,
                                        alpha: plotBorderAlpha
                                    }
                                },
                                lineWidth: seriesAnchorBorderThickness,
                                symbol: seriesAnchorSymbol
                            }
                        });

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                        this.pointValueWatcher(HCObj, itemValueY, itemValueX, showRegressionLine && regrationObj);
                    }
                    else {
                        // add the data
                        series.data.push({
                            y : null
                        });
                    }
                }
                if (showRegressionLine) {
                    regSeries = {
                        type : 'line',
                        color : regLineColor,
                        showInLegend: false,
                        lineWidth : regressionLineThickness,
                        enableMouseTracking : false,
                        marker : {
                            enabled : false
                        },
                        data : this.getRegressionLineSeries(regrationObj, showYOnX, dataLength),
                        zIndex : 0
                    };
                    series = [series, regSeries];
                }
            }

            // If all the values in current dataset is null
            // we will not show its legend
            if (!hasValidPoint) {
                series.showInLegend = false
            }
            return series;
        },

        postSeriesAddition : function (HCObj, FCObj, width, height) {
            var HCChartObj = HCObj.chart,
            FCChartObj = FCObj.chart;

            HCChartObj.hasScroll = pluckNumber(FCChartObj.clipbubbles, 1);
        },

        // Function to create tooltext for individual data points
        getPointStub: function (setObj, value, label, HCObj, dataset, datasetShowValues) {
            var toolText, displayValue, dataLink, HCConfig = HCObj[FC_CONFIG_STRING],
            formatedVal = value === null ? value : HCConfig.numberFormatter.dataLabels(value),
            seriesname, tooltipSepChar = HCConfig.tooltipSepChar;

            //create the tooltext
            if (!HCConfig.showTooltip) {
                toolText = BLANKSTRING;
            }
            // if tooltext is given in data object
            else if (getValidValue(setObj.tooltext) !== undefined) {
                toolText = parseUnsafeString(setObj.tooltext);
            }
            else {//determine the tooltext then
                if (formatedVal === null) {
                    toolText = false;
                } else {
                    if (HCConfig.seriesNameInToolTip) {
                        seriesname = pluck(dataset && dataset.seriesname);
                    }
                    toolText = seriesname ? seriesname + tooltipSepChar : BLANKSTRING;
                    toolText += label ? label + tooltipSepChar : BLANKSTRING;
                    toolText += formatedVal;
                    toolText += setObj.z ? tooltipSepChar + setObj.z : BLANKSTRING;
                }
            }

            //create the displayvalue
            if (!pluckNumber(setObj.showvalue, datasetShowValues, HCConfig.showValues)) {
                displayValue = BLANKSTRING;
            }
            else if (pluck(setObj.name, setObj.label) !== undefined) {
                displayValue = parseUnsafeString(pluck(setObj.name, setObj.label));
            }
            else {//determine the dispalay value then
                displayValue = formatedVal;
            }

            ////create the link
            dataLink = getValidValue(setObj.link);

            return {
                displayValue : displayValue,
                toolText : toolText,
                link: dataLink
            };
        }
    }, chartAPI.scatter);

    var asyncDOMAction = {
        wrapper: [],
        group: [],

        push: function (wrapper, group) {
            this.wraper.push(wrapper);
            this.group.push(group);
        },
        add: function (wrapper, group, delay) {
            setTimeout(function() {
                !wrapper.added && wrapper.add(group);
            }, delay || 0);
        },
        process: function () {

        }
    };

    var zoomPlot = function (chart, startIndex, stopIndex, resetIndex) {
        var optionsStep = chart.stepZoom,
            options = chart.options.chart.stepZoom,
            skipOverlapPoints = options.skipOverlapPoints,
            zoomHistory = optionsStep.zoomHistory,
            currentZLIndex = optionsStep.currentZoomLevelIndex,
            lastZoomHistory,
            pixelsPerPoint = optionsStep.pixelsPerPoint,
            series = chart.series,
            seriesLength = series.length,
            conf = chart.options._FCconf,
            dataLength = optionsStep.maxIndex,
            eventArgs = {},
            width,
            stepping,
            visibleLength,
            pppDistance, // per-point pixel distance
            seriesStart,
            seriesEnd,
            currentZoomConfig,
            scrollRatio,
            plotX,
            seriesPointLength,
            seriesPXLength,
            scrollablePXLength,
            scrollPosition,
            numVisibleLabels = conf.numVisibleLabels,
            labelSteppingDistance = conf.visibleLabelDistance,
            labelStepping,
            zoomedOut = false,
            i;

        if (resetIndex < currentZLIndex) {
            zoomedOut = true;
            currentZLIndex = optionsStep.currentZoomLevelIndex = resetIndex || (resetIndex = 0);
            zoomHistory.splice(currentZLIndex + 1, zoomHistory.length);

            currentZoomConfig = zoomHistory[currentZLIndex];
            stepping = currentZoomConfig.stepping;
            seriesStart = currentZoomConfig.seriesStart;
            pppDistance = currentZoomConfig.perPointPixelDistance;
            scrollRatio = currentZoomConfig.scrollRatio;
            scrollPosition = optionsStep.scrollPosition = currentZoomConfig.scrollPosition;
            startIndex = currentZoomConfig._startIndex;
            stopIndex = currentZoomConfig._stopIndex;

            optionsStep.scrollablePXLength = currentZoomConfig.scrollablePXLength;
        }
        else {
            if (startIndex > stopIndex) {
                var swapper = startIndex;
                startIndex = stopIndex;
                stopIndex = swapper;
            }

            width = chart.plotWidth,
            visibleLength = stopIndex - startIndex,
            pppDistance = width / visibleLength;

            if (numVisibleLabels) {
                labelStepping = mathCeil((stopIndex - startIndex) / numVisibleLabels);
            }
            else if (pppDistance < labelSteppingDistance) {
                labelStepping = Math.ceil(labelSteppingDistance / pppDistance);
            }
            else {
                labelStepping = 1;
            }

            if (pppDistance < pixelsPerPoint) {
                stepping = Math.ceil(pixelsPerPoint / pppDistance);
            }
            else {
                stepping = 1;
            }

            //recalculate perPointPixelDistance
            pppDistance = width / (visibleLength -
                (visibleLength % stepping));

            seriesStart = startIndex % stepping;
            seriesEnd = dataLength - (dataLength % stepping);
            seriesPointLength = seriesEnd - seriesStart;
            seriesPXLength = seriesPointLength * pppDistance;
            scrollRatio = width / seriesPXLength;
            scrollablePXLength = seriesPXLength - width;
            if (scrollablePXLength > 0) {
                scrollPosition = ((startIndex - seriesStart) *
                    pppDistance) / (seriesPXLength - width);
            }
            else {
                scrollPosition = 0
            }

            optionsStep.scrollPosition = scrollPosition;
            optionsStep.scrollablePXLength = scrollablePXLength;

            // Check if no zooming is needed.
            lastZoomHistory = zoomHistory[currentZLIndex];
            if (lastZoomHistory && lastZoomHistory.stepping === stepping &&
                lastZoomHistory.seriesStart === seriesStart &&
                lastZoomHistory.seriesEnd === seriesEnd &&
                lastZoomHistory.perPointPixelDistance === pppDistance) {
                return;
            }

            zoomHistory[(optionsStep.currentZoomLevelIndex = (currentZLIndex += 1))] = {
                seriesStart : seriesStart,
                seriesEnd : seriesEnd,
                stepping : stepping,
                perPointPixelDistance : pppDistance,
                visiblePointDistance : stepping * pppDistance,
                seriesConf : [],
                scrollRatio: scrollRatio,
                scrollPosition: scrollPosition,
                scrollablePXLength: scrollablePXLength,
                _startIndex: startIndex,
                _stopIndex: stopIndex
            };
        }

        var offset,
        j,
        seriesPath = [],
        seriesConf,
        graphPath,
        serie,
        point,
        pointHidden,
        labelHidden,
        labelObj,
        categories = optionsStep.catLabelArr,
        graphic,
        dataLabel,
        pointAttr;

        // Set the label stepping if it is not set already. The stepping distance
        // is already calculated and we simply need to compare with current
        // per-point distance.
        if (numVisibleLabels) {
            if (stopIndex !== undefined && startIndex !== undefined) {
                labelStepping = mathCeil((stopIndex - startIndex) / numVisibleLabels);
            }
            else {
                labelStepping = mathCeil(dataLength / numVisibleLabels);
            }
        }
        else if (labelStepping === undefined) {
            labelStepping = pppDistance < labelSteppingDistance ?
                mathCeil(labelSteppingDistance / pppDistance) : 1;
        }

        for (i = 0; i <= dataLength; i += 1) {

            // Calculate the x-position of the points.
            offset = i - seriesStart;
            plotX = offset * pppDistance;

            // Decide which of the points are to be visible.
            pointHidden = offset < 0 || offset % stepping !== 0;
            labelHidden = offset < 0 || offset % labelStepping !== 0;
            pointAttr = {
                x: plotX,
                visibility: pointHidden ? HIDDEN : VISIBLE
            };

            // Position the category labels and also perform hide/show
            if (categories && (labelObj = categories[i])) {
                labelObj.attr({
                    x: plotX + optionsStep.xDisplacement,
                    visibility: labelHidden ? HIDDEN : VISIBLE
                });
            }

            j = seriesLength;
            while (j--) {
                serie = series[j];
                point = serie.data[i];
                point.plotX = plotX;
                seriesConf = seriesPath[j] || (seriesPath[j] = {
                    path : [],
                    addMove : true,
                    addLine : false,
                    lastMovePoint : [],
                    connectNullData : serie.options.connectNullData
                });
                graphPath = seriesConf.path;

                // Position and control visibility of anchors.
                if ((graphic = point.graphic)) {
                    graphic.attr(pointAttr);
                }

                //datalabels
                if ((dataLabel = point.dataLabel)) {
                    dataLabel.attr(pointAttr);
                }

                // Create graph command
                if(!skipOverlapPoints || !pointHidden) {
                    if (defined(point && point.plotY)) {
                        if (seriesConf.addLine) {
                            graphPath.push(M, seriesConf.lastMovePoint[0], seriesConf.lastMovePoint[1], L);
                            seriesConf.addLine = false;
                        }
                        if (seriesConf.addMove) {
                            seriesConf.addLine = true;
                            seriesConf.addMove = false
                            seriesConf.lastMovePoint[0] = plotX;
                            seriesConf.lastMovePoint[1] = point.plotY;
                        }
                        else {
                            graphPath.push(plotX, point.plotY);
                        }
                    }
                    else if (!seriesConf.connectNullData){
                        seriesConf.addMove = true;
                        seriesConf.addLine = false;
                    }
                }
            }
        }

        for (j = 0; j < seriesLength; j += 1) {
            seriesConf = seriesPath[j] || (seriesPath[j] = {
                path : [M],
                isLastMoveComand : true
            });
            graphPath = seriesConf.path;
            series[j].graphLine.attr({
                d : graphPath
            });
            series[j].graphPath = graphPath;
        }

        optionsStep.scroller.setScrollRatio(scrollRatio);
        optionsStep.scroller.setScrollPosition(scrollPosition);

        if (!currentZLIndex) { // when reset
            currentZLIndex = 0;
            startIndex = 0;
            stopIndex = (categories && (categories.length - 1)) || 0;
        }
        // Raise "Zoomed" event
        eventArgs.reset = (currentZLIndex === 0);
        eventArgs.level = currentZLIndex;
        eventArgs.startIndex = startIndex;
        eventArgs.startLabel = categories && categories[startIndex].textStr;
        eventArgs.endIndex = stopIndex;
        eventArgs.endLabel = categories && categories[stopIndex].textStr;
        eventArgs.action = zoomedOut ? 'out' : 'in';

        lib.raiseEvent('zoomed', eventArgs,
                chart.options.instanceAPI.chartInstance, [
                    chart.options.instanceAPI.chartInstance.id,
                    eventArgs.startIndex,
                    eventArgs.stopIndex,
                    eventArgs.startLabel,
                    eventArgs.stopLabel,
                    eventArgs.action,
                    eventArgs.level
                ]);

        global.raiseEvent(zoomedOut ? 'zoomedout' : 'zoomedin', eventArgs,
                chart.options.instanceAPI.chartInstance);
    },

    stepZoomNormalizeEvent = function (event, optionsStep) {
        var zoomHistory = optionsStep.zoomHistory,
            currentZLIndex = optionsStep.currentZoomLevelIndex,
            zoomLevelObj = zoomHistory[currentZLIndex],
            pppDistance = zoomLevelObj.perPointPixelDistance,
            selectionLeft = event.selectionLeft,
            selectionWidth = event.selectionWidth,
            maxIndex = optionsStep.maxIndex,
            min,
            max;

        //get the px length
        min = (zoomLevelObj.scrollablePXLength * zoomLevelObj.scrollPosition) + selectionLeft;
        max = min + selectionWidth;
        min = mathFloor(min / pppDistance);
        max = mathCeil(max / pppDistance);
        if (max > maxIndex) {
            max = maxIndex;
        }
        return {
            max: max,
            min: min
        };
    },

    createPin = function (pinStart, pinWidth, limits, options) {
        var chart = this,
            normalizeMouseEvent = chart.tracker.normalizeMouseEvent,
            stepOptions = chart.options.chart.stepZoom,
            renderer = chart.renderer,
            plotLeft = chart.plotLeft,
            plotTop = chart.plotTop,
            plotWidth = chart.plotWidth,
            plotHeight = chart.plotHeight,

            paneBorderWidth = stepOptions.pinPaneBorderThickness,
            // Create clipping rectangle to show selection
            clipRect = renderer.clipRect(plotLeft + pinStart, plotTop, pinWidth,
                plotHeight),
            group,
            background,
            ghostLines = [],
            dragOffset = 0; // shared during drag event.

        // Create a group to contain selection background and the ghost lines.
        group = renderer.g('group')
        .attr({
            x: 0,
            y: 0,
            zIndex: 2
        })
        .clip(clipRect)
        .add();

        // Create selection background rectangle
        background = renderer.rect(plotLeft + pinStart, plotTop - paneBorderWidth / 2, pinWidth, plotHeight + paneBorderWidth, 0)
        .attr({
            stroke: stepOptions.pinPaneBorderColor,
            fill: stepOptions.pinPaneBgColor,
            strokeWidth: paneBorderWidth,
            isOverlay: true
        })
        .css({
            cursor: 'w-resize'
        })
        .add(group);

        each(chart.series, function (serie) {
            var serieOptions = serie.options,
            strokeColor = serieOptions.color,
            strokeWidth = mathMax(serieOptions.lineWidth +
                stepOptions.pinLineThicknessDelta, 1),

            ghost = renderer.path(serie.graphPath).attr({
                stroke: strokeColor,
                'stroke-width': strokeWidth,
                'stroke-linecap': 'round',
                dashstyle: isIE && !hasSVG ? // separate VML and SVG dashStyle
                getDashStyle(strokeWidth + 1, strokeWidth, strokeWidth) :
                getDashStyle(strokeWidth, strokeWidth + 1, strokeWidth),
                visibility: serie.visible ? VISIBLE : HIDDEN
            });

            ghostLines.push(ghost);
            ghost.translate(serie.group.attr('translateX'), plotTop).add(group);
        });

        addEvent(background.element, 'dragstart drag', function (e) {
            var eventType = e.type;
            e = normalizeMouseEvent(getTouchEvent(e));

            if (eventType === 'dragstart') {
                dragOffset = e.pageX - (group.attr('translateX') || 0);
                return;
            }

            var x = e.pageX - dragOffset,
            offsetStart = x + pinStart;

            if (offsetStart < 0) {
                x = -pinStart;
            }
            else if ((offsetStart + pinWidth) > plotWidth) {
                x = plotWidth - pinWidth - pinStart;
            }
            group.translate(x);
        });

        lib.raiseEvent('pinned', {
            startIndex: limits.min,
            endIndex: limits.max,
            startLabel: chart.stepZoom.catLabelArr[limits.min].textStr,
            endLabel: chart.stepZoom.catLabelArr[limits.max].textStr
        }, chart.options.instanceAPI.chartInstance,[
            chart.options.instanceAPI.chartInstance.id,
            limits.min,
            limits.max,
            chart.stepZoom.catLabelArr[limits.min].textStr,
            chart.stepZoom.catLabelArr[limits.max].textStr
        ]);

        return {
            destroy: function () {
                each(ghostLines, function (line) {
                    line.destroy();
                });
                background.destroy();
                group.destroy();
            }
        };

    },

    zoomSelectionEvent = function (event) {
        var chart = this,
            optionsStep = chart.stepZoom,
            stepZoom = chart.options.chart.stepZoom,
            selectionStart = event.selectionLeft,
            currentZoomLevelIndex,
            limits = stepZoomNormalizeEvent(event, optionsStep);

        if (optionsStep.pinActive) {
            if (optionsStep.pinComposite) {
                optionsStep.pinComposite.destroy();
            }
            optionsStep.pinComposite = createPin.call(chart,  selectionStart,
                event.selectionWidth, limits, optionsStep);
            return;
        }

        if (limits.max > limits.min) {
            zoomPlot(chart, limits.min, limits.max);
        }
        currentZoomLevelIndex = optionsStep.currentZoomLevelIndex;

        if (!optionsStep.zoButton) {
            optionsStep.zoButton = chart.addButton({
                onclick: function () {
                    var currentZoomLevelIndex = optionsStep.currentZoomLevelIndex - 1;
                    zoomPlot(chart, undefined, undefined,
                        currentZoomLevelIndex);

                    optionsStep.pinButton && optionsStep.pinActive &&
                        optionsStep.pinButton.onClick();

                    (currentZoomLevelIndex <= 1) &&
                    optionsStep.resetButton.hide();

                    (optionsStep.currentZoomLevelIndex == 0) &&
                    optionsStep.zoButton.hide();
                },
                tooltip: stepZoom.showToolBarButtonTooltext &&
                stepZoom.btnZoomOutTooltext,
                symbol: 'zoomOutIcon'
            });
        }

        optionsStep.zoButton[currentZoomLevelIndex === 0 ? 'hide' : 'show']();

        if (!optionsStep.resetButton) {
            optionsStep.resetButton = chart.addButton({
                onclick: function () {
                    zoomPlot(chart, undefined, undefined, 0);
                    optionsStep.resetButton && optionsStep.resetButton.hide();
                    optionsStep.zoButton && optionsStep.zoButton.hide();

                    optionsStep.pinButton && optionsStep.pinActive &&
                        optionsStep.pinButton.onClick();

                    lib.raiseEvent('resetzoomchart', {},
                        chart.options.instanceAPI.chartInstance,[
                            chart.options.instanceAPI.chartInstance.id
                        ]);
                },
                tooltip: stepZoom.showToolBarButtonTooltext &&
                stepZoom.btnResetChartTooltext,
                symbol: 'resetIcon',
                symbolFill: NONE,
                hoverSymbolFill: NONE
            });
        }

        optionsStep.resetButton[chart.stepZoom.currentZoomLevelIndex > 1 ?
        'show' : 'hide']();
    };

// - ZoomLine Chart ------------------------------------------------------------
    // Add events to the legacy event list
    extend(lib.eventList, {
        zoomed: 'FC_Zoomed',
        pinned: 'FC_Pinned',
        resetzoomchart: 'FC_ResetZoomChart'
    });

    chartAPI('zoomline', {
        standaloneInit: true,
        hasVDivLine : true,
        defaultSeriesType : 'stepzoom',
        canvasborderthickness: 1,
        tooltipConstraint : 'plot',

        chart: function (w, h) {

            var data = this.dataObj,
            chartOptions = data.chart,
            stepZoom,
            hc;

            // If its a logAxis
            if (getValidValue(this.dataObj.chart.axis, BLANKSTRING)
                    .toLowerCase() == 'log') {

                extend2(this, chartAPI.logbase);
            }

            hc = this.base.chart.apply(this, arguments);
            stepZoom = hc.chart.stepZoom;

            if (!getValidValue(chartOptions.caption) &&
                !getValidValue(chartOptions.subcaption)) {
                hc.chart.marginTop += 15;
            }


            hc.chart.animation = false;
            (hc.plotOptions || (hc.plotOptions = {})) &&
            (hc.plotOptions.series || (hc.plotOptions.series = {}))
            hc.plotOptions.series.animation = false;

            // Add selection event handlers
            hc.chart.nativeZoom = false;
            hc.chart.events.selection = zoomSelectionEvent;
            //hc.tooltip.crosshairs = true;

            if (!hc.callbacks) {
                hc.callbacks = [];
            }
            hc.callbacks.push(function () {
                var chart = this,
                    renderer = chart.renderer,
                    optionsStep = chart.stepZoom,
                    pinButton = optionsStep.pinButton;
                if (!pinButton && chart.options.chart.stepZoom.allowPinMode) {
                    pinButton = optionsStep.pinButton = chart.addButton({
                        onclick: function () {
                            if ((optionsStep.pinActive = !optionsStep.pinActive)) {
                                pinButton.tooltipOptions.point.toolText =
                                stepZoom.showToolBarButtonTooltext &&
                                'Switch to Zoom Mode';
                            }
                            else {
                                if (optionsStep.pinComposite) {
                                    optionsStep.pinComposite =
                                    optionsStep.pinComposite.destroy();
                                }
                                pinButton.tooltipOptions.point.toolText =
                                stepZoom.showToolBarButtonTooltext &&
                                stepZoom.btnSwitchToPinModeTooltext;
                            }
                            pinButton.activate(optionsStep.pinActive);

                            global.raiseEvent('pinmodestatechange', {
                                state: optionsStep.pinActive
                            }, chart.options.instanceAPI.chartInstance);
                        },
                        tooltip: stepZoom.showToolBarButtonTooltext &&
                        stepZoom.btnSwitchToPinModeTooltext,
                        symbol: 'pinModeIcon'
                    });
                }

                if (!renderer.forExport) {
                    renderer.batchCapacity = 50;
                    renderer.batchSpeed = 1;
                    // set simple addition mode
                    renderer.simpleAppend = true;
                    // process pending graphics
                    renderer.processBatch();
                }
            });

            return hc;
        },

        xAxisMinMaxSetter: function () {

            // execute super function before doing adjustments for ZoomLine
            this.base.xAxisMinMaxSetter.apply(this, arguments);

            var hcObj = this.hcJSON,
                conf = hcObj[FC_CONFIG_STRING],
                xAxis = hcObj.xAxis,
                xAxisConf = conf.x;

                xAxis.min = 0;
                xAxis.max = xAxisConf.catCount - 1;

        },

        series : function (FCObj, HCObj, chartName) {
            var index, length, conf = HCObj[FC_CONFIG_STRING],
            series, seriesArr,
            FCChartObj = FCObj.chart, dataFound;

            // Enable the legend
            HCObj.legend.enabled = Boolean(pluckNumber(FCChartObj.showlegend, 1));

            HCObj.chart.valuePosition =
                    pluck(FCChartObj.valueposition, 'auto').toLowerCase();

            if (FCObj.dataset && FCObj.dataset.length > 0) {
                // add category
                if (FCObj.categories && FCObj.categories[0] && FCObj.categories[0].category){
                    this.categoryAdder(FCObj, HCObj);
                }
                else {
                    return; // when no category, it should reflect no-data-to-display
                }
                //add data series
                for (index = 0, length = FCObj.dataset.length; index < length; index += 1) {
                    if (FCObj.dataset[index].data || true) {
                        series = {
                            data : []
                        };
                        //add data to the series
                        HCObj.series.push(this.point(chartName, series,
                            FCObj.dataset[index], FCObj.chart, HCObj, conf.oriCatTmp.length,
                            index));
                        dataFound = true;
                    }
                }
                if (dataFound) {
                    ///configure the axis
                    this.configureAxis(HCObj, FCObj);
                    ///////////Trend-lines /////////////////
                    //for log it will be done in configureAxis
                    if (FCObj.trendlines && !this.isLog) {
                        createTrendLine (FCObj.trendlines, HCObj.yAxis, conf,
                            false, this.isBar);
                    }
                }

            }
        },

        point: function (chartName, series, dataset, FCChartObj, HCObj, catLength, seriesIndex) {

            //Store attributes
            var iapi = this,
                seriesName,
                lineColorDef,
                lineAlphaDef,
                lineThickness,
                lineDashed,
                lineDashLen,
                lineDashGap,
                showValues,
                dataLabel,
                drawAnchors,
                setAnchorSidesDef,
                setAnchorRadiusDef,
                setAnchorBorderColorDef,
                setAnchorBorderThicknessDef,
                setAnchorBgColorDef,
                setAnchorAlphaDef,
                setAnchorBgAlphaDef,
                pointAnchorEnabled,

                dataObj,
                lineColor,
                lineAlpha,
                compactMode,
                dataSeparator,
                displayValue,
                index,
                data = dataset.data,
                length = data && data.length || 0,

                // HighChart configuration object
                conf = HCObj[FC_CONFIG_STRING],
                seriesType = pluck(series.type, iapi.defaultSeriesType),
                // Check the chart is a stacked chart or not
                isStacked = HCObj.plotOptions[seriesType] &&
                        HCObj.plotOptions[seriesType].stacking,
                // 100% stacked chart takes absolute values only
                isValueAbs = pluck(iapi.isValueAbs, conf.isValueAbs, false),
                // showValues attribute in individual dataset
                seriesYAxis = pluckNumber(series.yAxis, 0),
                NumberFormatter = iapi.numberFormatter,
                showShadow = pluckNumber(FCChartObj.showshadow, 1);


            //Whether data is provided in compact mode
            compactMode = pluckNumber(FCChartObj.compactdatamode, 0);
            //If data is provided in compact mode, separator character
            dataSeparator = pluck(FCChartObj.dataseparator, "|");

            seriesName = pluck(dataset.seriesname, BLANKSTRING);

            // Line cosmetics attributes
            lineColorDef = getFirstColor(pluck(dataset.color,
                    FCChartObj.linecolor,
                    HCObj.colors[seriesIndex % HCObj.colors.length]));
            lineAlphaDef = pluck(dataset.alpha, FCChartObj.linealpha, HUNDREDSTRING);
            lineThickness = pluckNumber(dataset.linethickness,
                    FCChartObj.linethickness, 2);
            lineDashed = Boolean(pluckNumber(dataset.dashed,
                    FCChartObj.linedashed, 0));
            lineDashLen = pluckNumber(dataset.linedashlen,
                    FCChartObj.linedashlen, 5);
            lineDashGap = pluckNumber(dataset.linedashgap,
                    FCChartObj.linedashgap, 4);

            //Data set anchors
            showValues = pluckNumber(dataset.showvalues, FCChartObj.showvalues);
            drawAnchors = pluckNumber(dataset.drawanchors, dataset.showanchors,
                    FCChartObj.drawanchors, FCChartObj.showanchors);

            // Anchor cosmetics
            // We first look into dataset then chart obj and then default value.
            setAnchorSidesDef = pluckNumber(dataset.anchorsides,
                FCChartObj.anchorsides, 0);
            setAnchorRadiusDef = pluckNumber(dataset.anchorradius,
                FCChartObj.anchorradius, 3);
            setAnchorBorderColorDef = getFirstColor(pluck(dataset.anchorbordercolor,
                FCChartObj.anchorbordercolor, lineColorDef));
            setAnchorBorderThicknessDef = pluckNumber(dataset.anchorborderthickness,
                FCChartObj.anchorborderthickness, 1);
            setAnchorBgColorDef = getFirstColor(pluck(dataset.anchorbgcolor,
                FCChartObj.anchorbgcolor, lineColorDef));
            setAnchorAlphaDef = pluck(dataset.anchoralpha, FCChartObj.anchoralpha,
                HUNDREDSTRING);
            setAnchorBgAlphaDef = pluck(dataset.anchorbgalpha, FCChartObj.anchorbgalpha,
                setAnchorAlphaDef);

            pointAnchorEnabled = drawAnchors === undefined ?
                    lineAlphaDef != 0 : !!drawAnchors;

            //set the marker attr at series
            series.marker = {
                enabled: pointAnchorEnabled,
                fillColor: {
                    FCcolor: {
                        color: setAnchorBgColorDef,
                        alpha: ((setAnchorBgAlphaDef * setAnchorAlphaDef) / 100) + BLANKSTRING
                    }
                },
                lineColor: {
                    FCcolor: {
                        color: setAnchorBorderColorDef,
                        alpha: setAnchorAlphaDef + BLANKSTRING
                    }
                },
                lineWidth: setAnchorBorderThicknessDef,
                radius: setAnchorRadiusDef,
                symbol: mapSymbolName(setAnchorSidesDef)
            };

            series.name = seriesName;

            // Set the line color and alpha to
            // HC seris obj with FusionCharts color format using FCcolor obj
            series.color = {
                FCcolor: {
                    color: lineColorDef,
                    alpha: lineAlphaDef
                }
            };
            series.shadow = {
                opacity: showShadow ? lineAlphaDef / 100 : 0
            }
            // Set the line thickness (line width)
            series.lineWidth = lineThickness;
            // Create line dash
            // Using dashStyle of HC
            series.dashStyle = lineDashed ?
                    getDashStyle(lineDashLen, lineDashGap, lineThickness) :
                    undefined;

            // If includeInLegend set to false
            // We set series.name blank
            if (pluckNumber(dataset.includeinlegend) === 0 ||
                series.name === undefined || (lineAlphaDef == 0 &&
                    drawAnchors !== 1)) {
                series.showInLegend = false;
            }

            if (data) {
                //Based on whether data is in compact mode or not, take action
                if (compactMode) {
                    //Split the values on separator
                    var arrValues = data.split(dataSeparator);

                    //Iterate and add to data model.
                    for (index = 0; index < catLength; index += 1) {
                        //Now, get value.
                        var itemValue = NumberFormatter.getCleanValue(arrValues[index]);
                        if (itemValue === null) {
                            // add the data
                            series.data.push({
                                y : null
                            });
                            continue;
                        }
                        //create the displayvalue
                        dataLabel = NumberFormatter.dataLabels(itemValue);
                        displayValue = showValues ? dataLabel : BLANKSTRING

                        // Finally add the data
                        // we call getPointStub function that manage displayValue, toolText and link
                        series.data.push({
                            y : itemValue,
                            displayValue : displayValue,
                            toolText : dataLabel
                        });

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                        this.pointValueWatcher(HCObj, itemValue, seriesYAxis,
                            isStacked, index, 0, seriesType);
                    }
                } else {
                    for (index = 0; index < catLength; index += 1) {

                        // Individual data obj
                        // for further manipulation
                        dataObj = data[index];
                        if (dataObj) {
                            itemValue = NumberFormatter.getCleanValue(dataObj.value, isValueAbs);

                            if (itemValue === null) {
                                // add the data
                                series.data.push({
                                    y : null
                                });
                                continue;
                            }
                            // In compact mode, line/anchor segment cosmetics
                            // are not required

                            // Managing line series cosmetics
                            // Color of the line
                            lineColor = getFirstColor(pluck(dataObj.color, lineColorDef));

                            // alpha
                            lineAlpha = pluck(dataObj.alpha, lineAlphaDef);

                            pointAnchorEnabled = drawAnchors === undefined ?
                            lineAlpha != 0 : !!drawAnchors;

                            //create the displayvalue
                            dataLabel = getValidValue(parseUnsafeString(dataObj.tooltext), NumberFormatter.dataLabels(itemValue));
                            displayValue = showValues ? dataLabel : BLANKSTRING

                            // Finally add the data
                            // we call getPointStub function that manage displayValue, toolText and link
                            series.data.push(
                            {
                                displayValue: displayValue,
                                toolText: dataLabel,
                                y : itemValue,
                                color: {
                                    FCcolor: {
                                        color: lineColor,
                                        alpha: lineAlpha
                                    }
                                }
                            });

                            // Set the maximum and minimum found in data
                            // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                            this.pointValueWatcher(HCObj, itemValue, seriesYAxis,
                                isStacked, index, 0, seriesType);
                        }
                        else {
                            // add the data
                            series.data.push({
                                y : null
                            });
                        }
                    }
                }
            }

            return series;
        },

        categoryAdder : function(FCObj, HCObj) {
            var index,
                countCat = 0,
                fontSize,
                conf = HCObj[FC_CONFIG_STRING],
                xAxisObj = HCObj.xAxis, dataLabel, axisConf = conf.x,
                FCChartObj = FCObj.chart,
                HCChartObj = HCObj.chart,

                showLabels = pluckNumber(FCChartObj.showlabels, 1),
                pixelsperpoint = pluckNumber(FCChartObj.pixelsperpoint, 15);

            HCChartObj.zoomType = 'x';
            xAxisObj.maxZoom = 2;

            // prevent negative ppp
            if (pixelsperpoint <= 0) {
                pixelsperpoint = 15;
            }

            conf.pixelsperpoint = pixelsperpoint;

            if (FCObj.categories && FCObj.categories[0] && FCObj.categories[0].category) {
                //update the font relate attr in HC cat
                if (FCObj.categories[0].font) {
                    HCObj.xAxis.labels.style.fontFamily  = FCObj.categories[0].font;
                }
                if ((fontSize = pluckNumber(FCObj.categories[0].fontsize)) !== undefined) {
                    if (fontSize < 1) {
                        fontSize = 1;
                    }
                    HCObj.xAxis.labels.style.fontSize  = fontSize + PXSTRING;
                    setLineHeight(HCObj.xAxis.labels.style);
                }
                if (FCObj.categories[0].fontcolor) {
                    HCObj.xAxis.labels.style.color  = FCObj.categories[0].fontcolor.
                    split(COMMASTRING)[0].replace(/^\#?/, "#");
                }
                //temp object for cat text in data tooltext
                var oriCatTmp = HCObj[FC_CONFIG_STRING].oriCatTmp,
                categories = FCObj.categories[0],
                category = categories.category;

                // Whether data is provided in compact mode
                var compactMode = pluckNumber(FCChartObj.compactdatamode, 0),
                    //If data is provided in compact mode, separator character
                    dataSeparator = pluck(FCChartObj.dataseparator, "|");

                //Based on whether data is in compact mode or not, take action
                if (compactMode) {
                    //Split the values on separator
                    var categoryArr = category.split(dataSeparator);
                    //Iterate and add to data model.
                    for (index = 0; index < categoryArr.length; index += 1) {
                        dataLabel = parseUnsafeString(getFirstValue(categoryArr[index],
                            categoryArr[index].name));
                        //axisGridManager.addXaxisCat(xAxisObj, countCat, countCat, dataLabel);
                        oriCatTmp[countCat] = dataLabel;
                        countCat += 1;
                    }
                } else {
                    for (index = 0; index < category.length; index += 1) {
                        if (!category[index].vline) {
                            dataLabel = (category[index].showlabel === '0') ? BLANKSTRING :
                            parseUnsafeString(getFirstValue(FCObj.categories[0].category[index].label,
                                FCObj.categories[0].category[index].name));

                            oriCatTmp[countCat] = getFirstValue(parseUnsafeString(
                                FCObj.categories[0].category[index].tooltext), dataLabel);
                            countCat += 1;
                        }
                        // Note that vLines are not processed for ZoomLine
                        // charts as they are not supported. Hence, calls to
                        // axisGridManager.addVline has been removed
                    }
                }
                if (showLabels) {
                    xAxisObj.categories = oriCatTmp;
                }
            }

            var lastIndex = (countCat - 1) || 1;
            conf.displayStartIndex = pluckNumber(FCChartObj.displaystartindex, 1) - 1;
            conf.displayEndIndex = pluckNumber(FCChartObj.displayendindex, countCat || 2) - 1;
            if (conf.displayStartIndex < 0 || conf.displayStartIndex >= lastIndex) {
                conf.displayStartIndex = 0;
            }
            if (conf.displayEndIndex <= conf.displayStartIndex || conf.displayEndIndex > lastIndex) {
                conf.displayEndIndex = lastIndex;
            }
            axisConf.catCount = countCat;
            HCChartObj.hasScroll = true;
            //set stepZoom attributes
            var stepZoom = HCChartObj.stepZoom = {};
            stepZoom.pixelsperpoint = conf.pixelsperpoint;
            stepZoom.displayStartIndex = conf.displayStartIndex;
            stepZoom.displayEndIndex = conf.displayEndIndex;
            stepZoom.scrollColor = getFirstColor(pluck(FCChartObj.scrollcolor,
                defaultPaletteOptions.altHGridColor[HCObj.chart.paletteIndex]));
            stepZoom.scrollHeight = pluckNumber(FCChartObj.scrollheight, 16);
            stepZoom.scrollPadding = pluckNumber(FCChartObj.scrollpadding,
                HCObj.chart.plotBorderWidth);
            stepZoom.scrollBtnWidth = pluckNumber(FCChartObj.scrollbtnwidth,
                FCChartObj.scrollheight, 16);
            stepZoom.scrollBtnPadding = pluckNumber(FCChartObj.scrollbtnpadding, 0);
            //add the space for scroller
            conf.marginBottomExtraSpace += stepZoom.scrollPadding + stepZoom.scrollHeight;
        },

        postSeriesAddition: function (HCObj, FCObj, width, height) {
            var FCChartObj = FCObj.chart,
            HCChartObj = HCObj.chart,
            stepZoom = HCChartObj.stepZoom,
            paletteIndex = this.paletteIndex,
            canvasBorderColor = defaultPaletteOptions.canvasBorderColor[paletteIndex];

            //Whether pin mode should be allowed
            if (stepZoom) {
                stepZoom.allowPinMode = pluckNumber(FCChartObj.allowpinmode, 1);
                stepZoom.skipOverlapPoints =
                !!pluckNumber(FCChartObj.skipoverlappoints, 1);
                //Tool-text for buttons
                stepZoom.showToolBarButtonTooltext = pluckNumber(FCChartObj.showtoolbarbuttontooltext, 1);
                stepZoom.btnResetChartTooltext = pluck(FCChartObj.btnresetcharttooltext, 'Reset Zoom');
                stepZoom.btnZoomOutTooltext = pluck(FCChartObj.btnzoomouttooltext, 'Zoom out one level');
                stepZoom.btnSwitchToZoomModeTooltext = pluck(FCChartObj.btnswitchtozoommodetooltext,
                    'Select a subset of data to zoom into it for detailed view');
                stepZoom.btnSwitchToPinModeTooltext = pluck(FCChartObj.btnswitchtopinmodetooltext,
                    'Switch to Pin Mode');


                //Pin mode line thickness delta
                stepZoom.pinLineThicknessDelta = pluckNumber(FCChartObj.pinlinethicknessdelta, 0);
                //Pin pane color
                stepZoom.pinPaneBorderThickness = pluckNumber(FCChartObj.pinpaneborderthickness, 1)
                stepZoom.pinPaneBorderColor = convertColor(pluck(FCChartObj.pinpanebordercolor,
                    canvasBorderColor), pluckNumber(FCChartObj.pinpaneborderalpha, 15));
                stepZoom.pinPaneBgColor = convertColor(pluck(FCChartObj.pinpanebgcolor,
                    canvasBorderColor), pluckNumber(FCChartObj.pinpanebgalpha, 15));
            }
        },

        placeHorizontalAxis :  function (axisObj, axisConf, hcJSON,
            fcJSON, width, maxHeight, minCanWidth) {

            var conf = hcJSON[FC_CONFIG_STRING],

            textObj, plotObj, index, titleText, labelObj,
            lastUsedStyle, minWidth, temp, maxStaggerLines, tempLabelWidth,
            labelTextWidth, labelTextPadding = 4, autoWrapLimit,

            rotation = 0, titleHeightUsed = 0, labelHeight = 10, stepValue = 1,
            labelY = 0, nameLineHeight = 0, catCount = 0, testStr = 'W',

            noWrap = false, isStagger = false, isNone = false,

            isStepped = pluckNumber(fcJSON.chart.labelstep, 0),
            numVisLabels = pluckNumber(fcJSON.chart.numvisiblelabels, 0),

            labelDisplay = axisConf.labelDisplay,
            rotateLabels = axisConf.rotateLabels,
            labelPadding = axisConf.horizontalLabelPadding,

            marginBottomExtraSpace = conf.marginBottomExtraSpace,
            availableSpaceLeft = hcJSON.chart.marginLeft,
            availableSpaceRight = hcJSON.chart.marginRight,

            SmartLabel = conf.smartLabel,
            pixelsperpoint = conf.pixelsperpoint,

            catLen = axisConf.catCount,
            slantLabels = axisConf.slantLabels,
            unitWidth = width / (axisObj.max - axisObj.min),

            tedendHeight = 0, oppTrendHeight = 0, labelSize = {
                w: 0,
                h: 0
            };

            if (axisObj.labels.style) {
                lastUsedStyle = axisObj.labels.style;
                SmartLabel.setStyle(lastUsedStyle);
                temp = SmartLabel.getOriSize(testStr);
                labelHeight = temp.height;
                minWidth = temp.width + labelTextPadding;
                autoWrapLimit = SmartLabel.getOriSize("WWW").width + labelTextPadding;
            }

            var axisMin, axisMax, labelEdge, leftModify, rightModify, excessWidth, i,
            plotLinesArr, plotBandsArr, gridLinesArr = [], nonGridLinesArr = [],
            reductionFactor, firstDifference = 0, lastDifference = 0, lastGridIndex,
            gridLinesLen, perCatWidth, canvasLeftSpace, canvasRightSpace,
            totalDifference, length, xAxisNamePadding = axisConf.horizontalAxisNamePadding, labelSpace = 0,
            staggerLines = axisConf.staggerLines, bottomSpace = tedendHeight, chartPlotWidth,
            widthToAdd, padWidth;

            if (axisObj.title && axisObj.title.text != BLANKSTRING) {
                lastUsedStyle = axisObj.title.style;
                SmartLabel.setStyle(lastUsedStyle);
                nameLineHeight = SmartLabel.getOriSize(testStr).height;
                //now get the title space
                axisObj.title.rotation = 0;
                titleText = SmartLabel.getSmartText(axisObj.title.text, width, maxHeight);
                titleHeightUsed = titleText.height;
            }

            if (hcJSON.chart.marginLeft != parseInt(fcJSON.chart.chartleftmargin, 10)) {
                leftModify = true;
            }
            if (hcJSON.chart.marginRight != parseInt(fcJSON.chart.chartrightmargin, 10)) {
                rightModify = true;
            }

            // if the chartmargin is to be changed to accomodate the first and last labels
            // then excessWidth is the limit upto which the total chartmargins can be changed.
            excessWidth = width - minCanWidth;

            switch (labelDisplay) {
                case NONE:
                    isNone = true;
                    noWrap = true;
                    if (rotateLabels) {
                        if (slantLabels) {
                            rotation = 300;
                        } else {
                            rotation = 270;
                        }
                        temp = labelHeight;
                        labelHeight = minWidth;
                        minWidth = temp;
                        noWrap = true;
                    }
                    break;
                case 'rotate':
                    if (slantLabels) {
                        rotation = 300;
                    } else {
                        rotation = 270;
                    }
                    temp = labelHeight;
                    labelHeight = minWidth;
                    minWidth = temp;
                    noWrap = true;
                    break;
                case 'stagger':
                    noWrap = true;
                    isStagger = true;
                    maxStaggerLines = Math.floor((maxHeight - nameLineHeight) / labelHeight);
                    if (maxStaggerLines < staggerLines) {
                        staggerLines = maxStaggerLines;
                    }
                    break;
                default ://auto
                    if (rotateLabels) {
                        if (slantLabels) {
                            rotation = 300;
                        } else {
                            rotation = 270;
                        }
                        temp = labelHeight;
                        labelHeight = minWidth;
                        minWidth = temp;
                    }
            }

            // if the chart is not scatter chart
            i = 0;
            plotLinesArr = axisObj.plotLines;

            // 1. segregate the grid plot lines from the non grid plot lines
            for (length = plotLinesArr.length; i < length; i += 1) {
                plotObj = plotLinesArr[i];
                if (plotObj && plotObj.label && (typeof plotObj.label.text !== STRINGUNDEFINED)) {
                    nonGridLinesArr.push(plotObj);
                }
            }

            plotBandsArr = axisObj.plotBands;

            for (i = 0, length = plotBandsArr.length; i < length; i += 1) {
                plotObj = plotBandsArr[i];
                if (plotObj && plotObj.label && (typeof plotObj.label.text !== STRINGUNDEFINED)) {
                    nonGridLinesArr.push(plotObj);
                }
            }

            plotLinesArr = axisObj.categories || [];

            for (i = 0, length = plotLinesArr.length; i < length; i += 1) {
                gridLinesArr.push({
                    value: i,
                    label: {
                        text: plotLinesArr[i]
                    }
                });
            }
            //axisObj.labels.enabled = true;

            lastGridIndex = gridLinesArr.length - 1;
            gridLinesLen = gridLinesArr.length;

            if (isStagger) {
                if (staggerLines > gridLinesLen) {
                    staggerLines = gridLinesLen;
                } else if (staggerLines < 2) {
                    staggerLines = 2;
                }
            }

            if (gridLinesLen) {
                if (axisObj.scroll && axisObj.scroll.viewPortMin && axisObj.scroll.viewPortMax) {
                    axisMin = axisObj.scroll.viewPortMin;
                    axisMax = axisObj.scroll.viewPortMax;
                    leftModify = false;
                    rightModify = false;
                } else {
                    axisMin = axisObj.min;
                    axisMax = axisObj.max;
                }

                // 2. calculate width for each label
                //chartPlotWidth = (gridLinesArr[lastGridIndex].value - gridLinesArr[0].value) * unitWidth,
                perCatWidth = conf.width * .08, // this is the maximum width that we can let the labels have
                canvasLeftSpace = (gridLinesArr[0].value - axisMin) * unitWidth,
                canvasRightSpace = (axisMax - gridLinesArr[lastGridIndex].value) * unitWidth;

                conf.maxLabelWidth = perCatWidth;
                conf.visibleLabelDistance = conf.width * .1;
                conf.numVisibleLabels = numVisLabels;


                if (labelDisplay === 'auto') {
                    if ((perCatWidth > unitWidth) && (perCatWidth < autoWrapLimit)) {
                        if (slantLabels) {
                            rotation = 300;
                        } else {
                            rotation = 270;
                            conf.visibleLabelDistance = conf.width * .07;
                            conf.maxLabelWidth = labelHeight;
                        }
                        temp = labelHeight;
                        labelHeight = minWidth;
                        minWidth = temp;
                        noWrap = true;
                    }
                } else if (labelDisplay === 'rotate') {
                    if (!slantLabels) {
                        conf.visibleLabelDistance = conf.width * .07;
                        conf.maxLabelWidth = labelHeight;
                    }
                } else if (labelDisplay === 'stagger') {
                    perCatWidth *= staggerLines;
                }

                // 4. calculate width for first label
                tempLabelWidth = (canvasLeftSpace + availableSpaceLeft) * 2;

                // if the distance b/w the first data point and min is greater than the distace between two adjacent data points
                var label = plotLinesArr[0];
                if (label) {
                    if (axisObj.labels.style) {
                        SmartLabel.setStyle(axisObj.labels.style);
                    }
                    labelTextWidth = Math.min(perCatWidth, SmartLabel.getOriSize(label).width + labelTextPadding);
                    // if the label doesnt fit in the given space
                    if (leftModify && labelTextWidth > tempLabelWidth) {
                        firstDifference = (labelTextWidth - tempLabelWidth) / 2;
                        width -= firstDifference;
                        excessWidth -= firstDifference;
                        hcJSON.chart.marginLeft += firstDifference;
                    }
                }

                // 5. calculate width for the last label
                tempLabelWidth = (canvasRightSpace + availableSpaceRight) * 2;

                // if the distance b/w the last data point and max is greater than the distace between two adjacent data points
                label = plotLinesArr[lastGridIndex];
                if (label) {
                    if (axisObj.labels.style) {
                        SmartLabel.setStyle(axisObj.labels.style);
                    }
                    labelTextWidth = Math.min(perCatWidth, SmartLabel.getOriSize(labelObj).width + labelTextPadding);
                    // if the label doesnt fit in the given space
                    if (rightModify && labelTextWidth > tempLabelWidth) {
                        lastDifference = (labelTextWidth - tempLabelWidth) / 2;
                        width -= lastDifference;
                        excessWidth -= lastDifference;
                        hcJSON.chart.marginRight += lastDifference;
                    }
                }

                if (!isNone) {
                    if (!isStepped) {
                        stepValue = Math.max(1, Math.ceil(minWidth / perCatWidth));
                        perCatWidth *= stepValue;
                    } else {
                        perCatWidth *= isStepped;
                        perCatWidth = Math.max(perCatWidth, minWidth);
                    }
                }

                // start setting the label dimensions
                for(index = 0; index < gridLinesLen; index += 1) {

                    plotObj = gridLinesArr[index];

                    if (index % stepValue && plotObj.label) {
                        plotObj.label.text = BLANKSTRING;
                        continue;
                    }

                    if (plotObj && plotObj.label && getValidValue(plotObj.label.text) !== undefined) {

                        labelObj = plotObj.label;
                        //if the style not implemented then implement it
                        if (labelObj.style && labelObj.style !== lastUsedStyle) {
                            lastUsedStyle = labelObj.style;
                            SmartLabel.setStyle(lastUsedStyle);
                        }

                        if (rotation && isNone) {
                            textObj = SmartLabel.getOriSize(labelObj.text);
                            labelSize.w = mathMax(labelSize.w, textObj.width + labelTextPadding);
                            labelSize.h = mathMax(labelSize.h, textObj.height);
                        }
                        else if (!isNone) {
                            if (rotation || isStagger) {
                                textObj = SmartLabel.getOriSize(labelObj.text);
                            }
                            else {//wrap
                                textObj = SmartLabel.getSmartText(labelObj.text, (perCatWidth - labelTextPadding), // 4px is removed for label padding
                                    maxHeight, noWrap);
                            }
                            labelSize.w = Math.max(labelSize.w, textObj.width + labelTextPadding);
                            labelSize.h = Math.max(labelSize.h, textObj.height);
                        }
                    }
                }
            }

            for(index = 0, length = nonGridLinesArr.length; index < length; index += 1) {

                plotObj = nonGridLinesArr[index];

                if (plotObj && plotObj.label && getValidValue(plotObj.label.text) !== undefined) {

                    labelObj = plotObj.label;
                    //if the style not implemented then implement it
                    if (labelObj.style && labelObj.style !== lastUsedStyle) {
                        lastUsedStyle = labelObj.style;
                        SmartLabel.setStyle(lastUsedStyle);
                    }

                    textObj = SmartLabel.getOriSize(labelObj.text);
                    if (labelObj.verticalAlign === POSITION_BOTTOM) {
                        tedendHeight= mathMax(tedendHeight, textObj.height);
                    } else {
                        oppTrendHeight = mathMax(oppTrendHeight, textObj.height);
                    }
                }
            }

            if (axisObj.scroll && axisObj.scroll.enabled && !rotation && !isNone) {
                widthToAdd = labelSize.w / 2;
                if (hcJSON.chart.marginLeft < widthToAdd) {
                    padWidth = widthToAdd - hcJSON.chart.marginLeft;
                    if (excessWidth > padWidth) {
                        width -= padWidth;
                        excessWidth -= padWidth;
                        hcJSON.chart.marginLeft += padWidth;
                    }
                }
                if (hcJSON.chart.marginRight < widthToAdd) {
                    padWidth = widthToAdd - hcJSON.chart.marginRight;
                    if (excessWidth > padWidth) {
                        width -= padWidth;
                        excessWidth -= padWidth;
                        hcJSON.chart.marginRight += padWidth;
                    }
                }
            }

            //now calculate the required space height
            if (isNone) {
                labelSpace = labelHeight;
                if (rotation) { // special rotation when labelDisplay=='none'
                    labelSpace = labelSize.w;
                }
            }
            else if (rotation) {
                labelSpace = labelSize.w;
            } else if (isStagger){
                labelSpace = staggerLines * labelHeight;
            } else {
                labelSpace = labelSize.h;
            }

            if (labelSpace > 0) {
                bottomSpace += labelPadding + labelSpace;
            }

            if (titleHeightUsed > 0) {
                bottomSpace += titleHeightUsed + xAxisNamePadding;
            }

            var difference, totalSpace = oppTrendHeight + bottomSpace + 2;
            temp = 0;

            /// Reduce the element size if required
            if (totalSpace > maxHeight) {
                difference = totalSpace - maxHeight;
                if (xAxisNamePadding > difference) {
                    xAxisNamePadding -= difference;
                    difference = 0;
                } else {
                    difference -= xAxisNamePadding;
                    xAxisNamePadding = 0;
                    if (labelPadding > difference) {
                        labelPadding -= difference;
                        difference = 0;
                    } else {
                        difference -= labelPadding;
                        labelPadding = 0;
                    }
                }

                // reduce the opposite side text or canvas text
                if (oppTrendHeight > difference) {
                    oppTrendHeight -= difference;
                    difference = 0;
                } else {
                    if (oppTrendHeight > 0) {
                        difference -= oppTrendHeight;
                        oppTrendHeight = 0;
                    }
                    if (difference > 0) {
                        if (tedendHeight > difference) {
                            tedendHeight -= difference;
                            difference = 0;
                        }
                        else {
                            if (tedendHeight > 0) {
                                difference -= tedendHeight;
                                tedendHeight = 0;
                            }
                            if (difference > 0) {
                                if ((temp = titleHeightUsed - nameLineHeight) > difference) {
                                    titleHeightUsed -= difference;
                                    difference = 0
                                }
                                else {
                                    difference -= temp;
                                    titleHeightUsed = nameLineHeight;
                                    if (difference > 0) {
                                        if ((temp = labelSpace - labelHeight) > difference) {
                                            labelSpace -= difference;
                                            difference = 0
                                        }
                                        else {
                                            difference -= temp;
                                            labelSpace = labelHeight;
                                            if (difference > 0) {
                                                difference -= titleHeightUsed + xAxisNamePadding;
                                                titleHeightUsed = 0;
                                                if (difference > 0) {
                                                    difference -= labelSpace
                                                    labelSpace = 0
                                                    if (difference > 0) {
                                                        labelPadding -= difference;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Place the elements
            //add extraspace if any
            labelPadding += marginBottomExtraSpace;

            var labelX = conf.is3d ? - hcJSON.chart.xDepth : 0, trendTextY = labelSpace + labelPadding,
            textAlign, yShipment, perLabelH, perLabelW, xShipment = labelX, adjustedPx = labelHeight * 0.5;
            labelY = labelHeight + labelPadding, length = gridLinesArr.length;
            catCount = 0;

            if (rotation) {
                perLabelH = perCatWidth;
                perLabelW = labelSpace - labelTextPadding;
                axisObj.labels.rotation = rotation;
                axisObj.labels.align = 'right';
                axisObj.labels.y = labelPadding - marginBottomExtraSpace + labelTextPadding;
                axisObj.labels.x = (minWidth / 2);

            }
            else if (isStagger) {
                perLabelH = labelHeight;
                perLabelW = (perCatWidth * staggerLines) - labelTextPadding;
            }
            else {
                perLabelH = labelSpace;
                perLabelW = perCatWidth - labelTextPadding;
            //xShipment += 0;
            }

            for(index = 0; index < length; index += stepValue) {
                plotObj = gridLinesArr[index];
                if (plotObj && plotObj.label && getValidValue(plotObj.label.text) !== undefined) {

                    labelObj = plotObj.label;
                    //if the style not implemented then implement it
                    if (labelObj.style && labelObj.style !== lastUsedStyle) {
                        lastUsedStyle = labelObj.style;
                        SmartLabel.setStyle(lastUsedStyle);
                    }

                    if (!isNone) {
                        textObj = SmartLabel.getSmartText(labelObj.text, perLabelW, perLabelH, noWrap);
                        axisObj.categories[index] = textObj.text;
                    }
                    catCount += 1
                }
            }

            length = nonGridLinesArr.length;
            var aoppTrendHeight = 0, atedendHeight = 0;
            for(index = 0; index < length; index += 1) {
                plotObj = nonGridLinesArr[index].plotObj ? nonGridLinesArr[index].plotObj : nonGridLinesArr[index];
                if (plotObj && plotObj.label && getValidValue(plotObj.label.text) !== undefined) {

                    labelObj = plotObj.label;
                    //if the style not implemented then implement it
                    if (labelObj.style && labelObj.style !== lastUsedStyle) {
                        lastUsedStyle = labelObj.style;
                        SmartLabel.setStyle(lastUsedStyle);
                    }
                    if (labelObj.verticalAlign === POSITION_BOTTOM) {
                        textObj = SmartLabel.getSmartText(labelObj.text, width, tedendHeight, true);
                        atedendHeight = Math.max(atedendHeight, textObj.height);
                        labelObj.text = textObj.text;
                        labelObj.y = trendTextY + SmartLabel.getOriSize(testStr).height;
                        labelObj.x = xShipment;
                    } else {
                        textObj = SmartLabel.getSmartText(labelObj.text, width, oppTrendHeight, true);
                        aoppTrendHeight = Math.max(aoppTrendHeight, textObj.height);
                        labelObj.text = textObj.text;
                        labelObj.y = - ((oppTrendHeight - SmartLabel.getOriSize(testStr).height) + labelPadding + 2);
                    }
                }
            }

            if (titleHeightUsed > 0) {
                SmartLabel.setStyle(axisObj.title.style);
                //now get the title space
                titleText = SmartLabel.getSmartText(axisObj.title.text, width, titleHeightUsed);
                axisObj.title.text = titleText.text;
                axisObj.title.margin = trendTextY + atedendHeight + xAxisNamePadding;
            }

            bottomSpace = atedendHeight;

            if (labelSpace > 0) {
                conf.horizontalAxisHeight = labelPadding + labelSpace - marginBottomExtraSpace;
                bottomSpace += conf.horizontalAxisHeight;
            }

            if (titleHeightUsed > 0) {
                bottomSpace += titleHeightUsed + xAxisNamePadding;
            }
            //
            hcJSON.chart.marginBottom += bottomSpace;

            if (aoppTrendHeight > 0) {
                hcJSON.chart.marginTop += aoppTrendHeight;
                bottomSpace += aoppTrendHeight;
            }

            return bottomSpace;
        },

        creditLabel : creditLabel,
        defaultPlotShadow: 1
    }, chartAPI.msline);


    /////////////// ssgrid ///////////
    chartAPI('ssgrid', {
        standaloneInit: true,
        defaultSeriesType : 'ssgrid',
        chart : function (width, height) {

            var container = this.containerElement,
            obj = this.dataObj,
            FCObj = this.chartInstance;
            //clone FC data so that any modiffication on it will not effect the original
            obj = extend2({}, obj);
            //clone the chart obj from graph or blank object
            obj.chart = obj.chart || obj.graph || {};
            delete obj.graph;

            // POINT FUNCTION

            // Declation of variables to be used
            var dataObj,
            setColor,
            setAlpha,
            textStyle,
            index = 0, itemValue,
            label, dataArr = [],
            FCChartObj = obj.chart,
            data = obj.data,
            length = data && data.length,
            SmartLabelManager = this.smartLabel,
            NumberFormatter = this.numberFormatter,
            chartHeight = container.offsetHeight,
            chartWidth = container.offsetWidth,
            textSizeObj,
            GParams = {},
            maxHeight = 0,
            numItems = 0,
            fontSize,
            // palette of the chart
            paletteIndex = (FCChartObj.palette > 0 && FCChartObj.palette < 6 ?
                FCChartObj.palette : pluckNumber(this.paletteIndex, 1)) - 1,
            HCObj = {
                chart: {
                    renderTo: container,
                    ignoreHiddenSeries: false,
                    events: {
                    },
                    spacingTop: 0,
                    spacingRight: 0,
                    spacingBottom: 0,
                    spacingLeft: 0,
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    borderRadius: 0,
                    borderColor: '#000000',
                    borderWidth: 1,
                    defaultSeriesType: 'ssgrid',
                    style : {
                        fontFamily: pluck(FCChartObj.basefont, 'Verdana'),
                        fontSize:  pluckFontSize(FCChartObj.basefontsize, 20) + PXSTRING,
                        color: pluck(FCChartObj.basefontcolor, defaultPaletteOptions.
                            baseFontColor[paletteIndex]).replace(/^#?([a-f0-9]+)/ig, '#$1')
                    },
                    plotBackgroundColor : COLOR_TRANSPARENT
                },
                labels: {
                    smartLabel: SmartLabelManager
                },

                colors: ['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6',
                '9D080D', 'A186BE', 'CC6600', 'FDC689', 'ABA000',
                'F26D7D', 'FFF200', '0054A6', 'F7941C', 'CC3300',
                '006600', '663300', '6DCFF6'],
                credits: {
                    href: 'http://www.fusioncharts.com?BS=FCHSEvalMark',
                    text: 'FusionCharts',
                    enabled: this.creditLabel
                },
                legend: {
                    enabled : false
                },
                series: [],
                subtitle: {
                    text: BLANKSTRING
                },
                title: {
                    text : BLANKSTRING
                },
                tooltip: {
                    enabled : false
                },

                // DO the exporting module
                exporting: {
                    buttons: {
                        exportButton: {},
                        printButton: {
                            enabled: false
                        }
                    }
                }
            },
            // Array of default colors (paletteColors)
            // We use it to specify the individual data point color
            defaultColors = HCObj.colors,
            // Length of the default colors
            defaultColLen = HCObj.colors.length,


            //Total sum of values
            sumOfValues = 0,
            itemsPerPage = 0,
            //Height for each data row
            rowHeight = 0,
            //Maximum width for value column
            maxValWidth = 0,
            //Label width and x position
            maxLabelWidth = 0,
            labelX = 0,
            actualDataLen = 0,
            HCChartObj,
            configureObj = FCObj.jsVars.cfgStore;

            HCChartObj = HCObj.chart;

            setLineHeight(HCObj.chart.style)

            //Now, store all parameters
            //Whether to show percent values?
            GParams.showPercentValues = pluckNumber(configureObj.showpercentvalues, FCChartObj.showpercentvalues, 0);
            //Number of items per page
            GParams.numberItemsPerPage = pluck(configureObj.numberitemsperpage, FCChartObj.numberitemsperpage);
            //Whether to show shadow
            GParams.showShadow = pluckNumber(configureObj.showshadow, FCChartObj.showshadow, 0);
            //Font Properties
            GParams.baseFont = pluck(configureObj.basefont, FCChartObj.basefont, 'Verdana');
            fontSize = pluckFontSize(configureObj.basefontsize, FCChartObj.basefontsize, 10);
            GParams.baseFontSize = fontSize + PXSTRING;
            GParams.baseFontColor = getFirstColor(pluck(configureObj.basefontcolor, FCChartObj.basefontcolor,
                defaultPaletteOptions.baseFontColor[paletteIndex]));

            //Alternate Row Color
            GParams.alternateRowBgColor = getFirstColor(pluck(configureObj.alternaterowbgcolor, FCChartObj.alternaterowbgcolor,
                defaultPaletteOptions.altHGridColor[paletteIndex]));
            GParams.alternateRowBgAlpha = pluck(configureObj.alternaterowbgalpha, FCChartObj.alternaterowbgalpha,
                defaultPaletteOptions.altHGridAlpha[paletteIndex]) + BLANKSTRING;

            //List divider properties
            GParams.listRowDividerThickness = pluckNumber(configureObj.listrowdividerthickness, FCChartObj.listrowdividerthickness, 1);
            GParams.listRowDividerColor = getFirstColor(pluck(configureObj.listrowdividercolor, FCChartObj.listrowdividercolor,
                defaultPaletteOptions.borderColor[paletteIndex]));
            GParams.listRowDividerAlpha = (pluckNumber(configureObj.listrowdivideralpha, FCChartObj.listrowdivideralpha,
                defaultPaletteOptions.altHGridAlpha[paletteIndex]) + 15) + BLANKSTRING;

            //Color box properties
            GParams.colorBoxWidth = pluckNumber(configureObj.colorboxwidth, FCChartObj.colorboxwidth, 8);
            GParams.colorBoxHeight = pluckNumber(configureObj.colorboxheight, FCChartObj.colorboxheight, 8);
            //Navigation Properties
            GParams.navButtonRadius = pluckNumber(configureObj.navbuttonradius, FCChartObj.navbuttonradius, 7);
            GParams.navButtonColor = getFirstColor(pluck(configureObj.navbuttoncolor, FCChartObj.navbuttoncolor,
                defaultPaletteOptions.canvasBorderColor[paletteIndex]));
            GParams.navButtonHoverColor = getFirstColor(pluck(configureObj.navbuttonhovercolor, FCChartObj.navbuttonhovercolor,
                defaultPaletteOptions.altHGridColor[paletteIndex]));

            //Paddings
            GParams.textVerticalPadding = pluckNumber(configureObj.textverticalpadding, FCChartObj.textverticalpadding, 3);
            GParams.navButtonPadding = pluckNumber(configureObj.navbuttonpadding, FCChartObj.navbuttonpadding, 5);
            GParams.colorBoxPadding = pluckNumber(configureObj.colorboxpadding, FCChartObj.colorboxpadding, 10);
            GParams.valueColumnPadding = pluckNumber(configureObj.valuecolumnpadding, FCChartObj.valuecolumnpadding, 10);
            GParams.nameColumnPadding = pluckNumber(configureObj.namecolumnpadding, FCChartObj.namecolumnpadding, 5);

            GParams.borderThickness = pluckNumber(configureObj.borderthickness, FCChartObj.borderthickness, 1);
            GParams.borderColor  = getFirstColor(pluck(configureObj.bordercolor, FCChartObj.bordercolor,
                defaultPaletteOptions.borderColor[paletteIndex]));
            GParams.borderAlpha  = pluck(configureObj.borderalpha, FCChartObj.borderalpha,
                defaultPaletteOptions.borderAlpha[paletteIndex]) + BLANKSTRING;

            GParams.bgColor  = pluck(configureObj.bgcolor, FCChartObj.bgcolor, 'FFFFFF');
            GParams.bgAlpha  = pluck(configureObj.bgalpha, FCChartObj.bgalpha, HUNDREDSTRING);
            GParams.bgRatio = pluck(configureObj.bgratio, FCChartObj.bgratio, HUNDREDSTRING);
            GParams.bgAngle = pluck(configureObj.bgangle, FCChartObj.bgangle, ZEROSTRING);

            // Setting the Chart border cosmetics
            // SSGrid shows a round edge in chart border
            // so we use borderThickness / 16 as a radius
            // to show the round edge
            HCChartObj.borderRadius = GParams.borderThickness / 16;
            HCChartObj.borderWidth = GParams.borderThickness;
            HCChartObj.borderColor = {
                FCcolor: {
                    color: GParams.borderColor,
                    alpha: GParams.borderAlpha
                }
            };

            // Setting the Chart background cosmetics
            HCChartObj.backgroundColor = {
                FCcolor: {
                    color: GParams.bgColor,
                    alpha: GParams.bgAlpha,
                    ratio: GParams.bgRatio,
                    angle: GParams.bgAngle
                }
            };

            HCChartObj.borderRadius = pluckNumber(FCChartObj.borderradius, 0);

            // Creating the text style for SSGrid
            textStyle = {
                fontFamily: GParams.baseFont,
                fontSize:  GParams.baseFontSize,
                color: GParams.baseFontColor
            };
            setLineHeight(textStyle)
            // setting the style to LabelManagement
            SmartLabelManager.setStyle(textStyle);

            for(index = 0; index < length; index += 1) {
                dataObj = data[index];
                itemValue = NumberFormatter.getCleanValue(dataObj.value);
                label = parseUnsafeString(getFirstValue(dataObj.label, dataObj.name));
                // Color of the particular data
                setColor = getFirstColor(pluck(dataObj.color, defaultColors[index % defaultColLen]));
                // Alpha of the data
                setAlpha = pluck(dataObj.alpha, FCChartObj.plotfillalpha, HUNDREDSTRING);
                if (label != BLANKSTRING || itemValue != null) {
                    dataArr.push({
                        value: itemValue,
                        label: label,
                        color: setColor
                    });
                    sumOfValues = sumOfValues + itemValue;
                    actualDataLen += 1;
                }
            }

            /*
             * calculates the various points on the chart.
             */
            //Format all the numbers on the chart and store their display values
            //We format and store here itself, so that later, whenever needed,
            //we just access displayValue instead of formatting once again.
            for(index = 0; index < actualDataLen; index += 1) {
                dataObj = dataArr[index];
                itemValue = dataObj.value;
                //Format and store
                dataObj.dataLabel = dataObj.label;
                //Display Value
                dataObj.displayValue = GParams.showPercentValues ?
                NumberFormatter.percentValue(itemValue / sumOfValues * 100) :

                NumberFormatter.dataLabels(itemValue);
                //Now, we need to iterate through the value fields to get the max width
                //Simulate
                textSizeObj = SmartLabelManager.getOriSize(dataObj.displayValue);
                //Store maximum width
                maxValWidth = Math.max(maxValWidth, (textSizeObj.width + GParams.valueColumnPadding));
            }


            //Now, there are two different flows from here on w.r.t calculation of height
            //Case 1: If the user has specified his own number of items per page
            if (GParams.numberItemsPerPage) {
                //In this case, we simply divide the page into the segments chosen by user
                //If all items are able to fit in this single page
                if (GParams.numberItemsPerPage >= actualDataLen) {
                    //This height is perfectly alright and we can fit all
                    //items in a single page
                    //Set number items per page to total items.
                    GParams.numberItemsPerPage = actualDataLen;
                    //So, NO need to show the navigation buttons
                    rowHeight = chartHeight / GParams.numberItemsPerPage;
                    //End Index
                    itemsPerPage = actualDataLen;
                }
                else {
                    //We need to allot space for the navigation buttons
                    var cHeight = chartHeight;
                    //Deduct the radius and padding of navigation buttons from height
                    cHeight = cHeight - 2 * (GParams.navButtonPadding + GParams.navButtonRadius);
                    //Now, get the maximum possible number of items that we can fit in each page
                    itemsPerPage = GParams.numberItemsPerPage;
                    //Height for each row
                    rowHeight = cHeight / itemsPerPage;

                }
            } else {
                //Case 2: If we've to calculate best fit. We already have the maximum height
                //required by each row of data.
                //Storage for maximum height
                //Now, get the height required for any single text field
                //We do not consider wrapping.
                //Create text box and get height
                //textSizeObj = SmartLabelManager.getOriSize("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_=/*-+~`");
                //Get the max of two
                maxHeight = parseInt(textStyle.lineHeight, 10);
                //Add text vertical padding (for both top and bottom)
                maxHeight = maxHeight + 2 * GParams.textVerticalPadding;
                //Also compare with color box height - as that's also an integral part
                maxHeight = Math.max(maxHeight, GParams.colorBoxHeight);
                //Now that we have the max possible height, we need to calculate the page length.
                //First check if we can fit all items in a single page
                numItems = chartHeight/maxHeight;
                if (numItems >= actualDataLen) {
                    //We can fit all items in one page
                    rowHeight = (chartHeight / actualDataLen);
                    //Navigation buttons are not required.
                    //End Index
                    itemsPerPage = actualDataLen;
                } else {
                    //We cannot fit all items in same page. So, need to show
                    //navigation buttons. Reserve space for them.
                    //We need to allot space for the navigation buttons
                    cHeight = chartHeight;
                    //Deduct the radius and padding of navigation buttons from height
                    cHeight = cHeight - 2 * (GParams.navButtonPadding + GParams.navButtonRadius);
                    //Now, get the maximum possible number of items that we can fit in each page
                    itemsPerPage = Math.floor(cHeight / maxHeight);
                    //Height for each row
                    rowHeight = cHeight / itemsPerPage;
                }
            }
            //Now, we calculate the maximum avaiable width for data label column
            maxLabelWidth = chartWidth - GParams.colorBoxPadding -
            GParams.colorBoxWidth - GParams.nameColumnPadding -
            maxValWidth - GParams.valueColumnPadding;
            labelX = GParams.colorBoxPadding + GParams.colorBoxWidth + GParams.nameColumnPadding;


            // Storing series configuration options in HC Chart object
            HCChartObj.height = chartHeight;
            HCChartObj.width = chartWidth;
            HCChartObj.rowHeight = rowHeight;

            HCChartObj.labelX = labelX;

            HCChartObj.colorBoxWidth = GParams.colorBoxWidth;
            HCChartObj.colorBoxHeight = GParams.colorBoxHeight;
            HCChartObj.colorBoxX = GParams.colorBoxPadding;

            HCChartObj.valueX = GParams.colorBoxPadding + GParams.colorBoxWidth +
            GParams.nameColumnPadding + maxLabelWidth + GParams.valueColumnPadding;
            HCChartObj.valueColumnPadding = GParams.valueColumnPadding;

            HCChartObj.textStyle = textStyle;


            HCChartObj.listRowDividerAttr = {
                'stroke-width': GParams.listRowDividerThickness,
                stroke: {
                    FCcolor: {
                        color: GParams.listRowDividerColor,
                        alpha: GParams.listRowDividerAlpha
                    }
                }
            };

            HCChartObj.alternateRowColor = {
                FCcolor: {
                    color: GParams.alternateRowBgColor,
                    alpha: GParams.alternateRowBgAlpha
                }
            };

            HCChartObj.navButtonRadius = GParams.navButtonRadius;
            HCChartObj.navButtonPadding = GParams.navButtonPadding;
            HCChartObj.navButtonColor = GParams.navButtonColor;
            HCChartObj.navButtonHoverColor = GParams.navButtonHoverColor;

            HCChartObj.lineHeight = parseInt(textStyle.lineHeight, 10);


            // Now, we create render array page wise
            var dataRender = [], pageIndex = 0, visible = true;
            for (index = 0; index < actualDataLen & itemsPerPage != 0; index += 1) {
                //Update indexes.
                if (index % itemsPerPage == 0) {
                    dataRender.push({
                        data: [],
                        visible: visible

                    });
                    visible = false;
                    pageIndex += 1;
                }
                dataObj = dataArr[index];

                dataRender[pageIndex - 1].data.push({
                    label: SmartLabelManager.getSmartText(dataObj.dataLabel, maxLabelWidth, rowHeight).text,
                    displayValue: dataObj.displayValue,
                    y: dataObj.value,
                    color: dataObj.color
                });
            }
            HCObj.series = dataRender;


            //////Expprt Module/////
            HCObj.exporting.enabled = FCChartObj.exportenabled == '1' ? true: false;
            HCObj.exporting.buttons.exportButton.enabled = FCChartObj.exportshowmenuitem == '0' ? false : true;
            HCObj.exporting.filename = FCChartObj.exportfilename ? FCChartObj.exportfilename : 'FusionCharts';
            HCObj.exporting.width = chartWidth;

            //call the chart conf function
            return HCObj;
        },
        creditLabel : creditLabel
    }, chartAPI.base);


    /* ****************************************************************************
     * Start SSGrid series code                                                   *
     *****************************************************************************/

    // 1 - Set default options
    defaultPlotOptions.ssgrid = merge(defaultPlotOptions.pie, {
        states: {
            hover: {}
        }
    });

    // 2- Create the SSGrid point object

    //NO Code

    //helper Functon for S grid
    var nenagitePage = function (chart, isPrev) {
        var currentIndex = chart.currentSeriesIndex,
        series = chart.series,
        wouldBeIndex = isPrev ? currentIndex -1 : currentIndex + 1;

        if (series[wouldBeIndex]) {
            series[currentIndex].hide();
            series[wouldBeIndex].show();
            chart.currentSeriesIndex = wouldBeIndex;
            placeNaviGator(chart);
        }
    },

    placeNaviGator = function (chart) {
        var noOfSeries = chart.series.length,
        options = chart.options.chart,
        rowHeight = options.rowHeight,
        currentSeriesIndex = chart.currentSeriesIndex,
        pageHeight = chart.series[currentSeriesIndex].data.length * rowHeight,
        naviigator = chart.naviigator;
        naviigator.translate(0, pageHeight);

        if (currentSeriesIndex === 0) {
            naviigator.navElePrv.hide();
        }
        else {
            naviigator.navElePrv.show();
        }
        if (currentSeriesIndex === noOfSeries - 1) {
            naviigator.navEleNxt.hide();
        }else {
            naviigator.navEleNxt.show();
        }
    },

    drawSSGridNavButton = function (chart) {
        var renderer = chart.renderer,
        options = chart.options.chart,
        width = options.width,
        x = 20,
        radius = options.navButtonRadius,
        radiusFregment = radius * 0.67,
        y = options.navButtonPadding + radiusFregment,
        nextEleX = width-x,
        navButtonHoverColor = options.navButtonHoverColor,
        navButtonColor = options.navButtonColor,
        navElePrv, navEleNxt, navElePrvGroup, navEleNxtGroup;

        if (chart.series.length > 1) {
            //create the nevagitor group
            var naviigatorGroup = chart.naviigator = renderer.g('navigator')
            .attr({
                zIndex : 4
            }).add();


            naviigatorGroup.navElePrv = navElePrvGroup = renderer.g('navElePrv').add(naviigatorGroup);
            //DRAW THE ARROW
            navElePrv = renderer.path([
                M, x, y,
                L, x + radius + radiusFregment, y - radiusFregment,
                x + radius, y,
                x + radius + radiusFregment, y + radiusFregment, 'Z'
                ])
            .attr({
                fill: navButtonColor
            }).add(navElePrvGroup);


            // draw the click circle
            renderer.circle(x+radius, y, radius)
            .attr({
                fill: COLOR_TRANSPARENT,
                cursor: 'pointer'
            })
            .on('mouseover', function() {
                navElePrv.attr({
                    fill: navButtonHoverColor,
                    cursor: 'pointer'
                });
            }).on('mouseout', function() {
                navElePrv.attr({
                    fill: navButtonColor
                });
            }).on('click', function() {
                nenagitePage(chart, true);
            }).add(navElePrvGroup);


            naviigatorGroup.navEleNxt = navEleNxtGroup = renderer.g('navEleNxt').add(naviigatorGroup);
            //DRAW THE ARROW
            navEleNxt = renderer.path([
                M, nextEleX, y,
                L, nextEleX - radius - radiusFregment, y - radiusFregment,
                nextEleX - radius, y,
                nextEleX - radius - radiusFregment, y + radiusFregment, 'Z'
                ])
            .attr({
                fill: navButtonColor,
                cursor: 'pointer'
            }).add(navEleNxtGroup)


            // draw the click circle
            renderer.circle(nextEleX - radius, y, radius)
            .attr({
                fill: COLOR_TRANSPARENT,
                cursor: 'pointer'
            })
            .on('mouseover', function() {
                navEleNxt.attr({
                    fill: navButtonHoverColor
                });
            }).on('mouseout', function() {
                navEleNxt.attr({
                    fill: navButtonColor
                });
            }).on('click', function() {
                nenagitePage(chart);
            })
            .attr({
                fill: navButtonColor
            })
            .add(navEleNxtGroup);
        }
    //draw the border
    }

    // 3 - Create the OHLCSeries object
    var SSGrid = Highcharts.extendClass(seriesTypes.pie, {
        type: 'ssgrid',
        translate: function () {
            var series = this,
            chartOptions = series.chart.options.chart,
            data = series.data,
            x = 0, y = 0,
            width = chartOptions.width,
            height = chartOptions.rowHeight,
            colorBoxWidth = chartOptions.colorBoxWidth,
            colorBoxHeight = chartOptions.colorBoxHeight,
            colorBoxX = chartOptions.colorBoxX,
            labelX = chartOptions.labelX,
            valueX = chartOptions.valueX;


            each(data, function(point) {

                // set the shape
                point.shapeType = 'rect';
                point.alternateGradientBox = {
                    x: x,
                    y: y,
                    width : width,
                    height: height,
                    r: 0
                };

                // Path for row divider line
                point.rowDivider = [M, x, y, L, width, y];

                // Path for color box rect
                point.colorBoxArgs = {
                    x: colorBoxX,
                    y: y + (height / 2) - (colorBoxHeight / 2),
                    width : colorBoxWidth,
                    height: colorBoxHeight,
                    r: 0
                };

                point.labelX = labelX;

                point.valueX = valueX;

                y += height;
            });

            // To draw the last RowDivider line
            series.options.lastRowDivider = [M, x, y, L, width, y];
        },
        drawPoints: function() {
            var series = this,
            chartOptions = series.chart.options.chart,
            renderer = series.chart.renderer,
            graphic,
            group = series.group,
            fillAltcolor = chartOptions.alternateRowColor,
            attrib = chartOptions.listRowDividerAttr,
            lastRowDivider = series.options.lastRowDivider,
            rowHeight = chartOptions.rowHeight,
            textStyle = chartOptions.textStyle,
            lineHeight = chartOptions.lineHeight,
            width = chartOptions.width,
            valueColumnPadding = chartOptions.valueColumnPadding,
            rowDivider, colorBoxArgs, alternateGradientBox,
            textEle, textY, valueX, bBox;


            // draw the slices
            each(series.data, function(point, index) {
                graphic = point.graphic;
                rowDivider = point.rowDivider;
                colorBoxArgs = point.colorBoxArgs;
                alternateGradientBox = point.alternateGradientBox;
                valueX = point.valueX;

                // draw the chart
                if (graphic) {
                //graphic.animate(rowDivider);
                } else {

                    // Draw the listRowDivide Lines
                    point.graphic = renderer.path(rowDivider)
                    .attr(attrib)
                    .add(group);

                    if(index % 2 == 0) {
                        renderer.rect(alternateGradientBox)
                        .attr({
                            fill: fillAltcolor,
                            "stroke-width": 0
                        })
                        .add(group);
                    }


                    // Draw the color BOX
                    point.symbol = renderer.rect(colorBoxArgs)
                    .attr({
                        fill : point.color,
                        'stroke-width': 0,
                        stroke: '#000000'
                    })
                    .add(group);


                    // Draw label text
                    textEle = renderer.text(point.label,
                        point.labelX
                        )
                    .css(textStyle)
                    .add(group);
                    // Adjusting text middle alignment
                    textY = (rowDivider[2] + (rowHeight / 2) + lineHeight) - ((textEle.getBBox().height / 2));
                    textEle.attr({
                        y: textY
                    });


                    // Draw value text
                    textEle = renderer.text(point.displayValue,
                        valueX
                        )
                    .css(textStyle)
                    .add(group);

                    bBox = textEle.getBBox();
                    // Adjusting value text to middle
                    textY = (rowDivider[2] + (rowHeight / 2) + lineHeight) - ((bBox.height / 2));
                    textEle.attr({
                        y: textY,
                        // Adjusting value text to right
                        x: valueX + ((width - valueX - valueColumnPadding) - bBox.width)
                    });
                }
            });

            // render the last row divider line
            renderer.path(lastRowDivider)
            .attr(attrib)
            .add(group);
        },

        render: function() {
            var series = this, group, chart = series.chart, renderer = chart.renderer,
            options = series.options;


            if (!chart.naviigator) {
                drawSSGridNavButton(chart);
            }

            // the group
            if (!series.group) {
                group = series.group = renderer.g('series');


                group.attr({
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    zIndex: options.zIndex
                })
                .translate(chart.plotLeft, chart.plotTop)
                .add(chart.seriesGroup);

            }

            this.drawPoints();

            this.drawDataLabels();

            if (series.visible) {
                chart.currentSeriesIndex = series.index;
                if (chart.naviigator) {
                    placeNaviGator(chart);
                }
            }

            if (series.options.animation && series.animate) {
                series.animate();
            }

            series.isDirty = false; // means data is in accordance with what you see
        },

        drawDataLabels: function() {

        },

        drawTracker: function () {

        },
        animate: function(init) {

        }

    });

    // 4 - add the constractor
    seriesTypes.ssgrid = SSGrid;



    //////////Bubble series

    // 1 - Set default options
    defaultPlotOptions.bubble = merge(defaultPlotOptions.scatter, {
        states: {
            hover: {}
        }
    });

    var Bubble = Highcharts.extendClass(seriesTypes.scatter, {
        type: 'bubble',

        /**
         * Draw the markers
         */
        drawPoints: function(){
            var series = this,
            pointAttr,
            data = series.data,
            chart = series.chart,
            plotX,
            plotY,
            i,
            point,
            radius,
            graphic,

            canvasWidth = series.chart.plotWidth,
            canvasHeight = series.chart.plotHeight,
            maxZ = series.options.zMax,
            bubbleScale = series.options.bubbleScale,
            radiusLimit, sqrtMaxZ, sqrtBubbleZ, bubbleRadius;

            // to have diameter of the largest bubble as 25% of the smaller of the two dimensions of canvas
            radiusLimit = ((canvasWidth > canvasHeight) ? canvasHeight : canvasWidth) / 8;
            // taking square root of the maximum z-value of all bubbles
            sqrtMaxZ = mathSqrt(maxZ);


            if (series.options.marker.enabled) {
                i = data.length;
                while (i--) {
                    point = data[i];
                    plotX = point.plotX;
                    plotY = point.plotY;
                    graphic = point.graphic;

                    // only draw the point if y is defined
                    if (plotY !== UNDEFINED && !isNaN(plotY)) {

                        /* && removed this code because points stayed after zoom
						point.plotX >= 0 && point.plotX <= chart.plotSizeX &&
						point.plotY >= 0 && point.plotY <= chart.plotSizeY*/

                        // shortcuts
                        pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE];

                        // taking square root of the z-value of the bubble
                        sqrtBubbleZ = mathSqrt(point.z);
                        // calculating radius with scaling
                        bubbleRadius = mathRound (sqrtBubbleZ * radiusLimit / sqrtMaxZ) * bubbleScale;

                        pointAttr.r = radius = (bubbleRadius || 0);

                        if (graphic) { // update
                            graphic.animate({
                                x: plotX,
                                y: plotY,
                                r: radius
                            });
                        } else {
                            point.graphic = chart.renderer.symbol(
                                pick(point.marker && point.marker.symbol, series.symbol),
                                plotX,
                                plotY,
                                radius
                                )
                            .attr(pointAttr)
                            .add(series.group);
                        }
                    }
                }
            }

        }
    });
    seriesTypes.bubble = Bubble;



    /* ****************************************************************************
     * Start stepzoom series code                                                   *
     *****************************************************************************/

    // 1 - Set default options
    defaultPlotOptions.stepzoom = merge(defaultPlotOptions.line, {
        states: {
            hover: {}
        }
    });

    var numItems,
    zoomHistory = [];

    /**
     * Sets the subset indexes. It's based on these indexes that the
     * chart subset is drawn.
     * @param	startIndex		Starting index of subset
     * @param	endIndex		Ending index of subset
     */
    var chartStepZoomScroll = function (pos, animation, resetTooltip) {
        if (pos <= 0.01) {
            pos = 0;
        }

        var chart = this,
            stepZoom = chart.stepZoom,
            series = chart.series,
            width = chart.plotWidth,
            clipExcessWidth = chart.options._FCconf.clipExcessWidth,
            widthHF = width / 2,
            seriesLength = series.length,
            scrollPosition = pluckNumber(pos, stepZoom.scrollPosition, 0),
            scrollablePXLength = stepZoom.scrollablePXLength,
            xShift = scrollablePXLength * scrollPosition,
            zoomHistory = stepZoom.zoomHistory[stepZoom.currentZoomLevelIndex],
            seriesStart = zoomHistory.seriesStart,
            firstVisiblePoint = seriesStart + (Math.ceil(xShift / zoomHistory.visiblePointDistance) * zoomHistory.stepping),
            lastVisiblePoint = seriesStart + (Math.floor((xShift + width) / zoomHistory.visiblePointDistance) * zoomHistory.stepping),
            yShift = 0,
            toopTipXShift,
            translateX = 'translateX',
            xStr = 'x',
            i, serie, toolTipX, toolTipY, len, data, point, j,
            newX = chart.plotLeft - xShift, labelClipX, labelEndBBox, labelClipW,
            newY = chart.plotTop - yShift;

        stepZoom.catGroup.attr(translateX, newX);
        stepZoom.catClipRect.attr(xStr, xShift - (clipExcessWidth / 2));
        if (chart.clipRect) {
            chart.clipRect.attr(xStr, xShift);
        }


        i = seriesLength;
        while (i--) {
            serie = series[i];
            //serie.scroll(xShift, yShift, resetTooltip);
            if (serie.group) {
                serie.group.attr(translateX , newX);
            }
            if (serie.dataLabelsGroup) {
                serie.dataLabelsGroup.attr(translateX, newX);
            }
            if (serie.clipRect) {
                serie.clipRect.attr(xStr, xShift);
            }

            if (resetTooltip) {
                toopTipXShift = math.min(20, widthHF);
                data = serie.data;
                len = data.length;
                for (j = 0; j < len; j += 1) {
                    point = data[j];
                    if (point.y !== null && point.tooltipPos) {
                        toolTipX = point.plotX - xShift;
                        if (toolTipX >= 0 && toolTipX <= widthHF) {
                            toolTipX += toopTipXShift;
                        }
                        else if (toolTipX > widthHF && toolTipX <= width) {
                            toolTipX -= toopTipXShift;
                        }
                        point.tooltipPos[0] = toolTipX;
                    }
                }
            }
        }

        // Update scroll position when users have scrolled.
        zoomHistory.scrollPosition = scrollPosition;
    }



    /**
     * Zoomline drawing extension.
     */
    var stepZoom = Highcharts.extendClass(seriesTypes.line, {
        type: 'stepzoom',

        /**
         * Translate data points from raw data values to chart specific positioning data
         * needed later in drawPoints, drawGraph and drawTracker.
         */
        translate: function() {
            var series = this,
            chart = series.chart,
            stacking = series.options.stacking,
            categories = series.xAxis.categories,
            yAxis = series.yAxis,
            data = series.data,
            i = data.length;

            // do the translation
            while (i--) {
                var point = data[i],
                xValue = point.x,
                yValue = point.y,
                yBottom = point.low,
                stack = yAxis.stacks[(yValue < 0 ? '-' : '') + series.stackKey],
                pointStack,
                pointStackTotal;
                point.plotX = series.xAxis.translate(xValue);

                // calculate the bottom y value for stacked series
                if (stacking && stack && stack[xValue]) {
                    pointStack = stack[xValue];
                    pointStackTotal = pointStack.total;

                    var min = yAxis.options.min;
                    yBottom = pointStack.cum;
                    pointStack.cum +=  yValue; // start from buttom
                    yValue = mathMax(min, yBottom + yValue);
                    yBottom = mathMax(min, yBottom);

                    if (stacking === 'percent') {
                        yBottom = pointStackTotal ? yBottom * 100 / pointStackTotal : 0;
                        yValue = pointStackTotal ? yValue * 100 / pointStackTotal : 0;
                    }

                    point.percentage = pointStackTotal ? point.y * 100 / pointStackTotal : 0;
                    point.stackTotal = pointStackTotal;
                }

                if (defined(yBottom)) {
                    point.yBottom = yAxis.translate(yBottom, 0, 1, 0, 1);
                }

                // set the y value
                if (yValue !== null) {
                    point.plotY = yAxis.translate(yValue, 0, 1, 0, 1);
                }

                // set client related positions for mouse tracking
                point.clientX = chart.inverted ?
                chart.plotHeight - point.plotX :
                point.plotX; // for mouse tracking

                // some API data
                point.category = categories && categories[point.x] !== UNDEFINED ?
                categories[point.x] : point.x;

            }
        },

        /**
         * Draw the markers
         */
        drawPoints: function() {
            var series = this,
            options = series.options,
            chart = series.chart,
            renderer = chart.renderer,
            optionsChart = chart.options.chart,
            zoomOptions = chart.stepZoom,
            optionsLabel = options.dataLabels,
            trackerId = +new Date(),
            data = series.data,
            dataLabelsGroup = series.dataLabelsGroup,

            zoomHistory = zoomOptions.zoomHistory[zoomOptions.currentZoomLevelIndex],
            pppDistance = zoomHistory.perPointPixelDistance,
            seriesTranslateX = zoomOptions.scrollPosition * zoomOptions.scrollablePXLength,
            stepping = zoomHistory.stepping,
            seriesStart = zoomHistory.seriesStart,

            markerEnabled = options.marker.enabled,
            color = optionsLabel.color,
            labelStyle = optionsLabel.style,
            yIsNull = optionsLabel.y === null,
            canvasHeight = chart.plotHeight,
            fontLineHeight = pInt(labelStyle.fontSize),
            valuePadding = optionsChart.valuePadding,
            valuePosition = optionsChart.valuePosition,

            x,
            y,
            prevDataObj,
            rotation,
            dataLabel,
            align,
            individualYDelta,
            oriStr,
            pointAttr,
            positionIndex,
            plotX,
            plotY,
            pointVisible,
            i,
            point,
            graphic,
            toolTipX,
            toolTipY,
            radius,
            rel,
            dataLabelsGroupEle,
            seriesGroup = series.group,
            seriesGroupEle = seriesGroup.element;

            optionsLabel.rotation = rotation = (optionsChart.rotateValues == 1) ?
            270 : undefined;

            // create a separate group for the data labels to avoid rotation
            if (!dataLabelsGroup) {
                dataLabelsGroup = series.dataLabelsGroup =
                renderer.g('data-labels')
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    zIndex: 6
                })
                .translate(chart.plotLeft - seriesTranslateX, chart.plotTop)
                .add();
                //clip for scroll
                if (optionsChart.hasScroll) {
                    dataLabelsGroup.clip(series.clipRect);
                }
            }

            // retain reference to group element
            dataLabelsGroupEle = dataLabelsGroup.element;

            // determine the color
            if (color === 'auto') { // 1.0 backwards compatibility
                color = null;
            }
            labelStyle.color = pick(color, series.color);

            i = data.length;
            while (i--) {
                point = data[i];
                positionIndex = i - seriesStart;
                plotX = point.plotX = positionIndex * pppDistance;
                plotY = point.plotY;

                // only draw the point if y is defined
                if ((plotY !== UNDEFINED && !isNaN(plotY))) {

                    graphic = point.graphic;
                    pointVisible = !(positionIndex < 0 || positionIndex % stepping !== 0);
                    align = optionsLabel.align;
                    individualYDelta =
                    (yIsNull ? (point.y >= 0 ? -6 : 12) : optionsLabel.y) -
                    valuePadding;

                    // get the string
                    oriStr = optionsLabel.formatter.call(point.getLabelConfig());

                    // shortcuts
                    pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE];
                    radius = pointAttr.r;
                    toolTipX = plotX + 20;
                    toolTipY = plotY - 15;
                    toolTipX = toolTipX < 0 ? 0 : toolTipX;
                    toolTipY = toolTipY < 0 ? 0 : toolTipY;
                    point.tooltipPos = [toolTipX, toolTipY];
                    pointAttr.isTracker = trackerId;

                    // if marker is disabled then fill using tracker
                    // color, since marker double up as tracker.
                    if (!markerEnabled) {
                        extend(pointAttr, {
                            fill: TRACKER_FILL,
                            stroke: TRACKER_FILL,
                            r: 3
                        });
                    }

                    if (graphic) { // update
                        graphic.attr({
                            x: plotX,
                            y: plotY,
                            r: radius
                        });
                    } else {
                        point.graphic = graphic = chart.renderer.symbol(
                            pick(point.marker && point.marker.symbol, series.symbol),
                            plotX,
                            plotY,
                            radius)
                        .on(hasTouch ? 'touchstart' : 'mouseover', function (event) {
                            var element = (event.currentTarget ? event.currentTarget : event.srcElement),
                                point,
                                series;
                            if (!(point = element.point)) {
                                return;
                            }

                            series = point.series;
                            rel = event.relatedTarget || event.fromElement;
                            if (chart.hoverSeries !== series && attr(rel, 'isTracker') !== trackerId) {
                                series.onMouseOver();
                            }
                            point.onMouseOver();
                        })
                        .on('mouseout', function (event) {
                            var element = (event.currentTarget) ? event.currentTarget : event.srcElement,
                                series = element.point && element.point.series;
                            if (series && !series.options.stickyTracking) {
                                rel = event.relatedTarget || event.toElement;
                                if (attr(rel, 'isTracker') !== trackerId) {
                                    series.onMouseOut();
                                }
                            }
                        })
                        .attr(pointAttr);

                        if (pointVisible) {
                            graphic.element.point = point;
                            seriesGroupEle.appendChild(graphic.element);
                            graphic.added = true;
                        }
                        else {
                            graphic._parentNode = seriesGroup;
                            renderer.pending.push(graphic);
                        }

                        if (!pointVisible || (docMode8 && seriesGroupEle.gVis === HIDDEN)) {
                            graphic.attr({
                                visibility: HIDDEN
                            });
                        }
                    }

                    if (oriStr != null) {
                        x =  plotX + optionsLabel.x;
                        y =  plotY + individualYDelta;

                        switch (valuePosition) {
                            case 'above':
                                y =  plotY + individualYDelta;
                                break;
                            case 'below':
                                y =  plotY - individualYDelta + fontLineHeight;
                                break;
                            default:
                                prevDataObj = data[i - 1];
                                y = plotY + (((prevDataObj && prevDataObj.plotY)
                                    <= point.plotY) ? - (individualYDelta - fontLineHeight)
                                : individualYDelta);
                                break;
                        }


                        // Fix for zero values goes outside the canvas
                        if (y > canvasHeight) {
                            y =  plotY + individualYDelta;
                        }
                        if (y < fontLineHeight) {
                            y =  plotY - individualYDelta + fontLineHeight;
                        }

                        // update existing label
                        if ((dataLabel = point.dataLabel)) {
                            dataLabel.attr({
                                text: oriStr
                            }).animate({
                                x: x,
                                y: y
                            });
                        // create new label
                        } else if (oriStr !== UNDEFINED && oriStr !== null) {
                            dataLabel = point.dataLabel = renderer.text(oriStr,
                                x, y).css(labelStyle);

                            // build formatted text
                            if ((dataLabel.textStr !== undefined) && hasSVG) {
                                renderer.buildText(dataLabel);
                            }

                            if (pointVisible) {
                                dataLabelsGroupEle.appendChild(dataLabel.element);
                                dataLabel.added = true;
                                dataLabel.attr({
                                    align: align,
                                    rotation: rotation
                                });
                            }
                            else {
                                dataLabel._parentNode = dataLabelsGroup;
                                renderer.pending.push(dataLabel);
                            }

                            if (!pointVisible || (docMode8 && dataLabelsGroupEle.gVis === HIDDEN)) {
                                dataLabel.attr({
                                    visibility: HIDDEN
                                });
                            }
                        }
                    }
                }
            }
        },


        drawGraph: function () {
            var series = this,
            options = series.options,
            chart = series.chart,
            zoomOptions = chart.options.chart && chart.options.chart.stepZoom,
            graphPath = [],
            group = series.group,
            color = options.lineColor || series.color,
            lineWidth = options.lineWidth,
            dashStyle =  options.dashStyle,
            renderer = chart.renderer,
            singlePoints = [], // used in drawTracker
            data = series.data,
            connectNullData = options.connectNullData,
            attribs;

            var zoomHistory = chart.stepZoom.zoomHistory[chart.stepZoom.currentZoomLevelIndex],
            i,
            point,
            plotX = 0,
            lastMovePoint = [],
            addMove = true,
            addLine,
            skipOverlapPoints = zoomOptions.skipOverlapPoints,
            stepping = skipOverlapPoints ? zoomHistory.stepping : 1;

            for (i = zoomHistory.seriesStart; i < data.length; i += stepping, plotX += zoomHistory.visiblePointDistance) {
                point = data[i];
                if (defined(point && point.plotY)) {
                    if (addLine) {
                        graphPath.push(M, lastMovePoint[0], lastMovePoint[1], L);
                        addLine = false;
                    }
                    if (addMove) {
                        addLine = true;
                        addMove = false
                        lastMovePoint[0] = plotX;
                        lastMovePoint[1] = point.plotY;
                    }
                    else {
                        graphPath.push(plotX, point.plotY);
                    }
                }
                else if (!connectNullData){
                    addMove = true;
                    addLine = false;
                }
            }

            // used in drawTracker:
            series.graphPath = graphPath;
            series.singlePoints = singlePoints;


            // Drawing the line point wise and storing the path elements in
            // series.graphLine array
            // graphLine is a custom key to store the path elements
            var graphLine = series.graphLine;


            attribs = {
                'stroke': color,
                'stroke-width': lineWidth,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                dashstyle: dashStyle
            };
            if (graphLine) {
                series.graphLine.animate({
                    d: graphPath
                });
            } else {
                series.graphLine = renderer.path(graphPath)
                .attr(attribs)
                .add(group)
                .shadow(options.shadow, series.shadowGroup, options.shadow);
            }
        },

        render : function () {
            var series = this,
            chart = series.chart,
            stepZoom = chart.stepZoom,
            renderer = chart.renderer,
            chartOptions = chart.options.chart,
            zoomOptions = chartOptions.stepZoom,
            conf = chart.options._FCconf,
            data = series.data,
            scrollablePXLength,
            pbw; // plot border width

            /// create the step zoom config for the chart if not done
            if (!chart.stepZoom) {
                var maxIndex = data.length - 1,
                ppp = pluckNumber(zoomOptions.pixelsperpoint, 30), // pixels-per-point
                dispStartIndex = pluckNumber(zoomOptions.displayStartIndex, 0),
                dispEndIndex = pluckNumber(zoomOptions.displayEndIndex, maxIndex),
                plotWidth = chart.plotWidth,

                scrollLeft = chart.plotLeft,
                scrollHeight = zoomOptions.scrollHeight,
                scrollTop = chart.plotHeight + chart.plotTop +
                pluckNumber(zoomOptions.scrollPadding, 0),
                visibleLength = dispEndIndex - dispStartIndex,
                pppDistance = plotWidth / visibleLength,
                maxLabelWidth = conf.maxLabelWidth,
                numVisibleLabels = conf.numVisibleLabels,
                labelSteppingDistance = conf.visibleLabelDistance,
                labelStepping = pppDistance < labelSteppingDistance ?
                    mathCeil(labelSteppingDistance / pppDistance) : 1,
                stepping = pppDistance < ppp ? mathCeil(ppp / pppDistance) : 1,
                seriesStart,
                seriesEnd,
                scrollPosition,
                scrollRatio,
                seriesPXLength,
                seriesLength,
                clipExcessWidth, // per-point pixel distance
                scroller;

                if (numVisibleLabels) {
                    labelStepping = mathCeil((dispEndIndex + 1 - dispStartIndex) / numVisibleLabels);
                }

                // Recalculate per-point pixel distance
                pppDistance = plotWidth / (visibleLength - (visibleLength % stepping));

                clipExcessWidth = conf.clipExcessWidth = maxLabelWidth || 0;

                seriesStart = dispStartIndex % stepping;
                seriesEnd = (maxIndex - (maxIndex % stepping)) || 1;
                seriesLength = seriesEnd - seriesStart,
                seriesPXLength = seriesLength * pppDistance;
                scrollRatio = plotWidth / seriesPXLength;
                scrollablePXLength = seriesPXLength - plotWidth;
                if (scrollablePXLength > 0) {
                    scrollPosition = ((dispStartIndex - seriesStart)* pppDistance) / (seriesPXLength - plotWidth);
                }
                else {
                    scrollPosition = 0
                }

                pbw = chartOptions.plotBorderWidth;
                scroller = renderer.scroller(scrollLeft - pbw, scrollTop,
                    plotWidth + pbw + pbw, scrollHeight,
                    true, {
                        size: zoomOptions.scrollBtnWidth,
                        padding: zoomOptions.scrollBtnPadding
                    }, conf.flatScrollBars, conf.scrollBar3DLighting)
                .attr({
                    fill : zoomOptions.scrollColor
                })
                .setScrollRatio(scrollRatio)
                .callback(function (pos, animation, resetTooltip) {
                    chartStepZoomScroll.call(chart, pos, animation, resetTooltip);
                })
                .add(chart.seriesGroup);

                chart.stepZoom = stepZoom = {
                    zoomHistory : [{
                        seriesStart : seriesStart,
                        seriesEnd : seriesEnd,
                        stepping : stepping,
                        perPointPixelDistance : pppDistance,
                        visiblePointDistance : stepping * pppDistance,
                        seriesConf : [],
                        scrollRatio: scrollRatio,
                        scrollPosition : scrollPosition,
                        scrollablePXLength: scrollablePXLength
                    }],
                    currentZoomLevelIndex : 0,
                    pixelsPerPoint : ppp,
                    displayStartIndex : dispStartIndex,
                    displayEndIndex : dispEndIndex,
                    scrollRatio: 1,
                    maxIndex : maxIndex,
                    scrollPosition: scrollPosition,
                    scrollablePXLength : scrollablePXLength,
                    scroller: scroller
                };

                // Draw the categories x-axis
                var xAxis = series.xAxis,
                axisOptions = xAxis.options,
                categories = xAxis.categories,
                labelsOptions = axisOptions.labels,
                labelArray,
                labelY,
                labelX,
                i = 0,
                length,
                str,
                positionIndex,
                xOffset,
                labelObj,
                labelTop = scrollTop + scrollHeight,
                align = labelsOptions.align,
                rotation = labelsOptions.rotation,
                css = labelsOptions.style,
                lineHeight = pluckNumber(parseInt(css.lineHeight), 12),
                pointVisible,
                categoryGroup,
                categoryGroupEle;

                // Create the category group and clipping
                stepZoom.catClipRect = renderer.clipRect(-(clipExcessWidth / 2),
                    0, plotWidth + clipExcessWidth, chart.chartHeight);

                stepZoom.catGroup = categoryGroup = renderer.g('category-labels')
                .translate(scrollLeft, labelTop)
                .clip(stepZoom.catClipRect)
                .add (chart.seriesGroup);
                categoryGroupEle = stepZoom.catGroup.element;

                if (categories && categories.length > 0) {
                    labelArray = stepZoom.catLabelArr = [];
                    length = categories.length;
                    labelY = labelsOptions.y || 0;
                    xOffset = labelsOptions.x || 0;
                    stepZoom.catLabelClipXDisplacement = - (lineHeight / 2);
                    stepZoom.xDisplacement = xOffset;
                    for (i = 0; i < length; i += 1) {
                        positionIndex = i - seriesStart;
                        pointVisible = !(positionIndex < 0 || positionIndex % labelStepping !== 0);
                        str = categories[i];
                        if (defined(str)) {
                            labelX = (positionIndex * pppDistance) + xOffset;
                            labelObj = labelArray[i] = renderer.text(str,
                                labelX, labelY)

                            // without position absolute, IE export sometimes is
                            // wrong
                            .css(css);

                            // build formatted text
                            if ((labelObj.textStr !== undefined) && hasSVG) {
                                renderer.buildText(labelObj);
                            }

                            if (pointVisible) {
                                categoryGroupEle.appendChild(labelObj.element);
                                labelObj.added = true;
                            }
                            else {
                                labelObj._parentNode = categoryGroup;
                                renderer.pending.push(labelObj);
                            }
                            // attr is done later to force updateTransform on
                            // unconventional add.
                            labelObj.attr({
                                align: align,
                                rotation: rotation
                            });

                            if (!pointVisible || (docMode8 && categoryGroupEle.gVis === HIDDEN)) {
                                labelObj.attr({
                                    visibility: HIDDEN
                                });
                            }
                        }
                    }

                }
                scroller.setScrollPosition(scrollPosition);
            }

            var group,
                options = series.options,
                animation = options.animation,
                doAnimation = animation && series.animate,
                duration = doAnimation ?
                        (animation && animation.duration) || 500 : 0,
                clipRect = series.clipRect,
                xShift = stepZoom.scrollPosition * stepZoom.scrollablePXLength;


            // Add plot area clipping rectangle. If this is before chart.hasRendered,
            // create one shared clipRect.
            if (!clipRect) {
                clipRect = series.clipRect = !chart.hasRendered && chart.clipRect ?
                chart.clipRect : renderer.clipRect(xShift, 0,
                    chart.plotSizeX, chart.plotSizeY);

                if (!chart.clipRect) {
                    chart.clipRect = clipRect;
                }
            }

            // the group
            if (!series.group) {
                group = series.group = renderer.g('series');
                group.clip(series.clipRect)
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    zIndex: options.zIndex
                })
                .translate(chart.plotLeft - xShift, chart.plotTop)
                .add(chart.seriesGroup);
            }

            // initiate the animation
            if (doAnimation) {
                series.animate(true);
            }

            // draw the graph if any
            if (series.drawGraph) {
                series.drawGraph();
            }

            // draw the points
            // drawing of data-labels has been made part of drawPoint
            // also separate tracker has been removed.
            series.drawPoints();

            // run the animation
            if (doAnimation) {
                series.animate();
            }

            // finish the individual clipRect
            setTimeout(function() {
                clipRect.isAnimating = false;
                group = series.group; // can be destroyed during the timeout
                if (group && clipRect !== chart.clipRect && clipRect.renderer) {
                    group.clip((series.clipRect = chart.clipRect));
                    clipRect.destroy();
                }
            }, duration);

            series.isDirty = false; // means data is in accordance with what you see

        }
    });

    // 4 - add the constractor
    seriesTypes.stepzoom = stepZoom;

    /**
     * Symbol required for ZoomLine chart.
     */
    extend(Highcharts.Renderer.prototype.symbols, {
        pinModeIcon: function (posx, posy, rad, options, renderer) {
            //posy = (posy + rad) / 2;
            var x = posx,
            y = posy - 1.5,
            r = rad,
            r1 = r * 2 / 3,
            r2 = r - r1,
            x1 = x - r,
            x2 = x + r,
            x3 = x - r1,
            x4 = x + r1,
            x5 = x - 0.5,
            x6 = x + 0.5,
            x7 = x6 + 1,
            x8 = x6 + 1.5,
            y1 = y - r,
            y2 = y + r1,
            y3 = y - r1,
            y4 = y + r2,
            y5 = y + y + 0.5,

            iPath = [M, x1, y1, L, x3, y3, x3, y4, x1, y2, x5, y2, x, y5, x6, y2, x2, y2, x4, y4, x4, y3, x2, y1,
            x8, y1, x8, y3, x8, y4, x7, y4, x7, y3, x8, y3, x8, y1, Z];

            return iPath;
        },

        zoomOutIcon: function (x, y, radius, options, renderer) {

            var
            icoX = x - 1,
            icoY = y - 1,
            rad = radius - 0.25,
            startAngle = 43 * deg2rad,
            endAngle = 48 * deg2rad, // to prevent cos and sin of start and end from becoming equal on 360 arcs
            startX = icoX + rad * mathCos(startAngle),
            startY = icoY + rad * mathSin(startAngle),
            endX = icoX + rad * mathCos(endAngle),
            endY = icoY + rad * mathSin(endAngle),
            handleHeight = 4, // the height of the handle
            handAngle = 45 * deg2rad,
            handlePosX1 = startX + handleHeight * mathCos(handAngle),
            handlePosY1 = startY + handleHeight * mathSin(handAngle),
            handlePosX2 = endX + handleHeight * mathCos(handAngle),
            handlePosY2 = endY + handleHeight * mathSin(handAngle),
            minusHalfW = 2;

            var arcPath = renderer.getArcPath(icoX, icoY, startX, startY, endX,
                endY, rad, rad, 0, 1);

            var paths = ['M', startX , startY]
            paths = paths.concat(arcPath);
            paths = paths.concat('Z', 'M', startX + 1 , startY + 1 , 'L',
                handlePosX1, handlePosY1, handlePosX2, handlePosY2, endX + 1,
                endY + 1, 'Z', 'M', icoX - minusHalfW, icoY, 'L', icoX + minusHalfW,
                icoY, 'Z')

            return paths;

        },

        resetIcon: function (x, y, radius, options, renderer) {
            var r = radius,
            startX = x - r, startY = y,
            endAngle = (piBy2 + pi) / 2,
            endX = x + r * mathCos(endAngle),
            endY = y + r * mathSin(endAngle),
            arrowLength = r * 2 / 3,

            paths = [M, startX, startY].concat(renderer.getArcPath(x, y, startX, startY,
                endX, endY, r, r, 1, 1), [L, endX + arrowLength, endY - 1, endX + 2, endY + arrowLength - 0.5, endX, endY]);

            return paths;
        }

    });






    /* ****************************************************************************
     * Start Pie#D series code                                                   *
     *****************************************************************************/

    // 1 - Set default options
    defaultPlotOptions.pie3d = merge(defaultPlotOptions.pie, {
        states: {
            hover: {}
        }
    });

    //*** helper class for SVG only

    /* Helper function */
    function normalizeAngle(angle) {
        angle = (angle || 0) % pi2;
        return angle < 0 ? pi2 + angle : angle;
    }

    function getFrontOuterIndex(endAngle, startAngle) {
        return endAngle <= pi ? endAngle : (startAngle <= pi ? startAngle : (startAngle > endAngle ? 0 : startAngle));
    }

    function getAbsScaleAngle (start, end) {
        var scaleAngle = end - start;
        return scaleAngle < 0 ? pi2 - scaleAngle : scaleAngle;
    }


    /**
     * Function that returns the arcTangent of a mouse-click with respect to a point.
     * @param {Array} center has the x,y point for which the tangent has to be
     * calculated.
     * @param {object} ref is the reference frame ofsset w.r.t the current page.
     * {left, top}
     */
    var getClickArcTangent = function (center, ref) {
        return mathATan2(center[1] - (this.pageY || (this.originalEvent &&
            this.originalEvent.pageY)) + ref.top, center[0] - (this.pageX ||
            (this.originalEvent && this.originalEvent.pageX)) + ref.left);
    };

    //Pie 3D point class
    function pie3DManager (x, y, r, innerR, radiusYFactor, depth, seriesGroup, renderer, hasOnePoint, use3DLighting) {
        var arc1, arc2, arc3, arc4, arc5, arc6, arc7, arc8;
        if (isObject(x)) {
            y = x.y;
            r = x.r;
            innerR = x.innerR;
            radiusYFactor = x.radiusYFactor;
            depth = x.depth;
            seriesGroup = x.seriesGroup;
            renderer = x.renderer;
            x = x.x;
        }

        //set default value
        if (radiusYFactor < 0 || radiusYFactor >= 1){
            radiusYFactor = 0.6
        }
        x = x || 0;
        y = y || 0;
        r = r || 1;
        innerR = innerR || 0;
        depth = depth || 0;

        //add the values to the instance
        this.renderer = renderer;
        this.hasOnePoint = hasOnePoint;
        this.use3DLighting = use3DLighting;
        this.cx = x;
        this.cy = y;
        this.rx = r;
        this.ry = r * radiusYFactor;
        this.radiusYFactor = radiusYFactor;
        this.isDoughnut = innerR > 0;
        this.innerRx = innerR;
        this.innerRy = innerR * radiusYFactor;
        this.depth = depth;
        this.leftX = x - r;
        this.rightX = x + r;
        this.leftInnerX = x - innerR;
        this.rightInnerX = x + innerR;
        this.depthY = y + depth;
        this.topY = y - this.ry;
        this.bottomY = this.depthY + this.ry;
        //create required groups
        this.bottomBorderGroup = renderer.g('bottom-border').add(seriesGroup).translate(0, depth),
        this.outerBackGroup = renderer.g('outer-back-Side').add(seriesGroup),
        this.slicingWallsBackGroup = renderer.g('slicingWalls-back-Side').add(seriesGroup),
        this.innerBackGroup = renderer.g('inner-back-Side').add(seriesGroup),
        this.innerFrontGroup = renderer.g('inner-front-Side').add(seriesGroup),
        this.slicingWallsFrontGroup = renderer.g('slicingWalls-front-Side').add(seriesGroup),
        //this.outerFrontGroup = renderer.g('outer-front-Side').add(seriesGroup),
        this.topGroup = renderer.g('top-Side').add(seriesGroup);

        //few reusable code
        this.moveCmdArr = [M];
        this.lineCmdArr = [L];
        this.closeCmdArr = [Z];
        this.centerPoint = [x, y];
        this.leftPoint = [this.leftX, y];
        this.topPoint = [x, this.topY];
        this.rightPoint = [this.rightX, y];
        this.bottomPoint = [x, y + this.ry];
        this.leftDepthPoint = [this.leftX, this.depthY];
        this.rightDepthPoint = [this.rightX, this.depthY];
        this.leftInnerPoint = [this.leftInnerX, y];
        this.rightInnerPoint = [this.rightInnerX, y];
        this.leftInnerDepthPoint = [this.leftInnerX, this.depthY];
        this.rightInnerDepthPoint = [this.rightInnerX, this.depthY];
        this.pointElemStore = [];
        this.slicingWallsArr = [];
        arc1 = [A, this.rx, this.ry, 0, 0, 1, this.rightX, y];
        arc2 = [A, this.rx, this.ry, 0, 0, 1, this.leftX, y];
        arc3 = [A, this.rx, this.ry, 0, 0, 0, this.rightX, this.depthY];
        arc4 = [A, this.rx, this.ry, 0, 0, 0, this.leftX, this.depthY];
        arc5 = [A, this.innerRx, this.innerRy, 0, 0, 0, this.rightInnerX, y];
        arc6 = [A, this.innerRx, this.innerRy, 0, 0, 0, this.leftInnerX, y];
        arc7 = [A, this.innerRx, this.innerRy, 0, 0, 1, this.rightInnerX, this.depthY];
        arc8 = [A, this.innerRx, this.innerRy, 0, 0, 1, this.leftInnerX, this.depthY];

        if (this.isDoughnut) {
            this.topBorderPath = this.moveCmdArr.concat(this.leftPoint, arc1, arc2, this.moveCmdArr, this.leftInnerPoint, arc5, arc6);
            this.topPath = this.moveCmdArr.concat(this.leftPoint, arc1, arc2, this.lineCmdArr, this.leftInnerPoint, arc5, arc6, this.closeCmdArr);
            this.innerFrontPath = this.moveCmdArr.concat(this.leftInnerPoint, arc5, this.lineCmdArr, this.rightInnerDepthPoint, arc8, this.closeCmdArr)
            this.innerBackPath = this.moveCmdArr.concat(this.rightInnerPoint, arc6, this.lineCmdArr, this.leftInnerDepthPoint, arc7, this.closeCmdArr)
        }
        else {
            this.topPath = this.moveCmdArr.concat(this.leftPoint, arc1, arc2, this.closeCmdArr);
            this.topBorderPath = this.topPath;
        }

        this.outerBackPath = this.moveCmdArr.concat(this.leftPoint, arc1, this.lineCmdArr, this.rightDepthPoint, arc4, this.closeCmdArr);
        this.outerFrontPath = this.moveCmdArr.concat(this.rightPoint, arc2, this.lineCmdArr, this.leftDepthPoint, arc3, this.closeCmdArr);
        this.clipPathforOuter = [M, this.leftX, this.topY, L, this.rightX, this.topY,
        this.rightX, this.bottomY, this.leftX, this.bottomY, Z];
        this.clipPathforInner = [M, this.leftInnerX, this.topY, L, this.rightInnerX,
        this.topY, this.rightInnerX, this.bottomY, this.leftInnerX, this.bottomY, Z];
        this.clipPathforNoClip = [M, this.leftInnerX, this.topY, L, this.leftInnerX, this.bottomY, Z];


    }

    pie3DManager.prototype = {
        parseColor : function (color, alpha) {
            var dark1, dark2, light1, light2, light3, alpha1 = alpha / 2, colorStr1, colorStr2,
            alphaStr1, alphaStr2, colorStr3, topColor;
            if (this.use3DLighting) {
                dark1 = getDarkColor(color, 80);
                dark2 = getDarkColor(color, 75);
                light1 = getLightColor(color, 85);
                light2 = getLightColor(color, 70);
                light3 = getLightColor(color, 40);
            }
            else {
                dark1 = getDarkColor(color, 90);
                dark2 = getDarkColor(color, 87);
                light1 = getLightColor(color, 93);
                light2 = getLightColor(color, 87);
                light3 = getLightColor(color, 80);
            }
            colorStr1 = dark2 + COMMASTRING + light1 + COMMASTRING + light2 +
            COMMASTRING + light1 + COMMASTRING + dark2;
            alphaStr1 = alpha + COMMASTRING + alpha + COMMASTRING + alpha +
            COMMASTRING + alpha + COMMASTRING + alpha;
            colorStr2 = dark2 + COMMASTRING + color + COMMASTRING + light1 + COMMASTRING +
            color + COMMASTRING + dark2;
            alphaStr2 = alpha1 + COMMASTRING + alpha1 + COMMASTRING + alpha1 +
            COMMASTRING + alpha1 + COMMASTRING + alpha1;
            colorStr3 = dark2 + COMMASTRING + color + COMMASTRING + light3 + COMMASTRING +
            color + COMMASTRING + dark2;

            if (hasSVG) {
                topColor = {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        radialGradient : true,
                        cx : 0.3,
                        cy : 0.95,//calculated for x = 0.3
                        r : 1,
                        color : light2 + COMMASTRING + light1 + COMMASTRING + dark2,
                        alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                        ratio : '0,10,90'
                    }
                };
            }
            else {
                topColor = {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        color : light2 + COMMASTRING + light2 + COMMASTRING + light1 + COMMASTRING + dark2,
                        alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                        angle : -72,
                        ratio : '0,8,15,77'
                    }
                };
            }

            return {
                frontOuter : {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        x1 : 0,
                        y1 : 0,
                        x2 : 1,
                        y2 : 0,
                        color : colorStr1,
                        alpha : alphaStr1,
                        angle : 0,
                        ratio : '0,25,5,5,65'
                    }
                },
                backOuter : {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        x1 : 0,
                        y1 : 0,
                        x2 : 1,
                        y2 : 0,
                        color : colorStr3,
                        alpha : alphaStr2,
                        angle : 0,
                        ratio : '0,62,8,8,22'
                    }
                },
                frontInner : {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        x1 : 0,
                        y1 : 0,
                        x2 : 1,
                        y2 : 0,
                        color : colorStr2,
                        alpha : alphaStr2,
                        angle : 0,
                        ratio : '0,25,5,5,65'
                    }
                },
                backInner : {
                    FCcolor : {
                        gradientUnits : 'objectBoundingBox',
                        x1 : 0,
                        y1 : 0,
                        x2 : 1,
                        y2 : 0,
                        color : colorStr1,
                        alpha : alphaStr1,
                        angle : 0,
                        ratio : '0,62,8,8,22'
                    }
                },
                top : topColor,
                bottom :  convertColor(color, alpha1),
                startSlice : convertColor(dark1, alpha),
                endSlice : convertColor(dark1, alpha)

            }

        },
        rotate : function (angle) {
            if (!this.hasOnePoint) {
                var pointElemStore = this.pointElemStore,
                x = 0, ln = pointElemStore.length, point, confObject;
                for (; x < ln; x += 1) {
                    point = pointElemStore[x];
                    confObject = point._confObject;
                    confObject.start += angle;
                    confObject.end += angle;
                    this.updateSliceConf(confObject);
                }
                this.refreshDrawing();
            }
        },
        refreshDrawing : (function () {
            var getStartIndex = function (array) {
                var l,
                    i,
                    lastPos,
                    startIndex = array[0] && array[0]._conf.index,
                    currentPos,
                    index;

                lastPos = startIndex <= pi
                for (i = 1, l = array.length; i < l; i += 1) {
                    index = array[i]._conf.index;
                    currentPos = index <= pi;
                    if (currentPos != lastPos || index < startIndex) {
                        return i;
                    }
                }
                return 0;

            };
            return function () {
                var slicingWallsArr = this.slicingWallsArr, x = 0, sWall,
                ln = slicingWallsArr.length,
                startIndex,
                lastElem2 = null, lastElem3 = null, index,
                frontGroupElement = this.slicingWallsFrontGroup.element,
                backGroupElement =  this.slicingWallsBackGroup.element;
                startIndex = getStartIndex(slicingWallsArr);
                for (; x < ln; x += 1, startIndex += 1) {
                    if (startIndex === ln) {
                        startIndex = 0
                    }
                    sWall = slicingWallsArr[startIndex], index = sWall._conf.index;
                    if (index < piBy2) {
                        frontGroupElement.appendChild(sWall.element);
                    }
                    else if (index <= pi) {
                        frontGroupElement.insertBefore(sWall.element, lastElem2);
                        lastElem2 = sWall.element;
                    }
                    else if (index < pi3By2) {
                        backGroupElement.insertBefore(sWall.element, lastElem3);
                        lastElem3 = sWall.element;
                    }
                    else{
                        backGroupElement.appendChild(sWall.element);
                    }
                }
            };
        })(),
        updateSliceConf : function (pointConf, doNotApply) {
            var startOri = pointConf.start, endOri = pointConf.end,
            start = normalizeAngle(startOri), end = normalizeAngle(endOri),
            scaleAngle,
            startCos, startSin, endCos, endSin, startOuterX, startOuterY,
            startOuterTopClipX, startOuterTopClipY, endOuterTopClipX, endOuterTopClipY,
            startInnerX, startInnerY, endInnerX, endInnerY, startInnerY1, endInnerY1,
            cx = this.cx,
            cy = this.cy,
            rx = this.rx,
            ry = this.ry,
            topCliprx = rx + 2,
            topClipry = ry + 2,
            innerRx = this.innerRx,
            innerRy = this.innerRy,
            depth = this.depth,
            depthY = this.depthY,
            renderer = this.renderer,
            elements = pointConf.elements,
            startOuterY1, endOuterX, endOuterY, endOuterY1;

            //
            startCos = mathCos(start);
            startSin = mathSin(start);
            endCos = mathCos(end);
            endSin = mathSin(end);

            startOuterX = cx + (rx * startCos);
            startOuterY = cy + (ry * startSin);
            startOuterTopClipX = cx + (topCliprx * startCos);
            startOuterTopClipY = cy + (topClipry * startSin);
            startOuterY1 = startOuterY + depth;
            endOuterX = cx + (rx * endCos);
            endOuterY = cy + (ry * endSin);
            endOuterTopClipX = cx + (topCliprx * endCos);
            endOuterTopClipY = cy + (topClipry * endSin);
            endOuterY1 = endOuterY + depth;

            if (this.isDoughnut) {//doughnut like slice
                startInnerX = cx + (innerRx * startCos);
                startInnerY = cy + (innerRy * startSin);
                startInnerY1 = startInnerY + depth;
                endInnerX = cx + (innerRx * endCos);
                endInnerY = cy + (innerRy * endSin);
                endInnerY1 = endInnerY + depth;
                pointConf.startSlice = [M, startOuterX, startOuterY, L, startOuterX, startOuterY1,
                startInnerX, startInnerY1, startInnerX, startInnerY, Z];
                pointConf.endSlice = [M, endOuterX, endOuterY, L, endOuterX, endOuterY1,
                endInnerX, endInnerY1, endInnerX, endInnerY, Z];
            }
            else {
                pointConf.startSlice = [M, startOuterX, startOuterY, L, startOuterX, startOuterY1,
                cx, depthY, cx, cy, Z];
                pointConf.endSlice = [M, endOuterX, endOuterY, L, endOuterX, endOuterY1,
                cx, depthY, cx, cy, Z];
            }
            if (hasSVG) {
                if (pointConf && pointConf.clipTopPath) {
                    pointConf.clipTopPath[1] = startOuterTopClipX;
                    pointConf.clipTopPath[2] = startOuterTopClipY;
                    pointConf.clipTopPath[9] = endOuterTopClipX;
                    pointConf.clipTopPath[10] = endOuterTopClipY;
                }
                else {
                    //create the clip for top and bottom
                    pointConf.clipTopPath = [M, startOuterTopClipX, startOuterTopClipY, A, topCliprx, topClipry, 0, 0, 1, endOuterTopClipX, endOuterTopClipY,
                    L, this.cx, this.cy, Z];
                }
                pointConf.clipOuterFrontPath1 = this.clipPathforNoClip;
                if (startOri != endOri) {
                    if(start > end) {//crossed the 0 deg line
                        if (start < pi){//crossed the 180 deg line also
                            pointConf.clipOuterFrontPath1 = [M, this.leftX, this.topY, L, startOuterX, this.topY,
                            startOuterX, this.bottomY, this.leftX, this.bottomY, Z];
                            pointConf.clipOuterFrontPath = [M, endOuterX, this.topY, L, this.rightX, this.topY,
                            this.rightX, this.bottomY, endOuterX, this.bottomY, Z];
                            pointConf.clipOuterBackPath = this.clipPathforOuter;
                            if (this.isDoughnut) {
                                pointConf.clipInnerBackPath = this.clipPathforInner;
                                pointConf.clipInnerFrontPath = [M, this.leftInnerX, this.topY, L, startInnerX, this.topY,
                                startInnerX, this.bottomY, this.leftInnerX, this.bottomY, Z, M, endInnerX, this.topY, L, this.rightInnerX, this.topY,
                                this.rightInnerX, this.bottomY, endInnerX, this.bottomY, Z];
                            }
                        }
                        else if( end > pi) {//crossed the 180 deg line also
                            pointConf.clipOuterFrontPath = this.clipPathforOuter;
                            pointConf.clipOuterBackPath = [M, this.rightX, this.topY, L, startOuterX, this.topY,
                            startOuterX, this.bottomY, this.rightX, this.bottomY, Z, M, endOuterX, this.topY, L, this.leftX, this.topY,
                            this.leftX, this.bottomY, endOuterX, this.bottomY, Z];
                            if (this.isDoughnut) {
                                pointConf.clipInnerBackPath = [M, this.rightInnerX, this.topY, L, startInnerX, this.topY,
                                startInnerX, this.bottomY, this.rightInnerX, this.bottomY, Z, M, endInnerX, this.topY, L, this.leftInnerX, this.topY,
                                this.leftInnerX, this.bottomY, endInnerX, this.bottomY, Z];
                                pointConf.clipInnerFrontPath = this.clipPathforInner;
                            }
                        }
                        else {
                            pointConf.clipOuterFrontPath = [M, this.rightX, this.topY, L, endOuterX, this.topY,
                            endOuterX, this.bottomY, this.rightX, this.bottomY, Z];
                            pointConf.clipOuterBackPath = [M, this.rightX, this.topY, L, startOuterX, this.topY,
                            startOuterX, this.bottomY, this.rightX, this.bottomY, Z];
                            if (this.isDoughnut) {
                                pointConf.clipInnerBackPath = [M, this.rightInnerX, this.topY, L, startInnerX, this.topY,
                                startInnerX, this.bottomY, this.rightInnerX, this.bottomY, Z];
                                pointConf.clipInnerFrontPath = [M, this.rightInnerX, this.topY, L, endInnerX, this.topY,
                                endInnerX, this.bottomY, this.rightInnerX, this.bottomY, Z];
                            }
                        }
                    }
                    else if (start < pi){
                        if (end > pi) {//crossed the 180 deg line only
                            pointConf.clipOuterFrontPath = [M, startOuterX, this.topY, L, this.leftX, this.topY,
                            this.leftX, this.bottomY, startOuterX, this.bottomY, Z];
                            pointConf.clipOuterBackPath = [M, endOuterX, this.topY, L, this.leftX, this.topY,
                            this.leftX, this.bottomY, endOuterX, this.bottomY, Z];
                            if (this.isDoughnut) {
                                pointConf.clipInnerBackPath = [M, endInnerX, this.topY, L, this.leftInnerX, this.topY,
                                this.leftInnerX, this.bottomY, endInnerX, this.bottomY, Z];
                                pointConf.clipInnerFrontPath = [M, startInnerX, this.topY, L, this.leftInnerX, this.topY,
                                this.leftInnerX, this.bottomY, startInnerX, this.bottomY, Z];
                            }
                        }
                        else {//haven't crossed any thing
                            pointConf.clipOuterFrontPath = [M, startOuterX, this.topY, L, endOuterX, this.topY,
                            endOuterX, this.bottomY, startOuterX, this.bottomY, Z];
                            pointConf.clipOuterBackPath = this.clipPathforNoClip;
                            if (this.isDoughnut) {
                                pointConf.clipInnerBackPath = this.clipPathforNoClip;
                                pointConf.clipInnerFrontPath = [M, startInnerX, this.topY, L, endInnerX, this.topY,
                                endInnerX, this.bottomY, startInnerX, this.bottomY, Z];
                            }
                        }
                    }
                    else {//haven't crossed any thing
                        pointConf.clipOuterFrontPath = this.clipPathforNoClip;
                        pointConf.clipOuterBackPath = [M, startOuterX, this.topY, L, endOuterX, this.topY,
                        endOuterX, this.bottomY, startOuterX, this.bottomY, Z];
                        if (this.isDoughnut) {
                            pointConf.clipInnerBackPath = [M, startInnerX, this.topY, L, endInnerX, this.topY,
                            endInnerX, this.bottomY, startInnerX, this.bottomY, Z];
                            pointConf.clipInnerFrontPath = this.clipPathforNoClip;
                        }
                    }
                    scaleAngle = getAbsScaleAngle (start, end);
                    pointConf.clipTopPath[7] = scaleAngle > pi ? 1 : 0;
                }
                else {//zero Pie
                    pointConf.clipOuterFrontPath =
                    pointConf.clipOuterBackPath =
                    pointConf.clipInnerBackPath =
                    pointConf.clipInnerFrontPath = this.clipPathforNoClip;
                }



                //now apply the changes
                if (!doNotApply) {
                    pointConf.elements.startSlice._conf.index = start;
                    pointConf.elements.endSlice._conf.index = end;
                    pointConf.elements.frontOuter._conf.index = getFrontOuterIndex(end, start);

                    if (pointConf.elements.frontOuter1) {
                        pointConf.elements.frontOuter1._conf.index = start;
                        pointConf.clipOuterFront1.attr({
                            d : pointConf.clipOuterFrontPath1
                        });
                    }

                    //topPath
                    pointConf.clipTop.attr({
                        d : pointConf.clipTopPath
                    });
                    pointConf.clipOuterFront.attr({
                        d : pointConf.clipOuterFrontPath
                    });
                    pointConf.clipOuterBack.attr({
                        d : pointConf.clipOuterBackPath
                    });
                    if (this.isDoughnut) {
                        pointConf.clipInnerBack.attr({
                            d : pointConf.clipInnerBackPath
                        });
                        pointConf.clipInnerFront.attr({
                            d : pointConf.clipInnerFrontPath
                        });
                    }
                    if (this.hasOnePoint) {
                        pointConf.elements.startSlice.hide();
                        pointConf.elements.endSlice.hide();
                    }
                    else {
                        pointConf.elements.startSlice.attr({
                            d : pointConf.startSlice
                        }).show();
                        pointConf.elements.endSlice.attr({
                            d : pointConf.endSlice
                        }).show();
                    }
                }
            }
            else {//for VML
                var tempArr1, tempArr2, tempArr3, tempArr4, tempArr5, tempArr6,
                moveCmdArr = this.moveCmdArr,
                lineCmdArr = this.lineCmdArr,
                closeCmdArr = this.closeCmdArr,
                centerPoint = this.centerPoint,
                leftPoint = this.leftPoint,
                topPoint = this.topPoint,
                rightPoint = this.rightPoint,
                bottomPoint = this.bottomPoint,
                leftDepthPoint = this.leftDepthPoint,
                rightDepthPoint = this.rightDepthPoint,
                leftInnerPoint = this.leftInnerPoint,
                rightInnerPoint = this.rightInnerPoint,
                leftInnerDepthPoint = this.leftInnerDepthPoint,
                rightInnerDepthPoint = this.rightInnerDepthPoint;
                pointConf.outerFrontPath1 = [];
                if (startOri != endOri) {
                    if(start > end) {//crossed the 0 deg line
                        if (start < pi){//crossed the 180 deg line also
                            tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, this.leftX, cy, rx, ry, 1, 0);
                            tempArr3 = renderer.getArcPath(cx, cy, this.leftX, cy, this.rightX, cy, rx, ry, 1, 0);
                            tempArr5 = renderer.getArcPath(cx, cy, this.rightX, cy, endOuterX, endOuterY, rx, ry, 1, 0);
                            pointConf.outerBackPath = moveCmdArr.concat(leftPoint, tempArr3, lineCmdArr, rightDepthPoint,
                                renderer.getArcPath(cx, depthY, this.rightX,
                                    depthY, this.leftX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.outerFrontPath1 = moveCmdArr.concat( [startOuterX, startOuterY], tempArr1, lineCmdArr,
                                leftDepthPoint, renderer.getArcPath(cx, depthY, this.leftX, depthY, startOuterX, startOuterY1,
                                    rx, ry, 0, 0), closeCmdArr);
                            pointConf.outerFrontPath = moveCmdArr.concat(rightPoint,
                                tempArr5, lineCmdArr, [endOuterX, endOuterY1], renderer.getArcPath(cx, depthY, endOuterX,
                                    endOuterY1, this.rightX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.topBorderPath = moveCmdArr.concat([startOuterX, startOuterY], tempArr1, tempArr3, tempArr5);
                            if (this.isDoughnut) {
                                tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, this.rightInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr4 = renderer.getArcPath(cx, cy, this.rightInnerX, cy, this.leftInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr6 = renderer.getArcPath(cx, cy, this.leftInnerX, cy, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                                pointConf.innerBackPath = moveCmdArr.concat(rightInnerPoint, tempArr4, lineCmdArr, leftInnerDepthPoint,
                                    renderer.getArcPath(cx, depthY, this.leftInnerX, depthY, this.rightInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.innerFrontPath = moveCmdArr.concat(leftInnerPoint, tempArr6,
                                    lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                        startInnerY1, this.leftInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr, moveCmdArr,
                                    [endInnerX, endInnerY], tempArr2, lineCmdArr, rightInnerDepthPoint, renderer.getArcPath(cx,
                                        depthY, this.rightInnerX, depthY, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, tempArr6, closeCmdArr);
                                pointConf.topBorderPath = pointConf.topBorderPath.concat(moveCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, tempArr6);

                            }
                            else {
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                            }
                        }
                        else if( end > pi) {//crossed the 180 deg line also
                            tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, this.rightX, cy, rx, ry, 1, 0);
                            tempArr3 = renderer.getArcPath(cx, cy, this.rightX, cy, this.leftX, cy, rx, ry, 1, 0);
                            tempArr5 = renderer.getArcPath(cx, cy, this.leftX, cy, endOuterX, endOuterY, rx, ry, 1, 0);
                            pointConf.outerFrontPath = moveCmdArr.concat(rightPoint, tempArr3, lineCmdArr, leftDepthPoint,
                                renderer.getArcPath(cx, depthY, this.leftX,
                                    depthY, this.rightX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.outerBackPath = moveCmdArr.concat( [startOuterX, startOuterY], tempArr1, lineCmdArr,
                                rightDepthPoint, renderer.getArcPath(cx, depthY, this.rightX,
                                    depthY, startOuterX, startOuterY1, rx, ry, 0, 0), closeCmdArr, moveCmdArr, leftPoint,
                                tempArr5, lineCmdArr, [endOuterX, endOuterY1], renderer.getArcPath(cx, depthY, endOuterX,
                                    endOuterY1, this.leftX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.topBorderPath = moveCmdArr.concat([startOuterX, startOuterY], tempArr1, tempArr3, tempArr5);
                            if (this.isDoughnut) {
                                tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, this.leftInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr4 = renderer.getArcPath(cx, cy, this.leftInnerX, cy, this.rightInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr6 = renderer.getArcPath(cx, cy, this.rightInnerX, cy, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                                pointConf.innerFrontPath = moveCmdArr.concat(leftInnerPoint, tempArr4, lineCmdArr, rightInnerDepthPoint,
                                    renderer.getArcPath(cx, depthY, this.rightInnerX, depthY, this.leftInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.innerBackPath = moveCmdArr.concat(rightInnerPoint, tempArr6,
                                    lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                        startInnerY1, this.rightInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr, moveCmdArr,
                                    [endInnerX, endInnerY], tempArr2, lineCmdArr, leftInnerDepthPoint, renderer.getArcPath(cx,
                                        depthY, this.leftInnerX, depthY, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);

                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, tempArr6, closeCmdArr);
                                pointConf.topBorderPath = pointConf.topBorderPath.concat(moveCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, tempArr6);

                            }
                            else {
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                            }
                        }
                        else {
                            tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, this.rightX, cy, rx, ry, 1, 0);
                            tempArr3 = renderer.getArcPath(cx, cy, this.rightX, cy, endOuterX, endOuterY, rx, ry, 1, 0);
                            pointConf.outerFrontPath = moveCmdArr.concat(rightPoint, tempArr3, lineCmdArr, [endOuterX, endOuterY1],
                                renderer.getArcPath(cx, depthY, endOuterX,
                                    endOuterY1, this.rightX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.outerBackPath = moveCmdArr.concat( [startOuterX, startOuterY], tempArr1, lineCmdArr,
                                rightDepthPoint, renderer.getArcPath(cx, depthY, this.rightX,
                                    depthY, startOuterX, startOuterY1, rx, ry, 0, 0), closeCmdArr);
                            pointConf.topBorderPath = moveCmdArr.concat([startOuterX, startOuterY], tempArr1, tempArr3);
                            if (this.isDoughnut) {
                                tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, this.rightInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr4 = renderer.getArcPath(cx, cy, this.rightInnerX, cy, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                                pointConf.innerFrontPath = moveCmdArr.concat([endInnerX, endInnerY], tempArr2, lineCmdArr, rightInnerDepthPoint,
                                    renderer.getArcPath(cx, depthY, this.rightInnerX, depthY, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.innerBackPath = moveCmdArr.concat(rightInnerPoint, tempArr4,
                                    lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                        startInnerY1, this.rightInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, closeCmdArr);
                                pointConf.topBorderPath = pointConf.topBorderPath.concat(moveCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4);

                            }
                            else {
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                            }
                        }
                    }
                    else if (start < pi){
                        if (end > pi) {//crossed the 180 deg line only
                            tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, this.leftX, cy, rx, ry, 1, 0);
                            tempArr3 = renderer.getArcPath(cx, cy, this.leftX, cy, endOuterX, endOuterY, rx, ry, 1, 0);
                            pointConf.outerBackPath = moveCmdArr.concat(leftPoint, tempArr3, lineCmdArr, [endOuterX, endOuterY1],
                                renderer.getArcPath(cx, depthY, endOuterX,
                                    endOuterY1, this.leftX, depthY, rx, ry, 0, 0), closeCmdArr);
                            pointConf.outerFrontPath = moveCmdArr.concat( [startOuterX, startOuterY], tempArr1, lineCmdArr,
                                leftDepthPoint, renderer.getArcPath(cx, depthY, this.leftX,
                                    depthY, startOuterX, startOuterY1, rx, ry, 0, 0), closeCmdArr);
                            pointConf.topBorderPath = moveCmdArr.concat([startOuterX, startOuterY], tempArr1, tempArr3);
                            if (this.isDoughnut) {
                                tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, this.leftInnerX, cy, innerRx, innerRy, 0, 0);
                                tempArr4 = renderer.getArcPath(cx, cy, this.leftInnerX, cy, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                                pointConf.innerBackPath = moveCmdArr.concat([endInnerX, endInnerY], tempArr2, lineCmdArr, leftInnerDepthPoint,
                                    renderer.getArcPath(cx, depthY, this.leftInnerX, depthY, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.innerFrontPath = moveCmdArr.concat(leftInnerPoint, tempArr4,
                                    lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                        startInnerY1, this.leftInnerX, depthY, innerRx, innerRy, 1, 0), closeCmdArr);
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4, closeCmdArr);
                                pointConf.topBorderPath = pointConf.topBorderPath.concat(moveCmdArr, [endInnerX, endInnerY], tempArr2, tempArr4);

                            }
                            else {
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                            }
                        }
                        else {//haven't crossed any thing
                            tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, endOuterX, endOuterY, rx, ry, 1, 0);
                            pointConf.outerBackPath = moveCmdArr.concat([startOuterX, startOuterY]);
                            pointConf.topBorderPath = pointConf.outerBackPath.concat(tempArr1);
                            pointConf.outerFrontPath = pointConf.topBorderPath.concat( lineCmdArr,
                                [endOuterX, endOuterY1], renderer.getArcPath(cx, depthY, endOuterX,
                                    endOuterY1, startOuterX, startOuterY1, rx, ry, 0, 0), closeCmdArr);
                            if (this.isDoughnut) {
                                tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                                pointConf.innerBackPath = moveCmdArr.concat([endInnerX, endInnerY]);
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, closeCmdArr);
                                pointConf.topBorderPath = pointConf.topBorderPath.concat(moveCmdArr, [endInnerX, endInnerY], tempArr2);
                                pointConf.innerFrontPath = pointConf.innerBackPath.concat(tempArr2,
                                    lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                        startInnerY1, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);

                            }
                            else {
                                pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                            }
                        }
                    }
                    else {//haven't crossed any thing
                        tempArr1 = renderer.getArcPath(cx, cy, startOuterX, startOuterY, endOuterX, endOuterY, rx, ry, 1, 0);
                        pointConf.outerFrontPath = moveCmdArr.concat([startOuterX, startOuterY]);
                        pointConf.topBorderPath = pointConf.outerFrontPath.concat(tempArr1);
                        pointConf.outerBackPath = pointConf.topBorderPath.concat( lineCmdArr,
                            [endOuterX, endOuterY1], renderer.getArcPath(cx, depthY, endOuterX,
                                endOuterY1, startOuterX, startOuterY1, rx, ry, 0, 0), closeCmdArr);
                        if (this.isDoughnut) {
                            tempArr2 = renderer.getArcPath(cx, cy, endInnerX, endInnerY, startInnerX, startInnerY, innerRx, innerRy, 0, 0);
                            pointConf.innerFrontPath = moveCmdArr.concat([endInnerX, endInnerY]);
                            pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, [endInnerX, endInnerY], tempArr2, closeCmdArr);
                            pointConf.topBorderPath = pointConf.topBorderPath.concat(pointConf.innerFrontPath, tempArr2);
                            pointConf.innerBackPath = pointConf.innerFrontPath.concat(tempArr2,
                                lineCmdArr, [startInnerX, startInnerY1], renderer.getArcPath(cx, depthY, startInnerX,
                                    startInnerY1, endInnerX, endInnerY1, innerRx, innerRy, 1, 0), closeCmdArr);

                        }
                        else {
                            pointConf.topPath = pointConf.topBorderPath.concat(lineCmdArr, centerPoint, closeCmdArr);
                        }
                    }
                    //enlarge the bounded box so that the gradient works perfactly
                    tempArr1 = moveCmdArr.concat(leftPoint, lineCmdArr, rightPoint);
                    tempArr2 = moveCmdArr.concat(topPoint, lineCmdArr, bottomPoint);
                    pointConf.topPath = pointConf.topPath.concat(tempArr1, tempArr2);
                    pointConf.outerFrontPath = pointConf.outerFrontPath.concat(tempArr1);
                    pointConf.outerFrontPath1 = pointConf.outerFrontPath1.concat(tempArr1);
                    pointConf.outerBackPath = pointConf.outerBackPath.concat(tempArr1);

                    if (this.isDoughnut) {
                        tempArr2 = moveCmdArr.concat(leftInnerPoint, lineCmdArr, rightInnerPoint);
                        pointConf.innerFrontPath = pointConf.innerFrontPath.concat(tempArr2);
                        pointConf.innerBackPath = pointConf.innerBackPath.concat(tempArr2);
                    }
                }
                else {//zero Pie
                    pointConf.topPath =
                    pointConf.outerFrontPath =
                    pointConf.outerBackPath = [];
                    if (this.isDoughnut) {
                        pointConf.innerFrontPath =
                        pointConf.innerBackPath = [];
                    }
                }

                //now apply the changes
                if (!doNotApply) {
                    pointConf.elements.startSlice._conf.index = start;
                    pointConf.elements.endSlice._conf.index = end;
                    pointConf.elements.frontOuter._conf.index = getFrontOuterIndex(end, start);
                    if (pointConf.elements.frontOuter1) {
                        pointConf.elements.frontOuter1._conf.index = start;
                        elements.frontOuter1.attr({
                            d : pointConf.outerFrontPath1
                        });
                    }
                    pointConf.thisElement.attr({
                        d : pointConf.topPath
                    });
                    elements.topBorder.attr({
                        d : pointConf.topBorderPath
                    });
                    elements.bottom.attr({
                        d : pointConf.topPath
                    });
                    elements.bottomBorder.attr({
                        d : pointConf.topBorderPath
                    });
                    elements.frontOuter.attr({
                        d : pointConf.outerFrontPath
                    });
                    elements.backOuter.attr({
                        d : pointConf.outerBackPath
                    });
                    if (this.isDoughnut) {
                        elements.frontInner.attr({
                            d : pointConf.innerFrontPath
                        });
                        elements.backInner.attr({
                            d : pointConf.innerBackPath
                        });
                    }

                    if (this.hasOnePoint) {
                        pointConf.elements.startSlice.hide();
                        pointConf.elements.endSlice.hide();
                    }
                    else {
                        pointConf.elements.startSlice.attr({
                            d : pointConf.startSlice
                        }).show();
                        pointConf.elements.endSlice.attr({
                            d : pointConf.endSlice
                        }).show();
                    }
                }
            }
        },

        createSlice: (function () {
            var attrKeyList = {
                stroke: true,
                strokeWidth: true,
                'stroke-width': true,
                dashstyle: true,
                'stroke-dasharray': true,
                translateX: true,
                translateY: true,
                'stroke-opacity': true,
                //block following attribute
                fill: true,
                opacity: true,
                isTracker : true,
                start: true,
                end : true
            },
            attrFN = function (hash, val) {
                var key,
                value,
                slice = this,
                confObject = slice._confObject, attrObj,
                elements = confObject.elements, x, updateSliceConf,
                pie3DManager = confObject.pie3DManager;

                // single key-value pair
                if (isString(hash) && defined(val)) {
                    key = hash;
                    hash = {};
                    hash[key] = val;
                }

                // used as a getter: first argument is a string, second is undefined
                if (isString(hash)) {
                    //if belongs from the list then handle here
                    if (attrKeyList[hash]) {
                        slice = confObject[hash];
                    }
                    else {//else leve for the original attr
                        slice = slice._attr(hash);
                    }

                // setter
                } else {

                    for (key in hash) {
                        value = hash[key];

                        //if belongs from the list then handle here
                        if (attrKeyList[key]) {
                            //store the att in confObject for further use
                            confObject[key] = value;
                            if (key === 'translateX' || key === 'translateY' || key === 'isTracker') {
                                attrObj = {};
                                attrObj[key] = value;
                                //other elements
                                for (x in elements) {
                                    elements[x].attr(attrObj);
                                }
                                //main element
                                slice._attr(attrObj);
                            }
                            else if (key === 'stroke' || key === 'strokeWidth'
                                || key === 'stroke-width' || key === 'dashstyle'
                                || key === 'stroke-dasharray') {
                                //element that has stroke effect
                                attrObj = {};
                                attrObj[key] = value;
                                elements.topBorder.attr(attrObj);
                                elements.startSlice.attr(attrObj);
                                elements.endSlice.attr(attrObj);
                                elements.bottomBorder.attr(attrObj);
                            }
                            //if it is 'fill' or 'lighting3D' the redefine the colors for all the 3 elements
                            else if (key === 'fill') {
                            }
                            else if (key === 'start' || key === 'end') {
                                updateSliceConf = true;
                            }

                        }
                        else {//else leve for the original attr
                            slice._attr(key, value);
                        }
                    }
                    if (updateSliceConf) {
                        pie3DManager.updateSliceConf(confObject);
                        //refreash the drawinh for proper z lavel for elements
                        pie3DManager.refreshDrawing();
                    }

                }
                return slice;
            },
            onFN = function (eventType, handler) {
                var confObject = this._confObject,
                elements = confObject.elements, x;
                //other elements
                for (x in elements) {
                    elements[x].on(eventType, handler);
                }
                //main element
                return this._on(eventType, handler);
            },
            hideFN = function () {
                var confObject = this._confObject,
                elements = confObject.elements, x;
                //other elements
                for (x in elements) {
                    elements[x].hide();
                }
                //main element
                return this._hide();
            },
            showFN = function () {
                var confObject = this._confObject,
                elements = confObject.elements, x;
                //other elements
                for (x in elements) {
                    elements[x].show();
                }
                //main element
                return this._show();
            },
            destroyFN = function () {
                var confObject = this._confObject,
                elements = confObject.elements, x;
                //other elements
                for (x in elements) {
                    elements[x].destroy();
                }
                if (hasSVG) {
                    //destory other element
                    confObject.clipTop.destroy();
                    confObject.clipOuterFront.destroy();
                    confObject.clipOuterBack.destroy();
                    if (confObject.clipOuterFront1) {
                        confObject.clipOuterFront1.destroy();
                    }
                    if (confObject.clipInnerFront) {
                        confObject.clipInnerFront.destroy();
                    }
                    if (confObject.clipInnerBack) {
                        confObject.clipInnerBack.destroy();
                    }
                }
                //main element
                return this._destroy();
            };


            return function (start, end, color, alpha, borderColor, borderWidth, positionIndex) {

                var renderer = this.renderer,
                colorObj = this.parseColor(color, alpha),
                returnElement, confObject = {
                    start : start,
                    end : end,
                    elements : {},
                    pie3DManager : this,
                    topPath : this.topPath,
                    topBorderPath : this.topBorderPath,
                    outerFrontPath : this.outerFrontPath,
                    outerFrontPath1 : this.outerFrontPath,
                    outerBackPath : this.outerBackPath,
                    innerFrontPath : this.innerFrontPath,
                    innerBackPath : this.innerBackPath
                },
                slicingWallsArr = this.slicingWallsArr,
                elements = confObject.elements,
                startAngle, endAngle, scaleAngle;
                //update the configuration
                this.updateSliceConf(confObject, true)




                //create and put all paths
                // top
                returnElement = renderer.path(confObject.topPath)
                .attr({
                    fill: colorObj.top,
                    'stroke-width' : 0
                })
                .add(this.topGroup);

                // top border
                elements.topBorder = renderer.path(confObject.topBorderPath)
                .attr({
                    stroke: borderColor,
                    'stroke-width' : borderWidth
                })
                .add(this.topGroup);

                // bottom
                elements.bottom = renderer.path(confObject.topPath)
                .attr({
                    fill: colorObj.bottom,
                    'stroke-width' : 0
                })
                .add(this.bottomBorderGroup)
                // bottom
                elements.bottomBorder = renderer.path(confObject.topBorderPath)
                .attr({
                    stroke: borderColor,
                    'stroke-width' : borderWidth
                })
                .add(this.bottomBorderGroup);
                // outerFront
                elements.frontOuter = renderer.path(confObject.outerFrontPath)
                .attr({
                    fill: colorObj.frontOuter,
                    'stroke-width' : 0
                })
                .add(this.slicingWallsFrontGroup);

                // outerback
                elements.backOuter = renderer.path(confObject.outerBackPath)
                .attr({
                    fill: colorObj.backOuter,
                    'stroke-width' : 0
                })
                .add(this.outerBackGroup);

                // startSlice
                //whenAtBack
                elements.startSlice = renderer.path(confObject.startSlice)
                .attr({
                    fill: colorObj.startSlice,
                    stroke: borderColor,
                    'stroke-width' : borderWidth
                })
                .add(this.slicingWallsFrontGroup);


                // ensSlice
                //whenAtBack
                elements.endSlice = renderer.path(confObject.endSlice)
                .attr({
                    fill: colorObj.endSlice,
                    stroke: borderColor,
                    'stroke-width' : borderWidth
                })
                .add(this.slicingWallsFrontGroup);


                startAngle = normalizeAngle(confObject.start);
                endAngle = normalizeAngle(confObject.end);
                scaleAngle = getAbsScaleAngle (startAngle, endAngle);

                if (scaleAngle > pi) {
                    // outerFront
                    elements.frontOuter1 = renderer.path(confObject.outerFrontPath1)
                    .attr({
                        fill: colorObj.frontOuter,
                        'stroke-width' : 0
                    })
                    .add(this.slicingWallsFrontGroup);
                    //add all slice in slicingWallsArr
                    slicingWallsArr.push(elements.startSlice, elements.frontOuter1,
                        elements.frontOuter, elements.endSlice);
                    elements.frontOuter1._conf = {
                        index : startAngle,
                        isStart : 0.5,
                        pIndex : positionIndex
                    };
                    if (hasSVG) {
                        confObject.clipOuterFront1 = renderer.clipPath(confObject.clipOuterFrontPath1);
                        elements.frontOuter1.clip(confObject.clipOuterFront1);
                    }
                }
                else {
                    //add all slice in slicingWallsArr
                    slicingWallsArr.push(elements.startSlice, elements.frontOuter, elements.endSlice);
                }



                elements.frontOuter._conf = {
                    index : getFrontOuterIndex(endAngle, startAngle),
                    isStart : 0.5,
                    pIndex : positionIndex
                };
                elements.startSlice._conf = {
                    index : startAngle,
                    isStart : 0,
                    pIndex : positionIndex
                };
                elements.endSlice._conf = {
                    index : endAngle,
                    isStart : 1,
                    pIndex : positionIndex
                };


                if (this.hasOnePoint) {
                    elements.startSlice.hide();
                    elements.endSlice.hide();
                }

                if (this.isDoughnut) {
                    // innerFront
                    elements.frontInner = renderer.path(confObject.innerFrontPath)
                    .attr({
                        fill: colorObj.frontInner,
                        'stroke-width' : 0
                    })
                    .add(this.innerFrontGroup);

                    // innerBack
                    elements.backInner = renderer.path(confObject.innerBackPath)
                    .attr({
                        fill: colorObj.backInner,
                        'stroke-width' : 0
                    })
                    .add(this.innerBackGroup);
                }

                if (hasSVG) {
                    confObject.clipTop = renderer.clipPath(confObject.clipTopPath);
                    confObject.clipOuterFront = renderer.clipPath(confObject.clipOuterFrontPath);
                    confObject.clipOuterBack = renderer.clipPath(confObject.clipOuterBackPath);
                    returnElement.clip(confObject.clipTop)
                    elements.topBorder.clip(confObject.clipTop)
                    elements.bottom.clip(confObject.clipTop)
                    elements.bottomBorder.clip(confObject.clipTop)
                    elements.frontOuter.clip(confObject.clipOuterFront)
                    elements.backOuter.clip(confObject.clipOuterBack)
                    if (this.isDoughnut) {
                        confObject.clipInnerFront = renderer.clipPath(confObject.clipInnerFrontPath);
                        confObject.clipInnerBack = renderer.clipPath(confObject.clipInnerBackPath);
                        elements.frontInner.clip(confObject.clipInnerFront);
                        elements.backInner.clip(confObject.clipInnerBack);
                    }
                }





                //store the _confObject reference
                returnElement._confObject = confObject;
                confObject.thisElement = returnElement;
                //modify few core function

                returnElement._destroy = returnElement.destroy;
                returnElement.destroy = destroyFN;

                returnElement._show = returnElement.show;
                returnElement.show = showFN;

                returnElement._hide = returnElement.hide;
                returnElement.hide = hideFN;

                returnElement._on = returnElement.on;
                returnElement.on = onFN;

                returnElement._attr = returnElement.attr;
                returnElement.attr = attrFN;

                //add the element to the store
                this.pointElemStore.push(returnElement);

                return returnElement;

            };
        })()
    };

    pie3DManager.prototype.constructor = pie3DManager;

    var pie3D = Highcharts.extendClass(seriesTypes.pie, {
        type: 'pie3d',

        translate: function() {
            var total = 0,
            series = this,
            /**^
             * @source 10263/2.1.4
             * @code
             * cumulative = -0.25, // start at top
             * options = series.options,
             */
            precision = 1000, // issue #172
            options = series.options,
            startingAngle = (pluck(this.chart.options.chart.startingAngle, 0) % 360),
            labelsDistance = pluckNumber(options.dataLabels.distance, 20),
            fontSize,
            slicedOffset = series.slicedOffset = options.slicedOffset,
            connectorOffset = slicedOffset + options.borderWidth,
            positions = extend2([], options.center),
            chart = series.chart,
            /* EOP 10263/2.1.4 ^*/
            plotWidth = chart.plotWidth,
            plotHeight = chart.plotHeight,
            start,
            end,
            angle,
            data = series.data,
            fraction,
            smallestSize = mathMin(plotWidth, plotHeight),
            isPercent,
            radiusX, // the x component of the radius vector for a given point
            radiusY,
            labelDistance = options.dataLabels.distance,
            pieYScale = series.pieYScale = options.pieYScale,
            pieSliceDepth = series.pieSliceDepth = options.pieSliceDepth,
            managedPieSliceDepth = series.managedPieSliceDepth = options.managedPieSliceDepth,
            slicedOffsetY = series.slicedOffsetY = slicedOffset * pieYScale;
            // get positions - either an integer or a percentage string must be given
            positions.push(options.size, options.innerSize || 0);
            positions = map(positions, function(length, i) {
                isPercent = /%$/.test(length);
                return isPercent ?
                // i == 0: centerX, relative to width
                // i == 1: centerY, relative to height
                // i == 2: size, relative to smallestSize
                // i == 4: innerSize, relative to smallestSize
                [plotWidth, plotHeight - managedPieSliceDepth, smallestSize, smallestSize][i] *
                pInt(length) / 100:
                length;
            });
            //convert all diameter into radius
            positions[2] /= 2;
            positions[3] /= 2;
            //Add the ry
            positions.push(positions[2] * pieYScale);
            //centerRadiusX
            positions.push((positions[2] + positions[3]) / 2);
            //centerRadiusY
            positions.push(positions[5] * pieYScale);

            // utility for getting the x value from a given y, used for anticollision logic in data labels
            series.getX = function(y, left) {

                angle = math.asin((y - positions[1]) / (positions[2] + labelDistance));

                return positions[0] +
                (left ? -1 : 1) *
                (mathCos(angle) * (positions[2] + labelDistance));
            };

            // set center for later use
            series.center = positions;

            // get the total sum
            each(data, function(point) {
                total += point.y;
            });

            series.labelsRadius = positions[2] + labelsDistance;
            series.labelsRadiusY = series.labelsRadius * pieYScale;
            series.quadrantHeight = (plotHeight - managedPieSliceDepth) / 2;
            series.quadrantWidth = plotWidth / 2;

            var labelsOptions = options.dataLabels,
            lastEnd = -startingAngle * deg2rad,
            maxEnd;
            lastEnd = mathRound(lastEnd * precision) / precision;
            maxEnd = lastEnd + pi2;

            fontSize = pluckNumber(parseInt(labelsOptions.style.fontSize, 10), 10) + 4,//2px padding
            series.maxLabels = Math.floor(series.quadrantHeight / fontSize); //max labels per quarter
            series.labelFontSize = fontSize;
            series.connectorPadding = pluckNumber(labelsOptions.connectorPadding, 5);
            series.isSmartLineSlanted = pluck(labelsOptions.isSmartLineSlanted, true);
            series.connectorWidth = pluckNumber(labelsOptions.connectorWidth, 1);
            series.enableSmartLabels = labelsOptions.enableSmartLabels;

            if (!series.pie3DManager) {
                series.pie3DManager = new pie3DManager(positions[0], positions[1], positions[2], positions[3],
                    pieYScale, pieSliceDepth, undefined, chart.renderer, series.data.length === 1, options.use3DLighting);
            }


            each(data, function(point) {
                // set start and end angle
                start = lastEnd;
                fraction = total ? point.y / total : 0;

                lastEnd = mathRound((lastEnd + (fraction * pi2)) * precision) / precision;
                if (lastEnd > maxEnd) {
                    lastEnd = maxEnd;
                }
                end = lastEnd;

                // set the shape
                point.shapeArgs = {
                    start: start,
                    end: end
                };



                // center for the sliced out slice
                point.centerAngle = angle = ((end + start) / 2) % pi2;
                point.slicedTranslation = map([
                    mathCos(angle) * slicedOffset + chart.plotLeft,
                    mathSin(angle) * slicedOffsetY + chart.plotTop
                    ], mathRound);

                // set the anchor point for tooltips
                radiusX = mathCos(angle) * positions[2];
                series.radiusY = radiusY = mathSin(angle) * positions[4];
                point.tooltipPos = [
                positions[0] + radiusX * 0.7,
                positions[1] + radiusY//changed to reducr mouce on tooltip condition
                ];

                // API properties
                point.percentage = fraction * 100;
                point.total = total;

            });


            this.setTooltipPoints();
        },

        /**^
         * Modified data labels function
         */
        /**
	 * Override the base drawDataLabels method by pie specific functionality
	 */
        drawDataLabels: (function () {
            /*
             * Pie Helper Functions.
             */
            var sortArrayByPoint = function (a, b) {
                return a.point.y - b.point.y;
            },
            sortArrayByAngle = function (a, b) {
                return a.angle - b.angle;
            },
            alignments = ['left', 'left', 'right', 'right'],
            alignCenter = 'center',
            ySign = [-1, 1, 1, -1],
            xSign = [1, 1, -1, -1];

            return function(isRotating) {
                var series = this,
                data = series.data,
                point,
                angle,
                chart = series.chart,
                SmartLabel = chart.options.instanceAPI.smartLabel,
                options = series.options.dataLabels,
                style = options.style,
                lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                placeInside = options.placeInside,
                skipOverlapLabels = options.skipOverlapLabels,
                manageLabelOverflow = options.manageLabelOverflow,
                connectorPadding = series.connectorPadding,
                connectorWidth = series.connectorWidth,
                connector,
                connectorPath,
                distanceOption = options.distance,
                softConnector = pick(options.softConnector, true),
                outside = distanceOption > 0,
                remainingHeight,
                center = series.center,
                centerY = center[1],
                centerX = center[0],
                radius = center[2],
                radiusY = center[4],
                quarters = [// divide the points into quarters for anti collision
                [], // top right
                [], // bottom right
                [], // bottom left
                [] // top left
                ],
                quarter,
                align,
                i,
                plotLeft = chart.plotLeft,
                plotTop = chart.plotTop,
                plotWidth = chart.plotSizeX,
                labelWidth, labelStr,
                j,
                oriY,
                maxYmayHave,
                spaceRequired,
                length,
                k,
                sliced,
                x1, x2, x3, y1, y2, y3,
                points,
                dataLabelsRadius = series.labelsRadius,
                dataLabelsRadiusY = series.labelsRadiusY,
                excess,
                excessArr,
                labelFontSize = series.labelFontSize,
                labelHeight = labelFontSize,
                halfLabelHeight = labelHeight / 2,
                xDisplacement = [connectorPadding, connectorPadding, -connectorPadding, -connectorPadding],
                maxLabels = series.maxLabels,
                isSmartLineSlanted = series.isSmartLineSlanted,
                enableSmartLabels = series.enableSmartLabels,
                labelQuardentHeight, maxQuardentLabel, dataLabel,
                pieSliceDepthHalf = series.pieSliceDepth / 2;

                // run parent method
                /**^
                 * Introduced the isRotating argument too to detect
                 * whether this is called during rotation.
                 * @source 10489/2.1.4
                 * @code
                 * Series.prototype.drawDataLabels.apply(series);
                 */
                if (!isRotating) {
                    Series.prototype.drawDataLabels.apply(series);
                    //do not set the style every time
                    // Do it for first time
                    SmartLabel.setStyle(style)
                }
                /* EOP 10489/2.1.4 ^*/

                // arrange points for detection collision
                // Creates an array of quarter containing labels of each quarter
                //if there has only one label the draw it inside
                if (data.length == 1) {
                    point = data[0];
                    dataLabel = point.dataLabel;
                    point.slicedTranslation = [plotLeft, plotTop];
                    if (dataLabel) {
                        dataLabel.attr({
                            visibility: VISIBLE,
                            align: alignCenter,
                            x: centerX,
                            y: centerY + halfLabelHeight - 2
                        });
                        dataLabel.x = centerX;
                    }
                }
                else {
                    if (placeInside){
                        each(data, function (point) {
                            dataLabel = point.dataLabel;
                            if (dataLabel) {
                                var angle = point.centerAngle;
                                y3 = centerY + (center[6] * mathSin(angle)) + halfLabelHeight - 2;
                                x3 = centerX + (center[5] * mathCos(angle));
                                dataLabel.x = x3;
                                // storing original x value
                                // to use while slicing in (IE Issue original x get changed form animate)
                                dataLabel._x = x3;

                                dataLabel.y = y3
                                if (point.sliced) {
                                    var slicedTranslation = point.slicedTranslation,
                                    transX = slicedTranslation[0] - plotLeft,
                                    transY = slicedTranslation[1] - plotTop;
                                    x3 = x3 + transX;
                                    y3 = y3 + transY;
                                }
                                dataLabel.attr({
                                    visibility: VISIBLE,
                                    align: alignCenter,
                                    x: x3,
                                    y: y3
                                });

                                // Creating text bound for dataLabels of Pie chart
                                point.dataLabelBG = dataLabel.textBound();
                            }
                        });
                    }
                    else {//outside
                        each(data, function(point) {
                            dataLabel = point.dataLabel;
                            if (dataLabel) {
                                dataLabel.on('click', function (e) {
                                        point.firePointEvent('click', e);
                                    });
                                var angle = point.centerAngle,
                                quarter;

                                if (angle < 0) {
                                    angle = pi2 + angle;
                                }
                                // Calculate top right quarter labels
                                if (angle < piBy2) {
                                    quarter = 1;
                                } else
                                // Calculate bottom right quarter labels
                                if (angle < pi) {
                                    quarter = 2;
                                } else
                                // Calculate bottom left quarter labels
                                if (angle < (pi3By2)) {
                                    quarter = 3;
                                }
                                // Calculate bottom left quarter labels
                                else {
                                    quarter = 0;
                                }
                                // Now put labels according to each quarter
                                quarters[quarter].push({
                                    point : point,
                                    angle : angle
                                });
                            }
                        });

                        i = k = 4;
                        //if excess then remove the low value slice first
                        while (i --) {
                            if (skipOverlapLabels) {
                                // Find labels can fit into the quarters or not
                                excess = quarters[i].length - maxLabels;
                                if (excess > 0) {
                                    quarters[i].sort(sortArrayByPoint); // sort by point.y
                                    // remove extra data form the array
                                    // which labels can not be fitted into the quarters
                                    excessArr = quarters[i].splice(0, excess);
                                    //hide all removed labels
                                    for (j = 0, length = excessArr.length; j < length; j += 1) {
                                        point = excessArr[j].point;
                                        point.dataLabel.attr({
                                            visibility: HIDDEN
                                        });
                                        if (point.connector) {
                                            point.connector.attr({
                                                visibility: HIDDEN
                                            });
                                        }
                                    }
                                }
                            }
                            // now we sort the data labels by its label angle
                            quarters[i].sort(sortArrayByAngle);
                        }

                        maxQuardentLabel = mathMax(quarters[0].length, quarters[1].length, quarters[2].length, quarters[3].length);
                        labelQuardentHeight = mathMax(mathMin(maxQuardentLabel, maxLabels) * labelHeight, dataLabelsRadiusY)

                        // reverse 1st and 3rd quardent points
                        quarters[1].reverse();
                        quarters[3].reverse();
                        while (k --) {
                            points = quarters[k];
                            length = points.length;

                            //if ! if (skipOverlapLabels) {
                            if (!skipOverlapLabels) {
                                if (length > maxLabels) {
                                    labelHeight = labelQuardentHeight / length
                                }
                                else {
                                    labelHeight = labelFontSize;
                                }
                                halfLabelHeight = labelHeight / 2;
                            }


                            //1st pass
                            //place all labels at 1st quarter

                            // calculate the total available space to put labels
                            spaceRequired = (length * labelHeight) - halfLabelHeight;
                            // calculate the remaining height
                            remainingHeight = labelQuardentHeight + halfLabelHeight;
                            //place all child point
                            for (i = 0; i < length; i += 1, spaceRequired -= labelHeight) {
                                // Get the y position of the label (radius where data label is to draw)
                                oriY = mathAbs(labelQuardentHeight * mathSin(points[i].angle));
                                if (remainingHeight - oriY < labelHeight) {
                                    oriY = remainingHeight - labelHeight;
                                }
                                else if (oriY < spaceRequired) {
                                    oriY = spaceRequired;
                                }
                                remainingHeight = points[i].oriY = oriY;
                            }

                            //2nd pass(reverse)
                            align = alignments[k];
                            //place all labels at 1st quarter
                            maxYmayHave = labelQuardentHeight - (length * labelHeight) + halfLabelHeight;
                            remainingHeight = - halfLabelHeight;

                            //place all child point
                            for (i = points.length - 1; i >= 0; i -= 1, maxYmayHave += labelHeight) {
                                point = points[i].point;
                                angle = points[i].angle;
                                sliced = point.sliced;
                                dataLabel = point.dataLabel;
                                oriY = mathAbs(labelQuardentHeight * mathSin(angle));
                                if (oriY - remainingHeight < labelHeight) {
                                    oriY = remainingHeight + labelHeight;
                                }
                                else if (oriY > maxYmayHave) {
                                    oriY = maxYmayHave;
                                }
                                remainingHeight = oriY;

                                y1 = ((oriY + points[i].oriY) / 2);
                                //y1 = ySiagn[k] *  (0 + points[i].oriY);
                                x1 = centerX + xSign[k] * dataLabelsRadius * mathCos(math.asin(y1 / labelQuardentHeight));
                                //x1 = centerX + xSiagn[k] * dataLabelsRadius * mathSqrt(quadrantHeightSqrt - y1 * y1);
                                y1 *= ySign[k];
                                y1 += centerY;


                                y2 = centerY + (radiusY * mathSin(angle));
                                x2 = centerX + (radius * mathCos(angle));

                                x3 = x1 + xDisplacement[k];
                                y3 = y1 + halfLabelHeight - 2;
                                dataLabel.x = x3;
                                // storing original x value
                                // to use while slicing in (IE Issue original x get changed form animate)
                                dataLabel._x = x3;
                                if (manageLabelOverflow) {
                                    labelWidth = k > 1 ? x3 : plotWidth - x3;
                                    labelStr = dataLabel._str = dataLabel._str ||
                                    dataLabel.textStr ||
                                    (dataLabel.element && dataLabel.element.innerHTML);
                                    dataLabel.attr({
                                        text: SmartLabel.getSmartText(labelStr, labelWidth, lineHeight).text
                                    })
                                }

                                //shift the labels at front pieSliceDepthHalf
                                if (angle < pi) {
                                    y1 += pieSliceDepthHalf;
                                    y2 += pieSliceDepthHalf;
                                    y3 += pieSliceDepthHalf;
                                }


                                dataLabel.y = y3
                                if (sliced) {
                                    var slicedTranslation = point.slicedTranslation,
                                    transX = slicedTranslation[0] - plotLeft,
                                    transY = slicedTranslation[1] - plotTop;
                                    x3 = x3 + transX;
                                    x1 = x1 + transX;
                                    x2 = x2 + transX;
                                    y2 = y2 + transY;
                                }
                                dataLabel.attr({
                                    visibility: VISIBLE,
                                    align: align,
                                    x: x3,
                                    y: y3
                                });

                                // Creating text bound for dataLabels of Pie chart
                                point.dataLabelBG = dataLabel.textBound();

                                //draw the connector
                                // draw the connector
                                if (outside && connectorWidth && enableSmartLabels) {
                                    connector = point.connector;

                                    point.connectorPath = connectorPath = [
                                    M,
                                    x2, y2, // base
                                    L,
                                    isSmartLineSlanted ? x1 : x2, y1, // first break, next to the label
                                    x3, y1  // end of the string at the label
                                    ];

                                    if (connector) {
                                        connector.attr({
                                            d: connectorPath
                                        });
                                        connector.attr('visibility', VISIBLE);

                                    } else {
                                        point.connector = connector = series.chart.renderer.path(connectorPath).attr({
                                            'stroke-width': connectorWidth,
                                            stroke: options.connectorColor || '#606060',
                                            visibility: VISIBLE,
                                            zIndex: 3
                                        })
                                        .translate(plotLeft, plotTop)
                                        .add()
                                        .on('click', function (point){
                                            return function (e) {
                                                point.firePointEvent('click', e);
                                            };
                                        }(point));
                                    }
                                }
                            }
                        }
                    }
                }
            };
        }()),
        /**^
	 * To support rotating animation
	 * @source 10256/2.1.4
	 */
        /*
	 * this function will rotate the series
	 */
        rotate: function (setAngle) {
            var series = this,
            data = series.data,
            options = series.options,
            slicedOffset = series.slicedOffset,
            slicedOffsetY = series.slicedOffsetY,
            chartPlotLeft = series.chart.plotLeft,
            chartPlotTop = series.chart.plotTop,
            startingAngle = pluckNumber(this.chart.options.chart.startingAngle, 0),
            angle,
            positions = series.center;
            angle = (setAngle - startingAngle) % 360;
            this.chart.options.chart.startingAngle = pluckNumber(setAngle,
                this.chart.options.chart.startingAngle) % 360;

            angle = (angle * mathPI) / 180;

            if (series.pie3DManager) {
                series.pie3DManager.rotate(angle);
            }

            each(data, function(point) {
                var graphic = point.graphic,
                args = point.shapeArgs,
                newAngleArgs = {
                    start: args.start = args.start + angle,
                    end: args.end = args.end + angle
                },
                pointAngle = point.centerAngle = normalizeAngle((newAngleArgs.start + newAngleArgs.end) / 2),
                sliced = point.sliced,
                cosAngle = mathCos(pointAngle),
                sinAngle = mathSin(pointAngle);

                //set the  slicedTranslation
                point.slicedTranslation = map([
                    (cosAngle * slicedOffset) + chartPlotLeft,
                    (sinAngle * slicedOffsetY) + chartPlotTop
                    ], mathRound);


                //set the tooltip position
                point.tooltipPos = [
                positions[0] + cosAngle * positions[2] * 0.7,
                positions[1] + sinAngle * positions[4]
                ];

                // rotate grapic
                if (graphic && sliced) {
                    point.graphic.attr({
                        translateX:  point.slicedTranslation[0],
                        translateY: point.slicedTranslation[1]
                    });
                }

            });

            this.drawDataLabels(true)

        },

        /**
	 * Draw the data points
	 */
        drawPoints: function() {
            var series = this,
            options = series.options,
            chart = series.chart,
            renderer = chart.renderer,
            groupTranslation,
            //center,
            graphic,
            group,
            shadow = series.options.shadow,
            shadowGroup,
            shapeArgs,
            center = series.center;


            // draw the slices
            each(series.data, function(point, index) {
                var sliced = point.sliced,
                slicedTranslation = point.slicedTranslation;
                graphic = point.graphic;
                shapeArgs = point.shapeArgs;
                group = point.group;
                shadowGroup = point.shadowGroup;
                // draw the slice
                if (graphic) {
                    graphic.animate(shapeArgs);
                } else {
                    point.graphic = series.pie3DManager.createSlice(shapeArgs.start, shapeArgs.end,
                        point.color, point._3dAlpha, point.borderColor, point.borderWidth, index);

                    point.graphic.translate(sliced ? slicedTranslation[0] : chart.plotLeft,
                        sliced ? slicedTranslation[1] : chart.plotTop);
                /**^
                     * Pass shadow configuration per-point
                     */
                //.shadow(shadow, shadowGroup, point.shadow);
                /* EOP ^*/
                }

                // detect point specific visibility
                if (point.visible === false) {
                    point.setVisible(false);
                }

            });

            series.pie3DManager.refreshDrawing();

        },
        /**^
	 * Draw point specific tracker objects.
	 */
        drawTracker: function () {
            var series = this,
            chart = series.chart,
            trackerLabel = +new Date(),
            options = series.options,
            rel,
            // Compute the pixel center of the pie series. This will later
            // be used while pie rotation calculation upon drag.
            pieCenter = [series.center[0] + series.chart.plotLeft,
            series.center[1] + series.chart.plotTop],
            chartPosition,
            rotationEnabled = series.options.enableRotation,
            rotationTrigger,
            confObject,
            graphic,elements, x;

            if (rotationEnabled) {
                // Event handler to mark that pie rotation has changed upon
                // drag.
                rotationTrigger = function (event) {
                    // Log the chart position for calculating mouse xy.
                    chartPosition = getPosition(series.chart.container);
                    // Record the angle of point of drag start with respect
                    // to starting angle.
                    series.rotationStartInstanceAngle =
                    getClickArcTangent.call(event, pieCenter, chartPosition) -
                    series.chart.options.chart.startingAngle * deg2rad;
                    // Hide tooltip on dragstart
                    if (series.chart.tooltip) {
                        if (event.type === 'dragstart') {
                            series.chart.tooltip.block(true);
                        }
                        else {
                            series.chart.tooltip.block(false);
                            series.chart.tooltip.refresh(event.data, true);
                        }
                    }
                };
            }

            each(series.data, function(point) {
                // Process if tracker exists and rotation not ready.
                if (point.y !== null) {
                    if (point.link !== undefined) {
                        var css = {
                            cursor : 'pointer',
                            '_cursor': 'hand'
                        };
                    }
                    graphic = point.graphic;
                    //set the tracker flag at the graphic element so that it works as tracker
                    graphic.attr({
                        isTracker: trackerLabel
                    });
                    graphic.on(hasTouch ? 'touchstart' : 'mouseover', function(event) {
                        rel = event.relatedTarget || event.fromElement;
                        if (chart.hoverSeries !== series && attr(rel, 'isTracker') !== trackerLabel) {
                            series.onMouseOver();
                        }
                        point.onMouseOver();

                    })
                    .on('mouseout', function(event) {
                        if (!options.stickyTracking) {
                            rel = event.relatedTarget || event.toElement;
                            if (attr(rel, 'isTracker') !== trackerLabel) {
                                series.onMouseOut();
                            }
                        }
                    })
                    .css(css);

                    // Fire rotation start and stop trigger.
                    if (rotationEnabled) {
                        confObject = graphic._confObject;
                        elements = confObject.elements;
                        //other elements
                        for (x in elements) {
                            addEvent(elements[x].element, 'dragstart dragend',
                                rotationTrigger, point);

                            // rotate series upon drag.
                            addEvent(elements[x].element, 'drag', function (event) {
                                series.rotate((getClickArcTangent.call(event, pieCenter,
                                    chartPosition) - series.rotationStartInstanceAngle) /
                                deg2rad);
                            });
                        }
                        addEvent(graphic.element, 'dragstart dragend',
                            rotationTrigger, point);

                        // rotate series upon drag.
                        addEvent(graphic.element, 'drag', function (event) {
                            series.rotate((getClickArcTangent.call(event, pieCenter,
                                chartPosition) - series.rotationStartInstanceAngle) /
                            deg2rad);
                        });
                    }
                }
            });
        }

    });




    // 4 - add the constractor
    seriesTypes.pie3d = pie3D;

}, [3, 2, 2, 'sr4']]);