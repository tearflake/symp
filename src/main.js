// main.js
// (c) tearflake, 2026
// MIT License

var Main = (
    function (obj) {
        return {
            parse: obj.parse,
            call: obj.call,
            main: obj.main
        };
    }
) (
    (function () {
        "use strict";
        
        function parse (program) {
            let syntax = `
                (GRAMMAR
                    (RULE START dir)

                    (RULE dir
                        (LIST "DIR"
                            (LIST ATOMIC
                                items)))

                    (RULE items
                        (LIST item items))

                    (RULE items ())
                    
                    (RULE item
                        (LIST "FILE"
                            (LIST ATOMIC
                                (LIST ANY ()))))

                    (RULE item
                        (LIST "LINK"
                            (LIST ATOMIC
                                (LIST ATOMIC ()))))

                    (RULE item dir)
                )
            `;
            
            let sSyntax = SExpr.parse (syntax);
            let sProgram = SExpr.parse (program);
            
            if (sProgram.err) {
                return sProgram;
            }
            
            let ast = Parser.parse (program, sSyntax);
            
            if (!ast.err) {
                let graph = makeTree(SExpr.removeComments (ast));
                if (!graph.err) {
                    return graph;
                }
                else {
                    let msg = SExpr.getPosition (program, skipComments (graph.path, ast));
                    return {err: graph.err === "ERROR"? msg.err : graph.err, found: msg.found, pos: msg.pos, path: graph.path};
                }
            }
            else {
                return ast;
            }
        }
        
        function makeTree (sexpr) {
            let graph = {kind: "DIR", name: sexpr[1], items: {}};
            for (let i = 2; i < sexpr.length; i++) {
                let elem = sexpr[i];
                if (elem[0] === "DIR") {
                    if (isAvailable (graph.items, elem[1])) {
                        let maked = makeTree(elem);
                        if(!maked.err) {
                            graph.items[elem[1]] = maked;
                        }
                        else {
                            return {err: maked.err, path: [i, ...maked.path]};
                        }
                    }
                }
                if (elem[0] === "FILE") {
                    if (isAvailable (graph.items, elem[1])) {
                        if (elem[2][0] === "ASM") {
                            let parsed = Asm.parseSExpr (elem[2]);
                            if (!parsed.err) {
                                graph.items[elem[1]] = {kind: "FILE", value: parsed}
                            }
                            else {
                                return {err: parsed.err, path: [i, 2, ...parsed.path]};
                            }                            
                        }
                        else {
                            graph.items[elem[1]] = {kind: "FILE", value: elem[2]};
                        }
                    }
                }
                if (elem[0] === "LINK") {
                    if (isAvailable (graph.items, elem[1])) {
                        if (typeof elem[2] === "string") {
                            graph.items[elem[1]] = {kind: "LINK", path: elem[2]};
                        }
                        else {
                            return {err: maked.err, path: [i, 2]};
                        }
                    }
                }
            }
            
            return graph;
        }
        
        function isAvailable (binder, binding){
            return (!binder[binding] && !Object.hasOwn(binder, binding))
        }
        
        function getAsmOrData(expr) {
            if (expr[0] == "ASM") {
                return Asm.parseSExpr(expr)
            }
            else {
                return expr;
            }
        }
        
        let skipComments = function (path, sexpr) {
            let result = [...path];
            let ts = sexpr;
            for (let i = 0; i < path.length; i++) {
                if (ts[result[i]]){
                    for (let j = 0; j <= result[i]; j++) {
                        if (ts[j] && ts[j][0] == "**") {
                            result[i]++;
                        }
                    }
                    
                    ts = ts[result[i]];
                }
            }
            
            return result;
        }
        
        function main(args, root) {
            if (!root.items[`"main"`] || (root.items[`"main"`] && root.items[`"main"`].kind === "DIR")) {
                return {err: `Procedure 'main' not member of the root directory`, found: 0, pos: {y: 0, x: 0}, path: []};
            }
            /*
            return evalExpr({
                kind: "CALL",
                type: "STMT",
                calling: BUILTINS["cfile"].apply(["main"], root, root)
                args: args
            }, root, root);
            */
            return root;
        }

        function call(module, prog, args, rootModule) {
            if (!module.pub[prog] && !module.priv[prog]) {
                throw new Error(`Undefined function '${prog}'`);
            }
            
            let runnable = false;
            if (Object.hasOwn(module.pub, prog)){
                runnable = (module.pub[prog].kind === "ASM");
            }
            else if (Object.hasOwn(module.priv, prog)){
                runnable = (module.priv[prog].kind === "ASM");
            }
            
            if (runnable) {
                return Asm.run(module, prog, args, rootModule);
            }
            else {
                if (args.length > 0) {
                    throw new Error(`Unexpected arguments`);
                }
                
                if (Object.hasOwn(module.pub, prog)) {
                    return module.pub[prog]
                }
                else if (Object.hasOwn(module.priv, prog)) {
                    return module.priv[prog]
                }
                
                throw new Error(`Internal error 1`);
            }
        }

        function isIdentifier(expr) {
            return (
                typeof expr === 'string' &&
                (expr.charAt (0) !== '"' && expr.charAt (expr.length - 1) !== '"') &&
                Number.isNaN(Number(expr)) &&
                (expr !== "true" && expr !== "false") &&
                (Number.isNaN(Number(expr.charAt(0))))
            );
        }

        return {
            parse: parse,
            call: call,
            main: main
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    var SExpr = require ("./s-expr.js");
    var Parser = require ("./parser.js");
    var Asm = require ("./asm.js");
    var Builtins = require ("./builtins.js");
    module.exports = Main;
    
    // end of Node.js support
}

