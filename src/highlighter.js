const Mark = require("mark.js");
const html2canvas = require("html2canvas");

const LibHighlighter = function() {

    var selectionRange;

    function create_highlight(style,break_on) {
        if (window.getSelection && window.getSelection().toString()) {
            var node = getSelectionParentElement();
            if (node != null) {
                var text = getSelectionText();
                console.log("Selected text: " + text);
                return markFunc(node, text, /*HIGHLIGHT_CLASS + " " + */style,break_on);
            }
        } else {
            throw "Trying to highlight without selection";
        }
    }

    function getSelectionText() {
        if (window.getSelection) {
            var sel = window.getSelection();
            return sel.toString();
        }
    };

    function getSelectionParentElement() {
        var parentEl = null,
            sel;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                selectionRange = sel.getRangeAt(0);
                parentEl = selectionRange.commonAncestorContainer;
                if (parentEl.nodeType != 1) {
                    parentEl = parentEl.parentNode;
                }
            }
        } else if ((sel = document.selection) && sel.type != "Control") {
            parentEl = sel.createRange().parentElement();
        }
        return parentEl;
    };

    function markFunc(node, text, style,break_on) {
        var instance = new Mark(node);
        var outer_class = makeid(10);
        var innter_class = makeid(10);
        instance.mark(text, {
            "element": "span",
            "acrossElements": true,
            "separateWordSearch": false,
            "accuracy": "partially",
            "diacritics": true,
            "ignoreJoiners": true,
            "each": function (element) {
                element.setAttribute("class", outer_class);
                addStyles(element.style, style);
                var words = splitBy(element.innerHTML, break_on);
                var str = "";
                words.some(function (word) {
                    str += '<span class="' + innter_class + '">' + word + ' </span>';
                });
                element.innerHTML = str;
            },
            "done": function (totalMarks) {
                window.getSelection().empty();//This only in Chrome
                console.log("total marks: " + totalMarks);
            },
            "filter": function (node, term, totalCounter, counter) {
                var res = false;
                if (counter == 0) {
                    res = selectionRange.isPointInRange(node, selectionRange.startOffset);
                } else {
                    res = selectionRange.isPointInRange(node, 1);
                }
                console.log("Counter: " + counter + ", startOffset: " + selectionRange.startOffset);
                return res;
            }
        });

        Array.prototype.slice.call(document.getElementsByClassName(innter_class)).some(function(element){
             addStyles(element.style,style);
        });

        return {
            "class_outer": outer_class,
            "class_inner": innter_class,
            "elements_outer": Array.prototype.slice.call(document.getElementsByClassName(outer_class)),
            "elements_inner": Array.prototype.slice.call(document.getElementsByClassName(innter_class))
        };
    };

    function addStyles(styleObject, styleConfig){
        for (var prop in styleConfig) {
            if (Object.prototype.hasOwnProperty.call(styleConfig, prop)) {
                styleObject[prop] = styleConfig[prop];
            }
        }
    }

    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function splitBy(str, counter) {
        var splits = str.split(" ");
        var chunks = chunk(splits, counter);
        var words = [];
        chunks.some(function (chnk) {
            words.push(chnk.join(" "));
        });
        return words;
    }

    function chunk(arr, chunkSize) {
        var R = [];
        for (var i = 0, len = arr.length; i < len; i += chunkSize)
            R.push(arr.slice(i, i + chunkSize));
        return R;
    }

    function toCanvas(elements){
        var promises = [];
        elements.some(function (i) {
            promises.push(html2canvas(i));
        });
        return Promise.all(promises);
    }

    function toImages(promoise){
        return new Promise(function(resolve, reject){
            promoise.then(function(cvanvases){
                var ar = [];
                cvanvases.some(function(canvas){
                    ar.push(canvas.toDataURL());
                });
                resolve(ar);
            })
        })
    }

    this.highlight = function (color, break_on) {
        var result = create_highlight({ backgroundColor : color },break_on);
        return toImages(toCanvas(result.elements_inner));
    }

    this.underline = function(color, size, break_on){
        //borderBottom : size+"px "+color+" solid", boxSizing: "border-box"
        var result = create_highlight({ textDecorationColor : color,  textDecorationLine: "underline",  },break_on);
        return toImages(toCanvas(result.elements_inner));
    }
}


export { LibHighlighter }

