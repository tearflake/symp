examples = {
"frit-frut":
`
(DIR "Args and vars"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "FritFrut") 
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
`,

"foo-bar":
`
(DIR "Control flow"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "FooBar")
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
`,

"reverse":
`
(DIR "Loops"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "ReverseList")
          (LIST 1 2 3 4))))
    """)

  (DATA "ReverseList"
    """
    (PRG
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
    """))
`,

"tree":
`
(DIR "Recursion"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "Tree")
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
      
      (ASGN tree (CALL cfile "Tree"))
      
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
`,

"even-odd":
`
(DIR "Process interaction"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "IsEven")
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
      (ASGN isOdd (CALL cfile "IsOdd"))
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
      (ASGN isEven (CALL cfile "IsEven"))
      (RETURN
        (CALL isEven
          (CALL tail arg))))
    """))
`,

"unary":
`
(DIR "Combining directories"
  (DATA "main"
    """
    (PRG
      (RETURN
        (CALL
          (CALL cfile "Unary/Mul")
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
        
        (ASGN inc (CALL cfile "Inc"))
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
        
        (ASGN add (CALL cfile "Add"))
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
`,

"fun":
`
(DIR "Fun section"
  (DATA "main"
    """
    (PRG
      (VARS
        createGrid
        drawSpiral
        gridToString
        grid
        size)
      
      (ASGN createGrid
        (CALL cfile "Grid/Create"))
      
      (ASGN drawSpiral
        (CALL cfile "DrawSpiral"))
      
      (ASGN gridToString
        (CALL cfile "Grid/ToString"))
      
      (ASGN size 8)

      (ASGN grid
        (CALL createGrid
          (CALL stdlib/mul size 4)
          (CALL stdlib/mul size 2)))
      
      (CALL drawSpiral grid size)
      
      (RETURN
        (CALL dev/stdout
          (CALL gridToString grid))))
    """)

  (DIR Grid
    (DATA "Create"
      """
      (PRG
        (ARGS sizeX sizeY)
        (VARS i j grid row)
        
        (ASGN grid (LIST))
        (ASGN i 0)
        (LABEL iBegin)
        (JMPEQ sizeY i iEnd)

        (ASGN row (LIST))
        (ASGN j 0)
        (LABEL jBegin)
        (JMPEQ sizeX j jEnd)
        (CALL "stdlib/append" row " ")
        (ASGN j (CALL "stdlib/add" j 1))
        (JMP jBegin)
        (LABEL jEnd)
        
        (CALL "stdlib/append" grid row)
        (ASGN i (CALL "stdlib/add" i 1))
        (JMP iBegin)
        (LABEL iEnd)
        
        (RETURN grid))
      """)
    
    (DATA "Plot"
      """
      (PRG
        (ARGS grid x y)
        (VARS row)
        
        (ASGN row
          (CALL "stdlib/getnth"
            grid
            y))
          
        (CALL "stdlib/replnth"
          row
          x
          " "))
        """)
    
    (DATA "ToString"
      """
      (PRG
          (ARGS grid)
          (VARS y x rows row)
          
          (ASGN rows "")
          (ASGN y 0)
          (LABEL yBegin)
          (JMPEQ
            (CALL "stdlib/length"
              grid)
            y
            yEnd
          )

          (ASGN row "")
          (ASGN gridRow
            (CALL "stdlib/getnth"
              grid
              y)
              
          (ASGN x 0)
          (LABEL xBegin)
          (JMPEQ
            (CALL "stdlib/length"
              gridRow)
            x
            xEnd
          )
          (CALL "stdlib/append"
            row
            (CALL "stdlib/getnth"
              gridRow
              x))
          (ASGN x
            (CALL "stdlib/add"
              x
              1))
          (JMP xBegin)
          
          (LABEL xEnd)
          (CALL "stdlib/append"
            rows
            row)
          (CALL "stdlib/append"
            rows
            "\\n")
          (ASGN y
            (CALL "stdlib/add"
              y
              1))
          (JMP yBegin)
          
          (LABEL yEnd)
          
          (RETURN rows)))
        """)))
`,
"factorial":
`
(MODULE
  (PUBLIC
    (ID Fact
      (ASM
        (ARGS n)
        
        (LABEL l0)
        (JMPNE n 0 ln)
        (RETURN 1)

        (LABEL ln)
        (RETURN
          (CALL stdlib/mul
            n
            (CALL Fact
              (CALL stdlib/sub n 1))))))))
        
`,
"factorial-input":
`
(CALL Fact 5)
`,

"fib":
`
(MODULE
  (PUBLIC
    (ID Fib
      (ASM
        (ARGS n)
        
        (LABEL l0)
        (JMPNE n 0 l1)
        (RETURN 0)
        
        (LABEL l1)
        (JMPNE n 1 ln)
        (RETURN 1)

        (LABEL ln)
        (RETURN
          (CALL stdlib/add
            (CALL Fib
              (CALL stdlib/sub n 1))
            
            (CALL Fib
              (CALL stdlib/sub n 2))))))))
`,
"fib-input":
`
(CALL Fib 25)
`,

"hilbert":
`
(MODULE
  (PUBLIC
    (ID HilbertCurve
      (ASM
        (ARGS order)
        (VARS size sizeX sizeY grid res path)
        
        (ASGN size (CALL stdlib/pow 2 (CALL stdlib/add order 1)))
        (ASGN sizeY (CALL stdlib/sub size 1))
        (ASGN sizeX (CALL stdlib/sub (CALL stdlib/mul sizeY 2) 1))
        
        (ASGN res (CALL Hilbert order ((0 0)) 0 0 1 0 0 1))
        (ASGN path (CALL stdlib/nth res 0))
        
        (ASGN grid (CALL Grid/Create sizeX sizeY))

        (ASGN grid (CALL PathToGrid path grid))
          
        (RETURN (CALL Grid/ToString grid)))))

  (PRIVATE
    (ID Hilbert
      (ASM
        (ARGS n path x y dx dy dx2 dy2)
        (VARS res)
        
        (JMPEQ (CALL stdlib/leq n 0) TRUE exit)
        
        (ASGN res (CALL Hilbert (CALL stdlib/sub n 1) path x y dy dx dy2 dx2))
        (ASGN path (CALL stdlib/nth res 0))
        (ASGN x (CALL stdlib/nth res 1))
        (ASGN y (CALL stdlib/nth res 2))
        
        (ASGN x (CALL stdlib/add x (CALL stdlib/mul dx 2)))
        (ASGN y (CALL stdlib/add y (CALL stdlib/mul dy 2)))
        (ASGN path (CALL stdlib/append path (x y)))
        
        (ASGN res (CALL Hilbert (CALL stdlib/sub n 1) path x y dx dy dx2 dy2))
        (ASGN path (CALL stdlib/nth res 0))
        (ASGN x (CALL stdlib/nth res 1))
        (ASGN y (CALL stdlib/nth res 2))
        
        (ASGN x (CALL stdlib/add x (CALL stdlib/mul dx2 2)))
        (ASGN y (CALL stdlib/add y (CALL stdlib/mul dy2 2)))
        (ASGN path (CALL stdlib/append path (x y)))
        
        (ASGN res (CALL Hilbert (CALL stdlib/sub n 1) path x y dx dy dx2 dy2))
        (ASGN path (CALL stdlib/nth res 0))
        (ASGN x (CALL stdlib/nth res 1))
        (ASGN y (CALL stdlib/nth res 2))
        
        (ASGN x (CALL stdlib/sub x (CALL stdlib/mul dx 2)))
        (ASGN y (CALL stdlib/sub y (CALL stdlib/mul dy 2)))
        (ASGN path (CALL stdlib/append path (x y)))
        
        (ASGN res
          (CALL Hilbert 
            (CALL stdlib/sub n 1)
            path
            x
            y
            (CALL stdlib/mul -1 dy)
            (CALL stdlib/mul -1 dx)
            (CALL stdlib/mul -1 dy2)
            (CALL stdlib/mul -1 dx2)))
            
        (ASGN path (CALL stdlib/nth res 0))
        (ASGN x (CALL stdlib/nth res 1))
        (ASGN y (CALL stdlib/nth res 2))
        
        (LABEL exit)
        (RETURN (path x y))))
  
    (ID PathToGrid
      (ASM
        (ARGS path grid)
        (VARS i len p1 p2 x1 y1 x2 y2 mx my)
        
        (ASGN i 0)
        (ASGN len (CALL stdlib/sub (CALL stdlib/lstlen path) 1))
        (LABEL l1)
        (JMPEQ i len end)
        (ASGN p1 (CALL stdlib/nth path i))
        (ASGN x1 (CALL stdlib/nth p1 0))
        (ASGN y1 (CALL stdlib/nth p1 1))
        (ASGN p2 (CALL stdlib/nth path (CALL stdlib/add i 1)))
        (ASGN x2 (CALL stdlib/nth p2 0))
        (ASGN y2 (CALL stdlib/nth p2 1))
        (ASGN mx (CALL stdlib/div (CALL stdlib/add x1 x2) 2))
        (ASGN my (CALL stdlib/div (CALL stdlib/add y1 y2) 2))
        (ASGN grid (CALL Grid/Plot grid (CALL stdlib/mul x1 2) y1))
        (ASGN grid (CALL Grid/Plot grid (CALL stdlib/mul mx 2) my))
        (ASGN i (CALL stdlib/add i 1))
        (JMP l1)
        
        (LABEL end)
        (RETURN grid))))

  (ALIASED
    (ID Grid
      (MODULE
        (PUBLIC
          (ID Create
            (ASM
              (ARGS sizeX sizeY)
              (VARS i j grid row)
              
              (ASGN row "")
              (ASGN j 0)
              (LABEL j1)
              (JMPEQ (CALL stdlib/leq sizeX j) TRUE exitJ1)
              (ASGN row (CALL stdlib/strcat row " "))
              (ASGN j (CALL stdlib/add j 1))
              (JMP j1)
              (LABEL exitJ1)
              
              (ASGN grid (LIST))
              (ASGN i 0)
              (LABEL i1)
              (JMPEQ (CALL stdlib/leq sizeY i) TRUE exitI1)
              (ASGN grid (CALL stdlib/append grid row))
              (ASGN i (CALL stdlib/add i 1))
              (JMP i1)
              (LABEL exitI1)
              
              (RETURN grid)))
              
          (ID ToString
            (ASM
              (ARGS grid)
              (VARS head1 tail1 head2 tail2 rows row)
              
              (ASGN rows "")
              (ASGN tail1 grid)
              (LABEL l1)
              (JMPEQ tail1 NIL exit1)
              (ASGN head1 (CALL stdlib/first tail1))
              (ASGN tail1 (CALL stdlib/rest tail1))
              (ASGN rows (CALL stdlib/strcat rows (CALL stdlib/strcat head1 "\\n")))
              (JMP l1)

              (LABEL exit1)
              (RETURN rows)))
          
          (ID Plot
            (ASM
              (ARGS grid x y)
              (ASGN grid
                (CALL
                  stdlib/replnth
                  grid
                  y
                  (CALL stdlib/strcat
                    (CALL stdlib/substr (CALL stdlib/nth grid y) 0 x)
                    (CALL stdlib/strcat
                      "*"
                      (CALL stdlib/substr
                        (CALL stdlib/nth grid y)
                        (CALL stdlib/add x 1)
                        (CALL stdlib/strlen
                          (CALL stdlib/nth grid y)))))))
              
              (RETURN grid))))))))
`,
"hilbert-input":
`
(CALL HilbertCurve 3)
`,

"sierp":
`
(MODULE
  (PUBLIC
    (ID Sierpinski
      (ASM
        (ARGS order)
        (VARS sizeX sizeY grid)

        (ASGN sizeY (CALL stdlib/pow 2 order))
        (ASGN sizeX (CALL stdlib/sub (CALL stdlib/mul sizeY 2) 1))
        
        (ASGN grid (CALL Grid/Create sizeX sizeY))

        (ASGN grid (CALL DrawTriangle grid (CALL stdlib/sub sizeY 1) 0 sizeY))

        (RETURN (CALL Grid/ToString grid)))))

  (PRIVATE
    (ID DrawTriangle
      (ASM
        (ARGS grid col row size)
        (VARS half)
        
        (JMPNE size 1 rec)
        (ASGN grid (CALL Grid/Plot grid col row))
        (RETURN grid)
        
        (LABEL rec)
        (ASGN half (CALL stdlib/div size 2))
        
        (ASGN grid
          (CALL DrawTriangle
            grid
            col
            row
            half))
            
        (ASGN grid
          (CALL DrawTriangle
            grid
            (CALL stdlib/sub col half)
            (CALL stdlib/add row half)
            half))
            
        (ASGN grid
          (CALL DrawTriangle
            grid
            (CALL stdlib/add col half)
            (CALL stdlib/add row half)
            half))
        
        (RETURN grid))))

  (ALIASED
    (ID Grid
      (MODULE
        (PUBLIC
          (ID Create
            (ASM
              (ARGS sizeX sizeY)
              (VARS i j grid row)
              
              (ASGN row "")
              (ASGN j 0)
              (LABEL j1)
              (JMPEQ (CALL stdlib/leq sizeX j) TRUE exitJ1)
              (ASGN row (CALL stdlib/strcat row " "))
              (ASGN j (CALL stdlib/add j 1))
              (JMP j1)
              (LABEL exitJ1)
              
              (ASGN grid ())
              (ASGN i 0)
              (LABEL i1)
              (JMPEQ (CALL stdlib/leq sizeY i) TRUE exitI1)
              (ASGN grid (CALL stdlib/append grid row))
              (ASGN i (CALL stdlib/add i 1))
              (JMP i1)
              (LABEL exitI1)
              
              (RETURN grid)))
              
          (ID ToString
            (ASM
              (ARGS grid)
              (VARS head1 tail1 head2 tail2 rows row)
              
              (ASGN rows "")
              (ASGN tail1 grid)
              (LABEL l1)
              (JMPEQ tail1 NIL exit1)
              (ASGN head1 (CALL stdlib/first tail1))
              (ASGN tail1 (CALL stdlib/rest tail1))
              (ASGN rows (CALL stdlib/strcat rows (CALL stdlib/strcat head1 "\\n")))
              (JMP l1)

              (LABEL exit1)
              (RETURN rows)))
          
          (ID Plot
            (ASM
              (ARGS grid x y)
              (ASGN grid
                (CALL
                  stdlib/replnth
                  grid
                  y
                  (CALL stdlib/strcat
                    (CALL stdlib/substr (CALL stdlib/nth grid y) 0 x)
                    (CALL stdlib/strcat
                      "*"
                      (CALL stdlib/substr
                        (CALL stdlib/nth grid y)
                        (CALL stdlib/add x 1)
                        (CALL stdlib/strlen
                          (CALL stdlib/nth grid y)))))))
              
              (RETURN grid))))))))
`,
"sierp-input":
`
(CALL Sierpinski 4)
`
}

