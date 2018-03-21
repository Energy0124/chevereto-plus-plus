/*CHV.fn.uploader.add = function (e, urls) {
    var md5;
    if (!this.canAdd) {
        var e = e.originalEvent;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    $fileinput = $(this.selectors.file);
    $fileinput.replaceWith($fileinput = $fileinput.clone(true));
    var item_queue_template = $(this.selectors.upload_item_template).html();
    var files = [];
    if (typeof urls == typeof undefined) {
        var e = e.originalEvent;
        e.preventDefault();
        e.stopPropagation();
        files = e.dataTransfer || e.target;
        files = $.makeArray(files.files);
        if (e.clipboard) {
            md5 = PF.fn.md5(e.dataURL);
            if ($.inArray(md5, this.clipboardImages) != -1) {
                return null;
            }
            this.clipboardImages.push(md5);
        }
        var failed_files = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var image_type_str;
            if (typeof file.type == "undefined" || file.type == "") {
                image_type_str = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();
            } else {
                image_type_str = file.type.replace("image/", "");
            }
            if (file.size > CHV.obj.config.image.max_filesize.getBytes()) {
                failed_files.push({
                    uid: i,
                    name: file.name.truncate_middle() + " - " + PF.fn._s("File too big.")
                });
                continue;
            }
            if (CHV.obj.config.upload.image_types.indexOf(image_type_str) == -1 && /android/i.test(navigator.userAgent) == false) {
                failed_files.push({
                    uid: i,
                    name: file.name.truncate_middle() + " - " + PF.fn._s("Invalid or unsupported file format.")
                });
                continue;
            }
            if (md5) {
                file.md5 = md5;
            }
            file.fromClipboard = e.clipboard == true;
            file.uid = i;
        }
        for (var i = 0; i < failed_files.length; i++) {
            var failed_file = failed_files[i];
            files.splice(failed_file.id, 1);
        }
        if (failed_files.length > 0 && files.length == 0) {
            var failed_message = '';
            for (var i = 0; i < failed_files.length; i++) {
                failed_message += "<li>" + failed_files[i].name + "</li>";
            }
            PF.fn.modal.simple({
                title: PF.fn._s("Some files couldn't be added"),
                message: "<ul>" + "<li>" + failed_message + "</ul>"
            });
            return;
        }
        if (files.length == 0) {
            return;
        }
    } else {
        urls = urls.replace(/(<([^>]+)>)/g, '').replace(/(\[([^\]]+)\])/g, '');
        files = urls.match_urls();
        if (!files)
            return;
        files = files.array_unique();
        files = $.map(files, function (file, i) {
            return {
                uid: i,
                name: file,
                url: file
            };
        });
    }
    if ($.isEmptyObject(this.files)) {
        for (var i = 0; i < files.length; i++) {
            this.files[files[i].uid] = files[i];
            this.filesAddId++;
        }
    } else {
        var currentfiles = [];
        for (var key in this.files) {
            if (typeof this.files[key] == "undefined" || typeof this.files[key] == "function")
                continue;
            currentfiles.push(encodeURI(this.files[key].name));
        }
        files = $.map(files, function (file, i) {
            if ($.inArray(encodeURI(file.name), currentfiles) != -1) {
                return null;
            }
            file.uid = CHV.fn.uploader.filesAddId + i;
            CHV.fn.uploader.filesAddId++;
            return file;
        });
        for (var i = 0; i < files.length; i++) {
            this.files[files[i].uid] = files[i];
        }
    }
    $(this.selectors.queue, this.selectors.root).append(item_queue_template.repeat(files.length));
    $(this.selectors.queue + " " + this.selectors.queue_item + ":not([data-id])", this.selectors.root).hide();
    $(this.selectors.close_cancel, this.selectors.root).hide().each(function () {
        if ($(this).data("action") == "close-upload")
            $(this).show();
    });
    var failed_before = failed_files
        , failed_files = []
        , j = 0
        , default_options = {
        canvas: true,
        maxWidth: 590
    };

    function CHVLoadImage(i) {
        if (typeof i == typeof undefined) {
            var i = 0;
        }
        if (!(i in files)) {
            PF.fn.loading.destroy("fullscreen");
            return;
        }
        var file = files[i];
        $(CHV.fn.uploader.selectors.queue_item + ":not([data-id]) .load-url", CHV.fn.uploader.selectors.queue)[typeof file.url !== "undefined" ? "show" : "remove"]();
        loadImage.parseMetaData(file.url ? file.url : file, function (data) {
            $(CHV.fn.uploader.selectors.queue_item + ":not([data-id]) .preview:empty", CHV.fn.uploader.selectors.queue).first().closest("li").attr("data-id", file.uid);
            loadImage(file.url ? file.url : file, function (img) {
                ++j;
                var $queue_item = $(CHV.fn.uploader.selectors.queue_item + "[data-id=" + (file.uid) + "]", CHV.fn.uploader.selectors.queue);
                if (img.type === "error") {
                    failed_files.push({
                        uid: file.uid,
                        name: file.name.truncate_middle()
                    });
                } else {
                    if (!$("[data-group=upload-queue]", CHV.fn.uploader.selectors.root).is(":visible")) {
                        $("[data-group=upload-queue]", CHV.fn.uploader.selectors.root).css("display", "block");
                    }
                    var mimetype = "image/jpeg";
                    if (typeof data.buffer !== typeof undefined) {
                        var buffer = (new Uint8Array(data.buffer)).subarray(0, 4);
                        var header = "";
                        for (var i = 0; i < buffer.length; i++) {
                            header += buffer[i].toString(16);
                        }
                        var header_to_mime = {
                            '89504e47': 'image/png',
                            '47494638': 'image/gif',
                            'ffd8ffe0': 'image/jpeg',
                        };
                        $.each(['ffd8ffe1', 'ffd8ffe2'], function (i, v) {
                            header_to_mime[v] = header_to_mime['ffd8ffe0'];
                        });
                        if (typeof header_to_mime[header] !== typeof undefined) {
                            mimetype = header_to_mime[header];
                        }
                    }
                    var title = null;
                    if (typeof file.name !== typeof undefined) {
                        var basename = PF.fn.baseName(file.name);
                        title = $.trim(basename.substring(0, 100).capitalizeFirstLetter());
                    }
                    CHV.fn.uploader.files[file.uid].parsedMeta = {
                        title: title,
                        width: img.originalWidth,
                        height: img.originalHeight,
                        mimetype: mimetype,
                    };
                    $queue_item.show();
                    $("[data-group=upload-queue-ready]", CHV.fn.uploader.selectors.root).show();
                    $("[data-group=upload]", CHV.fn.uploader.selectors.root).hide();
                    $queue_item.find(".load-url").remove();
                    $queue_item.find(".preview").removeClass("soft-hidden").show().append(img);
                    $img = $queue_item.find(".preview").find("img,canvas");
                    $img.attr("class", "canvas");
                    queue_item_h = $queue_item.height();
                    queue_item_w = $queue_item.width();
                    var img_w = parseInt($img.attr("width")) || $img.width();
                    var img_h = parseInt($img.attr("height")) || $img.height();
                    var img_r = img_w / img_h;
                    $img.hide();
                    if (img_w > img_h || img_w == img_h) {
                        var queue_img_h = img_h < queue_item_h ? img_h : queue_item_h;
                        if (img_w > img_h) {
                            $img.height(queue_img_h).width(queue_img_h * img_r);
                        }
                    }
                    if (img_w < img_h || img_w == img_h) {
                        var queue_img_w = img_w < queue_item_w ? img_w : queue_item_w;
                        if (img_w < img_h) {
                            $img.width(queue_img_w).height(queue_img_w / img_r);
                        }
                    }
                    if (img_w == img_h) {
                        $img.height(queue_img_h).width(queue_img_w);
                    }
                    $img.css({
                        marginTop: -$img.height() / 2,
                        marginLeft: -$img.width() / 2
                    }).show();
                    CHV.fn.uploader.boxSizer();
                }
                if (j == files.length) {
                    if (typeof failed_before !== "undefined") {
                        failed_files = failed_files.concat(failed_before);
                    }
                    PF.fn.loading.destroy("fullscreen");
                    if (failed_files.length > 0) {
                        var failed_message = "";
                        for (var i = 0; i < failed_files.length; i++) {
                            failed_message += "<li>" + failed_files[i].name + "</li>";
                            delete CHV.fn.uploader.files[failed_files[i].uid];
                            console.log(failed_files)
                            console.log(CHV.fn.uploader.files)
                            $("li[data-id=" + failed_files[i].uid + "]", CHV.fn.uploader.selectors.queue).find("[data-action=cancel]").click();
                        }
                        PF.fn.modal.simple({
                            title: PF.fn._s("Some files couldn't be added"),
                            message: '<ul>' + failed_message + '</ul>'
                        });
                    } else {
                        CHV.fn.uploader.focus();
                    }
                    CHV.fn.uploader.boxSizer();
                }
            }, $.extend({}, default_options, {
                orientation: data.exif ? data.exif.get("Orientation") : 1
            }));
            setTimeout(function () {
                CHVLoadImage(i + 1);
            }, 25);
        });
    }

    PF.fn.loading.fullscreen();
    CHVLoadImage();
    this.queueSize();

    //appended my code
    console.log("adding lo!!!!!");

    $("#anywhere-upload-queue .queue-item").each(function () {
        if ($("button", this).length == 0) {
            $(this).append("<button class=\"btn btn-small green\" data-action=\"camen\" data-public=\"Edit\" data-private=\"Private Edit\">Edit</button>");
            $("button", this).click(function () {
                PF.fn.modal.call({
                    type: "html",
                    template: '<span class="modal-box-title">Edit image</span>'
                })
            })
        }
    });
}*/
// var CHV_temp_add = CHV.fn.uploader.add;
//
// function CHV_hacked_add(e, urls) {
//     var result = CHV_temp_add.apply(e, urls);
//     console.log("added!");
//     return result;
//
// }
//
// CHV.fn.uploader.add = CHV_hacked_add;

