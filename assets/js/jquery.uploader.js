/**
 * Created with JetBrains PhpStorm.
 * User: miller
 * Date: 4/23/14
 * Time: 9:21 AM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains PhpStorm.
 * User: miller
 * Date: 8/28/13
 * Time: 1:59 PM
 * To change this template use File | Settings | File Templates.
 */
;(function ($) {
    var defaults = {
        strings: {
            categoryLabel: "Select Category:",
            dropText: "Drag files here or select using the button",
            altText: "Or select using the button",
            buttons: {
                choose: "Choose files",
                upload: "Upload files"
            },
            tableHeadings: [
                "Type", "Name", "Ext", "Size", "Uploaded", "Clear All"
            ]
        },
        inputField: '',
        ajaxValidate: true,
        ajaxVar: '',
        errorClass: "alert alert-block alert-error"
    };

    function Up(el, opts) {
        this.config = $.extend(true, {}, defaults, opts);
        this.el = el;
        this.fileList = [];
        this.nameList = [];
        this.allXHR = [];
    }
    /************************************************************/
    Up.prototype.init = function() { //Initialize up function
        var widget = this,
            errClass = widget.config.errorClass,
            inputF = widget.config.inputField,
            strings = widget.config.strings,
            table = $("<table/>", {"class": "table table-striped table-bordered"}),
            head = $("<thead/>"),
            containerUp = $("<div/>", { "class": "up-cont" }),
            error = $("<div/>", {
                "class": errClass,
                id: "error",
                style: "display: none",
                html: [$("<a/>", {"class": "close", html: "&times;"}),
                    $("<p/>",{text: "Please fix the following input errors:"}),
                    $("<ul/>")]
            }).appendTo(containerUp),
            cell = $("<td/>", {"class": "empty", colspan: 7 }),
            row = $("<tr/>"),
            fileRow = row.clone(),
            spanText = $("<span/>", {"class": "empty", html: "Choose files or drag and drop here"}),
            container = $("<div/>", { "class": "up" }).appendTo(containerUp),
            selected = $("<div/>", {
                "class": "up-selected grid-view"
            }).appendTo(container),
            select = $("<a/>", {
                href: "#",
                "class": "btn btn-success up-choose",
                text: strings.buttons.choose
            }).appendTo(container),
            uploadA = $("<a/>", {
                href: "#",
                "class": "btn btn-primary up-upload disabled",
                text: strings.buttons.upload
            }).appendTo(container);

        container.append(inputF);

        widget.el.append(containerUp);

        widget.el.on("click", "a.up-choose", function(e) {
            e.preventDefault();
            widget.el.find("input[type='file']").click();
        });

        if (!selected.find("table").length) {
            var headerH = head.clone().appendTo(table),
                header = $("<tr/>").appendTo(headerH),
                remove = $("<a/>", {
                    href: "#"
                }),

                headRow = $("<th/>"),
                strngs = widget.config.strings.tableHeadings;

            $.each(strngs, function(i, string) {
                var cs = string.toLowerCase().replace(/\s/g, "_"),
                    newCell = headRow.clone()
                        .addClass("up-table-head "
                            + cs)
                        .appendTo(header);
                if (i === strngs.length - 1) {
                    var clear = remove.clone()
                        .text(string)
                        .addClass("up-remove-all");
                    newCell.html(clear).attr("colspan", 2);
                } else {
                    newCell.text(string);
                }
            });
        } else {
            table = selected.find("table");
        }

        if (!selected.find("table").length) {
            cell.clone().html(spanText).appendTo(fileRow);
            fileRow.appendTo(table);
            table.appendTo(selected);
        }

        widget.el.on("drop change dragover", "div.up", function(e) {
            if (e.type === "dragover") {
                e.preventDefault();
                e.stopPropagation();
                return false;
            } else if (e.type === "drop") {
                e.preventDefault();
                e.stopPropagation();
                widget.files = e.originalEvent.dataTransfer.files;
            } else {
                if(e.originalEvent.target.className == "up-rename"){
                    return false;
                }
                widget.files = widget.el
                    .find("input[type='file']")[0]
                    .files;
            }
            widget.handleFiles();
        });


        var removeAll = function() {
            widget.el.find("input[type='file']").val("");
            widget.fileList = [];
            widget.el.find("tbody").remove();
            if(!widget.el.find(".up-upload").hasClass("disabled")){
                widget.el.find(".up-upload").addClass("disabled")
            }
            cell.clone().html(spanText).appendTo(fileRow);
            fileRow.appendTo(table);
        };

        widget.el.on("click", "th a", function(e){
            e.preventDefault();
            e.stopPropagation();

            removeAll();

            if(!uploadA.hasClass("disabled")){
                uploadA.addClass("disabled");
            }
            if(!widget.el.find("#error").css("display","none")){
                widget.el.find("#error").css("display","none");
            }
            if(widget.el.find("#error ul").html() != ''){
                widget.el.find("#error ul").empty();
            }

            if(widget.el.find("input.ajax-validate")){
                widget.el.find("input.ajax-validate").remove();
            }

        });

        widget.el.on("click", "td a", function(e) {
            e.preventDefault();
            e.stopPropagation();

            var link = $(this),
                removed,
                ctd = link.closest("tr").children("td.name"),
                ctdId = ctd.attr("id"),
                inpts = widget.el.find("input.ajax-validate"),
                filename = link.closest("tr")
                    .children()
                    .eq(1)
                    .text();

            if (widget.el.find("tr").length === 1) {
                removeAll();
            }

            link.closest("tr").remove();

            if(widget.el.find("#error ul").html() != ''){
                widget.el.find("#error li.err-" + ctdId + "").remove();
            }
            if(widget.el.find("#error ul").html() == ''){
                widget.el.find("#error").css("display","none");
            }

            if(!uploadA.hasClass("disabled")){
                uploadA.addClass("disabled");
            }

            $.each(inpts, function(i, inpt){
                if($(inpt).hasClass(ctdId)){
                    $(inpt).remove();
                }/**/
            });

            $.each(widget.fileList, function(i, item) {
                if (item.name === filename) {
                    removed = i;
                }
            });

            widget.fileList.splice(removed, 1);
        });

        widget.el.on("click", "#error a.close", function(e) {
            e.preventDefault();
            if(!widget.el.find("#error").css("display","none")){
                widget.el.find("#error").css("display","none");
            }
            if(widget.el.find("#error ul").html() != ''){
                widget.el.find("#error ul").empty();
            }

        });

        widget.el.on("click", "a.up-upload", function(e) {
            e.preventDefault();
            widget.uploadFiles();
        });
    };

    /****************************************************************************/
    Up.prototype.handleFiles = function() { //handle files
        var widget = this,
            uploadBtn = widget.el.find(".up-upload"),
            container = widget.el.find("div.up-selected"),
            row = $("<tr/>"),
            cell = $("<td/>"),
            remove = $("<a/>", {
                href: "#"
            }),
            icoRemove = $("<i>", {"class": "glyphicon glyphicon-trash"}).appendTo(remove),
            table = container.find("table");

        table.find("tr td.empty").remove();

        $.each(widget.files, function(i, file) {
            window.URL = window.URL || window.webkitURL;
            var imgArr = ["jpg", "gif", "png", "jpeg"],
                img = document.createElement("img"),
                fileRow = row.clone(),
                filename = file.name.split(".").slice(0)[0],
                ext = file.name.split(".").slice(-1)[0].toLowerCase(),
            //ext = file.name[file.name.length - 1].toLowerCase(),
                del = remove.clone().addClass("up-remove");


            $.each(widget.config.ajaxVar, function(j, v){
                ($(v).addClass("" + i + "")).appendTo(container);
            });

            img.src = window.URL.createObjectURL(file);
            img.className = 'preview';
            img.width = 60;
            img.onload = function(e){
                window.URL.revokeObjectURL(this.src)
            };
            if($.inArray(ext, imgArr) != -1){
                cell.clone().html(img).appendTo(fileRow);
            } else {
                cell.clone().addClass("icon " + ext).appendTo(fileRow);
            }
            cell.clone().addClass("name").attr("id","" + i + "" )
                .text(filename).appendTo(fileRow);
            cell.clone()
                .text(ext).appendTo(fileRow);
            cell.clone()
                .text(widget.getFileSize(file.size))
                .appendTo(fileRow);
            cell.clone()
                .html("<div class='up-progress-wait'/>")
                .appendTo(fileRow);
            cell.clone()
                .html(del).appendTo(fileRow);

            fileRow.appendTo(table);

            widget.fileList.push(file);
            //k++;
            widget.validateFile(filename, ext, i);

        });

        if (!container.find("table").length) {
            table.appendTo(container);
        }

        if(uploadBtn.hasClass("disabled")){
            uploadBtn.removeClass("disabled");
        }

        widget.initProgress();
        widget.renameFiles();

    };
    /**************************************************************************************/
    Up.prototype.getFileSize = function(size){
        var ret = (Math.round(size / 1024));

        if(ret < 1024){
            return ret + " kb";
        }
        if(ret > 1024){
            return (Math.round(ret / 1024)) + " Mb";
        }
    };
    /************************************************************************************/
    Up.prototype.validateFile = function (filename, ext, k) {
        var widget = this,
            inpts;
        if(widget.config.ajaxValidate == true){
            inpts = widget.el.find("input." + "" + k + "");
            $.each(inpts, function(){
                var inpt = $(this);

                if(inpt.hasClass("name")){
                    inpt.attr("value", filename);
                }
                if(ext != '' && inpt.hasClass("ext")) {
                    inpt.attr("value", ext);
                }
                inpt = null;
            });
        }
        $.ajax({
            type: "POST",
            data:inpts,
            dataType: "JSON",
            cache: false,
            success: function(data){
                //console.log(data);
                if(data.error != ''){
                    widget.handleError(data.error, '', '', k);
                }
                else{
                    if(widget.el.find("#error ul").html() != ''){
                        widget.el.find("#error li.err-" + k + "").remove();
                    }
                    if(widget.el.find("#error ul").html() == ''){
                        widget.el.find("#error").css("display","none");
                    }
                }
            }
        });
    };

    /************************************************************************************/

    Up.prototype.renameFiles = function () {
        var widget = this,
            tds = widget.el.find("div.up-selected table td.name");

        $.each(tds, function(i, v) {
            var t = $(v);
            t.on("dblclick", function(){
                var input = $("<input/>",{"type":"text" ,"value": "", "class":"up-rename"}),
                    id = t.attr("id"),
                    name = t.html();

                t.empty();
                input.attr("value", name);
                input.appendTo(t).select().focus();

                input.on("blur change keypress",t, function(ev){
                    if(ev.type === "blur" || ev.type === "change"){
                        t.html(name);
                        input = null;
                    }/**/
                    else if(ev.type === "keypress"){
                        var tmp;
                        if(ev.keyCode == 13 ){
                            ev.preventDefault();
                            tmp = input.val();
                            if(tmp != ''){
                                t.text(tmp);
                                input = null;
                            }
                            else{
                                t.text(name);
                            }
                            widget.validateFile(t.html(), '', id);
                            name = tmp;
                        }/**/
                    }
                });
            });
        });
    };
    /************************************************************************************/
    Up.prototype.initProgress = function() {
        this.el.find("div.up-progress-wait").each(function() {
            var el = $(this);
            if (!el.hasClass("ui-progressbar")) {
                el.progressbar();
                $("<div/>", {"class": "up-progress-label", html: 0 + "%"}).appendTo(el);
            }
        });
    };
    /*****************************************************************************/
    Up.prototype.handleProgress = function(e, progress,progLabel) {
        //var complete = Math.ceil((e.loaded / e.total) * 100);
        var complete = (e.loaded / e.total) * 100;

        progress.progressbar("value", complete);
        progLabel.text( Math.round(complete) + "%" );
    };

    Up.prototype.completeProgress = function(e, progress, remove, progLabel){
        var complete = $("<span/>", {class: "up-complete"});

        $("<i>", {"class": "glyphicon glyphicon-ok"}).appendTo(complete);
        progress.removeClass("up-progress-wait").addClass("up-progress-completed");
        progress.progressbar("value", 100);
        progLabel.text( 100 + "%" );
        remove.replaceWith(complete);
    };

    /**************************************************************************/
    Up.prototype.handleError =function(error, progress, remove, k){
        var widget = this,
            errDiv = widget.el.find("#error"),
            errUl = widget.el.find("#error ul");

        $.each(error,  function(i,v) {
            $("<li/>", {
                html: v, "class": "err-" + k + ""
            }).appendTo(errUl);
        });
        errDiv.show();

        if(progress != '' && remove != ''){
            var complete = widget.el.find(".up-complete");
            progress.progressbar("value", 0);
            complete.replaceWith(remove);
        }
    };
    /**************************************************************************/
    Up.prototype.uploadFiles = function() {
        var widget = this,
            a = widget.el.find("a.up-upload");

        if (!a.hasClass("disabled")) {
            a.addClass("disabled");
        }

        $.each(widget.fileList, function(i, file) {
            var fd = new FormData(),
                prog = widget.el.find("div.up-progress-wait").eq(i),
                progLabel = widget.el.find("div.up-progress-label"),
                input = widget.el.find("input[type='file']").attr("name"),
                fileName = widget.el.find("input[class='ajax-validate name " + "" + i + "" + "']").attr("name"),
                fileNameValue = widget.el.find("input[class='ajax-validate name " + "" + i + ""+"']").val(),
                fileExt = widget.el.find("input[class='ajax-validate ext " + "" + i + ""+"']").attr("name"),
                fileExtValue = widget.el.find("input[class='ajax-validate ext " + "" + i + ""+"']").val(),
                remov = widget.el.find("a.up-remove").eq(i);

            //console.log("input[class='ajax-validate name " + "" + i + "" + "']");
            //console.log(fileNameValue);

            fd.append(input ,file);
            fd.append(fileName,fileNameValue);
            fd.append(fileExt,fileExtValue);
            widget.allXHR.push($.ajax({
                type: "POST",
                data: fd,
                dataType: "JSON",
                contentType: false,
                processData: false,
                xhr: function() {
                    var xhr = jQuery.ajaxSettings.xhr();

                    if (xhr.upload) {
                        xhr.upload.onprogress = function(e) {
                            widget.handleProgress(e, prog, progLabel);
                        };
                        xhr.upload.onload = function(e){
                            widget.completeProgress(e, prog, remov, progLabel)
                        };
                    }
                    return xhr;
                },
                success: function(data){
                    if(data != null){
                        widget.handleError(data.error, prog, remov, i);
                    }
                }

            }));
            widget.el.find("input[class='ajax-validate name " + "" + i + "" + "']").remove();
            widget.el.find("input[class='ajax-validate ext " + "" + i + ""+"']").remove();
        });
        widget.fileList = [];
        widget.allXHR = [];
    };
    /************************************************************************************************/
    $.fn.up = function(options) {
        new Up(this, options).init();
        return this;
    };

}(jQuery));
