# Builtins reference

Symp provides native callable values for inspecting expressions, manipulating lists, converting assembly to and from symbolic form, and operating on the virtual filesystem. Built-ins are invoked with `CALL` like other callable values. Unless stated otherwise, argument types and arity are checked at runtime; invalid argument counts or types raise a runtime error.

The signatures below use `atom`, `list`, `string`, and `asm` to describe expected argument kinds. Filesystem paths are strings interpreted relative to the directory context of the running program.

## Testing expressions

These predicates test the kind of a value and return a boolean (`TRUE` or `FALSE`). They are useful when code needs to distinguish atomic values, lists, and callable values.

### `isatom`

`(CALL isatom value)`

Returns `TRUE` when `value` is an atom rather than a list or runtime object; otherwise returns `FALSE`. This includes scalar values such as strings and booleans.

### `islist`

`(CALL islist value)`

Returns `TRUE` if `value` is a Symp list, and `FALSE` otherwise. An empty list is still a list.

### `iscallable`

`(CALL iscallable value)`

Returns `TRUE` if `value` is an assembly program or a native built-in callable. Other values, including ordinary lists and atoms, return `FALSE`.

## List functions

These functions operate on Symp lists. Lists preserve element order, and the operations return values or new lists rather than modifying the input list.

### `cons`

`(CALL cons value list)`

Returns a new list with `value` prepended to `list`. The first argument must be an atom and the second must be a list. For example, prepending `1` to `(2 3)` produces `(1 2 3)`.

### `head`

`(CALL head list)`

Returns the first element of `list`. For an empty list, it returns `NIL` (represented internally as a null-like value).

### `tail`

`(CALL tail list)`

Returns a new list containing every element after the first. The tail of an empty list is an empty list; the tail of a one-element list is also an empty list.

## Callable conversion

These functions convert between executable assembly values and their symbolic list representation. This is central to metaprogramming, since a program can be inspected or assembled from data at runtime.

### `enasm`

`(CALL enasm directory-path program-list)`

Converts the symbolic list `program-list` into an executable assembly value, using the entity at `directory-path` as the program's directory context. The second argument must be a list encoding assembly syntax. The path is resolved using the current filesystem context, and the resulting program uses the resolved directory for relative filesystem operations.

### `unasm`

`(CALL unasm assembly)`

Converts an executable assembly value into a list representing its assembly syntax. The argument must be an assembly value. The result can be treated as data, inspected or transformed, and later passed to `enasm` after being shaped into valid assembly syntax.

## Virtual filesystem operations

The virtual filesystem contains directories (`DIR`), files (`FILE`), and links (`LINK`). Paths are strings and are resolved relative to the current program's directory context. The creation functions expect the parent directory to exist and fail if an entity with the requested name already exists. Ordinary `read` and `write` follow links; `readlnk` and `writelnk` access link targets directly.

### `mkdir`

`(CALL mkdir path)`

Creates a directory at `path`. The parent directory must already exist, and the destination name must be unused. Raises a runtime error if the parent is not a directory or the destination already exists.

### `mkfile`

`(CALL mkfile path)`

Creates an empty file at `path`. The parent directory must already exist, and the destination name must be unused. Use `write` to set the file's contents.

### `mklink`

`(CALL mklink path)`

Creates a link at `path` with an initially empty target path. The parent directory must already exist, and the destination name must be unused. Use `writelnk` to assign the target.

### `read`

`(CALL read path)`

Reads a file and returns its contents as a symbolic list. If `path` names a link, the link is followed; chained links are followed until an entity is reached. The resolved entity must be a file, otherwise a runtime error is raised.

### `write`

`(CALL write path value)`

Replaces the contents of the file at `path` with `value`, converting the supplied value from its list representation into the stored symbolic form. Links are followed, so writing through a link updates the target file. The resolved entity must be a file; otherwise a runtime error is raised.

### `readlnk`

`(CALL readlnk path)`

Returns the stored target path of the link at `path`, without following it. The named entity must be a link; otherwise a runtime error is raised.

### `writelnk`

`(CALL writelnk link-path target-path)`

Sets the target path stored in the link at `link-path` to `target-path`. Both arguments must be strings, and the first path must name a link. This changes the link itself rather than writing to the target file.

### `listdir`

`(CALL listdir path)`

Returns a list of the names of the immediate children of the directory at `path`. It does not traverse nested directories. The named entity must be a directory; otherwise a runtime error is raised.

### `delete`

`(CALL delete path)`

Deletes the entity named by `path` from its parent directory. The entity must exist; otherwise a runtime error is raised. Deleting a link removes the link entry, not the entity it points to.

### `exists`

`(CALL exists path)`

Returns `TRUE` if `path` resolves to an existing filesystem entity and `FALSE` if path resolution fails. It checks for existence without requiring the entity to be a particular kind.

### `kind`

`(CALL kind path)`

Returns the entity kind as a string: `"DIR"`, `"FILE"`, or `"LINK"`. The path must resolve to an existing entity; otherwise path resolution raises a runtime error.

