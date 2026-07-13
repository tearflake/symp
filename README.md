```
// under construction //
```

# Symp Framework

## About

This assembly-like programming framework is based on S-expressions for expressing structure and code. S-expressions are spanned over virtual directories and files, and are wired into the code execution model which natively accesses the virtual filesystem. This virtual filesystem makes no distinction between code and data, enabling the code files to be read and compiled on demand. Data files are seamlessly read and written by the underlying code, utilizing the filesystem that integrates into the essence of the entire programming framework.

## Details

The intention of Symp framework is to serve as a virtual machine and compiling target from higher level programming frameworks. It has very simple syntax and semantics, making it trivial for implementation as an interpreter on any underlying target.

The syntax and semantics of core Symp programming is inspired by S-expressions processed by a kind of higher order assembly constructs where programs are passed as strings, possibly compiled (or interpreted) from user defined higher level frameworks. Initially, Symp comes with all the elements needed for such operations.

In certain sense, Symp Framework can be seen as a virtual OS, and shares some similarities with low level operating systems, only operating on higher level of use and appearance. Once enriched by higher level constructs, such system delivers a user experience of having control over lower level constructs without getting down to bare metal assembly interface.

## Resources

While it is still in early development, there are several resources to check out regarding Symp framework:

* [introduction](./docs/intro.md)
* [specification](./specs/prg.pseudo)
* [playground](./playground/)

```
// under construction //
```
