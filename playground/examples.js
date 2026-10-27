examples = {
"greet":
`
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
`,

"foo-bar":
`
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
`,

"reverse":
`
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
`,

"tree":
`
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
`,

"even-odd":
`
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
`,

"unary":
`
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
`,

"fs1":
`
(DIR "Working with files"
  (FILE "main"
    (ASM
      (CALL mkfile "notes")
      (CALL write "notes"
        (LIST "hello" "world"))
      
      (RETURN (CALL read "notes")))
  )
)
`,

"fs2":
`
(DIR "Working with directories"
  (FILE "main"
    (ASM
      (CALL mkdir "workspace")
      (CALL mkdir "workspace/archive")
      (RETURN
        (CALL listdir "workspace")))
  )
)
`,

"fs3":
`
(DIR "Working with links"
  (FILE "main"
    (ASM
      (CALL mkfile "message")
      (CALL write "message"
        (LIST "hello through a link"))
        
      (CALL mklink "shortcut")
      (CALL writelnk "shortcut"
        "message")
      
      (RETURN
        (LIST
          (CALL read "shortcut")
          (CALL readlnk "shortcut"))))
  )
)
`,

"mp1":
`
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
              "\\"hello\\""
              "\\"from generated code\\""))))

      (RETURN
        (CALL
          (CALL enasm "." program))))
  )
)
`
}

