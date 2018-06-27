/*global Array: false, FusionCharts, window: false,
    FusionChartsDataFormats: false */

// License and credit information is part of a comment-block with "license"
// jsdoc parameter and is appended somewhere at the middle of this file.
FusionCharts(['private', 'modules.renderer.highcharts-gradientlegend', function () {


    var global = this,
    core = global.core,
    lib = global.hcLib,
    pluckNumber = lib.pluckNumber,
    COLOR_BLACK = lib.COLOR_BLACK,
    COLOR_GLASS = lib.COLOR_GLASS,
    FC_CONFIG_STRING = lib.FC_CONFIG_STRING,
    graphics = lib.graphics,
    HSBtoRGB = graphics.HSBtoRGB,
    RGBtoHSB = graphics.RGBtoHSB,
    RGBtoHex = graphics.RGBtoHex,
    HEXtoRGB = graphics.HEXtoRGB,
    COMMASTRING = lib.COMMASTRING,
    BLANK = lib.BLANKSTRING,
    parseUnsafeString = lib.parseUnsafeString,
    convertColor = lib.graphics.convertColor,
    POSITION_TOP = lib.POSITION_TOP,
    POSITION_RIGHT = lib.POSITION_RIGHT,
    POSITION_BOTTOM = lib.POSITION_BOTTOM,
    POSITION_LEFT = lib.POSITION_LEFT,
    POSITION_CENTER = lib.POSITION_CENTER,
    POSITION_MIDDLE = lib.POSITION_MIDDLE,
    getDarkColor = lib.graphics.getDarkColor,
    getLightColor = lib.graphics.getLightColor,

    pluck = lib.pluck,
    getValidValue = lib.getValidValue,

    Highcharts = lib.Highcharts,
    legendTypes = Highcharts.legendTypes,
    hasTouch = Highcharts.hasTouch,
    getTouchEvent = Highcharts.getTouchEvent,
    getPosition = Highcharts.getPosition,
    addEvent = Highcharts.addEvent,
    M = 'M',
    Z = 'Z',
    L = 'L',
    NONE = 'none',
    mathRound = Math.round,
    mathMax = Math.max,
    mathMin = Math.min,
    mathAbs = Math.abs,
    PERCENTSTRING = '%',
    DRAGSTRING = 'drag',
    DRAGSTARTSTRING = 'dragstart',

    stubEvent = {
        pageX: 0,
        pageY: 0
    },

    /**
     * Fixes color values by appending hash wherever needed
     */
    dehashify = function (color) {
        return color && color.replace(/^#?([a-f0-9]+)/ig, '$1');
    };

    //for faster execution remove all validation
    // as this function will be called internaly

    function getTransitColor (colorArr1, colorArr2, transitOffset) {
        var R1 = colorArr1[0], G1 = colorArr1[1], B1 = colorArr1[2],
            R = R1 + ((colorArr2[0] - R1) * transitOffset),
            G = G1 + ((colorArr2[1] - G1) * transitOffset),
            B = B1 + ((colorArr2[2] - B1) * transitOffset);
        return {
            hex: (COLOR_BLACK + (R << 16 | G << 8 | B).toString(16)).slice(-6),
            rgb: [R, G, B]
        }
    }


    //sort color arr
    function sortFN (a, b) {
        return a.maxvalue - b.maxvalue;
    }

    function getExtremeColors (color) {
        var hsb = RGBtoHSB(color);
        return {
            minRGB: HSBtoRGB((hsb[2] = 0, hsb)),
            maxRGB: HSBtoRGB((hsb[2] = 100, hsb))
        };
    }

    //colorRange parser gor gradient colorRange
    function colorRange (options) {

        var colorRange = options.colorRange || {},
            dataMin = options.dataMin,
            dataMax = options.dataMax,
            autoOrderLegendIcon = options.sortLegend || false,
            mapByCategory = options.mapByCategory || false,
            defaultColor = options.defaultColor,
            numberFormatter = options.numberFormatter,

            color = colorRange.color,
            colorArr = this.colorArr = [],
            range,
            valueRange,
            colorCount,
            i,
            j,
            lastLostColorIndex,
            code,
            colorObj,
            colorObj2,
            maxValue,
            minValue,
            color1,
            color2,
            baseColor,
            lastValue,
            colorLabel,
            extremeColors;

        this.mapByCategory = mapByCategory;
        // if map by percent
        if (colorRange.mapbypercent === '1') {
            //set the mapbypercent flag
            this.mapbypercent = true;
        }

        // if color range in gradient
        if (colorRange.gradient === '1' && !mapByCategory) {

            this.gradient = true;
            code = dehashify(pluck(colorRange.startcolor, colorRange.mincolor,
                colorRange.code));

            baseColor =  HEXtoRGB(dehashify(pluck(code, defaultColor,
                'CCCCCC')));
            //get the scale min value
            lastValue = this.scaleMin = pluckNumber(colorRange.startvalue,
                colorRange.minvalue, this.mapbypercent ? 0 : dataMin);
            //add the scale start color
            colorArr.push({
                code: code,
                maxvalue: lastValue,
                label: parseUnsafeString(colorRange.startlabel),
                codeRGB: HEXtoRGB(code)
            })

            if (color && (colorCount = color.length)){
                for (i = 0; i < colorCount; i+= 1) {
                    colorObj = color[i];
                    code = dehashify(pluck(colorObj.color, colorObj.code));
                    maxValue = pluckNumber(colorObj.value, colorObj.maxvalue);
                    minValue = pluckNumber(colorObj.minvalue);
                    //add valid color
                    if (maxValue > lastValue) {
                        colorArr.push({
                            code: code,
                            maxvalue: maxValue,
                            userminvalue: minValue,
                            label: parseUnsafeString(pluck(colorObj.label,
                                colorObj.displayvalue)),
                            codeRGB: HEXtoRGB(code)
                        });
                    }
                }
            }

            //now sort the valid array
            colorArr.sort(sortFN);

            colorCount = colorArr.length;
            for (i = 1; i < colorCount; i+= 1) {
                colorObj = colorArr[i];
                valueRange = colorObj.maxvalue - lastValue;
                if (valueRange > 0) {
                    colorObj.minvalue = lastValue;
                    colorObj.range = valueRange;
                    lastValue = colorObj.maxvalue;
                }
                else {
                    colorArr.splice(i, 1);
                    i -= 1;
                    colorCount -= 1;
                }
            }
            if (colorArr.length >= 2) {
                this.scaleMax = lastValue;
                colorArr[i - 1].label = pluck(colorRange.endlabel,
                    colorArr[i - 1].label, colorArr[i - 1].displayvalue);
            }

            //derive the last color stop in case no user-defined range is found.
            if (colorArr.length === 1) {
                maxValue = pluckNumber(colorRange.maxvalue,
                    this.mapbypercent ? 100 : dataMax);
                colorArr.push({
                    minvalue: lastValue,
                    maxvalue: maxValue,
                    range: maxValue - lastValue,
                    label: colorRange.endlabel
                });
                this.scaleMax = maxValue;
                delete colorArr[0].code;
            }

            // Set values of start and end color in case they are not
            // defined by user or could not be derived from a default value.
            color1 = colorArr[0]; // start
            color2 = colorArr[colorArr.length - 1]; // end
            if (!color1.code || !color2.code) {
                extremeColors = getExtremeColors(baseColor);
                if (!color1.code) {
                    color1.codeRGB = extremeColors.minRGB;
                    color1.code = RGBtoHex(extremeColors.minRGB);
                }
                if (!color2.code) {
                    color2.codeRGB = extremeColors.maxRGB;
                    color2.code = RGBtoHex(extremeColors.maxRGB);
                }
            }

            // For color stops that does not have a valid color defined, we
            // would need to insert a placeholder-color at that point.
            colorCount = colorArr.length;
            for (i = 1; i < colorCount; i+= 1) {
                colorObj = colorArr[i];

                if (!colorObj.code) {
                    lastLostColorIndex = lastLostColorIndex || i;
                }
                else {
                    if (lastLostColorIndex) {
                        color2 = colorObj;
                        minValue = color1.maxvalue;
                        range = color2.maxvalue - minValue;
                        for (j = lastLostColorIndex; j < i; j += 1) {
                            colorObj2 = colorArr[j];
                            code = getTransitColor(color1.codeRGB,
                                color2.codeRGB, (colorObj2.maxvalue - minValue) / range);

                            colorObj2.code = code.hex;
                            colorObj2.codeRGB = code.rgb;
                        }
                    }
                    lastLostColorIndex = null;
                    color1 = colorObj;
                }
            }

            if (this.scaleMin === undefined || this.scaleMax === undefined) {
                this.noValidRange = true;
            }
        }
        else { //non gradient color range

            if (color && (colorCount = color.length)) {
                for (i = 0; i < colorCount; i += 1) {
                    colorObj = color[i];
                    code = pluck(colorObj.color, colorObj.code);
                    maxValue = pluckNumber(colorObj.maxvalue);
                    minValue = pluckNumber(colorObj.minvalue);
                    colorLabel = pluck(colorObj.label,
                            colorObj.displayvalue,
                            mapByCategory ? BLANK : (
                                numberFormatter.dataLabels(minValue) + ' - ' +
                                numberFormatter.dataLabels(maxValue)));
                    //add valid color
                    if (code && maxValue > minValue || (mapByCategory && colorLabel)) {
                        colorArr.push({
                            code: code,
                            maxvalue: maxValue,
                            minvalue: minValue,
                            label: parseUnsafeString(colorLabel),
                            labelId: colorLabel.toLowerCase()
                        })
                    }
                }


                if (colorArr.length) {
                    if (autoOrderLegendIcon) {//arrange the colors
                        colorArr.sort(sortFN);
                    }
                }
                else {
                    this.noValidRange = true;
                }
            }
        }

    };
    colorRange.prototype = {
        getColorObj: function (value) {
            var colorArr = this.colorArr,
            i = this.gradient? 1 : 0,
            colorObj = colorArr[i],
            transitOffset;



            //if gradient legend the get the transition color
            if (this.mapByCategory) {
                value = parseUnsafeString(value).toLowerCase();
                while(colorObj) {
                    if (colorObj.labelId === value) {
                        return {
                            code: colorObj.code,
                            seriesIndex: i
                        };
                    }
                    i += 1;
                    colorObj = colorArr[i];
                }
                //outof range value
                return {
                    outOfRange: true
                };
            }
            else if (this.gradient) {
                //within range
                //return the color code
                if (this.scaleMin <= value  && this.scaleMax >= value) {
                    while(colorObj && colorObj.maxvalue < value) {
                        i += 1;
                        colorObj = colorArr[i];
                    }
                    transitOffset = (value - colorObj.minvalue) / colorObj.range;
                    return {
                        code: getTransitColor(colorArr[i - 1].codeRGB, colorObj.codeRGB, transitOffset).hex
                    }
                }
                else {//outof range value
                    return {
                        outOfRange: true
                    };
                }
            }
            else {
                while(colorObj) {
                    if (colorObj.maxvalue >= value && colorObj.minvalue <= value) {
                        return {
                            code: colorObj.code,
                            seriesIndex: i
                        };
                    }
                    i += 1;
                    colorObj = colorArr[i];
                }
                //outof range value
                return {
                    outOfRange: true
                };
            }
        }
    };
    colorRange.prototype.constructor = colorRange;

    lib.colorRange = colorRange;

    /***********************************/
    /*  gradient Legend Space manager  */
    /***********************************/

    /* helper functions */

    //scale labe creater function
    function getScaleLabel (value, isPercent) {
        if (isPercent) {
            return (mathRound(value * 100) /  100) + PERCENTSTRING;
        }
        else {
            return getValidValue(value, BLANK).toString();
        }
    }

    var configureGradientLegendOptions = lib.configureGradientLegendOptions = function (hcJSON, fcJSON) {
        var legendObj =  hcJSON.legend,
        fcJSONChart = fcJSON.chart,
        colorRange = hcJSON.colorRange || {};

        legendObj.legendSliderBorderWidth = pluckNumber(fcJSONChart.legendpointerborderthickness, 1);
        legendObj.legendSliderBorderColor = convertColor(pluck(fcJSONChart.legendpointerbordercolor,
            COLOR_BLACK), pluckNumber(fcJSONChart.legendpointerborderalpha, 100));
        legendObj.legendSliderWidth  = pluckNumber(fcJSONChart.legendpointerwidth,
            fcJSONChart.legendpointerswidth, 12);
        //default value changed to look same in case of right position
        legendObj.legendSliderHeight = pluckNumber(fcJSONChart.legendpointerheight,
            fcJSONChart.legendpointersheight, 12);
        legendObj.legendColorBoxBorderColor = legendObj.borderColor;
        legendObj.legendColorBoxBorderWidth = legendObj.borderWidth;

        legendObj.legendScaleColor = convertColor(pluck(fcJSONChart.legendscalelinecolor,
            COLOR_BLACK), pluckNumber(fcJSONChart.legendscalelinealpha, 100));
        legendObj.legendScalePadding = pluckNumber(fcJSONChart.legendscalepadding, 4);
        legendObj.legendScaleLineThickness = pluckNumber(fcJSONChart.legendscalelinethickness, 1);
        legendObj.legendScaleTickDistance = pluckNumber(fcJSONChart.legendscaletickdistance, 6);
        //remove defaulr hand pointer
        legendObj.itemStyle.cursor = 'default';
        legendObj.interActivity = pluckNumber(fcJSONChart.interactivelegend, 1);
    }

    lib.placeGLegendBlockRight = function (hcJSON, fcJSON, availableWidth, availableHeight, isPointItem) {
        // configure LegendOptions
        lib.configureLegendOptions(hcJSON, fcJSON.chart, true, isPointItem, availableWidth);

        //gradiend speciffic options
        configureGradientLegendOptions (hcJSON, fcJSON);

        var conf = hcJSON[FC_CONFIG_STRING],
        SmartLabel = conf.smartLabel,
        legendObj =  hcJSON.legend,
        smartLabel, smartSLabel,
        textPadding = legendObj.textPadding = 2,
        textPadding2 = textPadding * 2,
        captionPadding = legendObj.title.padding,
        captionWidth = 0,
        fcJSONChart = fcJSON.chart,
        legendCaptionHeight = 0,
        padding = legendObj.padding,
        padding2 = 2 * padding,
        usedWidth = pluckNumber(fcJSON.chart.legendpadding, 7) +
                (legendObj.borderWidth / 2) + 1,
        colorRange = hcJSON.colorRange || {},
        colorArr = colorRange.colorArr,
        mapbypercent = colorRange.mapbypercent,
        scaleMax = colorRange.scaleMax,
        scaleMin = colorRange.scaleMin,
        scaleRange = scaleMax - scaleMin,
        legendSliderWidth = legendObj.legendSliderWidth,
        legendSliderHeight = legendObj.legendSliderHeight,
        legendSliderHalfHeight = legendSliderHeight / 2,
        legendScalePadding = legendObj.legendScalePadding ,
        legendScaleTickDistance = legendObj.legendScaleTickDistance,
        style = legendObj.itemStyle || {},
        lineHeight = pluckNumber(parseInt(style.lineHeight, 10) || 12),
        textYAdjuster = lineHeight * 0.75,
        effectiveWidth = availableWidth - padding2,
        i,
        colorCount,
        colorObj,
        maxTextHeight,
        labelMaxWidth,
        allowedMaxSLWidth,
        halfLabelHeight,
        boxHeight,
        labelStartY = 0,
        labelEndY,
        labelW,
        scaleLabelStartY,
        scaleLabelEndY,
        scaleLabelW,
        labelLastIndex,
        pixelValueRatio,
        positionY,
        extraHeight,
        allowedMaxHeight,
        allowedMaxSLHeight,
        labelHalfWidth,
        scaleLabelHalfHeight,
        laxtColorObj,
        smartText;



        availableHeight -= padding2;//deduct the legend Box padding 2 * 6Px

        if (!colorRange.noValidRange && colorArr && (colorCount = colorArr.length) > 1) {
            labelLastIndex = colorCount - 1;

            //caption
            if (legendObj.title.text !== BLANK) {
                SmartLabel.setStyle(legendObj.title.style);
                smartText = SmartLabel.getSmartText(legendObj.title.text, effectiveWidth, mathMax(lineHeight, availableHeight / 4));
                legendObj.title.text = smartText.text;
                captionWidth = smartText.width + padding2;
                availableHeight -= legendCaptionHeight = smartText.height + captionPadding ;
            }

            effectiveWidth -= legendScaleTickDistance + legendScalePadding + legendSliderWidth;
            legendObj.colorBoxX = legendSliderWidth;

            allowedMaxSLWidth = mathMax(lineHeight, effectiveWidth / 2);
            labelMaxWidth = mathMin(effectiveWidth - allowedMaxSLWidth - 4, lineHeight);//boothside padding for text

            allowedMaxSLHeight = mathMax(lineHeight, availableHeight / 2);
            allowedMaxHeight = availableHeight / 4; //boothside padding for text

            //set the style for non caption labels
            SmartLabel.setStyle(style);

            ////////////////firstLabel///////////
            colorObj = colorArr[0];
            //create the scale label
            colorObj.scaleLabel = getScaleLabel(colorObj.maxvalue, mapbypercent);

            //calculate the space
            smartLabel = SmartLabel.getSmartText(colorObj.label, allowedMaxHeight, labelMaxWidth);
            colorObj.label = smartLabel.text;
            labelW = smartLabel.height;
            colorObj.labelY = textYAdjuster - smartLabel.height / 2;

            smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, allowedMaxSLWidth, allowedMaxSLHeight);
            colorObj.scaleLabel = smartSLabel.text;
            scaleLabelStartY = smartSLabel.height / 2;
            scaleLabelW = smartSLabel.width;
            colorObj.scaleLabelY = textYAdjuster - smartSLabel.height / 2;

            //set the box StartX
            legendObj.colorBoxY = mathMax(scaleLabelStartY, smartLabel.width + textPadding2, legendSliderHalfHeight) +
            legendCaptionHeight;

            //////////////lastLabel//////////////
            colorObj = laxtColorObj = colorArr[labelLastIndex];
            //create the scale label
            colorObj.scaleLabel =  getScaleLabel(colorObj.maxvalue, mapbypercent);

            //calculate the space
            smartLabel = SmartLabel.getSmartText(colorObj.label, allowedMaxHeight, labelMaxWidth);
            colorObj.label = smartLabel.text;
            labelW = mathMax(labelW, smartLabel.height);
            colorObj.labelY = textYAdjuster - smartLabel.height / 2;

            smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, allowedMaxSLWidth, allowedMaxSLHeight);
            colorObj.scaleLabel = smartSLabel.text;
            scaleLabelW = mathMax(scaleLabelW, smartSLabel.width);
            halfLabelHeight = smartSLabel.height / 2;
            maxTextHeight = mathMax(smartLabel.width + textPadding2, halfLabelHeight, legendSliderHalfHeight);
            colorObj.scaleLabelY = textYAdjuster - smartSLabel.height / 2;
            //set the box Width
            legendObj.colorBoxHeight = boxHeight = availableHeight - legendObj.colorBoxY - maxTextHeight;

            labelEndY = boxHeight;
            scaleLabelEndY = boxHeight - halfLabelHeight;

            pixelValueRatio = boxHeight / scaleRange;

            extraHeight = mathMin(labelEndY - labelStartY, scaleLabelEndY - scaleLabelStartY) - 4;
            //create scaleLabel for all colorObj
            for (i = 1; i < labelLastIndex; i += 1) {
                colorObj = colorArr[i];
                positionY = (colorObj.maxvalue - scaleMin) * pixelValueRatio;

                //calculate the space
                smartLabel = SmartLabel.getSmartText(colorObj.label, mathMin(positionY -
                    labelStartY, labelEndY - positionY) * 2, labelMaxWidth);
                colorObj.label = smartLabel.text;
                labelW = mathMax(labelW, smartLabel.height);
                colorObj.labelY = textYAdjuster - smartLabel.height / 2;
                labelHalfWidth = smartLabel.width / 2;

                //create the scale label
                colorObj.scaleLabel =  getScaleLabel(colorObj.maxvalue, mapbypercent);
                //calculate the space
                smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, allowedMaxSLWidth, mathMin(positionY -
                    scaleLabelStartY, scaleLabelEndY - positionY) * 2);
                colorObj.scaleLabel = smartSLabel.text;
                scaleLabelW = mathMax(scaleLabelW, smartSLabel.width);
                scaleLabelHalfHeight = smartSLabel.height / 2;
                colorObj.scaleLabelY = textYAdjuster - smartSLabel.height / 2;

                extraHeight = mathMin(extraHeight, (positionY - mathMax(scaleLabelHalfHeight +
                    scaleLabelStartY, labelHalfWidth + labelStartY) - 4) * scaleRange / colorObj.range);

                labelStartY = labelHalfWidth + positionY;
                scaleLabelStartY = scaleLabelHalfHeight + positionY;

            }

            //calculate the extraSPace  for last gap
            //gradient box should be at least aprox 50 % width
            extraHeight = mathMax(mathMin(extraHeight, (mathMin(scaleLabelEndY  - scaleLabelStartY,
                labelEndY - labelStartY) - 4) * scaleRange / laxtColorObj.range, availableHeight * 0.3), 0);

            legendObj.colorBoxHeight -= extraHeight;

            //add text padding
            //default 15
            legendObj.colorBoxWidth = (labelW && labelW + textPadding2) || 15;

            //determine legend width
            legendObj.height = legendObj.totalHeight =  availableHeight +
            legendCaptionHeight + padding2 - extraHeight;

            legendObj.width = (scaleLabelW && scaleLabelW + textPadding) +
            legendObj.colorBoxWidth + legendSliderWidth +
            legendObj.legendScaleTickDistance + legendObj.legendScalePadding + padding2;

            //if the caption width has gretter width
            if (legendObj.width < captionWidth) {
                legendObj.colorBoxX += (captionWidth - legendObj.width) / 2;
                legendObj.width = captionWidth;
            }

            //NOTE: no scroll bar. worst case scale labels are not fully visible

            if (legendObj.width > availableWidth) { // for padding
                legendObj.width = availableWidth;
            }
            usedWidth += legendObj.width;
            hcJSON.chart.marginRight += usedWidth;
            return usedWidth;
        }
        else {
            legendObj.enabled = false;
            return 0;
        }
    }

    lib.placeGLegendBlockBottom = function (hcJSON, fcJSON, availableWidth, availableHeight, isPointItem) {
        //configure LegendOptions
        lib.configureLegendOptions(hcJSON, fcJSON.chart, false, isPointItem, availableWidth);
        //gradiend speciffic options
        configureGradientLegendOptions (hcJSON, fcJSON);

        var conf = hcJSON[FC_CONFIG_STRING],
            SmartLabel = conf.smartLabel,
            legendObj =  hcJSON.legend,
            smartLabel, smartSLabel,
            textPadding = legendObj.textPadding = 2,
            captionPadding = legendObj.title.padding,
            captionWidth = 0,
            fcJSONChart = fcJSON.chart,
            legendCaptionHeight = 0,
            padding = legendObj.padding,
            padding2 = 2 * padding,
            usedHeight = pluckNumber(fcJSON.chart.legendpadding, 7) +
                    (legendObj.borderWidth / 2) + 1,
            colorRange = hcJSON.colorRange || {},
            colorArr = colorRange.colorArr,
            mapbypercent = colorRange.mapbypercent,
            scaleMax = colorRange.scaleMax,
            scaleMin = colorRange.scaleMin,
            scaleRange = scaleMax - scaleMin,
            legendSliderWidth = legendObj.legendSliderWidth,
            legendSliderHeight = legendObj.legendSliderHeight,
            legendScalePadding = legendObj.legendScalePadding ,
            legendScaleTickDistance = legendObj.legendScaleTickDistance,
            style = legendObj.itemStyle || {},
            lineHeight = pluckNumber(parseInt(style.lineHeight, 10) || 12),
            textYAdjuster = lineHeight * 0.75,
            effectiveHeight = availableHeight - padding2,
            i,
            colorCount,
            colorObj,
            maxTextWidth,
            labelMaxWidth,
            labelMaxWidth2,
            halfLabelWidth,
            boxWidth,
            labelStartX = 0,
            labelEndX,
            labelH,
            scaleLabelStartX,
            scaleLabelEndX,
            scaleLabelH,
            labelLastIndex,
            pixelValueRatio,
            positionX,
            extraWidth,
            allowedMaxHeight,
            allowedMaxSLHeight,
            labelHalfWidth,
            scaleLabelHalfWidth,
            lastColorObj,
            smartText;



        availableWidth -= padding2;//deduct the legend Box padding 2 * 6Px

        if (!colorRange.noValidRange && colorArr && (colorCount = colorArr.length) > 1) {
            labelLastIndex = colorCount - 1;

            //caption
            if (legendObj.title.text !== BLANK) {
                SmartLabel.setStyle(legendObj.title.style);
                smartText = SmartLabel.getSmartText(legendObj.title.text, availableWidth, effectiveHeight / 3);
                legendObj.title.text = smartText.text;
                captionWidth = smartText.width + padding2;
                effectiveHeight -= legendCaptionHeight = smartText.height + captionPadding ;
            }

            effectiveHeight -= legendScaleTickDistance + legendScalePadding + legendSliderHeight;
            allowedMaxSLHeight = mathMax(lineHeight, effectiveHeight / 2);
            allowedMaxHeight = mathMin(effectiveHeight - allowedMaxSLHeight - 4, lineHeight); //boothside padding for text

            //set the style for non caption labels
            SmartLabel.setStyle(style);

            ////////////////firstLabel///////////
            labelMaxWidth = availableWidth / 4;
            labelMaxWidth2 = labelMaxWidth * 2;

            colorObj = colorArr[0];
            //create the scale label
            colorObj.scaleLabel = getScaleLabel(colorObj.maxvalue, mapbypercent);

            //calculate the space
            smartLabel = SmartLabel.getSmartText(colorObj.label, labelMaxWidth, allowedMaxHeight);
            colorObj.label = smartLabel.text;
            //labelStartX = smartLabel.width / 2;
            labelH = smartLabel.height;
            colorObj.labelY = textYAdjuster - smartLabel.height / 2;

            smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, labelMaxWidth2, allowedMaxSLHeight);
            colorObj.scaleLabel = smartSLabel.text;
            scaleLabelStartX = smartSLabel.width / 2;
            scaleLabelH = smartSLabel.height;

            if (!colorObj.code) {
                colorObj.code = pluck(legendObj.minColor, "CCCCCC");
            }

            //set the box StartX
            legendObj.colorBoxX = mathMax(scaleLabelStartX, smartLabel.width + textPadding, legendSliderWidth);

            //distribute extraSpace
            //labelMaxWidth = availableWidth - maxTextWidth;

            //////////////lastLabel//////////////
            colorObj = lastColorObj = colorArr[labelLastIndex];
            //create the scale label
            colorObj.scaleLabel =  getScaleLabel(colorObj.maxvalue, mapbypercent);

            //calculate the space
            smartLabel = SmartLabel.getSmartText(colorObj.label, labelMaxWidth, allowedMaxHeight);
            colorObj.label = smartLabel.text;
            labelH = mathMax(labelH, smartLabel.height);
            colorObj.labelY = textYAdjuster - smartLabel.height / 2;

            smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, labelMaxWidth2, allowedMaxSLHeight);
            colorObj.scaleLabel = smartSLabel.text;
            scaleLabelH = mathMax(scaleLabelH, smartSLabel.height);
            halfLabelWidth = smartSLabel.width / 2;
            maxTextWidth = mathMax(smartLabel.width + textPadding, halfLabelWidth, legendSliderWidth);
            //set the box Width
            legendObj.colorBoxWidth = boxWidth = availableWidth - legendObj.colorBoxX - maxTextWidth;

            labelEndX = boxWidth;
            scaleLabelEndX = boxWidth - halfLabelWidth;

            pixelValueRatio = boxWidth / scaleRange;

            extraWidth = mathMin(labelEndX - labelStartX, scaleLabelEndX - scaleLabelStartX) - 4;
            //create scaleLabel for all colorObj
            for (i = 1; i < labelLastIndex; i += 1) {
                colorObj = colorArr[i];
                positionX = (colorObj.maxvalue - scaleMin) * pixelValueRatio;

                //calculate the space
                smartLabel = SmartLabel.getSmartText(colorObj.label, mathMin(positionX -
                    labelStartX, labelEndX - positionX) * 2, allowedMaxHeight);
                colorObj.label = smartLabel.text;
                labelH = mathMax(labelH, smartLabel.height);
                colorObj.labelY = textYAdjuster - smartLabel.height / 2;
                labelHalfWidth = smartLabel.width / 2;

                //create the scale label
                colorObj.scaleLabel =  getScaleLabel(colorObj.maxvalue, mapbypercent);
                //calculate the space
                smartSLabel = SmartLabel.getSmartText(colorObj.scaleLabel, mathMin(positionX -
                    scaleLabelStartX, scaleLabelEndX - positionX) * 2, allowedMaxSLHeight);
                colorObj.scaleLabel = smartSLabel.text;
                scaleLabelH = mathMax(scaleLabelH, smartSLabel.height);
                scaleLabelHalfWidth = smartSLabel.width / 2;

                extraWidth = mathMin(extraWidth, (positionX - mathMax(scaleLabelHalfWidth +
                    scaleLabelStartX, labelHalfWidth + labelStartX) - 4) * scaleRange / colorObj.range);

                labelStartX = labelHalfWidth + positionX;
                scaleLabelStartX = scaleLabelHalfWidth + positionX;

            }

            //calculate the extraSPace  for last gap
            //gradient box should be at least aprox 50 % width
            extraWidth = mathMax(mathMin(extraWidth, (mathMin(scaleLabelEndX  - scaleLabelStartX,
                labelEndX - labelStartX) - 4) * scaleRange / lastColorObj.range, availableWidth * 0.3), 0);

            legendObj.colorBoxWidth -= extraWidth;

            //determine legend width
            legendObj.width = availableWidth + padding2 - extraWidth;
            //if the caption width has gretter width
            if (legendObj.width < captionWidth) {
                legendObj.colorBoxX += (captionWidth - legendObj.width) / 2;
                legendObj.width = captionWidth;
            }

            legendObj.colorBoxY = legendCaptionHeight + legendSliderHeight;
            //add text padding
            //default 15
            legendObj.colorBoxHeight = (labelH && labelH + (2 * textPadding)) || 15;

            legendObj.height = legendObj.totalHeight =  (scaleLabelH && scaleLabelH + textPadding) +
            legendObj.colorBoxHeight + legendCaptionHeight + legendSliderHeight +
            legendObj.legendScaleTickDistance + legendObj.legendScalePadding + padding2;

            //NOTE: no scroll bar. worst case scale labels are not fully visible

            if (legendObj.height > availableHeight) { // for padding
                legendObj.height = availableHeight;
            }
            usedHeight += legendObj.height;
            hcJSON.chart.marginBottom += usedHeight;
            return usedHeight;
        }
        else {
            legendObj.enabled = false;
            return 0;
        }
    }




    /******************************/
    /*       Gradient Legend      */
    /******************************/

    //helper function
    var getLabelConfig = function  () {
        return {
            point: this
        };
    },
    calcPercent = function (num) {
        return mathRound(num * 100) / 100;
    };


    var gradientLegend = Highcharts.extendClass(legendTypes.point, {
        colorizeItem : function () {},
        destroy: function () {
            var elements = this.elements,
                box = elements.box,
                legendGroup = elements.legendGroup,
                legendScroller = elements.legendScroller,
                legendClip = elements.legendClip,
                colorBox = elements.colorBox,
                colorBoxEffect = elements.colorBoxEffect,
                slider1 = elements.slider1,
                slider1Effect = elements.slider1Effect,
                slider2 = elements.slider2,
                slider2Effect = elements.slider2Effect,
                scale = elements.scale, x;

            if (colorBox) {
                elements.colorBox = colorBox.destroy();
            }
            if (colorBoxEffect) {
                elements.colorBoxEffect = colorBoxEffect.destroy();
            }
            if (slider1) {
                elements.slider1 = slider1.destroy();
            }
            if (slider1Effect) {
                elements.slider1Effect = slider1Effect.destroy();
            }
            if (slider2) {
                elements.slider2 = slider2.destroy();
            }
            if (slider2Effect) {
                elements.slider2Effect = slider2Effect.destroy();
            }
            if (box) {
                elements.box = box.destroy();
            }

            if (legendGroup) {
                elements.legendGroup = legendGroup.destroy();
            }

            if (legendScroller) {
                elements.legendScroller = legendScroller.destroy();
            }

            if (legendClip) {
                elements.legendClip = legendClip.destroy();
            }
        },
        renderAllItems : function () {
            var legend = this,
            chart = legend.chart,
            plotLeft = chart.plotLeft,
            plotTop = chart.plotTop,
            plotWidth = chart.plotWidth,
            plotHeight = chart.plotHeight,
            chartOptions = chart.options,
            tooltip = chart.tooltip,
            colorRange = chartOptions.colorRange,
            colorArr, i, ln, colorObj,
            conf = legend.conf,
            fontSize = conf.fontSize,
            padding = conf.padding,
            renderer = legend.renderer,
            options = legend.options,
            itemStyle = options.itemStyle,
            symbolStyle = options.symbolStyle,
            interActivity = options.interActivity,
            elements = legend.elements,
            legendGroup = elements.legendGroup,
            horizontal = conf.horizontal,
            bottomSpacingBox, topSpacingBox, itemX, itemY, min, max, range,
            itemX1, itemY1,
            itemValuePercent, lastPosition = 0,
            lighting3d = options.lighting3d,
            glassW, glassH,
            boxX = options.colorBoxX,
            boxY = options.colorBoxY,
            boxW = glassW = options.colorBoxWidth,
            boxH = glassH = options.colorBoxHeight,
            allItems = legend.allItems,
            boxFill = {
                FCcolor : {
                    color: BLANK,
                    alpha: BLANK,
                    angle: 0,
                    ratio: BLANK
                }
            },
            FCcolor = boxFill.FCcolor,
            startX = boxX + padding,
            startY = boxY + padding,
            scaleTextX, scaleTextY, labelTextX, labelTextY, scaleY, scaleX1, scaleY1,
            colorBoxBorderCOlor = options.legendColorBoxBorderColor,
            colorBoxBorderWidth = options.legendColorBoxBorderWidth,
            legendSliderBorderColor = options.legendSliderBorderColor,
            legendSliderBorderWidth = options.legendSliderBorderWidth,
            textPadding = 2,
            scalePath = [M],
            legendScaleColor = options.legendScaleColor,
            legendScalePadding = options.legendScalePadding,
            legendScaleLineThickness = options.legendScaleLineThickness,
            scaleCrispAdjuster = (legendScaleLineThickness % 2) / 2,
            legendScaleTickDistance = options.legendScaleTickDistance,
            legendSliderWidth = options.legendSliderWidth,
            legendSliderHeight = options.legendSliderHeight,
            heightHalf = boxH/ 2,
            widthHalf = boxW / 2,
            sliderWidthHalf = legendSliderWidth / 2,
            sliderHeightHalf = legendSliderHeight / 2,
            widthQuarter = sliderWidthHalf / 2,
            sliderPath, sliderEffectPath, sliderEffectPath1,
            x1, x2, x3, x4, x5, x6, x7, y1, y2, y3, y4, y5, y6, y7,
            labelPosition, lastIndex, scaleX,
            s2TransX, s2TransY,
            rotation = 0,
            sliderX, sliderY, sliderW, sliderH,
            sliderR = mathMin(legendSliderWidth, legendSliderHeight) / 4,
            sliderColor = 'ABABAB',//should be given by user
            sliderAlpha = 100,//should be given by user
            sliderFillColorShade1 = getLightColor(sliderColor, 50),
            sliderFillColorShade2 = getDarkColor(sliderColor, 70),
            sliderFill = convertColor(sliderColor, sliderAlpha),/*{
                FCcolor : {
                    color : sliderFillColorShade1 + COMMASTRING + sliderFillColorShade2 +
                    COMMASTRING + sliderFillColorShade2 + COMMASTRING + sliderFillColorShade1,
                    alpha : sliderAlpha + COMMASTRING + sliderAlpha + COMMASTRING +
                    sliderAlpha + COMMASTRING + sliderAlpha,
                    ratio : '0,45,10,45',
                    angle : 0
                }
            },*/
            sliderBorderColor = convertColor(sliderFillColorShade2, sliderAlpha),
            sliderEffectColor = convertColor(sliderFillColorShade1, sliderAlpha),
            sliderBorderWidth = 1,//should be given by user
            sliderCrispAdjuster = (sliderBorderWidth % 2) / 2,

            //variables required during drag
            sliderDragHandler,
            sliderDragTrigger,
            sliderDragged,
            conf1 = {
                isFirst: true
            },
            conf2 = {},
            scaleStart, scaleEnd,
            series = chart.series,
            scaleIsUpdating;

            //if valid colorRange
            if (colorRange && (colorArr = colorRange.colorArr) && (ln = colorArr.length) > 1) {

                conf1.toolText = scaleStart = min = colorRange.scaleMin;
                conf2.toolText = scaleEnd = max = colorRange.scaleMax;
                range = max - min;
                //slider conf
                conf1.snapPX = conf2.snapPX = 0;
                //slider conf for tooltip
                conf1.tooltipConstraint = conf2.tooltipConstraint = 'chart';
                conf1.getLabelConfig = conf2.getLabelConfig = getLabelConfig;
                conf1.series = conf2.series = {};
                conf1.tooltipPos = [0,0];
                conf2.tooltipPos = [0,0];

                conf2.tooltipOffsetReference = conf1.tooltipOffsetReference =
                        getPosition(chart.container);
                conf2.tooltipOffsetReference.left =
                    conf1.tooltipOffsetReference.left += plotLeft - 20;
                conf2.tooltipOffsetReference.top =
                    conf1.tooltipOffsetReference.top += plotTop;

                if (horizontal) {//legend on bottom

                    conf1.tooltipPos[1] = conf2.tooltipPos[1] = plotHeight + plotTop;


                    x1 = mathRound(startX - sliderWidthHalf) + sliderCrispAdjuster;
                    x2 = mathRound(startX + sliderWidthHalf) + sliderCrispAdjuster;
                    y1 = mathRound(startY - legendSliderHeight) + sliderCrispAdjuster;
                    y2 = mathRound(startY + boxH) + sliderCrispAdjuster;
                    x3 = mathRound(startX - 2) + sliderCrispAdjuster;
                    x4 = mathRound(startX + 2) + sliderCrispAdjuster;
                    x5 = mathRound(startX) + sliderCrispAdjuster;
                    y3 = mathRound(startY) + sliderCrispAdjuster;
                    y4 = startY - sliderHeightHalf / 2;
                    y5 = mathRound(y4 - sliderHeightHalf) + sliderCrispAdjuster;
                    y4 = mathRound(y4) + sliderCrispAdjuster;
                    x6 = startX - sliderWidthHalf / 2;
                    x7 = mathRound(x6 + sliderWidthHalf) + sliderCrispAdjuster;
                    x6 = mathRound(x6) + sliderCrispAdjuster;


                    sliderX = x1;
                    sliderY = y1;
                    sliderW = legendSliderWidth;
                    sliderH = legendSliderHeight;

                    glassH = glassH / 2;

                    sliderPath = [M, x1, y1, L, x2, y1, x2, y3, x4, y3,
                    x5, y2, x3, y3, x1, y3,  Z, M, x6, y5, L, x6, y4, M, x5, y5, L,
                    x5, y4, M, x7, y5, L, x7, y4];
                    sliderEffectPath = [M, x1, y1 + 1, L, x2, y1 + 1, M, x6 - 1, y5, L, x6 - 1, y4, M, x5 - 1, y5,
                    L, x5 - 1, y4, M, x7 - 1, y5, L, x7 - 1, y4];

                    //sliderPath = renderer.crispLine(sliderPath, legendSliderBorderWidth);
                    //s2TransX = boxW;
                    //s2TransY = 0;

                    scaleY = startY + boxH + legendScalePadding;
                    scaleY1 = mathRound(scaleY + legendScaleTickDistance) + scaleCrispAdjuster;
                    scaleY = mathRound(scaleY) + scaleCrispAdjuster;
                    scaleTextY =  scaleY1 + fontSize;
                    labelTextY =  startY + heightHalf;//text gutter
                    lastIndex = ln - 1;
                    for (i = 0; i < ln; i += 1) {
                        colorObj = colorArr[i];
                        itemValuePercent = (colorObj.maxvalue - min) / range;
                        itemX = (boxW * itemValuePercent) + startX;
                        scaleX = mathRound(itemX) + scaleCrispAdjuster;
                        if (i) {
                            FCcolor.ratio += COMMASTRING;
                            FCcolor.color += COMMASTRING;
                            FCcolor.alpha += COMMASTRING;
                            scalePath.push(L, scaleX, scaleY, scaleX, scaleY1, M, scaleX, scaleY);
                            if (i === lastIndex) {
                                labelPosition = POSITION_LEFT;
                                itemX1 = itemX + textPadding;
                            }
                            else {
                                labelPosition = POSITION_CENTER;
                                itemX1 = itemX;
                            }
                        }
                        else {
                            scalePath.push(scaleX, scaleY, L, scaleX, scaleY1, M, scaleX, scaleY);
                            labelPosition = POSITION_RIGHT;
                            itemX1 = itemX - textPadding;
                        }

                        //create the color
                        FCcolor.ratio += ((itemValuePercent - lastPosition) * 100);
                        FCcolor.color += pluck(colorObj.code, COLOR_BLACK);
                        FCcolor.alpha += pluck(colorObj.alpha, 100);
                        lastPosition = itemValuePercent;

                        //Display Label
                        colorObj.legendItem = renderer.text(
                            colorObj.label,
                            itemX1,
                            labelTextY + colorObj.labelY
                            )
                        .css(itemStyle)
                        .attr({
                            zIndex: 3,
                            align: labelPosition
                        })
                        .add(legendGroup);

                        //scale Label
                        colorObj.legendSymbol = renderer.text(
                            colorObj.scaleLabel,
                            itemX,
                            scaleTextY
                            )
                        .css(itemStyle)
                        .attr({
                            zIndex: 2,
                            align: POSITION_CENTER
                        }).add(legendGroup);
                        allItems.push(colorObj);
                    }
                    //slider conf
                    conf1.xMin = conf2.xMin = 0;
                    conf1.xMax = conf2.xMax = boxW;
                    conf1.yMin = conf2.yMin = 0;
                    conf1.yMax = conf2.yMax = 0;
                    conf1.y = conf2.y = 0;
                    conf1.x = 0;
                    conf2.x = boxW;


                }else {
                    conf1.tooltipPos[0] = conf2.tooltipPos[0] = plotWidth + plotLeft;

                    rotation = 270;
                    FCcolor.angle = 90;
                    x1 = startX - legendSliderWidth;
                    x2 = startX + boxW;
                    y1 = startY - sliderHeightHalf;
                    y2 = startY + sliderHeightHalf;



                    x1 = mathRound(startX - legendSliderWidth) + sliderCrispAdjuster;
                    x2 = mathRound(startX) + sliderCrispAdjuster;
                    y1 = mathRound(startY - sliderHeightHalf) + sliderCrispAdjuster;
                    y2 = mathRound(startY + sliderHeightHalf) + sliderCrispAdjuster;
                    x3 = mathRound(startX + boxW) + sliderCrispAdjuster;
                    y3 = mathRound(startY - 2) + sliderCrispAdjuster;
                    y4 = mathRound(startY + 2) + sliderCrispAdjuster;
                    y5 = mathRound(startY) + sliderCrispAdjuster;
                    x4 = startX - sliderWidthHalf / 2;
                    x5 = mathRound(x4 - sliderHeightHalf) + sliderCrispAdjuster;
                    x4 = mathRound(x4) + sliderCrispAdjuster;
                    y6 = startY - sliderHeightHalf / 2;
                    y7 = mathRound(y6 + sliderHeightHalf) + sliderCrispAdjuster;
                    y6 = mathRound(y6) + sliderCrispAdjuster;



                    glassW = glassW / 2;

                    sliderPath = [M, x1, y1, L, x2, y1, x2, y3, x3, y5,
                    x2, y4, x2, y2, x1, y2,  Z, M, x5, y6, L, x4, y6, M, x5, y5, L,
                    x4, y5, M, x5, y7, L, x4, y7];
                    sliderEffectPath = [M, x1 + 1, y1, L, x1 + 1, y2, M, x5, y6 - 1, L,
                    x4, y6 - 1, M, x5, y5 - 1, L, x4, y5 - 1, M, x5, y7 - 1, L, x4, y7 - 1];

                    scaleX = startX + boxW + legendScalePadding;
                    scaleX1 = mathRound(scaleX + legendScaleTickDistance) + scaleCrispAdjuster;
                    scaleX = mathRound(scaleX) + scaleCrispAdjuster;
                    scaleTextX =  scaleX1;
                    labelTextX =  startX + widthHalf;//text gutter
                    lastIndex = ln - 1;
                    for (i = 0; i < ln; i += 1) {
                        colorObj = colorArr[i];
                        itemValuePercent = (colorObj.maxvalue - min) / range;
                        itemY = (boxH * itemValuePercent) + startY;
                        scaleY = mathRound(itemY) + scaleCrispAdjuster;
                        if (i) {
                            FCcolor.ratio += COMMASTRING;
                            FCcolor.color += COMMASTRING;
                            FCcolor.alpha += COMMASTRING;
                            scalePath.push(L, scaleX, scaleY, scaleX1, scaleY, M, scaleX, scaleY);
                            if (i === lastIndex) {
                                labelPosition = POSITION_RIGHT;
                                itemY1 = itemY + textPadding;
                            }
                            else {
                                labelPosition = POSITION_CENTER;
                                itemY1 = itemY;
                            }
                        }
                        else {
                            scalePath.push(scaleX, scaleY, L, scaleX1, scaleY, M, scaleX, scaleY);
                            labelPosition = POSITION_LEFT;
                            itemY1 = itemY - textPadding;
                        }

                        //create the color
                        FCcolor.ratio += ((itemValuePercent - lastPosition) * 100);
                        FCcolor.color += pluck(colorObj.code, COLOR_BLACK);
                        FCcolor.alpha += pluck(colorObj.alpha, 100);
                        lastPosition = itemValuePercent;

                        //Display Label
                        colorObj.legendItem = renderer.text(
                            colorObj.label,
                            labelTextX + colorObj.labelY,
                            itemY1
                            )
                        .css(itemStyle)
                        .attr({
                            zIndex: 3,
                            align: labelPosition,
                            rotation: rotation
                        })
                        .add(legendGroup);

                        //scale Label
                        colorObj.legendSymbol = renderer.text(
                            colorObj.scaleLabel,
                            scaleTextX,
                            itemY + colorObj.scaleLabelY
                            )
                        .css(itemStyle)
                        .attr({
                            zIndex: 2,
                            align: POSITION_LEFT
                        }).add(legendGroup);
                        allItems.push(colorObj);
                    }
                    //slider conf
                    conf1.xMin = conf2.xMin = 0;
                    conf1.xMax = conf2.xMax = 0;
                    conf1.yMin = conf2.yMin = 0;
                    conf1.yMax = conf2.yMax = boxH;
                    conf1.x = conf2.x = 0;
                    conf1.y = 0;
                    conf2.y = boxH;
                }


                //create the colorBOx
                elements.colorBox = renderer.rect(startX, startY, boxW, boxH, 0, 1)
                .attr({
                    zIndex: 2,
                    fill: boxFill,
                    stroke: colorBoxBorderCOlor,
                    strokeWidth: colorBoxBorderWidth
                })
                .add(legendGroup);

                //Create the glass effect
                if (lighting3d) {
                    elements.colorBoxEffect = renderer.rect(startX, startY,
                            glassW, glassH, 0, 1)
                    .attr({
                        zIndex: 2,
                        fill: COLOR_GLASS,
                        strokeWidth: 0
                    })
                    .add(legendGroup);
                }

                //create the Scale
                elements.scale = renderer.path(scalePath)
                .attr({
                    zIndex: 2,
                    stroke: legendScaleColor,
                    strokeWidth: legendScaleLineThickness
                })
                .add(legendGroup);

                //various handeler
                sliderDragged = function (xChange, yChange, isSlider1) {
                    var newScaleLimit, i = 0, ln = series && series.length, serie;
                    if (horizontal) {
                        newScaleLimit = (xChange * range / boxW) + min;
                        xChange = xChange || 0.01;
                    }
                    else {
                        newScaleLimit = (yChange * range / boxH) + min;
                        yChange = yChange || 0.01;
                    }


                    if (isSlider1) {
                        elements.slider1.translate(xChange, yChange)
                        .toFront();
                        elements.slider1Effect.translate(xChange, yChange)
                        .toFront();
                        scaleStart = newScaleLimit;
                        conf1.toolText = calcPercent(scaleStart);
                    }else {
                        elements.slider2.translate(xChange, yChange)
                        .toFront();
                        elements.slider2Effect.translate(xChange, yChange)
                        .toFront();
                        scaleEnd = newScaleLimit;
                        conf2.toolText = calcPercent(scaleEnd);
                    }

                    if (interActivity) {
                        //update series
                        scaleIsUpdating = clearTimeout(scaleIsUpdating);
                        scaleIsUpdating = setTimeout(function() {
                            for (; i < ln; i += 1) {
                                serie = series[i];
                                if (serie.setScaleRange) {
                                    serie.setScaleRange(scaleStart, scaleEnd);
                                }
                            }
                        }, 100);
                    }
                }

                sliderDragHandler = function (event) {
                    var config = event.data,
                    touchEvent = (hasTouch && getTouchEvent(event)) || stubEvent,
                    xChange, yChange = xChange = 0,
                    doDrag,
                    isFirst = config.isFirst,
                    otherConf = isFirst? conf2 : conf1;

                    if (event.type === DRAGSTARTSTRING) {
                        config.tooltipOffsetReference = getPosition(chart.container);
                        config.tooltipOffsetReference.left += plotLeft - 20;
                        config.tooltipOffsetReference.top += plotTop;
                        config.lastDraggedX = config.dragStartX = event.pageX || touchEvent.pageX;
                        config.lastDraggedY = config.dragStartY = event.pageY || touchEvent.pageY;
                    }
                    else {
                        if (horizontal) {
                            xChange = config.x + ((event.pageX || touchEvent.pageX) - config.dragStartX);

                            if (xChange <= 0) {
                                xChange = 0;
                            }
                            if (xChange > boxW) {
                                xChange = boxW;
                            }
                            if (isFirst ? xChange > otherConf.x : xChange < otherConf.x) {
                                xChange = otherConf.x;
                            }
                            if (mathAbs(xChange - config.lastDraggedX) >= (config.snapPX || 0)) {
                                doDrag = true;
                            }
                        }
                        else {
                            yChange = config.y + ((event.pageY || touchEvent.pageY) - config.dragStartY);
                            if (yChange <= 0) {
                                yChange = 0;
                            }
                            if (yChange > boxH) {
                                yChange = boxH;
                            }
                            if (isFirst ? yChange > otherConf.y : yChange < otherConf.y) {
                                yChange = otherConf.y;
                            }
                            if (mathAbs(yChange - config.lastDraggedY) >= (config.snapPX || 0)) {
                                doDrag = true;
                            }
                        }

                        if (event.type === DRAGSTRING) {
                            if (doDrag) {
                                config.lastDraggedX = xChange;
                                config.lastDraggedY = yChange;
                                sliderDragged(xChange, yChange, isFirst);
                                showTooltip(event, true);
                            }
                        }
                        else  {
                            delete config.lastDraggedX;
                            delete config.lastDraggedY;
                            delete config.dragStartX;
                            delete config.dragStartY;
                            config.x = xChange;
                            config.y = yChange;
                            sliderDragged(xChange, yChange, isFirst);
                            tooltip && tooltip.hide();
                        }
                    }
                };


                //create the sliders
                elements.slider1 = renderer.path(sliderPath)
                .attr({
                    zIndex: 3,
                    fill: sliderFill,
                    strokeWidth: sliderBorderWidth,
                    stroke: sliderBorderColor
                })
                .css(symbolStyle)
                .add(legendGroup);
                //create the effect
                elements.slider1Effect = renderer.path(sliderEffectPath)
                .attr({
                    zIndex: 3,
                    fill: NONE,
                    strokeWidth: sliderBorderWidth,
                    stroke: sliderEffectColor
                })
                .css(symbolStyle)
                .add(legendGroup);

                elements.slider2 = renderer.path(sliderPath)
                .attr({
                    zIndex: 3,
                    fill: sliderFill,
                    strokeWidth: sliderBorderWidth,
                    stroke: sliderBorderColor
                })
                .css(symbolStyle)
                .add(legendGroup)
                .translate(conf2.x, conf2.y);
                //create the effect
                elements.slider2Effect = renderer.path(sliderEffectPath)
                .attr({
                    zIndex: 3,
                    fill: NONE,
                    strokeWidth: sliderBorderWidth,
                    stroke: sliderEffectColor
                })
                .css(symbolStyle)
                .translate(conf2.x, conf2.y)
                .add(legendGroup);



                // attach pointer events
                addEvent(elements.slider1.element, 'dragstart dragend drag', sliderDragHandler, conf1);
                //addEvent(elements.slider1.element, 'drag', sliderDragHandeler, conf1);
                addEvent(elements.slider1Effect.element, 'dragstart dragend drag', sliderDragHandler, conf1);
                //addEvent(elements.slider1Effect.element, 'drag', sliderDragHandeler, conf1);
                addEvent(elements.slider2.element, 'dragstart dragend drag', sliderDragHandler, conf2);
                //addEvent(elements.slider2.element, 'drag', sliderDragHandeler, conf2);
                addEvent(elements.slider2Effect.element, 'dragstart dragend drag', sliderDragHandler, conf2);
                //addEvent(elements.slider2Effect.element, 'drag', sliderDragHandeler, conf2);


                //tooltip event
                var showTooltip = function (event, duringDrag) {
                    var data = event.data,
                        positionReference = data.tooltipOffsetReference;
                    if (duringDrag || data.lastDraggedX === undefined) {
                        if (tooltip) {
                            if (horizontal) {
                                data.tooltipPos[0] = (event.pageX || event.x ||
                                    event.offsetX) - positionReference.left;
                            }
                            else {
                                data.tooltipPos[1] = (event.pageY || event.y ||
                                    event.offsetY) - positionReference.top;
                            }
                            //show the tooltext
                            tooltip.refresh(data);
                        }
                    }
                },
                tooltipHide = function (event) {
                    var conf = event.data;
                    if (conf.lastDraggedX === undefined) {
                        tooltip && tooltip.hide();
                    }
                };

                // attach pointer events
                //addEvent(elements.slider1.element, 'mouseover', showTooltip, conf1);
                addEvent(elements.slider1.element, 'mouseout', tooltipHide, conf1);
                addEvent(elements.slider1Effect.element, 'mouseover', showTooltip, conf1);
                addEvent(elements.slider1Effect.element, 'mouseout', tooltipHide, conf1);
                addEvent(elements.slider2.element, 'mouseover', showTooltip, conf2);
                addEvent(elements.slider2.element, 'mouseout', tooltipHide, conf2);
                addEvent(elements.slider2Effect.element, 'mouseover', showTooltip, conf2);
                addEvent(elements.slider2Effect.element, 'mouseout', tooltipHide, conf2);
            }

        }

    });

    legendTypes.gradient = gradientLegend;

}]);
/**!
 * @license FusionCharts JavaScript Library
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @author FusionCharts Technologies LLP
 * @version fusioncharts/3.2.4-sr1.9888
 */
FusionCharts(['private', 'modules.renderer.highcharts-powercharts', function () {
    var global = this,
        lib = global.hcLib,

        //strings
        BLANKSTRINGPLACEHOLDER = lib.BLANKSTRINGPLACEHOLDER,
        BLANK = lib.BLANKSTRING,
        HASHSTRING = lib.HASHSTRING,
        BLANKSPACE = ' ',
        COMMASTRING = lib.COMMASTRING,
        createTrendLine = lib.createTrendLine,
        setLineHeight = lib.setLineHeight,

        //add the tools thats are requared
        CONFIGKEY = lib.FC_CONFIG_STRING,
        pluck = lib.pluck,
        getValidValue = lib.getValidValue,
        pluckNumber = lib.pluckNumber,
        defaultPaletteOptions = lib.defaultPaletteOptions,
        getFirstValue = lib.getFirstValue,
        SHAPE_RECT = lib.SHAPE_RECT,
        extend2 = lib.extend2,//old: jarendererExtend / mergecolone
        deltend = lib.deltend,
        getDashStyle = lib.getDashStyle, // returns dashed style of a line series
        FC_CONFIG_STRING = lib.FC_CONFIG_STRING,

        getFirstColor = lib.getFirstColor,
        pluckColor = lib.pluckColor,
        getFirstAlpha = lib.getFirstAlpha,
        libGraphics = lib.graphics,
        getColumnColor = libGraphics.getColumnColor,
        getDarkColor = libGraphics.getDarkColor,
        getLightColor = libGraphics.getLightColor,
        convertColor = libGraphics.convertColor,
        parseColor = libGraphics.parseColor,
        getValidColor = libGraphics.getValidColor,
        mapSymbolName = libGraphics.mapSymbolName,
        COLOR_TRANSPARENT = lib.COLOR_TRANSPARENT,

        chartAPI = lib.chartAPI,

        HUNDREDSTRING = lib.HUNDREDSTRING,

        titleSpaceManager = lib.titleSpaceManager,
        placeHorizontalAxis = lib.placeHorizontalAxis,
        placeVerticalAxis = lib.placeVerticalAxis,
        stepYAxisNames = lib.stepYAxisNames,
        dropHash = lib.regex.dropHash,
        getDefinedColor = lib.getDefinedColor,
        parseUnsafeString = lib.parseUnsafeString,
        toPrecision = lib.toPrecision,
        COMMASPACE = lib.COMMASPACE,
        pluckFontSize = lib.pluckFontSize, // To get the valid font size (filters negative values)

        getAxisLimits = lib.getAxisLimits,
        adjustHorizontalCanvasMargin = lib.adjustHorizontalCanvasMargin,
        adjustVerticalCanvasMargin = lib.adjustVerticalCanvasMargin,

        singleSeriesAPI = chartAPI.singleseries,

        getDataParser = lib.getDataParser,

        Highcharts = lib.Highcharts,
        Series = Highcharts.Series,
        fireEvent = Highcharts.fireEvent,
        hasTouch = Highcharts.hasTouch,
        getTouchEvent = Highcharts.getTouchEvent,
        hasSVG = Highcharts.hasSVG,
        isIE = Highcharts.isIE,
        extend = Highcharts.extend,
        merge = Highcharts.merge,
        pick = Highcharts.pick,
        each = Highcharts.each,
        attr = Highcharts.attr,
        css = Highcharts.css,
        docMode8 = Highcharts.docMode8,
        isVML = isIE && !hasSVG,
        createElement = Highcharts.createElement,
        discardElement = Highcharts.discardElement,
        seriesTypes = Highcharts.seriesTypes,
        addEvent = Highcharts.addEvent,
        removeEvent = Highcharts.removeEvent,
        Color = Highcharts.Color,
        defaultOptions = Highcharts.getOptions(),
        defaultPlotOptions = defaultOptions.plotOptions,

        OBJECTBOUNDINGBOX = 'objectBoundingBox', // gradient unit
        ROUND = 'round',
        DRAGSTART = 'dragstart',
        DRAGEND = 'dragend',
        UNDEFINED,
        TRACKER_FILL = 'rgba(192,192,192,'+ (hasSVG ? 0.000001 : 0.002) +')', // invisible but clickable
        NORMAL_STATE = '',
        SELECT_STATE = 'select',
        HIDDEN = 'hidden',
        VISIBLE = isIE && !hasSVG ? 'visible' : '',
        ABSOLUTE = 'absolute',
        NONE = 'none',
        PX = 'px',
        M = 'M',
        L = 'L',
        A = 'A',
        AT = 'AT',
        WA = 'WA',
        Z = 'Z',
        CORNER = 'corner',
        TRACKER = 'Tracker',
        SELECT = 'select',
        COMMA = ',',
        ZERO = '0',
        ONE = '1',
        HUNDRED = '100',
        POSITION_CENTER = 'center',
        POSITION_TOP = 'top',
        POSITION_BOTTOM = 'bottom',
        POSITION_RIGHT = 'right',
        POSITION_LEFT = 'left',
        POSITION_MIDDLE = 'middle',
        LABEL = 'label',
        INPUT = 'input',
        INT_ZERO = 0,
        OPTIONSTR = '<option>',
        OPTIONCLOSESTR = '</option>',
        STRPERCENT = '%',
        BGRATIOSTRING = lib.BGRATIOSTRING,
        stubEvent = {
            pageX: 0,
            pageY: 0
        },

        math = Math,
        mathPI = math.PI,
        deg2rad = mathPI / 180,
        mathAbs = math.abs,
        mathMax = math.max,
        mathMin = math.min,
        mathCeil = math.ceil,
        mathRound = math.round,
        mathLog = math.log,
        mathFloor = math.floor,
        mathPow = math.pow,
        mathSqrt = math.sqrt,
        mathCos = math.cos,
        mathSin = math.sin,
        DECIMALS = 100000000,
        POINT_FIVE = 0.5,
        COLOR_WHITE = 'FFFFFF',

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

        /**
         * Fixes color values by appending hash wherever needed
         */
        hashify = function (color) {
            return color && color.replace(/^#?([a-f0-9]+)/ig, '#$1') || NONE;
        },

        creditLabel = false && !/fusioncharts\.com$/i.test(location.hostname);

    // Adding FC_ChartUpdated event to eventList
    // for dragCharts
    lib.eventList.chartupdated = 'FC_ChartUpdated';
    lib.eventList.dataposted = 'FC_DataPosted';
    lib.eventList.dataposterror = 'FC_DataPostError';
    lib.eventList.datarestored = 'FC_DataRestored';


    global.addEventListener('rendered', function(event) {
        var chartObj = event.sender,
            state = chartObj.__state,
            iapi = chartObj.jsVars && chartObj.jsVars.instanceAPI;

        if (!state.listenersAdded && iapi && typeof iapi.getCollatedData === 'function') {
            chartObj.addEventListener(['chartupdated', 'dataupdated', 'rendered'], function (event) {
                delete event.sender.__state.hasStaleData;
            });
            state.listenersAdded = true;
        }
    });

    /* Spline Charts */
    chartAPI('spline', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'spline'
    }, chartAPI.linebase);

    chartAPI('splinearea', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'areaspline',
        anchorAlpha: '100'
    }, chartAPI.area2dbase);


    chartAPI('msspline', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'spline'
    }, chartAPI.mslinebase);


    chartAPI('mssplinearea', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'areaspline'
    }, chartAPI.msareabase);


    chartAPI('msstepline', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'line',
        stepLine: true
    }, chartAPI.mslinebase);


    /* Inverse Charts */
    chartAPI('inversemsline', {
        standaloneInit: true,
        inversed : true
    }, chartAPI.mslinebase);

    chartAPI('inversemsarea', {
        standaloneInit: true,
        inversed : true
    }, chartAPI.msareabase);

    chartAPI('inversemscolumn2d', {
        standaloneInit: true,
        inversed : true
    }, chartAPI.mscolumn2dbase);

    // Log chart vizualization logic data structure. Log charts are essentially
    // inherited from their corresponding linear charts and their axis is updated
    // to plot log data in linear mapping.
    chartAPI('logmsline', {
        standaloneInit: true,

        // Log charts cannot have negative values.
        isValueAbs : true,
        // Mark this as log axis for the axis and other rendering tweaks within
        // Highcharts
        isLog : true,
        configureAxis: chartAPI.logbase.configureAxis,
        pointValueWatcher: chartAPI.logbase.pointValueWatcher,
        getLogAxisLimits: chartAPI.logbase.getLogAxisLimits,
        creditLabel: creditLabel
    }, chartAPI.mslinebase);

    // Log chart vizualization logic data structure. Log charts are essentially
    // inherited from their corresponding linear charts and their axis is updated
    // to plot log data in linear mapping.
    // Log column chart has its axes redefined in LogMSLine chart.
    chartAPI('logmscolumn2d', {
        standaloneInit: true,
        isLog: true,
        isValueAbs: true,
        configureAxis: chartAPI.logbase.configureAxis,
        pointValueWatcher: chartAPI.logbase.pointValueWatcher,
        getLogAxisLimits: chartAPI.logbase.getLogAxisLimits,
        creditLabel: creditLabel
    }, chartAPI.mscolumn2dbase);


    /////////////// ErrorBar2D ///////////
    chartAPI('errorbar2d', {
        standaloneInit: true,
        creditLabel : creditLabel,
        showValues: 0,

        chart: function (w, h) {
            var hc = this.base.chart.apply(this, arguments),
            drawErrorValue = this.drawErrorValue;

            if (!hc.callbacks) {
                hc.callbacks = [];
            }
            hc.callbacks.push(function () {
                var chart = this,
                series = chart.series,
                len = series && series.length;
                while (len--) {
                    drawErrorValue.call(series[len]);
                }
            });

            return hc;
        },

        point : function (chartName, series, dataset, FCChartObj, HCObj,
            catLength, seriesIndex, MSStackIndex) {
            var hasValidPoint = false;
            // We proceed if there is data inside dataset object
            if (dataset.data) {
                var notHalfErrorBar = !pluckNumber(FCChartObj.halferrorbar, 1),
                data = dataset.data,
                // HighChart configuration object
                conf = HCObj[CONFIGKEY],
                // 100% stacked chart takes absolute values only
                isValueAbs = pluck(this.isValueAbs, conf.isValueAbs, false),
                // showValues attribute in individual dataset
                datasetShowValues = pluckNumber(dataset.showvalues,
                    conf.showValues),
                seriesYAxis = pluckNumber(series.yAxis, 0),
                // use3DLighting to show gradient color effect in 3D
                // Column charts
                use3DLighting = pluckNumber(FCChartObj.use3dlighting, 1),
                NumberFormatter = HCObj[CONFIGKEY].numberFormatter,
                paletteIndex = HCObj.chart.paletteIndex,
                plotGradientColor = COMMA +  (pluckNumber(
                    FCChartObj.useplotgradientcolor, 1) ? getDefinedColor(
                    FCChartObj.plotgradientcolor,
                    defaultPaletteOptions.plotGradientColor[paletteIndex]) :
                BLANK),
                defAlpha = pluck(dataset.alpha,
                    FCChartObj.plotfillalpha, HUNDRED),
                errorBarAlpha = getFirstAlpha(pluck(
                    dataset.errorbaralpha, FCChartObj.errorbaralpha,
                    defAlpha)),
                seriesDashStyle = pluckNumber(dataset.dashed,
                    FCChartObj.plotborderdashed, 0),
                // length of the dash
                seriesDashLen = pluckNumber(dataset.dashlen,
                    FCChartObj.plotborderdashlen, 5),
                // distance between dash
                seriesDashGap = pluckNumber(dataset.dashgap,
                    FCChartObj.plotborderdashgap, 4),
                errorBarShadow = this.errorBarShadow = pluckNumber(FCChartObj.errorbarshadow, 0),

                is3d,
                index,
                isBar,
                dataObj,
                setRatio,
                setAngle,
                setColor,
                setAlpha,
                colorArr,
                dataLabel,
                itemValue,
                errorValue,
                pointShadow,
                errorBarShadowObj,
                isRoundEdges,
                errorValueArr,
                setBorderWidth,
                plotBorderAlpha,
                setPlotBorderColor,
                setPlotBorderAlpha;

                // Dataset seriesname
                series.name = getValidValue(dataset.seriesname);

                // If includeInLegend set to false
                // We set series.name blank
                if (pluckNumber(dataset.includeinlegend) === 0 ||
                    defAlpha == 0 || series.name === undefined) {
                    series.showInLegend = false;
                }

                // Error Bar Attributes
                series.errorBarWidthPercent = pluckNumber(
                    dataset.errorbarwidthpercent,
                    FCChartObj.errorbarwidthpercent, 70);
                series.errorBarColor = convertColor(getFirstColor(
                    pluck(dataset.errorbarcolor, FCChartObj.errorbarcolor,
                        'AAAAAA')), errorBarAlpha);
                series.errorBarThickness = pluckNumber(
                    dataset.errorbarthickness, FCChartObj.errorbarthickness, 1);

                // Color of the individual series
                series.color = pluck(dataset.color,
                    HCObj.colors[seriesIndex % HCObj.colors.length]).split(
                    COMMA)[0].replace(/^#?/g, "#");
                // Column border thickness
                setBorderWidth = pluck(FCChartObj.plotborderthickness,
                    ONE);
                // whether to use round edges or not in the column
                isRoundEdges = HCObj.chart.useRoundEdges;
                // is3d and isBar helps to get the column color by
                // getColumnColor function
                // whether the chart is a 3D or Bar
                isBar = this.isBar;
                is3d = /3d$/.test(HCObj.chart.defaultSeriesType);

                // dataplot border color
                setPlotBorderColor = pluck(FCChartObj.plotbordercolor,
                    defaultPaletteOptions.plotBorderColor[paletteIndex])
                .split(COMMA)[0];
                // dataplot border alpha
                setPlotBorderAlpha = FCChartObj.showplotborder == ZERO  ?
                ZERO : pluck(FCChartObj.plotborderalpha, HUNDRED);

                // Managing plot border color for 3D column chart
                // 3D column chart doesn't show the plotborder by default
                // until we set showplotborder true
                setPlotBorderAlpha = is3d ? (FCChartObj.showplotborder ?
                    setPlotBorderAlpha : ZERO) : setPlotBorderAlpha;

                // Default  plotBorderColor  is FFFFFF for this 3d chart
                setPlotBorderColor = is3d ? pluck(FCChartObj.plotbordercolor,
                    "#FFFFFF") : setPlotBorderColor;

                // Iterate through all level data
                // We are managing the data value labels and other cosmetics
                // inside this loop
                for (index = 0; index < catLength; index += 1) {
                    // Individual data object
                    dataObj = data[index];
                    if (dataObj) {
                        // get the valid value
                        itemValue = NumberFormatter.getCleanValue(dataObj.value,
                            isValueAbs);
                        // get the valid value
                        errorValue = NumberFormatter.getCleanValue(
                            dataObj.errorvalue, isValueAbs);
                        if (itemValue === null) {
                            // add the data
                            series.data.push({
                                y : null
                            });
                            continue;
                        }

                        hasValidPoint = true;
                        // Label of the data
                        // We take the label from HighCharts configuration
                        // object
                        dataLabel = conf.oriCatTmp[index];
                        // Individual data point color
                        setColor = pluck(dataObj.color, dataset.color,
                            HCObj.colors[seriesIndex % HCObj.colors.length]) +
                        plotGradientColor;
                        // Alpha of the data point
                        setAlpha = getFirstAlpha(pluck(dataObj.alpha, defAlpha))
                        + BLANK;
                        setRatio = pluck(dataObj.ratio, dataset.ratio,
                            FCChartObj.plotfillratio);
                        // defaultAngle depend upon item value
                        setAngle = pluck(360 - FCChartObj.plotfillangle, 90);
                        if (itemValue < 0) {
                            setAngle = 360 - setAngle;
                        }
                        // Used to set alpha of the shadow
                        pointShadow = {
                            opacity: setAlpha / 100
                        };
                        plotBorderAlpha = mathMin(setAlpha,
                            getFirstAlpha(setPlotBorderAlpha)) + BLANK;

                        // calculate the color object for the set
                        colorArr = getColumnColor(setColor, setAlpha, setRatio,
                            setAngle, isRoundEdges, setPlotBorderColor,
                            plotBorderAlpha, isBar, is3d);

                        errorBarShadowObj = {
                            opacity: errorBarAlpha / 250
                        };
                        errorValueArr = [];
                        errorValueArr.push({
                            errorValue: errorValue,
                            toolText: errorValue,
                            shadow: errorBarShadowObj
                        });
                        notHalfErrorBar && errorValueArr.push({
                            errorValue: -errorValue,
                            toolText: errorValue,
                            shadow: errorBarShadowObj
                        });

                        // add the data
                        series.data.push(extend2(this.getPointStub(dataObj,
                            itemValue, dataLabel, HCObj, dataset,
                            datasetShowValues, seriesYAxis), {
                            y : itemValue,
                            shadow: pointShadow,
                            //errorValue: errorValue,
                            errorValue: errorValueArr,
                            color: colorArr[0],
                            borderColor: colorArr[1],
                            borderWidth: setBorderWidth,
                            use3DLighting : use3DLighting,
                            // get per-point dash-style
                            dashStyle: pluckNumber(dataObj.dashed,
                                seriesDashStyle) ? getDashStyle(
                                pluck(dataObj.dashlen, seriesDashLen),
                                pluck(dataObj.dashgap, seriesDashGap),
                                setBorderWidth) : undefined
                        }));

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the maximum and
                        // minimum value of the Axis
                        this.pointValueWatcher(HCObj, itemValue, errorValue);

                    }
                    else {
                        // add the data
                        series.data.push({
                            y : null
                        });
                    }
                }
            }

            if (!hasValidPoint) {
                series.showInLegend = false
            }

            return series;
        },

        pointValueWatcher : function (HCObj, value, errorValue) {
            var pValue, nValue, obj, stackObj, FCconf = HCObj[CONFIGKEY],
            yAxisIndex = 0;
            if ( value !== null) {
                if (errorValue) {
                    pValue = value + errorValue
                    nValue = value - errorValue;
                }
                else {
                    pValue = nValue = value;
                }


                if (!FCconf[yAxisIndex]) {
                    FCconf[yAxisIndex] = {};
                }
                obj = FCconf[yAxisIndex];

                obj.max = obj.max > pValue ? obj.max : pValue;
                obj.min = obj.min < pValue ? obj.min : pValue;
                obj.max = obj.max > nValue ? obj.max : nValue;
                obj.min = obj.min < nValue ? obj.min : nValue;
            }
        },

        drawErrorValue: function () {
            var series = this,
            data = series.data,
            chart = series.chart,
            options = series.options,
            animation = options.animation,
            dataLabelsGroup = series.dataLabelsGroup,
            errorPath = [],
            renderer = chart.renderer,
            trackerLabel = +new Date(),
            cursor = options.cursor,
            css = cursor && {
                cursor: cursor
            } || {},
            dataLabelsOptions = options.dataLabels,
            style = dataLabelsOptions.style,
            lineHeight = parseInt(style.lineHeight, 10),
            chartOptions = chart.options.chart,
            chartAPI = chart.options.instanceAPI,
            canvasHeight = chart.plotHeight,
            canvasWidth = chart.plotWidth,
            TEXT_GUTTER = 3,
            valuePadding = chartOptions.valuePadding + TEXT_GUTTER,
            rotateValues = (chartOptions.rotateValues == 1) ? 270 :
            undefined,
            textAlign = POSITION_CENTER,
            errorTxtValuePos = {},
            useCrispErrorPath = !chartAPI.avoidCrispError,
            group = pluck(series.errorGroup, series.group),
            shadowGroup = series.shadowGroup,
            errorBarShadow = pluckNumber(chartAPI.errorBarShadow,
                options.shadow),
            labelBottomY,
            labelTopY,
            pointLink,
            crispX,
            crispY,
            errorTracker,
            errorPoint,
            plotX,
            plotY,
            dataLen,
            point,
            errorValue,
            errorGraph,
            x,
            errorValueArr,
            errorLen,
            errorValueObj,
            isHorizontal,
            shapeArgs,
            shapeWidth,
            errorBarThickness,
            halfErrorBar,
            errorStarPos,
            errorValuePX,
            errorStarPosPX,
            errorWidth,
            errorStartValue,
            widthPercent;

            if (series) {
                dataLen = data.length;
                if (chartAPI.useErrorGroup) {
                    series.errorGroup = renderer.g('errorBar')
                    .add(group);

                    group && group.element && group.element.childNodes &&
                    group.element.childNodes[0] &&
                    group.element.childNodes[0].parentNode.insertBefore(
                        series.errorGroup.element, group.element.childNodes[0]);
                    group = series.errorGroup;
                }

                // Put all shadows inside a group to avoid them to get sandwiched
                // between overlapping plot segments.
                if (!shadowGroup && errorBarShadow) {
                    shadowGroup = series.shadowGroup = renderer.g('shadow')
                    .add(group);

                    group && group.element && group.element.childNodes &&
                    group.element.childNodes[0] &&
                    group.element.childNodes[0].parentNode.insertBefore(
                        shadowGroup.element, group.element.childNodes[0]);
                }

                // Loop through each data points
                while (dataLen--) {
                    point = data[dataLen];
                    plotY = point.plotY;
                    errorValueArr = point.errorValue;
                    // only draw the point if y is defined
                    if (plotY !== UNDEFINED && !isNaN(plotY) &&
                        (errorValueArr && (errorLen = errorValueArr.length))) {
                        point = data[dataLen];
                        shapeArgs = point.shapeArgs;
                        shapeWidth = shapeArgs && shapeArgs.width;
                        x = shapeArgs && shapeArgs.x;
                        plotX = pluckNumber(x + (shapeWidth / 2), point.plotX);
                        widthPercent = shapeWidth * options.errorBarWidthPercent
                        / 100;
                        // Loop though errorValue array
                        while (errorLen--) {
                            errorValueObj = errorValueArr[errorLen];
                            // If shadow for errorBar not given
                            // we are not suppose to show the shadow
                            errorValueObj.shadow = errorValueObj.shadow || {
                                opacity: 0
                            };
                            errorValue = errorValueObj.errorValue;

                            if (!errorValueObj || !defined(errorValue)) {
                                continue;
                            }
                            isHorizontal =
                            pluckNumber(errorValueObj.isHorizontal, 0);
                            errorBarThickness =
                            pluckNumber(errorValueObj.errorBarThickness,
                                options.errorBarThickness);

                            // Horizontal Error Drawing
                            if (isHorizontal) {
                                errorWidth = pluckNumber(widthPercent,
                                    errorValueObj.errorWidth,
                                    options.hErrorBarWidth,
                                    options.errorBarWidth);
                                halfErrorBar = errorWidth / 2;
                                errorStartValue = errorValueObj.errorStartValue;
                                errorStarPosPX = pluckNumber(errorStartValue &&
                                    series.xAxis.translate(errorStartValue),
                                    plotX);
                                errorValuePX = errorStarPosPX +
                                series.xAxis.translate(errorValue, 0, 0, 0, 0,
                                    1);
                                errorTxtValuePos.x = errorValuePX +
                                TEXT_GUTTER + valuePadding;
                                errorTxtValuePos.y = plotY;
                                crispY = plotY;
                                crispX = errorValuePX;
                                // Creating the error path
                                // We are making crisp path manually here
                                // because here two different path is
                                // using as a single path.
                                if (useCrispErrorPath) {
                                    crispY = mathRound(plotY) +
                                    (errorBarThickness % 2 / 2);
                                    crispX = mathRound(errorValuePX) +
                                    (errorBarThickness % 2 / 2)
                                }

                                errorPath = [M,
                                errorStarPosPX, crispY, L, crispX,
                                crispY, M, crispX, crispY -
                                halfErrorBar, L, crispX, crispY +
                                halfErrorBar];
                            }
                            // Vertical Error Drawing
                            else {
                                errorWidth = pluckNumber(widthPercent,
                                    errorValueObj.errorWidth,
                                    options.vErrorBarWidth,
                                    options.errorBarWidth);
                                halfErrorBar = errorWidth / 2;
                                errorStarPos = pluckNumber(
                                    errorValueObj.errorStartValue, point.y);
                                errorValuePX = series.yAxis.translate(
                                    errorStarPos + errorValue, 0, 1, 0, 1);
                                errorStarPosPX = series.yAxis.translate(
                                    errorStarPos, 0, 1, 0, 1);
                                // Calculate x position of the label text
                                errorTxtValuePos.x = plotX + (rotateValues ?
                                    lineHeight * 0.37 : 0);

                                labelTopY = errorValuePX + (lineHeight * 0.37 +
                                    errorBarThickness + valuePadding);
                                labelBottomY = errorValuePX - valuePadding;
                                // Manage display value if going outside the canvas
                                if (errorStarPosPX > errorValuePX) {
                                    errorTxtValuePos.y = labelBottomY;
                                    if (labelBottomY < lineHeight) {
                                        errorTxtValuePos.y = labelTopY;
                                    }
                                } else {
                                    errorTxtValuePos.y = labelTopY;
                                    if (canvasHeight - labelTopY < lineHeight) {
                                        errorTxtValuePos.y = labelBottomY;
                                    }
                                }


                                textAlign = (errorStarPosPX > errorValuePX)
                                && rotateValues ? POSITION_LEFT :
                                POSITION_CENTER

                                // Creating the error path
                                crispY = errorValuePX;
                                crispX = plotX;
                                // Making the crispLine
                                // We are making crisp path manually here
                                // because here two different path is
                                // using as a single path.
                                if (useCrispErrorPath) {
                                    crispY = mathRound(errorValuePX) +
                                    (errorBarThickness % 2 / 2);
                                    crispX = mathRound(plotX) +
                                    (errorBarThickness % 2 / 2)
                                }

                                errorPath = [M, crispX,
                                errorStarPosPX, L, crispX, crispY, M,
                                crispX - halfErrorBar, crispY, L,
                                crispX + halfErrorBar, crispY];
                            }

                            if (defined(errorValueObj.displayValue)) {
                                renderer.text(
                                    errorValueObj.displayValue,
                                    errorTxtValuePos.x,
                                    errorTxtValuePos.y
                                    )
                                .attr({
                                    align: textAlign,
                                    rotation: rotateValues
                                })
                                // without position absolute,
                                // IE export sometimes is wrong
                                .css(style)
                                .add(dataLabelsGroup);
                            }

                            if (!point.errorGraph) {
                                point.errorGraph = [];
                            }

                            errorGraph = point.errorGraph[errorLen];
                            if (errorGraph) { // update
                                stop(errorGraph);
                                errorGraph.animate({
                                    d : errorPath
                                });
                            }
                            else {
                                point.errorGraph[errorLen] =
                                chart.renderer.path(errorPath).attr({
                                    'stroke-linecap': ROUND,
                                    'stroke-width': errorBarThickness,
                                    stroke: pluck(errorValueObj.errorBarColor,
                                        options.errorBarColor),
                                    dashstyle: pluck(errorValueObj.dashStyle,
                                        options.errorBarDashStyle)
                                })
                                .add(group)
                                .shadow(errorBarShadow, shadowGroup,
                                    errorValueObj.shadow || 0);
                                chartAPI.useErrorAnimation && animation &&
                                point.errorGraph[errorLen].hide();
                            }

                            // *** Now draw the tracker for errorValue ***
                            if (!point.errorTracker) {
                                point.errorTracker = [];
                            }

                            errorTracker = point.errorTracker[errorLen];
                            // Set the hand cursor when point has a defined link
                            // value.
                            if ((pointLink = pluck(errorValueObj.link,
                                point.link)) !== undefined) {
                                css.cursor  = 'pointer';
                                css._cursor = 'hand';
                            }
                            // Restore default cursor when there is no link.
                            else {
                                css.cursor = css._cursor = 'default';
                            }
                            if (errorTracker) {// update
                                errorTracker.attr({
                                    d: errorPath
                                });
                            }
                            else {
                                // Build the point for error tooltip
                                errorPoint = point.errorTracker[errorLen] =
                                renderer.path(errorPath).attr({
                                    'stroke-width': mathMax(errorBarThickness,
                                        10),
                                    stroke: TRACKER_FILL,
                                    isTracker: trackerLabel,
                                    fill: TRACKER_FILL,
                                    visibility: series.visible ? VISIBLE :
                                    HIDDEN,
                                    zIndex: 1
                                })
                                .on(hasTouch ? 'touchstart' : 'mouseover',
                                    function(e) {
                                        var plotLeft = chart.plotLeft,
                                        plotTop = chart.plotTop,
                                        element = (e.currentTarget ?
                                            e.currentTarget : e.srcElement),
                                        point;
                                        if (!(point = element.point)) {
                                            return;
                                        }
                                        chart.hoverPoint &&
                                        chart.hoverPoint.onMouseOut();
                                        chart.hoverPoint = null;

                                        point.tooltipPos = [
                                        pluck(e.layerX, e.x)
                                        - plotLeft + 20,
                                        pluck(e.layerY, e.y)
                                        - plotTop - 15];
                                        //show the tooltext
                                        chart.tooltip &&
                                        chart.tooltip.refresh(point);
                                    })
                                .on('mousemove', function(e) {
                                    var plotLeft = chart.plotLeft,
                                    plotTop = chart.plotTop,
                                    element = (e.currentTarget ?
                                        e.currentTarget : e.srcElement),
                                    point;
                                    if (!(point = element.point)) {
                                        return;
                                    }
                                    point.tooltipPos = [
                                    pluck(e.layerX, e.x)
                                    - plotLeft + 20,
                                    pluck(e.layerY, e.y)
                                    - plotTop - 15];
                                    //show the tooltext
                                    chart.tooltip &&
                                    chart.tooltip.refresh(point);
                                })
                                .on('mouseout', function() {
                                    //hide the tooltip
                                    chart.tooltip &&
                                    chart.tooltip.hide();
                                })
                                .on('click', function (e) {
                                    var element = (e.currentTarget ?
                                        e.currentTarget : e.srcElement),
                                    point;
                                    if (!(point = element.point)) {
                                        return;
                                    }
                                    chartAPI.linkClickFN.call(point);
                                })
                                .css(css)
                                .add(point.group || chart.trackerGroup);

                                extend(errorPoint, {
                                    link: pointLink,
                                    series : series,
                                    chart : chart,
                                    options : point.options,
                                    toolText: pluck(errorValueObj.toolText,
                                        point.toolText),
                                    getLabelConfig : point.getLabelConfig
                                });

                                // store reference to error Point for
                                // access via events.
                                point.errorTracker[errorLen].element.point =
                                errorPoint;
                            }
                        } // End of while error array
                    }
                } // End of while data array
            }
        }
    }, chartAPI.mscolumn2dbase);


    /////////////// ErrorBar2D ///////////
    chartAPI('errorline', {
        standaloneInit: true,
        creditLabel : creditLabel,
        chart: chartAPI.errorbar2d.chart,
        drawErrorValue: chartAPI.errorbar2d.drawErrorValue,
        useErrorGroup: true,
        point: function (chartName, series, dataset, FCChartObj, HCObj,
            catLength, seriesIndex) {
            var hasValidPoint = false;
            if (dataset.data) {
                var notHalfErrorBar = !pluckNumber(FCChartObj.halferrorbar, 1),
                // Data array in dataset object
                data = dataset.data,
                // HighChart configuration object
                conf = HCObj[CONFIGKEY],
                // 100% stacked chart takes absolute values only
                isValueAbs = pluck(this.isValueAbs, conf.isValueAbs, false),
                // showValues attribute in individual dataset
                datasetShowValues = pluckNumber(dataset.showvalues,
                    conf.showValues),
                seriesYAxis = pluckNumber(series.yAxis, 0),
                NumberFormatter = this.numberFormatter,
                // Line cosmetics attributes
                // Color of the line series
                lineColorDef = getFirstColor(pluck(dataset.color,
                    FCChartObj.linecolor, HCObj.colors[seriesIndex %
                    HCObj.colors.length])),

                HCChartObj = HCObj.chart,
                // Alpha of the line
                lineAlphaDef = pluck(dataset.alpha, FCChartObj.linealpha,
                    HUNDRED),
                errorBarAlpha = pluckNumber(dataset.errorbaralpha,
                    FCChartObj.errorbaralpha, lineAlphaDef),
                // Line Thickness
                lineThickness = pluckNumber(dataset.linethickness,
                    FCChartObj.linethickness, 2),
                // Whether to use dashline
                lineDashed = Boolean(pluckNumber(dataset.dashed,
                    FCChartObj.linedashed, 0)),

                // line dash attrs
                lineDashLen = pluckNumber(dataset.linedashlen,
                    FCChartObj.linedashlen, 5),
                lineDashGap = pluckNumber(dataset.linedashgap,
                    FCChartObj.linedashgap, 4),

                itemValue,
                errorValue,
                index,
                lineColor,
                lineAlpha,
                drawAnchors,
                setAnchorAlpha,
                setAnchorBgAlpha,
                setAnchorBgColor,
                setAnchorBorderColor,
                setAnchorBorderThickness,
                setAnchorRadius,
                setAnchorSides,
                dataLabel,
                dataObj,
                pointShadow,
                setAnchorSidesDef,
                setAnchorRadiusDef,
                setAnchorBorderColorDef,
                setAnchorBorderThicknessDef,
                setAnchorBgColorDef,
                setAnchorAlphaDef,
                setAnchorBgAlphaDef,
                setAnchorAngleDef,
                pointAnchorEnabled,
                dashStyle,
                errorValueArr;

                // Dataset seriesname
                series.name = getValidValue(dataset.seriesname);

                // Set the line color and alpha to
                // HC seris obj with FusionCharts color format using FCcolor obj
                series.color = {
                    FCcolor: {
                        color: lineColorDef,
                        alpha: lineAlphaDef
                    }
                };

                // Set the line thickness (line width)
                series.lineWidth = lineThickness;
                // Managing line series markers
                // Whether to drow the Anchor or not
                drawAnchors = pluckNumber(dataset.drawanchors,
                    dataset.showanchors, FCChartObj.drawanchors,
                    FCChartObj.showanchors);

                // Anchor cosmetics
                // We first look into dataset then chart obj and then
                // default value.
                setAnchorSidesDef = pluckNumber(dataset.anchorsides,
                    FCChartObj.anchorsides, 0);
                setAnchorRadiusDef = pluckNumber(dataset.anchorradius,
                    FCChartObj.anchorradius, 3);
                setAnchorBorderColorDef = getFirstColor(pluck(
                    dataset.anchorbordercolor, FCChartObj.anchorbordercolor,
                    lineColorDef));
                setAnchorBorderThicknessDef = pluckNumber(
                    dataset.anchorborderthickness,
                    FCChartObj.anchorborderthickness, 1);
                setAnchorBgColorDef = getFirstColor(pluck(
                    dataset.anchorbgcolor, FCChartObj.anchorbgcolor,
                    defaultPaletteOptions.anchorBgColor[
                    HCChartObj.paletteIndex]));
                setAnchorAlphaDef = pluck(dataset.anchoralpha,
                    FCChartObj.anchoralpha, HUNDRED);
                setAnchorBgAlphaDef = pluck(dataset.anchorbgalpha,
                    FCChartObj.anchorbgalpha, setAnchorAlphaDef);
                setAnchorAngleDef = pluckNumber(dataset.anchorstartangle,
                    FCChartObj.anchorstartangle, 0);

                // Error Bar Attributes
                series.errorBarWidth = pluckNumber(FCChartObj.errorbarwidth,
                    dataset.errorbarwidth, 5);
                series.errorBarColor = convertColor(getFirstColor(pluck(
                    dataset.errorbarcolor, FCChartObj.errorbarcolor, 'AAAAAA')),
                errorBarAlpha);
                series.errorBarThickness = mathMin(lineThickness,
                    pluckNumber(dataset.errorbarthickness,
                        FCChartObj.errorbarthickness, 1));


                // If includeInLegend set to false
                // We set series.name blank
                if (pluckNumber(dataset.includeinlegend) === 0 ||
                    series.name === undefined || (lineAlphaDef == 0 &&
                        drawAnchors !== 1)) {
                    series.showInLegend = false;
                }

                //set the marker attr at series
                series.marker = {
                    fillColor: {
                        FCcolor: {
                            color: setAnchorBgColorDef,
                            alpha: ((setAnchorBgAlphaDef * setAnchorAlphaDef)
                                / 100) + BLANK
                        }
                    },
                    lineColor: {
                        FCcolor: {
                            color: setAnchorBorderColorDef,
                            alpha: setAnchorAlphaDef + BLANK
                        }
                    },
                    lineWidth: setAnchorBorderThicknessDef,
                    radius: setAnchorRadiusDef,
                    symbol: mapSymbolName(setAnchorSidesDef),
                    startAngle: setAnchorAngleDef
                };


                // Iterate through all level data
                for (index = 0; index < catLength; index += 1) {
                    // Individual data obj
                    // for further manipulation
                    dataObj = data[index];
                    if (dataObj) {
                        itemValue = NumberFormatter.getCleanValue(dataObj.value,
                            isValueAbs);
                        errorValue = NumberFormatter.getCleanValue(
                            dataObj.errorvalue, isValueAbs);

                        if (itemValue === null) {
                            // add the data
                            series.data.push({
                                y : null
                            });
                            continue;
                        }

                        hasValidPoint = true;

                        // Anchor cosmetics in data points
                        // Getting anchor cosmetics for the data points or
                        // its default values
                        setAnchorSides = pluckNumber(dataObj.anchorsides,
                            setAnchorSidesDef);
                        setAnchorRadius = pluckNumber(dataObj.anchorradius,
                            setAnchorRadiusDef);
                        setAnchorBorderColor = getFirstColor(pluck(
                            dataObj.anchorbordercolor,
                            setAnchorBorderColorDef));
                        setAnchorBorderThickness = pluckNumber(
                            dataObj.anchorborderthickness,
                            setAnchorBorderThicknessDef);
                        setAnchorBgColor = getFirstColor(pluck(
                            dataObj.anchorbgcolor, setAnchorBgColorDef));
                        setAnchorAlpha = pluck(dataObj.anchoralpha,
                            setAnchorAlphaDef);
                        setAnchorBgAlpha = pluck(dataObj.anchorbgalpha,
                            setAnchorBgAlphaDef);

                        // Managing line series cosmetics
                        // Color of the line
                        lineColor = getFirstColor(pluck(dataObj.color,
                            lineColorDef));

                        // alpha
                        lineAlpha = pluck(dataObj.alpha, lineAlphaDef);

                        // Create line dash
                        // Using dashStyle of HC
                        dashStyle = pluckNumber(dataObj.dashed, lineDashed) ?
                        getDashStyle(lineDashLen, lineDashGap, lineThickness) :
                        undefined;

                        // Used to set alpha of the shadow
                        pointShadow = {
                            opacity: lineAlpha / 100
                        };
                        pointAnchorEnabled = drawAnchors === undefined ?
                        lineAlpha != 0 : !!drawAnchors;

                        errorValueArr = [];
                        errorValueArr.push({
                            errorValue: errorValue,
                            toolText: errorValue,
                            shadow: {
                                opacity: errorBarAlpha / 250
                            }
                        });
                        notHalfErrorBar && errorValueArr.push({
                            errorValue: errorValue === null ? null : -errorValue,
                            toolText: errorValue,
                            shadow: {
                                opacity: errorBarAlpha / 250
                            }
                        });

                        // Label of the data
                        // We take the label from HighCharts configuration
                        // object
                        dataLabel = conf.oriCatTmp[index];

                        // Finally add the data
                        // we call getPointStub function that manage
                        // displayValue, toolText and link
                        series.data.push(extend2(this.getPointStub(dataObj,
                            itemValue, dataLabel, HCObj, dataset,
                            datasetShowValues, seriesYAxis), {
                            y : itemValue,
                            shadow: pointShadow,
                            dashStyle: dashStyle,
                            errorValue: errorValueArr,
                            valuePosition: pluck(dataObj.valueposition,
                                HCChartObj.valuePosition),
                            color: {
                                FCcolor: {
                                    color: lineColor,
                                    alpha: lineAlpha
                                }
                            },
                            marker : {
                                enabled: pointAnchorEnabled,
                                fillColor: {
                                    FCcolor: {
                                        color: setAnchorBgColor,
                                        alpha: (setAnchorBgAlpha *
                                            setAnchorAlpha / 100) + BLANK
                                    }
                                },
                                lineColor: {
                                    FCcolor: {
                                        color: setAnchorBorderColor,
                                        alpha: setAnchorAlpha
                                    }
                                },
                                lineWidth: setAnchorBorderThickness,
                                radius: setAnchorRadius,
                                symbol: mapSymbolName(setAnchorSides),
                                startAngle: pluck(dataObj.anchorstartangle,
                                    setAnchorAngleDef)
                            }
                        }));

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the
                        // maximum and minimum value of the Axis
                        chartAPI.errorbar2d.pointValueWatcher(HCObj, itemValue,
                            errorValue);
                    }
                    else {
                        // add the data
                        series.data.push({
                            y : null
                        });
                    }
                }
            }
            if (!hasValidPoint) {
                series.showInLegend = false
            }
            return series;
        }
    }, chartAPI.mslinebase);


    /////////////// ErrorBar2D ///////////
    //chartAPI('errorline2d', {
    chartAPI('errorscatter', {
        standaloneInit: true,
        creditLabel : creditLabel,
        chart: chartAPI.errorbar2d.chart,
        drawErrorValue: chartAPI.errorbar2d.drawErrorValue,
        defaultZeroPlaneHighlighted: false,
        useErrorGroup: true,
        point: function (chartName, series, dataset, FCChartObj, HCObj,
            catLength, seriesIndex) {
            if (dataset.data) {
                var hasValidPoint = false,
                chartNameAPI = chartAPI[chartName],
                // Whether to draw scatter line
                drawLine = pluckNumber(dataset.drawline, 0),
                drawProgressionCurve =
                pluckNumber(dataset.drawprogressioncurve, 0),
                conf = HCObj[CONFIGKEY],
                // Data array in dataset object
                data = dataset.data,
                regressionData,
                dataLength = data.length,
                // showValues attribute in individual dataset
                datasetShowValues =
                pluckNumber(dataset.showvalues, conf.showValues),
                NumberFormatter = this.numberFormatter,

                //Regratation line
                showRegressionLine = pluckNumber(dataset.showregressionline,
                    FCChartObj.showregressionline, 0),
                errorBarColor =  pluck(FCChartObj.errorbarcolor, 'AAAAAA'),
                errorBarAlpha = pluck(FCChartObj.errorbaralpha,
                    HUNDRED),
                errorBarThickness =
                pluckNumber(FCChartObj.errorbarthickness, 1),
                errorBarWidth = pluckNumber(FCChartObj.errorbarwidth, 5),

                halfVerticalErrorBar =
                pluckNumber(FCChartObj.halfverticalerrorbar , 1),
                verticalErrorBarAlpha = pluckNumber(
                    dataset.verticalerrorbaralpha, dataset.errorbaralpha,
                    FCChartObj.verticalerrorbaralpha, errorBarAlpha),
                verticalErrorBarColor = convertColor(pluck(
                    dataset.verticalerrorbarcolor, dataset.errorbarcolor,
                    FCChartObj.verticalerrorbarcolor, errorBarColor),
                verticalErrorBarAlpha),

                verticalErrorBarThickness = pluckNumber(
                    dataset.verticalerrorbarthickness,
                    dataset.errorbarthickness,
                    FCChartObj.verticalerrorbarthickness,
                    errorBarThickness),

                halfHorizontalErrorBar =
                pluckNumber(FCChartObj.halfhorizontalerrorbar , 1),
                horizontalErrorBarAlpha =
                pluck(dataset.horizontalerrorbaralpha,
                    dataset.errorbaralpha,
                    FCChartObj.horizontalerrorbaralpha, errorBarAlpha),
                horizontalErrorBarColor = convertColor(pluck(
                    dataset.horizontalerrorbarcolor, dataset.errorbarcolor,
                    FCChartObj.horizontalerrorbarcolor, errorBarColor),
                horizontalErrorBarAlpha
                ),
                horizontalErrorBarThickness = pluckNumber(
                    dataset.horizontalerrorbarthickness,
                    dataset.errorbarthickness,
                    FCChartObj.horizontalerrorbarthickness,
                    errorBarThickness),
                useHorizontalErrorBarDef = pluckNumber(
                    dataset.usehorizontalerrorbar,
                    FCChartObj.usehorizontalerrorbar , 0),
                useVerticalErrorBarDef = pluckNumber(
                    dataset.useverticalerrorbar,
                    FCChartObj.useverticalerrorbar , 1),
                regressionObj = {
                    sumX : 0,
                    sumY : 0,
                    sumXY : 0,
                    sumXsqure : 0,
                    sumYsqure : 0,
                    xValues : [],
                    yValues : []
                },

                itemValueY,
                index,
                scatterBorderColor,
                scatterAlpha,
                lineThickness,
                lineDashed,
                lineDashLen,
                lineDashGap,
                drawAnchors,
                dataObj,
                seriesAnchorSides,
                seriesAnchorRadius,
                seriesAnchorBorderColor,
                seriesAnchorAngle,
                seriesAnchorBorderThickness,
                seriesAnchorBgColor,
                seriesAnchorAlpha,
                seriesAnchorBgAlpha,
                setAnchorSides,
                setAnchorRadius,
                setAnchorBorderColor,
                setAnchorBorderThickness,
                setAnchorBgColor,
                setAnchorAlpha,
                setAnchorBgAlpha,
                itemValueX,
                errorValue,
                hErrorValue,
                vErrorValue,
                pointStub,
                useHorizontalErrorBar,
                useVerticalErrorBar,
                hErrorValueLabel,
                vErrorValueLabel,
                regSeries,
                showYOnX,
                regressionLineColor,
                regressionLineThickness,
                regressionLineAlpha,
                regLineColor;

                // Add zIndex so that the regration line set at the
                // back of the series
                series.zIndex = 1;

                // Dataset seriesname
                series.name = getValidValue(dataset.seriesname);
                // If showInLegend set to false
                // We set series.name blank
                if (pluckNumber(dataset.includeinlegend) === 0 ||
                    series.name === undefined) {
                    series.showInLegend = false;
                }

                // --------------------- ERRORBARS ------------------------- //
                series.vErrorBarWidth = pluckNumber(
                    dataset.verticalerrorbarwidth, dataset.errorbarwidth,
                    FCChartObj.verticalerrorbarwidth , errorBarWidth);

                series.hErrorBarWidth = pluckNumber(
                    dataset.horizontalerrorbarwidth, dataset.errorbarwidth,
                    FCChartObj.horizontalerrorbarwidth, errorBarWidth);

                if (drawLine || drawProgressionCurve) {
                    if (drawProgressionCurve) {
                        series.type = 'spline';
                    }
                    // Line cosmetics attributes
                    // Color of the line series
                    scatterBorderColor = getFirstColor(pluck(dataset.color,
                        HCObj.colors[seriesIndex % HCObj.colors.length]));
                    // Alpha of the line
                    scatterAlpha = pluck(dataset.alpha, HUNDREDSTRING);
                    // Line Thickness
                    lineThickness = pluckNumber(dataset.linethickness,
                        FCChartObj.linethickness, 2);
                    // Whether to use dashline
                    lineDashed = Boolean(pluckNumber(dataset.linedashed,
                        dataset.dashed, FCChartObj.linedashed, 0));

                    // line dash attrs
                    lineDashLen = pluckNumber(dataset.linedashlen,
                        FCChartObj.linedashlen, 5);
                    lineDashGap = pluckNumber(dataset.linedashgap,
                        FCChartObj.linedashgap, 4);

                    // Set the line color and alpha to
                    // HC seris obj with FusionCharts color format using FCcolor obj
                    series.color = convertColor(pluck(dataset.linecolor,
                        FCChartObj.linecolor, scatterBorderColor),
                        pluckNumber(dataset.linealpha, FCChartObj.linealpha,
                        scatterAlpha));

                    // Set the line thickness (line width)
                    series.lineWidth = lineThickness;
                    // Create line dash
                    // Using dashStyle of HC
                    series.dashStyle = lineDashed ? getDashStyle(lineDashLen,
                        lineDashGap, lineThickness) : undefined;
                }

                // Managing line series markers
                // Whether to drow the Anchor or not
                drawAnchors = Boolean(pluckNumber(dataset.drawanchors,
                    dataset.showanchors, FCChartObj.drawanchors,
                    FCChartObj.showanchors, 1));

                // Anchor cosmetics
                // We first look into dataset then chart obj and
                // then default value.
                seriesAnchorSides = pluckNumber(dataset.anchorsides,
                    FCChartObj.anchorsides, seriesIndex + 3);
                seriesAnchorRadius = pluckNumber(dataset.anchorradius,
                    FCChartObj.anchorradius, 3);
                seriesAnchorBorderColor = getFirstColor(pluck(
                    dataset.anchorbordercolor, dataset.color,
                    FCChartObj.anchorbordercolor, scatterBorderColor,
                    HCObj.colors[seriesIndex % HCObj.colors.length]));
                seriesAnchorBorderThickness = pluckNumber(
                    dataset.anchorborderthickness,
                    FCChartObj.anchorborderthickness, 1);
                seriesAnchorBgColor = getFirstColor(pluck(dataset.anchorbgcolor,
                    FCChartObj.anchorbgcolor,
                    defaultPaletteOptions.anchorBgColor[
                    HCObj.chart.paletteIndex]));
                seriesAnchorAlpha = pluck(dataset.anchoralpha, dataset.alpha,
                    FCChartObj.anchoralpha, HUNDRED);
                seriesAnchorBgAlpha = pluck(dataset.anchorbgalpha,
                    FCChartObj.anchorbgalpha, seriesAnchorAlpha);
                seriesAnchorAngle = pluck(dataset.anchorstartangle,
                    FCChartObj.anchorstartangle);

                //set the marker attr at series
                series.marker = {
                    fillColor: this.getPointColor(seriesAnchorBgColor,
                        HUNDRED),
                    lineColor: {
                        FCcolor: {
                            color: seriesAnchorBorderColor,
                            alpha: seriesAnchorAlpha + BLANK
                        }
                    },
                    lineWidth: seriesAnchorBorderThickness,
                    radius: seriesAnchorRadius,
                    symbol: mapSymbolName(seriesAnchorSides)
                };

                if (showRegressionLine) {
                    series.events = {
                        hide : this.hideRLine,
                        show : this.showRLine
                    };
                    //regration object used in XY chart
                    //create here to avoid checking always
                    showYOnX = pluckNumber(dataset.showyonx,
                        FCChartObj.showyonx, 1);
                    regressionLineColor = getFirstColor(pluck(
                        dataset.regressionlinecolor,
                        FCChartObj.regressionlinecolor,
                        seriesAnchorBorderColor));
                    regressionLineThickness = pluckNumber(
                        dataset.regressionlinethickness,
                        FCChartObj.regressionlinethickness,
                        seriesAnchorBorderThickness);
                    regressionLineAlpha = getFirstAlpha(pluckNumber(
                        dataset.regressionlinealpha,
                        FCChartObj.regressionlinealpha,
                        seriesAnchorAlpha));
                    regLineColor = convertColor(regressionLineColor,
                        regressionLineAlpha);
                }

                // Iterate through all level data
                for (index = 0; index < dataLength; index += 1) {
                    // Individual data obj
                    // for further manipulation
                    dataObj = data[index];
                    if (dataObj) {
                        itemValueY = NumberFormatter.getCleanValue(dataObj.y);
                        itemValueX = NumberFormatter.getCleanValue(dataObj.x);
                        errorValue = NumberFormatter.getCleanValue(
                            dataObj.errorvalue);

                        if (itemValueY === null) {
                            series.data.push({
                                y: null,
                                x: itemValueX
                            });
                            continue;
                        }

                        hasValidPoint = true;

                        pointStub = chartNameAPI.getPointStub(dataObj,
                            itemValueY, NumberFormatter.xAxis(itemValueX),
                            HCObj, dataset, datasetShowValues);

                        // Anchor cosmetics
                        // We first look into dataset then chart obj and then
                        // default value.
                        setAnchorSides = pluckNumber(dataObj.anchorsides,
                            seriesAnchorSides);
                        setAnchorRadius = pluckNumber(dataObj.anchorradius,
                            seriesAnchorRadius);
                        setAnchorBorderColor = getFirstColor(pluck(
                            dataObj.anchorbordercolor,
                            seriesAnchorBorderColor));
                        setAnchorBorderThickness = pluckNumber(
                            dataObj.anchorborderthickness,
                            seriesAnchorBorderThickness);
                        setAnchorBgColor = getFirstColor(pluck(
                            dataObj.anchorbgcolor, seriesAnchorBgColor));
                        setAnchorAlpha = pluck(dataObj.anchoralpha, dataObj.alpha,
                            seriesAnchorAlpha);
                        setAnchorBgAlpha = pluck(dataObj.anchorbgalpha,
                            seriesAnchorBgAlpha);

                        //----- Whether to use Horizontal or
                        // Vertical Error value -----//
                        useHorizontalErrorBar = Boolean(pluckNumber(
                            dataObj.usehorizontalerrorbar,
                            useHorizontalErrorBarDef));
                        useVerticalErrorBar = Boolean(pluckNumber(
                            dataObj.useverticalerrorbar,
                            useVerticalErrorBarDef));
                        hErrorValue = vErrorValue = null;

                        var errorValueArr = [];
                        if (useHorizontalErrorBar) {
                            hErrorValue = NumberFormatter.getCleanValue(
                                pluck(dataObj.horizontalerrorvalue,
                                    errorValue));
                            hErrorValueLabel = NumberFormatter
                            .dataLabels(hErrorValue)
                            errorValueArr.push({
                                errorValue: hErrorValue,
                                toolText: hErrorValueLabel,
                                errorBarColor: horizontalErrorBarColor,
                                isHorizontal: 1,
                                errorBarThickness: horizontalErrorBarThickness,
                                shadow: {
                                    opacity: horizontalErrorBarAlpha / 250
                                }
                            });
                            if (!halfHorizontalErrorBar) {
                                errorValueArr.push({
                                    errorValue: -hErrorValue,
                                    toolText: hErrorValueLabel,
                                    errorBarColor: horizontalErrorBarColor,
                                    isHorizontal: 1,
                                    errorBarThickness:
                                    horizontalErrorBarThickness,
                                    shadow: {
                                        opacity: horizontalErrorBarAlpha / 250
                                    }
                                });
                            }
                        }
                        if (useVerticalErrorBar) {
                            vErrorValue = NumberFormatter.getCleanValue(
                                pluck(dataObj.verticalerrorvalue, errorValue));
                            vErrorValueLabel = NumberFormatter
                            .dataLabels(vErrorValue)
                            errorValueArr.push({
                                errorValue: vErrorValue,
                                toolText: vErrorValueLabel,
                                errorBarColor: verticalErrorBarColor,
                                errorBarThickness: verticalErrorBarThickness,
                                shadow: {
                                    opacity: verticalErrorBarAlpha / 250
                                }
                            });
                            if (!halfVerticalErrorBar) {
                                errorValueArr.push({
                                    errorValue: -vErrorValue,
                                    toolText: vErrorValueLabel,
                                    errorBarColor: verticalErrorBarColor,
                                    errorBarThickness:
                                    verticalErrorBarThickness,
                                    shadow: {
                                        opacity: verticalErrorBarAlpha / 250
                                    }
                                });
                            }
                        }
                        // Finally add the data
                        // we call getPointStub function that manage
                        // displayValue, toolText and link
                        series.data.push({
                            y: itemValueY,
                            x: itemValueX,
                            errorValue: errorValueArr,
                            displayValue : pointStub.displayValue,
                            toolText : pointStub.toolText,
                            link: pointStub.link,
                            marker: {
                                enabled: drawAnchors,
                                fillColor: {
                                    FCcolor: {
                                        color: setAnchorBgColor,
                                        alpha: ((setAnchorBgAlpha *
                                            setAnchorAlpha) / 100) + BLANK
                                    }
                                },
                                lineColor: {
                                    FCcolor: {
                                        color: setAnchorBorderColor,
                                        alpha: setAnchorAlpha
                                    }
                                },
                                lineWidth: setAnchorBorderThickness,
                                radius: setAnchorRadius,
                                symbol: mapSymbolName(setAnchorSides),
                                startAngle: pluck(dataObj.anchorstartangle,
                                    seriesAnchorAngle)
                            }
                        });

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the
                        // maximum and minimum value of the Axis
                        this.pointValueWatcher(HCObj, halfVerticalErrorBar ? itemValueY : itemValueY - vErrorValue,
                            halfHorizontalErrorBar ? itemValueX : itemValueX - hErrorValue, showRegressionLine && regressionObj);

                        this.pointValueWatcher(HCObj, itemValueY + vErrorValue,
                            itemValueX + hErrorValue, showRegressionLine &&
                            regressionObj);
                    /*if (halfHorizontalErrorBar == 0) {
                            this.pointValueWatcher(HCObj, itemValueY,
                                itemValueX - hErrorValue, showRegressionLine &&
                                regressionObj);
                        }
                        if (halfVerticalErrorBar == 0) {
                            this.pointValueWatcher(HCObj, itemValueY -
                                vErrorValue, itemValueX, showRegressionLine &&
                                regressionObj);
                        }*/
                    }
                    else {
                        // add the data
                        series.data.push({
                            y : null
                        });
                    }
                }

                if (showRegressionLine) {
                    regressionData = this.getRegressionLineSeries(regressionObj,
                        showYOnX, dataLength);

                    this.pointValueWatcher(HCObj, regressionData[0].y,
                        regressionData[0].x);
                    this.pointValueWatcher(HCObj, regressionData[1].y,
                        regressionData[1].x);

                    regSeries = {
                        type : 'line',
                        color : regLineColor,
                        showInLegend: false,
                        lineWidth : regressionLineThickness,
                        enableMouseTracking : false,
                        marker : {
                            enabled : false
                        },
                        data: regressionData,
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
        }
    }, chartAPI.scatterbase);


    /////////////// WaterFall2D ///////////
    chartAPI('waterfall2d', {
        standaloneInit: true,
        point : function (chartName, series, data, FCChartObj, HCObj) {

            var
            itemValue, index, countPoint, dataLabel, setColor, setAlpha,
            setRatio, colorArr, dataObj, setAngle, showLabel, pointShadow,
            lineThickness = pluck(FCChartObj.connectorthickness, 1),
            zLine = {
                step : true,
                type : 'line',
                enableMouseTracking  : false,
                data: [],
                dataLabels : {
                    enabled : false
                },
                marker : {
                    enabled : false
                },
                dashStyle : FCChartObj.connectordashed === '1' ? getDashStyle(
                    pluckNumber(FCChartObj.connectordashlen, 2), pluckNumber(
                        FCChartObj.connectordashgap, 2), lineThickness) : undefined,
                drawVerticalJoins : false,
                useForwardSteps: true,
                color : convertColor(pluck(FCChartObj.connectorcolor, "000000"), pluck(FCChartObj.connectoralpha, 100)),
                lineWidth : lineThickness
            },
            // length of the data
            length = data.length,
            // HighCharts configuration
            conf = HCObj[CONFIGKEY],
            // axisGridManager to manage the axis
            // it contains addVline, addXaxisCat, addAxisAltGrid and
            // addAxisGridLine function
            axisGridManager = conf.axisGridManager,
            // HighCharts xAxis obj
            xAxisObj = HCObj.xAxis,
            // palette of the chart
            paletteIndex = HCObj.chart.paletteIndex,
            // xAxis configuration it contains configuration of xAxis like
            // catCount, horizontalAxisNamePadding, horizontalLabelPadding,
            // labelDisplay, slantLabels, staggerLines
            xAxisConf = conf.x,
            // Array of default colors (paletteColors)
            // We use it to specify the individual data point color
            defaultColors = HCObj.colors,
            // Length of the default colors
            defaultColLen = HCObj.colors.length,
            // is3d and isBar helps to get the column color by getColumnColor function
            // whether the chart is a 3D or Bar
            is3d = /3d$/.test(HCObj.chart.defaultSeriesType),
            isBar = this.isBar,
            // dataplot border width
            // Managing for 3D too
            showPlotBorder = pluck(FCChartObj.showplotborder,
                (is3d ? ZERO : ONE) ) === ONE,
            // 3D column chart doesn't show the plotborder by default until we set showplotborder true
            setBorderWidth = showPlotBorder ?
            (is3d ? 1 : pluckNumber(FCChartObj.plotborderthickness, 1)) : 0,
            // whether to use round edges or not in the column
            isRoundEdges = HCObj.chart.useRoundEdges,
            // dataplot border alpha
            setPlotBorderAlpha = pluckNumber(FCChartObj.plotborderalpha, FCChartObj.plotfillalpha, 100) + BLANK,
            // dataplot border color
            setPlotBorderColor = pluck(FCChartObj.plotbordercolor,
                defaultPaletteOptions.plotBorderColor[paletteIndex]).split(COMMA)[0],
            plotBorderDashed = pluckNumber(FCChartObj.plotborderdashed, 0),
            plotBorderDashLen = pluckNumber(FCChartObj.plotborderdashlen, 6),
            plotBorderDashGap = pluckNumber(FCChartObj.plotborderdashgap, 3),
            // Original index of the data inside the loop
            catIndex = 0,
            issum,
            cumulative,
            // use3DLighting to show gredient color effect in 3D Column charts
            use3DLighting = Boolean(pluckNumber(FCChartObj.use3dlighting, 1)),
            total = 0,
            lastComTotal = 0,
            plotGradientColor = pluckNumber(
                FCChartObj.useplotgradientcolor, 1) ? getDefinedColor(
                FCChartObj.plotgradientcolor,
                defaultPaletteOptions.plotGradientColor[paletteIndex]) :
            BLANK;
            NumberFormatter = HCObj[CONFIGKEY].numberFormatter;

            // Iterate through all level data
            // We are managing the data value labels and other cosmetics inside this loop
            for (index = 0, countPoint = 0; index < length; index += 1) {

                // individual data obj
                dataObj = data[index];

                // Managing vLines in between <set> elements
                // If its vline
                // we call the grid manager addVline function, that creates vline
                // and we stop execution here and continue the loop to next data
                if (dataObj.vline) {
                    axisGridManager.addVline(xAxisObj, dataObj, catIndex, HCObj);
                    continue;
                }

                // get the valid value
                // parsePointValue check the its a value value of not and return
                // the valid value

                itemValue = NumberFormatter.getCleanValue(dataObj.value);
                issum = pluckNumber(dataObj.issum, 0);
                cumulative = pluckNumber(dataObj.cumulative, 1);
                if (issum) {
                    itemValue = cumulative ? total :
                        (total === lastComTotal ? total : (total - lastComTotal));
                    lastComTotal = total;
                    zLine.data.push({
                        y : null,
                        x : index - 0.5
                    });
                }
                else {
                    total += itemValue
                }

                // we check showLabel in individual data
                // if its set to 0 than we do not show the particular label
                showLabel = pluckNumber(dataObj.showlabel, FCChartObj.showlabels, 1);

                // Label of the data
                // getFirstValue returns the first defined value in arguments
                // we check if showLabel is not set to 0 in data
                // then we take the label given in data, it can be given using label as well as name too
                // we give priority to label if label is not there, we check the name attribute
                dataLabel = parseUnsafeString(!showLabel ? BLANK : getFirstValue(dataObj.label, dataObj.name));

                // adding label in HighChart xAxis categories
                // increase category counter by one
                axisGridManager.addXaxisCat(xAxisObj, catIndex, catIndex, dataLabel);
                catIndex += 1;

                // <set> cosmetics
                // Color of the particular data
                if (itemValue > 0) {
                    setColor = pluck(dataObj.color, FCChartObj.positivecolor, defaultColors[countPoint % defaultColLen])
                }
                else {
                    setColor = pluck(dataObj.color, FCChartObj.negativecolor, defaultColors[countPoint % defaultColLen])
                }
                setColor += (COMMA + plotGradientColor);
                // Alpha of the data
                setAlpha = pluck(dataObj.alpha, FCChartObj.plotfillalpha, HUNDRED);
                // Fill ratio of the data
                setRatio = pluck(dataObj.ratio, FCChartObj.plotfillratio);
                // defaultAngle depend upon item value
                setAngle = pluck(360 - FCChartObj.plotfillangle, 90);
                if (itemValue < 0) {
                    setAngle = 360 - setAngle;
                }

                // Used to set alpha of the shadow
                pointShadow = {
                    opacity: setAlpha / 100,
                    inverted: isBar
                };

                // calculate the color object for the column
                colorArr = getColumnColor (setColor, setAlpha, setRatio,
                    setAngle, isRoundEdges, setPlotBorderColor,
                    pluck(dataObj.alpha, setPlotBorderAlpha), isBar, is3d);

                // Finally add the data
                // we call getPointStub function that manage displayValue, toolText and link
                series.data.push( extend2(
                    this.getPointStub(dataObj, itemValue, dataLabel, HCObj), {
                        y: itemValue,
                        _FCY : itemValue < 0 ? (total - itemValue) : total,
                        _FCYBottom: itemValue < 0 ? total : total - itemValue,
                        shadow: pointShadow,
                        color: colorArr[0],
                        borderColor: colorArr[1],
                        borderWidth: setBorderWidth,
                        dashStyle: (pluckNumber(dataObj.dashed, plotBorderDashed) ? getDashStyle(plotBorderDashLen, plotBorderDashGap, setBorderWidth) : undefined),
                        use3DLighting: use3DLighting
                    })
                );
                zLine.data.push({
                    y : total,
                    x : index
                });
                // Set the maximum and minimum found in data
                // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                this.pointValueWatcher(HCObj, total);
                countPoint += 1;
            }

            //add the total
            if (FCChartObj.showsumatend != '0') {
                showLabel = pluckNumber(FCChartObj.showlabels, 1);

                // Label of the data
                // getFirstValue returns the first defined value in arguments
                // we check if showLabel is not set to 0 in data
                // then we take the label given in data, it can be given using label as well as name too
                // we give priority to label if label is not there, we check the name attribute
                dataLabel = parseUnsafeString(!showLabel ? BLANK : getFirstValue(FCChartObj.sumlabel, 'Total'));

                // adding label in HighChart xAxis categories
                // increase category counter by one
                axisGridManager.addXaxisCat(xAxisObj, catIndex, catIndex, dataLabel);
                catIndex += 1;

                setColor = defaultColors[countPoint % defaultColLen] + COMMA + plotGradientColor;
                setAlpha = pluck(FCChartObj.plotfillalpha, HUNDRED);
                setAngle = pluck(360 - FCChartObj.plotfillangle, 90);
                if (total < 0) {
                    setAngle = 360 - setAngle;
                }

                // Used to set alpha of the shadow
                pointShadow = {
                    opacity: setAlpha / 100,
                    inverted: isBar
                };

                // calculate the color object for the column
                colorArr = getColumnColor (setColor, setAlpha, FCChartObj.plotfillratio,
                    setAngle, isRoundEdges, setPlotBorderColor, setPlotBorderAlpha, isBar, is3d);

                series.data.push( extend2(
                    this.getPointStub({}, total, dataLabel, HCObj), {
                        y: total,
                        shadow: pointShadow,
                        color: colorArr[0],
                        borderColor: colorArr[1],
                        borderWidth: setBorderWidth,
                        use3DLighting: use3DLighting
                    })
                );

            }



            // set the xAxisConf catCount for further use
            xAxisConf.catCount = catIndex;
            if (FCChartObj.showconnectors != '0')  {
                series = [zLine, series];
            }
            return series;
        },
        defaultSeriesType : 'floatedcolumn'
    }, singleSeriesAPI);

    /////////////// MultiLevelPie ///////////

    ///function to add mspie data

    chartAPI('multilevelpie', {
        standaloneInit: true,
        defaultSeriesType : 'pie',
        defaultPlotShadow: 0,
        series : function () {
            var iapi = this,
                dataObj = iapi.dataObj,
                hcObj = iapi.hcJSON,
                chartAttrs = dataObj.chart,
                series = hcObj.series,
                conf = {},
                useHoverColor = Boolean(pluckNumber(chartAttrs.usehovercolor, 1)),
                hoverFillColor = convertColor(pluck(chartAttrs.hoverfillcolor, 'FF5904'),
                    pluckNumber(chartAttrs.hoverfillalpha, 100)),
                y,
                events;

            //make the plotBackground transparent
            hcObj.chart.plotBorderColor = 0;
            hcObj.chart.plotBackgroundColor = null;

            //disable legend
            hcObj.legend.enabled = false;

            //stop point slicing
            hcObj.plotOptions.pie.allowPointSelect = false;

            //set the bordercolor
            hcObj.plotOptions.series.borderColor = convertColor(pluck(chartAttrs.plotbordercolor,
                chartAttrs.piebordercolor, 'FFFFFF'), chartAttrs.showplotborder != '0' ?
            pluck(chartAttrs.plotborderalpha, chartAttrs.pieborderalpha, 100) : 0);
            hcObj.plotOptions.series.borderWidth = pluckNumber(chartAttrs.pieborderthickness,
                chartAttrs.plotborderthickness, 1);
            hcObj.plotOptions.pie.startingAngle = 0; //set the chart's startingAngle as 0 [alwase]
            hcObj.plotOptions.pie.size = '100%';

            conf.showLabels = pluckNumber(chartAttrs.showlabels, 1);
            conf.showValues = pluckNumber(chartAttrs.showvalues, 0);
            conf.showValuesInTooltip = pluckNumber(chartAttrs.showvaluesintooltip,
                chartAttrs.showvalues, 0);
            conf.showPercentValues = pluckNumber(chartAttrs.showpercentvalues,
                chartAttrs.showpercentagevalues, 0);
            conf.showPercentInTooltip = pluckNumber(chartAttrs.showpercentintooltip, 0);
            conf.toolTipSepChar = pluck(chartAttrs.tooltipsepchar, chartAttrs.hovercapsepchar, COMMASPACE);
            conf.labelSepChar = pluck(chartAttrs.labelsepchar, conf.toolTipSepChar);


            //add mouse over and mouse out events
            if (useHoverColor) {
                events = hcObj.plotOptions.series.point.events;
                events.mouseOver = function () {
                    var point = this,
                    chart = point.series.chart,
                    series = chart.series,
                    seri,
                    pointIndex,
                    seriesIndex;
                    while (point) {
                        point.graphic.attr({
                            fill: hoverFillColor
                        });
                        pointIndex = point.prevPointIndex;
                        seriesIndex = point.prevSeriesIndex;
                        point = (seri = series[seriesIndex]) && seri.data && seri.data[pointIndex];

                    }
                };
                events.mouseOut = function () {
                    var point = this,
                    chart = point.series.chart,
                    series = chart.series,
                    seri,
                    pointIndex,
                    seriesIndex;
                    while (point) {
                        point.graphic.attr({
                            fill: point.color
                        })
                        pointIndex = point.prevPointIndex;
                        seriesIndex = point.prevSeriesIndex;
                        point = (seri = series[seriesIndex]) && seri.data && seri.data[pointIndex];

                    }
                }
            }
            //remove the plotboder
            hcObj.chart.plotBorderWidth = 0;
            if (dataObj.category) {
                //send default alpha as it ma suplyed by the chart piefillAlpha
                this.addMSPieCat(dataObj.category, 0, 0, 100, pluck(chartAttrs.plotfillalpha,
                    chartAttrs.piefillalpha, 100), conf, null);
            }
            var pierad = parseInt(chartAttrs.pieradius), serieswidth,
            inner = 0, ispersent = true;
            if (pierad) {
                serieswidth = (2 * pierad) / series.length;
                ispersent = false;
            }
            else {
                serieswidth = parseInt(100 / series.length , 10);
            }
            hcObj.plotOptions.series.dataLabels.distance = 0;
            hcObj.plotOptions.series.dataLabels.placeInside  = true;
            //iterate through all data series
            for (y = 0; y < series.length; y += 1) {

                //set the size and iner radious
                series[y].innerSize = inner + (ispersent ? '%' : '');
                series[y].size = (inner += serieswidth) + (ispersent ? '%' : '');
                if (series[y].data[series[y].data.length - 1].y === 0) {
                    series[y].data.pop();
                }
            }


        },
        //manage the space for title only
        spaceManager: function (hcJSON, fcJSON, width, height) {
            var conf = hcJSON[CONFIGKEY],
            marginLeftExtraSpace = conf.marginLeftExtraSpace,
            marginTopExtraSpace = conf.marginTopExtraSpace,
            marginBottomExtraSpace = conf.marginBottomExtraSpace,
            marginRightExtraSpace = conf.marginRightExtraSpace,
            workingWidth = width - (marginLeftExtraSpace + marginRightExtraSpace +
                hcJSON.chart.marginRight + hcJSON.chart.marginLeft),
            workingHeight = height - (marginBottomExtraSpace + marginTopExtraSpace + hcJSON.chart.marginBottom +
                hcJSON.chart.marginTop);
            titleSpaceManager(hcJSON, fcJSON, workingWidth, workingHeight * 0.4);
        },

        addMSPieCat: function(cat, level, start, end, alpha, chartConf, prevCatIndex) {
            //[index % HCObj.colors.length])
            var iapi = this,
                hcObj = iapi.hcJSON,
                numberFormatter =this.numberFormatter,
                sLevel,
                sharePercent,
                totalValue = 0,
                catLaxtIndex = cat.length - 1,
                catObj,
                catVal,
                i,
                space,
                label,
                series = hcObj.series,
                colors = hcObj.colors,
                labelSepChar = chartConf.labelSepChar,
                pointIndex,
                fillalpha,
                valueStr,
                pValueStr,
                toolText,
                displayValue;

            if (iapi.colorCount === undefined) {
                iapi.colorCount = 0;
            }

            if (level === 0) {
                iapi.colorCount = 0;
            }
            //if the series dosen't exist
            //add a blank series
            if (!series[level]) {
                series[level] = {
                    data: [{
                        toolText: false,
                        doNotSlice: true,//added to stop slicing
                        y: 100,
                        visible: false,
                        color: 'rgba(255,255,255,0)'//set the color a s transparent
                    }]
                };
            }
            sLevel = series[level];
            ////
            //reduce the blank labels value[may need to split the slice]
            //check blank-slice and the start get same
            //find the gap between blank lavel and start
            space = start - 100 + sLevel.data[sLevel.data.length - 1].y;
            //there has a space
            if (space) {
                sLevel.data.splice(sLevel.data.length - 1, 0, {
                    toolText: false,
                    doNotSlice: true,//added to stop slicing
                    y: space,
                    visible: false,
                    color: 'rgba(255,255,255,0)'//set the color as transparent
                });
            }
            sLevel.data[sLevel.data.length - 1].y = 100 - end;

            //support for value in cat tag
            for (i = 0; i <= catLaxtIndex; i += 1) {
                catObj = cat[i];
                //store for letter use
                catObj._userValue = numberFormatter.getCleanValue(catObj.value);
                catObj._value = pluckNumber(catObj._userValue, 1);
                totalValue += catObj._value;
            }

            //add the category
            sharePercent = (end - start) / totalValue;
            for (i = catLaxtIndex; i >= 0 ; i -= 1) {
                catObj = cat[i];
                catVal = sharePercent * catObj._value;
                label = parseUnsafeString(pluck(catObj.label, catObj.name));
                valueStr = catObj._userValue !== null ? numberFormatter.dataLabels(catObj._userValue) : BLANK;
                pValueStr = numberFormatter.percentValue((catObj._value / totalValue) * 100);
                pointIndex = sLevel.data.length - 1;
                fillalpha = pluckNumber(catObj.alpha, alpha);
                displayValue = chartConf.showLabels ? label : BLANK;
                if (chartConf.showValues) {
                    if (chartConf.showPercentValues) {
                        displayValue += displayValue !== BLANK ? (labelSepChar + pValueStr) : pValueStr;
                    }
                    else if (valueStr !== undefined && valueStr !== BLANK) {
                        displayValue += displayValue !== BLANK ? (labelSepChar + valueStr) : valueStr;
                    }
                }
                toolText = parseUnsafeString(pluck(catObj.tooltext, catObj.hovertext));
                if (toolText === BLANK) {
                    toolText = label;
                    if (chartConf.showValuesInTooltip) {
                        if (chartConf.showPercentInTooltip) {
                            toolText += toolText !== BLANK ? (labelSepChar + pValueStr) : pValueStr;
                        }
                        else if (valueStr !== undefined && valueStr !== BLANK) {
                            toolText += toolText !== BLANK ? (labelSepChar + valueStr) : valueStr;
                        }
                    }
                }

                sLevel.data.splice(pointIndex, 0, {
                    prevPointIndex: prevCatIndex,
                    prevSeriesIndex: level - 1,
                    displayValue: displayValue,
                    toolText: toolText,
                    y: catVal,
                    link: getValidValue(catObj.link),
                    doNotSlice: true,//added to stop slicing
                    color: convertColor(catObj.color || colors[iapi.colorCount % colors.length], fillalpha),
                    shadow: {opacity: mathRound(fillalpha > 50 ? fillalpha * fillalpha * fillalpha * 0.0001 :
                        fillalpha * fillalpha * 0.01) * 0.01}//fix for PCXT-465
                });
                iapi.colorCount += 1;
                if (catObj.category) {
                    iapi.addMSPieCat(catObj.category, level + 1, start, (i === 0) ?
                        end : (start +  catVal), alpha, chartConf, pointIndex);
                }
                start +=  catVal;
            }
        },

        creditLabel : creditLabel
    }, singleSeriesAPI);

    /////////////// Radar ///////////
    chartAPI('radar', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'radar',
        spaceManager: function (hcJSON, fcJSON, width, height) {
            //make the plotBackground transparent
            hcJSON.chart.plotBorderWidth = 0;
            hcJSON.chart.plotBackgroundColor = null;
            var conf = hcJSON[CONFIGKEY],
            xAxisConf = conf.x,
            xAxis = hcJSON.xAxis,
            yAxis = hcJSON.yAxis[0],
            fcJSONChart = fcJSON.chart,
            labelPadding = pluckNumber(fcJSONChart.labelpadding, fcJSONChart.labelxpadding,
                parseInt((yAxis && yAxis.labels && yAxis.labels.style && yAxis.labels.style.fontSize) || 10, 10)),
            marginLeftExtraSpace = conf.marginLeftExtraSpace,
            marginTopExtraSpace = conf.marginTopExtraSpace,
            marginBottomExtraSpace = conf.marginBottomExtraSpace,
            marginRightExtraSpace = conf.marginRightExtraSpace,
            workingWidth = width - (marginLeftExtraSpace + marginRightExtraSpace +
                hcJSON.chart.marginRight + hcJSON.chart.marginLeft),
            workingHeight = height - (marginBottomExtraSpace + marginTopExtraSpace + hcJSON.chart.marginBottom +
                hcJSON.chart.marginTop);
            workingHeight -= titleSpaceManager(hcJSON, fcJSON, workingWidth, workingHeight * 0.4);

            //set the xAxis min max
            xAxis.min = pluckNumber(xAxisConf.min, 0);
            xAxis.max = pluckNumber(xAxisConf.max, xAxisConf.catCount - 1);
            xAxis.gridLineColor = convertColor(pluck(fcJSONChart.radarspikecolor,
                defaultPaletteOptions.divLineColor[hcJSON.chart.paletteIndex]),
            pluckNumber(fcJSONChart.radarspikealpha, fcJSONChart.radarinlinealpha,
                defaultPaletteOptions.divLineAlpha[hcJSON.chart.paletteIndex]));
            xAxis.gridLineWidth = pluckNumber(fcJSONChart.radarspikethickness, 1);
            xAxis.showRadarBorder = pluckNumber(fcJSONChart.showradarborder, 1);
            xAxis.radarBorderThickness = pluckNumber(fcJSONChart.radarborderthickness, 2);
            xAxis.radarBorderColor = convertColor(pluck(fcJSONChart.radarbordercolor,
                defaultPaletteOptions.divLineColor[hcJSON.chart.paletteIndex]),
            pluckNumber(fcJSONChart.radarborderalpha, 100));
            xAxis.radarFillColor = convertColor(pluck(fcJSONChart.radarfillcolor,
                defaultPaletteOptions.altHGridColor[hcJSON.chart.paletteIndex]),
            pluckNumber(fcJSONChart.radarfillalpha, defaultPaletteOptions.altHGridAlpha[hcJSON.chart.paletteIndex]));


            if (hcJSON.legend.enabled) {
                if (pluck(fcJSONChart.legendposition, POSITION_BOTTOM).toLowerCase() != POSITION_RIGHT) {
                    workingHeight -= this.placeLegendBlockBottom(hcJSON, fcJSON, workingWidth,
                        workingHeight / 2);
                } else {
                    workingWidth -= this.placeLegendBlockRight(hcJSON, fcJSON,
                        workingWidth / 3, workingHeight);
                }
            }
            var pieRadius = pluckNumber(fcJSONChart.radarradius),
            lineHeight2 = 2 * pluckNumber(parseInt(xAxis.labels.style.lineHeight, 10), 12),
            labelPadding2 = labelPadding * 2,
            //100 px fixed label width
            minOfWH = mathMin(workingWidth - (100 + labelPadding2), workingHeight - (lineHeight2 + labelPadding2)),
            pieMinRadius = pieRadius || minOfWH * 0.5;
            if (!(pieMinRadius > 0)) {
                pieMinRadius = 5;//min 5 px radius
            }
            hcJSON.chart.axisRadius = pieMinRadius;
            //store labelPadding to use during drawing
            xAxis.labels.labelPadding = labelPadding;
        },
        anchorAlpha: '100',
        showValues : 0,
        isRadar : true
    }, chartAPI.msareabase);





    /*********************************
     *         Radar Series          *
     *********************************/


    //helper function to draw rhe rader axis
    ////sunction to draw the radar graph
    var plotRadarAxis = function () {
        var chart = this,
        options = chart.options,
        radarAxis = chart.radarAxis,
        categoriesLN = radarAxis.catLength,
        renderer = chart.renderer,
        i,
        CX = chart.plotWidth / 2,
        CY = chart.plotHeight / 2,
        radius = radarAxis.radius,
        xAxis = radarAxis.xAxis,
        yAxis = radarAxis.yAxis,
        plotLines = yAxis.plotLines,
        xPlotLines = xAxis.plotLines,
        yMin = yAxis.min,
        xTrans = radarAxis.xTrans,
        startAngle = radarAxis.startAngle,
        axPath = [],
        borderPath = [M],
        numdivPath = [],
        numDiv = plotLines.length,
        yTrans = radarAxis.yTrans,
        first,
        j, Px, Py, length,
        str, value, angle,
        math2PI = math.PI * 2,
        mathPIBY2 = math.PI / 2,
        math3PIBY2 = math.PI + mathPIBY2,
        modAngle,
        positionIndex,
        labelAlign = ['right', 'center', 'left'],
        xLabels = xAxis.labels,
        tempRad = radius + xLabels.labelPadding,
        labelOptions = yAxis.labels,
        divLine,
        gutterHalf = pluckNumber(parseInt(xLabels.style &&
                        xLabels.style.fontSize, 10) * 0.9, 9) / 2,
        radarGroup = renderer.g('axis');


        radarGroup.attr({
            zIndex: 2,
            width: chart.plotWidth,
            height: chart.plotHeight
        })
        .translate(chart.plotLeft, chart.plotTop)
        .add();

        radarAxis.divline = [];

        //////draw yaxis labels and divlines


        //create all divline path
        ///also draw the labels for the divline
        for (j = 0; j < numDiv; j += 1) {
            //add the move to
            numdivPath[j] = [M];
            first = true;
            i = categoriesLN;
            divLine = plotLines[j];
            value = divLine.value;
            // do the translation
            while (i --) {
                length = mathAbs(value - yMin) * yTrans;
                Px = CX + (length * mathCos(-(startAngle + (i * xTrans))));
                Py = CY + (length * mathSin(-(startAngle + (i * xTrans))));
                //draw the divline
                numdivPath[j].splice(numdivPath[j].length, 0 , Px, Py);
                if (i == 0) {
                    //draw the yAxis div labels
                    if (divLine.label) {
                        labelOptions = divLine.label
                        str = labelOptions.text;
                        if (str || str === 0) {
                            renderer.text(
                                str,
                                Px,
                                Py
                                )
                            .attr({
                                align: labelOptions.textAlign,
                                rotation: labelOptions.rotation
                            })
                            // without position absolute, IE export sometimes is wrong
                            .css(labelOptions.style)
                            .add(radarGroup);
                        }
                    }
                }
                ///after first move to add the line to
                if (first) {
                    numdivPath[j].push(L);
                    first = false;
                }
            }
            ///close the border
            numdivPath[j].push('Z');
            ///draw the num Div line
            radarAxis.divline[j] = renderer.path(numdivPath[j]).
            attr({
                zIndex: 2,
                'stroke': divLine.color,
                'stroke-width': divLine.width
            }).add(radarGroup);
        }

        //////// draw radarSpike & border //////

        first = true;//set the the first flag for the next loop
        i = xPlotLines.length;
        // draw the axis line
        while (i --) {
            divLine = xPlotLines[i]
            value = divLine.value;
            angle = (startAngle + (value * xTrans));
            modAngle = angle % math2PI;
            Px = CX + (radius * mathCos(- angle));
            Py = CY + (radius * mathSin(-angle));
            ///draw the axis
            axPath.splice(axPath.length, 0 , M, CX, CY, L, Px, Py);
            //draw the border
            borderPath.splice(borderPath.length, 0 , Px, Py);
            if (first) {
                borderPath.push(L);
                first = false;
            }
            //draw the yAxis div labels
            if (divLine.label) {
                labelOptions = divLine.label
                str = labelOptions.text;
                if (str || str === 0) {
                    positionIndex = (modAngle > mathPIBY2 && modAngle < math3PIBY2) ? 0 :
                    ((modAngle == mathPIBY2 || modAngle == math3PIBY2) ? 1 : 2);
                    renderer.text(
                        str,
                        CX + (tempRad * mathCos(- angle)),
                        CY + (tempRad * mathSin(-angle)) +
                            (gutterHalf * mathSin(-angle)) + gutterHalf
                        )
                    .attr({
                        align: labelAlign[positionIndex],
                        rotation: labelOptions.rotation
                    })
                    // without position absolute, IE export sometimes is wrong
                    .css(labelOptions.style)
                    .add(radarGroup);
                }
            }

        }
        ///close the border
        borderPath.push('Z');
        radarAxis.spikeGraph = renderer.path(axPath).
        attr({
            zIndex: 1,
            'stroke': xAxis.gridLineColor,
            'stroke-width': pluck(xAxis.gridLineWidth, 1)
        }).add(radarGroup);

        if (xAxis.showRadarBorder) {
            radarAxis.borderGraph = renderer.path(borderPath).
            attr({
                'stroke': xAxis.radarBorderColor,
                'stroke-width': pluck(xAxis.radarBorderThickness, 2),
                'fill': xAxis.radarFillColor
            }).add(radarGroup);
        }

    };



    // 1 - Set default options
    defaultPlotOptions.radar = merge(defaultPlotOptions.area, {
        states: {
            hover: {}
        }
    });

    // 2- Create the floatedcolumn point object

    //// NO code
    // 3 - Create the floatedcolumn series constractor
    var radar = Highcharts.extendClass(seriesTypes.pie, {
        type: 'radar',
        isCartesian: false,
        pointClass : seriesTypes.area.prototype.pointClass,
        pointAttrToOptions : seriesTypes.area.prototype.pointAttrToOptions,
        /**
         * Translate data points from raw data values to chart specific positioning data
         * needed later in drawPoints, drawGraph and drawTracker.
         */
        translate: function() {
            var series = this,
            chart = series.chart,
            data = series.data,
            dataLength = data.length, xTrans,
            yMin, yRange, yTrans, startAngle, centerX,
            centerY;
            if (typeof chart.radarAxis === 'undefined'){
                centerX = chart.plotWidth / 2;
                centerY = chart.plotHeight / 2;

                var options = chart.options,
                xAxis = options.xAxis,
                catLength = (xAxis.max - xAxis.min) + 1,
                yAxis = options.yAxis instanceof Array ? options.yAxis[0] : options.yAxis,
                radius = defined(options.chart.axisRadius) ? options.chart.axisRadius : mathMin(centerX, centerY);
                if (radius < 0 ) {
                    radius = mathMin(centerX, centerY);
                }

                yMin = yAxis.min;
                yRange = mathAbs(yAxis.max - yMin);
                yTrans = radius / yRange;// value to pixel convertation factor
                xTrans = (2 * math.PI) / catLength;//value to angle translation factor
                startAngle = math.PI / 2;

                chart.radarAxis = {};
                chart.radarAxis.yTrans = yTrans;
                chart.radarAxis.xTrans = xTrans;
                chart.radarAxis.yRange = yRange;
                chart.radarAxis.startAngle = startAngle;
                chart.radarAxis.yMin = yMin;
                chart.radarAxis.centerX = centerX;
                chart.radarAxis.centerY = centerY;
                chart.radarAxis.radius = radius;
                chart.radarAxis.categories = [];
                chart.radarAxis.catLength = catLength;
                chart.radarAxis.yAxis = yAxis;
                chart.radarAxis.xAxis = xAxis;
            }
            else {
                centerX = chart.radarAxis.centerX;
                yTrans = chart.radarAxis.yTrans;
                yMin = chart.radarAxis.yMin;
                startAngle = chart.radarAxis.startAngle;
                xTrans = chart.radarAxis.xTrans;
                centerY = chart.radarAxis.centerY;
            }
            // do the translation
            while (dataLength--) {
                var point = data[dataLength];

                if (point.y !== null) {
                    point.plotX = centerX + ((yTrans * mathAbs(point.y - yMin)) * mathCos(-(startAngle + (dataLength * xTrans))));

                    point.plotY = centerY + ((yTrans * mathAbs(point.y - yMin)) * mathSin(-(startAngle + (dataLength * xTrans))));
                    // set client related positions for mouse tracking
                    point.clientX = point.plotX; // for mouse tracking
                }
            }
        },


        /**
         * Draw the actual graph
         */
        drawGraph: function(state) {
            var series = this,
            options = series.options,
            chart = series.chart,
            graph = series.graph,
            graphPath = [],
            animPath = [],//used in animation initialization
            group = series.group,
            color = series.color,
            lineWidth = options.lineWidth,
            lineColor = options.lineColor || color,
            fillCOlor = pick(
                options.fillColor,
                Color(color).setOpacity(options.fillOpacity || 0.5).get()
                ),
            segmentPath,
            renderer = chart.renderer,
            singlePoints = [],
            centerX = chart.plotWidth / 2,
            centerY = chart.plotHeight / 2; // used in drawTracker
            if (series.data.length > 1) {
                segmentPath = [];
                // build the segment line
                each(series.data, function(point, i){

                    // moveTo or lineTo
                    if (!i) {
                        segmentPath.push(M);
                        animPath.push(M);
                    }
                    else if (i < 2) {
                        segmentPath.push(L);
                        animPath.push(L);
                    }

                    // normal line to next point
                    if (point.y === null) {
                        segmentPath.push(
                            centerX,
                            centerY
                            );
                    }
                    else {
                        segmentPath.push(
                            point.plotX,
                            point.plotY
                            );
                    }
                    animPath.push(
                        centerX,
                        centerY
                        );
                });
                segmentPath.push('Z');
                animPath.push('Z');
                graphPath = graphPath.concat(segmentPath);

            } else {
                //do nothing for single point
                //singlePoints.push(series.segment[0][0]);
            }
            // used in drawTracker:
            series.graphPath = graphPath;
            series.animPath = animPath;
            series.singlePoints = singlePoints;

            // draw the graph
            if (graph) {
                graph.attr({
                    d: graphPath
                });
            } else {
                series.graph = renderer.path(graphPath).
                attr({
                    'stroke': lineColor,
                    'fill': fillCOlor,///hard coded alpha for the radar
                    'stroke-width': lineWidth + PX
                }).add(group).shadow();
            }

        },

        /**
         * Create individual tracker elements for each point
         */
        //drawTracker: ColumnSeries.prototype.drawTracker,
        drawTracker: function() {
            var series = this,
            renderer = series.chart.renderer,
            cursor = series.options.cursor,
            css = cursor && {
                cursor: cursor
            },
            tracker,
            plotX,
            plotY,
            radius,
            symbolName,
            pointAttr;

            each(series.data, function(point) {
                tracker = point.tracker;
                if (point.y !== null) {
                    plotX = point.plotX;
                    plotY = point.plotY;
                    pointAttr = point.pointAttr[SELECT_STATE];
                    radius = pluckNumber(pointAttr.r, 0) + 1;
                    symbolName = pick(point.marker && point.marker.symbol, series.symbol);
                    if (tracker) {// update
                        tracker.attr({
                            x: plotX,
                            y: plotY,
                            r: radius
                        });
                    }else {
                        /**^
                         * Add cursor pointer if there has link modify the
                         * parent scope css variable with a local variable
                         */
                        if (point.link !== undefined) {
                            var css = {
                                cursor : 'pointer',
                                '_cursor': 'hand'
                            };
                        }
                        /* EOP ^*/
                        point.tracker =
                        renderer.symbol(
                            symbolName,
                            plotX,
                            plotY,
                            radius
                        )
                        .attr({
                            isTracker: true,
                            fill: TRACKER_FILL
                        })
                        .on('mouseover', function(event) {
                            series.onMouseOver();
                            point.onMouseOver();
                        })
                        .on('mouseout', function(event) {
                            if (!series.options.stickyTracking) {
                                series.onMouseOut();
                            }
                        })
                        .css(css)
                        .add(series.trackerGroup);
                    }
                }
            });

        },
        setVisible: function(vis, redraw) {
            var series = this,
            chart = series.chart,
            legendItem = series.legendItem,
            seriesGroup = series.group,
            seriesTracker = series.tracker,
            dataLabelsGroup = series.dataLabelsGroup,
            /**^
             * add hiding of shadow groups
             */
            shadowGroup = series.shadowGroup,
            /*EOP^*/
            showOrHide,
            i,
            data = series.data,
            point,
            ignoreHiddenSeries = chart.options.chart.ignoreHiddenSeries,
            oldVisibility = series.visible;

            // if called without an argument, toggle visibility
            series.visible = vis = vis === UNDEFINED ? !oldVisibility : vis;
            showOrHide = vis ? 'show' : 'hide';

            // show or hide series
            if (seriesGroup) { // pies don't have one
                seriesGroup[showOrHide]();
            }

            /**^
             * Especially show hide shadow group that are drawn outside the
             * group
             */

            if (shadowGroup && shadowGroup.floated) {
                shadowGroup[showOrHide]();
            }
            /* EOP ^*/

            //show or hide points
            if(series.anchorGroup){
                series.anchorGroup[showOrHide]();
            }

            // show or hide trackers
            if(series.trackerGroup){
                series.trackerGroup[showOrHide]();
            }




            if (dataLabelsGroup) {
                dataLabelsGroup[showOrHide]();
            }

            if (legendItem) {
                chart.legend.colorizeItem(series, vis);
            }


            // rescale or adapt to resized chart
            series.isDirty = true;
            // in a stack, all other series are affected
            if (series.options.stacking) {
                each(chart.series, function(otherSeries) {
                    if (otherSeries.options.stacking && otherSeries.visible) {
                        otherSeries.isDirty = true;
                    }
                });
            }

            if (ignoreHiddenSeries) {
                chart.isDirtyBox = true;
            }
            if (redraw !== false) {
                chart.redraw();
            }

            fireEvent(series, showOrHide);
        },
        getColor: seriesTypes.area.prototype.getColor,
        //drawPoints: function() {},
        drawDataLabels: seriesTypes.area.prototype.drawDataLabels,
        animate : function (init) {
            var series = this,
            chart = series.chart,
            clipRect = series.clipRect,
            animation = series.options.animation;

            if (animation && !isObject(animation)) {
                animation = {};
            }
            series.graph.attr({
                d: series.animPath
            });
            series.graph.animate({
                d: series.graphPath
            }, animation);

        /*EOP^*/
        },
        getSymbol : seriesTypes.area.prototype.getSymbol,
        drawPoints : function () {
            var series = this,
            pointAttr,
            data = series.data,
            chart = series.chart,
            plotX,
            plotY,
            i,
            point,
            radius,
            graphic;

            if (series.options.marker.enabled) {
                i = data.length;
                while (i--) {
                    point = data[i];
                    plotX = point.plotX;
                    plotY = point.plotY;
                    graphic = point.graphic;

                    // only draw the point if y is defined
                    if (plotY !== UNDEFINED && !isNaN(plotY)) {
                        // shortcuts
                        pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE];
                        radius = pointAttr.r;
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
                            .add(series.anchorGroup || series.group);
                        }
                    }
                }
            }

        },
        rotate : function () {},
        /**
         * Render the graph and markers
         */
        render: function() {
            var series = this,
            chart = series.chart,
            group, anchorGroup,
            options = series.options,
            animation = options.animation,
            doAnimation = animation && series.animate,
            duration = doAnimation ? (animation && animation.duration) || 500 : 0,
            cliprectX, cliprectY, cliprectW, cliprectH,
            renderer = chart.renderer,clipRect = series.clipRect;


            // Add plot area clipping rectangle. If this is before chart.hasRendered,
            // create one shared clipRect.
            if (!clipRect) {
                cliprectX = -chart.plotLeft;
                cliprectY = -chart.plotTop;
                cliprectW = chart.chartWidth;
                cliprectH = chart.chartHeight;
                clipRect = series.clipRect = !chart.hasRendered && chart.clipRect ?
                chart.clipRect :
                renderer.clipRect(cliprectX, cliprectY, cliprectW, cliprectH);
                clipRect.cliprectX = cliprectX;
                clipRect.cliprectY = cliprectY;
                clipRect.cliprectW = cliprectW;
                clipRect.cliprectH = cliprectH;

                if (!chart.clipRect) {
                    chart.clipRect = series.clipRect;
                }
            }

            ///draw the axis once only
            if (chart.drawRadarAxis !== true) {
                plotRadarAxis.call(chart);
                chart.drawRadarAxis = true;///flag to draw the radar garh for the first series
            }

            // the group
            if (!series.group) {
                group = series.group = renderer.g('series');

                if (chart.inverted) {
                    group.attr({
                        width: chart.plotWidth,
                        height: chart.plotHeight
                    }).invert();
                }
                group.clip(series.clipRect)
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN
                })
                .translate(chart.plotLeft, chart.plotTop)
                .add(chart.seriesGroup);
            }

            // the anchor group
            if (!series.anchorGroup) {
                anchorGroup = series.anchorGroup = renderer.g('anchor');

                if (chart.inverted) {
                    anchorGroup.attr({
                        width: chart.plotWidth,
                        height: chart.plotHeight
                    }).invert();
                }
                anchorGroup.clip(series.clipRect)
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    zIndex: 1//should be top of all area
                })
                .translate(chart.plotLeft, chart.plotTop)
                .add(chart.seriesGroup);
            }

            //create a tracker group. easer to show or hide the tracker.
            if (!series.trackerGroup) {
                series.trackerGroup = renderer.g('tracker')
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN
                })
                .add(chart.trackerGroup);
            }


            series.drawDataLabels();

            // no need to initiate the animation since drawgraph sets initial
            // values correctly and during redraw this either needs to be
            // changed to old initiation model or make series.animate handle
            // this.

            // draw the graph if any
            if (series.drawGraph) {
                series.drawGraph();
            }

            // draw the points
            series.drawPoints();

            // draw the mouse tracking area
            if (series.options.enableMouseTracking !== false) {
                series.drawTracker();
            }

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
    seriesTypes.radar = radar;



    var dragExtension = {
        defaultRestoreButtonVisible: 1,

        spaceManager : function (hcJSON, fcJSON, width, height) {
            //calculate the space for submit and restore
            var iapi = this,
            conf = hcJSON[CONFIGKEY],
            chartOptions = hcJSON.chart,
            chartAttr = fcJSON.chart,
            outCanvasStyle = conf.outCanvasStyle,
            //max allow 30% of avaiable height
            maxAllowedHeight = (height - (conf.marginBottomExtraSpace + chartOptions.marginBottom +
                chartOptions.marginTop) * 0.3),
            buttonHeight = 0,
            //add for obj extra for fi=orm configuration
            smartLabel = conf.smartLabel,
            textPadding2 = 4,
            smartText,
            fontSize;


            //form element conf
            chartOptions.formAction = getValidValue(chartAttr.formaction);
            chartOptions.formDataFormat = pluck(chartAttr.formdataformat,
                FusionChartsDataFormats.XML);
            chartOptions.formTarget = pluck(chartAttr.formtarget, '_self');
            chartOptions.formMethod = pluck(chartAttr.formmethod, 'POST');
            chartOptions.submitFormAsAjax = pluckNumber(chartAttr.submitformasajax, 0);

            // Form Button
            chartOptions.showFormBtn = pluckNumber(chartAttr.showformbtn, 1) && chartOptions.formAction;
            chartOptions.formBtnWidth = pluckNumber(chartAttr.formbtnwidth, 80);
            chartOptions.formBtnTitle = pluck(chartAttr.formbtntitle, 'Submit');
            chartOptions.formBtnBorderColor = pluck(chartAttr.formbtnbordercolor, 'CBCBCB');
            chartOptions.formBtnBgColor = pluck(chartAttr.formbtnbgcolor, 'FFFFFF');
            chartOptions.btnPadding = pluckNumber(chartAttr.btnpadding, 7);//2 px more for better presentation
            chartOptions.btnSpacing = pluckNumber(chartAttr.btnspacing, 5);
            chartOptions.formBtnStyle = {
                color: outCanvasStyle.color,
                fontSize: outCanvasStyle.fontSize,
                fontFamily: outCanvasStyle.fontFamily,
                fontWeight: 'bold'
            };
            if (chartAttr.btntextcolor) {
                chartOptions.formBtnStyle.color = chartAttr.btntextcolor.replace(dropHash, HASHSTRING);
            }
            if ((fontSize = pluckNumber(chartAttr.btnfontsize)) >= 0) {
                chartOptions.formBtnStyle.fontSize = fontSize + PX;
            }
            //set the line height
            setLineHeight(chartOptions.formBtnStyle);


            // Restore Button Chart
            chartOptions.showRestoreBtn = pluckNumber(chartAttr.showrestorebtn,
                this.defaultRestoreButtonVisible, 1);
            if (chartOptions.showRestoreBtn) {//if  reset btn is visible
                chartOptions.restoreBtnWidth = pluckNumber(chartAttr.restorebtnwidth,
                    80);
                chartOptions.restoreBtnTitle = pluck(chartAttr.restorebtntitle,
                    'Restore');
                chartOptions.restoreBtnBorderColor = pluck(chartAttr.restorebtnbordercolor,
                    chartOptions.formBtnBorderColor);
                chartOptions.restoreBtnBgColor = pluck(chartAttr.restorebtnbgcolor,
                    chartOptions.formBtnBgColor);
                chartOptions.restoreBtnStyle = {
                    color: chartOptions.formBtnStyle.color,
                    fontSize: chartOptions.formBtnStyle.fontSize,
                    fontFamily: chartOptions.formBtnStyle.fontFamily,
                    fontWeight: 'bold'
                };

                if (chartAttr.restorebtntextcolor) {
                    chartOptions.restoreBtnStyle.color = chartAttr.restorebtntextcolor.replace(dropHash, HASHSTRING);
                }
                if ((fontSize = pluckNumber(chartAttr.restorebtnfontsize)) >= 0) {
                    chartOptions.restoreBtnStyle.fontSize = fontSize + PX;
                }
                setLineHeight(chartOptions.restoreBtnStyle);
            }

            chartOptions.showLimitUpdateMenu =
                pluckNumber(chartAttr.showlimitupdatemenu, 1);

            //submit button
            if (chartOptions.showFormBtn) {
                smartLabel.setStyle(chartOptions.formBtnStyle);
                smartText = smartLabel.getOriSize(chartOptions.formBtnTitle);
                buttonHeight = smartText.height || 0;
            }
            //restore button
            if (chartOptions.showRestoreBtn) {
                smartLabel.setStyle(chartOptions.restoreBtnStyle);
                smartText = smartLabel.getOriSize(chartOptions.restoreBtnTitle);
                buttonHeight = mathMax(smartText.height, buttonHeight) || 0;
            }
            if (buttonHeight > 0) {
                buttonHeight += chartOptions.btnPadding + textPadding2;
                if (buttonHeight > maxAllowedHeight) {
                    chartOptions.btnPadding = mathMax(chartOptions.btnPadding - buttonHeight + maxAllowedHeight, 0) / 2;
                    buttonHeight = maxAllowedHeight;
                }
            }

            //add the space at button
            chartOptions.marginBottom += buttonHeight;
            chartOptions.spacingBottom += buttonHeight;
            // Create callback function stack if it does not exist.
            // Add function that will be executed post render of the chart and
            // create the UI
            (hcJSON.callbacks || (hcJSON.callbacks = [])).push(iapi.drawButtons);
            return iapi.placeVerticalXYSpaceManager.apply(this, arguments);
        },

        //draw the buttons
        drawButtons: function (chart, iapi) {
            var renderer = chart.renderer,
            hcJSON = iapi.hcJSON,
            hcChartObj = hcJSON.chart,
            btnPadding = hcChartObj.btnPadding,
            btnSpacing = hcChartObj.btnSpacing,
            btnTop = chart.chartHeight - hcChartObj.spacingBottom + btnPadding,
            btnLeft = chart.chartWidth - hcChartObj.spacingRight,
            submitBtn,
            restoreBtn,
            btnWidth;
            //draw submit button
            if (hcChartObj.showFormBtn) {
                submitBtn = chart.submitBtn = renderer.button({
                            x: 0,
                            y: 0,
                            width: hcChartObj.formBtnWidth,
                            text: hcChartObj.formBtnTitle,
                            style: hcChartObj.formBtnStyle,
                            callBack: function () {
                                iapi.chartInstance.submitData();
                            },
                            color: hcChartObj.formBtnBgColor,
                            borderColor: hcChartObj.formBtnBorderColor
                        })
                        .add();
                        btnWidth = submitBtn._conf && submitBtn._conf.width || 0;
                        btnLeft -= btnWidth;
                        submitBtn.translate(btnLeft, btnTop);
                        btnLeft -= btnSpacing;
            }
            //draw restore button
            if (hcChartObj.showRestoreBtn) {
                restoreBtn = chart.restoreBtn = renderer.button({
                            x: 0,
                            y: 0,
                            width: hcChartObj.restoreBtnWidth,
                            text: hcChartObj.restoreBtnTitle,
                            style: hcChartObj.restoreBtnStyle,
                            callBack: function () {
                                iapi.chartInstance.restoreData();
                            },
                            color: hcChartObj.restoreBtnBgColor,
                            borderColor: hcChartObj.restoreBtnBorderColor
                        })
                        .add();
                        btnWidth = restoreBtn._conf && restoreBtn._conf.width || 0;
                        btnLeft -= btnWidth;
                        restoreBtn.translate(btnLeft, btnTop);
                        btnLeft -= btnSpacing;
            }
        },

        drawAxisUpdateUI: function (chart, iapi) {
            var hc = iapi.hcJSON,
                chartDef = hc.chart,
                yAxisDef = hc.yAxis[0],
                conf = hc[CONFIGKEY],
                chartInstance = iapi.chartInstance,
                renderer = chart.renderer,
                container = chart.container,
                optionsChart = chart.options.chart,
                showRangeError = optionsChart.showRangeError,
                inCanvasStyle = conf.inCanvasStyle,
                plotLinesAndBands = chart.yAxis[0].plotLinesAndBands,
                extremePlotItems = [],
                inputStyle = extend({
                    outline: NONE, // prevent chrome outlining
                    '-webkit-appearance': NONE, // disable ios background
                    position: 'absolute',
                    background: 'transparent',
                    border: '1px solid #cccccc',
                    textAlign: 'right',
                    top: 0,
                    left: 0,
                    width: 50,
                    zIndex: 20,
                    opacity: 0,
                    borderRadius: 0
                }, inCanvasStyle),
                doAxisUpdate,
                item,
                options,
                i;

            // Do not proceed if the renderer is for Export
            if (renderer.forExport) {
                return;
            }

            // Create function that executes axis update function and also shows
            // message on failure
            doAxisUpdate = function (value, oldvalue, isMax) {
                var success;
                // do not update if value has not changed
                if (value === oldvalue+'') {
                    return null;
                }

                success = isMax ?
                    chartInstance.setUpperLimit(value, true) :
                    chartInstance.setLowerLimit(value, true);

                if (!success && showRangeError) {
                    chart.showLoading('<strong>Sorry! Not enough range gap to modify axis limit to ' +
                        (Number(value) || '0') +
                        '.<br />Please modify the data values to be within range.</strong><br />&nbsp;<br />' +
                        '(click anywhere on the chart to close this message)', true);
                }

                return success;
            };

            // Probe the max and min labels
            i = plotLinesAndBands && plotLinesAndBands.length || 0;
            while (i--) {
                item = plotLinesAndBands[i];
                options = item.options;
                if (options.isMaxLabel) {
                    extremePlotItems.push(item);
                }
                else if (options.isMinLabel) {
                    extremePlotItems.push(item);
                }
            }

            // Draw the input boxes and attach all events
            each(extremePlotItems, function (plotItem) {
                var label = plotItem.label,
                    options = plotItem.options,
                    box = label && label.getBBox && label.getBBox(),
                    $input,
                    inputElement,
                    inputWidth,
                    inputLeft,
                    defaultAction,
                    justFocussed;

                // Take precaution to ensure that we do not do any computation
                // in case chart is destroyed.
                if (!(box && label)) {
                    return;
                }

                // Decide the width and position of inputbox.
                inputWidth = box.x + box.width - optionsChart.spacingLeft;
                inputLeft = chart.plotLeft - inputWidth - (isVML ? 5 : 4);

                // Create the input-box element and provide its initial attrs
                // and styling.
                $input = jQuery(inputElement = createElement('input', {
                    type: 'text',
                    value: options.value
                }, extend(inputStyle, {
                    top: (box.y + (isVML ? 0 : -1)) + PX,
                    left: inputLeft + PX,
                    width: inputWidth + PX
                }), container, true))

                // Add events to make the textboxes visible on focus and hide
                // when not.
                .bind({
                    focus: function () {
                        $input.val(options.value).css({
                            opacity: 1,
                            color: inCanvasStyle.color
                        });
                        justFocussed = true;
                        label.hide();
                    },
                    mouseup: function () {
                        if (justFocussed) {
                            justFocussed = false;
                            if (!hasTouch) {
                                setTimeout(function () {
                                    $input.select();
                                }, 0);
                            }
                        }
                    },

                    blur: function () {
                        var value = $input.val(),
                            success = doAxisUpdate(value, options.value,
                                options.isMaxLabel);

                        if (success !== true) {
                            $input.css({
                                opacity: 0
                            });
                            label.show();
                        }
                        justFocussed = false;
                    },

                    keyup: function (e) {
                        var keyCode = e.keyCode,
                            value = $input.val(),
                            success;

                        if (keyCode === 13) {
                            success = doAxisUpdate(value, options.value,
                                options.isMaxLabel);
                            if (success === false) {
                                $input.css({
                                    color: '#dd0000'
                                });
                            }
                        }
                        else if (keyCode === 27) {
                            $input.val(options.value).trigger('blur', e);
                        }
                    }
                });

                // Mark it for no event prevention
                attr(inputElement, 'isOverlay', true);

                // When out of textbox is clicked, we need to emulate blur event.
                // This is because the container grabs the mousedown event for
                // better UX.
                if (isVML) {
                    addEvent(chart.container, 'mousedown', defaultAction = function (e) {
                        if (e.srcElement !== inputElement) {
                            $input.trigger('blur', e);
                        }
                    });
                    // cleanup
                    addEvent(chart, 'destroy', function () {
                        removeEvent(chart.container, 'mousedown', defaultAction);
                        $input.remove();
                    });
                }
                else {
                    addEvent(chart, 'defaultprevented', defaultAction = function (e) {
                        if (inputElement.parentNode && $input.is(':focus')) {
                            $input.trigger('blur', e);
                        }
                    });
                    // cleanup
                    addEvent(chart, 'destroy', function () {
                        removeEvent(chart, 'defaultprevented', defaultAction);
                        $input.remove();
                    });
                }

                if (chartDef.showLimitUpdateMenu) {
                    chart.addButton({
                        x: chartDef.spacingLeft,
                        y: chart.chartHeight - chartDef.spacingBottom +
                            (!chartDef.showFormBtn && !chartDef.showRestoreBtn ? -15 : 10),
                        align: 'left',
                        symbol: 'configureIcon',
                        tooltip: 'Change Y-Axis Limits',
                        menuId: 'axis-update-menu',
                        menuItems: [{
                            text: 'Increase Upper Limit',
                            onclick: function() {
                                iapi.chartInstance.setUpperLimit(yAxisDef.max +
                                    yAxisDef.tickInterval, true);
                            }
                        }, {
                            text: 'Increase Lower Limit',
                            onclick: function() {
                                iapi.chartInstance.setLowerLimit(yAxisDef.min +
                                    yAxisDef.tickInterval, true);
                            }
                        }, {
                            text: 'Decrease Upper Limit',
                            onclick: function() {
                                iapi.chartInstance.setUpperLimit(yAxisDef.max -
                                    yAxisDef.tickInterval, true);
                            }
                        }, {
                            text: 'Decrease Lower Limit',
                            onclick: function() {
                                iapi.chartInstance.setLowerLimit(yAxisDef.min -
                                    yAxisDef.tickInterval, true);
                            }
                        }]
                    });
                }
            });
        },

        getCollatedData: function () {

            var api = this,
                fcObj = api.chartInstance,
                state = fcObj.__state,
                vars = fcObj.jsVars,
                origChartData = api.updatedDataObj ||
                    extend2({}, fcObj.getChartData(FusionChartsDataFormats.JSON)),
                reflowData = vars._reflowData,
                origDataSets = origChartData.dataset,
                updatedData = (reflowData && reflowData.hcJSON &&
                    reflowData.hcJSON.series),
                i = (updatedData && updatedData.length),
                j,
                origSet,
                updatedSet,
                dataItem

            if (state.hasStaleData !== undefined && !state.hasStaleData && api.updatedDataObj) {
                return api.updatedDataObj;
            }

            if (origDataSets && updatedData) {
                while (i--) {
                    origSet = (origDataSets[i] && origDataSets[i].data);
                    updatedSet = (updatedData[i] && updatedData[i].data);
                    j = (updatedSet && updatedSet.length);

                    if (j && origSet) {
                        while (j--) {
                            dataItem = updatedSet[j];
                            if (dataItem) {
                                origSet[j].value = dataItem.y;
                            }
                        }
                    }
                }
            }

            state.hasStaleData = false;
            return (api.updatedDataObj = origChartData);
        },
        eiMethods: {
            restoreData: function () {
                var vars = this.jsVars,
                    iChart = vars.fcObj;

                // Delete reflow-data that has all drag related stuffs and
                // simply redraw the chart.
                vars._reflowData = {};
                //delete _reflowClean
                delete vars._reflowClean;
                global.hcLib.createChart(iChart, vars.container, vars.type,
                        undefined, undefined, false, true);

                lib.raiseEvent('DataRestored', {}, iChart, [iChart.id]);
                return true;

            },

            submitData: function () {
                var vars = this.jsVars,
                    fcObj = vars.fcObj,
                    json = FusionChartsDataFormats.JSON,
                    csv = FusionChartsDataFormats.CSV,
                    xml = FusionChartsDataFormats.XML,
                    iapi = vars.instanceAPI,
                    hcJSON = iapi.hcJSON,
                    chart = hcJSON.chart,
                    url = chart.formAction,
                    submitAsAjax = chart.submitFormAsAjax,
                    requestType,
                    data,
                    paramObj,
                    $form;

                if (chart.formDataFormat === json) {
                    requestType = json;
                    data = JSON.stringify(iapi.getCollatedData());
                }
                else if (chart.formDataFormat === csv) {
                    requestType = csv;
                    data = iapi.getCSVString && iapi.getCSVString();
                    if (data === undefined) {
                        data = global.core.transcodeData(iapi.getCollatedData(), json, csv);
                    }
                }
                else {
                    requestType = xml;
                    data = global.core.transcodeData(iapi.getCollatedData(), json, xml);
                }

                if (url === undefined) {
                    return;
                }

                // After the collation is done, we have to submit the data using
                // ajax or form submit method.
                if (!submitAsAjax) {
                    // Create a hidden form with data inside it.
                    $form = jQuery("<form style='display:none' action='" +
                        url + "' method='" + chart.formMethod + "'\n\
                        target='" + chart.formTarget + "'> <input type='hidden' \n\
                        name='strXML' value='" +
                        parseUnsafeString(data) + "'><input type='hidden' name='dataFormat' value='"+
                        requestType.toUpperCase() + "' /></form>");

                    // Append the form to body and then submit it.
                    jQuery(document.body).append($form);
                    $form.submit();
                    // cleanup
                    $form.remove();
                    $form = null;
                }
                else {
                    paramObj = {
                        error: function (jqXHR, type, message) {

                            lib.raiseEvent('DataPostError', {
                                xhrObject: jqXHR,
                                url: url,
                                errorType: type,
                                statusText: message,
                                httpStatus: jqXHR.status
                            }, fcObj, [fcObj.id, type, jqXHR.status, message]);
                        },
                        success: function (data, textStatus, jqXHR) {

                            lib.raiseEvent('DataPosted', {
                                xhrObject: jqXHR,
                                response: data,
                                url: url
                            }, fcObj, [fcObj.id, data]);
                        },
                        type: chart.formMethod
                    };

                    paramObj.data = {};
                    paramObj.data['str' + requestType.toUpperCase()] = data;

                    jQuery && jQuery.ajax(url, paramObj);
                }
            },

            getDataWithId: function () {
                // create a two dimensional array as given in the docs
                var vars = this.jsVars,
                    iapi = vars.instanceAPI,
                    dataObj = iapi.getCollatedData(),
                    returnObj = [[null]],
                    datasets = dataObj.dataset,
                    catArr = (dataObj.categories && dataObj.categories[0] &&
                        dataObj.categories[0].category),
                    i = (datasets && datasets.length) || 0,
                    setArr,
                    catName,
                    set,
                    item,
                    id,
                    j;

                while (i--) {
                    set = datasets[i];
                    if (set) {
                        returnObj[0][i + 1] = datasets[i].seriesname;

                        set = datasets[i] && datasets[i].data;
                        j = (set && set.length) || 0;
                        while (j--) {
                            item = j + 1;
                            if (!returnObj[item]) {
                                catName = (catArr && catArr[j] && catArr[j].label) || null;
                                returnObj[item] = [catName];
                            }
                            setArr = returnObj[item];
                            id = set[j].id || ((i + 1).toString() + "_" + (item).toString());
                            setArr[i + 1] = [id, Number(set[j].value)];
                        }
                    }
                }

                return returnObj;
            },

            getData: function (format) {
                // create a two dimensional array as given in the docs
                var vars = this.jsVars,
                    iapi = vars.instanceAPI,
                    dataObj = iapi.getCollatedData(),
                    returnObj = [[null]],
                    datasets = dataObj.dataset,
                    catArr = (dataObj.categories && dataObj.categories[0] &&
                        dataObj.categories[0].category),
                    i = (datasets && datasets.length) || 0,
                    setArr,
                    catName,
                    set,
                    item,
                    j;

                // When a format is provided
                if (format) {
                    // no transcoding needed for json
                    if (/^json$/ig.test(format)) {
                        returnObj = dataObj;
                    }
                    else {
                        returnObj = global.core.transcodeData(dataObj,
                            'json', format);
                    }
                }
                // if no format has been specified, return data as 2d array.
                else {
                    while (i--) {
                        set = datasets[i];
                        if (set) {
                            returnObj[0][i + 1] = datasets[i].seriesname;

                            set = datasets[i] && datasets[i].data;
                            j = (set && set.length) || 0;
                            while (j--) {
                                item = j + 1;
                                if (!returnObj[item]) {
                                    catName = (catArr && catArr[j] && catArr[j].label) || null;
                                    returnObj[item] = [catName];
                                }
                                setArr = returnObj[item];
                                setArr[i + 1] = Number(set[j].value);
                            }
                        }
                    }
                }

                return returnObj;
            },

            setYAxisLimits: function (upper, lower) {
                var vars = this.jsVars,
                iapi = vars.instanceAPI,
                hcJSON = iapi.hcJSON,
                dataObj = iapi.dataObj,
                chartAttr = dataObj && dataObj.chart || {},
                yAxis = hcJSON.yAxis[0],
                limitchanged = false;

                if ((upper !== undefined) && upper > iapi.highValue && upper !== yAxis.max) {
                    chartAttr.yaxismaxvalue = upper;
                    limitchanged = true;
                }
                else {
                    upper = iapi.highValue > yAxis.max ? iapi.highValue : yAxis.max;
                    chartAttr.yaxismaxvalue = upper;
                }

                if ((lower !== undefined) && lower < iapi.lowValue && lower !== yAxis.min) {
                    chartAttr.yaxisminvalue = lower;
                    limitchanged = true;
                }
                else {
                    lower = iapi.lowValue < yAxis.min ? iapi.lowValue : yAxis.min;
                    chartAttr.yaxisminvalue = lower;
                }

                if (limitchanged) {
                    iapi.updateChartWithData(dataObj);
                }

                return limitchanged;
            },

            getUpperLimit: function () {
                var vars = this.jsVars,
                iapi = vars.instanceAPI,
                hcJSON = iapi.hcJSON,
                yAxis = hcJSON.yAxis && hcJSON.yAxis[0];

                return (yAxis ? yAxis.max : undefined);
            },

            setUpperLimit: function (newLimit) {
                var ci = this.jsVars.fcObj;
                return ci.setYAxisLimits(newLimit, undefined);
            },

            getLowerLimit: function () {
                var vars = this.jsVars,
                iapi = vars.instanceAPI,
                hcJSON = iapi.hcJSON,
                yAxis = hcJSON.yAxis && hcJSON.yAxis[0];

                return (yAxis ? yAxis.min : undefined);
            },

            setLowerLimit: function (newLimit) {
                var ci = this.jsVars.fcObj;
                return this.jsVars.fcObj.setYAxisLimits(undefined, newLimit);
            }
        },

        updateChartWithData: function (dataObj) {
            var api = this,
            chartObj = api.chartInstance,
            vars = chartObj.jsVars,
            fcChart = (dataObj && dataObj.chart),
            reflowData = vars._reflowData || (vars._reflowData = {}),
            reflowUpdate = {
                dataObj: {
                    chart: {
                        yaxisminvalue: pluckNumber(fcChart.yaxisminvalue),
                        yaxismaxvalue: pluckNumber(fcChart.yaxismaxvalue)
                    }
                }
            };

            extend2(reflowData, reflowUpdate, true);
            // Call Highcharts library to generate FusionCharts.
            global.hcLib.createChart(chartObj, vars.container, vars.type);
            return;
        },

        preSeriesAddition: function () {
            var iapi = this,
            fc = iapi.dataObj,
            hc = iapi.hcJSON,
            chartAttr = fc.chart,
            chartOptions = hc.chart,
            conf = hc[CONFIGKEY];

            iapi.tooltipSepChar = conf.tooltipSepChar;

            //Drag options
            chartOptions.allowAxisChange = pluckNumber(chartAttr.allowaxischange,
                1);
            chartOptions.changeDivWithAxis = 1;
            chartOptions.snapToDivOnly = pluckNumber(chartAttr.snaptodivonly, 0);
            chartOptions.snapToDiv = chartOptions.snapToDivOnly ? 1 : pluckNumber(chartAttr.snaptodiv, 1);
            chartOptions.snapToDivRelaxation = pluckNumber(
                chartAttr.snaptodivrelaxation, 10);
            chartOptions.doNotSnap = pluckNumber(chartAttr.donotsnap, 0);
            //If no snapping then we set default to all snapping parameters to 0
            if(chartOptions.doNotSnap) {
                chartOptions.snapToDiv = chartOptions.snapToDivOnly = 0;
            }

            // Configuration to suppress display of error message when out of
            // range.
            chartOptions.showRangeError = pluckNumber(chartAttr.showrangeerror, 0);

            // Create callback function stack if it does not exist.
            // Add function that will be executed post render of the chart and
            // create the UI
            if (pluckNumber(chartAttr.allowaxischange, 1)) {
                (hc.callbacks || (hc.callbacks = [])).push(function (chart) {
                    var scope = this,
                        args = arguments,
                        proxy = function () {
                            iapi.drawAxisUpdateUI.apply(scope, args);
                            interrupt = null;
                        },
                        interrupt;

                    // In case a super-fast destroy occurs, we need to cancel
                    // the original timeout.
                    addEvent(chart, 'destroy', function () {
                        if (interrupt) {
                            interrupt = clearTimeout(interrupt);
                        }
                    });
                    interrupt = setTimeout(proxy, 1);
                });
            }
        },

        // Function to create tooltext for individual data points
        getPointStub: function (setObj, value, label, HCObj, dataset,
            datasetShowValues, yAxisIndex) {
            var HCConfig = HCObj[CONFIGKEY],
            isSY = yAxisIndex === 1 ? true : false,
            formatedVal = value === null ? value : HCConfig.numberFormatter
            .dataLabels(value, isSY),
            setTooltext = getValidValue(parseUnsafeString(setObj.tooltext)),
            tooltipSepChar = HCConfig.tooltipSepChar,
            _sourceDataset = dataset._sourceDataset,
            allowDrag = pluckNumber(setObj.allowdrag,
                _sourceDataset.allowdrag, 1),
            allowNegDrag = pluckNumber(setObj.allownegativedrag,
                _sourceDataset.allownegativedrag, dataset.allownegativedrag, 1),
            showPercentInToolTipRequared,
            showPercentValuesRequared,
            displayValue,
            seriesname,
            toolText,
            isUserTooltip = 0,
            isUserValue = 0,
            toolTextStr,
            dataLink;

            //create the tooltext
            if (!HCConfig.showTooltip) {
                toolText = false;
            }
            // if tooltext is given in data object
            else if (setTooltext !== undefined) {
                toolText = setTooltext;
                isUserTooltip = 1;
            }
            else {//determine the tooltext then
                if (formatedVal === null) {
                    toolText = false;
                }else {
                    if (HCConfig.seriesNameInToolTip) {
                        seriesname = getFirstValue(dataset &&
                            dataset.seriesname);
                    }
                    toolText = seriesname ? seriesname + tooltipSepChar :
                    BLANK;
                    toolText += label ? label + tooltipSepChar : BLANK;
                    toolTextStr = toolText;
                    if (HCConfig.showPercentInToolTip){
                        showPercentInToolTipRequared = true;
                    }
                    else {
                        toolText += formatedVal;
                    }
                }
            }

            //create the displayvalue
            if (!pluckNumber(setObj.showvalue, datasetShowValues)) {
                displayValue = BLANK;
            }
            else if (getValidValue(setObj.displayvalue) !== undefined) {
                displayValue = parseUnsafeString(setObj.displayvalue);
                isUserValue = 1;
            }
            else if (HCConfig.showPercentValues){
                showPercentValuesRequared = true;
            }
            else {//determine the dispalay value then
                displayValue = formatedVal;
            }

            ////create the link
            dataLink = pluck(setObj.link);

            return {
                displayValue : displayValue,
                toolText : toolText,
                link: dataLink,
                showPercentValues : showPercentValuesRequared,
                showPercentInToolTip : showPercentInToolTipRequared,
                allowDrag: allowDrag,
                allowNegDrag: allowNegDrag,
                _toolTextStr: toolTextStr,
                _isUserValue: isUserValue,
                _isUserTooltip: isUserTooltip
            };
        }
    };




    /* Drag Node Chart */
    /////////////// DragArea ///////////
    //Local function to redraw dragnode after add/update of any element
    function redrawDragNode (vars) {
                var iChart = vars.fcObj;

        // simply redraw the chart.
        global.hcLib.createChart(iChart, vars.container, vars.type,
                undefined, undefined, false, true);

        lib.raiseEvent('chartupdated', {}, iChart, [iChart.id]);
    }



    chartAPI('dragnode', {
        standaloneInit: true,
        decimals: 2,
        numdivlines: 0,
        numVDivLines: 0,
        defaultZeroPlaneHighlighted: false,
        defaultZeroPlaneHidden: true,
        spaceManager: dragExtension.spaceManager,
        drawButtons: dragExtension.drawButtons,
        //defaultRestoreButtonVisible: 0,
        updateChartWithData: dragExtension.updateChartWithData,
        creditLabel: creditLabel,
        showYAxisValues: 0,
        defaultSeriesType: 'dragnode',
        /****   Helper to delet node *****/
        cleanedData : function (oriObj, cleanObj) {
            var oriJSON = oriObj && oriObj.hcJSON,
            cleanJSON = cleanObj && cleanObj.hcJSON,
            oriCnts,
            oriSeri,
            cnts,
            seri,
            csl,
            ll,
            sl,
            dl,
            cl,
            i,
            j;
            //connectors
            if (oriJSON && cleanJSON) {
                //clean data
                if (oriJSON.series && cleanJSON.series && (sl = cleanJSON.series.length)) {
                    for (i = 0; i < sl; i += 1) {
                        seri = cleanJSON.series[i];
                        oriSeri = oriJSON.series[i];
                        if (seri.data && (dl = seri.data.length)) {
                            for (j = 0; j < dl; j += 1) {
                                if (seri.data[j] === true && oriSeri && oriSeri.data && oriSeri.data[j]) {
                                    delete oriSeri.data[j];
                                    //add a null point
                                    oriSeri.data[j] = {y: null};
                                }
                            }
                        }
                    }
                }
                //clean connectors
                if (oriJSON.connectors && cleanJSON.connectors && (csl = cleanJSON.connectors.length)) {
                    for (i = 0; i < csl; i += 1) {
                        cnts = cleanJSON.connectors[i];
                        oriCnts = oriJSON.connectors[i];
                        if (cnts.connector && (cl = cnts.connector.length)) {
                            for (j = 0; j < cl; j += 1) {
                                if (cnts.connector[j] === true && oriCnts && oriCnts.connector && oriCnts.connector[j]) {
                                    delete oriCnts.connector[j];
                                    //add a null point
                                    oriCnts.connector[j] = {};
                                }
                            }
                        }
                    }
                }
                //clean labels dragableLabels
                if (oriJSON.dragableLabels && cleanJSON.dragableLabels && (ll = cleanJSON.dragableLabels.length)) {
                    for (i = 0; i < ll; i += 1) {
                        if (cleanJSON.dragableLabels[i] === true && oriJSON.dragableLabels[i]) {
                            delete oriJSON.dragableLabels[i];
                            oriJSON.dragableLabels[i] = {};
                        }
                    }
                }
            }
        },

        eiMethods: extend2(extend(chartAPI.scatterbase.eiMethods,
            dragExtension.eiMethods), {//extra methodes for drag node
                //add node
                addNode: function (config) {
                    var vars = this.jsVars,
                    chartApi = vars.instanceAPI,
                    reflowData = vars._reflowData || (vars._reflowData = {}),
                    hcJSON = chartApi.hcJSON,
                    NumberFormatter = chartApi.numberFormatter,
                    datasetId = pluck(config.datasetId),
                    itemValueY = NumberFormatter.getCleanValue(config.y),
                    itemValueX = NumberFormatter.getCleanValue(config.x),
                    idFound = false,
                    series = hcJSON.series,
                    sLn = series.length,
                    xMin = hcJSON.xAxis.min,
                    xMax = hcJSON.xAxis.max,
                    yMin = hcJSON.yAxis[0].min,
                    yMax = hcJSON.yAxis[0].max,
                    reflowUpdate = {
                        hcJSON: {
                            series: []
                        }
                    },
                    reflowSeries = reflowUpdate.hcJSON.series,
                    poinyJSON,
                    i,
                    seri,
                    data,
                    index;
                    //if it has valid x and y value and valid datasetId
                    if (datasetId !== undefined && itemValueY !== null &&
                        itemValueY >= yMin && itemValueY <= yMax && itemValueX !== null
                        && itemValueX >= xMin && itemValueX <= xMax) {

                        for (i = 0; i < sLn && !idFound; i += 1) {
                                if (datasetId == series[i].id) {
                                    reflowSeries[i] = {
                                        data: []
                                    }
                                    idFound = true;
                                    seri = series[i]
                                    data = seri.data;
                                    index = data.length;
                                    data.push(poinyJSON = seri._dataParser(config,
                                        index, itemValueX, itemValueY));
                                    reflowSeries[i].data[index] = poinyJSON;
                                    extend2(reflowData, reflowUpdate, true);
                                }
                        }
                        if (idFound) {//resize the chart
                            redrawDragNode(vars);
                            return true;
                        }
                        return false;
                    }
                    else {
                        return false;
                    }
                },
                //get node attribute
                getNodeAttribute: function (id) {
                    var vars = this.jsVars,
                    chartApi = vars.instanceAPI,
                    reflowData = vars._reflowData || (vars._reflowData = {}),
                    oldReflowSeries = reflowData.hcJSON && reflowData.hcJSON.series || [],
                    hcJSON = chartApi.hcJSON,
                    idFound = false,
                    series = hcJSON.series,
                    sLn = series.length,
                    i,
                    j,
                    dataLn,
                    seri,
                    data;
                    //if it has valid x and y value and valid datasetId
                    if (id !== undefined) {
                        for (i = 0; i < sLn && !idFound; i += 1) {
                            seri = series[i];
                            data = seri.data;
                            dataLn = data.length;
                            for (j = 0; j < dataLn; j += 1){
                                if (data[j].id === id) {
                                    //if their has any update in reflow then extend it.
                                    if(oldReflowSeries[i] && oldReflowSeries[i].data &&
                                        oldReflowSeries[i].data[j]) {
                                        return extend2(data[j]._options, oldReflowSeries[i].data[j]._options, true);
                                    }
                                    return data[j]._options;
                                }
                            }
                        }
                    }
                    return false;
                },
                //set node attribute
                setNodeAttribute: function (id, key, value) {
                    var config;
                    if (typeof key === 'object' && value === undefined) {
                        config = key;
                    }
                    else {
                        config = {};
                        config[key] = value
                    }
                    var vars = this.jsVars,
                    chartApi = vars.instanceAPI,
                    reflowData = vars._reflowData || (vars._reflowData = {}),
                    hcJSON = chartApi.hcJSON,
                    NumberFormatter = chartApi.numberFormatter,
                    idFound = false,
                    series = hcJSON.series,
                    sLn = series.length,
                    xMin = hcJSON.xAxis.min,
                    xMax = hcJSON.xAxis.max,
                    yMin = hcJSON.yAxis[0].min,
                    yMax = hcJSON.yAxis[0].max,
                    reflowUpdate = {
                        hcJSON: {
                            series: []
                        }
                    },
                    reflowSeries = reflowUpdate.hcJSON.series,
                    oldReflowSeries = reflowData.hcJSON && reflowData.hcJSON.series || [],
                    poinyJSON,
                    itemValueY,
                    itemValueX,
                    i,
                    j,
                    seri,
                    data,
                    dataLn,
                    point;
                    //if it has valid x and y value and valid datasetId
                    if (id !== undefined) {
                        for (i = 0; i < sLn && !idFound; i += 1) {
                            seri = series[i]
                            data = seri.data;
                            dataLn = data.length;
                            for (j = 0; j < dataLn; j += 1) {
                                if (id === data[j].id) {
                                    point = data[j];
                                    //don't allow change of id
                                    delete config.id;
                                    //if their has any reflowCOnf then extend it too
                                    if(oldReflowSeries[i] && oldReflowSeries[i].data &&
                                        oldReflowSeries[i].data[j] && oldReflowSeries[i].data[j]._options) {
                                        config = extend2(oldReflowSeries[i].data[j]._options, config, true);
                                    }
                                    config = extend2(point._options, config, true);
                                    itemValueY = NumberFormatter.getCleanValue(config.y);
                                    itemValueX = NumberFormatter.getCleanValue(config.x);
                                    if (itemValueY !== null && itemValueY >= yMin &&
                                        itemValueY <= yMax && itemValueX !== null &&
                                        itemValueX >= xMin && itemValueX <= xMax) {

                                        reflowSeries[i] = {
                                            data: []
                                        };
                                        poinyJSON = seri._dataParser(config,
                                            j, itemValueX, itemValueY);
                                        reflowSeries[i].data[j] = poinyJSON;
                                        extend2(reflowData, reflowUpdate, true);
                                        redrawDragNode(vars);
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                },
                deleteNode: function (id) {
                    if (id !== undefined) {
                        var vars = this.jsVars,
                        chartApi = vars.instanceAPI,
                        reflowClean = vars._reflowClean || (vars._reflowClean = {}),
                        hcJSON = chartApi.hcJSON,
                        series = hcJSON.series,
                        cleanUpdate = {
                            hcJSON: {
                                series: []
                            }
                        },
                        seri,
                        dataLength,
                        data,
                        sLn,
                        i,
                        j;
                        if (series && (sLn = series.length)) {
                            for (i = 0; i < sLn; i += 1) {
                                seri = series[i];
                                if (seri && (data = seri.data)
                                    && (dataLength = data.length)) {
                                    for (j = 0; j < dataLength; j += 1) {
                                        if (id === data[j].id) {//id found
                                            //delete the Node
                                            cleanUpdate.hcJSON.series[i] = {data: []};
                                            cleanUpdate.hcJSON.series[i].data[j] = true;
                                            extend2(reflowClean, cleanUpdate, true);
                                            redrawDragNode(vars);
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return false;
                },
                addConnector: function (config) {
                    if (typeof config === 'object') {
                        var vars = this.jsVars,
                        chartApi = vars.instanceAPI,
                        reflowData = vars._reflowData || (vars._reflowData = {}),
                        hcJSON = chartApi.hcJSON,
                        connectors = hcJSON.connectors && hcJSON.connectors[0] || {connector: []},
                        index = connectors.connector.length,
                        reflowUpdate = {
                            hcJSON: {
                                connectors: [{
                                        connector:[]
                                }]
                            }
                        };
                        reflowUpdate.hcJSON.connectors[0].connector[index] =
                            connectors._connectorParser(config, index);
                        extend2(reflowData, reflowUpdate, true);
                        redrawDragNode(vars);
                        return true;
                    }
                    return false;
                },
                editConnector: function (id, key, value) {
                    var config;
                    if (typeof key === 'object' && value === undefined) {
                        config = key;
                    }
                    else {
                        config = {};
                        config[key] = value
                    }
                    var vars = this.jsVars,
                    chartApi = vars.instanceAPI,
                    reflowData = vars._reflowData || (vars._reflowData = {}),
                    hcJSON = chartApi.hcJSON,
                    connectors = hcJSON.connectors || (hcJSON.connectors = []),
                    cLn = connectors.length,
                    reflowUpdate = {
                        hcJSON: {
                            connectors: []
                        }
                    },
                    reflowConnectors = reflowUpdate.hcJSON.connectors,
                    connectorJSON,
                    i,
                    j,
                    connectorGroup,
                    connector,
                    connectorLn,
                    connectorObj;
                    //if it has valid x and y value and valid datasetId
                    if (id !== undefined) {
                        for (i = 0; i < cLn; i += 1) {
                            connectorGroup = connectors[i];
                            if (connectorGroup && (connector = connectorGroup.connector)) {
                                connectorLn = connector.length;
                                for (j = 0; j < connectorLn; j += 1) {
                                    if (id === connector[j].id) {
                                        connectorObj = connector[j];
                                        //don't allow change of id
                                        delete config.id;
                                        if (reflowData.hcJSON && reflowData.hcJSON.connectors &&
                                             reflowData.hcJSON.connectors[i] &&
                                             reflowData.hcJSON.connectors[i].connector &&
                                             reflowData.hcJSON.connectors[i].connector[j] &&
                                             reflowData.hcJSON.connectors[i].connector[j]._options) {
                                             config = extend2(reflowData.hcJSON.connectors[i].
                                                 connector[j]._options, config, true)
                                        }
                                        config = extend2(connectorObj._options, config, true);
                                        reflowConnectors[i] = {
                                            connector: []
                                        };
                                        connectorJSON = connectorGroup._connectorParser(config, j);
                                        reflowConnectors[i].connector[j] = connectorJSON;
                                        extend2(reflowData, reflowUpdate, true);
                                        redrawDragNode(vars);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                },
                deleteConnector: function (id) {
                    if (id !== undefined) {
                        var vars = this.jsVars,
                        chartApi = vars.instanceAPI,
                        reflowClean = vars._reflowClean || (vars._reflowClean = {}),
                        hcJSON = chartApi.hcJSON,
                        connectors = hcJSON.connectors,
                        cleanUpdate = {
                            hcJSON: {
                                connectors: []
                            }
                        },
                        connectorGroup,
                        connectorLn,
                        connector,
                        cLn,
                        i,
                        j;
                        if (connectors && (cLn = connectors.length)) {
                            for (i = 0; i < cLn; i += 1) {
                                connectorGroup = connectors[i];
                                if (connectorGroup && (connector = connectorGroup.connector)
                                    && (connectorLn = connector.length)) {
                                    for (j = 0; j < connectorLn; j += 1) {
                                        if (id === connector[j].id) {//id found
                                            //delete the connectors
                                            cleanUpdate.hcJSON.connectors[i] = {connector: []};
                                            cleanUpdate.hcJSON.connectors[i].connector[j] = true;
                                            extend2(reflowClean, cleanUpdate, true);
                                            redrawDragNode(vars);
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return false;
                },
                addLabel: function (config) {
                    //if valid configuration
                    if (config) {
                        var vars = this.jsVars,
                        chartApi = vars.instanceAPI,
                        reflowData = vars._reflowData || (vars._reflowData = {}),
                        hcJSON = chartApi.hcJSON,
                        dragableLabels = hcJSON.dragableLabels || [],
                        index = dragableLabels.length,
                        reflowUpdate = {
                            hcJSON: {
                                dragableLabels: []
                            }
                        };
                        reflowUpdate.hcJSON.dragableLabels[index] = config;
                        extend2(reflowData, reflowUpdate, true);
                        redrawDragNode(vars);
                        return true;
                    }
                    return false;
                },
                deleteLabel: function (index) {
                    var vars = this.jsVars,
                    chartApi = vars.instanceAPI,
                    reflowClean = vars._reflowClean || (vars._reflowClean = {}),
                    cleanUpdate = {
                            hcJSON: {
                                dragableLabels: []
                            }
                    },
                    hcJSON = chartApi.hcJSON,
                    dragableLabels = hcJSON.dragableLabels || [],
                    length = dragableLabels.length;
                    //if valid index
                    if (index < length) {
                        //delet the label
                        cleanUpdate.hcJSON.dragableLabels[index] = true;
                        extend2(reflowClean, cleanUpdate, true);
                        redrawDragNode(vars);
                        return true;//success
                    }
                    return false;//not valid
                },
                setThreshold: function (thresold) {
                    var vars = this.jsVars,
                    HCChart = vars.hcObj,
                    connectorsStore = HCChart.connectorsStore || [],
                    ln = connectorsStore.length,
                    connector,
                    i;

                    for (i = 0; i < ln; i += 1) {
                        connector = connectorsStore[i];
                        if (connector && connector.options){
                            if(connector.options.conStrength < thresold){
                                connector.graphic && connector.graphic.hide();
                                if (connector.text){
                                    connector.text.hide();
                                    connector.text.textBoundWrapper &&
                                        connector.text.textBoundWrapper.hide();
                                }
                            }
                            else {
                                connector.graphic && connector.graphic.show();
                                if (connector.text){
                                    connector.text.show();
                                    connector.text.textBoundWrapper &&
                                        connector.text.textBoundWrapper.show();
                                }
                            }
                        }
                    }

                }


            }),

         getCollatedData: function () {

            var api = this,
                fcObj = api.chartInstance,
                state = fcObj.__state,
                vars = fcObj.jsVars,
                origChartData = api.updatedDataObj ||
                    extend2({}, fcObj.getChartData(FusionChartsDataFormats.JSON)),
                reflowData = vars._reflowData,
                reflowClean = vars._reflowClean,
                origLabel = (origChartData.labels || (origChartData.labels = {label: []}))&&
                    (origChartData.labels.label || (origChartData.labels.label = [])),
                updatedLabels = (reflowData && reflowData.hcJSON &&
                    reflowData.hcJSON.dragableLabels),
                cleanedLabels = (reflowClean && reflowClean.hcJSON &&
                    reflowClean.hcJSON.dragableLabels),
                origConnectors = origChartData.connectors,
                updatedConnectors = (reflowData && reflowData.hcJSON &&
                    reflowData.hcJSON.connectors),
                cleanedConnectors = (reflowClean && reflowClean.hcJSON &&
                    reflowClean.hcJSON.connectors),
                origDataSets = origChartData.dataset,
                updatedData = (reflowData && reflowData.hcJSON &&
                    reflowData.hcJSON.series),
                cleanedData = (reflowClean && reflowClean.hcJSON &&
                    reflowClean.hcJSON.series),
                i = (updatedData && updatedData.length),
                j,
                origSet,
                updatedSet,
                dataItem,
                origConnector,
                updatedConnector,
                connectorItem;

            if (state.hasStaleData !== undefined && !state.hasStaleData && api.updatedDataObj) {
                return api.updatedDataObj;
            }
            //update data
            if (origDataSets && updatedData) {
                while (i--) {
                    origSet = (origDataSets[i] && origDataSets[i].data);
                    updatedSet = (updatedData[i] && updatedData[i].data);
                    j = (updatedSet && updatedSet.length);

                    if (j && origSet) {
                        while (j--) {
                            dataItem = updatedSet[j];
                            if (dataItem) {
                                if (origSet[j]) {
                                    extend2(origSet[j], dataItem._options);
                                }
                                else {
                                    origSet[j] = dataItem._options;
                                }
                            }
                        }
                    }
                }
            }
            //update connectors
            i = (updatedConnectors && updatedConnectors.length)
            if (origConnectors && updatedConnectors) {
                while (i--) {
                    origConnector = (origConnectors[i] && origConnectors[i].connector);
                    updatedConnector = (updatedConnectors[i] && updatedConnectors[i].connector);
                    j = (updatedConnector && updatedConnector.length);

                    if (j && origConnector) {
                        while (j--) {
                            connectorItem = updatedConnector[j];
                            if (connectorItem) {
                                if (origConnector[j]) {
                                    extend2(origConnector[j], connectorItem._options);
                                }
                                else {
                                    origConnector[j] = connectorItem._options
                                }
                            }
                        }
                    }
                }
            }
            //update labels
            //if any label added
            i = (updatedLabels && updatedLabels.length)
            if (i && updatedLabels) {
                while(i--){
                    if (updatedLabels[i]) {
                        origLabel[i] = updatedLabels[i];
                    }
                }
            }

            //update all deleted data
            deltend(origDataSets, cleanedData);
            deltend(origConnectors, cleanedConnectors);
            deltend(origLabel, cleanedLabels);

            state.hasStaleData = false;
            return (api.updatedDataObj = origChartData);
        },

        createHtmlDialog: function (chart, dialogWidth, dialogHeight,
                    onsubmit, oncancel, onremove) {
            var iapi = this,
            renderer = chart.renderer,
                conf = iapi.hcJSON[CONFIGKEY],
                inCanvasStyle = conf.inCanvasStyle,
                chartWidth = chart.chartWidth,
                chartHeight = chart.chartHeight,
                padding = 5,
                buttonStyle = {
                    color: inCanvasStyle.color,
                    textAlign: 'center',
                    paddingTop: 1 + PX,
                    border: '1px solid #cccccc',
                    borderRadius: 4 + PX,
                    cursor: 'pointer',
                    '_cursor': 'hand',
                    backgroundColor: '#ffffff',
                    zIndex: 21,
                    '-webkit-border-radius': 4 + PX
                },
                ui;
            ui = renderer.html('div', {
                fill: 'transparent',
                width: chartWidth,
                height: chartHeight
            }, {
                fontSize: 10 + PX,
                lineHeight: 15 + PX,
                fontFamily: inCanvasStyle.fontFamily
            }, chart.container);

            ui.veil = renderer.html('div', {
                fill: '000000',
                width: chartWidth,
                height: chartHeight,
                opacity: 0.3
            }, undefined, ui);

            ui.dialog = renderer.html('div', {
                x: (chartWidth - dialogWidth) / 2,
                y: (chartHeight - dialogHeight) / 2,
                fill: 'efefef',
                strokeWidth: 1,
                stroke: '000000',
                width: dialogWidth,
                height: dialogHeight
            }, {
                borderRadius: 5 + PX,
                boxShadow: '1px 1px 3px #000000',
                '-webkit-border-radius': 5 + PX,
                '-webkit-box-shadow': '1px 1px 3px #000000',
                '-ms-filter': "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#000000')",
                filter: "progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color='#000000')"
            }, ui);

            ui.ok = renderer.html('div', {
                x: dialogWidth - 70 - padding,
                y: dialogHeight - 23 - padding,
                width: 65,
                height: 17,
                text: 'Submit',
                tabIndex: 1
            }, buttonStyle, ui.dialog)
            .on('click', onsubmit);

            ui.cancel = renderer.html('div', {
                x: dialogWidth - 140 - padding,
                y: dialogHeight - 23 - padding,
                width: 65,
                height: 17,
                text: 'Cancel',
                tabIndex: 2
            }, buttonStyle, ui.dialog).on('click', oncancel);

            ui.remove = renderer.html('div', {
                x: dialogWidth - 210 - padding,
                y: dialogHeight - 23 - padding,
                width: 65,
                height: 17,
                text: 'Delete',
                tabIndex: 3,
                visibility: 'hidden'
            }, buttonStyle, ui.dialog).on('click', onremove);

            // Add an event that would handle enter and esc on input
            // elements
            ui.handleKeyPress = function (e) {
                if (e.keyCode === 13) {
                    ui.ok.jqe.trigger(hasTouch ? 'touchStart' : 'click', e)
                }
                else if (e.keyCode === 27) {
                    ui.cancel.jqe.trigger(hasTouch ? 'touchStart' : 'click', e)
                }
            };

            // Keep initially hidden.
            ui.hide();

            return ui;
        },

        nodeUpdateUIDefinition: [
            {
                key: 'id',
                text: 'Id',
                inputWidth: 60,
                x: 10, y: 15
            },
            {
                key: 'dataset',
                text: 'Dataset',
                inputType: 'select',
                inputWidth: 110,
                innerHTML : undefined,
                x: 170, y: 15
            },
            {
                key: 'x',
                text: 'Value',
                x: 10, y: 40,
                inputWidth: 21
            },
            {
                key: 'y',
                text: ',',
                x: 88, y: 40,
                inputWidth: 21,
                labelWidth: 5
            },
            {
                text: '(x, y)',
                x: 125, y: 40,
                labelWidth: 33,
                noInput: true
            },
            {
                key: 'tooltip',
                text: 'Tooltip',
                inputWidth: 105,
                x: 170, y: 40
            },
            {
                key: 'label',
                text: 'Label',
                inputWidth: 92,
                x: 10, y: 65
            },
            {
                key: 'labelalign',
                text: 'Align',
                labelWidth: 70,
                inputWidth: 110,
                inputType: 'select',
                innerHTML: '<option></option><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option>',
                x: 145, y: 63
            },
            {
                key: 'color',
                text: 'Color',
                x: 10, y: 90,
                inputWidth: 60
            },
            {
                key: 'color_out',
                innerHTML: '&nbsp;',
                x: 85, y: 90,
                inputWidth: 15,
                inputType: 'span'
            },
            {
                key: 'alpha',
                text: 'Alpha',
                x: 170, y: 90,
                inputWidth: 20
            },
            {
                key: 'draggable',
                text: 'Allow Drag',
                value: true,
                inputWidth: 20,
                x: 250, y: 90,
                labelWidth: 58,
                inputPaddingTop: 3,
                type: 'checkbox'
            },
            {
                key: 'shape',
                text: 'Shape',
                inputType: 'select',
                inputWidth: 97,
                innerHTML: '<option value="rect">Rectangle</option><option value="circ">Circle</option><option value="poly">Polygon</option>',
                x: 10, y: 115
            },
            {
                key: 'rect_height',
                text: 'Height',
                x: 170, y: 115,
                inputWidth: 20
            },
            {
                key: 'rect_width',
                text: 'Width',
                x: 255, y: 115,
                inputWidth: 20
            },
            {
                key: 'circ_poly_radius',
                text: 'Radius',
                x: 170, y: 115,
                inputWidth: 20
            },
            {
                key: 'poly_sides',
                text: 'Sides',
                x: 255, y: 115,
                inputWidth: 20
            },
            {
                key: 'link',
                text: 'Link',
                x: 10, y: 140,
                inputWidth: 92
            },
            {
                key: 'image',
                text: 'Image',
                type: 'checkbox',
                inputPaddingTop: 4,
                inputWidth: 20,
                x: 10, y: 170
            },
            {
                key: 'img_url',
                text: 'URL',
                inputWidth: 105,
                x: 170, y: 170
            },
            {
                key: 'img_width',
                text: 'Width',
                inputWidth: 20,
                x: 10, y: 195
            },
            {
                key: 'img_height',
                text: 'Height',
                inputWidth: 20,
                x: 82, y: 195
            },
            {
                key: 'img_align',
                text: 'Align',
                inputType: 'select',
                inputWidth: 75,
                innerHTML: '<option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option>',
                x: 170, y: 195
            }
        ],


        showNodeUpdateUI: (function () {
            var manageShapeFields = function (chart) {
                var ui = chart.cacheUpdateUI,
                fields = ui.fields,
                ele = fields['shape'],
                shapeFields = ['rect_width', 'rect_height', 'circ_poly_radius',
                'poly_sides'],
                i = shapeFields.length,
                key;

                while (i--) {
                    key = shapeFields[i];
                    if (/rect_|poly_|circ_/.test(key)) {
                        ui.labels[key].hide();
                        ui.fields[key].hide();
                    }
                    if (new RegExp(ele.val()).test(key)) {
                        ui.labels[key].show();
                        ui.fields[key].show();
                    }
                }
            },
            showGivenColor = function (chart) {
                var ui = chart.cacheUpdateUI,
                fields = ui.fields,
                color = getValidColor(fields['color'].val());

                color && fields['color_out'].css({
                    background: parseColor(color)
                });
            },
            manageImageFields = function (chart, animate) {
                var ui = chart.cacheUpdateUI,
                fields = ui.fields,
                ele = fields['image'],
                chartHeight = chart.chartHeight,
                padding = 5,
                isChecked = ele.val(),
                animation = animate ? 300 : 0,
                imgKey = ['img_width', 'img_height', 'img_align', 'img_url'],
                dialogHeight,
                i,
                key;

                dialogHeight = isChecked ? 250 : 215;

                ui.ok.hide();
                ui.cancel.hide();
                ui.remove.hide();
                ui.error.hide();
                i = imgKey.length;
                while (!isChecked && i--) {
                    key = imgKey[i];
                    ui.labels[key].hide();
                    ui.fields[key].hide();
                }

                ui.dialog.jqe.animate({
                    top: (chartHeight - dialogHeight) / 2,
                    height: dialogHeight
                }, animation, function () {
                    i = imgKey.length;
                    while (i-- && isChecked) {
                        key = imgKey[i];
                        ui.labels[key].show();
                        ui.fields[key].show();
                    };
                    ui.ok.attr({
                        y: dialogHeight - 23 - padding
                    }).show();
                    ui.cancel.attr({
                        y: dialogHeight - 23 - padding
                    }).show();
                     ui.remove.attr({
                        y: dialogHeight - 23 - padding
                    });
                    ui.error.attr({
                        y: dialogHeight - 23 - padding + 4
                    }).show();
                    if (ui.edit) {
                        ui.remove.show();
                    } else {
                        ui.remove.hide();
                    }
                });
            };

            return function (chart, config, edit) {
                var iapi = this,
                ui = chart.cacheUpdateUI,
                conf = iapi.hcJSON[CONFIGKEY],
                inCanvasStyle = conf.inCanvasStyle,
                renderer = chart.renderer,
                borderStyle = '1px solid #cccccc',
                inputStyle = {
                    width: 80 + PX,
                    border: borderStyle,
                    fontSize: 10 + PX,
                    lineHeight: 15 + PX,
                    padding: 2 + PX,
                    fontFamily: inCanvasStyle.fontFamily
                },
                i = 0,
                labelStyle = {
                    textAlign: 'right'
                },
                fields = ui && ui.fields,
                labels = ui && ui.labels,
                dialog;

                if (!ui) {
                    ui = chart.cacheUpdateUI = iapi.createHtmlDialog(chart,
                        350, 215,
                        //submit function
                        function () {
                            var fields = ui && ui.fields,
                            edit = ui.edit,
                            chartInstance = iapi.chartInstance,
                            hcJSON = iapi.hcJSON,
                            xMin = hcJSON.xAxis.min,
                            yMin = hcJSON.yAxis[0].min,
                            series = hcJSON.series,
                            sLn = series.length,
                            idFound,
                            j,
                            id,
                            data,
                            dataLn,
                            submitObj,
                            shapeType;

                            if (fields) {
                                switch (fields.shape.val()) {
                                    case 'circ':
                                        shapeType = 'circle';
                                        break;
                                    case 'poly':
                                        shapeType = 'polygon';
                                        break;
                                    default :
                                        shapeType = 'rectangle';
                                        break;
                                }

                                submitObj = {
                                    x: getFirstValue(fields.x.val(), xMin),
                                    y: getFirstValue(fields.y.val(), yMin),
                                    id: id = fields.id.val(),
                                    datasetId: fields.dataset.val(),
                                    name: fields.label.val(),
                                    tooltext: fields.tooltip.val(),
                                    color: fields.color.val(),
                                    alpha: fields.alpha.val(),
                                    labelalign: fields.labelalign.val(),
                                    allowdrag: fields.draggable.val(),
                                    shape: shapeType,
                                    width: fields.rect_width.val(),
                                    height: fields.rect_height.val(),
                                    radius: fields.circ_poly_radius.val(),
                                    numsides: fields.poly_sides.val(),
                                    imagenode: fields.image.val(),
                                    imagewidth: fields.img_width.val(),
                                    imageheight: fields.img_height.val(),
                                    imagealign: fields.img_align.val(),
                                    imageurl: fields.img_url.val(),
                                    link: fields.link.val()
                                };

                                // Validating ID already exist or not
                                if (id !== undefined && !edit) {
                                    for (i = 0; i < sLn && !idFound; i += 1) {
                                        data = series[i].data;
                                        dataLn = data.length;
                                        for (j = 0; j < dataLn; j += 1) {
                                            if (id === data[j].id) {
                                                idFound = true;
                                            }
                                        }
                                    }
                                }

                                if (!idFound) {
                                    edit ? (chartInstance && chartInstance.setNodeAttribute &&
                                        chartInstance.setNodeAttribute(submitObj.id, submitObj))
                                    : (chartInstance && chartInstance.addNode &&
                                        chartInstance.addNode(submitObj));
                                    return;
                                }
                                else {
                                    ui.error.attr({
                                        text: 'ID already exist.'
                                    });
                                    fields.label.jqe.focus();
                                }
                            }
                            // Remobe disabled from attr
                            ui.enableFields()
                        },
                        // Cancel function
                        function () {
                            // Hide the UI
                            ui.hide();
                            // Remobe disabled from attr
                            ui.enableFields()
                            // Hide error msg
                            ui.error.attr({
                                text: BLANK
                            });
                        },
                        // Delete function
                        function () {
                            iapi.chartInstance.deleteNode &&
                                iapi.chartInstance.deleteNode(ui.fields.id.val())
                        });
                    // add fields.
                    dialog = ui.dialog;
                    labels = ui.labels = {};
                    fields = ui.fields = {};
                }
                ui.config = config;
                ui.edit = edit;
                if (!ui.error) {
                    ui.error = renderer.html('span', {
                        color: 'ff0000',
                        x: 30, y: 228
                    }, undefined, dialog);
                }
                if (!ui.enableFields) {
                    ui.enableFields = function () {
                        var key;
                        for (key in config) {
                            if (config[key] && config[key].disabled && fields[key]) {
                                fields[key].jqe.removeAttr('disabled');
                            }
                        }
                    };
                }

                each(this.nodeUpdateUIDefinition, function (def) {
                    var field,
                    key = def.key,
                    attrs = {},
                    confObj = config[key] || {},
                    innerHTML,
                    value;

                    !labels[key] && (labels[key] = renderer.html('label', {
                        x: def.x,
                        y: def.y,
                        width: def.labelWidth || 45,
                        text: def.text
                    }, labelStyle, dialog));


                    // No need to proceed of this label has no input box
                    // associated with itself.
                    if (def.noInput) {
                        return;
                    }

                    field = fields[key];

                    if (!field) {
                        inputStyle.border = def.type == 'checkbox' ? BLANK : borderStyle;
                        field = fields[key] =
                        renderer.html(def.inputType || 'input', {
                            x: def.labelWidth && (def.labelWidth + 5) || 50,
                            y: -2 + (def.inputPaddingTop || 0),
                            width: def.inputWidth || 50
                        }, inputStyle);

                        if (def.inputType !== 'select') {
                            field.attr({
                                type: def.type || 'text'
                            }).on('keyup', ui.handleKeyPress);
                        }
                        field.add(labels[key]);
                    }


                    if (defined(innerHTML = getFirstValue(confObj.innerHTML, def.innerHTML))) {
                        attrs.innerHTML = innerHTML;
                    }
                    if (confObj.disabled) {
                        attrs.disabled = 'disabled';
                    }
                    field.attr(attrs);
                    if (defined(value = getFirstValue(confObj.value, def.value))) {
                        field.val(value);
                    }

                    key == 'shape' && field.on('change', function () {
                        manageShapeFields(chart);
                    });
                    key == 'image' && field.on('click', function () {
                        manageImageFields(chart, true);
                    });
                    key == 'color' && field.bind('keyup', function () {
                        showGivenColor(chart);
                    });
                });

                showGivenColor(chart);
                manageImageFields(chart);
                manageShapeFields(chart);
                if (chart.animation) {
                    ui.jqe.fadeIn('fast');
                }
                else {
                    ui.show();
                }
                ui.fields[edit ? 'label' : 'id'].jqe.focus();
            }
        })(),

        labelUpdateUIDefinition: [
            {
                key: 'label',
                text: 'Label*',
                x: 10, y: 15,
                inputWidth: 235
            },
            {
                key: 'size',
                text: 'Size',
                x: 10, y: 40
            },
            {
                key: 'padding',
                text: 'Padding',
                x: 10, y: 65
            },
            {
                key: 'x',
                text: 'Position',
                x: 120, y: 65,
                labelWidth: 70,
                inputWidth: 25
            },
            {
                key: 'y',
                text: ',',
                x: 225, y: 65,
                labelWidth: 10,
                inputWidth: 25
            },
            {
                key: 'xy',
                text: '(x, y)',
                x: 260, y: 65,
                noInput: true
            },
            {
                key: 'allowdrag',
                text: 'Allow Drag',
                x: 120, y: 40,
                inputType: 'checkbox',
                inputPaddingTop: 3,
                inputWidth: 15,
                labelWidth: 70,
                val: 1
            },
            {
                key: 'color',
                text: 'Color',
                x: 10, y: 90
            },
            {
                key: 'alpha',
                text: 'Alpha',
                x: 145, y: 90,
                inputWidth: 30,
                val: '100'
            },
            {
                key: 'bordercolor',
                text: 'Border Color',
                x: 10, y: 125,
                labelWidth: 100
            },
            {
                key: 'bgcolor',
                text: 'Background Color',
                x: 10, y: 150,
                labelWidth: 100
            }
        ],

        showLabelUpdateUI: function (chart, options) {
            var iapi = this,
                renderer = chart.renderer,
                conf = iapi.hcJSON[CONFIGKEY],
                inCanvasStyle = conf.inCanvasStyle,
                ui = chart.cacheLabelUpdateUI,
                inputStyle = {
                    border: '1px solid #cccccc',
                    fontSize: 10 + PX,
                    lineHeight: 15 + PX,
                    fontFamily: inCanvasStyle.fontFamily,
                    padding: 2 + PX
                },
                labelStyle = {
                    textAlign: 'right'
                },
                fields = ui && ui.fields,
                labels = ui && ui.labels,
                field,
                value,
                dialog;

            if (!ui) {
                ui = chart.cacheLabelUpdateUI = iapi.createHtmlDialog(chart,
                    315, 205, function () {
                        var fields = ui && ui.fields,
                        submitObj;
                        if (fields) {
                            // Prepare obbject for submission.
                            submitObj = {
                                text: fields.label.val(),
                                x: fields.x.val(),
                                y: fields.y.val(),
                                color: fields.color.val(),
                                alpha: fields.alpha.val(),
                                bgcolor: fields.bgcolor.val(),
                                bordercolor: fields.bordercolor.val(),
                                fontsize: fields.size.val(),
                                allowdrag: fields.allowdrag.val(),
                                padding: fields.padding.val()
                            };

                            if (submitObj.text) {
                                iapi.chartInstance && iapi.chartInstance.addLabel &&
                                    iapi.chartInstance.addLabel(submitObj);
                                return;
                            }
                            else {
                                ui.error.attr({
                                    text: 'Label cannot be blank.'
                                });
                                fields.label.jqe.focus();

                            }
                        }
                    }, function () {
                        ui.error.attr({
                            text: ''
                        });
                        ui.hide();
                    });
                dialog = ui.dialog;
                labels = ui.labels = {};
                fields = ui.fields = {};
            }

            each(iapi.labelUpdateUIDefinition, function (def) {
                var key = def.key;

                if (!labels[key]) {
                    labels[key] = renderer.html(LABEL, {
                        x: def.x,
                        y: def.y,
                        width: def.labelWidth || 45,
                        text: def.text
                    }, labelStyle, dialog);
                }

                // No need to proceed of this label has no input box
                // associated with itself.
                if (def.noInput) {
                    return;
                }

                if (!(field = fields[key])) {
                    field = fields[key] = renderer.html(INPUT, {
                        y: -2 + (def.inputPaddingTop || 0),
                        x: def.labelWidth && (def.labelWidth + 5) || 50,
                        width: def.inputWidth || 50,
                        type: def.inputType || 'text'
                    }, inputStyle, labels[key]).on('keyup', ui.handleKeyPress);
                }

                if ((value = pluck(options[key], def.val)) !== undefined) {
                    field.val(value);
                }

            });

            if (!ui.error) {
                ui.error = renderer.html('span', {
                    color: 'ff0000',
                    x: 10, y: 180
                }, undefined, dialog);
            }

            // Show the dialog box
            if (chart.animation) {
                ui.jqe.fadeIn('fast');
            }
            else {
                ui.show();
            }
            // Focus on label textbox
            ui.fields.label.jqe.focus();
        },

        showLabelDeleteUI: function (chart, label) {
            var iapi = this,
                renderer = chart.renderer,
                ui = chart['cache-label-delete-ui'];

            if (!ui) {
                ui = chart['cache-label-delete-ui'] =
                    iapi.createHtmlDialog(chart, 250, 100, undefined, function () {
                        ui.hide();
                    },
                    function () {
                        iapi.chartInstance.deleteLabel(label.index);
                    });

                // create a location where to show the text message
                ui.message = renderer.html('span', {
                    x: 10, y: 10,
                    width: 230, height: 80
                }).add(ui.dialog);
                // since submit button is not needed, hide it and move the
                // delete button to its place.
                ui.ok.hide();
                ui.remove.translate(175).show();
            }

            // Update the message with proper text.
            ui.message.jqe.text('Would you really like to delete the label: \"' +
                        label.textStr + '\"?');

            // Show the dialog box
            if (chart.animation) {
                ui.jqe.fadeIn('fast');
            }
            else {
                ui.show();
            }
        },

        connectorUpdateUIDefinition: [
            {
                key: 'fromid',
                text: 'Connect From',
                inputType: 'select',
                x: 10, y: 15,
                labelWidth: 80,
                inputWidth: 100
            },
            {
                key: 'toid',
                text: 'Connect To',
                inputType: 'select',
                x: 10, y: 40,
                labelWidth: 80,
                inputWidth: 100
            },
            {
                key: 'arratstart',
                text: 'Arrow At Start',
                x: 200, y: 15,
                type: 'checkbox',
                inputPaddingTop: 3,
                labelWidth: 80,
                inputWidth: 15
            },
            {
                key: 'arratend',
                text: 'Arrow At End',
                x: 200, y: 40,
                type: 'checkbox',
                inputPaddingTop: 3,
                labelWidth: 80,
                inputWidth: 15
            },
            {
                key: 'label',
                text: 'Label',
                x: 10, y: 75,
                labelWidth: 40,
                inputWidth: 120
            },
            {
                key: 'id',
                text: 'Node ID',
                x: 190, y: 75,
                inputWidth: 55
            },
            {
                key: 'color',
                text: 'Color',
                x: 10, y: 100,
                labelWidth: 40,
                inputWidth: 35
            },
            {
                key: 'alpha',
                text: 'Alpha',
                x: 110, y: 100,
                inputWidth: 25,
                labelWidth: 35
            },
            {
                key: 'strength',
                text: 'Strength',
                x: 190, y: 100,
                inputWidth: 55,
                val: '0.1'
            },
            {
                key: 'url',
                text: 'Link',
                x: 10, y: 125,
                labelWidth: 40,
                inputWidth: 240
            },
            {
                key: 'dashed',
                text: 'Dashed',
                x: 10, y: 150,
                type: 'checkbox',
                inputPaddingTop: 3,
                inputWidth: 15,
                labelWidth: 40
            },
            {
                key: 'dashgap',
                text: 'Dash Gap',
                x: 85, y: 150,
                labelWidth: 60,
                inputWidth: 25
            },
            {
                key: 'dashlen',
                text: 'Dash Length',
                x: 190, y: 150,
                labelWidth: 70,
                inputWidth: 30
            }
        ],

        showConnectorUpdateUI: function (chart, config, edit) {
            var iapi = this,
                chartInstance = iapi.chartInstance,
                renderer = chart.renderer,
                conf = iapi.hcJSON[CONFIGKEY],
                inCanvasStyle = conf.inCanvasStyle,
                ui = chart.cacheConnectorUpdateUI,
                inputStyle = {
                    border: '1px solid #cccccc',
                    fontSize: 10 + PX,
                    lineHeight: 15 + PX,
                    fontFamily: inCanvasStyle.fontFamily,
                    padding: 2 + PX
                },
                labelStyle = {
                    textAlign: 'right'
                },
                fields = ui && ui.fields,
                labels = ui && ui.labels,
                innerHTML,
                field,
                value,
                dialog;

            if (!ui) {
                ui = chart.cacheConnectorUpdateUI = iapi.createHtmlDialog(chart,
                    315, 215,
                    function () {
                        var fields = ui && ui.fields,
                            submitObj;
                        if (fields) {
                            submitObj = {
                                from: fields.fromid.val(),
                                to: fields.toid.val(),
                                id: fields.id.val(),
                                label: fields.label.val(),
                                color: fields.color.val(),
                                alpha: fields.alpha.val(),
                                link: fields.url.val(),
                                strength: fields.strength.val(),
                                arrowatstart: fields.arratstart.val(),
                                arrowatend: fields.arratend.val(),
                                dashed: fields.dashed.val(),
                                dashlen: fields.dashlen.val(),
                                dashgap: fields.dashgap.val()
                            };

                            // Validate
                            if (submitObj.from) {
                                if (submitObj.to) {
                                    if (submitObj.from != submitObj.to) {
                                        edit ? chartInstance.editConnector(submitObj.id, submitObj) :
                                            chartInstance.addConnector(submitObj);
                                        ui.enableFields();
                                        return;
                                    }
                                    else {
                                        ui.error.attr({
                                            text: 'Connector cannot start and end at the same node!'
                                        });
                                        fields.fromid.jqe.focus();
                                    }
                                }
                                else {
                                    ui.error.attr({
                                        text: 'Please select a valid connector end.'
                                    });
                                    fields.toid.jqe.focus();
                                }
                            }
                            else {
                                ui.error.attr({
                                    text: 'Please select a valid connector start.'
                                });
                                fields.fromid.jqe.focus();
                            }
                        }
                    },
                    // Cancel function
                    function () {
                        ui.error.attr({
                            text: ''
                        });
                        ui.enableFields();
                        ui.hide();
                    },
                    // Delete function
                    function () {
                        chartInstance.deleteConnector(ui.fields.id.val());
                    });
                dialog = ui.dialog;
                labels = ui.labels = {};
                fields = ui.fields = {};
            }

            ui.config = config;
            ui.enableFields = function () {
                var key;
                for (key in config) {
                    if (config[key] && config[key].disabled && fields[key]) {
                        fields[key].jqe.removeAttr('disabled');
                    }
                }
            };



            each(iapi.connectorUpdateUIDefinition, function (def) {
                var key = def.key,
                attr = config[key] || {};

                if (!labels[key]) {
                    labels[key] = renderer.html(LABEL, {
                        x: def.x,
                        y: def.y,
                        width: def.labelWidth || 45,
                        text: def.text
                    }, labelStyle, dialog);
                }

                // No need to proceed of this label has no input box
                // associated with itself.
                if (def.noInput) {
                    return;
                }

                if (!(field = fields[key])) {
                    field = fields[key] = renderer.html(def.inputType || INPUT, {
                        y: -2 + (def.inputPaddingTop || 0),
                        x: def.labelWidth && (def.labelWidth + 5) || 50,
                        width: def.inputWidth || 50
                    }, inputStyle);

                    if (def.inputType !== 'select') {
                        field.attr({
                            type: def.type || 'text'
                        }).on('keyup', ui.handleKeyPress);
                    }
                    field.add(labels[key]);
                }

                if ((innerHTML = pluck(attr.innerHTML, def.innerHTML))) {
                    field.attr({
                        innerHTML: innerHTML
                    });
                }
                if ((value = pluck(attr.val, def.val)) !== undefined) {
                    field.val(value);
                }
                if (attr.disabled) {
                    field.attr({
                        disabled: 'disabled'
                    });
                }
            });

            //dash checking and ui modification
            //call to set default fro the first time
            (ui.checkDash = function () {
                var checked = fields.dashed && fields.dashed.val(),
                showHideFn = checked ? 'show' : 'hide';
                labels.dashgap && labels.dashgap[showHideFn]();
                fields.dashgap && fields.dashgap[showHideFn]();
                labels.dashlen && labels.dashlen[showHideFn]();
                fields.dashlen && fields.dashlen[showHideFn]();
            })();
            fields.dashed.on('click', ui.checkDash)

            if (!ui.error) {
                ui.error = renderer.html('span', {
                    color: 'ff0000',
                    x: 10,
                    y: 170
                }, undefined, dialog);
            }


            ui.remove[edit ? 'show' : 'hide']();
            // Show the dialog box
            if (chart.animation) {
                ui.jqe.fadeIn('fast');
            }
            else {
                ui.show();
            }
        },

        drawNodeUpdateButtons: function (chart, iapi) {
            var hc = iapi.hcJSON,
                chartDef = hc.chart,
                pointStore = chart.pointStore || {},
                connectorsStore = chart.connectorsStore || [],
                seriesArr = chart.series,
                len = seriesArr.length,
                str1 = '<option value="',
                str2 = '">',
                str3 = '</option>',
                pointOptionsStr = '',
                seriesOptionsStr = '',
                options,
                seriesObj,
                i;

            for (i in pointStore) {
                pointOptionsStr += str1 + i + str2 + i + str3;
            }

            for (i = 0; i < len; i+=1) {
                seriesObj = seriesArr[i];
                options = seriesObj && seriesObj.options;
                seriesOptionsStr += str1 + options.id + str2 + (seriesObj.name
                    !== BLANK && seriesObj.name + COMMASTRING + BLANKSPACE || BLANK)
                + options.id + str3
            }

            chart.addButton({
                x: chartDef.spacingLeft,
                y: chart.chartHeight - chartDef.spacingBottom +
                    (!chartDef.showFormBtn && !chartDef.showRestoreBtn ? -15 : 10),
                align: 'left',
                symbol: 'configureIcon',
                tooltip: 'Add or edit items',
                menuId: 'node-update-menu',
                menuItems: [{
                    text: 'Add a Node',
                    onclick: function() {
                        iapi.showNodeUpdateUI(chart, {
                            dataset: {
                                innerHTML: seriesOptionsStr
                            }
                        });
                    }
                }, {
                    text: 'Add a Label',
                    onclick: function() {
                        iapi.showLabelUpdateUI(chart, {});
                    }
                }, {
                    text: 'Add a Connector',
                    onclick: function() {
                        //add a selection method for start and end
                        iapi.showConnectorUpdateUI(chart, {
                            fromid: {
                                innerHTML: pointOptionsStr
                            },
                            toid: {
                                innerHTML: pointOptionsStr
                            }
                        });
                    }
                }]
            });
        },

        postSeriesAddition: function () {
            var api = this,
                fc = api.dataObj,
                hc = api.hcJSON,
                chartAttr = fc.chart,
                result = api.base.postSeriesAddition &&
                    api.base.postSeriesAddition.apply(api, arguments);

            // Hide legend by default
            hc.legend.enabled = (chartAttr.showlegend == ONE) ?
                true : false;

            // Draw button to control manipulation of nodes, labels and
            // connectors.
            if (!pluckNumber(chartAttr.viewmode, 0)) {
                (hc.callbacks ||
                    (hc.callbacks = [])).push(api.drawNodeUpdateButtons);
            }

            return result;
        },

        point: function (chartName, series, dataset, FCChartObj, HCObj,
                catLength, seriesIndex) {

            var chartApi = this,
            conf = HCObj[CONFIGKEY],
                NumberFormatter = chartApi.numberFormatter,
                // Data array in dataset object
                data = dataset.data,
                dataLength = data && data.length,
                // showValues attribute in individual dataset
                datasetShowValues = pluckNumber(dataset.showvalues,
                        conf.showValues),
                useRoundEdges = pluckNumber(FCChartObj.useroundedges),
                hasValidPoint = false,
                itemValueY,
                itemValueX,
                index,
                dataObj,
                plotFillAlpha,
                showPlotBorder,
                plotBorderColor,
                plotBorderThickness,
                plotBorderAlpha,
                use3DLighting,
                datasetId,
                datasetColor,
                datasetAlpha,
                datasetShowPlotBorder,
                datasetPlotBorderColor,
                datasetPlotBorderThickness,
                datasetPlotBorderAlpha,
                datasetAllowDrag,
                UNDERSCORE = '_';

            //add z index so that the regration line set at the back of the series
            series.zIndex = 1;

            // Dataset seriesname
            series.name = getValidValue(dataset.seriesname);
            // dataset id
            datasetId = series.id = pluck(dataset.id, seriesIndex);

            // There is no dataset in data, we need to ignore the dataset.
            if (!dataset.data) {
                series.showInLegend = false;
                return series;
            }

            // If showInLegend set to false
            // We set series.name blank
            if (pluckNumber(dataset.includeinlegend) === 0 ||
                    series.name === undefined) {
                series.showInLegend = false;
            }


            //Plot Properties
            plotFillAlpha = pluck(FCChartObj.plotfillalpha, HUNDRED);
            showPlotBorder = pluckNumber(FCChartObj.showplotborder, 1);
            plotBorderColor = getFirstColor(pluck(FCChartObj.plotbordercolor, "666666"));
            plotBorderThickness = pluckNumber(FCChartObj.plotborderthickness,
                useRoundEdges ? 2 : 1);
            plotBorderAlpha = pluck(FCChartObj.plotborderalpha, FCChartObj.plotfillalpha, useRoundEdges ?
                '35' : '95');

            //Node Properties
            use3DLighting = Boolean(pluckNumber(FCChartObj.use3dlighting,
                FCChartObj.is3d, useRoundEdges ? 1 : 0));
            //Store attributes
            datasetColor = getFirstColor(pluck(dataset.color, HCObj.colors[seriesIndex % HCObj.colors.length]));
            datasetAlpha = pluck(dataset.plotfillalpha, dataset.nodeFillAlpha, dataset.alpha, plotFillAlpha);
            //Data set plot properties
            datasetShowPlotBorder = Boolean(pluckNumber(dataset.showplotborder, showPlotBorder));
            datasetPlotBorderColor = getFirstColor(pluck(dataset.plotbordercolor, dataset.nodebordercolor, plotBorderColor));
            datasetPlotBorderThickness = pluckNumber(dataset.plotborderthickness, dataset.nodeborderthickness, plotBorderThickness);
            datasetPlotBorderAlpha = (datasetShowPlotBorder) ? pluck(dataset.plotborderalpha, dataset.nodeborderalpha, dataset.alpha, plotBorderAlpha) : ZERO;
            //Drag Border properties
            datasetAllowDrag = Boolean(pluckNumber(dataset.allowdrag, 1));


            // Add marker to the series to draw the Legend
            series.marker = {
                enabled: true,
                fillColor: convertColor(datasetColor, datasetAlpha),
                lineColor: {
                    FCcolor: {
                        color: datasetPlotBorderColor,
                        alpha: datasetPlotBorderAlpha
                    }
                },
                lineWidth: datasetPlotBorderThickness,
                symbol: 'diamond'
            }

            var allowDrag, shape, height, width, radius, numSides,
            imageNode, color, setId, alpha, fillColor, shapeType,
            //create the data parser
            dataParser = series._dataParser = function (dataObj, index, itemValueX, itemValueY) {
                var setId = pluck(dataObj.id, (datasetId + UNDERSCORE + index)),
                    allowDrag = Boolean(pluckNumber(dataObj.allowdrag, datasetAllowDrag)),
                    shape = getValidValue(dataObj.shape, 'rectangle').toLowerCase(),
                    height = getValidValue(dataObj.height, 10),
                    width = getValidValue(dataObj.width, 10),
                    radius = getValidValue(dataObj.radius, 10),
                    numSides = getValidValue(dataObj.numsides, 4),
                    color = getFirstColor(pluck(dataObj.color, datasetColor)),
                    alpha = pluck(dataObj.alpha, datasetAlpha),
                    imageURL = getValidValue(dataObj.imageurl),
                    imageNode = Boolean(pluckNumber(dataObj.imagenode));

                    //If not required shape then set it to rectangle
                    switch (shape) {
                        case 'circle':
                            shapeType = 0;
                            break;
                        case 'polygon':
                            shapeType = 2;
                            shape = mapSymbolName(numSides);
                            break;
                        default :
                            shapeType = 1;
                            break;
                    }

                    if (use3DLighting) {
                        fillColor = chartApi.getPointColor(color, alpha, shapeType);
                    } else {
                        fillColor = convertColor(color, alpha);
                    }

                    // Finally add the data
                    // we call getPointStub function that manage displayValue, toolText and link
                   return extend2(chartApi.getPointStub(dataObj,
                        itemValueY, NumberFormatter.xAxis(itemValueX),
                        HCObj, dataset, datasetShowValues), {
                        _options: dataObj,
                        y: itemValueY,
                        x: itemValueX,
                        id: setId,
                        imageNode: imageNode,
                        imageURL: imageURL,
                        imageAlign: getValidValue(dataObj.imagealign, BLANK).toLowerCase(),
                        imageWidth: getValidValue(dataObj.imagewidth),
                        imageHeight: getValidValue(dataObj.imageheight),
                        labelAlign: pluck(dataObj.labelalign, imageNode &&
                            defined(imageURL) ? POSITION_TOP : POSITION_MIDDLE),
                        allowDrag: allowDrag,
                        marker: {
                            enabled: true,
                            fillColor: fillColor,
                            lineColor: {
                                FCcolor: {
                                    color: datasetPlotBorderColor,
                                    alpha: datasetPlotBorderAlpha
                                }
                            },
                            lineWidth: datasetPlotBorderThickness,
                            radius: radius,
                            height: height,
                            width: width,
                            symbol: shape
                        },
                        tooltipConstraint : chartApi.tooltipConstraint
                    });
            };

            // Iterate through all level data
            for (index = 0; index < dataLength; index += 1) {
                // Individual data obj
                // for further manipulation
                dataObj = data[index];
                if (dataObj) {
                    itemValueY = NumberFormatter.getCleanValue(dataObj.y);
                    itemValueX = NumberFormatter.getCleanValue(dataObj.x);

                    if (itemValueY === null) {
                        series.data.push({
                            _options: dataObj,
                            y: null
                        });
                    }
                    else {
                        hasValidPoint = true;
                        //push the point object
                        series.data.push(dataParser(dataObj, index, itemValueX, itemValueY));

                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                        this.pointValueWatcher(HCObj, itemValueY, itemValueX);
                    }
                }
            }

            // If all the values in current dataset is null we will not show
            // its legend.
            if (!hasValidPoint) {
                series.showInLegend = false;
            }

            return series;
        },
        // Function that produce the point color
        getPointColor : function (color, alpha, shapeType) {
            var colorObj, innerColor, outerColor;
            color = getFirstColor(color);
            alpha = getFirstAlpha(alpha);
            innerColor = getLightColor(color, 80);
            outerColor = getDarkColor(color, 65);
            colorObj = {
                FCcolor : {
                    gradientUnits : OBJECTBOUNDINGBOX,
                    color :  innerColor + COMMA + outerColor,
                    alpha : alpha + COMMA + alpha,
                    ratio : BGRATIOSTRING
                }
            };

            if (shapeType) {
                if (shapeType === 1) {
                    colorObj.FCcolor.angle = 0;
                }
                else {
                    colorObj.FCcolor.angle = 180;
                }
            }
            else{
                colorObj.FCcolor.cx = 0.4;
                colorObj.FCcolor.cy = 0.4;
                colorObj.FCcolor.r = '50%';
                colorObj.FCcolor.radialGradient = true;
            }

            return colorObj;
        },

        // Function to create tooltext for individual data points
        getPointStub: function (setObj, value, label, HCObj, dataset) {
            var conf = HCObj[CONFIGKEY],
                formatedVal = (value === null ?
                        value : conf.numberFormatter.dataLabels(value)),
                setTooltext = getValidValue(parseUnsafeString(setObj.tooltext)),
                tooltipSepChar = this.tooltipSepChar = conf.tooltipSepChar,
                seriesname,
                toolTextStr = BLANK,
                isUserTooltip = false,
                toolText,
                displayValue,
                dataLink,
                labelText;

            //create the tooltext
            if (!conf.showTooltip) {
                toolText = false;
            }

            // if tooltext is given in data object
            else if (setTooltext !== undefined) {
                toolText = setTooltext;
                isUserTooltip = true;
            }
            else if (getValidValue(setObj.name) !== undefined) {
                toolText = parseUnsafeString(getValidValue(setObj.name, BLANK));
                isUserTooltip = true;
            }
            else {//determine the tooltext then
                if (formatedVal === null) {
                    toolText = false;
                } else {
                    if (conf.seriesNameInToolTip) {
                        seriesname = getFirstValue(dataset && dataset.seriesname);
                    }
                    toolText = toolTextStr = seriesname ? seriesname + tooltipSepChar : BLANK;
                    toolText += label ? label + tooltipSepChar : BLANK;
                    toolText += formatedVal;
                }
            }

            labelText = parseUnsafeString(pluck(setObj.name, setObj.label));

            //create the displayvalue
            displayValue = labelText;

            ////create the link
            dataLink = pluck(setObj.link);

            return {
                displayValue : displayValue,
                toolText : toolText,
                link: dataLink,
                _toolTextStr: toolTextStr,
                _isUserTooltip: isUserTooltip
            };
        },

        //----  Parse the connector attributes  ----//
        connector: function (chartName, connectors, connectorsObj, FCChartObj,
                HCObj, catLength, seriesIndex) {
            var conf = HCObj[CONFIGKEY],
                smartLabel = conf.smartLabel,
                connector = connectorsObj.connector,
                length = connector && connector.length,
                stdThickness,
                conColor,
                conAlpha,
                conDashGap,
                conDashLen,
                conDashed,
                arrowAtStart,
                arrowAtEnd,
                conStrength,
                index,
                connectorObj,
                seriesConnector,
                connectorLabel,
                setConColor,
                setConAlpha,
                labelTextObj,
                parser;

            //Extract attributes of this node.
            stdThickness = pluckNumber(connectorsObj.stdthickness, 1);
            conColor = getFirstColor(pluck(connectorsObj.color, 'FF5904'));
            conAlpha = pluck(connectorsObj.alpha, HUNDRED);
            conDashGap = pluckNumber(connectorsObj.dashgap, 5);
            conDashLen = pluckNumber(connectorsObj.dashlen, 5);
            conDashed = Boolean(pluckNumber(connectorsObj.dashed, 0));
            arrowAtStart = Boolean(pluckNumber(connectorsObj.arrowatstart, 1));
            arrowAtEnd = Boolean(pluckNumber(connectorsObj.arrowatend, 1));
            conStrength = pluckNumber(connectorsObj.strength, 1);

            seriesConnector = connectors.connector;

            parser = connectors._connectorParser = function (connectorObj, index) {

                //connector label.
                connectorLabel = parseUnsafeString(pluck(connectorObj.label, connectorObj.name));
                setConAlpha = pluck(connectorObj.alpha, conAlpha);
                //setConColor = convertColor(getFirstColor(pluck(connectorObj.color, conColor)), setConAlpha);
                setConColor = {
                    FCcolor : {
                        color: getFirstColor(pluck(connectorObj.color, conColor)),
                        alpha: setConAlpha
                    }
                };
                labelTextObj = smartLabel.getOriSize(connectorLabel);


                return {
                    _options: connectorObj,
                    id: pluck(connectorObj.id, index).toString(),
                    from: pluck(connectorObj.from, BLANK),
                    to: pluck(connectorObj.to, BLANK),
                    label: connectorLabel,
                    color: setConColor,
                    dashStyle: Boolean(pluckNumber(connectorObj.dashed, conDashed)) ?
                        getDashStyle(pluckNumber(connectorObj.dashlen, conDashLen),
                        pluckNumber(connectorObj.dashgap, conDashGap), stdThickness) : undefined,
                    arrowAtStart: Boolean(pluckNumber(connectorObj.arrowatstart, arrowAtStart)),
                    arrowAtEnd: Boolean(pluckNumber(connectorObj.arrowatend, arrowAtEnd)),
                    conStrength: pluckNumber(connectorObj.strength, conStrength),
                    connectorLink: getValidValue(connectorObj.link),
                    stdThickness: stdThickness,
                    labelWidth: labelTextObj.widht,
                    labelHeight: labelTextObj.height
                };
            };

            for (index = 0; index < length; index += 1) {
                seriesConnector.push(parser(connector[index], index));
            }

            return connectors;
        },

        series : function (fc, HCObj, chartName) {
            var conf = HCObj[CONFIGKEY],
            connectorsArr = [],
            connectorCount,
            connectors,
            datasetLength,
            seriesArr,
            series,
            length,
            index;

            //enable the legend
            HCObj.legend.enabled = Boolean(pluckNumber(fc.chart.showlegend, 1));

            if (fc.dataset && (datasetLength = fc.dataset.length) > 0) {
                // add category
                this.categoryAdder(fc, HCObj);
                //remove xaxis auto numeric labels
                conf.x.requiredAutoNumericLabels = false;

                //add connectors
                if (fc.connectors && (connectorCount = fc.connectors.length)) {
                    for (index = 0, length = connectorCount; index < length; index += 1) {
                        connectors = {
                            connector : []
                        };

                        connectorsArr.push(this.connector(chartName, connectors,
                            fc.connectors[index], fc.chart, HCObj, conf.oriCatTmp.length,
                            index));
                    }
                }

                //add data series
                for (index = 0; index < datasetLength; index += 1) {
                    series = {
                        data : []
                    };
                    //add data to the series
                    seriesArr = this.point(chartName, series,
                        fc.dataset[index], fc.chart, HCObj, conf.oriCatTmp.length,
                        index);


                    //if the returned series is an array of series (case: pareto)
                    if (seriesArr instanceof Array) {
                        HCObj.series = HCObj.series.concat(seriesArr)
                    }
                    //all other case there will be only1 series
                    else {
                        HCObj.series.push(seriesArr);
                    }
                }

                HCObj.connectors = connectorsArr;

                //add all labels
                if (fc.labels && fc.labels.label && fc.labels.label.length > 0) {
                    HCObj.dragableLabels = fc.labels.label
                }

                ///configure the axis
                this.configureAxis(HCObj, fc);
                ///////////Trend-lines /////////////////
                if (fc.trendlines) {
                    createTrendLine (fc.trendlines, HCObj.yAxis, conf,
                        false, this.isBar);
                }

            }
        }
    }, chartAPI.scatterbase);



    /**
     * Drag Node Series
     */
    // 1 - Set default options


    ///function to add the arrow point
    function drawArrow (X1, Y1, X2, Y2, R, H) {
        var tanganent = (Y1 - Y2) / (X1 - X2),
        angle = math.atan(tanganent),
        PX, PY, RHlf, HHlf,
        arr = [];


        //make all angle as positive
        if (angle < 0) {
            angle = (2 * math.PI) + angle
        }
        if (Y2 > Y1) {///PI >angle > 0
            if ((X2 >= X1 && angle > math.PI) || (X2 < X1 && angle > math.PI)) {
                angle = angle - math.PI;
            }
        }
        else {/// PI <= angle < 360 || angle == 0
            //angle may not be 360 in that case it will be 0 as atan work
            if ((X2 >= X1 && angle < math.PI && angle != 0) || (X2 < X1 && angle < math.PI)) {
                angle = angle + math.PI;
            }
        }

        if (typeof H == 'undefined') {
            ///arrow start point
            PX = X1 + (R * mathCos(angle));
            PY = Y1 + (R * mathSin(angle));
        }
        else {///rectangle
            RHlf = mathAbs(R) / 2;
            HHlf = mathAbs(H) / 2;

            //asume it will intersect a vertical side
            PX = X1 + (RHlf = X1 < X2 ? RHlf : -RHlf);
            PY = Y1 + (RHlf * math.tan(angle));
            //validate PY
            //if not validate then it will cross the horizontal axis
            if (mathAbs(Y1 - PY) > mathAbs(HHlf)) {
                PY = Y1 + (HHlf = Y1 < Y2 ? HHlf : -HHlf);
                PX = X1 + (HHlf / math.tan(angle));
            }
        }

        arr.push(L, PX, PY,
            ///arrowone half
            PX + (10 * mathCos(angle + 0.79)),
            PY + (10 * mathSin(angle + 0.79)),
            ///arrowone half
            M, PX + (10 * mathCos(angle - 0.79)),
            PY + (10 * mathSin(angle - 0.79)),
            //return to th eedege
            L, PX, PY);

        return arr;
    }



    // store the points by its point id.
    // define the connector class
    var connectorClass = function (connectorOptions, pointStore, style, renderer, connectorsGroup, chart) {
        var connector = this,
            iapi = chart.options.instanceAPI,
            fromId = connectorOptions.from,
            toId = connectorOptions.to,
            strokeWidth, color, textBgColor, dashstyle,
            fromPointObj = pointStore[fromId],
            toPointObj = pointStore[toId],
            fromX, fromY, toX, toY, label,
            CLICK_DELAY = 800,
            downTimer,
            mouseOut,
            mouseDown,
            clickFN;

        connector.renderer = renderer;
        connector.connectorsGroup = connectorsGroup;
        connector.pointStore = pointStore;
        connector.options = connectorOptions;
        connector.style = style || {};
        if (fromPointObj && toPointObj) {
            connector.fromPointObj = fromPointObj;
            connector.toPointObj = toPointObj;
            connector.fromX = fromX = fromPointObj.plotX;
            connector.fromY = fromY = fromPointObj.plotY;
            connector.toX = toX = toPointObj.plotX;
            connector.toY = toY = toPointObj.plotY;
            connector.arrowAtStart = connectorOptions.arrowAtStart;
            connector.arrowAtEnd = connectorOptions.arrowAtEnd;
            connector.strokeWidth = strokeWidth = (connectorOptions.conStrength * connectorOptions.stdThickness);
            connector.color = color = connectorOptions.color;
            connector.textBgColor = textBgColor = color && color.FCcolor && color.FCcolor.color;
            connector.label = label = connectorOptions.label;
            connector.link = connectorOptions._options && connectorOptions._options.link;

            fromPointObj._config && fromPointObj._config.startConnectors &&
            fromPointObj._config.startConnectors.push(connector)
            toPointObj._config && toPointObj._config.endConnectors &&
            toPointObj._config.endConnectors.push(connector)
            //function to stop longpress event
            mouseOut = function () {
                downTimer = clearTimeout(downTimer);
            }
            //fire long press event
            mouseDown = function(e) {
                var options = connectorOptions._options || {};

                downTimer = clearTimeout(downTimer);

                downTimer = setTimeout(function() {
                    //add a selection method for start and end
                    iapi.showConnectorUpdateUI(chart, {
                        fromid: {
                            val: options.from,
                            innerHTML: OPTIONSTR + options.from + OPTIONCLOSESTR,
                            disabled: true
                        },
                        toid: {
                            val: options.to,
                            innerHTML: OPTIONSTR + options.to + OPTIONCLOSESTR,
                            disabled: true
                        },
                        arratstart: {
                            val: Boolean(pluckNumber(options.arrowatstart, 1))
                        },
                        arratend: {
                            val: Boolean(pluckNumber(options.arrowatend, 1))
                        },
                        dashed: {
                            val: pluckNumber(options.dashed)
                        },
                        dashgap: {
                            val: options.dashgap
                        },
                        dashlen: {
                            val: options.dashlen
                        },
                        label: {
                            val: options.label
                        },
                        id: {
                            val: connectorOptions.id,
                            disabled: true
                        },
                        strength: {
                            val: options.strength
                        },
                        alpha: {
                            val: options.alpha
                        },
                        color: {
                            val: options.color
                        }
                    }, true);

                }, CLICK_DELAY);
            };
            //click Function
            clickFN = function (){
                iapi.linkClickFN.call(connector);
             }

            //draw the line
            connector.graphic = renderer.path(connector.getlinePath())
            .attr({
                strokeWidth: strokeWidth,
                dashstyle: connectorOptions.dashStyle,
                stroke: color
            })
            .add(connectorsGroup)
            .on(hasTouch ? 'touchstart' : 'mousedown', mouseDown)
            .on('click', clickFN);

            addEvent(connector.graphic.element, 'mouseup dragstart', mouseOut);

            if (label) {
                // Drawing the connector Label
                connector.text = renderer.text(label, (fromX + toX) / 2, (fromY + toY) / 2)
                .attr({
                    align: POSITION_CENTER,
                    rotation: 0
                })
                .css(style)
                .css({
                    backgroundColor: textBgColor,
                    borderColor: textBgColor
                })
                .add(connectorsGroup)
                .textBound()
                .on(hasTouch ? 'touchstart' : 'mousedown', mouseDown)
                .on('click', clickFN);
                addEvent(connector.text.element, 'mouseup dragstart', mouseOut);
            }
        }
    };
    connectorClass.prototype = {
        updateFromPos: function (x, y) {
            var connector = this;
            connector.fromX = x;
            connector.fromY = y;
            connector.graphic && connector.graphic.attr({
                d: connector.getlinePath()
            });

            connector.text && connector.text.attr({
                x: (connector.fromX + connector.toX) / 2,
                y: (connector.fromY + connector.toY) / 2
            }).textBound();
        },
        updateToPos: function (x, y) {
            var connector = this;
            connector.toX = x;
            connector.toY = y;
            connector.graphic && connector.graphic.attr({
                d: connector.getlinePath()
            });

            connector.text && connector.text.attr({
                x: (connector.fromX + connector.toX) / 2,
                y: (connector.fromY + connector.toY) / 2
            }).textBound();
        },
        getlinePath: function () {
            var connector = this,
            fromPointObj = connector.fromPointObj,
            toPointObj = connector.toPointObj,
            fromX = connector.fromX,
            fromY = connector.fromY,
            toX = connector.toX,
            toY = connector.toY,
            path = [M, fromX, fromY],
            config;
            if (connector.arrowAtStart) {
                config = fromPointObj._config;
                if(config.shapeType == SHAPE_RECT) {
                    path = path.concat(drawArrow(fromX, fromY, toX, toY,
                        config.shapeArg.width, config.shapeArg.height));
                } else {
                    path = path.concat(drawArrow(fromX, fromY, toX, toY,
                        config.shapeArg.radius));
                }
            }

            // Calculating path for connector Arrow
            if (connector.arrowAtEnd) {
                config = toPointObj._config;
                if(config.shapeType == SHAPE_RECT) {
                    path = path.concat(drawArrow(toX, toY, fromX, fromY,
                        config.shapeArg.width, config.shapeArg.height));
                } else {
                    path = path.concat(drawArrow(toX, toY, fromX, fromY,
                        config.shapeArg.radius));
                }
            }
            path.push(L, toX, toY);
            return path;
        }
    };

    connectorClass.prototype.constructor = connectorClass;

    var dragChartsComponents = {
        //prevent click at the end of drag
        mouseDown: function (event) {
            delete event.data.point.dragActive;
        },
        //prevent click
        click: function (event) {
            return !event.data.point.dragActive;
        },
        //drag handeler for drag charts
        dragHandler: function (event) {
            var config = event.data,
            type = event.type,
            point = config.point,
            series = config.series,
            chart = series.chart || series,
            toolTip = chart.tooltip,
            touchEvent = (hasTouch && getTouchEvent(event)) || stubEvent,
            iapi = chart.options.instanceAPI,
            eventArgsArr,
            eventArgs;

            switch (type) {
                case DRAGSTART :
                    toolTip.block(true);
                    config.dragStartY = event.pageY || touchEvent.pageY || 0;
                    config.dragStartX = event.pageX || touchEvent.pageX || 0;
                    config.startValue = point.y;
                    config.startXValue = point.x;
                    point.dragActive = true;
                    series.dragStartHandler && series.dragStartHandler(config);
                    break;
                case DRAGEND :
                    toolTip.block(false);
                    series.repositionItems(config, config.changeX ?
                        (event.pageX || touchEvent.pageX || 0) - config.dragStartX : 0,
                        config.changeY ? (event.pageY || touchEvent.pageY || 0) -
                        config.dragStartY : 0, true);

                    eventArgs = {
                        dataIndex: point.index + 1,
                        datasetIndex: series.index + 1,
                        startValue: config.startValue,
                        endValue: point.y,
                        seriesName: series.name
                    }
                    eventArgsArr = [
                    iapi.chartInstance.id,
                    eventArgs.dataIndex,
                    eventArgs.datasetIndex,
                    eventArgs.seriesName,
                    eventArgs.startValue,
                    eventArgs.endValue
                    ];
                    if (config.changeX) {
                        eventArgs.startYValue = config.startValue;
                        eventArgs.endYValue = point.y;
                        eventArgs.startXValue = config.startXValue;
                        eventArgs.endXValue = point.x;
                        eventArgsArr.push(config.startXValue, point.x);
                        delete eventArgs.startValue;
                        delete eventArgs.endValue;
                    }

                    // Fire the ChartUpdated event
                    lib.raiseEvent('chartupdated', eventArgs, iapi.chartInstance,
                        eventArgsArr);

                    delete config.dragStartY;
                    delete config.dragStartX;
                    delete config.startValue;
                    delete config.startXValue;
                    break;
                default:
                    series.repositionItems(config, config.changeX ?
                        (event.pageX || touchEvent.pageX || 0) - config.dragStartX : 0,
                        config.changeY ? (event.pageY || touchEvent.pageY || 0) -
                        config.dragStartY : 0);
                    break;
            }
        },
        //handaler for dragable labels
        dragLabelHandler: function (event) {
            var config = event.data,
            type = event.type,
            element = config.element,
            tracker = config.tracker,
            toolTip = config.toolTip,
            touchEvent = (hasTouch && getTouchEvent(event)) || stubEvent,
            series = config.series,
            reflowUpdate,
            px,
            py,
            leftPos,
            topPos;
            if (type === DRAGSTART) {
                toolTip.block(true);
                config.dragStartY = event.pageY || touchEvent.pageY || 0;
                config.dragStartX = event.pageX || touchEvent.pageX || 0;
            }
            else {
                px = config.x + (event.pageX || touchEvent.pageX || 0) - config.dragStartX;
                leftPos = px - config.leftDistance;
                if (leftPos + config.width > config.plotWidth) {
                    leftPos = config.plotWidth - config.width;
                }
                if (leftPos < 0) {
                    leftPos = 0;
                }

                px = leftPos + config.leftDistance;

                py = config.y + (event.pageY || touchEvent.pageY || 0) - config.dragStartY;
                topPos = py - config.topDistance;
                if (topPos + config.height > config.plotHeight) {
                    topPos = config.plotHeight - config.height;
                }
                if (topPos < 0) {
                    topPos = 0;
                }
                py = topPos + config.topDistance;
                if(type === DRAGEND ){
                    toolTip.block(false);
                    config.x = px;
                    config.y = py;
                    delete config.dragStartY;
                    delete config.dragStartX;
                }
                else {
                    element.attr({
                        x: px,
                        y: py
                    })
                    .textBound();
                    tracker.attr({
                        x: leftPos,
                        y: topPos
                    });
                }
            }
            if (type == 'dragend') {
                //Store currend updated x, y for resize
                // Save state
                reflowUpdate = {
                    hcJSON: {
                        dragableLabels: []
                    }
                };
                reflowUpdate.hcJSON.dragableLabels[config.index] = {
                    y: series.yAxis.translate(series.chart.plotHeight - py +
                        config.yAdjustment, 1),
                    x: series.xAxis.translate(px, 1)
                };
                extend2(series.chart.options.instanceAPI.chartInstance.jsVars._reflowData, reflowUpdate, true);
            }
        },

        pointUpdate: function (point, formattedVal) {
            if (!point._isUserTooltip && point.toolText !== BLANK) {
                point.options.toolText = point.toolText = point._toolTextStr +
                formattedVal;
            }
            if (!point._isUserValue && point.displayValue !== BLANK) {
                point.options.displayValue = point.displayValue = formattedVal;
            }
        },

        snapPoint: function (series, point, y) {
            var chart = series.chart,
            HCChartObj = chart.options.chart,
            snapToDiv = HCChartObj.snapToDiv,
            snapToDivOnly = HCChartObj.snapToDivOnly,
            plotLines = series._yAxisPlotLines,
            plotLinesGap = plotLines[1] - plotLines[0],
            snapPixel = snapToDivOnly ? plotLinesGap * 0.5 :
            HCChartObj.snapToDivRelaxation,
            length = plotLines.length,
            lastSnap = point.lastSnap,
            outOfRange = 1,
            index,
            divLineDiff;

            for (index = 0; index < length; index += 1) {
                divLineDiff = mathAbs(plotLines[index] - y);
                if (snapToDiv && divLineDiff < snapPixel) {
                    if (lastSnap !== index) {
                        point.lastSnap = snapToDivOnly ? undefined : index;
                        y = plotLines[index];
                    }
                    outOfRange = 0;
                    break;
                }
            }
            if (outOfRange) {
                point.lastSnap = undefined;
            }
            return y;
        },

        getLineDataLabelY: function (series, point, y) {
            var chart = series.chart,
                HCChartObj = chart.options.chart,
                plotHeight = chart.plotHeight,
                GUTTER = 4,
                NegGutter = 2,
                topValuePadding = HCChartObj.valuePadding + GUTTER,
                bottomValuePadding = HCChartObj.valuePadding + NegGutter,
                dataLabel = point.dataLabel,
                rotation,
                lineHeight,
                valueBelowPoint,
                // Taking the label height
                dataLabelHeight,
                acctDataLabelHeight,
                effectiveLabelHeight,
                topYPos,
                bottomYPos,
                labelY,
                align,
                value = {y: 0};

            if (dataLabel) {
                rotation =  dataLabel.rotation === 270;
                lineHeight = rotation ? 0 : pInt(dataLabel.styles.lineHeight, 10);
                valueBelowPoint = point._valueBelowPoint;
                // Taking the label height
                dataLabelHeight = rotation ? dataLabel.getBBox().height :
                point._dataLabelHeight;
                acctDataLabelHeight = dataLabelHeight + topValuePadding;
                effectiveLabelHeight = rotation ? 0 : dataLabelHeight - lineHeight;
                topYPos = y - effectiveLabelHeight - topValuePadding;
                bottomYPos = y + lineHeight + bottomValuePadding;
                labelY = valueBelowPoint ? bottomYPos : topYPos;
                align = valueBelowPoint ? POSITION_RIGHT : POSITION_LEFT;
                if (!valueBelowPoint && y < acctDataLabelHeight) {
                    labelY =  bottomYPos;
                    align = POSITION_RIGHT;
                }
                else if (valueBelowPoint && (plotHeight - y) < acctDataLabelHeight) {
                    labelY =  topYPos;
                    align = POSITION_LEFT;
                }
                value.y = labelY;
                value.align = rotation ? align : undefined
            }
            return value;
        },

        getDataLabelY: function (series, point, y) {
            var chart = series.chart,
            options = series.options,
            threshold = options.translatedThreshold,
            HCChartObj = chart.options.chart,
            plotHeight = chart.plotHeight,
            GUTTER = 4,
            NegGutter = 2,
            topValuePadding = HCChartObj.valuePadding + GUTTER,
            bottomValuePadding = HCChartObj.valuePadding + NegGutter,
            dataLabel = point.dataLabel,
            rotation,
            lineHeight,
            valueBelowPoint,
            // Taking the label height
            dataLabelHeight,
            acctDataLabelHeight,
            effectiveLabelHeight,
            topYPos,
            bottomYPos,
            labelY,
            align,
            value = {y: 0};

            if (dataLabel) {
                rotation =  dataLabel.rotation === 270;
                lineHeight = rotation ? 0 : pInt(dataLabel.styles.lineHeight, 10);
                valueBelowPoint = point._valueBelowPoint;
                // Taking the label height
                dataLabelHeight = rotation ? dataLabel.getBBox().height :
                point._dataLabelHeight;
                acctDataLabelHeight = dataLabelHeight + topValuePadding;
                effectiveLabelHeight = rotation ? 0 : dataLabelHeight - lineHeight;
                topYPos = y - effectiveLabelHeight - topValuePadding;
                bottomYPos = y + lineHeight + bottomValuePadding;
                labelY = (valueBelowPoint && y < threshold) ||
                (!valueBelowPoint && y > threshold) ? bottomYPos : topYPos;
                align = valueBelowPoint ? POSITION_RIGHT : POSITION_LEFT;

                if (valueBelowPoint && mathAbs(threshold - y) < acctDataLabelHeight) {
                    if (y < threshold) {
                        labelY = topYPos;
                        align = POSITION_LEFT;
                    }
                    else {
                        labelY = bottomYPos;
                        align = POSITION_RIGHT;
                    }
                }
                else {
                    if (y < acctDataLabelHeight) {
                        labelY = bottomYPos;
                        align = POSITION_RIGHT;
                    }
                    else if ((plotHeight - y) < acctDataLabelHeight) {
                        labelY = topYPos;
                        align = POSITION_LEFT;
                    }
                }

                value.y = labelY;
                value.align = rotation ? align : undefined;

            }

            return value;
        },

        setMinMaxValue: function (series, iapi){
            var seriesArr = series.chart.series,
            index = 0,
            min = Infinity,
            max = -Infinity,
            reflowData = iapi.chartInstance.jsVars._reflowData,
            seriesLen,
            value,
            data,
            len,
            ind;

            for (ind = 0, seriesLen = seriesArr.length; ind < seriesLen;
                ind += 1) {
                data = seriesArr[ind] && seriesArr[ind].data;
                for (index = 0, len = data.length; index < len; index += 1) {
                    value = data[index].y;

                    if (value !== null) {
                        max = max > value ? max : value;
                        min = min < value ? min : value;
                    }
                }
            }

            iapi.highValue = max;
            iapi.lowValue = min;

            reflowData.postHCJSONCreation = function () {
                var iapi = this,
                    hc = iapi.hcJSON,
                    conf = hc[CONFIGKEY],
                    axisConf = conf[0];
                axisConf.min = min;
                axisConf.max = max;
            };
        },

        setSelectBoxValues: function (point, chart) {
            var xAxis = chart.xAxis[0],
            yAxis = chart.yAxis[0],
            plotHeight = chart.plotHeight;

            point.startX = xAxis.translate(point.left, 1);
            point.endX = xAxis.translate(point.left + point.width, 1);
            point.startY = yAxis.translate(plotHeight - point.top, 1);
            point.endY = yAxis.translate(plotHeight -
                (point.top + point.height), 1);
        }
    };

    defaultPlotOptions.dragnode = merge(defaultPlotOptions.scatter, {
        states: {
            hover: {}
        }
    });

    seriesTypes.dragnode = Highcharts.extendClass(seriesTypes.scatter, {
        type: 'dragnode',


        drawDataLabels: function () {

        },

        /**
         * Draw the markers
         */
        drawPoints: function() {
            var series = this,
            data = series.data,
            chart = series.chart,
            options = series.options,
            conf = chart.options[CONFIGKEY],
            chartOptions =  chart.options,
            connectors = chartOptions.connectors,
            inCanvasStyle = chartOptions[CONFIGKEY].inCanvasStyle,
            renderer = chart.renderer,
            labels = chart.labels,
            trackerGroup = chart.trackerGroup,
            style = options.dataLabels.style,
            imageNode, imageURL, imageAlign, imageWidth, imageHeight,
            plotWidth, plotHeight,
            labelAlign,
            config, confShapeArg,
            seriesGroup = series.group,
            connectorsGroup = chart.connectorsGroup,
            connectorsStore = chart.connectorsStore,
            invalConnectStore = chart.invalConnectStore,
            pointStore = chart.pointStore || (chart.pointStore = []),
            yAxis = series.yAxis,
            xAxis = series.xAxis,
            lineHeight = parseInt(style.lineHeight),
            smartLabel = renderer.smartLabel || conf.smartLabel,
            pointAttr,
            pointOptions,
            isRectangle,
            smartTextObj,
            dataLabel,
            padding,
            labelX,
            labelY,
            plotX,
            plotY,
            oriStr,
            point,
            radius,
            graphic,
            width,
            height,
            marker,
            symbol,
            id,
            i,
            ln,
            label,
            dragableLabels,
            dragLabelGroup = chart.dragLabelGroup,
            incanFontSize,
            incanBackgroundColor,
            incanBorderColor,
            labelFontSize,
            labelColor,
            allowdrag,
            yAdjustment,
            labelStyle,
            labelBGColor,
            labelBDColor,
            labelNode,
            bBox,
            tracker,
            labelDisplacement,
            text,
            topDistance,
            alpha,
            trackerLabel = +new Date();

            if (!connectorsGroup) {
                chart.connectorsGroup = connectorsGroup = renderer.g('connectorsGroup')
                .attr({
                    visibility: VISIBLE
                })
                .add(seriesGroup);
            }

            if (series.options.marker.enabled) {
                i = data.length;

                each(series.data, function(point) {
                    plotX = point.plotX;
                    plotY = point.plotY;
                    // only draw the point if y is defined
                    if (plotY !== UNDEFINED && !isNaN(plotY)) {
                        config = point._config = point._config || {
                            shapeArg : {},
                            startConnectors: [],
                            endConnectors: []
                        };
                        confShapeArg = config.shapeArg;
                        pointOptions = point.options;
                        graphic = point.graphic;
                        marker =  point.marker || {};
                        height =  pluckNumber(marker && marker.height);
                        width =  pluckNumber(marker && marker.width);
                        radius =  pluckNumber(marker && marker.radius);
                        symbol =  pluck(marker && marker.symbol);
                        isRectangle = symbol === 'rectangle';
                        dataLabel = point.dataLabel;
                        id = point.id;
                        imageNode = pointOptions.imageNode;
                        imageURL = pointOptions.imageURL;
                        imageAlign = pointOptions.imageAlign; //TOP, MIDDLE or BOTTOM
                        labelAlign = pointOptions.labelAlign;
                        plotWidth = isRectangle ? width : radius * 1.4;
                        imageWidth = pluckNumber(pointOptions.imageWidth, plotWidth);
                        plotHeight = isRectangle ? height : radius * 1.4;
                        imageHeight = pluckNumber(pointOptions.imageHeight, plotHeight);

                        // shortcuts
                        pointAttr = point.pointAttr[point.selected ? SELECT_STATE : NORMAL_STATE];

                        symbol = confShapeArg.symbol = pick(marker && marker.symbol, series.symbol);

                        if (isRectangle) {
                            config.shapeType = SHAPE_RECT;
                            confShapeArg.x = plotX - (width / 2);
                            confShapeArg.y = plotY - (height / 2);
                            confShapeArg.width = width;
                            confShapeArg.height = height;
                            confShapeArg.r = 0;
                            if (graphic) { // update
                                graphic.animate(confShapeArg);
                            } else {
                                delete pointAttr.r;
                                point.graphic = renderer.rect(confShapeArg)
                                .attr(pointAttr)
                                .add(seriesGroup);
                            }
                        }
                        else {
                            config.shapeType = 'symbol';
                            confShapeArg.x = plotX;
                            confShapeArg.y = plotY;
                            //convert into number
                            confShapeArg.radius = pointAttr.r = pointAttr.r * 1;
                            if (graphic) { // update
                                graphic.animate(confShapeArg);
                            } else {
                                point.graphic = renderer.symbol(confShapeArg)
                                .attr(pointAttr)
                                .add(seriesGroup);
                            }
                        }
                        pointStore[id] = point;


                        // Draw the imageNode if available
                        if (imageNode && imageURL) {
                            var imageY;
                            if (imageHeight > plotHeight) {
                                imageHeight = plotHeight;
                            }
                            if (imageWidth > plotWidth) {
                                imageWidth = plotWidth;
                            }
                            switch (imageAlign) {
                                case 'middle' :
                                    imageY = plotY - (imageHeight / 2);
                                    break;
                                case 'bottom' :
                                    imageY = plotHeight > imageHeight ? plotY +
                                    (plotHeight / 2) - imageHeight :
                                    plotY - imageHeight / 2;
                                    break;
                                default :
                                    imageY = plotHeight > imageHeight ?
                                    plotY - (plotHeight * 0.5) :
                                    plotY - imageHeight / 2;
                                    break;
                            }
                            config.imageX = plotX - (imageWidth / 2);
                            config.imageY = imageY;

                            point.imageNodeGraph = renderer.image(imageURL)
                            .attr({
                                width: imageWidth,
                                height: imageHeight
                            })
                            .translate(plotX - (imageWidth / 2), imageY)
                            .css({
                                opacity : 1
                            })
                            .add(seriesGroup);
                        }

                        // Drawing of the displayValue
                        oriStr = point.displayValue;
                        if (defined(oriStr) || oriStr !== BLANKSPACE) {
                            // Get the displayValue text according to the canvas width.
                            smartTextObj = smartLabel.getSmartText(oriStr,
                                plotWidth, plotHeight);

                            // label displacement for top or bottom
                            labelDisplacement = plotHeight * 0.5 -
                            (smartTextObj.height * 0.5);
                            // label at TOP
                            switch (labelAlign) {
                                case 'top' :
                                    labelDisplacement = -labelDisplacement;
                                    break;
                                case 'bottom' :
                                    labelDisplacement = labelDisplacement;
                                    break;
                                default :
                                    labelDisplacement = 0;
                                    break;
                            }
                            point._yAdjustment = yAdjustment  =
                            (lineHeight * 0.8 - (smartTextObj.height * 0.5))
                            + labelDisplacement;
                            labelY = plotY + yAdjustment;

                            if (dataLabel) {
                                dataLabel.attr({
                                    text: smartTextObj.text
                                }).animate({
                                    x: plotX,
                                    y: labelY
                                });
                            }
                            else {
                                point.dataLabel = chart.renderer.text(smartTextObj.text,
                                    plotX, labelY)
                                .attr({
                                    align: POSITION_CENTER
                                })
                                .css(style)
                                .add(seriesGroup);
                            }
                        }
                    }
                });


                // Drawing the connectors and connectors Labels
                if (!connectorsStore) {//first time
                    connectorsStore = chart.connectorsStore = [];
                    invalConnectStore = chart.invalConnectStore = [];
                    for (i = 0; i < connectors.length; i += 1) {
                        each (connectors[i].connector, function (connector) {
                            //if booth the end point's belongs to this series then only draw this connector
                            if (pointStore[connector.from] && pointStore[connector.to]) {
                                connectorsStore.push(new connectorClass(connector,
                                    pointStore, style, renderer, connectorsGroup, chart));
                            }
                            else {
                                invalConnectStore.push(connector);
                            }
                        })
                    }
                }
                else {//from 2nd series
                    for (i = invalConnectStore.length - 1; i >= 0; i -= 1) {
                        connector = invalConnectStore[i];
                        //if booth the end point's found then only draw this connector
                        if (pointStore[connector.from] && pointStore[connector.to]) {
                            //also remove from invalConnectStore as it is drawn
                            invalConnectStore.splice(i, 1);
                            connectorsStore.push(new connectorClass(connector,
                                pointStore, style, renderer, connectorsGroup, chart));
                        }
                    }
                }
            // End drawing connectors
            }


            //draw dragable labels for the first time
            if (!chart.dragLabelsDrawn && (dragableLabels = chartOptions.dragableLabels) &&
                (ln = dragableLabels.length) > 0) {
                //create the label group
                if (!dragLabelGroup) {
                    dragLabelGroup = chart.dragLabelGroup = renderer.g('dragablelabels')
                    .translate(chart.plotLeft, chart.plotTop)
                    .attr({
                        zIndex: 6
                    })
                    .add();
                }

                plotWidth = chart.plotSizeX;
                plotHeight = chart.plotSizeY;
                incanFontSize = parseInt(inCanvasStyle.fontSize, 10);
                incanBackgroundColor = inCanvasStyle.backgroundColor;
                incanBorderColor = inCanvasStyle.borderColor;
                for (i = 0; i < ln; i += 1) {
                    label = dragableLabels[i];
                    label.index = i;
                    text = parseUnsafeString(pluck(label.text, label.label));
                    if (text) {
                        text = parseUnsafeString(text);
                        labelX = xAxis.translate(label.x || 0);
                        labelY = yAxis.translate(label.y || 0, 0, 1, 0, 1);
                        labelFontSize = pluckNumber(label.fontsize, incanFontSize);
                        labelColor = pluckColor(pluck(label.color, inCanvasStyle.color));
                        alpha = (pluckNumber(label.alpha, 100)) / 100;
                        allowdrag = pluckNumber(label.allowdrag, 1);
                        yAdjustment = labelFontSize * 0.8;
                        padding = pluckNumber(label.padding);
                        labelStyle = {
                            fontSize: labelFontSize + PX,
                            fontFamily: inCanvasStyle.fontFamily,
                            fill: labelColor,
                            color: labelColor,
                            opacity: alpha
                        };
                        //set the line height
                        setLineHeight(labelStyle);
                        labelBGColor = pluck(label.bgcolor, incanBackgroundColor);
                        labelBDColor = pluck(label.bordercolor, incanBorderColor);
                        if (labelBGColor) {
                            labelStyle.backgroundColor = labelBGColor.replace(dropHash, HASHSTRING);
                            labelStyle.backgroundOpacity = alpha;
                        }
                        if (labelBDColor) {
                            labelStyle.borderColor = labelBDColor.replace(dropHash, HASHSTRING);
                            labelStyle.borderOpacity = alpha;
                        }
                        //if there has positive padding
                        if (padding >= 0) {
                            labelStyle.padding = padding + PX;
                        }
                        labelNode = renderer.text(text, labelX, labelY)
                        .attr({
                            align: POSITION_CENTER,
                            rotation: 0
                        })
                        .css(labelStyle)
                        .add(dragLabelGroup);
                        bBox = labelNode.getBBox();
                        yAdjustment -= (bBox.height / 2) || 0;
                        topDistance = labelY - bBox.y;
                        labelY = labelY + yAdjustment;
                        labelNode.attr({
                            y: labelY
                        })
                        .textBound();

                        //create the tracker
                        tracker = renderer.rect(bBox.x, labelY - topDistance, bBox.width, bBox.height, 0)
                        .attr({
                            isTracker: trackerLabel,
                            fill: TRACKER_FILL,
                            zIndex: 2
                        })
                        .css({
                            cursor: allowdrag ? 'move' : 'normal'
                        })
                        .on (hasTouch ? 'touchstart' : 'mousedown', function () {
                            clearTimeout(tracker._longpressactive);
                            tracker._longpressactive = setTimeout(function () {
                                chart.options.instanceAPI.showLabelDeleteUI(chart, labelNode);
                            }, 1000);
                        })
                        .add(trackerGroup);
                        addEvent(tracker.element, hasTouch ?
                            'touchend touchmove' : 'mouseup mousemove', function () {
                                clearTimeout(tracker._longpressactive);
                                delete tracker._longpressactive;
                            });

                        //add the label node abd the tracker at the chart's label array
                        //so that it distroy properly
                        labels.push(tracker, labelNode);
                        labelNode.index = i;

                        if (allowdrag) {
                            addEvent(tracker.element, 'dragstart drag dragend',
                                dragChartsComponents.dragLabelHandler, {
                                    index: i,
                                    series: series,
                                    element: labelNode,
                                    tracker: tracker,
                                    toolTip: chart.tooltip,
                                    x: labelX,
                                    y: labelY,
                                    leftDistance: labelX - bBox.x,
                                    topDistance: topDistance,
                                    width: bBox.width,
                                    height: bBox.height,
                                    plotWidth: plotWidth,
                                    plotHeight: plotHeight,
                                    yAdjustment: yAdjustment
                                });
                        }


                    }
                }
                //donot draw the labels any more
                chart.dragLabelsDrawn = true;
            }



        },

        drawTracker: function () {
            var series = this,
                chart = series.chart,
                renderer = chart.renderer,
                cursor = series.options.cursor,
                iapi = chart.options.instanceAPI,
                css = cursor && {
                    cursor: cursor
                },
                trackerLabel = +new Date(),
                shapeArg,
                trackerGroup = chart.trackerGroup,
                downTimer;

            each(series.data, function(point) {
                var tracker,
                    config;

                if (point.y !== null) {
                    config = point._config;
                    shapeArg = config.shapeArg || {};
                    tracker = point.tracker;
                    if (tracker) {// update
                        tracker.attr(shapeArg);
                    } else {
                        /**^
                         * Add cursor pointer if there has link modify the
                         * parent scope css variable with a local variable
                         */
                        if (point.link !== undefined) {
                            var css = {
                                cursor : 'pointer',
                                '_cursor': 'hand'
                            };
                        }

                        // Storing dataLabel x in point for position dataLabel while
                        // dragging
                        point._dataLabelX = point.dataLabel && point.dataLabel.attr('x');

                        /* EOP ^*/
                        point.tracker = tracker = renderer[config.shapeType](shapeArg)
                        .attr({
                            isTracker: trackerLabel,
                            fill: TRACKER_FILL,
                            visibility: series.visible ? VISIBLE : HIDDEN
                        })
                        .on(hasTouch ? 'touchstart' : 'mouseover', function(event) {
                            series.onMouseOver();
                            point.onMouseOver();
                        })
                        .on('mouseout', function(event) {
                            if (!series.options.stickyTracking) {
                                series.onMouseOut();
                            }
                        })
                        .css(css)
                        .add(trackerGroup).on(hasTouch ? 'touchstart' : 'mousedown', function(e) {
                            var seriesName = series.name !== BLANK ?
                            series.name + COMMASTRING + BLANKSPACE : BLANK,
                            seriesId = series.options.id,
                            symbolMap = {
                                circle: 'circ',
                                polygon: 'poly',
                                'undefined': 'rect'
                            },
                            userOpt = point._options,
                            shape = symbolMap[userOpt.shape],
                            CLICK_DELAY = 800;

                            downTimer = clearTimeout(downTimer);
                            downTimer = setTimeout(function() {
                                //add a selection method for start and end
                                iapi.showNodeUpdateUI(chart, {
                                    x: {
                                        value: point.x
                                    },
                                    y: {
                                        value: point.y
                                    },
                                    draggable: {
                                        value: getFirstValue(userOpt.allowdrag, 1)
                                    },
                                    color: {
                                        value: userOpt.color
                                    },
                                    alpha: {
                                        value: userOpt.alpha
                                    },
                                    label: {
                                        value: getFirstValue(userOpt.label,
                                            userOpt.name)
                                    },
                                    tooltip: {
                                        value: userOpt.tooltext
                                    },
                                    shape: {
                                        value: shape
                                    },
                                    rect_width: {
                                        value: userOpt.width
                                    },
                                    rect_height: {
                                        value: userOpt.height
                                    },
                                    circ_poly_radius: {
                                        value: userOpt.radius
                                    },
                                    poly_sides: {
                                        value: userOpt.numsides
                                    },
                                    image: {
                                        value: userOpt.imagenode
                                    },
                                    img_width: {
                                        value: userOpt.imagewidth
                                    },
                                    img_height: {
                                        value: userOpt.imageheight
                                    },
                                    img_align: {
                                        value: userOpt.imagealign
                                    },
                                    img_url: {
                                        value: userOpt.imageurl
                                    },
                                    id: {
                                        value: point.id,
                                        disabled: true
                                    },
                                    link: {
                                        value: userOpt.link
                                    },
                                    dataset: {
                                        innerHTML: '<option value="'+
                                        seriesId + '">' + seriesName +
                                        seriesId + '</option>',
                                        disabled: true
                                    }
                                }, true);
                            }, CLICK_DELAY);
                        });

                        addEvent(tracker.element, 'dragstart mouseup', function () {
                            downTimer = clearTimeout(downTimer);
                        }, config);

                        if(point.options.allowDrag) {
                            //set move cursor
                            tracker.css({
                                cursor: 'move'
                            });
                            //store the bBox to drag properly
                            config.bBox = tracker.getBBox();

                            // For ie, re-calculate bbox after some time.
                            if (docMode8) {
                                setTimeout(function () {
                                    delete tracker.bBox;
                                    config.bBox = tracker.getBBox();
                                    config.bBox.r = config.bBox.x + config.bBox.width;
                                    config.bBox.b = config.bBox.y + config.bBox.height;
                                }, 1);
                            }
                            //calc right and bottom for faster calc
                            config.bBox.r = config.bBox.x + config.bBox.width;
                            config.bBox.b = config.bBox.y + config.bBox.height;
                            config.plotSizeX = chart.plotSizeX;
                            config.plotSizeY = chart.plotSizeY;
                            config.series = series;
                            config.point = point;
                            config.changeX = 1;
                            config.changeY = 1;

                            addEvent(tracker.element, 'mousedown', dragChartsComponents.
                                mouseDown, config);

                            addEvent(tracker.element, 'click', dragChartsComponents.click, config);

                            addEvent(tracker.element, 'dragstart drag dragend',
                                dragChartsComponents.dragHandler, config);
                        }
                    }
                }
            });
        },

        dragStartHandler: function (config) {
            var point = config.point,
                series = this,
                chart = series.chart,
                renderer = chart.renderer,
                shapeArg = config.shapeArg,
                pointAttr = point.pointAttr[point.selected ? SELECT_STATE :
                        NORMAL_STATE],
                _pointAttr = extend({'fill-opacity' : 0.5}, pointAttr),
                dataLabel = point.dataLabel,
                imageNodeGraph = point.imageNodeGraph,
                cloneGroup;

            point.cloneGroup = cloneGroup = renderer.g('clone')
            //.attr({x: config.shapeArg.x, y: config.shapeArg.y})
            //.translate(config.shapeArg.x, config.shapeArg.y)
            .add(series.group);

            point._graphic = (shapeArg.symbol == 'rectangle' ?
                renderer.rect(shapeArg) : renderer.symbol(shapeArg))
            .attr(_pointAttr)
            .css({
                opacity: 0.3
            })
            .add(cloneGroup);

            // Draw the imageNode if available
            if (imageNodeGraph) {
                point._imageNodeGraph = renderer.image(point.imageURL)
                .attr({
                    width: imageNodeGraph.attr('width'),
                    height: imageNodeGraph.attr('height')
                })
                .translate(config.imageX, config.imageY)
                .css({
                    opacity : 0.3
                })
                .add(cloneGroup);
            }
            // Draw the dataLabel if available
            if (dataLabel) {
                point._dataLabel = chart.renderer.text(point.dataLabel.textStr,
                    dataLabel.attr('x'), dataLabel.attr('y'))
                .attr({
                    align: POSITION_CENTER
                })
                .css(extend({
                    opacity : 0.3
                }, dataLabel.style))
                .add(cloneGroup);
            }
        },

        repositionItems: function (config, x, y, isDragEnded) {
            var point = config.point,
            bBbox = config.bBox,
            series = this,
            xAxis = series.xAxis,
            yAxis = series.yAxis,
            iapi = series.chart.options.instanceAPI,
            NumberFormatter = iapi.numberFormatter,
            plotHeight = config.plotSizeY,
            valX,
            valY,
            fValX,
            fValY,
            confShapeArg,
            reflowUpdate,
            conArr,
            newAttr,
            pointAttr,
            i,
            l,
            px,
            py;
            x = x || 0.1;
            y = y || 0.1;
            //bound limits
            if (bBbox.x + x < 0) {
                x = -bBbox.x;
            }
            if (bBbox.r + x > config.plotSizeX) {
                x = config.plotSizeX - bBbox.r;
            }
            if (bBbox.y + y < 0) {
                y = -bBbox.y;
            }
            if (bBbox.b + y > plotHeight) {
                y = plotHeight - bBbox.b;
            }

            //modify the conectors
            px = point.plotX + x;
            py = point.plotY + y;

            point.tracker.translate(x, y);
            point.cloneGroup.translate(x, y);

            if (isDragEnded) {
                confShapeArg = config.shapeArg;
                //store imageX and imageY
                config.imageX += x;
                config.imageY += y;

                //store plotX and plotY
                point.plotX = px;
                point.plotY = py;
                bBbox.x += x;
                bBbox.r += x;
                bBbox.y += y;
                bBbox.b += y;
                newAttr = {
                    x : (confShapeArg.x += x),
                    y: (confShapeArg.y += y)
                };
                pointAttr = extend(extend({}, newAttr), point.pointAttr[point.selected ? SELECT_STATE :
                        NORMAL_STATE]);

                point.graphic.attr(pointAttr).translate(0, 0.1);
                point.tracker.attr(newAttr).translate(0, 0.1);

                // modify dataLabel
                point.dataLabel && point.dataLabel.attr({
                    y: py + point._yAdjustment,
                    x: px
                });

                if (point.imageNodeGraph) {
                    point.imageNodeGraph.translate(config.imageX, config.imageY);
                }
                //start connectors
                conArr = config.startConnectors;
                l = conArr.length
                for (i = 0; i < l; i += 1) {
                    conArr[i].updateFromPos(px, py);
                }
                //end connectors
                conArr = config.endConnectors;
                l = conArr.length
                for (i = 0; i < l; i += 1) {
                    conArr[i].updateToPos(px, py);
                }

                // Destroy all clone nodes
                point._imageNodeGraph && point._imageNodeGraph.destroy();
                point._graphic.destroy();
                point._dataLabel && point._dataLabel.destroy();
                point.cloneGroup.destroy();

                valY = yAxis.translate(plotHeight - py, 1);
                valX = xAxis.translate(px, 1);
                fValY = NumberFormatter.dataLabels(valY);
                fValX = NumberFormatter.dataLabels(valX);

                point.y = valY;
                point.x = valX;

                if (!point._isUserTooltip && point.toolText !== BLANK) {
                    point.options.toolText = point.toolText =
                    point._toolTextStr + fValX + iapi.tooltipSepChar + fValY;
                }
                //Store currend updated x, y for resize
                // Save state
                reflowUpdate = {
                    hcJSON: {
                        series: []
                    }
                };
                reflowUpdate.hcJSON.series[series.index] = {
                    data: []
                };
                reflowUpdate.hcJSON.series[series.index].data[point.index] = {
                    //update in _ options also
                    _options: {
                        x: valX,
                        y: valY
                    },
                    y: valY,
                    x: valX,
                    toolText: point.toolText,
                    displayValue: point.displayValue
                };
                extend2(iapi.chartInstance.jsVars._reflowData, reflowUpdate,
                    true);
            }
        }
    });

    /******    Dragable Charts    ******/
    /////////////// DragArea ///////////

    /******    Dragable Charts    ******/
    /////////////// DragArea ///////////
    chartAPI('dragarea', extend({
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'dragarea',
        decimals: 2,
        anchorAlpha: '100',
        eiMethods: chartAPI.msareabase.eiMethods
    }, dragExtension), chartAPI.msareabase);


    /* ************************************************************************
     * Start DragArea series code                                      *
     **************************************************************************/
    // 1 - Set default options
    defaultPlotOptions.dragarea = merge(defaultPlotOptions.area, {
        states: {
            hover: {}
        }
    });

    seriesTypes.dragarea = Highcharts.extendClass(seriesTypes.area, {
        type: 'dragarea',

        repositionItems: function (config, x, y, isDragEnded) {
            var series = config.series,
            point = config.point,
            chart = series.chart,
            HCChartObj = chart.options.chart,
            plotHeight = chart.plotHeight,
            options = series.options,
            yAxis = series.yAxis,
            valuePadding = HCChartObj.valuePadding,
            doNotSnap = HCChartObj.doNotSnap,
            iapi = chart.options.instanceAPI,
            NumberFormatter = iapi.numberFormatter,
            pointY = point.plotY,
            GUTTER = 4,
            dataAttr = {},
            dataLabelAttr = {},
            areaPathAttr = {},
            translatedThreshold = options.translatedThreshold,
            path = series.graphLinePath,
            segmentPathIndex = point.segmentPathIndex,
            lowerDragBoundary = point.allowNegDrag ? plotHeight :
            translatedThreshold,
            areaPath = [],
            lastM = 0,
            value,
            reflowUpdate,
            dragOffsetY,
            formattedVal;

            dragOffsetY = pointY + y;

            if (dragOffsetY < 0) {
                dragOffsetY = 0;
            }
            if (dragOffsetY > lowerDragBoundary) {
                dragOffsetY = lowerDragBoundary;
            }
            // Snapping
            if (isDragEnded && !doNotSnap) {
                dragOffsetY = dragChartsComponents.snapPoint(series, point,
                    dragOffsetY);
            }

            y = dragOffsetY - pointY;

            // Positioning dataLabel
            value = mathRound(yAxis.translate(plotHeight - dragOffsetY, 1)
                * DECIMALS) / DECIMALS;
            formattedVal = NumberFormatter.dataLabels(value);

            dragChartsComponents.pointUpdate(point, formattedVal);
            dataAttr.y = dragOffsetY;
            dataLabelAttr = dragChartsComponents.getLineDataLabelY(series, point,
                dragOffsetY);
            dataLabelAttr.x = point._dataLabelX;
            dataLabelAttr.text = point.displayValue;

            path[segmentPathIndex - 1] = dragOffsetY;

            for (var i = 0, length = path.length;i < length; i += 1) {
                if (path[i] == M && i) {
                    areaPath.push(L, path[i - 2], translatedThreshold,
                        L, path[lastM + 1], translatedThreshold,
                        M, path[lastM + 1], path[lastM + 2]);
                    lastM = i;
                }
                areaPath.push(path[i]);
            }
            areaPath.push(
                L,
                path[length - 2],
                translatedThreshold,
                L,
                path[lastM + 1],
                translatedThreshold
                );

            series.graphLine.attr({
                d: path
            });
            areaPathAttr.d = areaPath;

            series.area.attr(areaPathAttr);
            point.graphic.attr(dataAttr);
            point.dataLabel && point.dataLabel.attr(dataLabelAttr);
            point.dragTracker.attr(dataAttr);

            if (isDragEnded) {
                point.plotY = dragOffsetY;
                point.y = value;
                // Upadate Drag tracker
                point.dragTracker.attr({
                    y : dragOffsetY
                });
                // Upadate ToolTip pos

                // Update data min and max
                dragChartsComponents.setMinMaxValue(series, iapi);

                // Save state
                reflowUpdate = {
                    hcJSON: {
                        series: []
                    }
                };
                reflowUpdate.hcJSON.series[series.index] = {
                    data: []
                };
                reflowUpdate.hcJSON.series[series.index].data[point.index] = {
                    y: value,
                    toolText: point.toolText,
                    displayValue: point.displayValue
                };
                extend2(iapi.chartInstance.jsVars._reflowData, reflowUpdate,
                    true);
            }
        },

        drawTracker: function() {
            var series = this;
            series.graphLinePath = series.graphLine &&
            series.graphLine.attr('d');
            series.graphLinePath =  series.graphLinePath &&
            series.graphLinePath.split(BLANKSPACE);

            seriesTypes.dragline.prototype.drawTracker.apply(this, arguments);
        }
    });

    /////////////// DragLine ///////////
    chartAPI('dragline', extend({
        standaloneInit: true,
        creditLabel : creditLabel,
        decimals: 2,
        defaultSeriesType : 'dragline',
        eiMethods: chartAPI.mslinebase.eiMethods
    }, dragExtension), chartAPI.mslinebase);


    /* ************************************************************************
     * Start DragLine series code                                      *
     **************************************************************************/
    // 1 - Set default options
    defaultPlotOptions.dragline = merge(defaultPlotOptions.line, {
        states: {
            hover: {}
        }
    });

    seriesTypes.dragline = Highcharts.extendClass(seriesTypes.line, {
        type: 'dragline',

        repositionItems: function (config, x, y, isDragEnded) {
            var series = config.series,
            point = config.point,
            chart = series.chart,
            HCChartObj = chart.options.chart,
            plotHeight = chart.plotHeight,
            yAxis = series.yAxis,
            valuePadding = HCChartObj.valuePadding,
            doNotSnap = HCChartObj.doNotSnap,
            iapi = chart.options.instanceAPI,
            NumberFormatter = iapi.numberFormatter,
            pointY = point.plotY,
            GUTTER = 4,
            threshold = series.options.translatedThreshold,
            pointIndex = point.index,
            data = series.data,
            prevPoint = data[pointIndex - 1],
            nextPoint = data[pointIndex + 1],
            prevY = prevPoint && prevPoint.plotY,
            nextY = nextPoint && nextPoint.plotY,
            prevX = prevPoint && prevPoint.plotX,
            nextX = nextPoint && nextPoint.plotX,
            currX = point.plotX,
            lowerDragBoundary = point.allowNegDrag ? plotHeight : threshold,
            dataAttr = {},
            dataLabelAttr = {},
            value,
            reflowUpdate,
            dragOffsetY,
            formattedVal;

            dragOffsetY = pointY + y;

            if (dragOffsetY < 0) {
                dragOffsetY = 0;
            }
            if (dragOffsetY > lowerDragBoundary) {
                dragOffsetY = lowerDragBoundary;
            }

            // Snapping
            if (isDragEnded && !doNotSnap) {
                dragOffsetY = dragChartsComponents.snapPoint(series, point,
                    dragOffsetY);
            }

            y = dragOffsetY - pointY;

            // Positioning dataLabel
            value = mathRound(yAxis.translate(plotHeight - dragOffsetY, 1)
                * DECIMALS) / DECIMALS;
            formattedVal = NumberFormatter.dataLabels(value);

            dragChartsComponents.pointUpdate(point, formattedVal);
            dataAttr.y = dragOffsetY;
            dataLabelAttr = dragChartsComponents.getLineDataLabelY(series, point,
                dragOffsetY);
            dataLabelAttr.text = point.displayValue;
            dataLabelAttr.x = point._dataLabelX;

            // prevPoint path change
            prevPoint && point.graphLine.attr({
                d: [M, prevX, prevY, L, currX, dragOffsetY]
            });
            // nextPoint path change
            nextPoint && nextPoint.graphLine.attr({
                d: [M, currX, dragOffsetY, L, nextX, nextY]
            });

            point.graphic.attr(dataAttr);
            point.dataLabel && point.dataLabel.attr(dataLabelAttr);
            point.dragTracker.attr(dataAttr);

            if (isDragEnded) {
                point.plotY = dragOffsetY;
                point.y = value;
                // Updating dataLabel and toolTip
                dragChartsComponents.pointUpdate(point, formattedVal);
                // Upadate ToolTip pos

                // Update data min and max
                dragChartsComponents.setMinMaxValue(series, iapi);

                // Save state
                reflowUpdate = {
                    hcJSON: {
                        series: []
                    }
                };
                reflowUpdate.hcJSON.series[series.index] = {
                    data: []
                };
                reflowUpdate.hcJSON.series[series.index].data[point.index] = {
                    y: value,
                    toolText: point.toolText,
                    displayValue: point.displayValue
                };
                extend2(iapi.chartInstance.jsVars._reflowData, reflowUpdate,
                    true);
            }
        },

        drawTracker: function() {
            var series = this,
            chart = series.chart,
            renderer = chart.renderer,
            yAxis = series.yAxis,
            TRACKER_RADIUS = hasTouch ? 15 : 3,
            trackerLabel = +new Date(),
            options = series.options,
            threshold = pluckNumber(options.threshold,
                mathMax(series.yAxis.options.min, 0), 0),
            plotLines = yAxis.options.plotLines,
            yAxisPlotLines = series._yAxisPlotLines = [],
            index = 0,
            css = {
                cursor: 'n-resize',
                '_cursor': 'n-resize'
            },
            cssLink = {
                cursor : 'pointer',
                '_cursor': 'hand'
            },
            plotLineObj,
            length,
            rel,
            pointY,
            shapeArgs,
            tracker;

            if (chart.options.chart.hasScroll) {
                chart.trackerGroup.clip(series.clipRect);
            }

            // Calculating threshold according to the 0 value
            options.translatedThreshold = chart.plotHeight -
                yAxis.translate(mathMax(yAxis.options.min, 0));
            // Storing px value of yAxis plotLines in series
            // to be use for snapping while drag
            for (length = plotLines.length; index < length; index += 1) {
                plotLineObj = plotLines[index];
                if (plotLineObj.isGrid) {
                    yAxisPlotLines.push(yAxis.translate(plotLineObj.value));
                }
            }

            each(series.data, function(point) {
                var pointX = point.plotX,
                pointY = point.plotY,
                radius = mathMax(pluckNumber(point.marker &&
                    point.marker.radius, 0), TRACKER_RADIUS),
                shapeArgs = {
                    x: pointX,
                    y: pointY,
                    radius: radius
                };

                tracker = point.dragTracker;

                if (point.y !== null) {
                    if (tracker) {// update
                        tracker.attr(shapeArgs);
                    } else {
                        // Storing dataLabel x in point for position dataLabel while
                        // dragging
                        point._dataLabelX = point.dataLabel && point.dataLabel.attr('x');
                        point._dataLabelHeight = point.dataLabel && point.dataLabel.getBBox().height;

                        point.dragTracker = renderer.circle(pointX, pointY,
                            radius)
                        .attr({
                            isTracker: trackerLabel,
                            'stroke-width': 1,
                            //stroke: '#FF0000',
                            //fill: {FCcolor: {color:'#000000', alpha: 40}},
                            stroke: TRACKER_FILL,
                            fill: TRACKER_FILL,
                            visibility: series.visible ? VISIBLE : HIDDEN,
                            zIndex:  options.zIndex || 1
                        })
                        .on(hasTouch ? 'touchstart' : 'mouseover',
                            function(event) {
                                rel = event.relatedTarget || event.fromElement;
                                if (chart.hoverSeries !== series && attr(rel,
                                    'isTracker') !== trackerLabel) {
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
                        .css(point.allowDrag ? css :
                            (point.link !== undefined ? cssLink : BLANK))
                        .add(point.group || chart.trackerGroup);

                        point.allowDrag && seriesTypes.dragcolumn.prototype.bindDragEvent
                        .call(series, point);
                    }
                }
            });
        }
    });


    /////////////// DragArea ///////////
    chartAPI('dragcolumn2d', extend({
        standaloneInit: true,
        creditLabel : creditLabel,
        decimals: 2,
        defaultSeriesType : 'dragcolumn',
        eiMethods: chartAPI.mscolumn2dbase.eiMethods
    }, dragExtension), chartAPI.mscolumn2dbase);


    /* ************************************************************************
     * Start DragColumn2D series code                                         *
     **************************************************************************/
    // 1 - Set default options
    defaultPlotOptions.dragcolumn = merge(defaultPlotOptions.column, {
        states: {
            hover: {}
        }
    });

    seriesTypes.dragcolumn = Highcharts.extendClass(seriesTypes.column, {
        type: 'dragcolumn',

        bindDragEvent: function (point, TRACKER_HEIGHT) {
            var series = this,
            graphic = point.dragTracker,
            //TRACKER_HEIGHT = hasTouch ? 20 : 10,
            HALF_TRACKER_HEIGHT = TRACKER_HEIGHT * 0.5,
            config = {
                series:  series,
                point:  point,
                changeY: 1
            };

            HALF_TRACKER_HEIGHT =  HALF_TRACKER_HEIGHT || 0;

            // Event to prevent click fire while dragging.
            addEvent(graphic.element, 'mousedown', dragChartsComponents.
                mouseDown, config);
            addEvent(graphic.element, 'click', dragChartsComponents.
                click, config);

            addEvent(graphic.element, 'dragstart drag dragend',
                dragChartsComponents.dragHandler, config);
        },

        repositionItems: function (config, x, y, isDragEnded) {
            var series = config.series,
            point = config.point,
            chart = series.chart,
            options = series.options,
            HCChartObj = chart.options.chart,
            translatedThreshold = options.translatedThreshold,
            plotHeight = chart.plotHeight,
            yAxis = series.yAxis,
            valuePadding = HCChartObj.valuePadding,
            doNotSnap = HCChartObj.doNotSnap,
            iapi = chart.options.instanceAPI,
            NumberFormatter = iapi.numberFormatter,
            pointY = point.plotY,
            GUTTER = 4,
            lowerDragBoundary = point.allowNegDrag ? plotHeight :
            translatedThreshold,
            value,
            reflowUpdate,
            dragOffsetY,
            formattedVal,
            shapeAttr = {},
            dataLabelAttr = {};

            dragOffsetY = pointY + y;

            if (dragOffsetY < 0) {
                dragOffsetY = 0;
            }
            if (dragOffsetY > lowerDragBoundary) {
                dragOffsetY = lowerDragBoundary;
            }
            // Snapping
            if (isDragEnded && !doNotSnap) {
                dragOffsetY = dragChartsComponents.snapPoint(series, point,
                    dragOffsetY);
            }

            y = dragOffsetY - pointY;
            // Positive y move
            if (dragOffsetY <= translatedThreshold) {
                shapeAttr.y = dragOffsetY;
                shapeAttr.height = translatedThreshold - shapeAttr.y;
            }
            else { // Negative y move
                shapeAttr.y = translatedThreshold;
                shapeAttr.height = dragOffsetY - shapeAttr.y;
            }

            // Positioning dataLabel
            value = mathRound(yAxis.translate(plotHeight - dragOffsetY, 1)
                * DECIMALS) / DECIMALS;
            formattedVal = NumberFormatter.dataLabels(value);

            dragChartsComponents.pointUpdate(point, formattedVal);
            dataLabelAttr = dragChartsComponents.getDataLabelY(series, point,
                dragOffsetY);
            dataLabelAttr.text = point.displayValue;
            dataLabelAttr.x = point._dataLabelX;

            point.graphic.attr(shapeAttr);
            point.tracker.attr(shapeAttr);
            point.dataLabel && point.dataLabel.attr(dataLabelAttr);
            point.dragTracker.translate(0, y);

            if (isDragEnded) {
                point.plotY = dragOffsetY;
                point.y = value;
                // Upadate Sahpe args
                point.shapeArgs.y = shapeAttr.y;
                point.shapeArgs.height = shapeAttr.height;
                // Upadate Drag tracker
                point._dTrackerY += y;
                point.dragTracker.attr({
                    y: point._dTrackerY
                });
                point.dragTracker.translate(0, 0.1);
                // Updating dataLabel and toolTip
                dragChartsComponents.pointUpdate(point, formattedVal);
                // Upadate ToolTip pos

                // Update data min and max
                dragChartsComponents.setMinMaxValue(series, iapi);

                // Save state
                reflowUpdate = {
                    hcJSON: {
                        series: []
                    }
                };
                reflowUpdate.hcJSON.series[series.index] = {
                    data: []
                };
                reflowUpdate.hcJSON.series[series.index].data[point.index] = {
                    y: value,
                    toolText: point.toolText,
                    displayValue: point.displayValue
                };
                extend2(iapi.chartInstance.jsVars._reflowData, reflowUpdate,
                    true);
            }
        },

        drawTracker: function() {
            var series = this,
            chart = series.chart,
            renderer = chart.renderer,
            TRACKER_HEIGHT = hasTouch ? 40 : 10,
            TRACKER_WIDTH = hasTouch ? 25 : 0,
            trackerLabel = +new Date(),
            options = series.options,
            yAxis = series.yAxis,
            plotLines = yAxis.options.plotLines,
            threshold = pluckNumber(options.threshold,
                mathMax(yAxis.options.min, 0)),
            translatedThreshold = options.translatedThreshold =
            mathCeil(yAxis.getThreshold(threshold)),
            yAxisPlotLines = series._yAxisPlotLines = [],
            index = 0,
            plotLineObj,
            length,
            width,
            pointY,
            pointH,
            shapeArgs,
            tracker;

            // Calculating threshold according to the 0 value
            options.translatedThreshold = chart.plotHeight -
                yAxis.translate(mathMax(yAxis.options.min, 0));

            // Calling the original drawTracker funtion of the columnChart.
            seriesTypes.column.prototype.drawTracker.apply(this, arguments);

            // Storing px value of yAxis plotLines in series
            // to be use for snapping while drag
            for (length = plotLines.length; index < length; index += 1) {
                plotLineObj = plotLines[index];
                if (plotLineObj.isGrid) {
                    yAxisPlotLines.push(yAxis.translate(plotLineObj.value));
                }
            }

            if (chart.options.chart.hasScroll) {
                chart.trackerGroup.clip(series.clipRect);
            }

            each(series.data, function(point) {
                tracker = point.dragTracker;
                shapeArgs = point.trackerArgs || point.shapeArgs || {};
                if (point.y !== null && point.allowDrag) {
                    if (tracker) {// update
                        tracker.attr(shapeArgs);
                    } else {
                        pointH = shapeArgs.y + shapeArgs.height;
                        pointY = (pointH > translatedThreshold ?
                            pointH : shapeArgs.y) - (TRACKER_HEIGHT * 0.5);
                        width = mathMax(TRACKER_WIDTH, shapeArgs.width);
                        point._dTrackerY = pointY;
                        // Storing dataLabel x in point for position dataLabel while
                        // dragging
                        point._dataLabelX = point.dataLabel && point.dataLabel.attr('x');
                        point._dataLabelHeight = point.dataLabel && point.dataLabel.getBBox().height;
                        point.dragTracker = renderer.rect(shapeArgs.x -
                            ((width - shapeArgs.width) * 0.5), pointY, width,
                            TRACKER_HEIGHT, 0)
                        .attr({
                            isTracker: trackerLabel,
                            'stroke-width': 1,
                            //stroke: '#FF0000',
                            //fill: {FCcolor: {color:'#000000', alpha: 40}},
                            stroke: TRACKER_FILL,
                            fill: TRACKER_FILL,
                            visibility: series.visible ? VISIBLE : HIDDEN,
                            zIndex:  options.zIndex || 1
                        })
                        .css({
                            cursor: 'n-resize'
                        })
                        .add(point.group || chart.trackerGroup);
                        series.bindDragEvent(point, TRACKER_HEIGHT);
                    }
                }
            });
        }
    });


    /////////////// DragArea ///////////
    chartAPI('selectscatter', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'scatter',
        defaultZeroPlaneHighlighted: false,
        spaceManager: dragExtension.spaceManager,
        drawButtons: dragExtension.drawButtons,

        updateChartWithData: dragExtension.updateChartWithData,
        eiMethods: extend(extend(extend({}, chartAPI.scatterbase.eiMethods),
            dragExtension.eiMethods), {
                getData: function (format) {
                    // create a two dimensional array as given in the docs
                    var vars = this.jsVars,
                        iapi = vars.instanceAPI,
                        dataObj = iapi.getCollatedData(),
                        returnObj = [],
                        datasets = dataObj.dataset,
                        length = (datasets && datasets.length) || 0,
                        index = 0,
                        NULLSTR = 'null',
                        dsInd = 0,
                        setLen,
                        set,
                        j;


                    // When a format is provided
                    if (format) {
                        // no transcoding needed for json
                        if (/^json$/ig.test(format)) {
                            returnObj = dataObj;
                        }
                        else if (/^csv$/ig.test(format)) {
                            returnObj = iapi.getCSVString();
                        }
                        else {
                            returnObj = global.core.transcodeData(dataObj,
                                'json', format);
                        }
                    }
                    // if no format has been specified, return data as 2d array.
                    else {
                        //while (length--) {
                        for (; index < length; index +=1) {
                            set = datasets[index];
                            if (set) {
                                set = datasets[index] && datasets[index].data;
                                j = setLen = (set && set.length) || 0;
                                j && (returnObj[dsInd] || (returnObj[dsInd] =
                                    [getValidValue(datasets[index].id, NULLSTR)]));
                                while (j--) {
                                    returnObj[dsInd][j + 1] = getValidValue(set[j].id, NULLSTR);
                                }

                                setLen && (dsInd += 1);
                            }
                        }
                    }
                    return returnObj;
                }
            }),

        getCSVString: function () {
            var api = this,
                fcObj = api.chartInstance,
                dataObj = fcObj.getData(),
                i = dataObj.length;

            while (i--) {
                dataObj[i] = dataObj[i].join(",");
            }

            return dataObj.join("|");
        },
        getCollatedData: function () {
            var api = this,
                fcObj = api.chartInstance,
                state = fcObj.__state,
                vars = fcObj.jsVars,
                selectedArr = api.hcInstance._selectEleArr,
                len = selectedArr && selectedArr.length,
                origChartData = extend2({}, fcObj.getChartData(FusionChartsDataFormats.JSON)),
                origDataSets = origChartData.dataset,
                oriDataArr,
                selectionBoxObj,
                lenDS,
                setObj,
                dataLen,
                startX,
                endX,
                startY,
                endY,
                selectedData = [];

                //if (state.hasStaleData !== undefined && !state.hasStaleData) {
                //    return api.updatedDataObj;
                //}

                while (len-- ) {
                    selectionBoxObj = selectedArr[len];
                    startX = selectionBoxObj.startX;
                    endX = selectionBoxObj.endX;
                    startY = selectionBoxObj.startY;
                    endY = selectionBoxObj.endY;
                    lenDS = origDataSets.length;

                    while (lenDS--) {
                        selectedData[lenDS] || (selectedData[lenDS] = {
                            data: []
                        });
                        oriDataArr = origDataSets[lenDS].data;
                        dataLen = oriDataArr && oriDataArr.length;
                        while (dataLen--) {
                            setObj = oriDataArr[dataLen];
                            if (setObj.x > startX && setObj.x < endX &&
                                setObj.y < startY && setObj.y > endY) {
                                selectedData[lenDS].data[dataLen] = true;
                            }
                        }
                    }
                }

                lenDS = origDataSets.length;
                while (lenDS--) {
                    oriDataArr = origDataSets[lenDS].data;
                    dataLen = oriDataArr && oriDataArr.length;
                    while (dataLen--) {
                        if (!(selectedData[lenDS] && selectedData[lenDS].data[dataLen])) {
                            oriDataArr.splice(dataLen, 1);
                        }
                    }
                }

            //state.hasStaleData = false;
            return (api.updatedDataObj = origChartData);
        },

        onSelectionChange: function (event) {

            var chart = event.chart,
                renderer = chart.renderer,
                chartOptions = chart.options.chart,
                left = event.selectionLeft,
                top = event.selectionTop,
                width = event.selectionWidth,
                height = event.selectionHeight,
                trackerLabel = +new Date(),
                TRACKER_WIDTH = 12,
                TRACKER_HALF_WIDTH = TRACKER_WIDTH * 0.5,
                trackerRadius = 12,
                resizeInnerSymbolColor = '#999999',
                resizeOuterSymbolColor = '#777777',
                x = left + width,
                y = top + height,
                _x = 0,
                _y = 0,
                closeButtonTrackerRadius = hasTouch ? 15 : 8,
                closeButtonRadius = 6,
                cornerSymbolRadius = 15,
                isSmall = width > cornerSymbolRadius &&
                height > cornerSymbolRadius,
                point = {
                    left: left,
                    width: width,
                    top: top,
                    height: height,
                    trackerRadius: trackerRadius,
                    trackerWidth: TRACKER_WIDTH,
                    cornerSymbolRadius: cornerSymbolRadius,
                    closeButtonRadius: closeButtonRadius
                },
                containerGroup,
                cornerGroupTracker,
                closeButtonGroup;

            // hide tooltip
            if (chart.tooltip) {
                chart.tooltip.hide();
            }

            chart._selectEle || (chart._selectEle = []);
            chart.repositionItems || (chart.repositionItems =
                chartAPI.selectscatter.repositionItems);
            chart.dragStartHandler || (chart.dragStartHandler =
                chartAPI.selectscatter.dragStartHandler);

            containerGroup = point.containerGroup =
            renderer.g('container')
            .attr({
                isOverlay: true,
                visibility: VISIBLE,
                zIndex: 6
            })
            .add(chart.trackerGroup);

            // Add click event to container group to bring the selection in
            // front.
            addEvent(containerGroup.element, hasTouch ? 'touchstart' : 'click', function () {
                containerGroup && containerGroup.element && containerGroup.toFront();
            });

            cornerGroupTracker = point.cornerGroupTracker =
            renderer.g('corner-resize')
            .attr({
                isOverlay: true,
                visibility: VISIBLE,
                zIndex: 6
            })
            .translate(x, y)
            .add(containerGroup);

            closeButtonGroup = point.closeButtonGroup =
            renderer.g('close-button')
            .attr({
                isOverlay: true,
                visibility: VISIBLE,
                zIndex: 6
            })
            .translate(x, top)
            .add(containerGroup);

            // Create an array to store the select box element and
            // its tracker.
            chart._selectEleArr || (chart._selectEleArr = []);

            // Drawing the main box element
            point.selectTracker = renderer.rect(left, top, width,
                height, 0, 1)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 1,
                stroke: chartOptions.selectBorderColor,
                fill: chartOptions.selectFillColor
            })
            .css({
                cursor: 'move',
                _cursor: 'move'
            })
            .add(containerGroup);

            // Draw left tracker element
            point.leftTracker = renderer.rect(left - TRACKER_HALF_WIDTH,
                top, TRACKER_WIDTH, height, 0)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 0,
                fill: TRACKER_FILL
            })
            .css({
                cursor: 'e-resize',
                _cursor: 'e-resize'
            })
            .add(containerGroup);

            // Draw right tracker element
            point.rightTracker = renderer.rect(left + width -
                TRACKER_HALF_WIDTH, top, TRACKER_WIDTH, height, 0)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 0,
                fill: TRACKER_FILL
            })
            .css({
                cursor: 'e-resize',
                _cursor: 'e-resize'
            })
            .add(containerGroup);

            // Draw top tracker element
            point.topTracker = renderer.rect(left, top -
                TRACKER_HALF_WIDTH, width, TRACKER_WIDTH, 0)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 0,
                fill: TRACKER_FILL
            })
            .css({
                cursor: 's-resize',
                _cursor: 's-resize'
            })
            .add(containerGroup);

            // Draw bottom tracker element
            point.bottomTracker = renderer.rect(left, top + height -
                TRACKER_HALF_WIDTH, width, TRACKER_WIDTH, 0)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 0,
                fill: TRACKER_FILL
            })
            .css({
                cursor: 's-resize',
                _cursor: 's-resize'
            })
            .add(containerGroup);


            point.cornerInnerSymbol = renderer.symbol('resizeIcon', _x,
                _y, cornerSymbolRadius)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 1,
                visibility: isSmall ? VISIBLE : HIDDEN,
                stroke: resizeInnerSymbolColor
            })
            .add(cornerGroupTracker);

            point.cornerOuterSymbol = renderer.symbol('resizeIcon', _x,
                _y, -cornerSymbolRadius * 0.8)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 1,
                visibility: !isSmall ? VISIBLE : HIDDEN,
                stroke: resizeOuterSymbolColor
            })
            .add(cornerGroupTracker);


            point.cornerTracker = renderer.circle(_x, _y, trackerRadius)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                'stroke-width': 1,
                stroke: TRACKER_FILL,
                fill: TRACKER_FILL
            })
            .css({
                cursor: 'nw-resize',
                _cursor: 'nw-resize'
            })
            .add(cornerGroupTracker);

            point.closeButtonSymbol = renderer.symbol('closeIcon',
                0, 0, closeButtonRadius,
                chartOptions, renderer)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 2,
                visibility: VISIBLE,
                stroke: chartOptions.selectionCancelButtonBorderColor,
                fill: chartOptions.selectionCancelButtonFillColor,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            })
            .add(closeButtonGroup);

            point.closeButtonTracker = renderer.circle(0, 0,
                closeButtonTrackerRadius)
            .attr({
                isTracker: trackerLabel,
                isOverlay: true,
                strokeWidth: 0,
                visibility: VISIBLE,
                fill: TRACKER_FILL
            })
            .css({
                cursor : 'pointer',
                _cursor: 'hand'
            })
            .add(closeButtonGroup);

            dragChartsComponents.setSelectBoxValues(point, chart);
            chart._selectEleArr.push(point);
            point.index = chart._selectEleArr.length - 1;
            chartAPI.selectscatter.bindDragEvent(chart, point);
        },

        postSeriesAddition: function (hc, fc) {
            var iapi = this,
                ret = chartAPI.scatter && chartAPI.scatter.postSeriesAddition &&
                chartAPI.scatter.postSeriesAddition.apply(iapi, arguments),
                HCChartObj = hc.chart,
                FCChartObj = fc.chart,
                paletteIndex = hc.chart.paletteIndex,
                repositionItems = iapi.repositionItems,
                borderColor = pluck(FCChartObj.selectbordercolor,
                    defaultPaletteOptions.canvasBorderColor[paletteIndex]),
                borderAlpha = pluckNumber(FCChartObj.selectborderalpha,
                defaultPaletteOptions.canvasBorderAlpha[paletteIndex]);

            HCChartObj.selectBorderColor = //convertColor(borderColor, borderAlpha);
                {
                    FCcolor: {
                        color: borderColor,
                        alpha: borderAlpha
                    }
                };
            HCChartObj.selectFillColor = convertColor(
                pluck(FCChartObj.selectfillcolor,
                    defaultPaletteOptions.altHGridColor[paletteIndex]),
                pluckNumber(FCChartObj.selectfillalpha,
                    defaultPaletteOptions.altHGridAlpha[paletteIndex]));

            HCChartObj.selectionCancelButtonBorderColor = convertColor(pluck(
                FCChartObj.selectioncancelbuttonbordercolor, borderColor),
                pluckNumber(FCChartObj.selectioncancelbuttonborderalpha, borderAlpha));
            HCChartObj.selectionCancelButtonFillColor = convertColor(pluck(
                FCChartObj.selectioncancelbuttonfillcolor, 'FFFFFF'),
                pluckNumber(FCChartObj.selectioncancelbuttonfillalpha, 100));

            hc.chart.nativeZoom = false;

            HCChartObj.formAction = getValidValue(FCChartObj.formaction);

            if (FCChartObj.submitdataasxml === '0' && !FCChartObj.formdataformat) {
                FCChartObj.formdataformat = FusionChartsDataFormats.CSV
            }

            HCChartObj.formDataFormat = pluck(FCChartObj.formdataformat,
                FusionChartsDataFormats.XML);
            HCChartObj.formTarget = pluck(FCChartObj.formtarget, '_self');
            HCChartObj.formMethod = pluck(FCChartObj.formmethod, 'POST');
            HCChartObj.submitFormAsAjax = pluckNumber(FCChartObj.submitformasajax, 0);


            (hc.callbacks || (hc.callbacks = [])).push(function (chart, iapi) {

                chart.repositionItems = repositionItems;

                addEvent(chart, 'selection', iapi.onSelectionChange);
            });

            hc.chart.zoomType = 'xy';
            return ret;
        },

        dragStartHandler: function (config) {
            var point = config.point;
            point.cornerInnerSymbol.hide();
            point.cornerOuterSymbol.hide();
            point.closeButtonGroup.hide();
        },

        repositionItems: function (config, x, y, isDragEnded) {
            var point = config.point,
                box = point.selectTracker,
                id = config.id,
                tracker = id == CORNER || id == SELECT ? undefined :
                    point[id + TRACKER],
                //tracker = point[id + TRACKER],
                chart = config.series,
                plotHeight = chart.plotHeight,
                HALF_TRACKER_WIDTH = point.trackerWidth * 0.5,
                plotWidth = chart.plotWidth,
                left = mathFloor(point.left),
                top = mathFloor(point.top),
                height = mathFloor(point.height),
                width = mathFloor(point.width),
                dragOffsetX = left + x,
                dragOffsetY = top + y,
                attrib = {},
                attr = {},
                _x = x,
                _y = y,
                leftAttr,
                rightAttr,
                topAttr,
                bottomAttr;

            switch (id) {
                case POSITION_TOP:
                    if (dragOffsetY < 0) {
                        dragOffsetY = 0;
                    }
                    if (dragOffsetY > plotHeight) {
                        dragOffsetY = plotHeight;
                    }
                    y = dragOffsetY - top;

                    attrib.y = mathMin(top + height, dragOffsetY) + POINT_FIVE;
                    // Height can't be 0 in any case
                    attrib.height = mathAbs(height - y) || 1;
                break;
                case POSITION_BOTTOM:
                    if (dragOffsetY + height > plotHeight) {
                        dragOffsetY = plotHeight - height;
                    }
                    if (dragOffsetY + height < 0) {
                        dragOffsetY = - height;
                    }
                    y = dragOffsetY - top;
                    attrib.y = mathMin(top + height + y, top) + POINT_FIVE;
                    // Height can't be 0 in any case
                    attrib.height = mathAbs(height + y) || 1;
                break;
                case POSITION_LEFT:
                    if (dragOffsetX < 0) {
                        dragOffsetX = 0;
                    }
                    if (dragOffsetX > plotWidth) {
                        dragOffsetX = plotWidth;
                    }
                    x = dragOffsetX - left;
                    attrib.x = mathMin(left + width, dragOffsetX) + POINT_FIVE;
                    // Width can't be 0 in any case
                    attrib.width = mathAbs(width - x) || 1;
                break;
                case POSITION_RIGHT:
                    if (dragOffsetX + width > plotWidth) {
                        dragOffsetX = plotWidth - width;
                    }
                    if (dragOffsetX + width < 0) {
                        dragOffsetX = - width;
                    }
                    x = dragOffsetX - left;
                    attrib.x = mathMin(dragOffsetX + width, left ) + POINT_FIVE;
                    // Width can't be 0 in any case
                    attrib.width = mathAbs(width + x) || 1;
                break;
                case CORNER:
                    if (dragOffsetX + width > plotWidth) {
                        dragOffsetX = plotWidth - width;
                    }
                    if (dragOffsetX + width < 0) {
                        dragOffsetX = - width;
                    }
                    if (dragOffsetY + height > plotHeight) {
                        dragOffsetY = plotHeight - height;
                    }
                    if (dragOffsetY + height < 0) {
                        dragOffsetY = - height;
                    }
                    x = dragOffsetX - left;
                    y = dragOffsetY - top;
                    attrib.y = mathMin(dragOffsetY + height, top) + POINT_FIVE;
                    attrib.x = mathMin(dragOffsetX + width, left) + POINT_FIVE;
                    attrib.height = mathAbs(height + y);
                    attrib.width = mathAbs(width + x);
                    point.cornerGroupTracker.translate(left + width + x, top +
                        height + y);
                break;
                default:
                    if (dragOffsetX < 0) {
                        dragOffsetX = 0;
                    }
                    if (dragOffsetX + width > plotWidth) {
                        dragOffsetX = plotWidth - width;
                    }
                    if (dragOffsetY < 0) {
                        dragOffsetY = 0;
                    }
                    if (dragOffsetY + height > plotHeight) {
                        dragOffsetY = plotHeight - height;
                    }

                    x = dragOffsetX - left;
                    y = dragOffsetY - top;

                    attrib.x = (dragOffsetX) + POINT_FIVE;
                    attrib.y = (dragOffsetY) + POINT_FIVE;

                    point.cornerGroupTracker.translate(left + width + x, top +
                        height + y);
                break;
            }

            tracker && tracker.translate(x, y);
            box.attr(attrib);

            if (isDragEnded) {
                point.containerGroup.toFront();
                point.left = left = defined(attrib.x) ? attrib.x : point.left;
                point.top = top = defined(attrib.y) ? attrib.y : point.top;
                point.height = height = defined(attrib.height) ? attrib.height :
                    point.height;
                point.width = width = defined(attrib.width) ? attrib.width :
                    point.width;

                leftAttr = rightAttr = topAttr = bottomAttr = undefined;

                switch (id) {
                    case POSITION_TOP:
                        attr.y = top - HALF_TRACKER_WIDTH;
                        attr.x = left;
                        leftAttr = rightAttr = attrib;
                        point.bottomTracker.attr({y: top + height -
                                HALF_TRACKER_WIDTH});
                    break;
                    case POSITION_BOTTOM:
                        attr.y = top + height - HALF_TRACKER_WIDTH;
                        attr.x = left;
                        leftAttr = rightAttr = attrib;
                        point.topTracker.attr({y: top - HALF_TRACKER_WIDTH});
                    break;
                    case POSITION_LEFT:
                        attr.y = top;
                        attr.x = left - HALF_TRACKER_WIDTH;
                        topAttr = bottomAttr = attrib;
                        point.rightTracker.attr({x: left + width -
                                HALF_TRACKER_WIDTH});
                    break;
                    case POSITION_RIGHT:
                        attr.y = top;
                        attr.x = left + width - HALF_TRACKER_WIDTH;
                        topAttr = bottomAttr = attrib;
                        point.leftTracker.attr({x: left + -
                                HALF_TRACKER_WIDTH});
                    break;
                    default:
                        if (id == CORNER) {
                            attr.y = top + height;
                            attr.x = left + width;
                            point.cornerGroupTracker.translate(left + width,
                                top + height);
                        }
                        leftAttr = {
                            x: left - HALF_TRACKER_WIDTH,
                            y: top,
                            height: height
                        };
                        rightAttr = {
                            x: left + width - HALF_TRACKER_WIDTH,
                            y: top,
                            height: height
                        };
                        topAttr = {
                            x: left,
                            y: top - HALF_TRACKER_WIDTH,
                            width: width
                        };
                        bottomAttr = {
                            x: left,
                            y: top + height - HALF_TRACKER_WIDTH,
                            width: width
                        };
                    break;
                }

                point.leftTracker.attr(leftAttr);
                point.rightTracker.attr(rightAttr);
                point.topTracker.attr(topAttr);
                point.bottomTracker.attr(bottomAttr);
                point.cornerGroupTracker.translate(left + width, top + height);

                dragChartsComponents.setSelectBoxValues(point, chart);

                point.closeButtonGroup.show();
                point.closeButtonGroup.translate(left + width, top);

                if (height > point.cornerSymbolRadius &&
                        width > point.cornerSymbolRadius) {
                    point.cornerInnerSymbol.show();
                }
                else {
                    point.cornerOuterSymbol.show();
                }

                tracker && tracker.attr(attr) && tracker.translate(0, 0.1);
            }
        },

        bindDragEvent: function (chart, point) {
            var element,
                configObj

            each([POSITION_TOP, POSITION_RIGHT, POSITION_BOTTOM, POSITION_LEFT,
                CORNER, SELECT], function (id) {
                element = point[id + TRACKER].element;
                configObj = {
                    series:  chart,
                    point:  point,
                    id: id
                };

                configObj.changeX = id === POSITION_LEFT ||
                    id === POSITION_RIGHT || id === CORNER || id === SELECT;
                configObj.changeY = id === POSITION_TOP ||
                    id === POSITION_BOTTOM || id === CORNER || id === SELECT;

                addEvent(element, 'dragstart drag dragend',
                    dragChartsComponents.dragHandler, configObj);
            });

            addEvent(point.closeButtonTracker.element, 'click', function (e) {
                var selectEleArr = chart._selectEleArr,
                len = selectEleArr.length;
                e.data.point.containerGroup.destroy();
                point.isDeleted = true;
                while (len--) {
                    selectEleArr[len].isDeleted && (selectEleArr.splice(len, 1));
                }
            }, {
                point: point
            });
        }
    }, chartAPI.scatterbase);


    /**
     * Symbol required for ZoomLine chart.
     */
    extend(Highcharts.Renderer.prototype.symbols, {

        resizeIcon: function (x, y, radius, options, renderer) {
            var
                LINE_GAP = pluckNumber(radius, 15) / 3,
                LINE_DIS = 3,
                paths = [],
                i;

                if (LINE_GAP < 0){
                    LINE_GAP = -LINE_GAP;
                    radius = -radius;
                    x += radius - LINE_GAP / 2;
                    y += radius - LINE_GAP / 2;
                }

            for (i = 3; i > 0; i -= 1) {
                paths.push(M, x - LINE_GAP * i, y - LINE_DIS,
                            L, x - LINE_DIS, y - LINE_GAP * i);
            }
            return paths;
        },

        closeIcon: function (x, y, r, options, renderer) {
            var
            icoX = x,
            icoY = y,
            rad = r * 1.3,
            startAngle = 43 * deg2rad,
            // to prevent cos and sin of start and end from becoming
            // equal on 360 arcs
            endAngle = 48 * deg2rad,
            startX = icoX + rad * mathCos(startAngle),
            startY = icoY + rad * mathSin(startAngle),
            endX = icoX + rad * mathCos(endAngle),
            endY = icoY + rad * mathSin(endAngle),
            paths,
            r1 = 0.71 * (r - 2),//(r - 2) * 0.5,
            r2 = 0.71 * (r - 2),//(r - 2) * 0.87,

            arcPath = renderer.getArcPath(icoX, icoY, startX, startY, endX,
                            endY, rad, rad, 0, 1);
            paths = ['M', startX , startY];
            paths = paths.concat(arcPath)
            paths = paths.concat([
                M, x + r1, y - r2,
                L, x - r1, y + r2,
                M, x - r1, y - r2,
                L, x + r1, y + r2
            ]);

            return paths;
        },
        configureIcon: function (x, y, r, options, renderer) {
            r = r - 1
            var k = 0.5,
            l = 0.25,
            r1 = r * 0.71,
            r2 = (r + 2) * 0.71,
            x1 = x - r,
            y1 = y - r,
            x2 = x + r,
            y2 = y + r,
            x3 = x + k,
            y3 = y + k,
            x4 = x - k,
            y4 = y - k,

            x5 = x1 - 2,
            y5 = y1 - 2,
            x6 = x2 + 2,
            y6 = y2 + 2,
            x7 = x + r1,
            y7 = y + r1,
            x8 = x - r1,
            y8 = y - r1,
            x9 = x + r2,
            y9 = y + r2,
            x10 = x - r2,
            y10 = y - r2,
            paths;

            paths = [ M, x1, y3, L, x5, y3, x5, y4, x1, y4,
                x8 - l, y8 + l, x10 - l, y10 + l, x10 + l, y10 - l, x8 + l, y8 - l,
                x4, y1, x4, y5, x3, y5, x3, y1,
                x7 - l, y8 - l, x9 - l, y10 - l, x9 + l, y10 + l, x7 + l, y8 + l,
                 x2, y4, x6, y4, x6, y3, x2, y3,
                x7 + l, y7 - l, x9 + l, y9 - l, x9 - l, y9 + l, x7 - l, y7 + l,
                 x3, y2, x3, y6, x4, y6, x4, y2,
                x8 + l, y7 + l, x10 + l, y9 + l, x10 - l, y9 - l, x8 - l, y7 - l, Z];
            return paths;
        },
        axisIcon: function (x, y, r, options, renderer) {
            r = r - 1
            var r1 = r * 0.33,
            r2 = r / 2,
            x1 = x - r,
            y1 = y - r,
            x2 = x + r2,
            y2 = y + r,
            x3 = x - r2,
            y3 = y + r1,
            y4 = y - r1,
            paths;

            paths = [ M, x1, y1, L, x2, y1, x2, y2, x1, y2, M, x3, y3, L, x2, y3,
            M, x3, y4, L, x2, y4];
            return paths;
        }
    });


    chartAPI('multiaxisline', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'line',

        drawAxisTrackerAndCheckBox: function () {
            var chart = this,
            plotLeft = chart.plotLeft,
            plotTop= chart.plotTop,
            plotWidth= chart.plotWidth,
            plotHeight= chart.plotHeight,
            renderer = chart.renderer,
            axisWidth = 40,
            yAxis = chart.yAxis,
            iapi = chart.options.instanceAPI,
            len = yAxis.length,
            leftAxisCount = 0,
            rightAxisCount = 0,
            css = {
                cursor: 'col-resize',
                '_cursor': 'e-resize',
                '*cursor': 'e-resize'
            },
            chartObj = iapi.chartInstance,
            vars = chartObj.jsVars,
            dataObj = iapi.dataObj,
            reflowData = vars._reflowData,
            reflowJSON = reflowData.hcJSON,
            origAxis = dataObj.axis,
            FCChartObj = dataObj.chart,
            allowAxisShift = pluckNumber(FCChartObj.allowaxisshift, 1),
            allowSelection = pluckNumber(FCChartObj.allowselection, 1),
            ui = allowSelection && renderer.html('div', {
                fill: 'transparent',
                width: chart.chartWidth,
                height: 20
            }, {
                fontSize: 10 + PX,
                lineHeight: 15 + PX
            }, chart.container),
            reflowYAxis = reflowJSON.yAxis || (reflowJSON.yAxis = []),
            isOpp,
            yAxisObj,
            yAxisOpt;

            while(len--) {
                yAxisObj = yAxis[len];
                yAxisOpt = yAxisObj.options;
                axisWidth = yAxisOpt._axisWidth;
                isOpp = yAxisOpt.opposite;
                if (!isOpp) {
                    leftAxisCount += axisWidth;
                }

                reflowYAxis[len] || (reflowYAxis[len] = {});

                // checkBox drawing
                if (allowSelection) {
                    yAxisObj.checkBox = renderer.html('input', {
                        x: plotLeft + (isOpp ? plotWidth + rightAxisCount +
                            pluckNumber(yAxisOpt.title.margin, axisWidth - 10) + 5 : -leftAxisCount),
                        y: plotTop + plotHeight + 10
                    })
                    .attr({
                        type: 'checkbox'
                    })
                    .add(ui);

                    yAxisObj.checkBox.val(yAxisOpt.hidedataplots);
                    // Hiding related series at first rendering
                    if (!yAxisOpt.hidedataplots) {
                        yAxisOpt._relatedSeries && each(yAxisOpt._relatedSeries,
                        function (index) {
                            chart.series[index].setVisible(false, false);
                        });
                    }

                    addEvent(yAxisObj.checkBox.element, hasTouch ? 'touchstart' :
                        'mousedown', function (e) {
                            var config = e.data,
                            yAxisOpt = config.axis[config.index].options,
                            relatedSeries = yAxisOpt._relatedSeries,
                            chkVal = !config.checkBox.checked();

                            // Hiding related series at checkbox click
                            relatedSeries && each(relatedSeries, function (index) {
                                chart.series[index].setVisible(chkVal, false);
                            });
                            // stroing checkbox clicked on original FC data for
                            // state management
                            origAxis[yAxisOpt._axisposition].hidedataplots = !chkVal;
                            extend2(reflowData, {
                                preReflowAdjustments: function () {
                                    this.dataObj.axis = origAxis;
                                }
                            });

                        }, {
                            axis: yAxis,
                            index: len,
                            checkBox: yAxisObj.checkBox
                        });
                }
                // End of checkBox drawing

                // Axis tracker drawing
                if (allowAxisShift) {
                    yAxisObj.tracker = renderer.rect(plotLeft +
                        (isOpp ? plotWidth + rightAxisCount : -leftAxisCount),
                        plotTop, axisWidth, plotHeight, 0)
                    .attr({
                        //stroke: TRACKER_FILL,
                        strokeWidth: 0,
                        fill: TRACKER_FILL,
                        isTracker:  +new Date(),
                        zIndex: 7
                    })
                    .css(css)
                    .add();

                    if (isOpp) {
                        rightAxisCount += axisWidth;
                    }

                    addEvent(yAxisObj.tracker.element, hasTouch ? 'touchstart' :
                        'mousedown', function (e) {
                            var config = e.data,
                            yAxis = config.axis,
                            index = config.index,
                            axisObj = yAxis[index],
                            isOpp = axisObj.options.opposite,
                            clickedAxisIndex = axisObj.options._axisposition,
                            ln = origAxis.length,
                            i,
                            FCAxisJSON,
                            fcOpp,
                            swapedIndex,
                            temp;

                            for (i = 0; i < ln; i +=1) {
                                FCAxisJSON = origAxis[i];
                                fcOpp = !pluckNumber(FCAxisJSON.axisonleft, 1);
                                if (fcOpp === isOpp){
                                    swapedIndex = i;
                                    //break the loop
                                    if (isOpp) {
                                        i = ln
                                    }
                                }
                            }
                            if (swapedIndex !== clickedAxisIndex) {
                                temp = origAxis.splice(swapedIndex, 1,
                                    origAxis[clickedAxisIndex]);
                                origAxis.splice(clickedAxisIndex, 1, temp[0]);
                            }
                            if (swapedIndex !== clickedAxisIndex ||
                                isOpp !== (!!iapi.dataObj.chart._lastClickedOpp)) {
                                extend2(reflowData, {
                                    preReflowAdjustments: function () {
                                        var iapi = this;
                                        iapi.dataObj.chart._lastClickedOpp = isOpp;
                                        iapi.dataObj.axis = origAxis;
                                    }
                                });

                                global.hcLib.createChart(chartObj, vars.container,
                                    vars.type, undefined, undefined, false);
                            }
                        }, {
                            axis: yAxis,
                            index: len
                        });
                }
                // End of Axis tracker drawing
            }
        },

        series : function () {
            var iapi = this,
                chartName = iapi.name,
                dataObj = iapi.dataObj,
                chartAttrs = dataObj.chart,
                axisAttrs = dataObj.axis,
                HCObj = iapi.hcJSON,
                conf = HCObj[CONFIGKEY],
                refAxis = HCObj.yAxis[0],
                allowSelection = pluckNumber(dataObj.chart.allowselection, 1),
                positionedAxisArr = [],
                showAxisNameInLegend = pluckNumber(chartAttrs.showaxisnamesinlegend, 0),
                yaxisvaluesstep = pluckNumber(chartAttrs.yaxisvaluesstep,
                    chartAttrs.yaxisvaluestep, 1),
                series,
                seriesArr,
                dataset,
                hasVisibleSeries,
                includeInLegend,
                showAxis,
                axisIndex,
                axisSeries,
                relatedSeries,
                l,
                axisJson,
                axisColor,
                isOpp,
                datasetIndex,
                datasetLen,
                yAxisConf,
                axisHEXColor,
                gridLineWidth,
                nearestLeftAxisIndex,
                nearestRightAxisIndex,
                visGridAxisIndex,
                tickWidth,
                axisLineThickness;

            if (!HCObj.callbacks) {
                HCObj.callbacks = [];
            }

            HCObj.callbacks.push(function () {
                iapi.drawAxisTrackerAndCheckBox.call(this);
            });

            //enable the legend
            HCObj.legend.enabled = Boolean(pluckNumber(dataObj.chart.showlegend, 1));

            if (axisAttrs && axisAttrs.length > 0) {
                this.categoryAdder(dataObj, HCObj);
                HCObj.yAxis.splice(0, 2);
                conf.noHiddenAxis = 0;

                // In case the axes have been re-shuffled, they will have the property
                // axisPosition, according to which they need to be placed in the chart.
                // Sorting on axisPosition will put them in the correct order to
                // be rendered.
                for (axisIndex = 0, l = axisAttrs.length; axisIndex < l; axisIndex += 1) {
                    axisJson = axisAttrs[axisIndex];
                    //for first time
                    if (axisJson._index === undefined) {
                        axisJson._index = axisIndex;
                    }
                    axisJson._axisposition = axisIndex;
                    isOpp = !pluckNumber(axisJson.axisonleft, 1);
                    if (isOpp) {
                        axisJson._isSY = true;
                        positionedAxisArr.unshift(axisJson);
                    }
                    else {
                        axisJson._isSY = false;
                        positionedAxisArr.push(axisJson);
                    }
                }

                for (axisIndex = 0, l = positionedAxisArr.length; axisIndex < l;
                        axisIndex += 1) {
                    axisJson = positionedAxisArr[axisIndex];
                    showAxis = pluckNumber(axisJson.showaxis, 1);

                    // Assigning id to the axis.
                    axisJson.id = l;

                    axisHEXColor = pluck(axisJson.color, chartAttrs.axiscolor,
                            HCObj.colors[axisJson._index % HCObj.colors.length]);
                    axisColor = convertColor(axisHEXColor, 100);
                    isOpp = !pluckNumber(axisJson.axisonleft, 1);
                    gridLineWidth = pluckNumber(axisJson.divlinethickness,
                            chartAttrs.divlinethickness, 1);
                    tickWidth = showAxis ? pluckNumber(axisJson.tickwidth, chartAttrs.axistickwidth, 2) : 0;
                    axisLineThickness = showAxis ?
                            pluckNumber(axisJson.axislinethickness,
                            chartAttrs.axislinethickness, 2) : 0;

                    //create conf obj
                    yAxisConf = conf[axisIndex] = {};
                    yAxisConf.showAxis = showAxis;
                    conf.noHiddenAxis += 1 - showAxis;

                    if (showAxis) {
                        if (isOpp) {
                            nearestRightAxisIndex = axisIndex;
                        }
                        else{
                            nearestLeftAxisIndex = axisIndex;
                        }
                    }

                    relatedSeries = [];
                    HCObj.yAxis.push({
                        startOnTick: false,
                        endOnTick : false,
                        _axisposition: axisJson._axisposition,
                        _isSY: axisJson._isSY,
                        hidedataplots: !pluckNumber(axisJson.hidedataplots, 0),
                        title : {
                            enabled : showAxis,
                            style: refAxis.title.style,
                            text : showAxis ? parseUnsafeString(axisJson.title) : BLANK,
                            align: allowSelection ? 'low' : 'middle',
                            textAlign: allowSelection && isOpp ? 'right' : undefined
                        },
                        labels: {
                            x : 0,
                            style: refAxis.labels.style
                        },
                        plotBands: [],
                        plotLines: [],
                        gridLineColor : convertColor(pluck(axisJson.divlinecolor, axisHEXColor),
                            pluckNumber(axisJson.divlinealpha, chartAttrs.divlinealpha,
                                defaultPaletteOptions.divLineAlpha[HCObj.chart.paletteIndex ], 100)),
                        gridLineWidth : gridLineWidth,
                        gridLineDashStyle : pluckNumber(axisJson.divlineisdashed,
                            chartAttrs.divlineisdashed, 0) ? getDashStyle(pluckNumber(axisJson.divlinedashlen,
                            chartAttrs.divlinedashlen, 4), pluckNumber(axisJson.divlinedashgap,
                            chartAttrs.divlinedashgap, 2), gridLineWidth) : undefined,
                        alternateGridColor : COLOR_TRANSPARENT,
                        //offset: (isOpp ? hc.chart.margin[1] : hc.chart.margin[3]) + 3, //set the offset during space management
                        lineColor: axisColor,
                        lineWidth: axisLineThickness,
                        tickLength: tickWidth,
                        tickColor: axisColor,
                        tickWidth: axisLineThickness,
                        //set the axis position as per xml conf.
                        opposite: isOpp,
                        _relatedSeries: relatedSeries,
                        showAxis: showAxis
                    });

                    //add axis configuration
                    yAxisConf.yAxisValuesStep = pluckNumber(axisJson.yaxisvaluesstep, axisJson.yaxisvaluestep, yaxisvaluesstep);
                    yAxisConf.maxValue = axisJson.maxvalue;
                    yAxisConf.tickWidth = tickWidth;
                    yAxisConf.minValue = axisJson.minvalue;
                    yAxisConf.setadaptiveymin = pluckNumber(axisJson.setadaptiveymin, chartAttrs.setadaptiveymin);
                    yAxisConf.numDivLines = pluckNumber(axisJson.numdivlines, chartAttrs.numdivlines, 4);
                    yAxisConf.adjustdiv = pluckNumber(axisJson.adjustdiv, chartAttrs.adjustdiv);
                    yAxisConf.showYAxisValues = showAxis ? pluckNumber(axisJson.showyaxisvalues,
                        axisJson.showyaxisvalue, chartAttrs.showyaxisvalues, chartAttrs.showyaxisvalue, 1) : 0;
                    yAxisConf.showLimits = showAxis ? pluckNumber(axisJson.showlimits, chartAttrs.showlimits,
                        yAxisConf.showYAxisValues) : 0;
                    yAxisConf.showDivLineValues = showAxis ? pluckNumber(axisJson.showdivlinevalue,
                        chartAttrs.showdivlinevalues, axisJson.showdivlinevalues,
                        yAxisConf.showYAxisValues) : 0;
                    yAxisConf.showzeroplane = axisJson.showzeroplane;
                    yAxisConf.showzeroplanevalue  = pluckNumber(axisJson.showzeroplanevalue);
                    yAxisConf.zeroplanecolor = axisJson.zeroplanecolor;
                    yAxisConf.zeroplanethickness = axisJson.zeroplanethickness;
                    yAxisConf.zeroplanealpha = axisJson.zeroplanealpha;

                    yAxisConf.linecolor = pluck(axisJson.linecolor,
                        chartAttrs.linecolor || axisJson.color,
                        HCObj.colors[axisJson._index % HCObj.colors.length]);
                    yAxisConf.linealpha = axisJson.linealpha;
                    yAxisConf.linedashed = axisJson.linedashed;
                    yAxisConf.linethickness = axisJson.linethickness;
                    yAxisConf.linedashlen = axisJson.linedashlen;
                    yAxisConf.linedashgap = axisJson.linedashgap;

                        //put all series now
                    if (axisJson.dataset && axisJson.dataset.length > 0) {
                        datasetLen = axisJson.dataset.length;
                        // Whether to include in series or not
                        includeInLegend = pluckNumber(axisJson.includeinlegend, 1);
                        hasVisibleSeries = false;
                        axisSeries = {
                            data: [],
                            relatedSeries: relatedSeries,
                            name: parseUnsafeString(axisJson.title),
                            type: 'line',
                            marker: {
                                symbol: 'axisIcon',
                                fillColor: TRACKER_FILL,
                                lineColor: getDarkColor(axisHEXColor, 80).replace(dropHash, HASHSTRING)
                            },
                            lineWidth: 0,
                            legendFillColor: showAxisNameInLegend != 0  ?
                                convertColor(axisHEXColor , 25) : undefined,
                            legendFillOpacity: 0,
                            legendIndex: axisJson._index,
                            showInLegend: Boolean(pluckNumber(showAxisNameInLegend, includeInLegend))
                        }
                        HCObj.series.push(axisSeries);

                        for (datasetIndex = 0; datasetIndex < datasetLen; datasetIndex += 1) {
                            dataset = axisJson.dataset[datasetIndex];
                            if (dataset.color === undefined) {
                                dataset.color = pluck(yAxisConf.linecolor, axisHEXColor);
                            }
                            series = {
                                yAxis : axisIndex,
                                data : []
                            };
                            //add data to the series
                            seriesArr = this.point(chartName, series,
                                dataset, dataObj.chart, HCObj, conf.oriCatTmp.length,
                                axisIndex, ((axisJson._isSY) ? 1 : 0));
                            seriesArr.legendFillColor = axisSeries.legendFillColor;
                            seriesArr.legendIndex = axisJson._index;
                            if (seriesArr.showInLegend == undefined ||
                                    seriesArr.showInLegend == true) {
                                hasVisibleSeries = true;
                            }
                            if (seriesArr.showInLegend !== false) {
                                seriesArr.showInLegend = Boolean(includeInLegend);
                            }
                            relatedSeries.push(HCObj.series.length);
                            HCObj.series.push(seriesArr);
                        }

                        if (relatedSeries.length == 0 || !hasVisibleSeries) {
                            axisSeries.showInLegend = false;
                        }
                    }
                }

                visGridAxisIndex = chartAttrs._lastClickedOpp ?
                    pluckNumber(nearestRightAxisIndex, nearestLeftAxisIndex) :
                    pluckNumber(nearestLeftAxisIndex, nearestRightAxisIndex);

                for (axisIndex = 0, l = HCObj.yAxis.length; axisIndex < l; axisIndex += 1) {
                    if (axisIndex != visGridAxisIndex) {
                        HCObj.yAxis[axisIndex].gridLineWidth = 0;
                        conf[axisIndex].zeroplanethickness = 0;
                    }
                }

                ///configure the axis
                this.configureAxis(HCObj, dataObj);
            }
        },


        point: function (chartName, series, dataset, FCChartObj, HCObj, catLength, seriesIndex, isSY) {
            var hasValidPoint = false,
                itemValue,
                index,
                dataParser,
                dataObj,
                HCChartObj = HCObj.chart,
                // Data array in dataset object
                data = dataset.data || [],
                // HighChart configuration object
                conf = HCObj[CONFIGKEY],
                yAxisConf = conf[series.yAxis],
                // take the series type
                seriesType = pluck(series.type, this.defaultSeriesType),
                // Check the chart is a stacked chart or not
                isStacked = HCObj.plotOptions[seriesType] && HCObj.plotOptions[seriesType].stacking,
                // 100% stacked chart takes absolute values only
                isValueAbs = pluck(this.isValueAbs, conf.isValueAbs, false),
                seriesYAxis = pluckNumber(series.yAxis, 0),
                NumberFormatter = this.numberFormatter,

                // Line cosmetics attributes
                // Color of the line series
                lineColorDef = getFirstColor(pluck(dataset.color, yAxisConf.linecolor, FCChartObj.linecolor, HCObj.colors[seriesIndex % HCObj.colors.length])),
                // Alpha of the line
                lineAlphaDef = pluck(dataset.alpha, yAxisConf.linealpha, FCChartObj.linealpha, HUNDREDSTRING),
                showShadow = pluckNumber(FCChartObj.showshadow, this.defaultPlotShadow, 1),
                // Managing line series markers
                // Whether to drow the Anchor or not
                drawAnchors = pluckNumber(dataset.drawanchors, dataset.showanchors , FCChartObj.drawanchors, FCChartObj.showanchors),
                // Anchor cosmetics
                // We first look into dataset then chart obj and then default value.
                setAnchorSidesDef = pluckNumber(dataset.anchorsides,
                    FCChartObj.anchorsides, 0),
                setAnchorAngleDef = pluckNumber(dataset.anchorstartangle,
                    FCChartObj.anchorstartangle, 0),
                setAnchorRadiusDef = pluckNumber(dataset.anchorradius,
                    FCChartObj.anchorradius, 3),
                setAnchorBorderColorDef = getFirstColor(pluck(dataset.anchorbordercolor,
                    FCChartObj.anchorbordercolor, lineColorDef)),
                setAnchorBorderThicknessDef = pluckNumber(dataset.anchorborderthickness,
                    FCChartObj.anchorborderthickness, 1),
                setAnchorBgColorDef = getFirstColor(pluck(dataset.anchorbgcolor,
                    FCChartObj.anchorbgcolor, defaultPaletteOptions.anchorBgColor[HCObj.chart.paletteIndex])),
                setAnchorAlphaDef = pluck(dataset.anchoralpha, FCChartObj.anchoralpha,
                    HUNDREDSTRING),
                setAnchorBgAlphaDef = pluck(dataset.anchorbgalpha, FCChartObj.anchorbgalpha,
                    setAnchorAlphaDef);

            // Dataset seriesname
            series.name = getValidValue(dataset.seriesname);
            // If includeInLegend set to false
            // We set series.name blank
            if (pluckNumber(dataset.includeinlegend) === 0 ||
                series.name === undefined || (lineAlphaDef == 0 &&
                    drawAnchors !== 1)) {
                series.showInLegend = false;
            }

            //set the marker attr at series
            series.marker = {
                fillColor: {
                    FCcolor: {
                        color: setAnchorBgColorDef,
                        alpha: ((setAnchorBgAlphaDef * setAnchorAlphaDef) / 100) + BLANK
                    }
                },
                lineColor: {
                    FCcolor: {
                        color: setAnchorBorderColorDef,
                        alpha: setAnchorAlphaDef + BLANK
                    }
                },
                lineWidth: setAnchorBorderThicknessDef,
                radius: setAnchorRadiusDef,
                symbol: mapSymbolName(setAnchorSidesDef),
                startAngle: setAnchorAngleDef
            };

            // Set the line color and alpha to
            // HC seris obj with FusionCharts color format using FCcolor obj
            series.color = {
                FCcolor: {
                    color: lineColorDef,
                    alpha: lineAlphaDef
                }
            };
            // For Spline Chart shadow do not works at point label.
            series.shadow = showShadow ? {
                opacity: showShadow ? lineAlphaDef / 100 : 0
            } : false;

            // IF its a step line chart
            series.step = this.stepLine;
            // Special attribute for StepLine (drawVerticalJoins)
            series.drawVerticalJoins = Boolean(pluckNumber(FCChartObj.drawverticaljoins, 1));
            series.useForwardSteps = Boolean(pluckNumber(FCChartObj.useforwardsteps, 1));

            // Set the line thickness (line width)
            series.lineWidth = pluckNumber(dataset.linethickness, yAxisConf.linethickness, FCChartObj.linethickness, 2);


            dataParser = series._dataParser = getDataParser.line(HCObj, {
                seriesname : series.name,
                lineAlpha : lineAlphaDef,
                anchorAlpha : setAnchorAlphaDef,
                showValues : pluckNumber(dataset.showvalues, conf.showValues),
                yAxis : isSY,
                lineDashed : Boolean(pluckNumber(dataset.dashed, yAxisConf.linedashed, FCChartObj.linedashed, 0)),
                lineDashLen : pluckNumber(dataset.linedashlen, yAxisConf.linedashlen, FCChartObj.linedashlen, 5),
                lineDashGap : pluckNumber(dataset.linedashgap, yAxisConf.linedashgap, FCChartObj.linedashgap, 4),
                lineThickness : series.lineWidth,
                lineColor : lineColorDef,
                valuePosition : pluck(dataset.valueposition, HCChartObj.valuePosition),
                drawAnchors : drawAnchors,
                anchorBgColor : setAnchorBgColorDef,
                anchorBgAlpha : setAnchorBgAlphaDef,
                anchorBorderColor : setAnchorBorderColorDef,
                anchorBorderThickness : setAnchorBorderThicknessDef,
                anchorRadius : setAnchorRadiusDef,
                anchorSides : setAnchorSidesDef,
                anchorAngle : setAnchorAngleDef,
                // also sending FusionCharts dataset to pick new attributes if
                // needed in any new chart type.
                _sourceDataset: dataset
            }, this);



            // Iterate through all level data
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
                    //set the flag
                    hasValidPoint = true;

                    //push the point object
                    series.data.push(dataParser(dataObj, index, itemValue));

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

            if (!hasValidPoint && !this.realtimeEnabled) {
                series.showInLegend = false
            }

            //return series
            return series;
        },

        configureAxis : function (HCObj, FCObj) {
            var conf = HCObj[CONFIGKEY], xAxisObj = HCObj.xAxis, xConf = conf.x,
            FCchartObj = FCObj.chart,
            yAxisObj, i, len, yAxisConf, yAxisMaxValue, yAxisMinValue, stopMaxAtZero,
            setMinAsZero, setadaptiveymin,
            numDivLines, adjustDiv, showLimits, showDivLineValues,
            yaxisvaluesstep, y;

            /**
             * configure x axis
             */

            //add xaxisTitle
            xAxisObj.title.text = parseUnsafeString(FCchartObj.xaxisname);

            /**
             * configure y axis
             */
            for (y = 0, len = HCObj.yAxis.length; y < len; y += 1) {
                yAxisObj = HCObj.yAxis[y];
                yAxisConf = conf[y]
                yaxisvaluesstep = pluckNumber(yAxisConf.yAxisValuesStep, 1);
                yaxisvaluesstep = yaxisvaluesstep < 1 ? 1 : yaxisvaluesstep;
                yAxisMaxValue = yAxisConf.maxValue;
                yAxisMinValue = yAxisConf.minValue;


                // adaptiveymin is available for non-stack charts
                setadaptiveymin = pluckNumber(yAxisConf.setadaptiveymin, 0);

                setMinAsZero = stopMaxAtZero = !setadaptiveymin;
                numDivLines = yAxisConf.numDivLines;
                adjustDiv = yAxisConf.adjustdiv !== 0;
                showLimits = yAxisConf.showLimits;
                showDivLineValues = yAxisConf.showDivLineValues;





                //////////////////////calculate the axis min max and the div interval for y axis ///////////////////
                this.axisMinMaxSetter (yAxisObj, yAxisConf, yAxisMaxValue, yAxisMinValue, stopMaxAtZero,
                    setMinAsZero, numDivLines, adjustDiv);

                // create label category and remove trend obj if out side limit
                this.configurePlotLines(FCchartObj, HCObj, yAxisObj, yAxisConf, showLimits, showDivLineValues,
                    yaxisvaluesstep, this.numberFormatter, yAxisObj._isSY);

                if (yAxisObj.reversed && yAxisObj.min >= 0) {
                    HCObj.plotOptions.series.threshold = yAxisObj.max;
                }

            }

        },
        spaceManager: function (hcJSON, fcJSON, width, height) {

            var conf = hcJSON[CONFIGKEY], axisConf, axisObj,
            canvasWidth, fcJSONChart = fcJSON.chart,
            isDual = false, yAxisNamePadding, yAxisValuesPadding, rotateYAxisName,

            marginLeftExtraSpace = conf.marginLeftExtraSpace,
            marginTopExtraSpace = conf.marginTopExtraSpace,
            marginBottomExtraSpace = conf.marginBottomExtraSpace,
            marginRightExtraSpace = conf.marginRightExtraSpace,
            workingWidth = width - (marginLeftExtraSpace + marginRightExtraSpace +
                hcJSON.chart.marginRight + hcJSON.chart.marginLeft),
            workingHeight = height - (marginBottomExtraSpace + hcJSON.chart.marginBottom +
                hcJSON.chart.marginTop),

            //calculate the min width, height for canvas
            minCanWidth = workingWidth * 0.3,
            minCanHeight = workingHeight * 0.3,

            // calculate the space remaining
            availableWidth = workingWidth - minCanWidth,
            availableHeight = workingHeight - minCanHeight,

            //if the legend is at the right then place it and deduct the width
            //if at bottom calculate the space for legend after the vertical axis placed

            legendPos = pluck(fcJSONChart.legendposition, POSITION_BOTTOM).toLowerCase();

            if (hcJSON.legend.enabled && legendPos === POSITION_RIGHT) {
                availableWidth -= this.placeLegendBlockRight(hcJSON, fcJSON, availableWidth / 2, workingHeight);
            }

            /*
             * place the vertical axis
             */
            var yAxis = hcJSON.yAxis, isOpp,
            numAxis = yAxis.length,
            numVisAxis = numAxis - conf.noHiddenAxis;
            if (numVisAxis) {
                var y, canvasHeight, yAxisObj, yAxisConf,
                leftSpace = 0, rightSpace = 0, axisPad = 10, axisOffset, axisWidthUsed,
                extraWidth = 0, perAxisWidth = availableWidth / numVisAxis, axisSpecifficWidth,
                extra;
                for (y = numAxis - 1; y >= 0; y -= 1) {
                    yAxisObj = yAxis[y];
                    if (yAxisObj.showAxis) {
                        axisConf = conf[y];
                        isOpp = yAxisObj.opposite;
                        axisOffset = (isOpp ? rightSpace : leftSpace) + axisPad;
                        //add all axis margin pading
                        yAxisNamePadding = 4;
                        yAxisValuesPadding = axisConf.tickWidth;
                        rotateYAxisName = true;
                        axisConf.verticalAxisNamePadding = yAxisNamePadding;
                        axisConf.fixedValuesPadding = yAxisValuesPadding;
                        axisConf.verticalAxisValuesPadding = yAxisValuesPadding;
                        axisConf.rotateVerticalAxisName = rotateYAxisName;
                        axisConf.verticalAxisNameWidth = 50;
                        yAxisObj.offset = axisOffset;
                        axisSpecifficWidth = perAxisWidth + extraWidth - axisPad;
                        //now configure the axis
                        axisWidthUsed = placeVerticalAxis(yAxisObj, axisConf, hcJSON, fcJSON,
                            workingHeight, axisSpecifficWidth , isOpp, 0, 0);
                        axisWidthUsed += axisPad;

                        if (isOpp) {
                            rightSpace += axisWidthUsed;
                            hcJSON.chart.marginRight += axisPad;
                        }
                        else {
                            leftSpace += axisWidthUsed;
                            hcJSON.chart.marginLeft += axisPad;
                        }

                        extra = axisSpecifficWidth - axisWidthUsed;
                        extraWidth = extra;
                        availableWidth -= axisWidthUsed;
                        if (availableWidth < axisPad) {
                            axisPad = 0;
                        }
                        yAxisObj._axisWidth = axisWidthUsed;
                    }
                }
            }

            // adjust left and right canvas margins
            availableWidth -= adjustHorizontalCanvasMargin(hcJSON, fcJSON, availableWidth);

            //now thw canvas width is fixed(no element to reduce the width
            canvasWidth = availableWidth + minCanWidth;

            if (hcJSON.legend.enabled && legendPos !== POSITION_RIGHT) {
                availableHeight -= this.placeLegendBlockBottom(hcJSON, fcJSON, workingWidth,
                    availableHeight/2);
                    //remove alignment if it is wider
                    if (hcJSON.legend.width > canvasWidth) {
                        hcJSON.legend.x = 0;
                    }
            }

            /*
             * Now place the Title
             */
            //allowed height may

            availableHeight -= titleSpaceManager(hcJSON, fcJSON, canvasWidth,
                availableHeight/2);

            /*
             * Now place the horizontal axis
             */
            //add all axis margin pading
            axisConf = conf.x;
            axisConf.horizontalAxisNamePadding = pluckNumber(fcJSONChart.xaxisnamepadding, 5);
            axisConf.horizontalLabelPadding = pluckNumber(fcJSONChart.labelpadding, 2);
            axisConf.labelDisplay = (fcJSONChart.rotatelabels == "1") ? "rotate" :
            pluck(fcJSONChart.labeldisplay, "auto").toLowerCase();
            axisConf.staggerLines = pluckNumber(fcJSONChart.staggerlines, 2);
            axisConf.slantLabels = pluckNumber(fcJSONChart.slantlabels, fcJSONChart.slantlabel, 0);

            //set x axis min max
            this.xAxisMinMaxSetter(hcJSON, fcJSON, canvasWidth);

            availableHeight -= placeHorizontalAxis(hcJSON.xAxis, axisConf, hcJSON, fcJSON,
                canvasWidth, availableHeight, minCanWidth);

            // adjust top and bottom the canvas margins here
            availableHeight -= adjustVerticalCanvasMargin(hcJSON, fcJSON, availableHeight, hcJSON.xAxis);

            // checking after the finalizing of the canvas height whether, and to what extent should we
            canvasHeight = minCanHeight + availableHeight;
            for (y = 0; y < numAxis; y += 1) {
                // step them.
                stepYAxisNames(canvasHeight, hcJSON, fcJSONChart, hcJSON.yAxis[y], conf[y].lYLblIdx);
            }


            if (hcJSON.legend.enabled && legendPos === POSITION_RIGHT) {
                var legendObj = hcJSON.legend, extraWidth,
                maxHeight = minCanHeight + availableHeight;

                if (legendObj.height > maxHeight) {
                    legendObj.height = maxHeight;
                    legendObj.scroll.enabled = true;
                    extraWidth = (legendObj.scroll.scrollBarWidth = 10) + (legendObj.scroll.scrollBarPadding = 2);
                    legendObj.width += extraWidth;
                    hcJSON.chart.marginRight += extraWidth;
                }
                legendObj.y = 20;
            }

            var xc = ((hcJSON.chart.marginLeft - pluckNumber(hcJSON.chart.spacingLeft, 0)) - (hcJSON.chart.marginRight - pluckNumber(hcJSON.chart.spacingRight, 0))) / 2,
            xl = hcJSON.chart.marginLeft - pluckNumber(hcJSON.chart.spacingLeft, 0),
            xr = - (hcJSON.chart.marginRight - pluckNumber(hcJSON.chart.spacingRight, 0));
            switch (hcJSON.title.align) {
                case POSITION_LEFT :
                    hcJSON.title.x = xl;
                    break;
                case POSITION_RIGHT:
                    hcJSON.title.x = xr;
                    break;
                default:
                    hcJSON.title.x = xc;
            }
            switch (hcJSON.subtitle.align) {
                case POSITION_LEFT :
                    hcJSON.subtitle.x = xl;
                    break;
                case POSITION_RIGHT:
                    hcJSON.subtitle.x = xr;
                    break;
                default:
                    hcJSON.subtitle.x = xc;
            }


            /*
             * if the titles requared space and there has avaleble space the re-alocatethe title space
             */
            hcJSON.chart.marginLeft += marginLeftExtraSpace;
            hcJSON.chart.marginTop += marginTopExtraSpace;
            hcJSON.chart.marginBottom += marginBottomExtraSpace;
            hcJSON.chart.marginRight += marginRightExtraSpace;
        }
    }, chartAPI.mslinebase);


    ////////CandleStick///////
    chartAPI('candlestick', {
        standaloneInit: true,
        creditLabel : creditLabel,
        paletteIndex : 3,
        defaultSeriesType : 'candlestick',
        //placeLegendBlockBottom: false,

        series : function (FCObj, HCObj, chartName) {
            var index, length, conf = HCObj[CONFIGKEY],
            series, seriesArr, datasetObj, trendsetObj, volumeHeightPercent,
            plotHeight, volumeHeight,
            trendGroup;

            //enable the legend
            HCObj.legend.enabled = Boolean(pluckNumber(FCObj.chart.showlegend, 1));

            if (FCObj.dataset && FCObj.dataset.length > 0) {
                // add category
                this.categoryAdder(FCObj, HCObj);

                //place the series in oppside
                HCObj.yAxis[0].opposite = true;
                conf.numdivlines = getValidValue(FCObj.chart.numpdivlines);

                var volumeChart = jQuery.extend(true, {}, HCObj, {
                    chart: {
                        backgroundColor: 'rgba(255,255,255,0)',
                        borderColor: 'rgba(255,255,255,0)',
                        animation: false

                    },
                    title: {
                        text: null
                    },
                    subtitle: {
                        text: null
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        opposite: true,
                        labels: {
                            enabled: false
                        }
                    },
                    yAxis: [{
                        opposite: true,
                        title: {
                        //text: FCObj.chart.vyaxisname
                        },
                        plotBands: [],
                        plotLines: []
                    },{
                        opposite: false,
                        title: {
                            text: FCObj.chart.vyaxisname
                        }
                    }]
                });
                // Add dataset series
                for (index = 0, length = FCObj.dataset.length; index < length; index += 1) {
                    series = {
                        //yAxis: 1,
                        data : []
                    };
                    datasetObj = FCObj.dataset[index];
                    //add data to the series
                    seriesArr = this.point(chartName, series,
                        datasetObj, FCObj.chart, HCObj, conf.oriCatTmp.length,
                        index);

                    //if the returned series is an array of series (case: pareto)
                    if (seriesArr instanceof Array) {
                        if (pluckNumber(FCObj.chart.showvolumechart, 1)) {
                            //when it is an array then 2nd one is Volume chart
                            volumeChart.series.push({
                                type: 'column',
                                data: seriesArr[1]
                            });

                            volumeChart.showVolume = true;

                            volumeHeightPercent = pluckNumber(FCObj.chart.volumeheightpercent, 40);
                            volumeHeightPercent = volumeHeightPercent < 20 ? 20 : (volumeHeightPercent > 80 ? 80 : volumeHeightPercent);
                            plotHeight = conf.height - (HCObj.chart.marginBottom + HCObj.chart.marginTop);
                            volumeHeight = (plotHeight * volumeHeightPercent / 100);
                            var marginBottom = HCObj.chart.marginBottom + volumeHeight;

                            volumeChart[CONFIGKEY].marginTop = marginBottom + 40;
                            volumeChart.yAxis[0].plotBands = [];
                            volumeChart.yAxis[0].plotLines = [];
                            volumeChart.exporting.enabled = false;
                            volumeChart.yAxis[0].title.text = parseUnsafeString(getValidValue(FCObj.chart.vyaxisname));
                            volumeChart.yAxis[0].title.align = 'low';
                            volumeChart.chart.height = volumeHeight + 20;
                            volumeChart.chart.width = conf.width;
                            volumeChart.chart.top = plotHeight - volumeHeight;
                            volumeChart.chart.left = 0;
                            volumeChart.chart.volumeHeightPercent = volumeHeightPercent;

                            if (!HCObj.subCharts) {
                                HCObj.subCharts = [];
                            }
                            HCObj.subCharts.push(volumeChart);
                        }
                        HCObj.series.push(seriesArr[0]);
                    }
                    //all other case there will be only1 series
                    else {
                        HCObj.series.push(seriesArr);
                    }
                }

                // Add trendset series
                if (FCObj.trendset && FCObj.trendset.length > 0) {
                    for (index = 0, length = FCObj.trendset.length; index < length; index += 1) {
                        series = {
                            type: 'line',
                            //yAxis: 1,
                            marker: {
                                enabled: false
                            },
                            connectNullData: 1,
                            data : []
                        };
                        trendsetObj = FCObj.trendset[index];
                        //add data to the series
                        if (trendsetObj.data && trendsetObj.data.length > 0) {
                            seriesArr = this.getTrendsetPoint(chartName, series,
                                trendsetObj, FCObj.chart, HCObj, conf.oriCatTmp.length,
                                index);

                            HCObj.series.push(seriesArr);
                        }
                    }
                }

                // Making secondary yAxis default data Label hidden
                FCObj.chart.showdivlinesecondaryvalue = 0;
                FCObj.chart.showsecondarylimits = 0;

                ///configure the axis
                this.configureAxis(HCObj, FCObj);

                // To show the yAxis name in the chart
                // we use the secondary yAxis title and make opposite false
                // so that the yAxis title appears on left side of the chart
                HCObj.yAxis[1].opposite = false;
                HCObj.yAxis[1].min = HCObj.yAxis[0].min;
                HCObj.yAxis[1].max = HCObj.yAxis[0].max;
                HCObj.yAxis[1].title.text = HCObj.yAxis[0].title.text;
                HCObj.yAxis[0].title.text = BLANK;

                ///////////Trend-lines /////////////////
                //for log it will be done in configureAxis
                trendGroup = FCObj.trendlines && FCObj.trendlines[0] && FCObj.trendlines[0].line;
                if (trendGroup && trendGroup.length)
                {
                    for (var i = 0; i < trendGroup.length; i+= 1) {
                        trendGroup[i].parentyaxis='s';
                        trendGroup[i].valueonleft='1'
                    }
                    createTrendLine (FCObj.trendlines, HCObj.yAxis, conf,
                        true, this.isBar);
                }
            }
        },


        getTrendsetPoint: function (chartName, series, trendset, FCChartObj, HCObj) {
            if (trendset.data) {
                var
                data = trendset.data,
                length = data.length,
                index = 0,
                dataObj, itemValue, x,
                trendSetColor, trendSetAlpha, trendSetThickness, trendSetDashed,
                trendSetDashLen, trendSetDashGap, includeInLegend,
                conf = HCObj[CONFIGKEY],
                NumberFormatter = this.numberFormatter,
                toolText, toolTextObj = conf.toolTextStore;

                //Trend-sets default properties
                trendSetColor = getFirstColor(pluck(trendset.color, FCChartObj.trendsetcolor, "666666"));
                trendSetAlpha = pluck(trendset.alpha, FCChartObj.trendsetalpha, HUNDRED);
                trendSetThickness = pluckNumber(trendset.thickness, FCChartObj.trendsetthickness, 2);
                trendSetDashed = Boolean(pluckNumber(trendset.dashed, FCChartObj.trendsetdashed, 0));
                trendSetDashLen = pluckNumber(trendset.dashlen, FCChartObj.trendsetdashlen, 4);
                trendSetDashGap = pluckNumber(trendset.dashgap, FCChartObj.trendsetdashgap, 4);
                includeInLegend = pluck(trendset.includeinlegend, 1);

                series.color = convertColor(trendSetColor, trendSetAlpha);
                series.lineWidth = trendSetThickness;
                series.dashStyle = trendSetDashed ? getDashStyle(trendSetDashLen, trendSetDashGap) : undefined;
                series.includeInLegend = includeInLegend;
                series.name = getValidValue(trendset.name);
                // If includeInLegend set to false
                // We set series.name blank
                if (pluckNumber(trendset.includeinlegend) === 0 || series.name === undefined) {
                    series.showInLegend = false;
                }
                series.tooltip = {
                    enabled :  false
                };

                // Stop interactive legend for CandleStick
                FCChartObj.interactivelegend = 0;

                for (index = 0, length = data.length; index < length; index += 1) {
                    dataObj = data[index];
                    if (dataObj && !dataObj.vline) {
                        itemValue = NumberFormatter.getCleanValue(dataObj.value);
                        x = NumberFormatter.getCleanValue(dataObj.x);
                        x = x !== null ? x : index + 1;
                        // tooltex
                        toolText = toolTextObj && toolTextObj[x];

                        series.data.push({
                            x: x,
                            y: itemValue,
                            toolText: toolText
                        });
                    }
                }
            }
            return series;
        },


        point: function (chartName, series, dataset, FCChartObj, HCObj) {
            if (dataset.data) {
                var itemValueY, index, drawAnchors, dataObj,
                itemValueX, hasValidPoint = false,
                pointStub, chartNameAPI = chartAPI[chartName],
                conf = HCObj[CONFIGKEY],
                plotPriceAs,
                // Data array in dataset object
                data = dataset.data,
                dataLength = data && data.length,
                // showValues attribute in individual dataset
                datasetShowValues = pluckNumber(dataset.showvalues, conf.showValues),
                NumberFormatter = this.numberFormatter,
                candleSeries = [], volumeSeries = [],
                paletteIndex = HCObj.chart.paletteIndex,
                toolTextStore = {};

                // Dataset seriesname
                series.name = getValidValue(dataset.seriesname);

                // Make the CandleStick chart legend off
                series.showInLegend = false;


                // Add marker to the series to draw the Legend
                series.marker = {
                    enabled: true
                }

                plotPriceAs = getValidValue(FCChartObj.plotpriceas, BLANK).toLowerCase();
                if (plotPriceAs == 'line' || plotPriceAs == 'bar') {
                    series.plotType = plotPriceAs;
                } else {
                    series.plotType = 'candlestick';
                }


                var open, close, high, low, volume, minValue, maxValue, x,
                valueText, setColor, setBorderColor, setAlpha, dashStyle, drawVolume = false,
                bearBorderColor, bearFillColor, bullBorderColor, bullFillColor, plotLineThickness,
                plotLineAlpha, plotLineDashLen, plotLineDashGap, showVPlotBorder, vPlotBorderThickness,
                vPlotBorderAlpha, seriesYAxis, rollOverBandColor, rollOverBandAlpha;

                seriesYAxis = pluckNumber(series.yAxis, 0);

                //Candle stick properties.
                //Bear fill and border color - (Close lower than open)
                bearBorderColor = getFirstColor(pluck(FCChartObj.bearbordercolor, "B90000"));
                bearFillColor = getFirstColor(pluck(FCChartObj.bearfillcolor, "B90000"));
                //Bull fill and border color - Close higher than open
                bullBorderColor = getFirstColor(pluck(FCChartObj.bullbordercolor, defaultPaletteOptions.canvasBorderColor[paletteIndex]));
                bullFillColor = getFirstColor(pluck(FCChartObj.bullfillcolor, "FFFFFF"));
                //Line Properties - Serves as line for bar & line and border for candle stick
                plotLineThickness = pluckNumber(FCChartObj.plotlinethickness, (plotPriceAs == 'line' || plotPriceAs == 'bar') ? 2 : 1);
                plotLineAlpha = pluck(FCChartObj.plotlinealpha, HUNDRED);
                plotLineDashLen = pluckNumber(FCChartObj.plotlinedashlen, 5);
                plotLineDashGap = pluckNumber(FCChartObj.plotlinedashgap, 4);
                //VPlotBorder is border properties for the volume chart.
                showVPlotBorder = Boolean(pluckNumber(FCChartObj.showvplotborder, 1));
                //vPlotBorderColor = getFirstColor(pluck(FCChartObj.vplotbordercolor, this.defColors.get2DCanvasBorderColor(palette)));
                vPlotBorderThickness = pluckNumber(FCChartObj.vplotborderthickness, 1);
                vPlotBorderAlpha = pluck(FCChartObj.vplotborderalpha, (showVPlotBorder == true) ? HUNDRED : ZERO);
                //Roll-over band properties
                rollOverBandColor = getFirstColor(pluck(FCChartObj.rolloverbandcolor, defaultPaletteOptions.altHGridColor[paletteIndex]));
                rollOverBandAlpha = pluck(FCChartObj.rolloverbandalpha, defaultPaletteOptions.altHGridAlpha[paletteIndex]);


                // Iterate through all level data
                for (index = 0; index < dataLength; index += 1) {
                    // Individual data obj
                    // for further manipulation
                    dataObj = data[index];
                    if (dataObj && !dataObj.vline) {
                        open = NumberFormatter.getCleanValue(dataObj.open);
                        close = NumberFormatter.getCleanValue(dataObj.close);
                        high = NumberFormatter.getCleanValue(dataObj.high);
                        low = NumberFormatter.getCleanValue(dataObj.low);
                        volume = NumberFormatter.getCleanValue(dataObj.volume, true);
                        x = NumberFormatter.getCleanValue(dataObj.x);

                        if (volume !== null) {
                            drawVolume = true;
                        }

                        minValue = mathMin(open, close, high, low);
                        maxValue = mathMax(open, close, high, low);

                        valueText = parseUnsafeString(getValidValue(dataObj.valuetext, BLANK));

                        setBorderColor = getFirstColor(pluck(dataObj.bordercolor, close < open ? bearBorderColor : bullBorderColor));
                        setAlpha = pluck(dataObj.alpha, HUNDRED);
                        setColor = convertColor(getFirstColor(pluck(dataObj.color, close < open ? bearFillColor : bullFillColor)), setAlpha);
                        dashStyle = Boolean(pluckNumber(dataObj.dashed)) ? getDashStyle(plotLineDashLen, plotLineDashGap) : undefined;

                        hasValidPoint = true;

                        pointStub = chartNameAPI
                        .getPointStub(HCObj, FCChartObj, dataObj, open, close, high, low, volume, plotPriceAs);

                        x = x ? x : index + 1;

                        toolTextStore[x] = pointStub.toolText;

                        // Finally add the data
                        // we call getPointStub function that manage displayValue, toolText and link
                        series.data.push({
                            high: mathMax(open, close, high, low),
                            low: mathMin(open, close, high, low),
                            color: convertColor(setColor, setAlpha),
                            borderColor: convertColor(setBorderColor, plotLineAlpha),
                            dashStyle: dashStyle,
                            borderWidth: plotLineThickness,
                            x: x,
                            y: close,
                            MY: open,
                            toolText : pointStub.toolText,
                            link: pointStub.link
                        });

                        volumeSeries.push({
                            y: volume,
                            color: convertColor(setColor, setAlpha),
                            toolText : pointStub.toolText,
                            borderWidth: vPlotBorderThickness,
                            borderColor: convertColor(setBorderColor, vPlotBorderAlpha),
                            dashStyle: dashStyle,
                            x: x
                        });


                        // Set the maximum and minimum found in data
                        // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                        this.pointValueWatchers(HCObj, x, minValue, maxValue, volume, seriesYAxis);
                    }
                }

                // Storing the toolText in config to make trendset line tooltext
                conf.toolTextStore = toolTextStore;

                if (series.drawVolume = drawVolume) {
                    candleSeries.push(series, volumeSeries);
                } else {
                    candleSeries = series;
                }
            }
            return candleSeries;
        },


        getPointStub: function (HCObj, FCChartObj, dataObj, open, close, high, low, volume, plotPriceAs) {
            var toolText = BLANK, HCConfig = HCObj[CONFIGKEY],
            NumberFormatter = HCConfig.numberFormatter, isLine = plotPriceAs == 'line';

            //create the tooltext
            if (!HCConfig.showTooltip) {
                toolText = BLANK;
            } else {
                toolText = getValidValue(dataObj.tooltext);
                if (typeof toolText == 'undefined') {
                    toolText = (open !== null && !isLine) ? '<b>Open:</b> ' + NumberFormatter.dataLabels(open) + '<br/>' : BLANK;
                    toolText += close !== null ? '<b>Close:</b> ' + NumberFormatter.dataLabels(close)  + '<br/>' : BLANK;
                    toolText += (high !== null && !isLine) ? '<b>High:</b> ' + NumberFormatter.dataLabels(high)  + '<br/>' : BLANK;
                    toolText += (low !== null && !isLine) ? '<b>Low:</b> ' + NumberFormatter.dataLabels(low)  + '<br/>' : BLANK;
                    toolText += volume !== null ? '<b>Volume:</b> ' + NumberFormatter.dataLabels(volume) : BLANK;
                }
            }
            return {
                toolText: toolText
            };
        },


        pointValueWatchers: function (HCObj, valueX, min, max, volume, yAxisIndex) {
            var obj, conf = HCObj[CONFIGKEY], objX;
            yAxisIndex = pluckNumber(yAxisIndex, 0);
            if (volume !== null) {
                obj = conf.volume;
                if (!obj) {
                    obj = conf.volume = {}
                }
                obj.max = obj.max > volume ? obj.max : volume;
                obj.min = obj.min < volume ? obj.min : volume;
            }
            if (min !== null) {
                obj = conf[yAxisIndex];
                obj.max = obj.max > min ? obj.max : min;
                obj.min = obj.min < min ? obj.min : min;
            }
            if (max !== null) {
                obj = conf[yAxisIndex];
                obj.max = obj.max > min ? obj.max : min;
                obj.min = obj.min < min ? obj.min : min;
            }
            if (valueX !== null) {
                objX = conf.x;
                objX.max = objX.max > valueX ? objX.max : valueX;
                objX.min = objX.min < valueX ? objX.min : valueX;
            }
        },


        spaceManager: function (hcJSON, fcJSON, width, height) {

            var conf = hcJSON[CONFIGKEY], axisConf, fcJSONChart = fcJSON.chart,
            yAxisNamePadding, yAxisValuesPadding, rotateYAxisName,
            smartLabel = conf.smartLabel,

            marginLeftExtraSpace = conf.marginLeftExtraSpace,
            marginTopExtraSpace = conf.marginTopExtraSpace,
            marginBottomExtraSpace = conf.marginBottomExtraSpace,
            marginRightExtraSpace = conf.marginRightExtraSpace,
            workingWidth = width - (marginLeftExtraSpace + marginRightExtraSpace +
                hcJSON.chart.marginRight + hcJSON.chart.marginLeft),
            workingHeight = height - (marginBottomExtraSpace +
                //hcJSON.chart.marginBottom +
                0 +
                hcJSON.chart.marginTop),

            //calculate the min width, height for canvas
            minCanWidth = workingWidth * 0.3,
            minCanHeight = workingHeight * 0.3,

            // calculate the space remaining
            avaiableWidth = workingWidth - minCanWidth,
            avaiableHeight = workingHeight - minCanHeight,

            //if the legend is at the right then place it and deduct the width
            //if at bottom calculate the space for legend after the vertical axis placed

            yAxis = hcJSON.yAxis, isOpp,
            numAxis = yAxis.length, y, canvasHeight, yAxisObj, yAxisConf,
            leftSpace = 0, rightSpace = 0, axisPad = 8, axisOffset, axisWidthUsed,
            extraWidth = 0, perAxisWidth = avaiableWidth / numAxis, axisSpecifficWidth;

            this.base.spaceManager.apply(this, arguments);

            //---- SpaceManagement For Volume Charts ----//
            if (hcJSON.subCharts) {
                var subChart = hcJSON.subCharts[0],
                mainChartHeight = height - (hcJSON.chart.marginTop + hcJSON.chart.marginBottom),
                volumeHeightPercent = subChart.chart.volumeHeightPercent,
                volumeChartHeight,
                marginBetweenCharts = conf.horizontalAxisHeight + 5, // 2 is the additional padding
                index, length, xaxisObj, newXaxisObj;

                rotateYAxisName = pluckNumber(fcJSON.chart.rotateyaxisname, 1);

                volumeChartHeight = (mainChartHeight * volumeHeightPercent /100);
                hcJSON.chart.marginBottom += volumeChartHeight + marginBetweenCharts;

                // Copying xAxis form main chart to Volume chart.
                //var xAxis = jQuery.extend(true, {}, hcJSON.xAxis)
                var xAxis = extend2({}, hcJSON.xAxis)

                // Removing all trendline labels for CandleStick Chart
                for(index = 0, length = hcJSON.xAxis.plotBands.length; index < length; index += 1) {
                    xaxisObj = hcJSON.xAxis.plotBands[index];
                    if (xaxisObj && xaxisObj.label && xaxisObj.label.text) {
                        xaxisObj.label.text = BLANK;
                    }

                    newXaxisObj = xAxis.plotBands[index];
                    if (newXaxisObj && newXaxisObj.label && newXaxisObj.label.y) {
                        newXaxisObj.label.y = pluckFontSize(fcJSONChart.basefontsize, 10) + 4; // 4 px looks proper
                    }
                }

                // Removing all data labels from volumeChart
                for(index = 0, length = xAxis.plotLines.length; index < length; index += 1) {
                    xaxisObj = xAxis.plotLines[index];
                    if (xaxisObj && xaxisObj.label && xaxisObj.label.text) {
                        xaxisObj.label.text = BLANK;
                    }
                }
                // Clearing the Volume chart primary axis label title
                if (subChart.yAxis && subChart.yAxis[0] && subChart.yAxis[0].title && subChart.yAxis[0].title.text) {
                    subChart.yAxis[0].title.text = BLANK;
                }
                subChart.xAxis = xAxis;
                // deleting yAxis label text
                //xAxis.plotLines[0].label.text = BLANKSTRING;

                var yAxisName;
                // rapping Volume chart yAxis label title text.
                if (yAxis[1].title.rotation) {
                    yAxisName = smartLabel.getSmartText(subChart.yAxis[1].title.text,
                        rotateYAxisName == 0 ? hcJSON.chart.marginLeft - 10 : volumeChartHeight, undefined, true).text;
                } else {
                    yAxisName = smartLabel.getSmartText(subChart.yAxis[1].title.text,
                        smartLabel.getOriSize(yAxis[1].title.text).width, undefined, true).text;
                }

            /**
             * Volume Chart
             * place the vertical axis
             */
                yAxis = subChart.yAxis;
                numAxis = yAxis.length;
                leftSpace = 0;
                rightSpace = 0;
                axisPad = 0;
                extraWidth = 0;
                perAxisWidth = avaiableWidth / numAxis;
                for (y = numAxis - 1; y >= 0; y -= 1) {
                    yAxisObj = yAxis[y];
                    axisConf = conf[y];

                    isOpp = yAxisObj.opposite;
                    axisOffset = (isOpp ? rightSpace : leftSpace) + axisPad;
                    //add all axis margin pading
                    yAxisNamePadding = 10;
                    yAxisValuesPadding = pluckNumber(axisConf.tickWidth, 2) + axisOffset;
                    axisConf.verticalAxisNamePadding = yAxisNamePadding;
                    axisConf.verticalAxisValuesPadding = yAxisValuesPadding;
                    axisConf.rotateVerticalAxisName = rotateYAxisName;
                    yAxisObj.offset  = axisOffset;
                    axisSpecifficWidth = perAxisWidth + extraWidth - axisPad;

                //now configure the axis
                /* if (isOpp) {
                        axisWidthUsed = placeVerticalAxis(yAxisObj, axisConf, subChart, fcJSON,
                            workingHeight, axisSpecifficWidth , !isOpp, 0, 0, rightSpace);
                        rightSpace += axisWidthUsed;
                    }
                    else {
                        axisWidthUsed = placeVerticalAxis(yAxisObj, axisConf, subChart, fcJSON,
                            workingHeight, axisSpecifficWidth , !isOpp, 0, 0, leftSpace);

                        leftSpace += axisWidthUsed;
                    }

                    extra = axisSpecifficWidth - axisWidthUsed;
                    extraWidth += extra;
                    avaiableWidth -= (axisSpecifficWidth - extra + axisPad);*/
                }

                // setting the Primary chart yAxis title style to Volume Chart title
                yAxis = hcJSON.yAxis
                subChart.yAxis[1].title = jQuery.extend(true, {}, hcJSON.yAxis[1].title);
                subChart.yAxis[1].title.text = yAxisName;

                // deleting yAxis label text
                //xAxis.plotLines[0].label.text = BLANKSTRING;

                subChart.chart.left = 0;
                subChart.chart.width = width;
                subChart.chart.top = (height - hcJSON.chart.marginBottom) + marginBetweenCharts;
                subChart.chart.height = hcJSON.chart.marginBottom - marginBetweenCharts; // 20 is the height needed to show the horizontal axis

                subChart.chart.marginLeft = hcJSON.chart.marginLeft;
                subChart.chart.marginRight = hcJSON.chart.marginRight;
                subChart.chart.marginTop = 5;
                subChart.chart.marginBottom = hcJSON.chart.marginBottom - (marginBetweenCharts + volumeChartHeight);
            }
        },
        isDual: true,
        numVDivLines: 0,
        setAdaptiveYMin: true,
        divLineIsDashed: 1,
        isCandleStick : true,
        defaultPlotShadow: 1,
        requiredAutoNumericLabels: 1
    }, chartAPI.scatterbase);



    /**
    * CandleStick chart
    */
    // 1 - Set default options
    defaultPlotOptions.candlestick = merge(defaultPlotOptions.column, {
        states: {
            hover: {}
        }
    });
    //
    var candleStick = Highcharts.extendClass(seriesTypes.column, {
        type: 'candlestick',

        /**
	 * Draw the columns. For bars, the series.group is rotated, so the same coordinates
	 * apply for columns and bars. This method is inherited by scatter series.
	 *
	 */
        drawPoints: function() {

            var series = this,
            options = series.options,
            renderer = series.chart.renderer,
            graphic,
            shapeArgs,
            attributes;

            // draw the columns
            each (series.data, function(point) {

                if (defined(point.plotY)) {
                    graphic = point.graphic;
                    shapeArgs = point.shapeArgs;
                    if (graphic) { // update
                        graphic.attr(shapeArgs);
                    } else {
                        //Changed for FC
                        //draw the error bar
                        attributes = {
                            stroke: point.borderColor,
                            fill: point.color,
                            'stroke-width': point.borderWidth,
                            'stroke-linecap': 'round',
                            dashstyle: point.dashStyle
                        };

                        if (point.bar) {
                            point.bar.graphic = renderer[point.bar.shapeType](point.bar.shapeArgs)
                            .attr(attributes)
                            .add(series.group)
                            .shadow(options.shadow, undefined, options.shadow);
                        }

                        if (shapeArgs) {
                            point.graphic = renderer[point.shapeType](shapeArgs)
                            .attr(attributes)
                            .add(series.group)
                            .shadow(options.shadow, undefined, options.shadow);
                        }
                    }
                }
            });
        },

        /**
	 * Translate each point to the plot area coordinate system and find shape positions
	 */
        translate: function() {

            var series = this,
            chart = series.chart,
            columnCount = 0,
            reversedXAxis = series.xAxis.reversed,
            categories = series.xAxis.categories,
            stackedIndex, // the index of the first column in a stack
            pricetype = series.options.plotType;
            Series.prototype.translate.apply(series);

            // Get the total number of column type series.
            // This is called on every series. Consider moving this logic to a
            // chart.orderStacks() function and call it on init, addSeries and removeSeries
            each (chart.series, function(otherSeries) {
                if (otherSeries.type == series.type) {
                    if (!otherSeries.options.stacking) {
                        otherSeries.columnIndex = columnCount++;
                    }else {
                        if (!defined(stackedIndex)) {
                            stackedIndex = columnCount++;
                        }
                        otherSeries.columnIndex = stackedIndex;
                    }
                }
            });


            // calculate the width and position of each column based on
            // the number of column series in the plot, the groupPadding
            // and the pointPadding options
            var options = series.options, i, point, pointPrev,
            data = series.data,
            closestPoints = series.closestPoints,
            categoryWidth = mathAbs(
                data[1] ? data[closestPoints].plotX - data[closestPoints - 1].plotX :
                chart.plotSizeX / (categories && categories.length ? categories.length : 1)
                ),
            groupPadding = categoryWidth * options.groupPadding,
            groupWidth = categoryWidth - 2 * groupPadding,
            pointOffsetWidth = groupWidth / columnCount,
            optionPointWidth = options.pointWidth,
            pointPadding = defined(optionPointWidth) ? (pointOffsetWidth - optionPointWidth) / 2 :
            pointOffsetWidth * options.pointPadding,
            pointWidth = pick(optionPointWidth, pointOffsetWidth - 2 * pointPadding),
            columnIndex = (reversedXAxis ? columnCount -
                series.columnIndex : series.columnIndex) || 0,
            pointXOffset = pointPadding + (groupPadding + columnIndex *
                pointOffsetWidth -(categoryWidth / 2)) *
            (reversedXAxis ? -1 : 1),
            translatedThreshold = series.yAxis.getThreshold(options.threshold || 0),
            minPointLength = options.minPointLength;

            // record the new values
            //Changed For FC:AP
            //MX xy supplyed by FC
            //MWidth width supplyed by FC
            //MY highest point for stacked point from FC
            for (i = 0; i < data.length; i += 1) {
                point = data[i];

                if (pricetype == 'line') {
                    if (i > 0) {
                        pointPrev = data[i -1];
                        pointPrev.shapeType = 'path';
                        pointPrev.shapeArgs = [M, pointPrev.plotX, pointPrev.plotY, L, point.plotX, point.plotY ]
                    }

                    point.trackerShapeType = SHAPE_RECT;
                    point.trackerArgs = {
                        x: point.plotX - 3,
                        y: point.plotY - 3,
                        width: 6,
                        height: 6
                    };

                }
                else {
                    var barX = point.plotX + pointXOffset,
                    plotY = point.plotY,
                    plotY1 = series.yAxis.getThreshold(point.MY),
                    barY = mathCeil(mathMin(plotY, plotY1)),
                    barH = mathCeil(mathAbs(plotY - plotY1)),
                    barW = pointWidth, barWhlf = barW / 2,
                    trackerY;

                    // handle options.minPointLength and tracker for small points
                    if (barH < (minPointLength || 5)) {
                        if (minPointLength) {
                            barH = minPointLength;
                            barY = translatedThreshold - (plotY <= translatedThreshold ? minPointLength : 0);
                        }
                        trackerY = barY - 3;
                    }

                    if (barH < 1) {
                        barH = 1;
                    }

                    extend (point, {
                        barX: barX,
                        barY: barY,
                        barW: barW,
                        barH: barH
                    });

                    if (pricetype == 'bar') {
                        point.trackerShapeType = SHAPE_RECT;
                        point.shapeType = 'path';
                        point.shapeArgs = [M, point.plotX, plotY1, L, (point.plotX - barWhlf), plotY1, M, point.plotX, plotY, L, (point.plotX + barWhlf), plotY];
                        // make small columns responsive to mouse
                        point.trackerArgs = {
                            x: barX,
                            y: defined(trackerY) ? trackerY : barY,
                            width: barW,
                            height: defined(trackerY) ? 6 : barH
                        };
                    }
                    else {
                        point.shapeType = SHAPE_RECT;
                        point.shapeArgs = {
                            x: barX,
                            y: barY,
                            width: barW,
                            height: barH,
                            r: options.borderRadius
                        };
                        point.trackerShapeType = SHAPE_RECT;
                        // make small columns responsive to mouse
                        point.trackerArgs = defined(trackerY) && merge(point.shapeArgs, {
                            height: 6,
                            y: trackerY
                        });
                    }

                    //draw the high low graph
                    point.bar = {
                        shapeType: 'path',
                        shapeArgs: [M, point.plotX, series.yAxis.getThreshold(parseFloat(point.high)), L, point.plotX, series.yAxis.getThreshold(parseFloat(point.low))]
                    };

                }
            }
        },
        drawTracker: function () {

            var series = this,
            chart = series.chart,
            renderer = chart.renderer,
            shapeArgs,
            tracker,
            trackerLabel = +new Date(),
            cursor = series.options.cursor,
            css = cursor && {
                cursor: cursor
            },
            rel;


            each(series.data, function(point) {
                tracker = point.tracker;
                shapeArgs = point.trackerArgs;
                delete shapeArgs.strokeWidth;
                if (point.y !== null) {
                    if (tracker) {// update
                        tracker.attr(shapeArgs);

                    }else {
                        //Add cursor pointer if there has link
                        //modify the parent scope css variable with a local variable
                        if (point.link !== undefined) {
                            var css = {
                                cursor : 'pointer',
                                '_cursor': 'hand'
                            };
                        }
                        point.tracker =
                        renderer[point.trackerShapeType](shapeArgs)
                        .attr({
                            isTracker: trackerLabel,
                            fill: TRACKER_FILL,
                            visibility: series.visible ? VISIBLE : HIDDEN,
                            zIndex: 1
                        })
                        .on(hasTouch ? 'touchstart' : 'mouseover', function(event) {
                            rel = event.relatedTarget || event.fromElement;
                            if (chart.hoverSeries !== series && attr(rel, 'isTracker') !== trackerLabel) {
                                series.onMouseOver();
                            }
                            point.onMouseOver();

                        })
                        .on('mouseout', function(event) {
                            if (!series.options.stickyTracking) {
                                rel = event.relatedTarget || event.toElement;
                                if (attr(rel, 'isTracker') !== trackerLabel) {
                                    series.onMouseOut();
                                }
                            }
                        })
                        .css(css)
                        .add(point.group || chart.trackerGroup); // pies have point group - see issue #118
                    }
                }
            });
        }

    });

    // 4 - add the constractor
    seriesTypes.candlestick = candleStick;




    /* Spline Charts */
    chartAPI('kagi', {
        standaloneInit: true,
        stepLine: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'kagi',
        defaultZeroPlaneHighlighted: false,
        setAdaptiveYMin: 1,
        canvasPadding: 15,
        isKagi: 1,


        pointValueWatcher: function (HCObj, value, yAxisIndex, isStacked, index,
            stackIndex, seriesName) {
            if ( value !== null) {
                var obj, stackObj, FCconf = HCObj[CONFIGKEY];
                yAxisIndex = pluckNumber(yAxisIndex, 0);

                if (!FCconf[yAxisIndex]) {
                    FCconf[yAxisIndex] = {};
                }
                obj = FCconf[yAxisIndex];

                this.maxValue = obj.max = obj.max > value ? obj.max : value;
                this.minValue = obj.min = obj.min < value ? obj.min : value;
            }
        },


        point : function (chartName, series, data, FCChartObj, HCObj) {
            var  HCChartObj = HCObj.chart,
            // length of the data
            length = data.length,
            // HighCharts configuration
            conf = HCObj[CONFIGKEY],
            catIndex = 0,
            xAxisConf = conf.x,
            paletteIndex = HCObj.chart.paletteIndex,
            NumberFormatter = HCObj[CONFIGKEY].numberFormatter,
            itemValue,
            index,
            dataLabel,
            dataObj,
            countPoint,
            showLabel,
            pointShadow,
            lineColor,
            lineAlpha,
            lineThickness,
            drawAnchors,
            lineColorDef,
            lineAlphaDef,
            pointAnchorEnabled,
            // set attributes
            setAnchorSides,
            setAnchorBorderThickness,
            setAnchorBorderColor,
            setAnchorRadius,
            setAnchorBgColor,
            setAnchorAlpha,
            setAnchorBgAlpha,
            setAnchorAngle;

            // Managing line series cosmetics
            // Color of the line
            lineColorDef = getFirstColor(pluck(FCChartObj.linecolor,
                FCChartObj.palettecolors,
                defaultPaletteOptions.plotFillColor[paletteIndex]));
            // alpha
            lineAlphaDef = pluckNumber(FCChartObj.linealpha, 100);
            // thickness
            lineThickness = pluckNumber(FCChartObj.linethickness, 2);

            // set the line color and alpha to
            // HC seris obj with FusionCharts color format using FCcolor obj
            series.color = {
                FCcolor: {
                    color: lineColorDef,
                    alpha: lineAlphaDef
                }
            };

            // set the line thickness (line width)
            series.lineWidth = lineThickness;

            // IF its a step line chart
            series.step = this.stepLine;
            // Special attribute for StepLine (drawVerticalJoins)
            series.drawVerticalJoins = Boolean(pluckNumber(FCChartObj.drawverticaljoins, 1));
            //series.useForwardSteps = Boolean(pluckNumber(FCChartObj.useforwardsteps, 1));

            // Managing line series markers
            // Whether to drow the Anchor or not
            drawAnchors = pluckNumber(FCChartObj.drawanchors ,
                FCChartObj.showanchors);

            // Iterate through all level data
            for (index = 0, countPoint = 0; index < length; index += 1) {
                // individual data obj
                // for further manipulation
                dataObj = data[index];

                // Managing vLines in between <set> elements
                // We are not taking care of vLine here
                if (dataObj.vline) {
                    continue;
                }
                // get the valid value
                // parsePointValue check the its a value value of not and return
                // the valid value
                itemValue = NumberFormatter.getCleanValue(dataObj.value);

                if (itemValue == null) {
                    continue;
                }

                // we check showLabel in individual data
                // if its set to 0 than we do not show the particular label
                showLabel = pluckNumber(dataObj.showlabel,
                    FCChartObj.showlabels, 1);

                // Label of the data
                // getFirstValue returns the first defined value in arguments
                // we check if showLabel is not set to 0 in data
                // then we take the label given in data, it can be given
                // using label as well as name too
                // we give priority to label if label is not there,
                // we check the name attribute
                dataLabel = parseUnsafeString(!showLabel ? BLANK :
                    getFirstValue(dataObj.label, dataObj.name));

                catIndex += 1;

                lineAlpha = pluckNumber(dataObj.linealpha, lineAlphaDef);

                pointShadow = {
                    opacity: lineAlpha / 100
                };

                // Anchor cosmetics in data points
                // Getting anchor cosmetics for the data points or its default values
                // The default value is different from flash in order to render a
                // perfect circle when no anchorside is provided.
                setAnchorSides = pluckNumber(dataObj.anchorsides,
                    FCChartObj.anchorsides, 0);
                setAnchorAngle = pluckNumber(dataObj.anchorstartangle,
                    FCChartObj.anchorstartangle, 0);
                setAnchorRadius = pluckNumber(dataObj.anchorradius,
                    FCChartObj.anchorradius, this.anchorRadius, 3);
                setAnchorBorderColor = getFirstColor(pluck(dataObj.anchorbordercolor,
                    FCChartObj.anchorbordercolor, lineColorDef));
                setAnchorBorderThickness = pluckNumber(dataObj.anchorborderthickness,
                    FCChartObj.anchorborderthickness, this.anchorBorderThickness, 1);
                setAnchorBgColor = getFirstColor(pluck(dataObj.anchorbgcolor,
                    FCChartObj.anchorbgcolor, defaultPaletteOptions.anchorBgColor[paletteIndex]));
                setAnchorAlpha = pluck(dataObj.anchoralpha, FCChartObj.anchoralpha,
                    HUNDRED);
                setAnchorBgAlpha = pluck(dataObj.anchorbgalpha,
                    FCChartObj.anchorbgalpha, setAnchorAlpha);
                pointAnchorEnabled = drawAnchors === undefined ?
                lineAlpha != 0 : !!drawAnchors;

                // Finally add the data
                // we call getPointStub function that manage displayValue, toolText and link
                series.data.push(extend2(
                    this.getPointStub(dataObj, itemValue, dataLabel, HCObj),
                    {
                        y : itemValue,
                        color: lineColorDef,
                        shadow: pointShadow,
                        dashStyle: dataObj.dashed,
                        valuePosition: pluck(dataObj.valueposition, HCChartObj.valuePosition),
                        isDefined: true,
                        marker : {
                            enabled: !!pointAnchorEnabled,
                            fillColor: {
                                FCcolor: {
                                    color: setAnchorBgColor,
                                    alpha: ((setAnchorBgAlpha * setAnchorAlpha) / 100) + BLANK
                                }
                            },
                            lineColor: {
                                FCcolor: {
                                    color: setAnchorBorderColor,
                                    alpha: setAnchorAlpha
                                }
                            },
                            lineWidth: setAnchorBorderThickness,
                            radius: setAnchorRadius,
                            startAngle: setAnchorAngle,
                            symbol: mapSymbolName(setAnchorSides)
                        }
                    }));

                // Set the maximum and minimum found in data
                // pointValueWatcher use to calculate the maximum and minimum value of the Axis
                this.pointValueWatcher(HCObj, itemValue);
                countPoint += 1;
            }
            xAxisConf.catCount = catIndex;
            //return series
            return series;
        },

        postSeriesAddition: function (HCObj, FCObj, width, height) {
            var series = HCObj.series[0],
            FCChartObj = FCObj.chart,
            data = FCObj.data,
            hcData = series && series.data,
            length = hcData && hcData.length,
            // HighCharts configuration
            conf = HCObj[CONFIGKEY],
            xAxisConf = conf.x,
            // axisGridManager to manage the axis
            // it contains addVline, addXaxisCat, addAxisAltGrid and
            // addAxisGridLine function
            axisGridManager = conf.axisGridManager,
            xAxisObj = HCObj.xAxis,
            // First vertical point for shift is yet to be obtained
            isRallyInitialised = false,
            // Initialised to one to avoid zero dividing the width of the canvas
            // (as the case may be) to get the xShiftLength
            shiftCounter = 0,
            vLinePosition = 0.5,
            // The value which determines whether to make a horizontal shift
            // to deal with the next point
            reversalValue = pluckNumber(FCChartObj.reversalvalue, -1),
            // The percentage of the range of values, which determines whether
            // to make a horizontal shift to deal with the next point
            reversalPercentage = pluckNumber(FCChartObj.reversalpercentage, 5),
            // To find the range of values in the chart for use in
            // calculating reversal value by percentage (optional)
            valueMax = this.maxValue,
            valueMin = this.minValue,
            lastPlotValue,
            setShowLabel,
            // Boolean local variables declared
            isRally,
            isMovingUp,
            isShift,
            // Number local variables declared
            dataValue,
            nextDataValue,
            plotValue,
            lastLow,
            lastHigh,
            // String local variables declared
            vAlign,
            align,
            dataObj,
            prevDataObj,
            valueDifference,
            fcDataObj,
            showLabel,
            dataLabel,
            index,
            fcIndex,
            checkValue,
            lastShift,
            lastFcDataObj,
            rallyDashLen,
            rallyDashGap,
            declineDashLen,
            declineDashGap;

            if (hcData && hcData.length) {
                // Color of line denoting rally
                series.rallyColor = pluck(FCChartObj.rallycolor, 'FF0000');
                series.rallyAlpha = pluckNumber(FCChartObj.rallyalpha,
                    FCChartObj.linealpha, 100);
                //color of line denoting decline
                series.declineColor = pluck(FCChartObj.declinecolor, '0000FF');
                series.declineAlpha = pluckNumber(FCChartObj.declinealpha,
                    FCChartObj.linealpha, 100);

                // Thickness of line denoting rally
                series.rallyThickness = pluckNumber(FCChartObj.rallythickness,
                    FCChartObj.linethickness, 2);
                // length of the dash
                rallyDashLen = pluckNumber(FCChartObj.rallydashlen,
                    FCChartObj.linedashlen, 5);
                // distance between dash
                rallyDashGap = pluckNumber(FCChartObj.rallydashgap,
                    FCChartObj.linedashgap, 4);

                // Thickness of line denoting decline
                series.declineThickness = pluckNumber(FCChartObj.declinethickness,
                    FCChartObj.linethickness, 2);
                // length of the dash
                declineDashLen = pluckNumber(FCChartObj.declinedashlen,
                    FCChartObj.linedashlen, 5);
                // distance between dash
                declineDashGap = pluckNumber(FCChartObj.declinedashgap,
                    FCChartObj.linedashgap, 4);

                series.lineDashed = {
                    'true': pluckNumber(FCChartObj.rallydashed,
                        FCChartObj.linedashed, 0),
                    'false': pluckNumber(FCChartObj.declinedashed,
                        FCChartObj.linedashed, 0)
                }

                // Storing dashStyle in series to be use while drawing graph and
                series.getDashStyleObj = {
                    'true': getDashStyle(rallyDashLen, rallyDashGap,
                        series.rallyThickness),
                    'false': getDashStyle(declineDashLen, declineDashGap,
                        series.declineThickness)
                };

                //canvasPadding to be use by Kagi chart Drawing
                series.canvasPadding = pluckNumber(FCChartObj.canvaspadding,
                    this.canvasPadding, 15);

                //setting the reversal value
                reversalValue = (reversalValue > 0) ?
                reversalValue : reversalPercentage * (valueMax - valueMin) / 100;

                // Initialised by the first data value
                lastPlotValue = hcData[0].y;
                // Local function to set anchor and value visibility of
                // unwanted points, after the first point is found to draw
                // vertical kagi line
                setShowLabel = function (id, _isRally) {
                    // Initial data value
                    var dataXValue, r = 1,
                    data1Value = hcData[0].y;
                    // Looping to check for unwanted points
                    while(r < id) {
                        // Value of point under check
                        dataXValue = hcData[r].y;
                        // If current trend is rally
                        if (_isRally) {
                            if (dataXValue <= data1Value) {
                                hcData[r].isDefined = false;
                            }
                        // Else current trend is decline
                        } else {
                            if (dataXValue >= data1Value) {
                                hcData[r].isDefined = false;
                            }
                        }
                        r += 1;
                    }
                    // Setting alignment of value for the first data
                    hcData[0].vAlign = (_isRally) ? POSITION_BOTTOM :
                    POSITION_TOP;
                    hcData[0].align = 'center';
                };

                length = data.length;
                //iterating to set values of properties in data for each respective
                //point (main algorithm of KagiChart)
                //loop counter starts from 2 since data for plot 1 is unique
                for (index = 0, fcIndex = 0; fcIndex < length; fcIndex += 1) {
                    fcDataObj = data[fcIndex];
                    // Calculation of vLine based on hShift.
                    if (fcDataObj && fcDataObj.vline) {
                        index && axisGridManager.addVline(xAxisObj, fcDataObj,
                            vLinePosition, HCObj);
                        continue;
                    }
                    lastFcDataObj = data[fcIndex];
                    // Special handling for vLines
                    if (lastShift) {
                        lastShift = false;
                        vLinePosition += 0.5;
                    }

                    if (index && (dataObj = hcData[index])) {
                        // HC data Obj
                        prevDataObj = hcData[index - 1];

                        dataObj.vAlign = 'middle';
                        dataObj.align = POSITION_RIGHT;
                        dataObj.showLabel = false;
                        //initialised to null each time
                        plotValue = null;
                        //data value of plot under current loop
                        dataValue = dataObj.y;
                        //data value of previous plot
                        //lastDataValue = data[i-1].y;
                        //data value of next plot
                        nextDataValue = hcData[index + 1] && hcData[index + 1].y;
                        valueDifference = mathAbs(lastPlotValue - dataValue);

                        //if current plot is yet render the trend,then care is taken
                        //to make few initial assumptions as algorithm starts with it
                        if (!isRallyInitialised) {
                            //if current plot is higher than the last plotted one
                            //(first data) by significant amount
                            if (dataValue > lastPlotValue
                                && valueDifference > reversalValue) {
                                //is assumed to be true
                                isRally = true;
                                //value of last low point of swing (assumed)
                                lastLow = lastPlotValue;
                                //none assumed
                                lastHigh = null;
                                //kagi rising
                                isMovingUp = true;
                                //first vertical point for shift is obtained
                                isRallyInitialised = true;
                                //call of local function to set visibility false for
                                //anchors and values of unwanted points
                                setShowLabel(index, isRally);
                            //if current plot is lower than the last plotted one
                            //(first data) by significant amount
                            } else if (dataValue < lastPlotValue
                                && valueDifference > reversalValue) {
                                //is assumed to be false
                                isRally = false;
                                //none assumed
                                lastLow = null;
                                //value of last high point of swing (assumed)
                                lastHigh = lastPlotValue;
                                //kagi falling
                                isMovingUp = false;
                                //first vertical point for shift is obtained
                                isRallyInitialised = true;
                                //call of local function to set visibility false for
                                //anchors and values of unwanted points
                                setShowLabel(index, isRally);
                            // else, point under loop is not significant to
                            // draw the first vertical kagi line to
                            } else {
                                //is set to null
                                isRally = null;
                                //vertical shifting direction is set to null
                                isMovingUp = null;
                                //first vertical point for shift is yet to be obtained
                                isRallyInitialised = false;
                            }
                            //trend property for plot 1 is set
                            if(defined(prevDataObj)) {
                                prevDataObj.isRally = isRally;
                            }
                            if (isRally != null) {
                                //to get the initial horizontal line in trend color
                                //(in case data[1].value = data[2].value=... so on or not)
                                hcData[0].isRally = isRally;
                            }
                        //else, for plot 3 and above, only trend is evaluated
                        } else {
                            //setting trends by concept of Kagi Chart
                            if (dataValue < lastLow && isRally) {
                                isRally = false;
                            }else if (dataValue > lastHigh && !isRally) {
                                isRally = true;
                            }
                        //else isRally remains unchanged
                        }

                        // Setting in data for the plot
                        dataObj.isRally = isRally;
                        // To check for having horizontal shift or not,
                        // we need to use the pertinent value
                        if ((isMovingUp && dataValue < lastPlotValue) ||
                            (isMovingUp == false && dataValue > lastPlotValue)) {
                            plotValue = lastPlotValue;
                        }
                        // To find if there is a horizontal shift associated
                        // with this plot
                        checkValue = (plotValue) ? plotValue : dataValue;
                        valueDifference = mathAbs(checkValue - nextDataValue);
                        //if the line is static till now
                        if (isMovingUp == null) {
                            isShift = null;
                        //if the line is rising
                        }
                        else if (isMovingUp) {
                            isShift = (checkValue > nextDataValue &&
                                valueDifference >= reversalValue);
                        //else if the line is falling
                        }
                        else {
                            isShift = (checkValue < nextDataValue &&
                                valueDifference >= reversalValue);
                        }

                        //To get the last extremes preceding the current point
                        //and setting the vertical/horizontal
                        //alignment of the value to be shown for it.
                        if (prevDataObj && prevDataObj.isShift) {
                            if (isMovingUp) {
                                lastLow = lastPlotValue;
                                vAlign = POSITION_BOTTOM;
                            }
                            else if (!isMovingUp) {
                                lastHigh = lastPlotValue;
                                vAlign = POSITION_TOP;
                            }
                            align = 'center';
                            //looping to get the actual plot corresponding to the
                            //maxima/minima and setting label properties for the same
                            for (var t = index; t > 1; t -= 1) {
                                if (hcData[t].y == lastPlotValue) {
                                    hcData[t].vAlign = vAlign;
                                    hcData[t].align = align;
                                    hcData[t].showLabel = true;
                                    //extreme obtained and thus stop looping
                                    break;
                                }
                            }
                        }
                        //if there is a horizontal shift, then
                        if (isShift) {
                            //updating counter to have to total number of horizontal
                            // shifts in the total plot.This is vital for calculation
                            //of the length of each horizontal shifts.
                            shiftCounter += 1;
                            vLinePosition += 0.5;
                            lastShift = true;
                            //updating the flag by reversing the boolean
                            // value of the flag itself
                            isMovingUp = !isMovingUp;
                            //setting in data for the plot, to be used for
                            //drawing the graph
                            dataObj.isShift = true;
                            //updating last plotting value
                            lastPlotValue = checkValue;

                            // we check showLabel in individual data
                            showLabel = pluckNumber(fcDataObj.showlabel,
                                FCChartObj.showlabels, 1);

                            // Label of the data
                            dataLabel = parseUnsafeString(!showLabel ? BLANK :
                                getFirstValue(fcDataObj.label, fcDataObj.name));

                            // adding label in HighChart xAxis categories
                            // increase category counter by one
                            axisGridManager.addXaxisCat(xAxisObj, shiftCounter - 1,
                                shiftCounter - 1, dataLabel);

                        }
                        else if ((isMovingUp && dataValue>lastPlotValue) ||
                            (isMovingUp == false && dataValue<lastPlotValue)) {
                            //updating last plotting value
                            lastPlotValue = dataValue;
                        //if cuurent data value is to be skipped for plotting
                        }
                        else {
                            //setting the value to be plotted
                            //(virtually drawing pen stays still due to this)
                            plotValue = lastPlotValue;
                        }
                        //plotValue assigned is either defined or set to null
                        dataObj.plotValue = plotValue;
                        //few local variables are bundled together in an object to be
                        //used later-on to work around a Catch-22 problem
                        dataObj.objParams = {
                            isRally: isRally,
                            lastHigh: lastHigh,
                            lastLow: lastLow,
                            isRallyInitialised: isRallyInitialised
                        };
                    }
                    index += 1;
                }

                // Special handling for the dataLabel of the last data-point
                showLabel = pluckNumber(lastFcDataObj.showlabel,
                    FCChartObj.showlabels, 1);
                dataLabel = parseUnsafeString(!showLabel ? BLANK :
                    getFirstValue(lastFcDataObj.label, lastFcDataObj.name));
                // adding label in HighChart xAxis categories
                axisGridManager.addXaxisCat(xAxisObj, shiftCounter,
                    shiftCounter, dataLabel);

                series.shiftCount = xAxisConf.catCount = shiftCounter + 1;
            }
        },

        xAxisMinMaxSetter: function (hcJSON, fcJSON, canvasWidth) {
            var conf = hcJSON[CONFIGKEY], xAxisConf = conf.x,
            // no catCount is requierd.
            FCChartObj = fcJSON.chart,
            min = xAxisConf.min = pluckNumber(xAxisConf.min, 0),
            max = xAxisConf.max = pluckNumber(xAxisConf.max,
                xAxisConf.catCount - 1),
            rightPixelPad,
            leftValuePad = 0,
            rightValuePad = 0,
            valuePixelRatio,
            xAxis = hcJSON.xAxis,
            //plot area will not be less then 10 px
            leftPixelPad = rightPixelPad =
            mathMin(pluckNumber(FCChartObj.canvaspadding, 0),
                (canvasWidth / 2) - 10),
            // The maximum horizontal shift in percentage of the
            // available canvas width
            maxHShiftPercent = pluckNumber(FCChartObj.maxhshiftpercent, 10),
            series = hcJSON.series[0],
            shiftCount = series && series.shiftCount,
            canvasPadding = pluckNumber(FCChartObj.canvaspadding,
                this.canvasPadding, 15),
            effectiveCanvasWidth = canvasWidth - canvasPadding * 2,
            xShiftLength;

            if (series) {
                // maxHShiftPercent can not be < 0
                maxHShiftPercent = maxHShiftPercent <= 0 ?
                10 : maxHShiftPercent;
                xShiftLength = series.xShiftLength =
                mathMin(effectiveCanvasWidth / shiftCount,
                    maxHShiftPercent * effectiveCanvasWidth / 100);
                leftPixelPad = canvasPadding + xShiftLength / 2;
                rightPixelPad = canvasWidth - ((xShiftLength *
                    // handling single value rendering issue in Kagi
                    mathMax((shiftCount - 1), 1)) + leftPixelPad);
                // Fix for Kagi chart single value rendering issue
                // If there is a single value, we use xAxis max value
                // as 1 not as 0
                max = mathMax(max, 1);
            }

            //remove all grid related conf
            xAxis.labels.enabled = false;
            xAxis.gridLineWidth = INT_ZERO;
            xAxis.alternateGridColor = COLOR_TRANSPARENT;

            valuePixelRatio = (canvasWidth - (leftPixelPad + rightPixelPad)) /
            ((max - min) + (leftValuePad + rightValuePad));
            xAxis.min = min - (leftValuePad + (leftPixelPad / valuePixelRatio));
            xAxis.max = max + (rightValuePad + (rightPixelPad / valuePixelRatio));
        }

    }, chartAPI.linebase);


    // boxAndWhisker statistical Methods
    var boxAndWhiskerStatisticalCalc = function (method, numberFormatter, dataSeparator) {
        this.nf = numberFormatter;
        this.dataSeparator = dataSeparator;
        this.method = (method || BLANK).toLowerCase().replace(/\s/g, '');
    };

    boxAndWhiskerStatisticalCalc.prototype = {
        setArray: function (value) {
            var nf = this.nf,
                dataSeparator = this.dataSeparator,
                sum = 0,
                len,
                dataArr;
            !value && (value = BLANK);
            // First we make an arry form the comma-separated value.
            // and then we sort and store the data array in dataArr
            //  for further calculation.
            dataArr = value.replace(/\s/g, BLANK).split(dataSeparator);
            // Parse the values using NumberFormatter getCleanValue
            len = this.dataLength = dataArr && dataArr.length;

            while (len--) {
                sum += dataArr[len] = nf.getCleanValue(dataArr[len]);
            }

            // Now sort the data in ascending order
            dataArr && dataArr.sort(function (a, b) {
                return a - b;
            });

            this.values = dataArr;
            // Calculate and store the Mean
            this.mean = sum / this.dataLength;
            this.getFrequencies();
        },

        getQuartiles: function () {
            var values = this.values,
                len = this.dataLength,
                isOdd = len % 2,
                q1Pos,
                q1LowPos,
                q3Pos,
                q3LowPos,
                q1Val,
                q3Val;

            switch (this.method) {
                case 'tukey' :
                    if (isOdd) {
                        // Q1 = n + 3 / 4 And Q3 = 3N + 1 / 4
                        q1Pos = (len + 3) / 4;
                        q3Pos = ((len * 3) + 1) / 4;
                    } else {
                        // Q1 = n + 2 / 4 And Q3 = 3N + 2 / 4
                        q1Pos = (len + 2) / 4;
                        q3Pos = ((len * 3) + 2) / 4;
                    }
                break;
                case 'mooremccabe' :
                    if (isOdd) {
                        // Q1 = n + 1 / 4 And Q3 = 3N + 3 / 4
                        q1Pos = (len + 1) / 4;
                        q3Pos = q1Pos * 3;
                    } else {
                        // Q1 = n + 2 / 4 And Q3 = 3N + 2 / 4
                        q1Pos = (len + 2) / 4;
                        q3Pos = ((len * 3) + 2) / 4;
                    }
                break;
                case 'freundperles' :
                    // Q1 = n + 3 / 4 And Q3 = 3N + 1 / 4
                    q1Pos = (len + 3) / 4;
                    q3Pos = ((len * 3) + 1) / 4;
                break;
                case 'mendenhallsincich' :
                    // Q1 = [n + 1 / 4] And [Q3 = 3N + 3 / 4]
                    q1Pos = mathRound((len + 1) / 4);
                    q3Pos = mathRound(q1Pos * 3);
                break;
                default :
                    // Q1 = n + 1 / 4 And Q3 = 3N + 3 / 4
                    q1Pos = (len + 1) / 4;
                    q3Pos = q1Pos * 3;
                break;
            }

            q1Pos -= 1;
            q3Pos -= 1;
            q1LowPos = mathFloor(q1Pos);
            q3LowPos = mathFloor(q3Pos);

            q1Val = q1Pos - q1LowPos ? values[q1LowPos] +
                ((values[mathCeil(q1Pos)] - values[q1LowPos]) *
                (q1Pos - q1LowPos)) : values[q1Pos];
            q3Val = q3Pos - q3LowPos ? values[q3LowPos] +
                ((values[mathCeil(q3Pos)] - values[q3LowPos]) *
                (q3Pos - q3LowPos)) : values[q3Pos];

            return this.quartiles = {
                q1: q1Val,
                q3: q3Val
            };
        },

        // return min and max values from the data array.
        getMinMax: function () {
            var values = this.values;
            return {
                min: values[0],
                max: values[this.dataLength - 1]
            };
        },

        // calculate and returns the mean value
        getMean: function () {
            return this.mean;
        },

        // calculate the MeanDeviation
        getMD: function () {
            var mean = this.mean,
                freq = this.frequencies,
                freqLen = freq.length,
                freqObj,
                sum = 0;

            while (freqLen--) {
                freqObj = freq[freqLen];
                sum += freqObj.frequency * mathAbs(freqObj.value - mean);
            }
            return sum / this.dataLength;
        },

        // calculate the standard deviation
        getSD: function () {
            var mean = this.mean,
                values = this.values,
                i = this.dataLength,
                len = i,
                sum = 0;

            while (i--) {
                sum += mathPow(values[i] - mean, 2);
            }

            return mathSqrt(sum) / len;
        },

        // calculate the quartile deviation
        getQD: function () {
            return QDVal = (this.quartiles.q3 - this.quartiles.q1) * 0.5;
        },

        // calculate the frequencies and sum of the values
        getFrequencies: function () {
            var frequenciesArr = [],
                len = this.dataLength,
                values = this.values,
                sum = 0,
                value,
                freqObj,
                index;

            for (index = 0; index < len; index += 1) {
                sum += value = values[index];
                if (defined(frequenciesArr[index])) {
                    frequenciesArr[index].frequency += 1;;
                } else {
                    freqObj = {};
                    freqObj.value = value;
                    freqObj.frequency = 1;
                    frequenciesArr[index] = freqObj;
                }
            }
            this.sum = sum;
            this.frequencies = frequenciesArr;
        },

        getMedian: function () {
            var len = this.dataLength,
            midVal = len * 0.5,
            values = this.values;

            return len % 2 == 0 ? (values[midVal] + values[midVal - 1]) / 2 :
                values[mathFloor(midVal)];
        }
    };

    boxAndWhiskerStatisticalCalc.prototype.constructor = boxAndWhiskerStatisticalCalc;

    /* BoxAndWhisker2D */
    chartAPI('boxandwhisker2d', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType : 'boxandwhisker2d',
        chart: chartAPI.errorbar2d.chart,
        drawErrorValue: chartAPI.errorbar2d.drawErrorValue,
        decimals: 2,
        maxColWidth: 9000,
        useErrorAnimation: 1,
        avoidCrispError: 0,
        tooltipsepchar: ': ',

        point : function (chartName, series, dataset, FCChartObj, HCObj,
            catLength, seriesIndex, MSStackIndex) {
            var conf = HCObj[CONFIGKEY],// HighChart configuration object
                NumberFormatter = conf.numberFormatter,
                paletteIndex = HCObj.chart.paletteIndex,
                // whether to use round edges or not in the column
                isRoundEdges = HCObj.chart.useRoundEdges,
                showShadow = pluckNumber(FCChartObj.showshadow, 1),
                hcColorArr = HCObj.colors,
                hcColorArrLen = HCObj.colors.length,
                //plotGradientColor = pluck(FCChartObj.plotgradientcolor, ' '),
                plotGradientColor = COMMA + (pluckNumber(
                    FCChartObj.useplotgradientcolor, 0) ? getDefinedColor(
                    FCChartObj.plotgradientcolor,
                    defaultPaletteOptions.plotGradientColor[paletteIndex]) :
                BLANK),
                colorIndex = seriesIndex * 2,

                defPlotBorderThickness = pluckNumber(
                    FCChartObj.plotborderthickness, 1),
                defPlotBorderColor = pluck(FCChartObj.plotbordercolor,
                    defaultPaletteOptions.plotBorderColor[paletteIndex])
                .split(COMMA)[0],
                borderAlphaDef = pluck(FCChartObj.plotborderalpha,
                    HUNDRED),
                defPlotBorderAlpha = FCChartObj.showplotborder == ZERO  ?
                ZERO : borderAlphaDef,
                defPlotBorderDashed = pluckNumber(dataset.dashed,
                    FCChartObj.plotborderdashed, 0),
                defPlotBorderDashLen = pluckNumber(dataset.dashlen,
                    FCChartObj.plotborderdashlen, 5),
                defPlotBorderDashGap = pluckNumber(dataset.dashgap,
                    FCChartObj.plotborderdashgap, 4),

                upperBoxColorDef = pluck(dataset.upperboxcolor,
                    FCChartObj.upperboxcolor,
                    hcColorArr[colorIndex % hcColorArrLen]),
                lowerBoxColorDef = pluck(dataset.lowerboxcolor,
                    FCChartObj.lowerboxcolor,
                    hcColorArr[(colorIndex + 1) %
                    hcColorArrLen]),
                upperBoxAlphaDef = pluckNumber(dataset.upperboxalpha,
                    FCChartObj.upperboxalpha),
                lowerBoxAlphaDef = pluckNumber(dataset.lowerboxalpha,
                    FCChartObj.lowerboxalpha),

                upperWhiskerColor = pluck(dataset.upperwhiskercolor,
                    FCChartObj.upperwhiskercolor, defPlotBorderColor),
                lowerWhiskerColor = pluck(dataset.lowerwhiskercolor,
                    FCChartObj.lowerwhiskercolor, defPlotBorderColor),
                upperWhiskerAlpha = pluckNumber(dataset.upperwhiskeralpha,
                    FCChartObj.upperwhiskeralpha, FCChartObj.plotborderalpha,
                    HUNDRED),
                lowerWhiskerAlpha = pluckNumber(dataset.lowerwhiskeralpha,
                    FCChartObj.lowerwhiskeralpha, FCChartObj.plotborderalpha,
                    HUNDRED),
                upperWhiskerThickness = pluckNumber(
                    dataset.upperwhiskerthickness,
                    FCChartObj.upperwhiskerthickness, defPlotBorderThickness),
                lowerWhiskerThickness = pluckNumber(
                    dataset.lowerwhiskerthickness,
                    FCChartObj.lowerwhiskerthickness, defPlotBorderThickness),
                upperWhiskerDashed = pluck(dataset.upperwhiskerdashed,
                    FCChartObj.upperwhiskerdashed, 0),
                lowerWhiskerDashed = pluck(dataset.lowerwhiskerdashed,
                    FCChartObj.lowerwhiskerdashed, 0),
                upperWhiskerDashLen = pluck(dataset.upperwhiskerdashlen,
                    FCChartObj.upperwhiskerdashlen, 5),
                lowerWhiskerDashLen = pluck(dataset.lowerwhiskerdashlen,
                    FCChartObj.lowerwhiskerdashlen, 5),
                upperWhiskerDashGap = pluck(dataset.upperwhiskerdashgap,
                    FCChartObj.upperwhiskerdashgap, 4),
                lowerWhiskerDashGap = pluck(dataset.lowerwhiskerdashgap,
                    FCChartObj.lowerwhiskerdashgap, 4),

                upperQuartileColor = pluck(dataset.upperquartilecolor,
                    FCChartObj.upperquartilecolor, defPlotBorderColor),
                lowerQuartileColor = pluck(dataset.lowerquartilecolor,
                    FCChartObj.lowerquartilecolor, defPlotBorderColor),
                upperBoxBorderColor = pluck(dataset.upperboxbordercolor,
                    FCChartObj.upperboxbordercolor, defPlotBorderColor),
                lowerBoxBorderColor = pluck(dataset.lowerboxbordercolor,
                    FCChartObj.lowerboxbordercolor, defPlotBorderColor),
                medianColor = pluck(dataset.mediancolor,
                    FCChartObj.mediancolor, defPlotBorderColor),

                upperQuartileAlpha = pluck(dataset.upperquartilealpha,
                    FCChartObj.upperquartilealpha, isRoundEdges ? 0 :
                    borderAlphaDef),
                lowerQuartileAlpha = pluck(dataset.lowerquartilealpha,
                    FCChartObj.lowerquartilealpha, isRoundEdges ? 0 :
                    borderAlphaDef),
                upperBoxBorderAlpha = pluck(dataset.upperboxborderalpha,
                    FCChartObj.upperboxborderalpha, isRoundEdges ? 0 :
                    defPlotBorderAlpha),
                lowerBoxBorderAlpha = pluck(dataset.lowerboxborderalpha,
                    FCChartObj.lowerboxborderalpha, isRoundEdges ? 0 :
                    defPlotBorderAlpha),
                medianAlpha = pluck(dataset.medianalpha,
                    FCChartObj.medianalpha, borderAlphaDef),

                upperQuartileThickness = pluck(dataset.upperquartilethickness,
                    FCChartObj.upperquartilethickness, defPlotBorderThickness),
                lowerQuartileThickness = pluck(dataset.lowerquartilethickness,
                    FCChartObj.lowerquartilethickness, defPlotBorderThickness),
                upperBoxBorderThickness = pluck(dataset.upperboxborderthickness,
                    FCChartObj.upperboxborderthickness, defPlotBorderThickness),
                lowerBoxBorderThickness = pluck(dataset.lowerboxborderthickness,
                    FCChartObj.lowerboxborderthickness, defPlotBorderThickness),
                medianThickness = pluck(dataset.medianthickness,
                    FCChartObj.medianthickness, defPlotBorderThickness),

                // Following new attributes added to manage dashed style
                upperQuartileDashed = pluck(dataset.upperquartiledashed,
                    FCChartObj.upperquartiledashed, defPlotBorderDashed),
                lowerQuartileDashed = pluck(dataset.lowerquartiledashed,
                    FCChartObj.lowerquartiledashed, defPlotBorderDashed),
                upperBoxBorderDashed = pluck(dataset.upperboxborderdashed,
                    FCChartObj.upperboxborderdashed, defPlotBorderDashed),
                lowerBoxBorderDashed = pluck(dataset.lowerboxborderdashed,
                    FCChartObj.lowerboxborderdashed, defPlotBorderDashed),
                medianDashed = pluck(dataset.mediandashed,
                    FCChartObj.mediandashed, defPlotBorderDashed),

                upperQuartileDashLen = pluck(dataset.upperquartiledashlen,
                    FCChartObj.upperquartiledashlen, defPlotBorderDashLen),
                lowerQuartileDashLen = pluck(dataset.lowerquartiledashlen,
                    FCChartObj.lowerquartiledashlen, defPlotBorderDashLen),
                upperBoxBorderDashLen = pluck(dataset.upperboxborderdashlen,
                    FCChartObj.upperboxborderdashlen, defPlotBorderDashLen),
                lowerBoxBorderDashLen = pluck(dataset.lowerboxborderdashlen,
                    FCChartObj.lowerboxborderdashlen, defPlotBorderDashLen),
                medianDashLen = pluck(dataset.mediandashlen,
                    FCChartObj.mediandashlen, defPlotBorderDashLen),

                upperQuartileDashGap = pluck(dataset.upperquartiledashgap,
                    FCChartObj.upperquartiledashgap, defPlotBorderDashGap),
                lowerQuartileDashGap = pluck(dataset.lowerquartiledashgap,
                    FCChartObj.lowerquartiledashgap, defPlotBorderDashGap),
                upperBoxBorderDashGap = pluck(dataset.upperboxborderdashgap,
                    FCChartObj.upperboxborderdashgap, defPlotBorderDashGap),
                lowerBoxBorderDashGap = pluck(dataset.lowerboxborderdashgap,
                    FCChartObj.lowerboxborderdashgap, defPlotBorderDashGap),
                medianDashGap = pluck(dataset.mediandashgap,
                    FCChartObj.mediandashgap, defPlotBorderDashGap),

                upperQuartile = {},
                lowerQuartile = {},
                upperBoxBorder = {},
                lowerBoxBorder = {},
                median = {},

                // Mean Configuration
                meanArr = [],
                // Mean deviation
                MDArr = [],
                // Standard deviation
                SDArr = [],
                // Quartile deviation
                QDArr = [],
                // Outliers
                outliersArr = [],

                POLYGON = 'polygon',
                SPOKE = 'spoke',
                iconShape = {
                    polygon: POLYGON,
                    spoke: SPOKE
                },
                // MEAN ICONS
                meanIconShape = iconShape[pluck(dataset.meaniconshape,
                    FCChartObj.meaniconshape, POLYGON).toLowerCase()] ||
                POLYGON,
                meanIconRadius = pluckNumber(dataset.meaniconradius,
                    FCChartObj.meaniconradius, 5),
                meanIconSides = pluckNumber(dataset.meaniconsides,
                    FCChartObj.meaniconsides, 3),
                meanIconColor = pluck(dataset.meaniconcolor,
                    FCChartObj.meaniconcolor, '000000'),
                meanIconBorderColor = pluck(dataset.meaniconbordercolor,
                    FCChartObj.meaniconbordercolor, '000000'),
                meanIconAlpha = pluckNumber(dataset.meaniconalpha,
                    FCChartObj.meaniconalpha, 100),
                // SD ICONS
                sdIconShape = iconShape[pluck(dataset.sdiconshape,
                    FCChartObj.sdiconshape, POLYGON).toLowerCase()] ||
                POLYGON,
                sdIconRadius = pluckNumber(dataset.sdiconradius,
                    FCChartObj.sdiconradius, 5),
                sdIconSides = pluckNumber(dataset.sdiconsides,
                    FCChartObj.sdiconsides, 3),
                sdIconColor = pluck(dataset.sdiconcolor,
                    FCChartObj.sdiconcolor, '000000'),
                sdIconBorderColor = pluck(dataset.sdiconbordercolor,
                    FCChartObj.sdiconbordercolor, '000000'),
                sdIconAlpha = pluckNumber(dataset.sdiconalpha,
                    FCChartObj.sdiconalpha, 100),
                // MD ICONS
                mdIconShape = iconShape[pluck(dataset.mdiconshape,
                    FCChartObj.mdiconshape, POLYGON).toLowerCase()] ||
                POLYGON,
                mdIconRadius = pluckNumber(dataset.mdiconradius,
                    FCChartObj.mdiconradius, 5),
                mdIconSides = pluckNumber(dataset.mdiconsides,
                    FCChartObj.mdiconsides, 3),
                mdIconColor = pluck(dataset.mdiconcolor,
                    FCChartObj.mdiconcolor, '000000'),
                mdIconBorderColor = pluck(dataset.mdiconbordercolor,
                    FCChartObj.mdiconbordercolor, '000000'),
                mdIconAlpha = pluckNumber(dataset.mdiconalpha,
                    FCChartObj.mdiconalpha, 100),
                // QD ICONS
                qdIconShape = iconShape[pluck(dataset.qdiconshape,
                    FCChartObj.qdiconshape, POLYGON).toLowerCase()] ||
                POLYGON,
                qdIconRadius = pluckNumber(dataset.qdiconradius,
                    FCChartObj.qdiconradius, 5),
                qdIconSides = pluckNumber(dataset.qdiconsides,
                    FCChartObj.qdiconsides, 3),
                qdIconColor = pluck(dataset.qdiconcolor,
                    FCChartObj.qdiconcolor, '000000'),
                qdIconBorderColor = pluck(dataset.qdiconbordercolor,
                    FCChartObj.qdiconbordercolor, '000000'),
                qdIconAlpha = pluckNumber(dataset.qdiconalpha,
                    FCChartObj.qdiconalpha, 100),
                // QD ICONS
                outlierIconShape = iconShape[pluck(dataset.outliericonshape,
                    FCChartObj.outliericonshape, POLYGON).toLowerCase()] ||
                POLYGON,
                outlierIconRadius = pluckNumber(dataset.outliericonradius,
                    FCChartObj.outliericonradius, 5),
                outlierIconSides = pluckNumber(dataset.outliericonsides,
                    FCChartObj.outliericonsides, 3),
                outlierIconColor = pluck(dataset.outliericoncolor,
                    FCChartObj.outliericoncolor, '000000'),
                outlierIconBorderColor = pluck(dataset.outliericonbordercolor,
                    FCChartObj.outliericonbordercolor, '000000'),
                outlierIconAlpha = pluckNumber(dataset.outliericonalpha,
                    FCChartObj.outliericonalpha, 100),

                datasetLen = 2 - 1,
                plotSpacePercent = conf.plotSpacePercent * 2,
                perSeriesLen = (1 - plotSpacePercent) / 2,
                pointStart = ((datasetLen * -0.5) + seriesIndex) *
                    perSeriesLen,
                reverseLegend = pluckNumber(FCChartObj.reverselegend, 0),
                legendIndexInc = reverseLegend ? -1 : 1,
                legendIndex = series.legendIndex = (seriesIndex * 6) +
                    (reverseLegend ? 6 - 1 : 0),
                showMeanDef = pluckNumber(dataset.showmean, FCChartObj.showmean,
                    0),
                showMDDef = pluckNumber(dataset.showmd, FCChartObj.showmd, 0),
                showSDDef = pluckNumber(dataset.showsd, FCChartObj.showsd, 0),
                showQDDef = pluckNumber(dataset.showqd, FCChartObj.showqd, 0),
                showAllOutliers = pluckNumber(dataset.showalloutliers,
                    FCChartObj.showalloutliers, 0),
                outliersUpperRangeRatio =
                pluckNumber(FCChartObj.outliersupperrangeratio, 0),
                outliersLowerRangeRatio =
                pluckNumber(FCChartObj.outlierslowerrangeratio, 0),
                hasValidPoint = false,
                showDetailedLegend = Boolean(pluckNumber(
                    FCChartObj.showdetailedlegend, 1)),
                tooltipSepChar = conf.tooltipSepChar,
                showInLegend = true,
                dataSeparator = conf.dataSeparator,
                bwCalc = conf.bwCalc,
                diffrence,
                showMean,
                showMD,
                showSD,
                showQD,
                hasValidMean,
                hasValidMD,
                hasValidSD,
                hasValidQD,
                iconAlpha,
                meanVal,
                SDVal,
                MDVal,
                QDVal,

                upperSeriesColor,
                lowerSeriesColor,
                outliersDataArr,
                outliersDataLen,
                ind,
                outlierVal,
                itemValue,
                highValue,
                lowValue,
                index,
                upperBoxColor,
                lowerBoxColor,
                upperBoxAlpha,
                lowerBoxAlpha,

                dataObj,
                setRatio,
                setAngle,
                isBar,
                is3d,
                upperboxColorArr,
                lowerboxColorArr,
                pointStub,
                toolText,
                pointShadow,
                plotBorderAlpha,
                data,
                dataArr,
                max,
                min,
                medianValue,
                quartile,
                quartile1,
                quartile3,
                limits,
                errorValueArr,
                meanSeries,
                sdSeries,
                mdSeries,
                qdSeries,
                outliersSeries;

            // Error Bar Attributes
            series.errorBarWidthPercent = pluckNumber(
                dataset.whiskerslimitswidthratio,
                FCChartObj.whiskerslimitswidthratio, 40);

            // We proceed if there is data inside dataset object
            data = dataset.data;

            // Dataset seriesname
            series.name = getValidValue(dataset.seriesname);

            // If includeInLegend set to false
            // We set series.name blank
            if (pluckNumber(dataset.includeinlegend) === 0 ||
                series.name === undefined) {
                showInLegend = series.showInLegend = false;
            }

            // If icon sides < 3 we use sides as 5
            if (meanIconSides < 3) {
                meanIconSides = 3;
            }

            // Color of the individual series
            upperSeriesColor = parseColor(upperBoxColorDef.split(
                COMMA)[0]);
            lowerSeriesColor = parseColor(lowerBoxColorDef.split(
                COMMA)[0]);
            series.color = {
                FCcolor: {
                    color: upperSeriesColor + COMMA +
                    upperSeriesColor + COMMA +
                    lowerSeriesColor + COMMA +
                    lowerSeriesColor,
                    alpha: '100,100,100,100',
                    angle: 90,
                    ratio: '0,50,0,50'
                }
            }

            // is3d and isBar helps to get the column color by
            // getColumnColor function
            // whether the chart is a 3D or Bar
            isBar = this.isBar;
            is3d = /3d$/.test(HCObj.chart.defaultSeriesType);

            // Managing plot border color for 3D column chart
            // 3D column chart doesn't show the plotborder by default
            // until we set showplotborder true
            defPlotBorderAlpha = is3d ? (FCChartObj.showplotborder ?
                defPlotBorderAlpha : ZERO) : defPlotBorderAlpha;

            // Default  plotBorderColor  is FFFFFF for this 3d chart
            defPlotBorderColor = is3d ? pluck(FCChartObj.plotbordercolor,
                "#FFFFFF") : defPlotBorderColor;

            // Validation of outliersUpperRangeRatio
            outliersUpperRangeRatio = (outliersUpperRangeRatio < 0) ?
            0 : outliersUpperRangeRatio;
            // Validation of outliersLowerRangeRatio
            outliersLowerRangeRatio = (outliersLowerRangeRatio < 0) ?
            0 : outliersLowerRangeRatio;

            // Iterate through all level data
            // We are managing the data value labels and other
            // cosmetics inside this loop
            for (index = 0; index < catLength; index += 1) {

                // Individual data object
                if ((dataObj = data && data[index])) {
                    bwCalc.setArray(dataObj.value);
                    quartile = bwCalc.getQuartiles();
                    quartile1 = quartile.q1;
                    quartile3 = quartile.q3;

                    limits = bwCalc.getMinMax();
                    min = lowValue = limits.min;
                    max = limits.max;
                    medianValue = bwCalc.getMedian();
                    meanVal = bwCalc.getMean();
                    MDVal = bwCalc.getMD();
                    SDVal = bwCalc.getSD();
                    QDVal = bwCalc.getQD();

                    // get the valid value
                    highValue = itemValue = max;
                }

                if (!dataObj || quartile1 == null || quartile3 == null || itemValue === null) {
                    // add the null data
                    series.data.push({
                        y : null
                    });
                    MDArr.push({
                        y: null
                    });
                    SDArr.push({
                        y: null
                    });
                    QDArr.push({
                        y: null
                    });
                    meanArr.push({
                        y: null
                    });
                    continue;
                }

                hasValidPoint = true;

                showMean = pluckNumber(dataObj.showmean, showMeanDef);
                showMD = pluckNumber(dataObj.showmd, showMDDef);
                showSD = pluckNumber(dataObj.showsd, showSDDef);
                showQD = pluckNumber(dataObj.showqd, showQDDef);

                pointStub = this.getPointStub(HCObj, FCChartObj,
                    dataset, dataObj, max, quartile3, medianValue,
                    quartile1, min);
                toolText = pointStub.toolText;

                if (showMean) {
                    hasValidMean = 1;
                    iconAlpha = pluckNumber(dataObj.meaniconalpha,
                        meanIconAlpha);
                    meanArr.push({
                        y: meanVal,
                        toolText: '<b>Mean' + tooltipSepChar + '</b>' +
                        NumberFormatter.dataLabels(meanVal),
                        link: pointStub.link,
                        marker : {
                            fillColor: convertColor(pluck(
                                dataObj.meaniconcolor, meanIconColor),
                            iconAlpha),
                            lineColor: convertColor(pluck(
                                dataObj.meaniconbordercolor,
                                meanIconBorderColor), iconAlpha),
                            radius: pluckNumber(dataObj.meaniconradius,
                                meanIconRadius),
                            symbol: mapSymbolName(
                                pluckNumber(dataObj.meaniconsides,
                                    meanIconSides), pluck(
                                    dataObj.meaniconshape,
                                    meanIconShape) == SPOKE)
                        }
                    });
                }
                else {
                    meanArr.push({
                        y: null
                    });
                }

                if (showMD) {
                    hasValidMD = 1;
                    iconAlpha = pluckNumber(dataObj.mdiconalpha,
                        mdIconAlpha);
                    MDArr.push({
                        y: MDVal,
                        toolText: '<b>MD' + tooltipSepChar + '</b>' +
                        NumberFormatter.dataLabels(MDVal),
                        link: pointStub.link,
                        marker : {
                            fillColor: convertColor(pluck(
                                dataObj.mdiconcolor, mdIconColor),
                            iconAlpha),
                            lineColor: convertColor(pluck(
                                dataObj.mdiconbordercolor,
                                sdIconBorderColor), iconAlpha),
                            radius: pluckNumber(dataObj.mdiconradius,
                                mdIconRadius),
                            symbol: mapSymbolName(
                                pluckNumber(dataObj.mdiconsides,
                                    mdIconSides), pluck(
                                    dataObj.mdiconshape,
                                    mdIconShape) == SPOKE)
                        }
                    });
                }
                else {
                    MDArr.push({
                        y: null
                    });
                }

                if (showSD) {
                    hasValidSD = 1;
                    iconAlpha = pluckNumber(dataObj.sdiconalpha,
                        sdIconAlpha);
                    SDArr.push({
                        y: SDVal,
                        toolText: '<b>SD' + tooltipSepChar + '</b>' +
                        NumberFormatter.dataLabels(SDVal),
                        link: pointStub.link,
                        marker : {
                            fillColor: convertColor(pluck(
                                dataObj.sdiconcolor,
                                sdIconColor), iconAlpha),
                            lineColor: convertColor(pluck(
                                dataObj.sdiconbordercolor,
                                sdIconBorderColor), iconAlpha),
                            radius: pluckNumber(dataObj.sdiconradius,
                                sdIconRadius),
                            symbol: mapSymbolName(
                                pluckNumber(dataObj.sdiconsides,
                                    sdIconSides), pluck(
                                    dataObj.sdiconshape,
                                    sdIconShape) == SPOKE)
                        }
                    });
                }
                else {
                    SDArr.push({
                        y: null
                    });
                }

                if (showQD) {
                    hasValidQD = 1;
                    iconAlpha = pluckNumber(dataObj.qdiconalpha,
                        qdIconAlpha);
                    QDArr.push({
                        y: QDVal,
                        toolText: '<b>QD' + tooltipSepChar + '</b>' +
                        NumberFormatter.dataLabels(QDVal),
                        link: pointStub.link,
                        marker : {
                            fillColor: convertColor(pluck(dataObj.qdiconcolor,
                                qdIconColor), iconAlpha),
                            lineColor: convertColor(pluck(
                                dataObj.qdiconbordercolor,
                                qdIconBorderColor), iconAlpha),
                            radius: pluckNumber(dataObj.qdiconradius,
                                qdIconRadius),
                            symbol: mapSymbolName(
                                pluckNumber(dataObj.qdiconsides,
                                    qdIconSides), pluck(
                                    dataObj.qdiconshape,
                                    qdIconShape) == SPOKE)
                        }
                    });
                }
                else {
                    QDArr.push({
                        y: null
                    });
                }

                if ((outliersDataArr = dataObj.outliers)) {
                    outliersDataArr = outliersDataArr
                    .replace(/\s/g, BLANK).split(dataSeparator);
                    // Parse the values using NumberFormatter getCleanValue
                    outliersDataLen = outliersDataArr.length;
                    while (outliersDataLen--) {
                        outliersDataArr[outliersDataLen] =
                            NumberFormatter.getCleanValue(outliersDataArr
                                [outliersDataLen]);
                    }
                    outliersDataArr.sort(function (a, b) {
                        return a - b;
                    });
                    outliersDataLen = outliersDataArr.length;

                    for (ind = 0; ind < outliersDataLen; ind += 1) {
                        outlierVal = outliersDataArr[ind];
                        if (showAllOutliers) {
                            highValue = mathMax(itemValue, outlierVal);
                            lowValue = mathMin(min, outlierVal);
                        }
                        iconAlpha = pluckNumber(
                            dataObj.outliericonalpha, outlierIconAlpha);
                        (outlierVal > itemValue || outlierVal < min) &&
                        outliersArr.push({
                            y: outlierVal,
                            toolText: '<b>Outlier' + tooltipSepChar + '</b>' +
                            NumberFormatter.dataLabels(outlierVal),
                            x: index,
                            link: pointStub.link,
                            marker : {
                                fillColor: convertColor(pluck(
                                    dataObj.outliericoncolor,
                                    outlierIconColor), iconAlpha),
                                lineColor: convertColor(pluck(
                                    dataObj.outliericonbordercolor,
                                    outlierIconBorderColor), iconAlpha),
                                radius: pluckNumber(
                                    dataObj.outliericonradius,
                                    outlierIconRadius),
                                symbol: mapSymbolName(
                                    pluckNumber(dataObj.outliericonsides,
                                        outlierIconSides), pluck(
                                        dataObj.outliericonshape,
                                        outlierIconShape) == SPOKE)
                            }
                        });
                    }
                }
                if (!showAllOutliers) {
                    diffrence = highValue - lowValue;
                    highValue += diffrence * outliersUpperRangeRatio;
                    lowValue -= diffrence * outliersLowerRangeRatio;
                }
                // Color for the upperBox
                upperBoxColor = pluck(dataObj.upperboxcolor,
                    upperBoxColorDef) + plotGradientColor;
                // Color for the lowerBox
                lowerBoxColor = pluck(dataObj.lowerboxcolor,
                    lowerBoxColorDef) + plotGradientColor;
                // Alpha of the upperBox
                upperBoxAlpha = pluck(dataObj.upperboxalpha,
                    upperBoxAlphaDef,
                    FCChartObj.upperboxalpha, FCChartObj.plotfillalpha,
                    HUNDRED) + BLANK;
                // Alpha of the lowerBox
                lowerBoxAlpha = pluck(dataObj.lowerboxalpha,
                    lowerBoxAlphaDef,
                    FCChartObj.lowerboxalpha, FCChartObj.plotfillalpha,
                    HUNDRED) + BLANK;
                setRatio = pluck(dataObj.ratio, dataset.ratio,
                    FCChartObj.plotfillratio);
                // defaultAngle depend upon item value
                setAngle = pluck(360 - FCChartObj.plotfillangle, 90);

                if (itemValue < 0) {
                    setAngle = 360 - setAngle;
                }
                // Used to set alpha of the shadow
                pointShadow = {
                    opacity: upperBoxAlpha / 100
                };
                plotBorderAlpha = mathMin(upperBoxAlpha,
                    defPlotBorderAlpha) + BLANK;

                // Calculate the color object for upperBox
                upperboxColorArr = getColumnColor (upperBoxColor,
                    upperBoxAlpha, setRatio, setAngle, isRoundEdges,
                    defPlotBorderColor, plotBorderAlpha, isBar, is3d);
                // calculate the color object for lowerBox
                lowerboxColorArr = getColumnColor (lowerBoxColor,
                    lowerBoxAlpha, setRatio, setAngle, isRoundEdges,
                    defPlotBorderColor, plotBorderAlpha, isBar, is3d);

                upperQuartile = {
                    value: quartile3,
                    color: convertColor(pluck(
                        dataObj.upperquartilecolor, upperQuartileColor),
                    pluckNumber(dataObj.upperquartilealpha,
                        upperQuartileAlpha)),
                    borderWidth: pluckNumber(
                        dataObj.upperquartilethickness,
                        upperQuartileThickness),
                    dashStyle: pluckNumber(dataObj.upperquartiledashed,
                        upperQuartileDashed) ?
                    getDashStyle(pluck(dataObj.upperquartiledashlen,
                        upperQuartileDashLen),
                    pluck(dataObj.upperquartiledashgap,
                        upperQuartileDashGap), pluckNumber(
                        dataObj.upperquartilethickness,
                        upperQuartileThickness)) :
                    undefined,
                    displayValue: pointStub.displayValueQ3
                };

                lowerQuartile = {
                    value: quartile1,
                    color: convertColor(pluck(
                        dataObj.lowerquartilecolor, lowerQuartileColor),
                    pluckNumber(dataObj.lowerquartilealpha,
                        lowerQuartileAlpha)),
                    borderWidth: pluckNumber(
                        dataObj.lowerquartilethickness,
                        lowerQuartileThickness),
                    dashStyle: pluckNumber(dataObj.lowerquartiledashed,
                        lowerQuartileDashed) ?
                    getDashStyle(pluck(dataObj.lowerquartiledashlen,
                        lowerQuartileDashLen),
                    pluck(dataObj.lowerquartiledashgap,
                        lowerQuartileDashGap), pluckNumber(
                        dataObj.lowerquartilethickness,
                        lowerQuartileThickness)) :
                    undefined,
                    displayValue: pointStub.displayValueQ1
                };

                upperBoxBorder = {
                    color: convertColor(pluck(
                        dataObj.upperboxbordercolor,
                        upperBoxBorderColor),
                    pluckNumber(dataObj.upperboxborderalpha,
                        upperBoxBorderAlpha)),
                    borderWidth: pluckNumber(
                        dataObj.upperboxborderthickness,
                        upperBoxBorderThickness),
                    dashStyle: pluckNumber(dataObj.upperboxborderdashed,
                        upperBoxBorderDashed) ?
                    getDashStyle(pluck(dataObj.upperboxborderdashlen,
                        upperBoxBorderDashLen),
                    pluck(dataObj.upperboxborderdashgap,
                        upperBoxBorderDashGap), pluckNumber(
                        dataObj.upperboxborderthickness,
                        upperBoxBorderThickness)) :
                    undefined
                };

                lowerBoxBorder = {
                    color: convertColor(pluck(
                        dataObj.lowerboxbordercolor,
                        lowerBoxBorderColor),
                    pluckNumber(dataObj.lowerboxborderalpha,
                        lowerBoxBorderAlpha)),
                    borderWidth: pluckNumber(
                        dataObj.lowerboxborderthickness,
                        lowerBoxBorderThickness),
                    dashStyle: pluckNumber(dataObj.lowerboxborderdashed,
                        lowerBoxBorderDashed) ?
                    getDashStyle(pluck(dataObj.lowerboxborderdashlen,
                        lowerBoxBorderDashLen),
                    pluck(dataObj.lowerboxborderdashgap,
                        lowerBoxBorderDashGap), pluckNumber(
                        dataObj.lowerboxborderthickness,
                        lowerBoxBorderThickness)) :
                    undefined
                };

                median = {
                    value: medianValue,
                    color: convertColor(pluck(
                        dataObj.mediancolor, medianColor),
                    pluckNumber(dataObj.medianalpha,
                        medianAlpha)),
                    borderWidth: pluckNumber(
                        dataObj.medianthickness,
                        medianThickness),
                    dashStyle: pluckNumber(dataObj.mediandashed,
                        medianDashed) ?
                    getDashStyle(pluck(dataObj.mediandashlen,
                        medianDashLen),
                    pluck(dataObj.mediandashgap,
                        medianDashGap), pluckNumber(
                        dataObj.medianthickness,
                        medianThickness)) :
                    undefined,
                    displayValue: pointStub.displayValueMid
                };

                errorValueArr = [];
                defined(max) && errorValueArr.push({
                    errorValue: max - quartile3,
                    toolText: toolText,
                    link: pointStub.link,
                    errorBarColor: convertColor(pluck(
                        dataObj.upperwhiskercolor, upperWhiskerColor),
                    pluckNumber(dataObj.upperwhiskeralpha,
                        upperWhiskerAlpha)),
                    errorBarThickness: pluckNumber(
                        dataObj.upperwhiskerthickness,
                        upperWhiskerThickness),
                    dashStyle:  pluckNumber(dataObj.upperwhiskerdashed,
                        upperWhiskerDashed) ?
                    getDashStyle(pluck(dataObj.upperwhiskerdashlen,
                        upperWhiskerDashLen),
                    pluck(dataObj.upperwhiskerdashgap,
                        upperWhiskerDashGap), pluckNumber(
                        dataObj.upperwhiskerthickness,
                        upperWhiskerThickness)) :
                    undefined,
                    displayValue: pointStub.displayValueMax,
                    // We are making errorBar shadow opacity very low by
                    // dividing it's alpha with 160
                    shadow: {
                        opacity: showShadow ? pluckNumber(
                            dataObj.upperwhiskeralpha, upperWhiskerAlpha) / 250
                        : 0
                    }
                });

                defined(min) && errorValueArr.push({
                    errorValue: -(quartile1 - min),
                    errorStartValue: quartile1,
                    toolText: toolText,
                    link: pointStub.link,
                    errorBarColor: convertColor(pluck(
                        dataObj.lowerwhiskercolor, lowerWhiskerColor),
                    pluckNumber(dataObj.lowerwhiskeralpha,
                        lowerWhiskerAlpha)),
                    errorBarThickness: pluckNumber(
                        dataObj.lowerwhiskerthickness,
                        lowerWhiskerThickness),
                    dashStyle:  pluckNumber(dataObj.lowerwhiskerdashed,
                        lowerWhiskerDashed) ?
                    getDashStyle(pluck(dataObj.lowerwhiskerdashlen,
                        lowerWhiskerDashLen),
                    pluck(dataObj.lowerwhiskerdashgap,
                        lowerWhiskerDashGap), pluckNumber(
                        dataObj.lowerwhiskerthickness,
                        lowerWhiskerThickness)) :
                    undefined,
                    displayValue: pointStub.displayValueMin,
                    // We are making errorBar shadow opacity very low by
                    // dividing it's alpha with 160
                    shadow: {
                        opacity: showShadow ? pluckNumber(
                            dataObj.lowerwhiskeralpha, lowerWhiskerAlpha) / 250
                        : 0
                    }
                });

                // add the data
                series.data.push(extend2(pointStub, {
                    y: quartile3,
                    errorValue: errorValueArr,
                    shadow: pointShadow,
                    color: upperboxColorArr[0],
                    toolText: toolText,
                    lowerboxColor: lowerboxColorArr[0],
                    lowerboxBorderColor: lowerboxColorArr[1],
                    borderWidth: 0,
                    upperQuartile: upperQuartile,
                    lowerQuartile: lowerQuartile,
                    upperBoxBorder: upperBoxBorder,
                    lowerBoxBorder: lowerBoxBorder,
                    median: median
                }));

                // Set the maximum and minimum found in data
                // pointValueWatcher use to calculate the maximum and
                // minimum value of the Axis
                this.pointValueWatcher(HCObj, highValue);
                this.pointValueWatcher(HCObj, lowValue);

            }

            series.showInLegend = hasValidPoint && showInLegend;
            series.legendFillColor = convertColor(upperSeriesColor, 20);

            meanSeries = {
                type: 'line',
                name: 'Mean',
                data: meanArr,
                legendIndex: legendIndex + (legendIndexInc),
                showInLegend: !!hasValidMean && showInLegend && showDetailedLegend,
                marker : {
                    fillColor: convertColor(meanIconColor, 100),
                    lineColor: convertColor(meanIconBorderColor, 100),
                    radius: meanIconRadius,
                    symbol: mapSymbolName(meanIconSides,
                        meanIconShape == SPOKE)
                },
                color: pluckNumber(FCChartObj.drawmeanconnector,
                    dataset.drawmeanconnector,
                    0) ? convertColor(pluck(dataset.meanconnectorcolor,
                    FCChartObj.meanconnectorcolor, meanIconColor),
                pluckNumber(dataset.meanconnectoralpha,
                    FCChartObj.meanconnectoralpha, 100)) :
                COLOR_TRANSPARENT,
                lineWidth: pluckNumber(FCChartObj.drawmeanconnector,
                    dataset.drawmeanconnector, 0) ?
                pluckNumber(dataset.meanconnectorthickness,
                    FCChartObj.meanconnectorthickness, 1) : 0,
                shadow: 0,
                legendFillColor: series.legendFillColor
            };
            sdSeries = {
                type: 'line',
                name: 'SD',
                data: SDArr,
                legendIndex: legendIndex + (legendIndexInc * 2),
                showInLegend: !!hasValidSD && showInLegend &&
                showDetailedLegend,
                marker : {
                    fillColor: convertColor(sdIconColor, 100),
                    lineColor: convertColor(sdIconBorderColor, 100),
                    radius: sdIconRadius,
                    symbol: mapSymbolName(sdIconSides,
                        sdIconShape == SPOKE)
                },
                color: pluckNumber(FCChartObj.drawsdconnector,
                    dataset.drawsdconnector, 0) ?
                convertColor(pluck(dataset.sdconnectorcolor,
                    FCChartObj.sdconnectorcolor, sdIconColor),
                pluckNumber(dataset.sdconnectoralpha,
                    FCChartObj.sdconnectoralpha, 100)) : COLOR_TRANSPARENT,
                lineWidth: pluckNumber(FCChartObj.drawsdconnector,
                    dataset.drawsdconnector, 0) ?
                pluckNumber(dataset.sdconnectorthickness,
                    FCChartObj.sdconnectorthickness, 1) : 0,
                shadow: 0,
                pointStart: pointStart,
                legendFillColor: series.legendFillColor
            };
            mdSeries = {
                type: 'line',
                name: 'MD',
                data: MDArr,
                legendIndex: legendIndex + (legendIndexInc * 3),
                showInLegend: !!hasValidMD && showInLegend &&
                showDetailedLegend,
                marker : {
                    fillColor: convertColor(mdIconColor, 100),
                    lineColor: convertColor(mdIconBorderColor, 100),
                    radius: mdIconRadius,
                    symbol: mapSymbolName(mdIconSides,
                        mdIconShape == SPOKE)
                },
                color: pluckNumber(FCChartObj.drawmdconnector,
                    dataset.drawmdconnector, 0) ?
                convertColor(pluck(dataset.mdconnectorcolor,
                    FCChartObj.mdconnectorcolor, mdIconColor),
                pluckNumber(dataset.mdconnectoralpha,
                    FCChartObj.mdconnectoralpha, 100)) : COLOR_TRANSPARENT,
                lineWidth: pluckNumber(FCChartObj.drawmdconnector,
                    dataset.drawmdconnector, 0) ?
                pluckNumber(dataset.mdconnectorthickness,
                    FCChartObj.mdconnectorthickness, 1) : 0,
                shadow: 0,
                pointStart: pointStart,
                legendFillColor: series.legendFillColor
            };
            qdSeries = {
                type: 'line',
                name: 'QD',
                data: QDArr,
                legendIndex: legendIndex + (legendIndexInc * 4),
                showInLegend: !!hasValidQD && showInLegend &&
                showDetailedLegend,
                marker : {
                    fillColor: convertColor(qdIconColor, 100),
                    lineColor: convertColor(qdIconBorderColor, 100),
                    radius: qdIconRadius,
                    symbol: mapSymbolName(qdIconSides,
                        qdIconShape == SPOKE)
                },
                color: pluckNumber(FCChartObj.drawqdconnector,
                    dataset.drawqdconnector, 0) ?
                convertColor(pluck(dataset.qdconnectorcolor,
                    FCChartObj.qdconnectorcolor, qdIconColor),
                pluckNumber(dataset.qdconnectoralpha,
                    FCChartObj.qdconnectoralpha, 100)) : COLOR_TRANSPARENT,
                lineWidth: pluckNumber(FCChartObj.drawqdconnector,
                    dataset.drawqdconnector, 0) ?
                pluckNumber(dataset.qdconnectorthickness,
                    FCChartObj.qdconnectorthickness, 1) : 0,
                shadow: 0,
                pointStart: pointStart,
                legendFillColor: series.legendFillColor
            };
            outliersSeries = {
                type: 'line',
                name: 'Outlier',
                showInLegend: !!(outliersArr && outliersArr.length) &&
                showInLegend && showDetailedLegend,
                data: outliersArr,
                legendIndex: legendIndex + (legendIndexInc * 5),
                marker : {
                    fillColor: convertColor(outlierIconColor, 100),
                    lineColor: convertColor(outlierIconBorderColor, 100),
                    radius: outlierIconRadius,
                    symbol: mapSymbolName(outlierIconSides,
                        outlierIconShape == SPOKE)
                },
                color: COLOR_TRANSPARENT,
                lineWidth: 0,
                shadow: 0,
                pointStart: pointStart,
                legendFillColor: series.legendFillColor
            };

            HCObj._meanDataArr.push(meanSeries);
            HCObj._sdDataArr.push(sdSeries);
            HCObj._mdDataArr.push(mdSeries);
            HCObj._qdDataArr.push(qdSeries);
            HCObj._outliers.push(outliersSeries);

            return series;
        },

        series: function (FCObj, HCObj, chartName) {
            var series = HCObj.series,
            meanDataArr = HCObj._meanDataArr = [],
            sdDataArr = HCObj._sdDataArr = [],
            mdDataArr = HCObj._mdDataArr = [],
            qdDataArr = HCObj._qdDataArr = [],
            outliers = HCObj._outliers = [],
            conf = HCObj[CONFIGKEY],
            yAxis = HCObj.yAxis[0],
            plotSpacePercent = conf.plotSpacePercent * 2,
            relSer,
            seriesObj,
            perSeriesLen,
            length,
            datasetLen,
            pointStart,
            index,
            index2,
            ind,
            outliersDataArr,
            outliersObj,
            outliersDataObj,
            valueY,
            yMin,
            yMax;

            conf.dataSeparator = pluck(HCObj.chart.dataseparator, COMMASTRING);
            conf.bwCalc = new boxAndWhiskerStatisticalCalc(
                FCObj.chart.calculationmethod, conf.numberFormatter,
                conf.dataSeparator);
            // call the parent API series FN
            chartAPI.multiseries.series.call(this, FCObj, HCObj, chartName);

            datasetLen = series && series.length;
            length = mathMax(meanDataArr.length, sdDataArr.length,
                mdDataArr.length, qdDataArr.length, outliers.length,
                datasetLen);
            perSeriesLen = (1 - plotSpacePercent) / datasetLen;

            // Get the yAxis limits to hide the Outliers values outside
            // the limits
            yMin = yAxis.min;
            yMax = yAxis.max;

            // Insert mean, MD, SD, QD in HighChart series.
            HCObj.series = series.concat(meanDataArr, sdDataArr,
                mdDataArr, qdDataArr, outliers);

            // Creating related series to manage legend click
            for (index = 0; index < datasetLen; index += 1) {
                seriesObj = series[index];
                relSer = index;
                !seriesObj.relatedSeries && (seriesObj.relatedSeries = []);
                for (index2 = 0; index2 < 5; index2 += 1) {
                    relSer += datasetLen;
                    seriesObj.relatedSeries.push(relSer);
                }
            }

            for (index2 = index = 0; index2 < length; index2 += 1, index += 1) {

                pointStart = (((datasetLen - 1) * -0.5) + index) *
                perSeriesLen;

                meanDataArr[index] && (meanDataArr[index].pointStart =
                    pointStart);
                sdDataArr[index] && (sdDataArr[index].pointStart = pointStart);
                qdDataArr[index] && (qdDataArr[index].pointStart = pointStart);
                mdDataArr[index] && (mdDataArr[index].pointStart = pointStart);

                outliersObj = outliers[index];
                if ((outliersDataArr = outliersObj && outliersObj.data)) {
                    for (ind = 0; ind < outliersDataArr.length; ind += 1) {
                        // Hiding outliers values outside the axis limits
                        outliersDataObj = outliersDataArr[ind];
                        valueY = outliersDataObj.y;
                        outliersDataObj.y = valueY > yMax ||
                        valueY < yMin ? null : valueY;
                        // Manage x position for the points
                        outliersDataObj.x = outliersDataObj.x + pointStart;
                    }
                }
            }

            delete HCObj._meanDataArr;
            delete HCObj._sdDataArr;
            delete HCObj._mdDataArr;
            delete HCObj._qdDataArr;
            delete HCObj._outliers;
        },

        getPointStub: function (HCObj, FCChartObj, dataset, dataObj,
            max, q3, median, q1, min) {
            var toolText = BLANK,
            HCConfig = HCObj[CONFIGKEY],
            tooltipSepChar = HCConfig.tooltipSepChar,
            NumberFormatter = this.numberFormatter,
            showValues = pluckNumber(dataObj.showvalue,
                dataset.showvalues, FCChartObj.showvalues, 1),
            maxVal = {
                'true': NumberFormatter.dataLabels(max),
                'false': BLANK
            },
            q3Val = {
                'true': NumberFormatter.dataLabels(q3),
                'false': BLANK
            },
            medianVal = {
                'true': NumberFormatter.dataLabels(median),
                'false': BLANK
            },
            q1Val = {
                'true': NumberFormatter.dataLabels(q1),
                'false': BLANK
            },
            minVal = {
                'true': NumberFormatter.dataLabels(min),
                'false': BLANK
            };
            //create the tooltext
            if (!HCConfig.showTooltip) {
                toolText = BLANK;
            } else {
                toolText = getValidValue(dataObj.tooltext);
                if (!defined(toolText)) {
                    toolText = '<b>Maximum' + tooltipSepChar + '</b>' +
                    maxVal[!!1] + '<br/>';
                    toolText += '<b>Q3' + tooltipSepChar + '</b>' +
                    q3Val[!!1]  + '<br/>';
                    toolText += '<b>Median' + tooltipSepChar + '</b>' +
                    medianVal[!!1]  + '<br/>';
                    toolText += '<b>Q1' + tooltipSepChar + '</b>' +
                    q1Val[!!1]  + '<br/>';
                    toolText += '<b>Minimum' + tooltipSepChar + '</b>' +
                    minVal[!!1];
                }
            }

            return {
                toolText: toolText,
                link: pluck(dataObj.link),
                displayValueMax: maxVal[!!(showValues &&
                    pluckNumber(dataObj.showmaxvalue, dataset.showmaxvalues,
                        FCChartObj.showmaxvalues, 1))],
                displayValueMid: medianVal[!!(showValues &&
                    pluckNumber(dataObj.showmedianvalue,
                        dataset.showmedianvalues, FCChartObj.showmedianvalues,
                        1))],
                displayValueMin: minVal[!!(showValues &&
                    pluckNumber(dataObj.showminvalue, dataset.showminvalues,
                        FCChartObj.showminvalues, 1))],
                displayValueQ3: q3Val[!!(showValues &&
                    pluckNumber(dataObj.showq3value,
                        dataset.showq3values, FCChartObj.showq3values, 0))],
                displayValueQ1: q1Val[!!(showValues &&
                    pluckNumber(dataObj.showq1value,
                        dataset.showq1values, FCChartObj.showq1values, 0))]
            };
        }
    }, chartAPI.multiseries);


    /* HeatMap */


    chartAPI('heatmap', {
        standaloneInit: true,
        creditLabel : creditLabel,
        defaultSeriesType: 'heatmap',
        tooltipsepchar: ': ',
        tooltipConstraint: 'chart',

        series: function (FCObj, HCObj, seriesName, width, height) {
            var FCChartObj = FCObj.chart,
                HCChartObj = HCObj.chart,
                conf = HCObj[CONFIGKEY],
                series = HCObj.series,
                paletteIndex = HCChartObj.paletteIndex,
                NumberFormatter = this.numberFormatter,
                rows = FCObj.rows && FCObj.rows.row,
                rowsLength = rows && rows.length,
                columns = FCObj.columns && FCObj.columns.column,
                columnsLength = columns && columns.length,
                dataset = FCObj.dataset,
                data = dataset && dataset.data,
                colorRange = FCObj.colorrange || {},
                colorArr,
                colorRangeLen,
                // Use mapByPercent or not
                mapByPercent = conf.mapByPercent = pluckNumber(colorRange.mapbypercent, 0),
                mapByCategory = conf.mapByCategory =
                pluckNumber(FCChartObj.mapbycategory, 0),
                useColorGradient = !mapByCategory && pluckNumber((colorRange.gradient), 0),
                plotFillAlpha = pluck(FCChartObj.plotfillalpha, 100),
                showLabels = pluckNumber(FCChartObj.showlabels,
                    FCChartObj.showlabel, 1),
                showValues = pluckNumber(FCChartObj.showvalues, 1),

                //Plot cosmetic properties
                showPlotBorder = pluckNumber(FCChartObj.showplotborder , 1),
                plotBorderThickness = showPlotBorder ?
                pluckNumber(FCChartObj.plotborderthickness, 1) : 0,
                plotBorderColor = pluck(FCChartObj.plotbordercolor,
                    defaultPaletteOptions.plotBorderColor[paletteIndex]),
                plotBorderAlpha = pluck(FCChartObj.plotborderalpha,
                    showPlotBorder ? 95 : 0).toString(),
                borderColor = convertColor(plotBorderColor, plotBorderAlpha),
                //Dash Properties
                plotBorderDashed = pluckNumber(FCChartObj.plotborderdashed, 0),
                plotBorderDashLen = pluckNumber(FCChartObj.plotborderdashlen,
                    5),
                plotBorderDashGap = pluckNumber(FCChartObj.plotborderdashgap,
                    4),
                dashStyle = plotBorderDashed ? getDashStyle( plotBorderDashLen,
                    plotBorderDashGap, plotBorderThickness) : undefined,
                colorRangeManager = lib.colorRange,

                dataLabels = HCObj.plotOptions.series.dataLabels,
                dataLabelsStyle = dataLabels.style,
                labelFontSize = dataLabelsStyle.fontSize.replace(/px/i,
                    BLANK),

                rowCount = 0,
                columnsCount = 0,
                rowCountWRTData = 0,
                columnCountWRTData = 0,
                rowIdObj = conf.rowIdObj = {},
                columnIdObj = conf.columnIdObj = {},
                rawValues = [],
                dataStore = [],
                dataCount = 0,
                uniqueRowCol = [],
                rowId,
                rowIdLowerCase,
                columnId,
                columnIdLowerCase,
                colorObj,
                colorDataObj,
                minHeatValue,
                heatRange,
                maxHeatValue,
                dataObj,
                setValue,
                datasetIndex,
                datasetLength,
                columnObj,
                length,
                index,
                rowObj;

            if (useColorGradient) {
                HCObj.legend.type = 'gradient';
            }

            // Hide legend
            HCObj.legend.enabled = Boolean(pluckNumber(FCChartObj.showlegend, 1));

            // Creating seperate styles for special labels (TL, TR, BL, BR)
            dataLabels.tlLabelStyle = {
                fontFamily:	getValidValue(FCChartObj.tlfont,
                    dataLabelsStyle.fontFamily),
                color: getFirstColor(getValidValue(FCChartObj.tlfontcolor,
                    dataLabelsStyle.color)),
                fontSize: pluckFontSize(FCChartObj.tlfontsize,
                    labelFontSize) + PX
            };
            // calculate line height
            setLineHeight(dataLabels.tlLabelStyle);

            dataLabels.trLabelStyle = {
                fontFamily:	getValidValue(FCChartObj.trfont,
                    dataLabelsStyle.fontFamily),
                color: getFirstColor(getValidValue(FCChartObj.trfontcolor,
                    dataLabelsStyle.color)),
                fontSize: pluckFontSize(FCChartObj.trfontsize,
                    labelFontSize) + PX
            };
            // calculate line height
            setLineHeight(dataLabels.trLabelStyle);

            dataLabels.blLabelStyle = {
                fontFamily:	getValidValue(FCChartObj.blfont,
                    dataLabelsStyle.fontFamily),
                color: getFirstColor(getValidValue(FCChartObj.blfontcolor,
                    dataLabelsStyle.color)),
                fontSize: pluckFontSize(FCChartObj.blfontsize,
                    labelFontSize) + PX
            };
            // calculate line height
            setLineHeight(dataLabels.blLabelStyle);

            dataLabels.brLabelStyle = {
                fontFamily:	getValidValue(FCChartObj.brlfont,
                    dataLabelsStyle.fontFamily),
                color: getFirstColor(getValidValue(FCChartObj.brfontcolor,
                    dataLabelsStyle.color)),
                fontSize: pluckFontSize(FCChartObj.brfontsize,
                    labelFontSize) + PX
            };
            // calculate line height
            setLineHeight(dataLabels.brLabelStyle);

            // Parsing of rows
            // Row must contain an id
            for (index = 0; index < rowsLength; index += 1) {
                rowObj = rows[index];
                rowId = rowObj.id;
                if (defined(rowId) && rowId !== BLANK) {
                    rowCount += 1;
                    rowIdObj[rowId.toLowerCase()] = {
                        index: rowCount,
                        label: pluck(rowObj.label, rowObj.name, rowId)
                    };
                }
            }
            // Parsing of columns
            // Column must contain an id
            for (index = 0;
                index < columnsLength; index += 1) {
                columnObj = columns[index];
                columnId = columnObj.id;
                if (defined(columnId) && columnId !== BLANK) {
                    columnIdObj[columnId.toLowerCase()] = {
                        index: columnsCount,
                        label: pluck(columnObj.label, columnObj.name,
                            columnId)
                    };
                    columnsCount += 1;
                }
            }




            for (datasetIndex = 0, datasetLength = dataset && dataset.length;
                datasetIndex < datasetLength; datasetIndex += 1) {
                data = dataset[datasetIndex] && dataset[datasetIndex].data;

                for (index = 0, length = data && data.length; index < length;
                    index += 1) {
                    dataObj = data[index];
                    setValue =
                    NumberFormatter.getCleanValue(dataObj.value);
                    if (setValue === null && !mapByCategory) {
                        continue;
                    }

                    rowId = getValidValue(dataObj.rowid, dataObj.rowids);
                    rowIdLowerCase = getValidValue(rowId, BLANK)
                    .toLowerCase();
                    columnId = getValidValue(dataObj.columnid,
                        dataObj.columnids);
                    columnIdLowerCase = getValidValue(columnId, BLANK)
                    .toLowerCase();

                    rawValues.push(setValue);
                    // Find min and max value in data
                    if (!defined(minHeatValue) && !defined(maxHeatValue) &&
                        defined(setValue)) {
                        maxHeatValue = minHeatValue = setValue;
                    }
                    if (minHeatValue > setValue) {
                        minHeatValue = setValue;
                    }
                    if (maxHeatValue < setValue) {
                        maxHeatValue = setValue;
                    }

                    // Count number of rows and columns for data
                    if (defined(rowIdLowerCase) &&
                        !defined(rowIdObj[rowIdLowerCase]) && !rowsLength) {
                        rowCountWRTData += 1;
                        rowIdObj[rowIdLowerCase] = {
                            index: rowCountWRTData,
                            label: rowId
                        };
                    }
                    if (defined(columnIdLowerCase) &&
                        !defined(columnIdObj[columnIdLowerCase])
                        && !columnsLength) {
                        columnIdObj[columnIdLowerCase] = {
                            index: columnCountWRTData,
                            label: columnId
                        };
                        columnCountWRTData += 1;
                    }

                    rowObj = rowIdObj[rowIdLowerCase];
                    columnObj = columnIdObj[columnIdLowerCase];


                    if (rowObj && columnObj) {
                        if (!defined(uniqueRowCol[rowObj.index])) {
                            uniqueRowCol[rowObj.index] = [];
                        }
                        // To avoid repetition of the data with the same
                        // row and column
                        if (!uniqueRowCol[rowObj.index][columnObj.index]) {
                            dataCount += 1;
                            dataStore.push({
                                rowId: rowId,
                                columnId: columnId,
                                categoryId: pluck(dataObj.colorrangelabel,
                                    dataObj.categoryid, dataObj.categoryname,
                                    dataObj.category),
                                tlLabel: parseUnsafeString(pluck(dataObj.tllabel,
                                    dataObj.ltlabel)),
                                trLabel: parseUnsafeString(pluck(dataObj.trlabel,
                                    dataObj.rtlabel)),
                                blLabel: parseUnsafeString(pluck(dataObj.bllabel,
                                    dataObj.lblabel)),
                                brLabel: parseUnsafeString(pluck(dataObj.brlabel,
                                    dataObj.rblabel)),
                                setColor: dataObj.color,
                                setAlpha: pluck(dataObj.alpha,
                                    plotFillAlpha),
                                setShowLabel: pluckNumber(dataObj.showlabel,
                                    dataObj.showname, showLabels),
                                colorRangeLabel: dataObj.colorrangelabel,
                                displayValue: dataObj.displayvalue,
                                tooltext: dataObj.tooltext,
                                showvalue: dataObj.showvalue,
                                link: dataObj.link,
                                //Refernce for the data index
                                index: dataCount,
                                value: setValue,
                                y: rowObj.index,
                                x: columnObj.index
                            });
                            uniqueRowCol[rowObj.index][columnObj.index] =
                            dataCount;
                        }
                        else {
                            // If the data is being repeated, we update the old
                            // data with the latest one
                            dataStore[uniqueRowCol[rowObj.index]
                            [columnObj.index] - 1] = {
                                rowId: rowId,
                                columnId: columnId,
                                categoryId: pluck(dataObj.colorrangelabel,
                                    dataObj.categoryid, dataObj.categoryname,
                                    dataObj.category),
                                tlLabel: parseUnsafeString(pluck(dataObj.tllabel,
                                    dataObj.ltlabel)),
                                trLabel: parseUnsafeString(pluck(dataObj.trlabel,
                                    dataObj.rtlabel)),
                                blLabel: parseUnsafeString(pluck(dataObj.bllabel,
                                    dataObj.lblabel)),
                                brLabel: parseUnsafeString(pluck(dataObj.brlabel,
                                    dataObj.rblabel)),
                                setColor: dataObj.color,
                                setAlpha: pluck(dataObj.alpha,
                                    plotFillAlpha),
                                setShowLabel: pluckNumber(dataObj.showlabel,
                                    dataObj.showname, showLabels),
                                colorRangeLabel: dataObj.colorrangelabel,
                                displayValue: dataObj.displayvalue,
                                tooltext: dataObj.tooltext,
                                showvalue: dataObj.showvalue,
                                link: dataObj.link,
                                //Refernce for the data index
                                index: dataCount,
                                value: setValue,
                                y: rowObj.index,
                                x: columnObj.index
                            }
                        }
                    }
                }
            }


            //if there has no valid set then remove all series sothat it shows no data messege
            if(dataStore.length) {

                conf.rowCount = rowCount = mathMax(rowCount, rowCountWRTData);
                conf.columnCount = columnsCount = mathMax(columnsCount,
                    columnCountWRTData);

                // Revert the columnObj index
                for (index in rowIdObj) {
                    rowIdObj[index].index = rowCount - rowIdObj[index].index + 1;
                }

                conf.minHeatValue = minHeatValue;
                conf.maxHeatValue = maxHeatValue;
                heatRange = maxHeatValue - minHeatValue

                // mapByPercent will enable only when mapByCategory false
                mapByPercent = mapByPercent && !mapByCategory,

                // colorRange, dataMin, dataMax, autoOrderLegendIcon
                HCObj.colorRange = new colorRangeManager({
                    colorRange : FCObj.colorrange,
                    dataMin: minHeatValue,
                    dataMax: maxHeatValue,
                    sortLegend: pluckNumber(FCChartObj.autoorderlegendicon, FCChartObj.autoorderlegendicon, 0),
                    mapByCategory: mapByCategory,
                    defaultColor: 'cccccc',
                    numberFormatter: NumberFormatter
                });

                // Create series using colorRange.
                if (useColorGradient) {
                    series.push({
                        data: [],
                        borderWidth: plotBorderThickness,
                        borderColor: borderColor,
                        dashStyle: dashStyle
                    });
                }
                else {
                    colorArr = HCObj.colorRange.colorArr;
                    colorRangeLen = colorArr && colorArr.length;
                    for (index = 0; index < colorRangeLen; index += 1) {
                        colorDataObj = colorArr[index];
                        if (defined(colorDataObj.code)) {
                            series.push({
                                data: [],
                                name: pluck(colorDataObj.label, colorDataObj.name),
                                borderWidth: plotBorderThickness,
                                borderColor: borderColor,
                                color: parseColor(colorDataObj.code),
                                dashStyle: dashStyle
                            });
                        }
                    }
                }

                // Creating default series to avoid "No data to display".
                if (!series.length) {
                    series.push({
                        data: [],
                        showInLegend: false
                    });
                }

                for (index = 0; index < dataStore.length; index += 1) {
                    dataObj = dataStore[index];
                    //store the percent value as value in case of mapby percent
                    if (mapByPercent) {
                        dataObj.value = mathRound((dataObj.value -
                            minHeatValue) / heatRange * 10000) / 100;
                    }
                    colorObj = HCObj.colorRange.getColorObj(mapByCategory ?
                        dataObj.categoryId : dataObj.value);

                    if (colorObj.outOfRange) {
                        continue;
                    }

                    dataObj.y = conf.rowCount - dataObj.y + 1;
                    dataObj.color = convertColor(pluck(dataObj.setColor,
                        colorObj.code), pluck(dataObj.setAlpha, plotFillAlpha));

                    dataObj = extend2(dataObj, this.getPointStub(dataObj,
                        dataObj.value, BLANK, HCObj, FCObj));

                    if (useColorGradient) {
                        series[0].data.push(dataObj);
                    }
                    else {
                        series[colorObj.seriesIndex] &&
                        series[colorObj.seriesIndex].data.push(dataObj);
                    }
                }
            }
            //remove all serie to show nodata messege
            else {
                HCObj.series = [];
                delete series;
            }
            this.configureAxis(HCObj, FCObj);
        },

        getPointStub: function (setObj, value, label, HCObj, FCObj) {
            var HCConfig = HCObj[CONFIGKEY],
            FCChartObj = FCObj.chart,
            minHeatValue = HCConfig.minHeatValue,
            maxHeatValue = HCConfig.maxHeatValue,
            tooltipSepChar = HCConfig.tooltipSepChar,
            mapByCategory = HCConfig.mapByCategory,
            // mapByPercent will enable only when mapByCategory false
            mapByPercent = HCConfig.mapByPercent && !mapByCategory,
            NumberFormatter = this.numberFormatter,
            percentValue = NumberFormatter.percentValue(value),
            formatedVal = value === null ?  value :
            NumberFormatter.dataLabels(value),
            setTooltext = getValidValue(parseUnsafeString(setObj.tooltext)),
            setDisplayValue = getValidValue(parseUnsafeString(
                setObj.displayValue)),
            toolTextValue = mapByCategory ?
            setDisplayValue : pluck(setDisplayValue, formatedVal),
            showValue = pluckNumber(setObj.showvalue, HCConfig.showValues),
            tlType = getValidValue(FCChartObj.tltype, BLANK),
            trType = getValidValue(FCChartObj.trtype, BLANK),
            blType = getValidValue(FCChartObj.bltype, BLANK),
            brType = getValidValue(FCChartObj.brtype, BLANK),
            tlLabel = setObj.tlLabel,
            trLabel = setObj.trLabel,
            blLabel = setObj.blLabel,
            brLabel = setObj.brLabel,
            toolText,
            dataLink,
            displayValue;

            if (tlType !== BLANK) {
                tlType = '<b>' + tlType + tooltipSepChar + '</b>';
            }
            if (trType !== BLANK) {
                trType = '<b>' + trType + tooltipSepChar + '</b>';
            }
            if (blType !== BLANK) {
                blType = '<b>' + blType + tooltipSepChar + '</b>';
            }
            if (brType !== BLANK) {
                brType = '<b>' + brType + tooltipSepChar + '</b>';
            }

            //create the tooltext
            if (!HCConfig.showTooltip) {
                toolText = BLANK;
            }
            else if (setTooltext !== undefined) {
                toolText = setTooltext;
            }
            else {
                //determine the dispalay value then
                toolText = toolTextValue === BLANK ? false :
                // If mapByPercent is enabled, we show actual value as well as
                // percent value in toolTip
                ((mapByPercent ? '<b>Value' + tooltipSepChar + '</b>' +
                    formatedVal +
                    '<br/>' + '<b>Percentage' + tooltipSepChar + '</b>' +
                    percentValue :
                    toolTextValue)
                // Now we add special labels in toolTip
                + (setObj.tlLabel !== BLANK ? '<br/>' +
                    (tlType + setObj.tlLabel) : BLANK)
                + (setObj.trLabel !== BLANK ? '<br/>' +
                    trType + setObj.trLabel : BLANK)
                + (setObj.blLabel !== BLANK ? '<br/>' +
                    blType + setObj.blLabel : BLANK)
                + (setObj.brLabel !== BLANK ? '<br/>' +
                    brType + setObj.brLabel : BLANK));
            }
            //create the displayvalue
            if (!showValue) {
                tlLabel = trLabel = blLabel = brLabel = displayValue =
                BLANK;
            }
            else if (setDisplayValue !== undefined) {
                displayValue = setDisplayValue;
            }
            else {//determine the dispalay value then
                displayValue = mapByPercent ? percentValue : formatedVal;
            }

            ////create the link
            dataLink = pluck(setObj.link);
            return {
                displayValue : displayValue,
                toolText : toolText,
                link: dataLink,
                tlLabel: tlLabel,
                trLabel: trLabel,
                blLabel: blLabel,
                brLabel: brLabel
            };
        },

        configureAxis: function (HCObj, FCObj) {
            var conf = HCObj[CONFIGKEY],
            FCChartObj = FCObj.chart,
            yAxis = HCObj.yAxis[0],
            xAxis = HCObj.xAxis,
            POINT_FIVE = -0.5,
            rowCount = conf.rowCount,
            columnCount = conf.columnCount,
            axisGridManager = conf.axisGridManager,
            rowIdObj = conf.rowIdObj,
            paletteIndex = HCObj.chart.paletteIndex,
            columnIdObj = conf.columnIdObj,
            vDivLineColor = convertColor(pluck(FCChartObj.vdivlinecolor,
                FCChartObj.divlinecolor,
                defaultPaletteOptions.divLineColor[paletteIndex]),
            pluckNumber(FCChartObj.vdivlinealpha, FCChartObj.divlinealpha,
                defaultPaletteOptions.divLineAlpha[paletteIndex])),
            vDivLineWidth = pluckNumber(FCChartObj.vdivlinethickness,
                FCChartObj.divlinethickness, 1),
            vDivLineDash = pluckNumber(FCChartObj.vdivlineisdashed,
                FCChartObj.divlineisdashed, 0) ?
            getDashStyle(pluckNumber(FCChartObj.vdivlinedashlen,
                FCChartObj.divlinedashlen, 4),
            pluckNumber(FCChartObj.vdivlinedashgap,
                FCChartObj.divlinedashgap, 2), vDivLineWidth) : undefined,
            hDivLineColor = convertColor(pluck(FCChartObj.hdivlinecolor,
                FCChartObj.divlinecolor,
                defaultPaletteOptions.divLineColor[paletteIndex]),
            pluckNumber(FCChartObj.hdivlinealpha,
                FCChartObj.divlinealpha,
                defaultPaletteOptions.divLineAlpha[paletteIndex])),
            hDivLineWidth = pluckNumber(FCChartObj.hdivlinethickness,
                FCChartObj.divlinethickness, 1),
            hDivLineDash = pluckNumber(FCChartObj.hdivlineisdashed,
                FCChartObj.divlineisdashed, 0) ?
            getDashStyle(pluckNumber(FCChartObj.hdivlinedashlen,
                FCChartObj.divlinedashlen, 4),
            pluckNumber(FCChartObj.hdivlinedashgap,
                FCChartObj.divlinedashgap, 2), vDivLineWidth) : undefined,
            showLabels = pluckNumber(FCChartObj.showlabels,
                FCChartObj.showlabel, 1),
            showxAxisLabels = pluckNumber(FCChartObj.showxaxislabels,
                FCChartObj.showxaxisnames, showLabels),
            showyAxisLabels = pluckNumber(FCChartObj.showyaxislabels,
                FCChartObj.showyaxisnames, showLabels),
            text,
            i,
            rowObj,
            columnObj,
            value,
            xMax;

            //configure y axis
            yAxis.min = 0;
            yAxis.max = rowCount;

            //add axis labels
            for (i in rowIdObj) {
                rowObj = rowIdObj[i];
                value = rowObj.index;
                text = showyAxisLabels ? rowObj.label : BLANK;
                axisGridManager.addAxisGridLine(yAxis, value + POINT_FIVE,
                    text, 0.1, undefined,
                    COLOR_TRANSPARENT, 1);
                if (value < rowCount) {
                    //add lines
                    yAxis.plotBands.push({
                        isTrend : true,
                        color: hDivLineColor,
                        value: value,
                        width: hDivLineWidth,
                        dashStyle : hDivLineDash,
                        zIndex : 3
                    });
                }
            }
            //disable default labels and grid
            yAxis.labels.enabled = false;
            yAxis.gridLineWidth = INT_ZERO;
            yAxis.alternateGridColor = COLOR_TRANSPARENT;
            //add yAxisTitle
            yAxis.title.text = parseUnsafeString(FCChartObj.yaxisname);


            xAxis.min = POINT_FIVE;
            xAxis.max = xMax = columnCount + POINT_FIVE;

            // Whether to draw the xAxis labels on top or bottom.
            xAxis.opposite = pluckNumber(FCChartObj.placexaxislabelsontop, 0);

            // Add the catcount attr at x conf so that
            // space manager works perfectly
            conf.x.catCount = columnCount;
            //add axis labels
            for (i in columnIdObj) {
                columnObj = columnIdObj[i];
                value = columnObj.index;
                text = showxAxisLabels ? columnObj.label : BLANK;
                axisGridManager.addXaxisCat(xAxis, value, 1, text);
                value -= POINT_FIVE;
                if (value < xMax) {
                    //add lines
                    xAxis.plotBands.push({
                        isTrend : true,
                        color: vDivLineColor,
                        value: value,
                        width: vDivLineWidth,
                        dashStyle : vDivLineDash,
                        zIndex : 3
                    });
                }
            }
            //remove all grid related conf
            xAxis.labels.enabled = false;
            xAxis.gridLineWidth = INT_ZERO;
            xAxis.alternateGridColor = COLOR_TRANSPARENT;
            //add xAxisTitle
            xAxis.title.text = parseUnsafeString(FCChartObj.xaxisname);

        },/*
        //not required as coded inside configureAxis

        axisMinMaxSetter: function () {

        },
        */
        xAxisMinMaxSetter: function () {

        },
        placeLegendBlockRight: function () {
            var hcJSON = arguments[0],
            legendObj =  hcJSON.legend,
            type = legendObj.type;
            if (type === "gradient") {
                if (lib.placeGLegendBlockRight) {
                    //chartAPI.heatmap.placeLegendBlockRight = lib.placeGLegendBlockRight;
                    return lib.placeGLegendBlockRight.apply(this, arguments);
                }
                else {
                    return 0;
                }
            }
            else {
                return lib.placeLegendBlockRight.apply(this, arguments);
            }
        },
        placeLegendBlockBottom: function () {
            var hcJSON = arguments[0],
            legendObj =  hcJSON.legend,
            type = legendObj.type;
            if (type === "gradient") {
                if (lib.placeGLegendBlockBottom) {
                    //chartAPI.heatmap.placeLegendBlockRight = lib.placeGLegendBlockRight;
                    return lib.placeGLegendBlockBottom.apply(this, arguments);
                }
                else {
                    return 0;
                }
            }
            else {
                return lib.placeLegendBlockBottom.apply(this, arguments);
            }
        }
    }, chartAPI.column2dbase);


    /* ************************************************************************
     * Start heatMap series code                                      *
     **************************************************************************/
    // 1 - Set default options
    defaultPlotOptions.heatmap = merge(defaultPlotOptions.column, {
        states: {
            hover: {}
        }
    });


    // 3 - Create the OHLCSeries object
    seriesTypes.heatmap = Highcharts.extendClass(seriesTypes.column, {
        type: 'heatmap',
        pointClass : Highcharts.extendClass(seriesTypes.column.prototype.pointClass, {
            show : function () {
                var point = this;
                point.graphic && point.graphic.show ();
                point.dataLabel && point.dataLabel.show ();
                point.TRdataLabel && point.TRdataLabel.show ();
                point.TLdataLabel && point.TLdataLabel.show ();
                point.BRdataLabel && point.BRdataLabel.show ();
                point.BLdataLabel && point.BLdataLabel.show ();
            },
            hide: function () {
                var point = this;
                point.graphic && point.graphic.hide ();
                point.dataLabel && point.dataLabel.hide ();
                point.TRdataLabel && point.TRdataLabel.hide ();
                point.TLdataLabel && point.TLdataLabel.hide ();
                point.BRdataLabel && point.BRdataLabel.hide ();
                point.BLdataLabel && point.BLdataLabel.hide ();
            }
        }),
        animate: function(init) {
            var series = this,
            seriesGroup = series.group,
            animation = series.options.animation;

            if (!init && seriesGroup) { // run the animation
                seriesGroup.attr({
                    opacity: 0
                });
                jQuery(seriesGroup.element).animate({
                    opacity: 1
                }, animation, function () {
                    seriesGroup.attr({
                        opacity: 1
                    });
                });
                // delete this function to allow it only once
                series.animate = null;
            }
        },

        /**
        * Translate each point to the plot area coordinate system and find
        * shape positions
        */
        translate: function() {
            var series = this,
            chart = series.chart,
            options = series.options,
            borderWidth = options.borderWidth,
            xAxisOptions = chart.xAxis && chart.xAxis[0] &&
            chart.xAxis[0].options,
            yAxisOptions = chart.yAxis && chart.yAxis[0] &&
            chart.yAxis[0].options,
            plotWidth = chart.plotWidth,
            plotHeight = chart.plotHeight,
            dataHeight = plotHeight / yAxisOptions.max,
            dataWidth = plotWidth / (xAxisOptions.max + 0.5),
            halfDataWidth = dataWidth / 2,
            data = series.data;

            Series.prototype.translate.apply(series);

            // calculate the width and position of each column based on
            // the number of column series in the plot, the groupPadding
            // and the pointPadding options

            // record the new values
            each(data, function(point) {

                var barX = mathRound(point.plotX - halfDataWidth),
                barY = mathRound(point.plotY),
                barH = mathRound(point.plotY + dataHeight) - barY,
                barW = mathRound(point.plotX + halfDataWidth) - barX,
                shapeArgs;

                extend(point, {
                    barX: barX,
                    barY: barY,
                    barW: barW,
                    barH: barH
                });

                // create shape type and shape args that are reused in
                // drawPoints and drawTracker
                point.shapeType = SHAPE_RECT;
                // 1px offset added for drawing compensation
                shapeArgs = {
                    x: barX,
                    y: barY,
                    width: barW,//mathRound(pointWidth),
                    height: barH,
                    r: 0
                };

                // correct for shorting in crisp method,
                // visible in stacked columns with 1px border
                if (borderWidth % 2) {
                    shapeArgs.y -= 1;
                    shapeArgs.height += 1;
                }
                point.shapeArgs = shapeArgs;

                point.trackerArgs = {
                    x: shapeArgs.x,
                    y: shapeArgs.y,
                    width: shapeArgs.width,
                    height: shapeArgs.height,
                    r: 0
                }
            });
        },

        // drawing of the dataValues
        drawDataLabels: function () {
            if (this.options.dataLabels.enabled) {
                var series = this,
                data = series.data,
                seriesOptions = series.options,
                options = seriesOptions.dataLabels,
                dataLabelsGroup = series.dataLabelsGroup,
                chart = series.chart,
                renderer = chart.renderer,
                api = chart.options.instanceAPI,
                chartOptions = chart.options.chart,
                style = options.style,
                tlStyle = options.tlLabelStyle,
                trStyle = options.trLabelStyle,
                blStyle = options.blLabelStyle,
                brStyle = options.brLabelStyle,
                lineHeight = parseInt(style.lineHeight, 10),
                tlLineHeight = parseInt(tlStyle.lineHeight, 10),
                trLineHeight = parseInt(trStyle.lineHeight, 10),
                smartLabel = (renderer.smartLabel || api.smartLabel),
                TEXT_GUTTER_8PX = 8,
                BOTTOM_TEXT_GUTTER = 4,
                TOP_TEXT_GUTTER = 6,
                MAX_PERCENT_SPACE = 0.9,
                POINT_FIVE = 0.5,
                pointConfig,
                str,
                oriStr,
                xPos,
                yPos,
                dataLabel,
                smartTextObj;

                // create a separate group for the data labels to avoid rotation
                if (!dataLabelsGroup) {
                    dataLabelsGroup = series.dataLabelsGroup =
                    renderer.g('data-labels')
                    .attr({
                        visibility: series.visible ? VISIBLE : HIDDEN,
                        zIndex: 6
                    })
                    .translate(chart.plotLeft, chart.plotTop)
                    .add();
                    if (chart.options.chart.hasScroll) {
                        dataLabelsGroup.clip(series.clipRect);
                    }
                } else {
                    dataLabelsGroup.translate(chart.plotLeft, chart.plotTop);
                }

                each(data, function(point, i) {
                    if (point.config) {
                        var pointConfig = point.config,
                        tlLabel = pointConfig.tlLabel,
                        trLabel = pointConfig.trLabel,
                        blLabel = pointConfig.blLabel,
                        brLabel = pointConfig.brLabel,
                        dataLabel = pointConfig.dataLabel,
                        pointH = point.barH,
                        pointW = point.barW - TEXT_GUTTER_8PX,
                        isTLLabel = (defined(tlLabel) &&
                            tlLabel !== BLANK),
                        isTRLabel = (defined(trLabel) &&
                            trLabel !== BLANK),
                        isBLLabel = (defined(blLabel) &&
                            blLabel !== BLANK),
                        isBRLabel = (defined(brLabel) &&
                            brLabel !== BLANK),
                        maxWidth,
                        maxHeight;

                        // get the string
                        oriStr = options.formatter.call(point.getLabelConfig());
                        // Setting style for smartLabel
                        smartLabel.setStyle(style);
                        lineHeight = parseInt(style.lineHeight, 10),
                        // Get the displayValue text according to the
                        smartTextObj = smartLabel.getSmartText(oriStr,
                            pointW, pointH, false);
                        str = smartTextObj.text;

                        // Get the x and y position of the dataValue
                        xPos =  point.plotX;
                        yPos =  (point.plotY + (pointH * POINT_FIVE) +
                            (lineHeight * 0.75)) -
                        (smartTextObj.height * POINT_FIVE);

                        // update existing label
                        if (dataLabel) {
                            dataLabel
                            .attr({
                                text: str
                            }).animate({
                                x: xPos,
                                y: yPos
                            });
                        }
                        // create new label
                        else if (defined(str)) {
                            dataLabel = point.dataLabel = renderer.text(
                                str,
                                xPos,
                                yPos
                                )
                            .attr({
                                align: POSITION_CENTER,
                                zIndex: 1
                            })
                            .css(style)
                            .add(dataLabelsGroup);
                        }

                        maxWidth = pointW * (isTLLabel && isTRLabel ?
                            POINT_FIVE : MAX_PERCENT_SPACE);
                        maxHeight = (pointH - smartTextObj.height) * 0.5;
                        yPos = point.plotY + (parseInt(tlLineHeight, 10)
                            * 0.9);
                        yPos = (point.plotY + parseInt(tlLineHeight, 10) * 0.5)
                        + TOP_TEXT_GUTTER;

                        if (isTLLabel) {
                            // Setting style for smartLabel
                            smartLabel.setStyle(tlStyle);
                            smartTextObj = smartLabel.getSmartText(tlLabel,
                                maxWidth, maxHeight, false);
                            str = smartTextObj.text;
                            // Get the x and y position of the dataValue
                            xPos =  point.plotX - (pointW * POINT_FIVE);

                            dataLabel = point.TLdataLabel;
                            // update existing label
                            if (dataLabel) {
                                dataLabel
                                .attr({
                                    text: str
                                }).animate({
                                    x: xPos,
                                    y: yPos
                                });
                            }
                            // create new label
                            else {
                                dataLabel = point.TLdataLabel = renderer.text(
                                    str,
                                    xPos,
                                    yPos
                                    )
                                .attr({
                                    align: POSITION_LEFT,
                                    zIndex: 1
                                })
                                .css(tlStyle)
                                .add(dataLabelsGroup);
                            }
                        }

                        if (isTRLabel) {
                            yPos = (point.plotY + parseInt(trLineHeight, 10) *
                                0.5) + TOP_TEXT_GUTTER;
                            // Setting style for smartLabel
                            smartLabel.setStyle(trStyle);
                            smartTextObj = smartLabel.getSmartText(trLabel,
                                maxWidth, maxHeight, false);
                            str = smartTextObj.text;
                            // Get the x and y position of the dataValue
                            xPos =  point.plotX + (pointW * POINT_FIVE);

                            dataLabel = point.TRdataLabel;
                            // update existing label
                            if (dataLabel) {
                                dataLabel
                                .attr({
                                    text: str
                                }).animate({
                                    x: xPos,
                                    y: yPos
                                });
                            }
                            // create new label
                            else {
                                dataLabel = point.TRdataLabel = renderer.text(
                                    str,
                                    xPos,
                                    yPos
                                    )
                                .attr({
                                    align: POSITION_RIGHT,
                                    zIndex: 1
                                })
                                .css(trStyle)
                                .add(dataLabelsGroup);
                            }
                        }

                        maxWidth = pointW * (isBLLabel && isBRLabel ?
                            POINT_FIVE : MAX_PERCENT_SPACE);
                        yPos = point.plotY + pointH - BOTTOM_TEXT_GUTTER;

                        if (isBLLabel) {
                            // Setting style for smartLabel
                            smartLabel.setStyle(blStyle);
                            lineHeight = parseInt(blStyle.lineHeight, 10),
                            smartTextObj = smartLabel.getSmartText(blLabel,
                                maxWidth, maxHeight, false);
                            str = smartTextObj.text;
                            // Get the x and y position of the dataValue
                            xPos =  point.plotX - (pointW * POINT_FIVE);
                            yPos = point.plotY + pointH - smartTextObj.height +
                            (lineHeight * 0.4);

                            dataLabel = point.BLdataLabel;
                            // update existing label
                            if (dataLabel) {
                                dataLabel
                                .attr({
                                    text: str
                                }).animate({
                                    x: xPos,
                                    y: yPos
                                });
                            }
                            // create new label
                            else {
                                dataLabel = point.BLdataLabel = renderer.text(
                                    str,
                                    xPos,
                                    yPos
                                    )
                                .attr({
                                    align: POSITION_LEFT,
                                    zIndex: 1
                                })
                                .css(blStyle)
                                .add(dataLabelsGroup);
                            }
                        }

                        if (isBRLabel) {
                            // Setting style for smartLabel
                            smartLabel.setStyle(brStyle);
                            lineHeight = parseInt(brStyle.lineHeight, 10),
                            smartTextObj = smartLabel.getSmartText(brLabel,
                                maxWidth, maxHeight, false);
                            str = smartTextObj.text;
                            // Get the x and y position of the dataValue
                            xPos =  point.plotX + (pointW * POINT_FIVE);
                            yPos = point.plotY + pointH - smartTextObj.height +
                            (lineHeight * 0.4);

                            dataLabel = point.BRdataLabel;
                            // update existing label
                            if (dataLabel) {
                                dataLabel
                                .attr({
                                    text: str
                                }).animate({
                                    x: xPos,
                                    y: yPos
                                });
                            }
                            // create new label
                            else {
                                dataLabel = point.BRdataLabel = renderer.text(
                                    str,
                                    xPos,
                                    yPos
                                    )
                                .attr({
                                    align: POSITION_RIGHT,
                                    zIndex: 1
                                })
                                .css(brStyle)
                                .add(dataLabelsGroup);
                            }
                        }
                    }
                });
            }
        },
        //function to show or hide points during colorRange slider move
        setScaleRange: function(scaleStart, scaleEnd) {
            var series  = this,
            data = series.data,
            i = 0,
            ln = data.length,
            point, value;
            for (; i < ln; i += 1) {
                point = data[i];
                value = point.value;
                if (value < scaleStart || value > scaleEnd) {
                    if (!point._hidden) {
                        point._hidden = true;
                        point.hide();
                    }
                }
                else if (point._hidden) {
                    point._hidden = false;
                    point.show();
                }
            }



        /* var series  = this,
            data = series.data,
            i = 0,
            lIndex = data.length -  1,
            point,
            startIndex = series.startIndex || 0,
            endIndex = series.endIndex || lIndex,
            startVelue = series.startValue || data[startIndex].value,
            endVelue = series.endValue || data[endIndex].value;

            if (startVelue < scaleStart) {
                for (i = startIndex; i <= endIndex && (point = data[i]).value < scaleStart; i += 1) {
                    point.hide();
                }
                series.startIndex = i ? i - 1 : 0;
            }
            else if (startVelue > scaleStart) {
                for (i = startIndex; i >= 0 && (point = data[i]).value >= scaleStart; i -= 1) {
                    point.show();
                }
                series.startIndex = mathMin(i + 1, startIndex);
            }


            if (endVelue < scaleEnd) {
                for (i = endIndex; i <= lIndex && (point = data[i]).value <= scaleEnd; i += 1) {
                    point.show();
                }
                series.endIndex = i > lIndex ? lIndex : 1;
            }
            else if (endVelue > scaleEnd) {
                for (i = endIndex; i >= startIndex && (point = data[i]).value > scaleEnd; i -= 1) {
                    point.hide();
                }
                series.endIndex = mathMin(i + 1, endIndex);
            }

            series.startValue = scaleStart;
            series.endValue = scaleEnd;*/
        }
    });


    /* ************************************************************************
     * Start boxAndWhisker2D series code                                      *
     **************************************************************************/

    // 1 - Set default options
    defaultPlotOptions.boxandwhisker2d = merge(defaultPlotOptions.column, {
        states: {
            hover: {}
        }
    });

    // 3 - Create the OHLCSeries object
    var boxAndWhisker2D = Highcharts.extendClass(seriesTypes.column, {
        type: 'boxandwhisker2d',

        drawDataLabels: function () {},

        animate: function(init) {
            var series = this,
            data = series.data,
            animation = series.options.animation;
            if (!init) { // run the animation

                each(data, function(point) {
                    var graphic = point.graphic,
                    graphic1 = point.graphic1,
                    shapeArgs = point.shapeArgs,
                    shapeArgs1 = point.shapeArgs1,
                    UQGraphics = point.UQGraphics,
                    LQGraphics = point.LQGraphics,
                    UBBGraphics = point.UBBGraphics,
                    LBBGraphics = point.LBBGraphics,
                    MidGraphics = point.MidGraphics,
                    errorGraph;

                    // Upper Box animation
                    if (graphic1) {
                        UQGraphics.hide();
                        LQGraphics.hide();
                        UBBGraphics.hide();
                        LBBGraphics.hide();
                        MidGraphics.hide();
                        // start values
                        graphic1.attr({
                            height: 0,
                            y: series.yAxis.getThreshold(0)
                        });
                        // animate
                        graphic1.animate({
                            height: shapeArgs.height,
                            y: shapeArgs.y
                        }, animation);
                    }
                    // Lower Box animation
                    if (graphic) {
                        // start values
                        graphic.attr({
                            height: 0,
                            y: series.yAxis.getThreshold(0)
                        });
                        // animate
                        graphic.animate({
                            height: shapeArgs1.height,
                            y: shapeArgs1.y
                        }, animation, function () {
                            UQGraphics && UQGraphics.show();
                            LQGraphics && LQGraphics.show();
                            UBBGraphics && UBBGraphics.show();
                            LBBGraphics && LBBGraphics.show();
                            MidGraphics && MidGraphics.show();

                            errorGraph = point.errorGraph;
                            errorGraph && errorGraph[0] &&
                            errorGraph[0].show();
                            errorGraph && errorGraph[1] &&
                            errorGraph[1].show();
                        });
                    }
                });
                // delete this function to allow it only once
                series.animate = null;
            }
        },

        /**
        * Translate each point to the plot area coordinate system and find
        * shape positions
        */
        translate: function() {
            var series = this,
            chart = series.chart,
            options = series.options,
            borderWidth = options.borderWidth,
            columnCount = 0,
            reversedXAxis = series.xAxis.reversed,
            categories = series.xAxis.categories,
            columnIndex;

            Series.prototype.translate.apply(series);

            // Get the total number of column type series.
            // This is called on every series. Consider moving this logic to a
            each(chart.series, function(otherSeries) {
                if (otherSeries.type === series.type) {
                    columnIndex = columnCount++;
                    otherSeries.columnIndex = columnIndex;
                }
            });

            // calculate the width and position of each column based on
            // the number of column series in the plot, the groupPadding
            // and the pointPadding options
            var data = series.data,
            closestPoints = series.closestPoints,
            categoryWidth = mathAbs(
                data[1] ? data[closestPoints].plotX -
                data[closestPoints - 1].plotX :
                chart.plotSizeX / ((categories && categories.length) || 1)
                ),
            groupPadding = categoryWidth * options.groupPadding,
            groupWidth = categoryWidth - 2 * groupPadding,
            pointOffsetWidth = groupWidth / columnCount,
            optionPointWidth = options.pointWidth,
            pointPadding = defined(optionPointWidth) ?
            (pointOffsetWidth - optionPointWidth) / 2 :
            pointOffsetWidth * options.pointPadding,
            pointWidth = mathMax(pick(optionPointWidth, pointOffsetWidth - 2
                * pointPadding), 1);

            /**^
             * Implemente the FC point max width of 50ps feature if there
             * has grouppadding to 0.1
             */
            var maxColWidth = mathAbs(pluckNumber(options.maxColWidth, 50)) ||
            1;

            if (pointWidth > maxColWidth && options.groupPadding === 0.1) {
                groupPadding += ((pointWidth - maxColWidth) * columnCount) / 2;
                pointOffsetWidth = pointWidth = maxColWidth;
            }

            var colIndex = (reversedXAxis ? columnCount -
                series.columnIndex : series.columnIndex) || 0,
            pointXOffset = pointPadding + (groupPadding + colIndex *
                pointOffsetWidth -(categoryWidth / 2)) *
            (reversedXAxis ? -1 : 1),
            threshold = pluckNumber(options.threshold,
                mathMax(series.yAxis.options.min, 0), 0),
            translatedThreshold = series.yAxis.getThreshold(threshold),
            minPointLength = pick(options.minPointLength, 5);
            /* EOP ^*/

            // record the new values
            each(data, function(point) {

                var plotY = point.plotY,
                lowerQuartile = point.lowerQuartile || {},
                median = point.median || {},
                yBottom = pluckNumber(series.yAxis.translate(
                    lowerQuartile.value, 0, 1),
                point.yBottom, translatedThreshold),
                medianY = pluckNumber(series.yAxis.translate(
                    median.value, 0, 1),
                point.yBottom, translatedThreshold),
                barX = point.plotX + pointXOffset,
                barY = mathCeil(mathMin(plotY, yBottom)),
                barH = mathCeil(mathMax(plotY, medianY) - barY),
                barY1 = mathCeil(mathMin(yBottom, medianY)),
                barH1 = mathCeil(mathMax(yBottom, medianY) - barY1),
                trackerY,
                shapeArgs,
                shapeArgs1;

                // handle options.minPointLength and tracker for small points
                if (mathAbs(barH) < minPointLength) {
                    if (minPointLength) {
                        barH = minPointLength;
                        barY =
                        mathAbs(barY - translatedThreshold) > minPointLength ?
                        yBottom - minPointLength : // keep position
                        translatedThreshold - (plotY <= translatedThreshold ?
                            minPointLength : 0);
                    }
                    trackerY = barY - 3;
                }

                extend(point, {
                    barX: barX,
                    barY: barY,
                    barW: pointWidth,
                    barH: barH,
                    medianY: medianY
                });

                // create shape type and shape args that are reused in
                // drawPoints and drawTracker
                point.shapeType = SHAPE_RECT;
                /**
                 * 1px offset added for drawing compensation
                 */
                shapeArgs = {
                    x: mathRound(barX),
                    y: mathRound(barY),
                    width: mathRound(pointWidth),
                    height: mathRound(barH),
                    r: options.borderRadius
                };

                // shapeArgs1 helps to draw the lowerBox
                shapeArgs1 = extend2({}, shapeArgs);
                shapeArgs1.y = mathRound(barY1);
                shapeArgs1.height = mathRound(barH1);

                /* EOP ^*/
                // correct for shorting in crisp method,
                // visible in stacked columns with 1px border
                if (borderWidth % 2) {
                    shapeArgs.y -= 1;
                    shapeArgs.height += 1;
                    shapeArgs1.y -= 1;
                    shapeArgs1.height += 1;
                }
                point.shapeArgs = shapeArgs;
                point.shapeArgs1 = shapeArgs1;

                point.trackerArgs = {
                    x: shapeArgs.x,
                    y: shapeArgs.y,
                    width: shapeArgs.width,
                    height: shapeArgs.height + shapeArgs1.height,
                    r: 0
                }
            });
        },

        drawPoints: function() {
            var series = this,
            options = series.options,
            chart = series.chart,
            renderer = chart.renderer,
            seriesGroup = series.group,
            shadowGroup = series.shadowGroup,
            yaxis = series.yAxis,
            reversedYaxisColorChange =
            (yaxis.reversed && yaxis.options.min < 0)? true : false,
            isVMLRenderer = renderer.box.nodeName.toLowerCase() === 'div' ?
            true : false,
            inverted = series.inverted,
            dataLabelsGroup = series.dataLabelsGroup,
            dataLabelsOptions = options.dataLabels,
            style = dataLabelsOptions.style,
            lineHeight = parseInt(style.lineHeight, 10),
            lineHeightErr = lineHeight * 0.37,
            chartOptions = chart.options.chart,
            TEXT_GUTTER = 3,
            valuePadding = chartOptions.valuePadding + TEXT_GUTTER,
            rotateValues = (chartOptions.rotateValues == 1) ? 270 :
            undefined,
            textAlign = POSITION_CENTER,
            trackerLabel = +new Date(),
            tracker,
            rel,
            r,
            x,
            y,
            y1,
            height,
            height1,
            width,
            strokeWidth,
            graphic,
            shapeArgs,
            graphic1,
            shapeArgs1,
            attribute,
            UBBPath,
            LBBPath,
            UQPath,
            LQPath,
            MidPath,
            UBBGraphics,
            LBBGraphics,
            UQGraphics,
            LQGraphics,
            MidGraphics;

            // Create the shadow group
            if (!shadowGroup && options.shadow) {
                shadowGroup = series.shadowGroup = renderer.g('shadow')
                .add(seriesGroup);
                shadowGroup.floated = true;
            }

            // create a separate group for the data labels to avoid rotation
            if (!dataLabelsGroup) {
                dataLabelsGroup = series.dataLabelsGroup =
                renderer.g('data-labels')
                .attr({
                    visibility: series.visible ? VISIBLE : HIDDEN,
                    zIndex: 6
                })
                .translate(chart.plotLeft, chart.plotTop)
                .add();
                //clip for scroll
                if (chart.options.chart.hasScroll) {
                    dataLabelsGroup.clip(series.clipRect);
                }
            } else {
                dataLabelsGroup.translate(chart.plotLeft, chart.plotTop);
            }

            // draw the columns
            each(series.data, function(point) {
                var plotY = point.plotY,
                upperQuartile = point.upperQuartile,
                lowerQuartile = point.lowerQuartile,
                upperBoxBorder = point.upperBoxBorder,
                lowerBoxBorder = point.lowerBoxBorder,
                median = point.median;
                if (plotY !== UNDEFINED && !isNaN(plotY) && point.y !== null) {

                    // Drawing for boxAndWhisker chart
                    shapeArgs = point.shapeArgs;
                    y = shapeArgs.y;
                    width = shapeArgs.width;
                    height = shapeArgs.height;
                    r = shapeArgs.r;
                    x = shapeArgs.x;
                    // boxAndWhisker column does not have its border
                    strokeWidth = 0;
                    //handle the color issue in VML for Bar
                    if (isVMLRenderer && inverted && point.color &&
                        point.color.FCcolor) {
                        point.color.FCcolor.angle += 90;
                    }
                    attribute = point.pointAttr[point.selected ?
                    SELECT_STATE : NORMAL_STATE];

                    // Upper box
                    graphic1 = point.graphic1;
                    if (graphic1) { // update
                        stop(graphic1);
                        graphic1.animate(shapeArgs);
                    } else {
                        // UppderBox drawing
                        point.graphic1 = renderer[point.shapeType](x, y,
                            width, height, r, strokeWidth)
                        .attr(attribute)
                        .add(seriesGroup)
                        .shadow(options.shadow, shadowGroup, point.shadow);
                    }

                    // Lower box
                    graphic = point.graphic;
                    shapeArgs1 = point.shapeArgs1;
                    height1 = shapeArgs1.height;
                    y1 = shapeArgs1.y;
                    if (graphic) {
                        stop(graphic);
                        graphic.animate(shapeArgs1);
                    }
                    else {
                        // LowerBox drawing
                        attribute.fill = point.options.lowerboxColor;
                        point.graphic = renderer[point.shapeType](x, y1,
                            width, height1, r, strokeWidth)
                        .attr(attribute)
                        .add(seriesGroup)
                        .shadow(options.shadow, shadowGroup, point.shadow);
                    }

                    UBBGraphics = point.UBBGraphics;
                    LBBGraphics = point.LBBGraphics;
                    UQGraphics = point.UQBGraphics;
                    LQGraphics = point.LQBGraphics;
                    MidGraphics = point.MidGraphics;

                    // upperBoxBorder
                    UBBPath = renderer.crispLine([M, x, y, L, x, y +
                        height, M, x + width, y, L, x + width, y + height],
                        upperBoxBorder.borderWidth);
                    if (UBBGraphics) {
                        stop(UBBGraphics);
                        UBBGraphics.animate({
                            d: UBBPath
                        });
                    }
                    else {
                        point.UBBGraphics = renderer.path(UBBPath)
                        .attr({
                            stroke: upperBoxBorder.color,
                            'stroke-width': upperBoxBorder.borderWidth,
                            'stroke-linecap': ROUND,
                            dashstyle: upperBoxBorder.dashStyle
                        })
                        .add(seriesGroup);
                    }

                    // lowerBoxBorder
                    LBBPath = renderer.crispLine([M, x, y1, L, x, y1
                        + height1, M, x + width, y1, L, x + width, y1 +
                        height1], lowerBoxBorder.borderWidth);
                    if (LBBGraphics) {
                        stop(LBBGraphics);
                        LBBGraphics.animate({
                            d: LBBPath
                        });
                    }
                    else {
                        point.LBBGraphics = renderer.path(LBBPath)
                        .attr({
                            stroke: lowerBoxBorder.color,
                            'stroke-width': lowerBoxBorder.borderWidth,
                            'stroke-linecap': ROUND,
                            dashstyle: lowerBoxBorder.dashStyle
                        })
                        .add(seriesGroup);
                    }

                    // Drawing of upper and lower quartiles
                    // upperQuartile
                    point.UQPath = UQPath = renderer.crispLine([M, x, y, L, x +
                        width, y], upperQuartile.borderWidth);
                    if (UQGraphics) {
                        stop(UQGraphics);
                        UQGraphics.animate({
                            d: UQPath
                        });
                    }
                    else {
                        point.UQGraphics = renderer.path(UQPath)
                        .attr({
                            stroke: upperQuartile.color,
                            'stroke-width': upperQuartile.borderWidth,
                            'stroke-linecap': ROUND,
                            dashstyle: upperQuartile.dashStyle
                        })
                        .add(seriesGroup);
                    }

                    // Median
                    MidPath = renderer.crispLine([M, x, y1, L,
                        x + width, y1], median.borderWidth);
                    if (MidGraphics) {
                        stop(MidGraphics);
                        MidGraphics.animate({
                            d: MidPath
                        });
                    }
                    else {
                        point.MidGraphics = renderer.path(MidPath)
                        .attr({
                            stroke: median.color,
                            'stroke-width': median.borderWidth,
                            'stroke-linecap': ROUND,
                            dashstyle: median.dashStyle
                        })
                        .add(seriesGroup);
                    }

                    // lowerQuartile
                    LQPath = renderer.crispLine([M, x, y1 + height1,
                        L, x + width, y1 + height1],
                        lowerQuartile.borderWidth);
                    if (LQGraphics) {
                        stop(LQGraphics);
                        LQGraphics.animate({
                            d: LQPath
                        });
                    }
                    else {
                        point.LQGraphics = renderer.path(LQPath)
                        .attr({
                            stroke: lowerQuartile.color,
                            'stroke-width': lowerQuartile.borderWidth,
                            'stroke-linecap': ROUND,
                            dashstyle: lowerQuartile.dashStyle
                        })
                        .add(seriesGroup);
                    }

                    textAlign = rotateValues ? POSITION_LEFT :
                    POSITION_CENTER;
                    // Draw the medianValue
                    if (defined(median.displayValue) &&
                            median.displayValue != BLANK) {
                        renderer.text(
                            median.displayValue,
                            x + (width * 0.5) +
                            (rotateValues ? lineHeightErr : 0),
                            y1 - valuePadding
                            )
                        .attr({
                            align: textAlign,
                            rotation: rotateValues
                        })
                        .css(style)
                        .add(dataLabelsGroup);
                    }
                    // Draw the upperQuartile value
                    if (defined(upperQuartile.displayValue) &&
                            upperQuartile.displayValue != BLANK) {
                        renderer.text(
                            upperQuartile.displayValue,
                            x + (width * 0.5) +
                            (rotateValues ? lineHeightErr : 0),
                            y - valuePadding
                            )
                        .attr({
                            align: textAlign,
                            rotation: rotateValues
                        })
                        .css(style)
                        .add(dataLabelsGroup);
                    }
                    // Draw the lowerQuartile value
                    if (defined(lowerQuartile.displayValue) &&
                            lowerQuartile.displayValue != BLANK) {
                        textAlign = rotateValues ? POSITION_RIGHT :
                        POSITION_CENTER;
                        renderer.text(
                            lowerQuartile.displayValue,
                            x + (width * 0.5) +
                            (rotateValues ? lineHeightErr : 0),
                            y1 + height1 + valuePadding + (rotateValues ? 0
                                : lineHeightErr)
                            )
                        .attr({
                            align: textAlign,
                            rotation: rotateValues
                        })
                        .css(style)
                        .add(dataLabelsGroup);
                    }
                }
            });
        }
    });
    // 4 - add the constractor
    seriesTypes.boxandwhisker2d = boxAndWhisker2D;


    /* ************************************************************************
     * Start Kagi series code                                                 *
     **************************************************************************/

    // 1 - Set default options
    defaultPlotOptions.kagi = merge(defaultPlotOptions.line, {
        states: {
            hover: {}
        }
    });

    // 3 - Create the Kagi series object
    seriesTypes.kagi = Highcharts.extendClass(seriesTypes.line, {
        type: 'kagi',

        translate: function () {
            var isRally,
            series = this,
            yAxis = series.yAxis,
            xAxis = series.xAxis,
            data = series.data,
            len = data.length,
            xValue = 0,
            index,
            plotX = xAxis.translate(xValue),
            lastHigh,
            lastLow,
            isRallyInitialised,
            pointConfig,
            lastPoint,
            point,
            yValue;

            // Now, store the positions of the plots.
            for (index = 0; index < len; index += 1) {
                point = data[index];
                yValue = point.y;

                if (!point.isDefined) {
                    yValue = point.plotValue;
                }

                // Getting appropiate value for the current plot point.
                yValue = pluck(point.plotValue, yValue);

                // Set the y position.
                point.plotY = yAxis.translate(point.y, 0, 1, 0, 1);

                // Store value textbox y position.
                point.graphY = yAxis.translate(yValue, 0, 1, 0, 1);

                // Abscissa of the point on the kagi line.
                point.plotX = plotX;

                // If there is a horizontal shift, then abscissa of the kagi
                // line and as such all points on it shifts to the right by a
                // slab more.
                if (point.isShift) {
                    xValue += 1;
                    plotX = xAxis.translate(xValue);
                }

                if (index) {
                    pointConfig = point.config;
                    lastPoint = data[index - 1];

                    // Getting the previously bundled up properties in local
                    // variables.
                    isRally = pointConfig.objParams.isRally;
                    lastHigh = pointConfig.objParams.lastHigh;
                    lastLow = pointConfig.objParams.lastLow;
                    isRallyInitialised = pointConfig.objParams.isRallyInitialised;

                    // To find if there is a change in trend towards the current
                    // plot.
                    if (lastPoint && isRallyInitialised &&
                        lastPoint.config.isRally != pointConfig.isRally) {

                        // Setting in this.data for the plot, to be used for.
                        // Setting the color/thickness the graph segments.
                        pointConfig.isChanged = true;

                        // To get the pixel position of the transtion point and
                        // storing in data point for the plot.
                        pointConfig.ty = yAxis.translate((isRally ?
                            lastHigh : lastLow), 0, 1, 0, 1);
                    }
                    else {
                        // Setting in this.data for the plot.
                        pointConfig.isChanged = false;
                    }
                }
            } // end loop
        },


        /**
         * Draw the markers
         */
        drawPoints: function() {
            var series = this,
            data = series.data,
            chart = series.chart,
            options = series.options,
            trackerLabel = +new Date(),

            cursor = options.cursor,
            css = cursor && {
                cursor: cursor
            } || {},
            pointAttr,
            attributes,
            plotX,
            plotY,
            i,
            point,
            marker,
            markerEnabled,
            radius,
            angle,
            graphic,
            rel;

            if (true) {
                i = data.length;
                while (i--) {
                    point = data[i];
                    plotX = point.plotX;
                    plotY = point.plotY;
                    graphic = point.graphic;
                    marker = point.marker;
                    markerEnabled = marker.enabled;

                    // only draw the point if y is defined
                    if (plotY !== UNDEFINED && !isNaN(plotY) && point.isDefined) {
                        // shortcuts
                        pointAttr = point.pointAttr[point.selected ?
                        SELECT_STATE : NORMAL_STATE];
                        radius = pointAttr.r;
                        angle = (marker && marker.startAngle || 90) * deg2rad;
                        pointAttr.isTracker = true;

                        // Set the hand cursor when point has a defined link
                        // value.
                        if (point.link !== undefined) {
                            css.cursor  = 'pointer';
                            css._cursor = 'hand';
                        }
                        // Restore default cursor when there is no link.
                        else {
                            css.cursor = css._cursor = 'default';
                        }

                        if (graphic) { // update
                            graphic.animate({
                                x: plotX,
                                y: plotY,
                                r: radius
                            });
                        }
                        else {
                            attributes = pointAttr || {};
                            // IF anchors are disabled, we draw tracker element
                            // of radius 3px and color as transparent to be use
                            // as a tracker to show tooltip and other events
                            // if any
                            if (!markerEnabled) {
                                attributes = extend(attributes, {
                                    fill: TRACKER_FILL,
                                    stroke: TRACKER_FILL,
                                    r: 3 // minimum 3px for tracker.
                                });
                            }

                            graphic = point.graphic = chart.renderer.symbol(
                                pick(point.marker && point.marker.symbol,
                                    series.symbol),
                                plotX,
                                plotY,
                                radius, {
                                    startAngle: angle
                                })
                            .on(hasTouch ? 'touchstart' : 'mouseover', function(event) {
                                var element = (event.currentTarget ?
                                    event.currentTarget : event.srcElement),
                                point,
                                series;
                                if (!(point = element.point)) {
                                    return;
                                }
                                series = point.series;
                                rel = event.relatedTarget || event.fromElement;
                                if (chart.hoverSeries !== series &&
                                    attr(rel, 'isTracker') !== trackerLabel) {
                                    series.onMouseOver();
                                }
                                point.onMouseOver();

                            })
                            .on('mouseout', function(event) {
                                var element = (event.currentTarget) ?
                                event.currentTarget : event.srcElement,
                                series = element.point && element.point.series;
                                if (series && !series.options.stickyTracking) {
                                    rel = event.relatedTarget || event.toElement;
                                    if (attr(rel, 'isTracker') !== trackerLabel) {
                                        series.onMouseOut();
                                    }
                                }
                            })
                            .attr(attributes)
                            .css(css)
                            .add(series.group);

                            point.graphic.element.point = point;
                        }
                    }
                }
            }
        },

        // Since the markers
        drawTracker: function () { },

        // Drawing the actual graph
        drawGraph: function() {
            var graphPath = [],
            singlePoints = [], // used in drawTracker
            newSegmentPath = [],
            attrib = [],
            pointShadowArr = [],
            series = this,
            options = series.options,
            chart = series.chart,
            group = series.group,
            lineWidth = options.lineWidth,
            canvasPadding =  options.canvasPadding,
            renderer = chart.renderer,
            shadowGroup = series.shadowGroup,
            xShiftLength = options.xShiftLength,
            data = series.segments[0],
            getColor = {
                'true': convertColor(options.rallyColor, options.rallyAlpha),
                'false': convertColor(options.declineColor, options.declineAlpha)
            },
            getAlpha = {
                'true': options.rallyAlpha,
                'false': options.declineAlpha
            },
            getThickness = {
                'true': options.rallyThickness,
                'false': options.declineThickness
            },
            getDashStyleObj = options.getDashStyleObj,
            // Object containing true|false default value of rally or
            // decline dashed.
            lineDashed = options.lineDashed,
            dashStyle,
            lineColor,
            lineThickness,
            nextPoint,
            path,
            plotX,
            plotY,
            point,
            graphLineArr,
            graphLine,
            isRally,
            nextPointIsRally;

            // Put all shadows inside a group to avoid them to get sandwiched
            // between overlapping plot segments.
            if (!shadowGroup && options.shadow) {
                shadowGroup = series.shadowGroup = renderer.g('shadow')
                .add(group);
                shadowGroup.floated = true;
            }
            if (!data) {
                return;
            }
            plotX = canvasPadding + xShiftLength / 2;
            plotY = data[0].plotY;
            isRally = !!data[0].isRally;
            //setting line cosmetics for chart initialisation
            lineColor = getColor[isRally];
            lineThickness = getThickness[isRally];
            //drawing starts with an initial half horizontal-shift
            newSegmentPath.push([M, canvasPadding, plotY, L, plotX, plotY]);
            pointShadowArr.push({
                opacity: getAlpha[isRally] / 100
            });
            attrib.push({
                stroke: lineColor,
                'stroke-width': lineThickness,
                'stroke-linecap': ROUND
            });

            // divide into segments and build graph and area paths
            each(series.segments, function(segment) {
                // build the segment line
                //looping to draw the plots
                each(segment, function(point, i) {
                    nextPoint = segment[i + 1];
                    if (nextPoint) {
                        path = [M, plotX, plotY];
                        isRally = point.isRally;
                        //if there is a shift corresponding to this point
                        if (point.isShift) {
                            //getting line cosmetics
                            lineColor = getColor[isRally];
                            lineThickness = getThickness[isRally];
                            dashStyle = pluckNumber(nextPoint.config.dashStyle,
                                lineDashed[isRally]) && getDashStyleObj[isRally];
                            plotX += xShiftLength;
                            plotY = point.graphY;

                            //if line to be drawn need to be dashed
                            path.push(L, plotX, plotY);
                            newSegmentPath.push(path);
                            path = [M, plotX, plotY];
                            pointShadowArr.push({
                                opacity: getAlpha[isRally] / 100
                            });

                            attrib.push({
                                stroke: lineColor,
                                'stroke-width': lineThickness,
                                'stroke-linecap': ROUND,
                                dashstyle: dashStyle
                            });
                        }
                        //if there is a change in trend between the current and
                        //the next points
                        if (nextPoint.config.isChanged) {
                            //getting line cosmetics
                            lineColor = getColor[isRally];
                            lineThickness = getThickness[isRally];
                            plotY = nextPoint.config.ty;
                            dashStyle = pluckNumber(nextPoint.config.dashStyle,
                                lineDashed[isRally]) && getDashStyleObj[isRally];

                            path.push(L, plotX, plotY);
                            newSegmentPath.push(path);
                            path = [M, plotX, plotY];
                            pointShadowArr.push({
                                opacity: getAlpha[isRally] / 100
                            });
                            attrib.push({
                                stroke: lineColor,
                                'stroke-width': lineThickness,
                                'stroke-linecap': ROUND,
                                dashstyle: dashStyle
                            });
                        }

                        nextPointIsRally = nextPoint.isRally;
                        //getting line cosmetics
                        lineColor = getColor[nextPointIsRally];
                        lineThickness = getThickness[nextPointIsRally];
                        dashStyle = pluckNumber(nextPoint.config.dashStyle,
                            lineDashed[nextPointIsRally])
                        && getDashStyleObj[nextPointIsRally];

                        path.push(L, plotX, nextPoint.graphY);
                        //updating value
                        plotY = nextPoint.graphY;
                        newSegmentPath.push(path);
                        pointShadowArr.push({
                            opacity: getAlpha[nextPointIsRally] / 100
                        });
                        attrib.push({
                            stroke: lineColor,
                            'stroke-width': lineThickness,
                            'stroke-linecap': ROUND,
                            dashstyle: dashStyle
                        });
                    }
                });
            });

            // used in drawTracker:
            series.graphPath = graphPath;
            series.singlePoints = singlePoints;

            // Draw the line pointwise
            if (!series.graphLine) {
                series.graphLine = [];
            }

            // Now draw the Actual Graph
            each(newSegmentPath, function (path, i) {
                graphLineArr = series.graphLine;
                graphLine = graphLineArr[i];
                // draw the graph
                if (graphLine) {
                    graphLine.animate({
                        d: path
                    });
                } else {
                    if (lineWidth) {
                        path = renderer.crispLine(path, attrib[i]['stroke-width'] || 2);
                        graphLineArr[i] = renderer.path(path)
                        .attr(attrib[i]).add(group)
                        .shadow(options.shadow, shadowGroup, pointShadowArr[i]);
                    }
                }
            });
        },

        // drawing of the dataValues
        drawDataLabels: function () {
            if (this.options.dataLabels.enabled) {
                var series = this,
                data = series.data,
                seriesOptions = series.options,
                options = seriesOptions.dataLabels,
                dataLabelsGroup = series.dataLabelsGroup,
                chart = series.chart,
                renderer = chart.renderer,
                chartOptions = chart.options.chart,
                style = options.style,
                lineHeight = parseInt(style.lineHeight, 10),
                smartLabel = renderer.smartLabel,
                TEXT_GUTTER = 3,
                valuePadding = chartOptions.valuePadding + TEXT_GUTTER,
                rotateValues = chartOptions.rotateValues,
                canvasHeight = chart.plotHeight,
                placeLabelAtCenter,
                radius,
                plotY,
                plotX,
                str,
                oriStr,
                xPos,
                yPos,
                align,
                vAlign,
                dataLabel,
                smartTextObj,
                rotation;

                // Setting style for smartLabel
                smartLabel.setStyle(options.style);

                // create a separate group for the data labels to avoid rotation
                if (!dataLabelsGroup) {
                    dataLabelsGroup = series.dataLabelsGroup =
                    renderer.g('data-labels')
                    .attr({
                        visibility: series.visible ? VISIBLE : HIDDEN,
                        zIndex: 6
                    })
                    .translate(chart.plotLeft, chart.plotTop)
                    .add();
                    if (chart.options.chart.hasScroll) {
                        dataLabelsGroup.clip(series.clipRect);
                    }
                } else {
                    dataLabelsGroup.translate(chart.plotLeft, chart.plotTop);
                }

                // Setting style for smartLabel
                //smartLabel.setStyle(style);

                each(data, function(point, i) {
                    if (point.config.isDefined) {
                        xPos = plotX = point.plotX;
                        yPos = plotY = point.plotY;
                        align = getFirstValue(point.config.align,
                            POSITION_CENTER);
                        vAlign = getFirstValue(point.config.vAlign,
                            POSITION_TOP);
                        radius = point.marker.radius;
                        // get the string
                        if ((oriStr = options.formatter.call
                            (point.getLabelConfig())) === BLANK) {
                            return;
                        }
                        // Get the displayValue text according to the
                        // canvas width.
                        smartTextObj = smartLabel.getOriSize(oriStr,
                            undefined, undefined, false);
                        str = smartTextObj.text;

                        // When the labels are in rotated mode
                        if (rotateValues) {
                            //Get the y position based on next data's position
                            placeLabelAtCenter = true;
                            if (vAlign == POSITION_TOP) {
                                yPos -= valuePadding;
                                xPos += lineHeight * 0.31;
                                align = POSITION_LEFT;
                                // If label goes out of canvas on top
                                // we place the label at center
                                placeLabelAtCenter = yPos < smartTextObj.width;
                            }
                            else if (vAlign == POSITION_BOTTOM) {
                                yPos += valuePadding;
                                xPos += lineHeight * 0.31;
                                align = POSITION_RIGHT;
                                // If label goes out of canvas at bottom
                                // we place the label at center
                                placeLabelAtCenter = yPos + smartTextObj.width >
                                canvasHeight;
                            }
                            // Place the label at center
                            if (placeLabelAtCenter) {
                                xPos = plotX - (radius / 2 + TEXT_GUTTER);
                                yPos = plotY;
                                align = 'center';
                            }
                        }
                        // When the labels are in non rotated mode
                        else {
                            //Get the y position based on next data's position
                            if (vAlign == POSITION_TOP) {
                                yPos -= valuePadding;
                                if (lineHeight >= yPos) {
                                    yPos = plotY + valuePadding +
                                    (lineHeight * 0.74);
                                }
                            }
                            else if (vAlign == POSITION_BOTTOM) {
                                yPos += + valuePadding + (lineHeight * 0.74);
                                if (canvasHeight <= yPos + TEXT_GUTTER) {
                                    yPos = plotY - valuePadding;
                                }
                            }
                            else {
                                // It the value goes out-side of canvas at
                                // left-hand side
                                if (smartTextObj.width > xPos) {
                                    align = 'center';
                                    yPos -= valuePadding;
                                }
                                else {
                                    xPos -= radius / 2 +
                                    TEXT_GUTTER;
                                    yPos += lineHeight * 0.37;
                                }
                            }
                        }

                        //Now, if the labels are to be rotated
                        rotation = (rotateValues == 1) ?
                        270 : undefined;


                        dataLabel = point.dataLabel;

                        // update existing label
                        if (dataLabel) {
                            dataLabel
                            .attr({
                                text: str
                            }).animate({
                                x: xPos,
                                y: yPos
                            });
                        // create new label
                        } else if (defined(str)) {
                            dataLabel = point.dataLabel = renderer.text(
                                str,
                                xPos,
                                yPos
                                )
                            .attr({
                                align: align,
                                rotation: rotation,
                                zIndex: 1
                            })
                            .css(options.style)
                            .add(dataLabelsGroup);
                        }
                    }
                });
            }
        }
    });

/* ****************************************************************************
 * START OF HTML Renderer Code                                                *
 *****************************************************************************/
    Highcharts[isVML ? 'VMLRenderer' : 'SVGRenderer'].prototype.html = (function () {
        var ArrayProtoUnshift = Array.prototype.unshift,
            styleAttrMap = {
                'cursor': 'cursor'
            },
            styleAttrNumericMap = {
                x: 'left',
                y: 'top',
                strokeWidth: 'borderThickness',
                'stroke-width': 'borderThickness',
                width: 'width',
                height: 'height'
            },
            styleAttrColorMap = {
                fill: 'backgroundColor',
                stroke: 'borderColor',
                color: 'color'
            },
            defaultElementStyle = {
                left: 0,
                top: 0,
                padding: 0,
                border: NONE,
                margin: 0,
                outline: NONE,
                '-webkit-apperance': NONE,
                position: ABSOLUTE,
                zIndex: 20
            },

            HTMLElement = function (node, group, attrs) {
                var wrapper = this,
                    element;

                if (group && group instanceof HTMLElement) {
                    group = group.element;
                }
                element = wrapper.element = createElement(node, attrs,
                    defaultElementStyle, group);
                wrapper.jqe = jQuery(element);
                attr(element, 'isOverlay', true);
                wrapper.nodeName = node.toLowerCase();
                wrapper.added = Boolean(group);
            };

        extend(HTMLElement.prototype, {
            attr: function (hash) {

                var wrapper = this,
                    element = wrapper.element,
                    jqe = wrapper.jqe,
                    restore = {},
                    key,
                    value,
                    skipAttr,
                    state;

                // getter
                if (typeof hash !== 'object') {
                    return wrapper[hash] || attr(element, hash);
                }

                // super-setter
                for (key in hash) {
                    value = hash[key];
                    if (styleAttrMap[key]) {
                        switch (key) {
                            case 'cursor':
                                if (value === 'pointer' && isVML) {
                                    value = 'hand';
                                }
                                break;
                        }
                        element.style[styleAttrMap[key]] = value;
                        skipAttr = true;
                    }
                    else if (styleAttrNumericMap[key]) {
                        element.style[styleAttrNumericMap[key]] = value + PX;
                        skipAttr = true;
                    }
                    else if (styleAttrColorMap[key]) {
                        element.style[styleAttrColorMap[key]] = hashify(value);
                        skipAttr = true;
                    }
                    else if (/^visibility$/i.test(key)) {
                        state = (value === 'hidden');
                        jqe[state ? 'hide' : 'show']();
                        wrapper.hidden = state;
                        skipAttr = true;
                    }
                    else if (/^opacity$/i.test(key)) {
                        css(element, {
                            opacity: value
                        });
                        skipAttr = true;
                    }
                    else if (/^innerhtml$/i.test(key)) {
                        jqe.html(value || BLANK);
                        skipAttr = true;
                    }
                    else if (/^text$/i.test(key)) {
                        jqe.text(value || BLANK);
                        skipAttr = true;
                    }
                    else if (/^type$/i.test(key) && isIE && wrapper.added) { // not in ie
                        skipAttr = true;
                    }


                    if (skipAttr) {
                        restore[key] = value;
                        delete hash[key];
                        skipAttr = false;
                    }
                }

                attr(element, hash);

                for (key in restore) {
                    wrapper[key] = hash[key] = restore[key];
                    delete restore[key];
                }
                return this;
            },

            val: function (set) {
                var wrapper = this,
                    jqe = wrapper.jqe,
                    getter = (set === undefined);

                if (wrapper.nodeName === 'input' && jqe.attr('type') ===
                        'checkbox') {
                    return getter ? (wrapper.checked() ? 1 : 0) :
                            wrapper.checked(set);
                }

                return getter ? jqe.val() : (jqe.val(set), wrapper);
            },

            checked: function (set) {
                var wrapper = this,
                    jqe = this.jqe;
                return (set === undefined) ? wrapper.element.checked : ((set ?
                        jqe.attr('checked', 'checked') :
                        jqe.removeAttr('checked')), wrapper);
            },

            css: function () {
                var wrapper = this,
                    element = wrapper.element;

                ArrayProtoUnshift.call(arguments, element);
                css.apply(window, arguments);
                return wrapper;
            },

            translate: function (x, y) {
                var wrapper = this,
                    element = wrapper.element;

                if (x !== undefined) {
                    element.style.left = x + PX;
                }
                if (y !== undefined) {
                    element.style.top = y + PX;
                }

                return wrapper;
            },

            add: function (group, prepend) {
                var wrapper = this,
                    element = this.element,
                    parent = group.element;

                if (prepend) {
                    parent.insertBefore(element, parent.firstChild);
                }
                else {
                    parent.appendChild(element);
                }

                wrapper.added = true;
                return wrapper;
            },

            hide: function () {
                return this.jqe.hide();
            },

            show: function () {
                return this.jqe.show();
            },

            destroy: function () {
                var wrapper = this,
                    element = wrapper.element || {};

                // remove events
                element.onclick = element.onmouseout = element.onmouseover =
                        element.onmousemove = element.onblur =
                        element.onfocus = null;

                // remove from dom
                element = discardElement(element);
                delete wrapper.element;
                delete wrapper.jqe;
                return null;
            },

            on: Highcharts[isVML ? 'VMLElement' : 'SVGElement'].prototype.on,

            bind: function () {
                var wrapper = this,
                    jqe = this.jqe;
                jqe.bind.apply(jqe, arguments);
                return wrapper;
            }
        });

        return function (node, attrs, css, group) {
            var rootAttr = {},
                wrapper,
                prop;

            // type cannot be updated post addition
            if (attrs && ('type' in attrs)) {
                rootAttr.type = attrs.type;
                delete attrs.type
            }

            wrapper =  new HTMLElement(node, group, rootAttr)
                .css(css).attr(attrs);

            for (prop in rootAttr) {
                attrs[prop] = rootAttr[prop];
            }

            return wrapper;
        };
    }());

}, [3, 2, 1, 'release']]);
