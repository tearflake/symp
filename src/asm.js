// asm.js
// (c) tearflake, 2026
// MIT License

var Asm = (
    function (obj) {
        return {
            parseSExpr: obj.parseSExpr,
            run: obj.run,
            exec: obj.exec
        };
    }
) (
    (function () {
        "use strict";
        function parseSExpr (sProgram) {
            let syntax = `
                (GRAMMAR
                    (RULE START grammar)

                    (RULE grammar
                        (LIST "ASM" cArgs))

                    (RULE cArgs
                        (LIST args cVars))
                    
                    (RULE cArgs cVars)

                    (RULE args
                        (LIST "ARGS" plusArg))

                    (RULE plusArg
                        (LIST ATOMIC plusArg))
                    
                    (RULE plusArg
                        (LIST ATOMIC
                            ()))
                    
                    (RULE cVars
                        (LIST vars cInstr))
                    
                    (RULE cVars cInstr)
                    
                    (RULE vars
                        (LIST "VARS" plusVar))

                    (RULE plusVar
                        (LIST ATOMIC plusVar))
                    
                    (RULE plusVar
                        (LIST ATOMIC
                            ()))

                    (RULE cInstr
                        (LIST instr cInstr))
                    
                    (RULE cInstr
                        (LIST instr
                            ()))

                    (RULE instr
                        (LIST "LABEL"
                            (LIST ATOMIC
                                ())))
                    
                    (RULE instr
                        (LIST "ASGN"
                            (LIST ATOMIC
                                (LIST expr
                                    ()))))
                    
                    (RULE instr
                        (LIST "JMPNE"
                            (LIST expr
                                (LIST expr
                                    (LIST ATOMIC
                                        ())))))
                    
                    (RULE instr
                        (LIST "JMPEQ"
                            (LIST expr
                                (LIST expr
                                    (LIST ATOMIC
                                        ())))))
                    
                    (RULE instr
                        (LIST "JMP"
                            (LIST ATOMIC
                                ())))
                    
                    (RULE instr
                        (LIST "RETURN"
                            (LIST expr
                                ())))
                    
                    (RULE instr "RETURN")
                    
                    (RULE instr call)
                    
                    (RULE call
                        (LIST "CALL"
                            (LIST expr
                                timesExpr)))
                    
                    (RULE expr ATOMIC)
                    
                    (RULE expr
                        (LIST "LIST" timesExpr))
                    
                    (RULE expr call)
                    
                    (RULE timesExpr
                        (LIST expr timesExpr))
                    
                    (RULE timesExpr ())
                )
            `;
            
            let sSyntax = SExpr.parse (syntax);
            
            let ast = Parser.parseSExpr (sProgram, sSyntax);
            
            if (!ast.err) {
                return makeTree(/*parseLiterals (*/SExpr.removeComments (ast)/*)*/);
            }
            else {
                return ast;
            }
        }
        
        function makeTree (sexpr) {
            let graph = {kind: "ASM", args: [], vars: [], labels: {}, instrs: []};
            let prog = sexpr;
            let off = 0;
            for (let i = 1; i < prog.length; i++) {
                let elem = prog[i];
                if (elem[0] === "ARGS") {
                    for (let j = 1; j < elem.length; j++) {
                        if (!isIdentifier (elem[j])) {
                            return {err: "Unexpected literal", path: [i, j]}
                        }
                        
                        graph.args.push (elem[j]);
                    }
                    off++;
                }
                else if (elem[0] === "VARS") {
                    for (let j = 1; j < elem.length; j++) {
                        if (graph.args.indexOf (elem[j]) === -1) {
                            if (!isIdentifier (elem[j])) {
                                return {err: "Unexpected literal", path: [i, j]}
                            }
                            
                            graph.vars.push (elem[j]);
                        }
                        else {
                            console.log (`WARNING: variable '${elem[j]}' occurs in args`);
                        }
                    }
                    off++;
                }
                else if (elem[0] === "LABEL") {
                    if (isAvailable (graph.labels, elem[1])) {
                        graph.labels[elem[1]] = i - 1 - off;
                    }
                    else {
                        console.log (`WARNING: label '${elem[1]}' not available`);
                    }
                    
                    graph.instrs.push ({kind: "LABEL", label: elem[1], line: i - 1 - off});
                }
                else if (elem[0] === "CALL") {
                    let c = makeExpr (elem[1]);
                    if (c.err) {
                        c.path = [1, ...c.path];
                        return c;
                    }
                    
                    let a = [];
                    for (let i = 2; i < elem.length; i++) {
                        let ae = makeExpr(elem[i]);
                        if (ae.err) {
                            ae.path = [i, ...ae.path];
                            return aelem;
                        }
                        
                        a.push (ae)
                    }
                
                    graph.instrs.push ({kind: "CALL", type: "STMT", calling: c, args: a});
                }
                else if (elem[0] === "ASGN") {
                    let e = [];
                    for (let i = 1; i <= 2; i++) {
                        e[i] = makeExpr (elem[i]);
                        if (e[i].err) {
                            e[i].path = [i, ...e[i].path];
                            return e[i];
                        }
                    }
                    
                    graph.instrs.push ({kind: "ASGN", var: e[1], value: e[2]});
                }
                else if (elem[0] === "JMPNE") {
                    let e = [];
                    for (let i = 1; i <= 2; i++) {
                        e[i] = makeExpr (elem[i]);
                        if (e[i].err) {
                            e[i].path = [i, ...e[i].path];
                            return e[i];
                        }
                    }
                    
                    graph.instrs.push ({kind: "JMPNE", e1: e[1], e2: e[2], label: elem[3]});
                }
                else if (elem[0] === "JMPEQ") {
                    let e = [];
                    for (let i = 1; i <= 2; i++) {
                        e[i] = makeExpr (elem[i]);
                        if (e[i].err) {
                            e[i].path = [i, ...e[i].path];
                            return e[i];
                        }
                    }
                    
                    graph.instrs.push ({kind: "JMPEQ", e1: e[1], e2: e[2], label: elem[3]});
                }
                else if (elem[0] === "JMP") {
                    graph.instrs.push ({kind: "JMP", label: elem[1]});
                }
                else if (elem[0] === "RETURN") {
                    let e = [];
                    let i = 1;
                    e[i] = makeExpr (elem[i]);
                    if (e[i].err) {
                        e[i].path = [i, ...e[i].path];
                        return e[i];
                    }
                    
                    graph.instrs.push ({kind: "RETURN", value: e[1]});
                }
                else if (elem === "RETURN") {
                    graph.instrs.push ({kind: "RETURN", value: null});
                }
            }
            
            return graph;
        }
        
        function makeExpr (sexpr) {
            if (Array.isArray (sexpr)) {
                if (sexpr[0] === "LIST") {
                    let args = [];
                    for (let i = 1; i < sexpr.length; i++) {
                        let elem = makeExpr(sexpr[i]);
                        if (elem.err) {
                            elem.path = [i, ...elem.path];
                            return elem;
                        }
                        
                        args.push (elem)
                    }
                    
                    return {kind: "LIST", args: args};
                }
                else if (sexpr[0] === "CALL") {
                    let calling = makeExpr (sexpr[1]);
                    if (calling.err) {
                        calling.path = [1, ...calling.path];
                        return calling;
                    }
                    
                    let args = [];
                    for (let i = 2; i < sexpr.length; i++) {
                        let elem = makeExpr(sexpr[i]);
                        if (elem.err) {
                            elem.path = [i, ...elem.path];
                            return elem;
                        }
                        
                        args.push (elem)
                    }
                    
                    return {kind: "CALL", type: "EXPR", calling: calling, args: args};
                }
                else {
                    return {err: "Syntax error", path: []}
                }
            }
            else {
                if (!Number.isNaN(Number(sexpr))) {
                    return Number(sexpr);
                }
                else if (sexpr === "TRUE") {
                    return true;
                }
                else if(sexpr === "FALSE") {
                    return false;
                }
                else if(sexpr === "NIL") {
                    return null;
                }
                else if (!isIdentifier (sexpr)) {
                    return sexpr;
                }
                else {
                    return {kind: "VAR", name: sexpr};
                }
            }
        }

        function isAvailable (binder, binding){
            return (!binder[binding] && !Object.prototype.hasOwnProperty.call(binder, binding))
        }
        /*
        function parseLiterals (expr) {
            if (!Array.isArray(expr)) {
                if (!Number.isNaN(Number(expr))) {
                    return Number(expr);
                }
                else if (expr === "TRUE") {
                    return true;
                }
                else if(expr === "FALSE") {
                    return false;
                }
                else if(expr === "NIL") {
                    return null;
                }
                else {
                    return expr;
                }
            }
            else {
                return expr.map (e => parseLiterals (e));
            }
        }
        */
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
        
        function run(module, prog, args, rootModule) {
            let code = module.pub[prog];
            if (!code) {
                code = module.priv[prog];
            }
            
            if (args.length !== code.args.length) {
                throw new Error(`Argument count for '${prog}' not matching`);
            }
            
            let env = {};
            code.vars.forEach (v => {env[v] = null});
            let ai = 0;
            code.args.forEach (a => {env[a] = args[ai++];});

            let idx = 0
            while (idx < code.instrs.length) {
                let instr = code.instrs[idx];
                if (instr.kind == "CALL") {
                    evalSExpr(["CALL", ...instr.expr], env, module, module, rootModule);
                }
                else if (instr.kind == "ASGN") {
                    //if (code.vars.indexOf (instr.var) === -1 && code.args.indexOf (instr.var) === -1) {
                    if (!Object.hasOwn (env, instr.var)) {
                        throw new Error(`Undeclared variable or argument '${instr.var}'`);
                    }
                    
                    env[instr.var] = evalSExpr(instr.value, env, module, module, rootModule);
                }
                else if (instr.kind == "JMPNE") {
                    let e1 = evalSExpr(instr.e1, env, module, module);
                    let e2 = evalSExpr(instr.e2, env, module, module);
                    if (e1 !== e2) {
                        if (!Object.hasOwn(code.labels, instr.label)) {
                            throw new Error(`Nonexisting label '${instr.label}'`);
                        }
                        
                        idx = code.labels[instr.label];
                    }
                }
                else if (instr.kind == "JMPEQ") {
                    let e1 = evalSExpr(instr.e1, env, module, module, rootModule);
                    let e2 = evalSExpr(instr.e2, env, module, module, rootModule);
                    if (e1 === e2) {
                        if (!Object.hasOwn(code.labels, instr.label)) {
                            throw new Error(`Nonexisting label '${instr.label}'`);
                        }
                        
                        idx = code.labels[instr.label];
                    }
                }
                else if (instr.kind == "JMP") {
                    if (!Object.hasOwn(code.labels, instr.label)) {
                        throw new Error(`Nonexisting label '${instr.label}'`);
                    }
                    
                    idx = code.labels[instr.label];
                }
                else if (instr.kind == "RETURN") {
                    return evalSExpr(instr.value, env, module, module, rootModule)
                }
                
                idx++;
            }

            return null;
        }
        
        function exec (expr, env, module, rootModule) {
            return evalSExpr (parseLiterals (expr), env, module, module, rootModule);
        }
        
        function getFn (expr, module, rootModule) {
            let processed = false;
            let splfn = expr.split ("/");
            let path = [...splfn];
            while (splfn.length > 1) {
                let mod = splfn.shift ();
                if (mod === "") {
                    module = rootModule;
                }
                else if (module.children[mod]) {
                    module = module.children[mod];
                    processed = true
                }
                else {
                    if (!processed && path[0] === "stdlib" && path.length >= 2) {
                        let fn = path.pop ();
                        if (path.length === 1) {
                            return [path, fn, "stdlib"];
                        }
                        
                        return [path, fn, null];
                    }
                    path.pop ();
                    return [path, splfn.pop (), null];
                }
            }
            
            return[path, splfn.pop (), module]
        }
        
        function evalSExpr (expr, env, module, curModule, rootModule) {
            if (!rootModule) {
                rootModule = module;
            }
            
            if (!Array.isArray (expr)) {
                if (Object.hasOwn(env, expr)) {
                    return env[expr];
                }
                else if (isIdentifier(expr)) {
                    let fn, path, tgtModule;
                    [path, fn, tgtModule] = getFn (expr, module, rootModule);
                    if (tgtModule && tgtModule !== "stdlib" && (Object.hasOwn(tgtModule.pub, fn) || (tgtModule === curModule && Object.hasOwn(tgtModule.priv, fn)))) {
                        return {kind: "PROG", module: tgtModule, prog: fn};
                    }
                }
                
                return expr;
            }
            else if (expr[0] === "CALL") {
                let fn = evalSExpr(expr[1], env, module, curModule, rootModule);
                let args = expr.slice(2).map(e => evalSExpr(e, env, module, curModule, rootModule));
                if (fn.kind == "PROG") {
                    return evalSExpr (Main.call (fn.module, fn.prog, args), env, fn.module, fn.module, rootModule);
                }
                else {
                    let path = fn.split ("/");
                    if (path.length === 2 && path[0] === "stdlib" && STDLIB[path[1]]) {
                        return evalSExpr (STDLIB[path[1]] ([fn, ...args]), env, module, curModule, rootModule);
                    }
                }
                
                throw new Error(`Program '${fn}' does not exists`);
            }
            
            return expr.map(e => evalSExpr(e, env, module, curModule, rootModule));
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
            parseSExpr: parseSExpr,
            run: run,
            exec: exec
        }
    }) ()
);

var isNode = new Function ("try {return this===global;}catch(e){return false;}");

if (isNode ()) {
    // begin of Node.js support
    
    var SExpr = require ("./s-expr.js");
    var Parser = require ("./parser.js");
    module.exports = Asm;
    
    // end of Node.js support
}

