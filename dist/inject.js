(function (send_event_name, reply_event_name) {
    // NOTE: This function is serialized and runs in the page's context
    // Begin of the page's functionality
    window['convertToDataUrl'] = function (string, fid) {
        sendMessage({
            type: 'toDataUrl',
            data: string,
            fid: fid
        }, function (response) {
            // alert('Background said: ' + response);
            // console.log(response);
            var event = new CustomEvent('getDataFromBackground', {detail: response});
            window.dispatchEvent(event);
        });
        // console.log("send convert to dataurl");
    };

    // window.hello = function (string) {
    //     sendMessage({
    //         type: 'sayhello',
    //         data: string
    //     }, function (response) {
    //         alert('Background said: ' + response);
    //     });
    // };

    // End of your logic, begin of messaging implementation:
    function sendMessage(message, callback) {
        var transporter = document.createElement('dummy');
        // Handles reply:
        transporter.addEventListener(reply_event_name, function (event) {
            var result = this.getAttribute('result');
            if (this.parentNode)
                this.parentNode.removeChild(this);
            // After having cleaned up, send callback if needed:
            if (typeof callback == 'function') {
                result = JSON.parse(result);
                callback(result);
            }
        });
        // Functionality to notify content script
        var event = document.createEvent('Events');
        event.initEvent(send_event_name, true, false);
        transporter.setAttribute('data', JSON.stringify(message));
        (document.body || document.documentElement).appendChild(transporter);
        transporter.dispatchEvent(event);
    }
})("__rw_chrome_ext_1521921138510", "__rw_chrome_ext_reply_1521921138510");
// console.log("injected");
CamanCHV = {};
// CamanCHV.defaultFilters = {
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
CamanCHV.filters = [];
CamanCHV.presets = [];
CamanCHV.files = [];
CamanCHV.filtersTEMP = [];
CamanCHV.presetsTEMP = [];
// CamanCHV.filters[0] = {
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
window.addEventListener("getDataFromBackground", function bgListener(e) {
    let result = e.detail;
    let fid = result.split(/@(.+)/)[0];
    let url = result.split(/@(.+)/)[1];
    // console.log("fid: " + fid);
    fetch(url)
        .then(res => res.blob())
        .then((blob) => {
            let originalFile = CHV.fn.uploader.files[fid];
            let file = new File([blob], originalFile.name, {
                type: originalFile.type,
                lastModified: originalFile.lastModified
            });
            file.parsedMeta = originalFile.parsedMeta;
            file.formValues = originalFile.formValues;
            CHV.fn.uploader.files[fid] = file;
            CamanCHV.files[fid] = $.extend(true, [], CHV.fn.uploader.files)[fid];
            // window.removeEventListener("getDataFromBackground", bgListener);
        })
});


