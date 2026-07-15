```
// under construction //
```

# Symp

**S-expression based symbolic processing framework**

## About

This programming framework is based on S-expressions for expressing structures holding code and data. Code and data are spanned over virtual directories and files, and are wired into the code execution model which natively accesses the virtual filesystem. The virtual filesystem makes no distinction between code and data, making a strong case for meta-programming. Although starting from assembly-like core, the framework emphasizes possibility of extending the system by new programming constructs, providing all the necessary mechanics for such activities. Thus, completely arbitrary code syntaxes and semantic forms can be extruded on top of these foundations.

## Details

The main intention of Symp framework is to serve as a virtual machine and compiling target from embedded higher level programming frameworks. It has very simple syntax and semantics, making it trivial for implementation as an interpreter on any underlying target.

The syntax and semantics of core Symp are inspired by S-expressions processed by a kind of higher order assembly constructs where programs are passed as strings, and compiled on demand during program execution. Such an approach makes meta-programming a natural use case of Symp.

Meta-programming capabilities of Symp arise from the fact that any program can take any form, provided we manage its particular kinds of syntax and semantics. By freely expressing parsers, compilers, or interpreters in Symp, arbitrary forms of code may become seamless parts of programming code bases.

Virtual filesystem holding code and data is an important part of Symp framework. When a code is read and compiled from this filesystem, it tracks its absolute path position. Relative to this position, the code accesses other code and data analogously to lexical scoping semantics. The virtual filesystem then becomes an integral part of Symp programs, participating in their interpretation.

In summary, virtual filesystem with meta-programming capabilities makes Symp an extensible foundation ready to host more complex kinds of programs with their interpretations. Once enriched by higher level constructs, the system may deliver a user experience of having control over lower level constructs without getting down to bare metal assembly interface. The final automation level of programming activities is left completely up to the user requirements, and may occupy a range from very low and assembly like, to very high and mysterious levels of abstractions.

## Resources

While it is still in early development, there are several resources to check out regarding Symp framework:

* [introduction](./docs/intro.md)
* [specification](./specs/prg.pseudo)
* [playground](./playground/)

```
// under construction //
```