/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
 */
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = img.naturalWidth,
        ih = img.naturalHeight,
        r = Math.min(w / iw, h / ih);
    let nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

CamamCHV = {};
CamamCHV.filters = [];
// CamamCHV.filters[0] = {
//     brightness: 0,
//     contrast: 0,
//     saturation: 0,
//     vibrance: 0,
//     exposure: 0,
//     hue: 0,
//     sepia: 0,
//     gamma: 0,
//     noise: 0,
//     clip: 0,
//     sharpen: 0,
//     stackBlur: 0
// };

CHV.fn.uploader.add = (function () {
    let cached_function = CHV.fn.uploader.add;

    return function (e, urls) {
        // your code

        let result = cached_function.apply(this, [e, urls]); // use .apply() to call it

        // more of your code
        // console.log("added!");

        $("#anywhere-upload-queue .queue-item").each(function () {

            if ($("button", this).length == 0) {


                $(this).append("<button class=\"btn btn-small green\" >Edit</button>");
                $("button", this).click(0, function (e) {
                    let id = $(this).closest("li").attr("data-id");
                    CamamCHV.filters[id] = {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        vibrance: 0,
                        exposure: 0,
                        hue: 0,
                        sepia: 0,
                        gamma: 0,
                        noise: 0,
                        clip: 0,
                        sharpen: 0,
                        stackBlur: 0
                    };
                    // console.log(id);
                    PF.fn.modal.call({
                        type: "html",
                        callback: function () {

                            let target_canvas = document.getElementById('camam-canvas').getContext('2d');
                            let source_canvas = $(".queue-item[data-id=" + id + "] .preview .canvas")[0];
                            let myCanvas = document.getElementById('camam-canvas');
                            myCanvas.width = source_canvas.width;
                            myCanvas.height = source_canvas.height;

                            target_canvas.width = source_canvas.width;
                            target_canvas.height = source_canvas.height;
                            target_canvas.drawImage(source_canvas, 0, 0);
                            // // var preview = document.getElementById('preview-camam');
                            // let reader = new FileReader();
                            //
                            // reader.addEventListener("load", function () {
                            //     // preview.src = reader.result;
                            //     let myCanvas = document.getElementById('camam-canvas');
                            //     let ctx = myCanvas.getContext('2d');
                            //
                            //
                            //     let img = new Image;
                            //     img.onload = function () {
                            //
                            //         ctx.drawImage(img, 0, 0); // Or at whatever offset you like
                            //         // drawImageProp(ctx, img,0,0,500,500);
                            //     };
                            //     img.src = reader.result;
                            //
                            // }, false);
                            //
                            // if (CHV.fn.uploader.files[0]) {
                            //     reader.readAsDataURL(CHV.fn.uploader.files[0]);
                            // }
                            function groupRender(id) {
                                Caman("#camam-canvas", function () {
                                    this.reloadCanvasData();
                                    Object.entries(CamamCHV.filters[id]).forEach(function ([filter, value]) {
                                        console.log(filter + ": " + value);
                                        if (filter != 0 && value != 0) {
                                            this[filter](value);
                                        }

                                        // this.brightness(current_value).render();

                                    }, this);
                                    this.render();
                                    this.revert(false);
                                });
                            }

                            Object.entries(CamamCHV.filters[id]).forEach(function ([filter, value]) {
                                console.log(`${filter}: ${value}`);
                                $(`input[data-filter=${filter}]`).change(function () {
                                    let current_value = $(this).val();
                                    $(this).next().html(current_value);
                                    CamamCHV.filters[id][filter] = parseInt(current_value);
                                    groupRender(id);

                                });
                            });

                            // $("input[data-filter='contrast']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='saturation']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='vibrance']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='exposure']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='hue']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='sepia']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='gamma']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='noise']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='clip']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='sharpen']").change(function () {
                            //     $(this).next().html($(this).val());
                            // });
                            // $("input[data-filter='stackBlur']").change(function () {
                            //     $(this).next().html($(this).val());
                            // })


                        },
                        template: `

<span class="modal-box-title">Edit image</span>
<canvas id="camam-canvas" data-caman-hidpi="" width="600" height="600" data-caman-id="0"></canvas>
<img id="preview-camam">
<style>
    #Filters {
        flex-wrap: wrap;
        display: flex;
    }

    .Filter {
        flex: initial;
        padding: 10px;
    }

    #PresetFilters {
        flex-wrap: wrap;
        display: flex;
    }

    #PresetFilters a {
        flex: initial;
        padding: 10px;
    }

</style>
<div>
    <div id="Filters">
  
    <div class="Filter">
      <div class="FilterName">
        <p>brightness</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="-100" max="100" step="1" value="0" data-filter="brightness">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>contrast</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="-100" max="100" step="1" value="0" data-filter="contrast">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>saturation</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="-100" max="100" step="1" value="0" data-filter="saturation">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>vibrance</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="-100" max="100" step="1" value="0" data-filter="vibrance">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>exposure</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="-100" max="100" step="1" value="0" data-filter="exposure">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>hue</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="100" step="1" value="0" data-filter="hue">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>sepia</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="100" step="1" value="0" data-filter="sepia">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>gamma</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="10" step="0.1" value="0" data-filter="gamma">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>noise</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="100" step="1" value="0" data-filter="noise">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>clip</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="100" step="1" value="0" data-filter="clip">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>sharpen</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="100" step="1" value="0" data-filter="sharpen">
        <span class="FilterValue">0</span>
      </div>
    </div>
  
    <div class="Filter">
      <div class="FilterName">
        <p>stackBlur</p>
      </div>

      <div class="FilterSetting">
        <input type="range" min="0" max="20" step="1" value="0" data-filter="stackBlur">
        <span class="FilterValue">0</span>
      </div>
    </div>
  

  <div class="Clear"></div>
  </div>

    <div id="PresetFilters" _vimium-has-onclick-listener="">

        <a data-preset="vintage">Vintage</a>

        <a data-preset="lomo">Lomo</a>

        <a data-preset="clarity">Clarity</a>

        <a data-preset="sinCity">Sin City</a>

        <a data-preset="sunrise">Sunrise</a>

        <a data-preset="crossProcess">Cross Process</a>

        <a data-preset="orangePeel">Orange Peel</a>

        <a data-preset="love">Love</a>

        <a data-preset="grungy"> Grungy</a>

        <a data-preset="jarques">Jarques</a>

        <a data-preset="pinhole">Pinhole</a>

        <a data-preset="oldBoot">Old Boot</a>

        <a data-preset="glowingSun">Glowing Sun</a>

        <a data-preset="hazyDays">Hazy Days</a>

        <a data-preset="herMajesty">Her Majesty</a>

        <a data-preset="nostalgia">Nostalgia</a>

        <a data-preset="hemingway">Hemingway</a>

        <a data-preset="concentrate">Concentrate</a>

    </div>

</div>

`
                    })

                })
            }
        });

        return result;
    };
})();