CHV.fn.uploader.add = (function () {
    let cached_function = CHV.fn.uploader.add;

    return function (e, urls) {
        // your code

        let result = cached_function.apply(this, [e, urls]); // use .apply() to call it

        // more of your code
        // console.log("added!");


        $("button[data-action=upload], div.upload-box-close").click(function () {
            CamanCHV.filters = [];
            CamanCHV.presets = [];
            CamanCHV.files = [];
        });
        $("#anywhere-upload-queue").find(".queue-item").each(function () {

            if ($("button", this).length == 0) {

                // console.log($(this).parent().html());
                //note that id is not ready to get yet so we need to wait for it to ready by using timer
                let started = Date.now();

                check(function (fileId) {
                    // It's there now, use it

                    $(`.queue-item[data-id=${fileId}] div.queue-item-button.cancel.hover-display`).click(function () {


                        CamanCHV.filters[fileId] = {
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
                        CamanCHV.presets[fileId] = "";
                        CamanCHV.files[fileId] = undefined;

                    });
                    let f = CHV.fn.uploader.files[fileId];
                    let queue_is_url = typeof f.url !== "undefined";

                    if (queue_is_url) {
                        // hello();

                        convertToDataUrl(f.url, fileId);

                    } else {

                        CamanCHV.files[fileId] = $.extend(true, [], CHV.fn.uploader.files)[fileId];
                        // console.log(fileId);
                    }


                }, $(this));

                function check(callback, $this) {


                    if ($this.data("id") !== undefined) {
                        setTimeout(callback.bind(null, $this.data("id")), 0);
                    } else {
                        if (Date.now() - started > 10000) { // 1000ms = one second
                            // Fail with message
                        } else {
                            setTimeout(check.bind(null, callback, $this), 0);
                        }
                    }
                }

                //
                // CamanCHV.files = $.extend(true, [], CHV.fn.uploader.files);
                // let fileId = $(this).data("id");
                // let tmpFile = CHV.fn.uploader.files[fileId];
                // CamanCHV.files[fileId] = tmpFile.slice();


                $(this).append("<button class=\"btn btn-small green\" >Caman.js</button>");
                $("button", this).click(0, function (e) {
                    let id = $(this).closest("li").attr("data-id");
                    if (CamanCHV.filters[id] === undefined) {
                        CamanCHV.filters[id] = {
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

                    }
                    CamanCHV.presets[id] = "";
                    // console.log(id);
                    let f = CHV.fn.uploader.files[id];
                    let queue_is_url = typeof f.url !== "undefined";

                    if (queue_is_url) {
                        convertToDataUrl(f.url, id);
                    }

                    PF.fn.modal.call({
                        type: "html",
                        callback: function () {
                            // hello();
                            function doneEditing() {
                                let originalFile = CHV.fn.uploader.files[id];
                                let canvas = document.getElementById('caman-canvas');
                                canvas.toBlob(function (myBlob) {
                                    let file = new File([myBlob], originalFile.name, {
                                        type: originalFile.type,
                                        lastModified: originalFile.lastModified
                                    });
                                    file.parsedMeta = originalFile.parsedMeta;
                                    file.formValues = originalFile.formValues;
                                    CHV.fn.uploader.files[id] = file;
                                    let source_canvas = $(".queue-item[data-id=" + id + "] .preview .canvas")[0];
                                    let source_canvas_context = source_canvas.getContext('2d');

                                    source_canvas_context.drawImage(canvas, 0, 0, source_canvas.width, source_canvas.height)
                                    $(".queue-item[data-id=" + id + "]").data("filters", CamanCHV.filters[id]);

                                    CamanCHV.filters[id] = {
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

                                    let preset = CamanCHV.presets[id];
                                    if (preset != "") {
                                        Caman("#caman-canvas", function () {
                                            this.reset();
                                            this[preset]();
                                            this.render(function () {
                                                let canvas = document.getElementById('caman-canvas');
                                                canvas.toBlob(function (myBlob) {
                                                    let file2 = new File([myBlob], originalFile.name, {
                                                        type: originalFile.type,
                                                        lastModified: originalFile.lastModified
                                                    });
                                                    file2.parsedMeta = originalFile.parsedMeta;
                                                    file2.formValues = originalFile.formValues;
                                                    CamanCHV.files[id] = file2;
                                                    PF.fn.modal.close();
                                                });
                                            });
                                            // this.revert(false);
                                            CamanCHV.presets[id] = "";
                                        });
                                    } else {
                                        CamanCHV.presets[id] = "";
                                        PF.fn.modal.close();
                                    }

                                });
                            }

                            $("button[data-action=submit]").parent()
                                .prepend("<span class=\"btn-alt\"><a id='save'>Save</a></span>")
                                .find("#save")
                                .click(function () {
                                    doneEditing();
                                });
                            $("button[data-action=submit]").remove();

                            function groupRender(id) {
                                Caman("#caman-canvas", function () {
                                    // this.reloadCanvasData();
                                    // this.reset();
                                    let preset = CamanCHV.presets[id]
                                    if (preset != "") {
                                        this[preset]();
                                    }
                                    this.render();
                                    // this.newLayer(function () {

                                    Object.entries(CamanCHV.filters[id]).forEach(function ([filter, value]) {

                                        if (filter != 0 && value != 0) {
                                            // console.log(filter + ": " + value);
                                            this[filter](value);
                                        }

                                        // this.brightness(current_value).render();


                                    }, this);
                                    // });
                                    this.render();
                                    this.revert(false);
                                });
                            }

                            let filterData = $(".queue-item[data-id=" + id + "]").data("filters");
                            if (filterData !== undefined) {
                                CamanCHV.filters[id] = filterData;
                                CamanCHV.presets[id] = "";
                            } else {
                                CamanCHV.filters[id] = {
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
                                CamanCHV.presets[id] = "";

                            }
                            // Object.entries(CamanCHV.filters[id]).forEach(function ([filter, value]) {
                            //     let slider_input = $(`input[data-filter=${filter}]`).each(function () {
                            //             $(this).val(value);
                            //             $(this).next().html(value);
                            //         }
                            //     )
                            //
                            // });
                            let target_canvas = document.getElementById('caman-canvas').getContext('2d');
                            // let source_canvas = $(".queue-item[data-id=" + id + "] .preview .canvas")[0];
                            let myCanvas = document.getElementById('caman-canvas');
                            // myCanvas.width = source_canvas.width;
                            // myCanvas.height = source_canvas.height;

                            // target_canvas.width = source_canvas.width;
                            // target_canvas.height = source_canvas.height;
                            //target_canvas.drawImage(source_canvas, 0, 0);

                            //  var ctx = document.getElementById('canvas').getContext('2d');
                            let img = new Image;
                            img.onload = function () {
                                myCanvas.width = img.width;
                                myCanvas.height = img.height;
                                target_canvas.drawImage(img, 0, 0);
                                groupRender(id)

                            };
                            // img.src = URL.createObjectURL(CHV.fn.uploader.files[id]);
                            img.src = URL.createObjectURL(CamanCHV.files[id]);

                            // // var preview = document.getElementById('preview-caman');
                            // let reader = new FileReader();
                            //
                            // reader.addEventListener("load", function () {
                            //     // preview.src = reader.result;
                            //     let myCanvas = document.getElementById('caman-canvas');
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


                            $(`#reset-image`).click(function () {
                                Caman("#caman-canvas", function () {
                                    CamanCHV.filters[id] = {
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
                                    CamanCHV.presets[id] = "";
                                    Object.entries(CamanCHV.filters[id]).forEach(function ([filter, value]) {
                                        let $filter_input = $(`input[data-filter=${filter}]`);
                                        let newValue = CamanCHV.filters[id][filter];
                                        $filter_input.val(newValue).next().html(newValue);
                                    });
                                    $(`#PresetFilters`).find(`a`).removeClass("active");
                                    this.revert();
                                });

                            });
                            $(`#PresetFilters`).find(`a`).click(function () {

                                $(`#PresetFilters`).find(`a`).removeClass("active");
                                $(this).addClass("active");
                                CamanCHV.presets[id] = $(this).data("preset");
                                groupRender(id)
                            });


                            Object.entries(CamanCHV.filters[id]).forEach(function ([filter, value]) {
                                // console.log(`${filter}: ${value}`);

                                let $filter_input = $(`input[data-filter=${filter}]`);

                                $filter_input.val(value).next().html(value);

                                $filter_input.change(function () {
                                    let current_value = $(this).val();
                                    $(this).next().html(current_value);
                                    CamanCHV.filters[id][filter] = parseInt(current_value);


                                    groupRender(id);

                                })
                                // $(`input[data-filter=${filter}]`).val(value);
                            });


                        },
                        template: `

<span class="modal-box-title">Edit image</span>
<div class="image-preview"><canvas id="caman-canvas" class="canvas" data-caman-hidpi-disabled ></canvas></div>
<img id="preview-caman">
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
        margin: 10px;
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

        <a data-preset="vintage" class="btn btn-small blue" href="#" >Vintage</a>

        <a data-preset="lomo" class="btn btn-small blue" href="#" >Lomo</a>

        <a data-preset="clarity" class="btn btn-small blue" href="#">Clarity</a>

        <a data-preset="sinCity" class="btn btn-small blue" href="#">Sin City</a>

        <a data-preset="sunrise" class="btn btn-small blue" href="#">Sunrise</a>

        <a data-preset="crossProcess" class="btn btn-small blue" href="#">Cross Process</a>

        <a data-preset="orangePeel" class="btn btn-small blue" href="#">Orange Peel</a>

        <a data-preset="love" class="btn btn-small blue" href="#">Love</a>

        <a data-preset="grungy" class="btn btn-small blue" href="#"> Grungy</a>

        <a data-preset="jarques" class="btn btn-small blue" href="#">Jarques</a>

        <a data-preset="pinhole" class="btn btn-small blue" href="#">Pinhole</a>

        <a data-preset="oldBoot" class="btn btn-small blue" href="#">Old Boot</a>

        <a data-preset="glowingSun" class="btn btn-small blue" href="#">Glowing Sun</a>

        <a data-preset="hazyDays" class="btn btn-small blue" href="#">Hazy Days</a>

        <a data-preset="herMajesty" class="btn btn-small blue" href="#">Her Majesty</a>

        <a data-preset="nostalgia" class="btn btn-small blue" href="#">Nostalgia</a>

        <a data-preset="hemingway" class="btn btn-small blue" href="#">Hemingway</a>

        <a data-preset="concentrate" class="btn btn-small blue" href="#">Concentrate</a>

    </div>

</div>
<div>
<button id="reset-image" class="btn btn-medium">Original Image</button>
</div>
`
                    })

                })
            }
        });

        return result;
    };
})();


let evt = document.createEvent('Event');
evt.initEvent('addUrls', true, false);
// console.log("addUrls")

// fire the event
document.dispatchEvent(evt);