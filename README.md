# higher-order-component
A generic typescript utility function for creating a higher order (JSX) component, with the ability to partially override default values for each successive function call. Designed to work with [@kitajs/html](https://github.com/kitajs/html).

## Examples

### Nothing
#### Definition
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
`Nothing` is a higher order component that accepts no properties and returns an empty JSX fragment.
#### Usage
```tsx
// index.tsx
import Html from "@kitajs/html"
import { Nothing } from "./nothing"

console.log( <Nothing /> )
```
Output:
```
```
