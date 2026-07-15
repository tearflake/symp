```
// under construction //
```

# Symp

**S-expression based symbolic processing virtual machine**

## About

This programming virtual machine is based on S-expressions for expressing structures holding code and data. Code and data are spanned over virtual directories and files, and are wired into the code execution model which natively accesses the virtual filesystem. The virtual filesystem makes no distinction between code and data, making a strong case for meta-programming. Although starting from assembly-like core, the virtual machine emphasizes possibility of extending the system by new programming constructs, providing all the necessary mechanics for such activities. Thus, user defined code syntax and semantic forms can arise from these foundations.

## Details

Symp is an embodiment of a virtual filesystem hosting mutable code and data that can interact with each other. Although rather unusual, it represents a computationally complete meta-programming virtual machine in its essence.

#### motivation

The main intention of Symp virtual machine is to serve as a compiling target from embedded higher level programming frameworks. Its syntax and semantics are very simple, making it more-or-less trivial for implementation as an interpreter or compiler.

#### virtual filesystem

Virtual filesystem holding code and data is an important part of Symp virtual machine. When a code is read and compiled, relative to its position within the filesystem, parts of code access other parts of code and data analogously to lexical scoping semantics. The virtual filesystem thus becomes an integral part of Symp programs, participating in their organization and interpretation.

#### symbolic programs

The syntax and semantics of core Symp are inspired by S-expressions processed by a kind of imperative assembly constructs where programs are passed as strings, and dynamically compiled during program execution. Such an approach makes meta-programming a natural use case of Symp.

#### meta-programming

Meta-programming capabilities of Symp arise from the fact that programs can take any form, provided we manage on our own their particular kinds of syntax and semantics. By freely expressing parsers, compilers, or interpreters in low level Symp, arbitrary forms of code may become seamless parts of programming code bases.

#### summary

In summary, virtual filesystem with meta-programming capabilities makes Symp an extensible foundation ready to host more complex kinds of programs and their interpretations. Once enriched by higher level constructs, the system may deliver a user experience of having control over lower level constructs without getting down to bare metal assembly interface. The final automation level of programming activities is left completely up to the user requirements, and may occupy a range from very low and assembly like levels, to very high and expressive levels of abstractions.

## Resources

While it is still in early development, there are several resources to check out regarding Symp virtual machine:

* [introduction](./docs/intro.md)
* [specification](./specs/prg.pseudo)
* [playground](./playground/)

```
// under construction //
```

