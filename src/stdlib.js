const quoteHelper = {
  unquote(expr) {
    let count = 0;
    while(expr.charAt(count) === '"')
      count++;
    
    if (count === expr.length) count = count / 2;
    
    return expr.substring (count, expr.length - count);
  },

  quote(expr) {
    return '"' + expr + '"';
  }
}

const STDLIB = {
  /*
  TYPE RELATED FUNCTIONS
  */
  
  isatomic(expr) {
    return !Array.isArray(expr[1]);
  },

  islist(expr) {
    return Array.isArray(expr);
  },

  isstring(expr) {
    return (typeof expr === 'string' && expr.charAt (0) === '"' && expr.charAt (expr.length - 1) === '"');
  },

  isnumber(expr) {
    return (typeof xepr === 'number');
  },

  isboolean(expr) {
    return (typeof expr === 'boolean');
  },
    
  tokenize (expr) {
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
  },

  /*
  LIST FUNCTIONS
  */
  
  // (nth list num) -> elem
  nth(args) {
    if (
      args.length !== 3 ||
      !Array.isArray(args[1]) ||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");
    
    if(args[1] === null || args[1].length <= args[2])
      throw new Error("'nth' on nonexisting index");
    else
      return args[1][args[2]];
  },
  
  // (replnth list num elem) -> elem
  replnth(args) {
    if (
      args.length !== 4 ||
      !Array.isArray(args[1]) ||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");
    
    if(args[1] === null || args[1].length <= args[2])
      throw new Error("'replnth' on nonexisting index");
    else {
      let result = [...args[1]];
      result[args[2]] = args[3]
      return result;
      //args[1][args[2]] = args[3];
      //return args[1];
    }
  },
  
  // (prepend elem lst) -> list
  prepend(args) {
    if (
      args.length !== 3 ||
      (!Array.isArray(args[2]) && args[2] !== null)
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");
    
    if(args[2] === null)
      return [args[1]];
    else
      //args[2].unshift(args[1])
      //return args[2];//[args[1], ...args[2]];
      return [args[1], ...args[2]];
  },
  
  // (append elem lst) -> list
  append(args) {
    if (
      args.length !== 3 ||
      !Array.isArray(args[1])
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    if(args[2] === null)
      return [args[1]];
    else
      //args[1].push(args[2]);
      //return args[1];
      return [...args[1], args[2]];
  },
  
  // (concat lst lst) -> lst
  concat(args) {
    if (
      args.length !== 3 ||
      !Array.isArray(args[1]) ||
      !Array.isArray(args[2])
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");
    
    args[2].map(e => {args[1].push(e)});
    return args[1].concat(args[2]);//[...args[1], ...args[2]];
  },
  
  // (first lst) -> elem
  first(args) {
    if (
      args.length !== 2 ||
      !Array.isArray(args[1])
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    if(args[1] === null || args[1].length === 0)
        throw new Error("'first' on empty list");
    else
        return args[1][0];
  },
  
  // (rest lst) -> list
  rest(args) {
    if (
      args.length !== 2 ||
      !Array.isArray(args[1])
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    if(args[1] === null || args[1].length === 0)
        throw new Error("'rest' on empty list");
    else if(args[1].length === 1)
        return null;
    else
      //args[1].splice(0, 1);
      //return args[1];
      return args[1].slice(1);
  },
  
  // (lstlen lst) -> num
  lstlen(args) {
    if (
      args.length !== 2 ||
      !Array.isArray(args[1])
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    if(args[1] === null)
        return 0;
    else
      return args[1].length;
  },

  /*
  STRING FUNCTIONS
  */

  // (strlen str) -> num
  strlen(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'string'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return quoteHelper.unquote(args[1]).length;
  },

  // (strcat str str) -> str
  strcat(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'string'||
      typeof args[2] !== 'string'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return quoteHelper.quote("" + quoteHelper.unquote(args[1]) + quoteHelper.unquote(args[2]));
  },

  // (charat str num) -> str
  charat(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'string'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return quoteHelper.unquote(args[1]).charAt(args[2]);
  },

  // (substr str num num) -> str
  substr(args) {
    if (
      args.length !== 4 ||
      typeof args[1] !== 'string'||
      typeof args[2] !== 'number' ||
      typeof args[3] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return quoteHelper.quote(quoteHelper.unquote(args[1]).substring(args[2], args[3]));
  },
  
  // (strcmp str str) -> num
  strcmp(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'string'||
      typeof args[2] !== 'string'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    if (args[1] < args[2])
      return -1;
    else if (args[1] > args[2])
      return 1;
    else
      return 0;
  },

  /*
  NUMBER FUNCTIONS
  */
  
  // (add num num) -> num
  add(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return args[1] + args[2];
  },
  
  // (add num num) -> num
  sub(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return args[1] - args[2];
  },
  
  // (mul num num) -> num
  mul(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return args[1] * args[2];
  },
  
  // (div num num) -> num
  div(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return args[1] / args[2];
  },
  
  // (pow num num) -> num
  pow(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return Math.pow(args[1], args[2]);
  },
  
  // (log num) -> num
  log(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return Math.log(args[1]);
  },
  
  // (mod num num) -> num
  mod(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return args[1] % args[2];
  },
  
  // (sin num) -> num
  sin(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return Math.sin(args[1]);
  },
  
  // (cos num) -> num
  cos(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return Math.cos(args[1]);
  },

  // (add num num) -> num
  int(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return Math.floor(args[1]);
  },
  
  // (leq num num) -> bool
  leq(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'number'||
      typeof args[2] !== 'number'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return (args[1] <= args[2]);
  },
  
  /*
  BOOLEAN FUNCTIONS
  */
  
  // (and bool bool) -> bool
  and(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'boolean'||
      typeof args[2] !== 'boolean'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return (args[1] && args[2]);
  },

  // (or bool bool) -> bool
  or(args) {
    if (
      args.length !== 3 ||
      typeof args[1] !== 'boolean'||
      typeof args[2] !== 'boolean'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return (args[1] || args[2]);
  },

  // (not bool) -> bool
  not(args) {
    if (
      args.length !== 2 ||
      typeof args[1] !== 'boolean'
    )
      throw new Error ("Parameters not valid at calling " + "'" + args[0] + "'");

    return !args[1];
  }
};

