# Symp Introduction

Symp is a lightweight symbolic programming language whose primary abstraction is a mutable virtual filesystem. Programs, data, and references are represented uniformly as filesystem objects, enabling dynamic compilation, modular organization, and symbolic computation within a single execution model.

## 1. About Symp

Symp is a symbolic programming language built around the idea that programs should inhabit the same space as the data they manipulate. Rather than separating source files, modules, configuration, and runtime resources into distinct concepts, Symp represents all of them as nodes within a mutable virtual filesystem. Programs are compiled directly from files in this filesystem, may reference neighboring files through relative paths, and may freely inspect and modify the filesystem during execution.

The language is intentionally small. It provides only a handful of primitive expression types, explicit control-flow instructions, and a collection of builtin procedures for interacting with the virtual filesystem. Despite this minimal core, the combination of symbolic data structures, recursive procedures, and mutable directories allows larger systems to be assembled from small, composable components.

This document first introduces the theoretical foundations of Symp and its execution model. It then presents the concrete syntax and semantics of the language before demonstrating its use through a collection of progressively more advanced examples.

## 2. Theoretical Background

The central abstraction in Symp is the virtual filesystem. Every program executes within a directory hierarchy consisting of directories, data files, and symbolic links. Source code is stored as ordinary data files and becomes executable only after being compiled. Since compiled procedures remember the directory from which they originated, programs naturally execute relative to their own location, allowing software to be organized into reusable directory hierarchies.

Unlike conventional languages, Symp does not distinguish sharply between code and data. Programs are values that may be compiled, stored in variables, passed as arguments, and invoked dynamically. Likewise, lists, literals, and procedures all belong to the same symbolic expression system. This uniform representation simplifies both the language semantics and metaprogramming.

Execution follows a straightforward procedural model. Each procedure owns a local environment containing its arguments and variables. Instructions are executed sequentially unless modified by explicit jump operations. Procedures communicate exclusively through argument passing and return values, while runtime state is maintained inside the virtual filesystem.

### 2.1. Formal Syntax

The filesystem itself is represented as a tree of directories containing named files. Each directory may contain arbitrary numbers of data files, symbolic links, and nested directories. Data files store arbitrary strings, while links store paths pointing to other filesystem objects.

The following grammar describes the serialized representation of a virtual filesystem hierarchy.

```
<start> := <dir>

<dir> := (DIR <name> <item>*)

<item> := (FILE <name> <s-expr>)
        | (LINK <name> <string>)
        | <dir>

<name> := <string>
```

Programs are themselves stored as data files using a symbolic S-expression syntax. A program consists of optional argument and variable declarations followed by a sequence of instructions executed from top to bottom. Expressions may consist of literals, variables, lists, procedure calls, or programs themselves.

```
<start> := <asm>

<asm> := (ASM (ARGS <identifier>+)? (VARS <identifier>+)? <instr>+)

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
        | <asm>
```

The S-expression notation is chosen primarily because it mirrors the internal representation used by the interpreter. Programs therefore require almost no syntactic transformation before execution, making the language particularly suitable for symbolic manipulation and program generation.

### 2.2. Informal Semantics

Program execution begins by compiling a designated entry procedure and invoking it with the supplied arguments. Each invocation creates a fresh local environment containing the declared arguments and variables. Arguments are initialized from the caller, whereas variables are initially undefined and must be assigned before they are read.

Expressions are evaluated recursively. Literal values evaluate to themselves, variables resolve to their bound values, lists evaluate each of their elements, and procedure calls invoke either user-defined procedures or builtin operations. Procedures may therefore appear anywhere an expression is expected, enabling higher-order programming.

Instruction execution is imperative. Assignments modify local variables, procedure calls execute for their side effects or returned values, and jump instructions alter the instruction pointer according to comparisons between evaluated expressions. Labels serve solely as jump destinations and have no effect during normal sequential execution.

