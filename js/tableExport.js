/*!
 * TableExport.js v3.2.0 (http://www.clarketravis.com)
 * Copyright 2015 Travis Clarke
 * Licensed under the MIT license
 */

; (function (window, undefined) {

    /*--- GLOBALS ---*/
    var $ = window.jQuery;

    $.fn.tableExport = function (options) {

        var settings = $.extend({}, $.fn.tableExport.defaults, options),
            rowD = $.fn.tableExport.rowDel,
            ignoreRows = settings.ignoreRows instanceof Array ? settings.ignoreRows : [settings.ignoreRows],
            ignoreCols = settings.ignoreCols instanceof Array ? settings.ignoreCols : [settings.ignoreCols],
            bootstrapClass, bootstrapTheme, bootstrapSpacing;

        if (settings.bootstrap) {
            bootstrapClass = $.fn.tableExport.bootstrap[0] + " ";
            bootstrapTheme = $.fn.tableExport.bootstrap[1] + " ";
            bootstrapSpacing = $.fn.tableExport.bootstrap[2] + " ";
        } else {
            bootstrapClass = $.fn.tableExport.defaultButton + " ";
            bootstrapTheme = bootstrapSpacing = "";
        }

        this.each(function () {
            var $el = $(this),
                $rows = $el.find('tbody').find('tr'),
                $rows = settings.headings ? $rows.add($el.find('thead>tr')) : $rows,
                $rows = settings.footers ? $rows.add($el.find('tfoor>tr')) : $rows,
                thAdj = settings.headings ? $el.find('thead>tr').length : 0,
                fileName = settings.fileName === "id" ? ($el.attr('id') ? $el.attr('id') : $.fn.tableExport.defaultFileName) : settings.fileName,
                exporters = {
                    xlsx: function (rDel, name) {
                        var dataURL = $rows.map(function (i, val) {
                            if (!!~ignoreRows.indexOf(i - thAdj)) { return; }
                            var $cols = $(val).find('th, td');
                            return [$cols.map(function (i, val) {
                                if (!!~ignoreCols.indexOf(i)) { return; }
                                return $(val).text();
                            }).get()];
                        }).get(),
                            dataObject = escapeHtml(
                                JSON.stringify({
                                    data: dataURL,
                                    fileName: name,
                                    mimeType: $.fn.tableExport.xlsx.mimeType,
                                    fileExtension: $.fn.tableExport.xlsx.fileExtension
                                }))
                        createObjButton(dataObject);
                    },
                    xls: function (rdel, name) {
                        var colD = $.fn.tableExport.xls.separator,
                            dataURL = $rows.map(function (i, val) {
                                if (!!~ignoreRows.indexOf(i - thAdj)) { return; }
                                var $cols = $(val).find('th, td');
                                return $cols.map(function (i, val) {
                                    if (!!~ignoreCols.indexOf(i)) { return; }
                                    return $(val).text();
                                }).get().join(colD);
                            }).get().join(rdel),
                            dataObject = escapeHtml(
                                JSON.stringify({
                                    data: dataURL,
                                    fileName: name,
                                    mimeType: $.fn.tableExport.xls.mimeType,
                                    fileExtension: $.fn.tableExport.xls.fileExtension
                                }))
                        createObjButton(dataObject);
                    },
                    csv: function (rdel, name) {
                        var colD = $.fn.tableExport.csv.separator,
                            dataURL = $rows.map(function (i, val) {
                                if (!!~ignoreRows.indexOf(i - thAdj)) { return; }
                                var $cols = $(val).find('th, td');
                                return $cols.map(function (i, val) {
                                    if (!!~ignoreCols.indexOf(i)) { return; }
                                    return $(val).text();
                                }).get().join(colD);
                            }).get().join(rdel),
                            dataObject = escapeHtml(
                                JSON.stringify({
                                    data: dataURL,
                                    fileName: name,
                                    mimeType: $.fn.tableExport.csv.mimeType,
                                    fileExtension: $.fn.tableExport.csv.fileExtension
                                }))
                        createObjButton(dataObject);
                    },
                    txt: function (rdel, name) {
                        var colD = $.fn.tableExport.txt.separator,
                            dataURL = $rows.map(function (i, val) {
                                if (!!~ignoreRows.indexOf(i - thAdj)) { return; }
                                var $cols = $(val).find('th, td');
                                return $cols.map(function (i, val) {
                                    if (!!~ignoreCols.indexOf(i)) { return; }
                                    return $(val).text();
                                }).get().join(colD);
                            }).get().join(rdel),
                            dataObject = escapeHtml(
                                JSON.stringify({
                                    data: dataURL,
                                    fileName: name,
                                    mimeType: $.fn.tableExport.txt.mimeType,
                                    fileExtension: $.fn.tableExport.txt.fileExtension
                                }))
                        createObjButton(dataObject);
                    }
                };

            settings.formats.forEach(
                function (key) {
                    exporters[key](rowD, fileName);
                }
            );

            function checkCaption(exportButton) {
                var $caption = $el.find('caption:not(.head)');
                $caption.length ? $caption.append(exportButton) : $el.prepend('<caption class="' + bootstrapSpacing + settings.position + '">' + exportButton + '</caption>');
            }

            function createObjButton(dataObject, myContent, myClass) {
                $el.find("thead").attr("data-fileblob", dataObject);
                var object = $el.find("thead").data("fileblob"),
                data = object.data,
                fileName = object.fileName,
                mimeType = object.mimeType,
                fileExtension = object.fileExtension;
                export2file(data, mimeType, fileName, fileExtension);
            }
        });
    };

    // Define the plugin default properties.
    $.fn.tableExport.defaults = {
        headings: true,                             // (Boolean), display table headings (th or td elements) in the <thead>, (default: true)
        footers: true,                              // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
        formats: ["xls", "csv", "txt"],             // (String[]), filetype(s) for the export, (default: ["xls", "csv", "txt"])
        fileName: "id",                             // (id, String), filename for the downloaded file, (default: "id")
        bootstrap: false,                            // (Boolean), style buttons using bootstrap, (default: true)
        position: "bottom",                         // (top, bottom), position of the caption element relative to table, (default: "bottom")
        ignoreRows: null,                           // (Number, Number[]), row indices to exclude from the exported file (default: null)
        ignoreCols: null                            // (Number, Number[]), column indices to exclude from the exported file (default: null)
    };

    $.fn.tableExport.charset = "charset=utf-8";

    $.fn.tableExport.xlsx = {
        defaultClass: "xlsx",
        buttonContent: "Export to xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileExtension: ".xlsx"
    };

    $.fn.tableExport.xls = {
        defaultClass: "xls",
        buttonContent: "Export to xls",
        separator: "\t",
        mimeType: "application/vnd.ms-excel",
        fileExtension: ".xls"
    };

    $.fn.tableExport.csv = {
        defaultClass: "csv",
        buttonContent: "Export to csv",
        separator: ",",
        mimeType: "application/csv",
        fileExtension: ".csv"
    };

    $.fn.tableExport.txt = {
        defaultClass: "txt",
        buttonContent: "Export to txt",
        separator: "  ",
        mimeType: "text/plain",
        fileExtension: ".txt"
    };

    $.fn.tableExport.defaultFileName = "myDownload";

    $.fn.tableExport.defaultButton = "button-default";

    $.fn.tableExport.bootstrap = ["btn", "btn-default", "btn-toolbar"];

    $.fn.tableExport.rowDel = "\r\n";

    $.fn.tableExport.entityMap = { "&": "&#38;", "<": "&#60;", ">": "&#62;", "'": '&#39;', "/": '&#47' };

    function escapeHtml(string) {
        return String(string).replace(/[&<>'\/]/g, function (s) {
            return $.fn.tableExport.entityMap[s];
        });
    }

    function dateNum(v, date1904) {
        if (date1904) v += 1462;
        var epoch = Date.parse(v);
        return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
    }

    function createSheet(data, opts) {
        var ws = {};
        var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
        for (var R = 0; R != data.length; ++R) {
            for (var C = 0; C != data[R].length; ++C) {
                if (range.s.r > R) range.s.r = R;
                if (range.s.c > C) range.s.c = C;
                if (range.e.r < R) range.e.r = R;
                if (range.e.c < C) range.e.c = C;
                var cell = { v: data[R][C] };
                if (cell.v == null) continue;
                var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n';
                    cell.z = XLSX.SSF._table[14];
                    cell.v = dateNum(cell.v);
                }
                else cell.t = 's';

                ws[cell_ref] = cell;
            }
        }
        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
        return ws;
    }

    function Workbook() {
        if (!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }

    function string2ArrayBuffer(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    function export2file(data, mime, name, extension) {
        if (extension === ".xlsx") {
            var wb = new Workbook(),
                ws = createSheet(data);

            wb.SheetNames.push(name);
            wb.Sheets[name] = ws;

            var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' },
                wbout = XLSX.write(wb, wopts);

            data = string2ArrayBuffer(wbout);
        }
        saveAs(new Blob([data],
            { type: mime + ";" + $.fn.tableExport.charset }),
            name + extension);
    }

}(window));


(function ($) {

    $.fn.extend({

        tableExportxml: function (options) {

            var defaults = {

                separator: ',',

                ignoreColumn: [],

                tableName: 'yourTableName',

                type: 'csv',

                pdfFontSize: 14,

                pdfLeftMargin: 20,

                escape: 'true',

                htmlContent: 'false',

                consoleLog: 'false'

            };



            var options = $.extend(defaults, options);

            var el = this;



            if (defaults.type == 'csv' || defaults.type == 'txt') {



                // Header

                var tdData = "";

                $(el).find('thead').find('tr').each(function () {

                    tdData += "\n";

                    $(this).filter(':visible').find('th').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                tdData += '"' + parseString($(this)) + '"' + defaults.separator;

                            }

                        }



                    });

                    tdData = $.trim(tdData);

                    tdData = $.trim(tdData).substring(0, tdData.length - 1);

                });



                // Row vs Column

                $(el).find('tbody').find('tr').each(function () {

                    tdData += "\n";

                    $(this).filter(':visible').find('td').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                tdData += '"' + parseString($(this)) + '"' + defaults.separator;

                            }

                        }

                    });

                    //tdData = $.trim(tdData);

                    tdData = $.trim(tdData).substring(0, tdData.length - 1);

                });



                //output

                if (defaults.consoleLog == 'true') {

                    console.log(tdData);

                }

                var base64data = "base64," + $.base64({ data: tdData, type: 0 });

                //window.open('data:application/'+defaults.type+';filename=exportData;' + base64data);

                //downloadFile(defaults.filename + '.' + defaults.type, tdData);
                saveAs(new Blob([tdData],
          { type: "text/plain" + ";" + "charset=utf-8" }),
          defaults.filename + "." + defaults.type);

            } else if (defaults.type == 'sql') {



                // Header

                var tdData = "INSERT INTO `" + defaults.tableName + "` (";

                $(el).find('thead').find('tr').each(function () {



                    $(this).filter(':visible').find('th').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                tdData += '`' + parseString($(this)) + '`,';

                            }

                        }



                    });

                    tdData = $.trim(tdData);

                    tdData = $.trim(tdData).substring(0, tdData.length - 1);

                });

                tdData += ") VALUES ";

                // Row vs Column

                $(el).find('tbody').find('tr').each(function () {

                    tdData += "(";

                    $(this).filter(':visible').find('td').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                tdData += '"' + parseString($(this)) + '",';

                            }

                        }

                    });



                    tdData = $.trim(tdData).substring(0, tdData.length - 1);

                    tdData += "),";

                });

                tdData = $.trim(tdData).substring(0, tdData.length - 1);

                tdData += ";";



                //output

                //console.log(tdData);



                if (defaults.consoleLog == 'true') {

                    console.log(tdData);

                }



                var base64data = "base64," + $.base64.encode(tdData);

                window.open('data:application/sql;filename=exportData;' + base64data);





            } else if (defaults.type == 'json') {



                var jsonHeaderArray = [];

                $(el).find('thead').find('tr').each(function () {

                    var tdData = "";

                    var jsonArrayTd = [];



                    $(this).filter(':visible').find('th').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                jsonArrayTd.push(parseString($(this)));

                            }

                        }

                    });

                    jsonHeaderArray.push(jsonArrayTd);



                });



                var jsonArray = [];

                $(el).find('tbody').find('tr').each(function () {

                    var tdData = "";

                    var jsonArrayTd = [];



                    $(this).filter(':visible').find('td').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                jsonArrayTd.push(parseString($(this)));

                            }

                        }

                    });

                    jsonArray.push(jsonArrayTd);



                });



                var jsonExportArray = [];

                jsonExportArray.push({ header: jsonHeaderArray, data: jsonArray });



                //Return as JSON

                //console.log(JSON.stringify(jsonExportArray));



                //Return as Array

                //console.log(jsonExportArray);

                if (defaults.consoleLog == 'true') {

                    console.log(JSON.stringify(jsonExportArray));

                }

                var base64data = "base64," + $.base64.encode(JSON.stringify(jsonExportArray));

                window.open('data:application/json;filename=exportData;' + base64data);

            } else if (defaults.type == 'xml') {



                var xml = '<?xml version="1.0" encoding="utf-8"?>';

                xml += '<tabledata><fields>';

                // Header

                $(el).find('thead').find('tr').each(function () {

                    $(this).filter(':visible').find('th').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                xml += "<field>" + parseString($(this)) + "</field>";

                            }

                        }

                    });

                });

                xml += '</fields><data>';



                // Row Vs Column

                var rowCount = 1;

                $(el).find('tbody').find('tr').each(function () {

                    xml += '<row id="' + rowCount + '">';

                    var colCount = 0;

                    $(this).filter(':visible').find('td').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                xml += "<column-" + colCount + ">" + parseString($(this)) + "</column-" + colCount + ">";

                            }

                        }

                        colCount++;

                    });

                    rowCount++;

                    xml += '</row>';

                });

                xml += '</data></tabledata>'



                if (defaults.consoleLog == 'true') {

                    console.log(xml);

                }



                var base64data = "base64," + $.base64({ data: xml, type: 0 });
                saveAs(new Blob([xml],
          { type: "text/xml" + ";" + "charset=utf-8" }),
          defaults.filename + "." + defaults.type);
            } 
    else if (defaults.type == 'png') {

                html2canvas($(el), {

                    onrendered: function (canvas) {

                        var img = canvas.toDataURL("image/png");

                        window.open(img);





                    }

                });

            } else if (defaults.type == 'pdf') {



                var doc = new jsPDF('p', 'pt', 'a4', true);

                doc.setFontSize(defaults.pdfFontSize);



                // Header

                var startColPosition = defaults.pdfLeftMargin;

                $(el).find('thead').find('tr').each(function () {

                    $(this).filter(':visible').find('th').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                var colPosition = startColPosition + (index * 50);

                                doc.text(colPosition, 20, parseString($(this)));

                            }

                        }

                    });

                });





                // Row Vs Column

                var startRowPosition = 20; var page = 1; var rowPosition = 0;

                $(el).find('tbody').find('tr').each(function (index, data) {

                    rowCalc = index + 1;



                    if (rowCalc % 26 == 0) {

                        doc.addPage();

                        page++;

                        startRowPosition = startRowPosition + 10;

                    }

                    rowPosition = (startRowPosition + (rowCalc * 10)) - ((page - 1) * 280);



                    $(this).filter(':visible').find('td').each(function (index, data) {

                        if ($(this).css('display') != 'none') {

                            if (defaults.ignoreColumn.indexOf(index) == -1) {

                                var colPosition = startColPosition + (index * 50);

                                doc.text(colPosition, rowPosition, parseString($(this)));

                            }

                        }



                    });



                });



                // Output as Data URI

                doc.output('datauri');



            }





            function parseString(data) {



                if (defaults.htmlContent == 'true') {

                    content_data = data.html().trim();

                } else {

                    content_data = data.text().trim();

                }



                if (defaults.escape == 'true') {

                    content_data = escape(content_data);

                }







                return content_data;

            }



        }

    });

})(jQuery);
