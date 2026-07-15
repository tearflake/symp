```
// under construction //
```

# Symp

**S-expression based symbolic processing framework**

## About

This assembly-like programming framework is based on S-expressions for expressing structures holding code and data. Code and data are spanned over virtual directories and files, and are wired into the code execution model which natively accesses the virtual filesystem. This virtual filesystem makes no distinction between code and data, making a strong case for meta-programming. The framework emphasizes possibility of extending the system by new programming constructs, providing all the necessary mechanics for such activities.

## Details

The main intention of Symp framework is to serve as a virtual machine and compiling target from embedded higher level programming frameworks. It has very simple syntax and semantics, making it trivial for implementation as an interpreter on any underlying target.

The syntax and semantics of core Symp are inspired by S-expressions processed by a kind of higher order assembly constructs where programs are passed as strings, and compiled on demand during program execution. Such an approach makes meta-programming a natural use case of Symp.

Meta-programming capabilities of Symp arise from the fact that any program can take any form, provided we take care of its particular kinds of syntax and semantics. By freely expressing parsers, compilers, or interpreters in Symp, arbitrary forms of code may become seamless parts of programming code bases.

In a certain sense, Symp Framework can be seen as a virtual OS, and shares some similarities with low level operating systems, only operating on higher level of use and appearance. Once enriched by higher level constructs, such system delivers a user experience of having control over lower level constructs without getting down to bare metal assembly interface.

## Resources

While it is still in early development, there are several resources to check out regarding Symp framework:

* [introduction](./docs/intro.md)
* [specification](./specs/prg.pseudo)
* [playground](./playground/)

```
// under construction //
```

