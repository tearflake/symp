# Symp Introduction

Symp is a lightweight symbolic programming language whose primary abstraction is a mutable virtual filesystem. Programs, data, and references are represented uniformly as filesystem objects, enabling dynamic compilation, modular organization, and symbolic computation within a single execution model.

## 1. About Symp

Symp is a symbolic programming language built around the idea that programs should inhabit the same space as the data they manipulate. Rather than separating source files, modules, configuration, and runtime resources into distinct concepts, Symp represents all of them as nodes within a mutable virtual filesystem. Programs are compiled directly from files in this filesystem, may reference neighboring files through relative paths, and may freely inspect and modify the filesystem during execution.

The language is intentionally small. It provides only a handful of primitive expression types, explicit control-flow instructions, and a collection of builtin procedures for interacting with the virtual filesystem. Despite this minimal core, the combination of symbolic data structures, recursive procedures, and mutable directories allows larger systems to be assembled from small, composable components.

This document first introduces the theoretical foundations of Symp and its execution model. It then presents the concrete syntax and semantics of the language before demonstrating its use through a collection of progressively more advanced examples.

## 2. Theoretical Background

The central abstraction in Symp is the virtual filesystem. Every program executes within a directory hierarchy consisting of directories, data files, and symbolic links. Source code is stored as ordinary data files and becomes executable only after being compiled. Since compiled procedures remember the directory from which they originated, programs naturally execute relative to their own location, allowing software to be organized into reusable directory hierarchies.

Unlike conventional languages, Symp does not distinguish sharply between code and data. Programs are values that may be compiled, stored in variables, passed as arguments, and invoked dynamically. Likewise, lists, literals, and procedures all belong to the same symbolic expression system. This uniform representation simplifies both the language semantics and metaprogramming.

Execution follows a straightforward procedural model. Each procedure owns a local environment containing its arguments and variables. Instructions are executed sequentially unless modified by explicit jump operations. Procedures communicate exclusively through argument passing and return values, while persistent state is maintained inside the virtual filesystem.

### 2.1. Formal Syntax

The filesystem itself is represented as a tree of directories containing named files. Each directory may contain arbitrary numbers of data files, symbolic links, and nested directories. Data files store arbitrary strings, while links store paths pointing to other filesystem objects.

The following grammar describes the serialized representation of a filesystem hierarchy.

```
<start> := <dir>

<dir> := (DIR <item>+)

<item> := (DATA <string> <string>)
        | (LINK <string> <string>)
        | <dir>
```

Programs are themselves stored as textual data files using a symbolic S-expression syntax. A program consists of optional argument and variable declarations followed by a sequence of instructions executed from top to bottom. Expressions may consist of literals, variables, lists, or procedure calls.

```
<start> := (PRG (ARGS <identifier>+)? (VARS <identifier>+)? <instr>+)

<instr> := (LABEL <identifier>)
         | (ASGN <identifier> <expr>)
         | (JMP <identifier>)
         | (JMPNE <expr> <expr> <identifier>)
         | (JMPEQ <expr> <expr> <identifier>)
         | (RETURN <expr>)
         | <call>

<call> := (CALL <expr> <expr>*)

<expr> := <identifier>
        | <literal>
        | (LIST <expr>*)
        | <call>
```

The S-expression notation is chosen primarily because it mirrors the internal representation used by the interpreter. Programs therefore require almost no syntactic transformation before execution, making the language particularly suitable for symbolic manipulation and program generation.

### 2.2. Informal Semantics

Program execution begins by compiling a designated entry procedure and invoking it with the supplied arguments. Each invocation creates a fresh local environment containing the declared arguments and variables. Arguments are initialized from the caller, whereas variables are initially undefined and must be assigned before they are read.

Expressions are evaluated recursively. Literal values evaluate to themselves, variables resolve to their bound values, lists evaluate each of their elements, and procedure calls invoke either user-defined procedures or builtin operations. Procedures may therefore appear anywhere an expression is expected, enabling higher-order programming.

Instruction execution is imperative. Assignments modify local variables, procedure calls execute for their side effects or returned values, and jump instructions alter the instruction pointer according to comparisons between evaluated expressions. Labels serve solely as jump destinations and have no effect during normal sequential execution.

All persistent state resides within the virtual filesystem. Builtin procedures provide operations for creating, deleting, reading, writing, and traversing filesystem objects. Since procedures retain the directory in which they were compiled, relative path resolution remains stable regardless of where a procedure is invoked.

## 3. Practical Examples

