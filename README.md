# higher-order-component
A generic typescript utility function for creating a higher order (JSX) component, with the ability to partially override default values for each successive function call. Designed to work with [@kitajs/html](https://github.com/kitajs/html)

```ts
// Create a higher order component (with default values)

// configure: function to configure the component, returns instantiate function
// instantiate: function to instantiate the component, returns render function
// render: function to render the component, returns string
const { configure, instantiate, render } = HigherOrderComponent(
    {
        config: { title: `Default Title` },
        instance: { id: 0 } as { id: number | string },
        content: { text: `Default Text` },
    },

    props => {
        return `Title: ${props.config.title}, ID: ${props.instance.id}, Text: ${props.content.text}`
    }
)

/*
 * `render` is a ready to use JSX component. You can override any of the default values,
 * including config, instance and content, as well as override the component function.
 *
 * Content props are first class to the render function, while instance/config prop overrides
 * must be nested: { ...contentProps, config: { ...configProps }, instance: { ...instanceProps } }
 */
console.log(render({ text: `Hello World`, config: { title: `See, nested!` } }))

/*
 * `instantiate` is a function that returns a render function. You can override any of the default values,
 * including config, instance and content, as well as override the component function.
 * 
 * Instance props are first class to the instantiate function, while config/content prop overrides
 * must be nested: { ...instanceProps, config: { ...configProps }, content: { ...contentProps } }
 */
const render2 = instantiate({ id: 1 })
console.log(render2())

/*
 * `configure` is a function that returns a instantiate function. You can override any of the default values,
 * including config, instance and content, as well as override the component function.
 * 
 * Config props are first class to the configure function, while instance/content prop overrides
 * must be nested: { ...configProps, instance: { ...instanceProps }, content: { ...contentProps } }
 */
const instantiate2 = configure({ title: `Hello World` })
const render3 = instantiate2({ id: 2 })
console.log(render3({ text: "Hello." }))

/* Output:
Title: See, nested!, ID: 0, Text: Hello World
Title: Default Title, ID: 1, Text: Default Text
Title: Hello World, ID: 2, Text: Hello.
*/
```