All runtime state resides within the virtual filesystem. Builtin procedures provide operations for creating, deleting, reading, writing, and traversing filesystem objects. Since procedures retain the directory in which they were compiled, relative path resolution remains stable regardless of where a procedure is invoked.

## 3. Practical Examples

The following examples illustrate how specific programming constructs are formed, how to interact with the virtual filesystem, and how metaprogramming works to form Symp programs.

### Introductory examples

The following examples introduce the basic concepts and features of Symp. They demonstrate the language's syntax, fundamental operations, and core programming constructs, providing a starting point for understanding how Symp programs are structured and executed. Each example focuses on a particular feature and illustrates its usage with a simple, self-contained program.

#### Arguments and Variables

Every procedure may declare a list of formal arguments and a collection of local variables. Arguments receive their values from the caller when the procedure is invoked, whereas variables provide mutable storage local to a single execution of the procedure.

In this example, the procedure `Greet` accepts a single argument, constructs a list containing two constant strings, stores the resulting list in a local variable, and finally returns it to the caller.

**Program:**

```
(DIR "Args and vars"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "."
            (CALL read "Greet"))
          
          "world")))
  )
  
  (FILE "Greet"
    (ASM
      (ARGS a)
      (VARS x)
      
      (ASGN x (LIST "hello" a))
      
      (RETURN x))
  )
)
```

**Output:**

```
(hello world)
```

#### Branching

Procedures execute sequentially unless the instruction pointer is redirected by an explicit jump instruction. Conditional jumps compare two evaluated expressions and transfer execution to a labeled instruction only when the comparison succeeds. This mechanism forms the basis for implementing conditional logic.

The following procedure distinguishes between two possible input values and returns a different result for each. Any other input reaches the default branch, demonstrating how conditional jumps may be combined to express multi-way branching.

**Program:**

```
(DIR "Branching"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "."
            (CALL read "FooBar"))
          
          "foo")))
  )

  (FILE "FooBar"
    (ASM
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
  )
)
```

**Output:**

```
alpha
```

#### Loops

Although Symp does not provide dedicated looping constructs, iteration is easily expressed through labels and unconditional jumps. A procedure repeatedly executes a block of instructions until a terminating condition redirects control to the exit label.

This example traverses a symbolic list element by element. The procedure repeatedly extracts the head of the input list, prepends it to an accumulator, advances to the remaining tail, and repeats until the terminating marker is encountered. The resulting accumulator therefore contains the elements in reverse order.

**Program:**

```
(DIR "Loops"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "."
            (CALL read "ReverseList"))
          
          (LIST 1 2 3 4))))
  )

  (FILE "ReverseList"
    (ASM
      (ARGS input)
      (VARS h t acc)
      
      (ASGN acc (LIST))
      
      (LABEL loop)
      (JMPEQ (CALL head input) NIL done)
      (ASGN h (CALL head input))
      (ASGN t (CALL tail input))
      (ASGN acc (CALL cons h acc))
      (ASGN input t)
      (JMP loop)
      
      (LABEL done)
      (RETURN acc))
  )
)
```

**Otuput:**

```
(List 4 3 2 1)
```

#### Recursion

Since procedures are ordinary values, they may compile and invoke themselves recursively. Recursive procedures are often a natural way to process hierarchical symbolic data, particularly tree-like structures.

The following example recursively transforms a linear sequence of control symbols into a complete binary tree. Each recursive invocation consumes one element of the input sequence until the terminating symbol is encountered, at which point a leaf node is produced. Every non-terminal invocation constructs a tree node whose two children are themselves produced recursively.

**Program:**

```
(DIR "Recursion"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "."
            (CALL read "Tree"))
          
          (LIST
            "branch"
            "branch"
            "branch"
            "halt"))))
  )

  (FILE "Tree"
    (ASM
      (ARGS n)
      (VARS tree)
      
      (ASGN tree
        (CALL enasm "."
          (CALL read "Tree")))
      
      (JMPEQ
        (CALL head n)
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
  )
)
```