The following examples introduce the language through a series of increasingly sophisticated programs. Each example focuses on a single concept while building upon the mechanisms introduced previously. Together they illustrate how symbolic expressions, procedure calls, recursion, and filesystem organization combine to form practical Symp programs.

### Arguments and Variables

Every procedure may declare a list of formal arguments and a collection of local variables. Arguments receive their values from the caller when the procedure is invoked, whereas variables provide mutable storage local to a single execution of the procedure.

In this example, the procedure `FritFrut` accepts a single argument, constructs a list containing two constant strings surrounding that argument, stores the resulting list in a local variable, and finally returns it to the caller.

**Program:**

```
(DIR "Args and vars"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "FritFrut") 
          "and")))
    """)
  
  (DATA "FritFrut"
    """
    (PRG
      (ARGS a)
      (VARS x)
      
      (ASGN
        x
        (LIST "Frit" a "Frut"))
      
      (RETURN x))
    """))
```

**Output:**

```
("Frit" "and" "Frut")
```

### Control Flow

Procedures execute sequentially unless the instruction pointer is redirected by an explicit jump instruction. Conditional jumps compare two evaluated expressions and transfer execution to a labeled instruction only when the comparison succeeds. This mechanism forms the basis for implementing conditional logic.

The following procedure distinguishes between two possible input values and returns a different result for each. Any other input reaches the default branch, demonstrating how conditional jumps may be combined to express multi-way branching.

**Program:**

```
(DIR "Control flow"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "FooBar")
          "foo")))
    """)

  (DATA "FooBar"
    """
    (PRG
      (ARGS a)
      (VARS result)
      
      (JMPNE a "foo" l1)
      (ASGN result "alpha")
      (JMP end)
      
      (LABEL l1)
      (JMPNE a "bar" l2)
      (ASGN result "beta")
      (JMP end)

      (LABEL l2)
      (ASGN result "unknown")
      
      (LABEL end)
      (RETURN result))
    """))
```

**Output:**

```
"alpha"
```

### Loops

Although Symp does not provide dedicated looping constructs, iteration is easily expressed through labels and unconditional jumps. A procedure repeatedly executes a block of instructions until a terminating condition redirects control to the exit label.

This example traverses a symbolic list element by element. The procedure repeatedly extracts the head of the input list, prepends it to an accumulator, advances to the remaining tail, and repeats until the terminating marker is encountered. The resulting accumulator therefore contains the elements in reverse order.

**Program:**

```
(DIR "Loops"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "ReverseList")
          (LIST 1 2 3 4))))
    """)

  (DATA "ReverseList"
    """
    (PRG
      (ARGS input)
      (VARS h t acc)
      
      (ASGN acc ())
      
      (LABEL loop)
      (JMPEQ (CALL head input) NIL done)
      (ASGN h (CALL head input))
      (ASGN t (CALL tail input))
      (ASGN acc (CALL cons h acc))
      (ASGN input t)
      (JMP loop)
      
      (LABEL done)
      (RETURN acc))
    """))
```

**Otuput:**

```
(List 4 3 2 1)
```

### Recursion

Since procedures are ordinary values, they may compile and invoke themselves recursively. Recursive procedures are often a natural way to process hierarchical symbolic data, particularly tree-like structures.

The following example recursively transforms a linear sequence of control symbols into a complete binary tree. Each recursive invocation consumes one element of the input sequence until the terminating symbol is encountered, at which point a leaf node is produced. Every non-terminal invocation constructs a tree node whose two children are themselves produced recursively.

**Program:**

```
(DIR "Recursion"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "Tree")
          (LIST
            "branch"
            "branch"
            "branch"
            "halt"))))
    """)

  (DATA "Tree"
    """
    (PRG
      (ARGS n)
      (VARS tree)
      
      (ASGN tree (CALL complf "Tree"))
      
      (JMPEQ
        (head n)
        "halt"
        done)
      
      (RETURN
        (LIST
          "tree"
          (CALL tree
            (CALL tail n))
          
          (CALL tree
            (CALL tail n))))
      
      (LABEL done)
      (RETURN "leaf"))
    """))
```

**Output:**

```
(LIST
    "tree"
    (LIST
        "tree"
        (LIST "tree" "leaf" "leaf")
        (LIST "tree" "leaf" "leaf"))
    
    (LIST
        "tree"
        (LIST "tree" "leaf" "leaf")
        (LIST "tree" "leaf" "leaf")))
```

### Process Interaction

Independent procedures may cooperate simply by compiling and invoking one another. Because procedures are loaded dynamically from the virtual filesystem, mutually recursive definitions require no special language support beyond ordinary procedure calls.

