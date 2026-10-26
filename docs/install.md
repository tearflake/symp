# Symp installation instructions

Symp installation covers installation for Javascript API access.

## Javascript API access

Symp may expose its functionality through javascript API (Application Programming Interface), both in browser and in Node.js.

To access the API from Node.js, install it by: `npm install git+ssh://github.com/tearflake/symp`, and include the following line in your code:

```
const Symp = require('@tearflake/symp');
```

To access the API from browser, clone this repository from GitHub: `git clone https://github.com/tearflake/symp`, and include the following line in your code:

```
<script src="path-to-symp-package/symp.js"></script>
```

Below, regardless of accessing from Node.js or browser, use the API as:

```
let strPrg = `
    (DIR "Root"
        (FILE "main"
            (ASM
                (RETURN "hello world")) 
        )
    )
`;

try {
    let parsed = Filesys.parse (strPrg);
    let arrResult = Filesys.main ([], parsed);
    console.log(SExpr.stringify (arrResult));
} catch (e) {
}
```