**Output:**

```
(LIST
    tree
    (LIST
        tree
        (LIST tree leaf leaf)
        (LIST tree leaf leaf))
    
    (LIST
        "tree"
        (LIST tree leaf leaf)
        (LIST tree leaf leaf)))
```

#### Process Interaction

Independent procedures may cooperate simply by compiling and invoking one another. Because procedures are loaded dynamically from the virtual filesystem, mutually recursive definitions require no special language support beyond ordinary procedure calls.

The following example implements mutually recursive predicates for determining whether a unary natural number is even or odd. Rather than containing the entire algorithm within a single procedure, the computation alternates between `IsEven` and `IsOdd`, each delegating the remaining work to the other until the base case is reached.

**Program:**

```
(DIR "Process interaction"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "."
            (CALL read "IsEven"))
          
          (LIST
            "succ"
            "succ"
            "zero"))))
  )

  (FILE "IsEven"
    (ASM
      (ARGS arg)
      (VARS isOdd)
      
      (LABEL even)
      (JMPNE
        (CALL head arg)
        "zero"
        odd)
      
      (RETURN TRUE)
      
      (LABEL odd)
      (ASGN isOdd
        (CALL enasm "."
          (CALL read "IsOdd")))
      
      (RETURN
        (CALL isOdd
          (CALL tail arg))))
  )
  
  (FILE "IsOdd"
    (ASM
      (ARGS arg)
      (VARS isEven)
      
      (LABEL odd)
      (JMPNE
        (CALL head arg)
        "zero"
        even)
      
      (RETURN FALSE)
      
      (LABEL even)
      (ASGN isEven
        (CALL enasm "."
          (CALL read "IsEven")))
      
      (RETURN
        (CALL isEven
          (CALL tail arg))))
  )
)
```

**Output:**

```
TRUE
```

#### Packaging

One of Symp's distinguishing features is that directory structure naturally serves as the organizational structure of a software system. Related procedures can be grouped into directories, and relative path resolution allows each procedure to locate neighboring components without requiring a separate module or package system.

In this example, a directory named Unary forms a small arithmetic library implementing increment, addition, and multiplication over unary numbers. Each procedure compiles the routines located alongside it, allowing larger operations to be constructed from simpler ones. The entry procedure accesses only the top-level multiplication routine, while the remaining dependencies are resolved internally through the directory hierarchy. This organization scales naturally as larger collections of related procedures are assembled into reusable libraries.

**Program:**

```
(DIR "Packaging"
  (FILE "main"
    (ASM
      (RETURN
        (CALL
          (CALL enasm "Unary"
            (CALL read "Unary/Mul"))
          
          (LIST
            "succ"
            "succ"
            "zero")
          
          (LIST
            "succ"
            "succ"
            "succ"
            "zero"))))
  )
  
  (DIR "Unary"
    (FILE "Inc"
      (ASM
        (ARGS arg)
        (RETURN
          (CALL cons
            "succ"
            arg)))
    )
    
    (FILE "Add"
      (ASM
        (ARGS a b)
        (VARS inc acc)
        
        (ASGN inc
          (CALL enasm "."
            (CALL read "Inc")))
        
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
    )
    
    (FILE "Mul"
      (ASM
        (ARGS a b)
        (VARS add acc)
        
        (ASGN add
          (CALL enasm "."
            (CALL read "Add")))
        
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
    )
  )
)
```

**Output:**

```
(LIST
    succ
    succ
    succ
    succ
    succ
    succ
    zero)
```

### Filesystem examples

Symp provides a virtual filesystem that allows programs to work with files, directories, and links. The following examples demonstrate how to create and manipulate filesystem objects, read and write file contents, inspect directory entries, and work with symbolic links. Together, they illustrate how filesystem operations can be performed directly from Symp programs.

#### Working with Files

