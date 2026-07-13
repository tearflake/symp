# Symp Framework

This assembly-like programming framework is based on S-expressions for expressing structure and code. S-expression are spanned over virtual directories and files, and are wired into the code execution model which natively accesses the virtual filesystem. This virtual filesystem makes no distinction between code and data, enabling the code files to be read and compiled on demand. Data files are seamlessly read and written by the underlying code, utilizing the filesystem that integrates into the essence of the entire programming framework.

There are several resources to check out regarding Symp framework:

* [introduction](./docs/intro.md)
* [specification](./specs/prg.pseudo)
* [playground](./playground/)