The following example implements mutually recursive predicates for determining whether a unary natural number is even or odd. Rather than containing the entire algorithm within a single procedure, the computation alternates between `IsEven` and `IsOdd`, each delegating the remaining work to the other until the base case is reached.

**Program:**

```
(DIR "Process interaction"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "IsEven")
          (LIST
            "succ"
            "succ"
            "zero"))))
    """)

  (DATA "IsEven"
    """
    (PRG
      (ARGS arg)
      (VARS isOdd)
      
      (LABEL even)
      (JMPNE
        (CALL head arg)
        "zero"
        odd)
      
      (RETURN TRUE)
      
      (LABEL odd)
      (ASGN isOdd (CALL complf "IsOdd"))
      (RETURN
        (CALL isOdd
          (CALL tail arg))))
    """)
  
  (DATA "IsOdd"
    """
    (PRG
      (ARGS arg)
      (VARS isEven)
      
      (LABEL odd)
      (JMPNE
        (CALL head arg)
        "zero"
        even)
      
      (RETURN FALSE)
      
      (LABEL even)
      (ASGN isEven (CALL complf "IsEven"))
      (RETURN
        (CALL isEven
          (CALL tail arg))))
    """))
```

**Output:**

```
true
```

### Combining Directories

One of Symp's distinguishing features is that directory structure naturally serves as the organizational structure of a software system. Related procedures can be grouped into directories, and relative path resolution allows each procedure to locate neighboring components without requiring a separate module or package system.

In this example, a directory named Unary forms a small arithmetic library implementing increment, addition, and multiplication over unary numbers. Each procedure compiles the routines located alongside it, allowing larger operations to be constructed from simpler ones. The entry procedure accesses only the top-level multiplication routine, while the remaining dependencies are resolved internally through the directory hierarchy. This organization scales naturally as larger collections of related procedures are assembled into reusable libraries.

**Program:**

```
(DIR "Combining directories"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL complf "Unary/Mul")
          (LIST
            "succ"
            "succ"
            "zero")
          
          (LIST
            "succ"
            "succ"
            "succ"
            "zero"))))
    """)
  
  (DIR "Unary"
    (DATA "Inc"
      """
      (PRG
        (ARGS arg)
        (RETURN
          (CALL cons
            "succ"
            arg)))
      """)
    
    (DATA "Add"
      """
      (PRG
        (ARGS a b)
        (VARS inc, acc)
        
        (ASGN inc (CALL complf "Inc"))
        (ASGN acc b)
        
        (LABEL loop)
        (JMPEQ
          (CALL head a)
          "zero"
          done)
        
        (ASGN acc (CALL inc acc))
        (ASGN a (CALL tail a))
        
        (JMP loop)

        (LABEL done)
        (RETURN acc))
      """)
    
    (DATA "Mul"
      """
      (PRG
        (ARGS a b)
        (VARS add, acc)
        
        (ASGN add (CALL complf "Add"))
        (ASGN acc (LIST "zero"))
        
        (LABEL loop)
        (JMPEQ
          (CALL head a)
          "zero"
          done)
        
        (ASGN acc (CALL add acc b))
        (ASGN a (CALL tail a))
        
        (JMP loop)

        (LABEL done)
        (RETURN acc))
      """)))
```

**Output:**

```
(LIST
    "succ"
    "succ"
    "succ"
    "succ"
    "succ"
    "succ"
    "zero")
```

## 4. Conclusion

Symp demonstrates how a small procedural language can be combined with a mutable virtual filesystem to form a uniform symbolic computing environment. By representing programs, data, directories, and references as filesystem objects, the language eliminates the traditional distinction between code and its surrounding resources. Procedures may be compiled dynamically, passed as values, and organized according to the same directory hierarchy that stores ordinary data.

Although the language provides only a modest collection of primitive instructions and builtin operations, these constructs are sufficient to express common programming techniques such as conditional execution, iteration, recursion, higher-order procedure invocation, and modular program organization. The examples presented throughout this introduction illustrate how increasingly sophisticated behavior emerges from the composition of these simple mechanisms.

The filesystem-centric design also encourages a modular style of development. Related procedures can be grouped into directories, reused through relative references, and composed into larger libraries without introducing separate language features for packages or modules. Since all interaction with persistent state occurs through the virtual filesystem, programs remain explicit about the resources they depend upon and manipulate.

As a result, Symp serves both as a practical symbolic programming language and as an experimental platform for exploring alternative relationships between code, data, and storage. Its minimal core and uniform representation make it well suited for experimentation with symbolic computation, metaprogramming, program transformation, and other applications where programs themselves are treated as manipulable data.