The virtual filesystem stores file contents as symbolic expressions. The `mkfile` builtin creates an empty file, `write` replaces its contents, and `read` retrieves those contents. The following example creates a file, writes a small list of values to it, and reads the values back.

**Program:**

```
(DIR "Working with files"
  (FILE "main"
    (ASM
      (CALL mkfile "notes")
      (CALL write "notes" (LIST "hello" "world"))
      (RETURN (CALL read "notes")))
  )
)
```

**Output:**

```
(hello world)
```

#### Working with Directories

Directories let programs organize related files and other directories. The `mkdir` builtin creates a directory, while `listdir` returns the names of the entries directly inside a directory. This example creates a workspace with an archive subdirectory and lists the workspace's contents.

**Program:**

```
(DIR "Working with directories"
  (FILE "main"
    (ASM
      (CALL mkdir "workspace")
      (CALL mkdir "workspace/archive")
      (RETURN (CALL listdir "workspace")))
  )
)
```

**Output:**

```
(LIST archive)
```

#### Working with Links

A symbolic link stores a path to another filesystem object. The `mklink` builtin creates a link, and `writelnk` sets its target path. Filesystem operations such as `read` follow the link to access the target, while `readlnk` returns the path stored in the link itself.

This example creates a file, creates a link to it, and reads the file through the link.

**Program:**

```
(DIR "Working with links"
  (FILE "main"
    (ASM
      (CALL mkfile "message")
      (CALL write "message" (LIST "hello through a link"))
      (CALL mklink "shortcut")
      (CALL writelnk "shortcut" "message")
      (RETURN
        (LIST
          (CALL read "shortcut")
          (CALL readlnk "shortcut"))))
  )
)
```

**Output:**

```
(('hello through a link') message)
```

### Metaprogramming example

Symp supports metaprogramming, allowing programs to construct and execute other programs dynamically. The following example demonstrates how to represent a program as a list, convert that representation into an executable `ASM` element using `enasm`, and execute the resulting program to obtain its return value. This illustrates how Symp programs can treat code as data and generate executable behavior at runtime.

#### Runtime program creation

n Symp, programs can be represented as lists and manipulated as data. The `enasm` builtin converts a list describing an assembly program into an executable `ASM` value. That value can then be called like any other procedure. In this example, the program builds a list containing a `RETURN` instruction, compiles the list with `enasm`, and immediately executes the resulting program.

**Program:**

```
(DIR "Metaprogramming"
  (FILE "main"
    (ASM
      (VARS program)

      (ASGN program
        (LIST
          "ASM"
          (LIST
            "RETURN"
            (LIST "LIST" "\"hello\"" "\"from generated code\""))))

      (RETURN
        (CALL
          (CALL enasm "." program))))
  )
)
```

**Output:**

```
(hello 'from generated code')
```

## 4. Conclusion

Symp is a lightweight symbolic programming language built around a simple but powerful idea: programs, data, and references can coexist within a single mutable virtual filesystem. By treating the filesystem as the primary abstraction for both program organization and runtime state, Symp provides a unified environment in which software can be composed, inspected, and modified dynamically.

This introduction has presented the theoretical foundations of Symp, its formal syntax, and the semantics of its execution model. The practical examples have demonstrated how its basic programming constructs support conditional branching, iteration, recursion, cooperation between procedures, and modular organization through directory hierarchies. The filesystem examples have further illustrated how programs can manipulate files, directories, and symbolic links directly, while the metaprogramming example has shown how symbolic representations can be transformed into executable programs at runtime.

Together, these features demonstrate how a minimal set of language primitives can support a flexible programming model. Rather than relying on a complex collection of separate abstractions, Symp combines symbolic expressions, procedural execution, and a mutable virtual filesystem to provide a consistent foundation for computation.

The examples in this document serve as a starting point for exploring the language. Further experimentation with filesystem operations, reusable procedures, and dynamically generated programs can reveal additional ways to combine Symp's core features and build more sophisticated applications.

