# Symp Introduction

Symp is a small symbolic-processing virtual machine built around S-expressions, an assembly-like instruction set, and a mutable virtual filesystem. Programs and data live together in virtual files and directories; a program can read, write, create, and inspect those entities while it runs. This makes the filesystem part of the execution model rather than merely a place to store source files.

This introduction presents the core data model and syntax, then walks through small programs illustrating arguments, control flow, recursion, interaction between files, filesystem operations, and runtime program construction. The examples use the S-expression notation accepted by Symp.

## Table of contents

- [1. About Symp](#1-about-symp)
- [2. Theoretical Background](#2-theoretical-background)
    - [2.1. Formal Syntax](#21-formal-syntax)
    - [2.2. Informal Semantics](#22-informal-semantics)

- [3. Practical Examples](#3-practical-examples)
    - [3.1. Introductory examples](#31-Introductory-examples)
    - [3.2. Filesystem examples](#32-filesystem-examples)
    - [3.3. Metaprogramming example](#33-metaprogramming-example)

- [4. Conclusion](#4-conclusion)

## 1. About Symp

Symp represents both programs and values symbolically. Lists are written as parenthesized S-expressions, while strings and identifiers are written as atoms. A virtual directory contains files, links, and nested directories. A file can hold an assembly program or data, and built-in functions let programs access the virtual filesystem.

The core language is intentionally small. Assembly programs provide variables, labels, jumps, calls, and returns; built-ins supply list operations, tests, conversions between assembly and symbolic lists, and filesystem operations. Since code is represented as data and can be converted at runtime, Symp also provides a foundation for metaprogramming and for building higher-level languages on top of the core.

## 2. Theoretical Background

This section describes Symp's main data structures and instruction forms, followed by an informal account of how they work together. The grammar sketches are intended to clarify the shape of valid programs; the built-ins and runtime behavior are described in the sections that follow.

### 2.1. Formal Syntax

The following grammars describe the two principal structures used in the examples: virtual filesystem trees and assembly programs. They are written in a compact, illustrative notation rather than as a complete specification of every runtime constraint.

```
<start> := <dir>

<dir> := (DIR <name> <item>*)

<item> := (FILE <name> <s-expr>)
        | (LINK <name> <string>)
        | <dir>

<name> := <string>
```

In the filesystem grammar, a directory contains zero or more items. An item is a file with an S-expression value, a link with a string target, or another directory. Names and link targets are strings.

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

An assembly program begins with `ASM`, may declare argument names with `ARGS` and local variable names with `VARS`, and then contains one or more instructions. Declarations are optional; when present, they precede the instructions. The instruction forms include labels, assignments, unconditional and conditional jumps, returns, and calls.

### 2.2. Informal Semantics

Expressions can refer to identifiers, use literal values, construct lists, call a callable expression, or contain a nested assembly program. At runtime, the instruction sequence is interpreted and expressions are evaluated when reached. The grammar describes the structure of the program; runtime checks additionally enforce requirements such as argument counts and expected value types.

## 3. Practical Examples

At a high level, Symp programs operate on symbolic values. A list is an ordered sequence of values, and the built-ins `cons`, `head`, and `tail` provide familiar list construction and access. `NIL` is used in examples as the empty-list value when testing list traversal; `TRUE` and `FALSE` are boolean results.

An assembly program has an execution environment containing its arguments and variables. `ASGN` stores a computed value, `LABEL` marks a destination, `JMP` transfers control unconditionally, and `JMPEQ` / `JMPNE` branch according to equality or inequality. `RETURN` produces the program's result. A `CALL` evaluates a callable expression with the supplied arguments. The built-ins are available as callable values, alongside assembly programs loaded from the virtual filesystem.

Filesystem paths are interpreted in the context of the directory from which code is running, so relative paths are useful for composing programs from multiple files. Links redirect ordinary file access to their targets, while `readlnk` and `writelnk` inspect or change a link itself. Since files can contain symbolic representations of programs, code may be read as data, transformed, and converted back into executable assembly.

### 3.1. Introductory examples

The first examples focus on core assembly features: passing arguments to a program, assigning variables, choosing branches, iterating over a list, expressing recursion, and splitting mutually dependent procedures across files. The final example packages related files into a directory and invokes a program from that subdirectory.

#### Arguments and Variables

This program loads the `Greet` file as assembly and calls it with the string `"world"`. `ARGS a` declares the parameter received by `Greet`, while `VARS x` declares a variable for the computed result. The expression `(LIST "hello" a)` constructs a two-element list, which is returned to the caller.

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

The `JMPNE` instruction compares its first two expressions and jumps to the named label when they differ. Here, the program tests the argument against `"foo"` and then `"bar"`, assigning the corresponding result. `JMP end` skips the remaining branches once a match has been found. If neither comparison matches, execution reaches the fallback assignment.

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

The loop repeatedly examines the first element of `input`. When `head input` is `NIL`, control jumps to `done`. Otherwise, the program saves the head and tail, prepends the head to `acc`, advances `input` to its tail, and jumps back to `loop`.

Because each element is added to the front of the accumulator, the resulting list is in reverse order. This is a typical pattern for iteration using only list primitives and labels.

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

**Output:**

```
(4 3 2 1)
```

#### Recursion

`Tree` calls itself recursively. It first loads its own assembly representation and stores the resulting callable in `tree`. If the first element of `n` is `"halt"`, it returns `"leaf"`; otherwise it returns a `"tree"` list containing two recursive calls on the tail of `n`.

The finite input list supplies the stopping condition: each recursive call receives a shorter tail, and eventually reaches `"halt"`. The output illustrates the nested structure produced by recursive calls.

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
(tree
    (tree
        (tree leaf leaf)
        (tree leaf leaf))
    
    (tree
        (tree leaf leaf)
        (tree leaf leaf)))
```

#### Process Interaction

`IsEven` and `IsOdd` demonstrate two files that call one another. Each procedure checks whether the current list begins with `"zero"`; if so, it returns its base-case boolean. Otherwise, it loads the other procedure and calls it on the tail of the list.

The calls alternate between the two files as the list is consumed. This example shows that programs need not be defined in one monolithic assembly block: separate files can cooperate through the virtual filesystem.

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

The `Unary` directory groups three related programs: `Inc`, `Add`, and `Mul`. `Inc` prepends `"succ"` to a unary numeral. `Add` repeatedly applies `Inc` to an accumulator once for each `"succ"` in its first argument. `Mul` repeatedly adds its second argument to an accumulator for each `"succ"` in its first argument.

The entry point loads `Unary/Mul` and invokes it with two unary numerals. The path passed to `enasm` identifies the directory in which the loaded program should run, so its relative reads of `Inc` and `Add` resolve within `Unary`. The result represents six in unary notation.

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
(
    succ
    succ
    succ
    succ
    succ
    succ
    zero
)
```

### 3.2. Filesystem examples

The filesystem examples show that files and directories are mutable runtime entities. Built-ins can create new entities, store S-expression data in files, enumerate directory contents, and create links to other paths. Paths are strings; a path such as `"workspace/archive"` refers to a nested entity relative to the current program directory.

#### Working with Files

`mkfile` creates an empty file named `notes`. `write` replaces its contents with the supplied list, and `read` returns the file contents as a symbolic list. File contents are not limited to source code: they can be arbitrary supported S-expression data.

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

`mkdir` creates a directory at the requested path. Creating `workspace/archive` after `workspace` demonstrates that the parent directory must already exist. `listdir` returns a list of the names of the immediate children of the named directory; it does not recursively enumerate descendants.

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
(archive)
```

#### Working with Links

A link stores a target path. Here, `mklink` creates `shortcut`, and `writelnk` sets its target to `message`. Ordinary `read` follows the link and returns the target file's contents, whereas `readlnk` returns the stored target path without following it.

This distinction is useful when a program needs to work with a link as a filesystem object rather than with the entity it points to.

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

### 3.3. Metaprogramming example

Symp's code-as-data model allows programs to construct symbolic assembly at runtime. The following example builds a list representing an `ASM` program, then passes that list to `enasm` to turn it into a callable program. The generated program returns a list containing two strings.

#### Runtime program creation

The `program` variable is an ordinary list that encodes assembly syntax: an `ASM` form containing a `RETURN` instruction whose expression constructs a `LIST`. `enasm` converts this symbolic representation into executable assembly in the current directory context, and the outer `CALL` executes it.

This example is deliberately small, but the same mechanism can support programs that generate, transform, or load larger program fragments. The caller is responsible for constructing a symbolic form that is valid assembly.

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
            (LIST
              "LIST"
              "\"hello\""
              "\"from generated code\""))))

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

Symp combines a compact assembly-like execution model with a mutable virtual filesystem and a symbolic representation of code. The introductory examples demonstrate how these pieces fit together: lists serve as data, assembly provides control flow, files organize reusable procedures, and built-ins expose filesystem operations.

The conversion functions `enasm` and `unasm` make the boundary between program and data explicit, enabling runtime program construction. These facilities form a small core on which more expressive syntaxes, interpreters, and compilers can be built. For exact built-in argument requirements and behavior, see the [built-ins reference](./builtins-ref.md).

