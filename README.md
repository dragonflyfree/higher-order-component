# higher-order-component
A generic typescript utility function for creating a higher order (JSX) component, with the ability to partially override default values for each successive function call. Designed to work with [@kitajs/html](https://github.com/kitajs/html).

## Examples

❗ The HTML produced by kitajs has no indentation nor whitespace; I've manually prettified the output HTML in this document for readability.

### Nothing

**Definition**

`Nothing` is a higher order component that accepts no properties and returns an empty JSX fragment.
```tsx
// nothing.tsx
import Html from "@kitajs/html"
import { HigherOrderComponent } from "./higher-order-component"

export const {
    render: Nothing
} =

HigherOrderComponent
    (
        {},
        () => <></>
    )
```

**Usage**

```tsx
// index.tsx
import Html from "@kitajs/html"
import { Nothing } from "./nothing"

console.log( <Nothing /> )
```

**Output**

```
```

### 

**Definition**

``

```tsx
export const {
    configure: configure,
    instantiate: instantiate,
    render: 
} =

HigherOrderComponent
    (
        {},
        props => <></>
    )
```

**Usage**

```tsx
// index.tsx
import Html from "@kitajs/html"
import {  } from "./"

console.log
```

**Output**

```
```
