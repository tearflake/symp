var edit = function (node, options) {
    "use strict";
    if (!options) {
        var options = {
            font: "2em monospace",
            tabWidth: 4,
            colorCaret: "rgb(255,255,255)",
            colorText: "rgb(255,255,255)",
            colorTextBack: "rgb(0,0,0)",
            colorSelection: "rgb(0,0,0)",
            colorSelectionBack: "rgb(255,255,255)",
            readOnly: false
        }
    }
    
    var ww, hh;
    var rndid = Math.floor (Math.random () * 32767);
    var ed = document.getElementById(node);

    ed.innerHTML = 
    `
    <div id="div${rndid}" style="background-color: black; position: relative; width: inherit; height: inherit; overflow: hidden;">
        <div id="container${rndid}" style="position: relative; width: inherit; height: inherit; overflow: hidden;">
          <textarea class="cls${rndid}" id="input${rndid}" spellcheck="false" wrap="off" style="z-index: 0; width: inherit; height: inherit; border-style: none; border-radius: 0; outline: none; resize: none; box-sizing: border-box; display: block; background-color: ${options.colorTextBack}; color: ${options.colorText}; caret-color: ${options.colorCaret}; font: ${options.font}; padding: 0.2em; border:0; margin:0; position: absolute; top: 0; left: 0; overflow: hidden; /*scrollbar-color: white black*/; line-height: 100%;/*caret-shape: block;*/">
          </textarea>
          <div id="caret${rndid}" style="visibility: hidden; position: absolute; top:0; left:0; width: 3px; height: 2em; background-color: white;"></div>
          <div id="bml${rndid}" style="visibility: hidden; position: absolute; background-color: white; height 3px; overflow: hidden;"></div>
          <div id="bmr${rndid}" style="visibility: hidden; position: absolute; background-color: white; height 3px; overflow: hidden;"></div>
        </div>
        <div id="scroll${rndid}v" style="position: absolute; background-color: black; width: 0; height: 0; overflow: hidden;"><div id="slider${rndid}v" style="position: absolute; background-color: white;"></div></div>
        <div id="scroll${rndid}h" style="position: absolute; background-color: black; width: 0; height: 0; overflow: hidden;"><div id="slider${rndid}h" style="position: absolute; background-color: white;"></div></div>
    </div>
    `

    var input = document.getElementById(`input${rndid}`);
    var container = document.getElementById(`container${rndid}`);
    
    input.readOnly = options.readOnly;

    input.oncontextmenu = function (e) {
        return false;
    };

    var style=document.createElement('style');
    style.innerHTML =
    `
    .cls${rndid}::selection {
        background-color: var(--selbackcolor);
        color: var(--selcolor);
    }
    ` 
    document.head.appendChild(style);
    input.style.setProperty('--selbackcolor', options.colorSelectionBack)
    input.style.setProperty('--selcolor', options.colorSelection)
    
    container.style.width = "inherit";
    container.style.height = "inherit";
    
    function handleScroll () {
        updateCaret();
        setSliders();
    }
    
    function handleInput () {
    }

    var lastKeyType;
    var undoStack;
    var redoStack;
    
    input.onmousedown = function(e) {
        lastKeyType = "nav";
    }
    
    function handleKeyPress (e) {
        function tabRight (sel) {
            var c = sel;
            var i = c;
            while (i >= -1) {
                i--;
                if (input.value.substr (i, 1) === "\n" || i === -1) {
                    i++
                    var n = options.tabWidth - ((c - i) % options.tabWidth);

                    document.execCommand("insertText", false, " ".repeat (n));

                    for (i = c; i < input.value.length; i++)
                        if (input.value.charAt(i) === "\n")
                            return i + 1;
                            
                    return input.value.length;
                }
            }
        }
        
        function tabLeft (sel) {
            var c = sel;
            var i = c;
            while (i >= -1) {
                i--;
                if (input.value.substr (i, 1) === "\n" || i === -1) {
                    i++;

                    input.selectionStart = i;

                    for (var j = 0; j < options.tabWidth && i + j < input.value.length; j++)
                        if (" \t\v".indexOf (input.value.substr (i + j, 1)) === -1)
                            break;
                            
                    if (j > 0) {
                        input.selectionEnd = i + j;

                        document.execCommand("delete");
                    }
                    
                    input.selectionStart = (c - j > i ? c - j: i);
                    input.selectionEnd = input.selectionStart;
                    
                    for (i = c; i < input.value.length; i++)
                        if (input.value.charAt(i) === "\n")
                            return i + 1;
                            
                    return input.value.length;
                }
            }
        }

        if (e.key === "Enter") {
            e.preventDefault ();
            
            var c = input.selectionStart;
            var i = c;
            while (i >= 0) {
                i--;
                if (input.value.substr (i, 1) === "\n" || i === -1) {
                    var pre = "";
                    var j = i + 1;
                    while (j < c && j < input.value.length && " \t\v".indexOf (input.value.substr (j, 1)) > -1) {
                        pre += input.value.substr (j, 1);
                        j++;
                    }
                            
                    document.execCommand("insertText", false, '\n' + pre);
                    input.blur ();
                    input.focus ();

                    return;
                }
            }
        }
        else if (e.key === "Tab") {
            e.preventDefault ();
            
            if (input.selectionStart == input.selectionEnd) {
                if (e.shiftKey) {
                    tabLeft (input.selectionStart);
                }
                else {
                    tabRight (input.selectionStart);
                }
            }
            else {
                var lineStarts = [];
                
                for (i = input.selectionStart - 1; i >= -1; i--)
                    if (input.value.charAt(i) === "\n") {
                        lineStarts.push (i + 1);
                        break;
                    }
                    
                if (i === -1)
                    lineStarts.push (0);
                    
                for (i = input.selectionStart; i < input.selectionEnd - 1; i++)
                    if (input.value.charAt(i) === "\n")
                        lineStarts.push (i + 1);
                
                for (i = input.selectionEnd - 1; i < input.value.length; i++)
                    if (input.value.charAt(i) === "\n") {
                        lineStarts.push (i + 1);
                        break;
                    }
                
                if (i === input.value.length) {
                    var farEnd = true;
                    lineStarts.push (i);
                }

                if (e.shiftKey) {
                    var ins = "";
                    for (var i = 0; i < lineStarts.length - 1; i++) {
                        input.selectionStart = lineStarts[i];
                        input.selectionEnd = lineStarts[i + 1];
                        
                        for (var j = 0; j < options.tabWidth && lineStarts[i] + j < input.value.length; j++)
                            if (" \t\v".indexOf (input.value.substr (lineStarts[i] + j, 1)) === -1)
                                break;
                                
                        ins += input.value.substring (input.selectionStart + j, input.selectionEnd)
                    }

                    input.selectionStart = lineStarts[0];
                    input.selectionEnd = lineStarts[lineStarts.length - 1];

                    document.execCommand("insertText", false, ins);
                    
                    input.selectionStart = lineStarts[0];
                    input.selectionEnd = lineStarts[0] + ins.length;

                    if (undoStack.length > 0)
                        undoStack[undoStack.length - 1].selEnd = input.selectionEnd - 1;
                }
                else {
                    var ins = "";
                    for (var i = 0; i < lineStarts.length - 1; i++) {
                        input.selectionStart = lineStarts[i];
                        input.selectionEnd = lineStarts[i + 1];
                        ins += " ".repeat (options.tabWidth) + input.value.substring (input.selectionStart, input.selectionEnd)
                    }

                    input.selectionStart = lineStarts[0];
                    input.selectionEnd = lineStarts[lineStarts.length - 1];

                    document.execCommand("insertText", false, ins);
                    
                    input.selectionStart = lineStarts[0];
                    input.selectionEnd = lineStarts[0] + ins.length;

                    if (undoStack.length > 0)
                        undoStack[undoStack.length - 1].selEnd = input.selectionEnd - 1;
                }
            }
        }
        else if (e.key === "Home") {
            if (e.ctrlKey) {
                input.selectionStart = 0;
                input.selectionEnd = 0;
                input.blur();
                input.focus();
            }
            else {
                if (input.selectionStart === 0 || input.value.charAt (input.selectionStart - 1) === "\n") {
                    e.preventDefault ();
                    var i = input.selectionStart;
                    while (i < input.value.length && " \t\v".indexOf (input.value.charAt (i)) > -1) {
                        i++
                    }
                    
                    if (!e.shiftKey) {
                        input.selectionStart = i;
                        input.selectionEnd = i;
                    }
                    else {
                        input.selectionStart = i;
                    }
                }
            }
        } else if (e.key === "End") {
            if (e.ctrlKey) {
                input.selectionStart = input.value.length;
                input.selectionEnd = input.value.length;
                input.blur();
                input.focus();
            }
            else {
                if (input.selectionEnd === input.value.length || input.value.charAt (input.selectionEnd) === "\n") {
                    e.preventDefault ();
                    var i = input.selectionEnd;
                    while (i >= 0 && " \t\v".indexOf (input.value.charAt (i - 1)) > -1) {
                        i--
                    }
                    
                    if (!e.shiftKey) {
                        input.selectionStart = i;
                        input.selectionEnd = i;
                    }
                    else {
                        input.selectionEnd = i;
                    }
                }
            }
        } 
        else if (e.key.toLowerCase () === "z" && (e.ctrlKey || e.metaKey)) {
            //e.preventDefault ()
        }
    }

    function handleResize () {
        document.getElementById(`container${rndid}`).style.display = "none";
        document.getElementById(`scroll${rndid}v`).style.display = "none";
        document.getElementById(`scroll${rndid}h`).style.display = "none";
        setTimeout (function () {
            document.getElementById(`container${rndid}`).style.width = (document.getElementById(`div${rndid}`).offsetWidth - 12) + "px";
            document.getElementById(`container${rndid}`).style.height = (document.getElementById(`div${rndid}`).offsetHeight - 12) + "px";

            document.getElementById(`container${rndid}`).style.display = "block";

            setTimeout (function () {
                document.getElementById(`scroll${rndid}v`).style.top = 0 + "px";
                document.getElementById(`scroll${rndid}v`).style.left = (document.getElementById(`div${rndid}`).offsetWidth - 9) + "px";
                document.getElementById(`scroll${rndid}v`).style.width = 9 + "px";
                document.getElementById(`scroll${rndid}v`).style.height = document.getElementById(`container${rndid}`).style.height;

                document.getElementById(`scroll${rndid}h`).style.top = (document.getElementById(`div${rndid}`).offsetHeight - 9) + "px";
                document.getElementById(`scroll${rndid}h`).style.left = 0 + "px";
                document.getElementById(`scroll${rndid}h`).style.width = document.getElementById(`container${rndid}`).style.width;
                document.getElementById(`scroll${rndid}h`).style.height = 9 + "px";

                document.getElementById(`scroll${rndid}v`).style.display = "block";
                document.getElementById(`scroll${rndid}h`).style.display = "block";

                setTimeout (function () {
                    updateCaret();
                    setSliders();
                }, 0);
            }, 0);
        }, 0);
    }
    
    function setSliders() {
        let hght = document.getElementById(`scroll${rndid}v`).clientHeight * document.getElementById(`input${rndid}`).clientHeight / document.getElementById(`input${rndid}`).scrollHeight;
        let top = (document.getElementById(`scroll${rndid}v`).clientHeight - hght) * document.getElementById(`input${rndid}`).scrollTop / (document.getElementById(`input${rndid}`).scrollHeight - document.getElementById(`input${rndid}`).clientHeight);
        if (isNaN (top) || top < 0) top = 0;
        
        document.getElementById(`slider${rndid}v`).style.top = top + "px";
        document.getElementById(`slider${rndid}v`).style.left = "0px";
        document.getElementById(`slider${rndid}v`).style.width = "9px";
        document.getElementById(`slider${rndid}v`).style.height =  hght + "px";

        let wdth = document.getElementById(`scroll${rndid}h`).clientWidth * document.getElementById(`input${rndid}`).clientWidth / document.getElementById(`input${rndid}`).scrollWidth;
        let lft = (document.getElementById(`scroll${rndid}h`).clientWidth - wdth) * document.getElementById(`input${rndid}`).scrollLeft / (document.getElementById(`input${rndid}`).scrollWidth - document.getElementById(`input${rndid}`).clientWidth);
        if (isNaN (lft) || lft < 0) lft = 0;

        document.getElementById(`slider${rndid}h`).style.top = 0 + "px";
        document.getElementById(`slider${rndid}h`).style.left = lft + "px";
        document.getElementById(`slider${rndid}h`).style.width = wdth + "px";
        document.getElementById(`slider${rndid}h`).style.height = "9px";
    }
    
    let sliderv = {sliding: false, pos: 0};
    document.getElementById(`scroll${rndid}v`).addEventListener('pointerdown', function(e) {
        document.getElementById(`slider${rndid}v`).setPointerCapture(e.pointerId)
        sliderv.sliding = true;
        sliderv.pos = e.offsetY;
    });
    
    document.getElementById(`scroll${rndid}v`).addEventListener('pointerup', function(e) {
        document.getElementById(`slider${rndid}v`).releasePointerCapture(e.pointerId);
        sliderv.sliding = false;
        input.focus({
            preventScroll: true
        });
    });
    
    document.getElementById(`scroll${rndid}v`).addEventListener('pointermove', function(e) {
        if (sliderv.sliding) {
            input.scrollTop = (input.scrollHeight - input.clientHeight) * ((document.getElementById(`slider${rndid}v`).offsetTop + e.offsetY - sliderv.pos) / (document.getElementById(`scroll${rndid}v`).clientHeight - document.getElementById(`slider${rndid}v`).clientHeight));
        }
    });

    let sliderh = {sliding: false, pos: 0};
    document.getElementById(`scroll${rndid}h`).addEventListener('pointerdown', function(e) {
        document.getElementById(`slider${rndid}h`).setPointerCapture(e.pointerId)
        sliderh.sliding = true;
        sliderh.pos = e.offsetX;
    });
    
    document.getElementById(`scroll${rndid}h`).addEventListener('pointerup', function(e) {
        document.getElementById(`slider${rndid}h`).releasePointerCapture(e.pointerId);
        sliderh.sliding = false;
        input.focus({
            preventScroll: true
        });
    });
    
    document.getElementById(`scroll${rndid}h`).addEventListener('pointermove', function(e) {
        if (sliderh.sliding) {
            input.scrollLeft = (input.scrollWidth - input.clientWidth) * ((document.getElementById(`slider${rndid}h`).offsetLeft + e.offsetX - sliderh.pos) / (document.getElementById(`scroll${rndid}h`).clientWidth - document.getElementById(`slider${rndid}h`).clientWidth));
        }
    });

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyPress);
    input.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    input.addEventListener("mousewheel", (event) => {
        input.scrollTop = input.scrollTop + event.deltaY;
        input.scrollLeft = input.scrollLeft + event.deltaX;
        event.preventDefault();
    });

    setTimeout (function () {
        handleResize();
    }, 0);
            
    function getCharacterWidth () {
        const temp = document.createElement('span');
        temp.textContent = "m".repeat(100);
        temp.style.font = getComputedStyle(input).font;
        document.body.appendChild(temp);
        const width = temp.offsetWidth;
        document.body.removeChild(temp);

        return width / 100;
    }
    
    function getCharacterHeight() {
        const font = getComputedStyle(input).font;
        
        return parseFloat(font);
    }
    
    var caretOn = true;
    var caretVisible = true;

    function getCoords (text, offset) {
        var i, ch, row = 1, col = 1;
        if (text.length > 0)
            for (i = 0; i < offset; i += 1) {
                ch = text.charCodeAt(i);
                if (ch === 13 || ch === 10) {
                    if (ch === 13 && text.charCodeAt (i + 1) === 10)
                        i += 1;

                    row += 1;
                    col = 1;
                    
                } else
                  col += 1;
            }
        
        return {row: row, col: col};
    }

    function updateCaret () {
        let globalMagn = 1;
        var pos = getCoords(input.value, input.selectionStart);
        var l = (-input.scrollLeft + globalMagn * getCharacterWidth() * (pos.col - 1) + globalMagn * 3 + globalMagn * 3);
        var t = (-input.scrollTop + globalMagn * getCharacterHeight() * (pos.row - 1) + globalMagn * 3 + globalMagn * 3);
        
        var ww = input.clientWidth - l;
        document.getElementById(`caret${rndid}`).style.width = Math.min (globalMagn * 3, ww) + "px";
        var hh = input.clientHeight - t;
        document.getElementById(`caret${rndid}`).style.height = Math.min (globalMagn * getCharacterHeight(), hh) + "px";
        caretVisible = ((input.selectionEnd - input.selectionStart) === 0) && (ww > 0) && (hh > 0);

        if (caretVisible) {
            document.getElementById(`caret${rndid}`).style.left = l + "px";
            document.getElementById(`caret${rndid}`).style.top = t + "px";
        }
        
        if (!options.readOnly && input.value.charAt(input.selectionStart) === ")") {
            let closed = input.selectionStart;
            let i = closed;
            let b = 1;
            while (i > 0 && b > 0) {
                i--;
                if (input.value.charAt(i) === ")")
                    b++;
                
                else if (input.value.charAt(i) === "(")
                    b--;
            }

            if (b === 0) {
                let open = i;
                underlineParens (open, closed);
            }
            else {
                document.getElementById(`bml${rndid}`).style.visibility = "hidden"
                document.getElementById(`bmr${rndid}`).style.visibility = "hidden"
            }
        }
        else if (!options.readOnly && input.value.charAt(input.selectionStart - 1) === "(") {
            let open = input.selectionStart - 1;
            let i = open;
            let b = 1;
            while (i < input.value.length && b > 0) {
                i++;
                if (input.value.charAt(i) === "(")
                    b++;
                
                else if (input.value.charAt(i) === ")")
                    b--;
            }

            if (b === 0) {
                let closed = i;
                underlineParens (open, closed);
            }
            else {
                document.getElementById(`bml${rndid}`).style.visibility = "hidden"
                document.getElementById(`bmr${rndid}`).style.visibility = "hidden"
            }
        }
        else {
            document.getElementById(`bml${rndid}`).style.visibility = "hidden"
            document.getElementById(`bmr${rndid}`).style.visibility = "hidden"
        }
    }
    
    function underlineParens(open, closed) {
        var pos = getCoords(input.value, open);
        var l = (-input.scrollLeft + getCharacterWidth() * (pos.col - 1) + globalMagn * 3 + globalMagn * 3);
        var t = (-input.scrollTop + globalMagn * getCharacterHeight() * ((pos.row - 1)) + globalMagn * 3 + globalMagn * 3);
        document.getElementById(`bml${rndid}`).style.width = getCharacterWidth() + "px";
        document.getElementById(`bml${rndid}`).style.height = "3px";
        document.getElementById(`bml${rndid}`).style.left = l + "px";
        document.getElementById(`bml${rndid}`).style.top = t + globalMagn * getCharacterHeight() + "px";
        document.getElementById(`bml${rndid}`).style.visibility = "visible"

        pos = getCoords(input.value, closed);
        l = (-input.scrollLeft + getCharacterWidth() * (pos.col - 1) + globalMagn * 3 + globalMagn * 3);
        t = (-input.scrollTop + globalMagn * getCharacterHeight() * ((pos.row - 1)) + globalMagn * 3 + globalMagn * 3);
        document.getElementById(`bmr${rndid}`).style.width = getCharacterWidth() + "px";
        document.getElementById(`bmr${rndid}`).style.height = "3px";
        document.getElementById(`bmr${rndid}`).style.left = l + "px";
        document.getElementById(`bmr${rndid}`).style.top = t + globalMagn * getCharacterHeight() + "px";
        document.getElementById(`bmr${rndid}`).style.visibility = "visible"
    }

    document.addEventListener('selectionchange', function(e) {
        updateCaret();
        
        if (myFocus) {
            clearInterval(myTimer);
            caretOn = true;
            myFn();
            myTimer = setInterval(myFn, 500);
        }
    });
    
    input.addEventListener("keyup", (event) => {
        updateCaret();
        setSliders();
    });

    var myFocus;
    var myTimer;
    var myFn = () => {
        document.getElementById(`caret${rndid}`).style.visibility = caretOn && caretVisible && !options.readOnly ? "visible" : "hidden";
        caretOn = !caretOn;
    }
    
    input.addEventListener("scroll", (event) => {
        updateCaret();
    });
    
    input.addEventListener("focusin", (event) => {
        myFocus = true;
        caretOn = true;
        myFn();
        myTimer = setInterval(myFn, 500);
    });

    input.addEventListener("focusout", (event) => {
        myFocus = false;
        clearInterval(myTimer);
        caretOn = false;
        myFn();
    });
    
    input.value = "";
    undoStack = [];
    redoStack = [];
    lastKeyType = "nav";

    window.addEventListener('resize', function () {
/*
*/
    });

    return {
        getValue: function () {
            return input.value;
        },
        setValue: function (value) {
            input.value = value;
            input.scrollTop = 0;
            input.selectionStart = 0;
            input.selectionEnd = 0;
            undoStack = [];
            redoStack = [];
            lastKeyType = "nav";
            updateCaret();
            setSliders();
        },
        getSelectionStart () {
            return input.selectionStart;
        },
        getSelectionEnd () {
            return input.selectionEnd;
        },
        setSelectionStart (v) {
            input.selectionStart = v;
        },
        setSelectionEnd (v) {
            input.selectionEnd = v;
        },
        setFocus: function () {
            input.focus ();
        },
        setScrollTop: function (x) {
            input.scrollTop = x;
        },
        getTextArea: function() {
            return input;
        }
    }
}

