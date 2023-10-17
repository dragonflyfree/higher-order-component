# higher-order-component
A generic typescript utility function for creating a higher order (JSX) component, with the ability to partially override default values for each successive function call.

```ts
// Component interface
interface MyComponentInterface {
    config: { title: string }
    instance: { id: number | string }
    content: { text: string }
}

// Defaults
const defaults: MyComponentInterface = {
    config: { title: `Default Title` },
    instance: { id: 0 },
    content: { text: `Default Text` },
}

// Sample component
function MyComponentCallback({ config, instance, content }: MyComponentInterface) {
    return `Title: ${config.title}, ID: ${instance.id}, Text: ${content.text}`
}

// Create the higher order component (with default values), returns function to configure the component
const configureMyComponent = createHigherOrderComponent(MyComponentCallback, defaults)

// Configure the component, returns function to instatiate the component
const instantiateMyComponent = configureMyComponent()

// Instantiate the component, returns function to render the component
const MyComponent = instantiateMyComponent()

// Render the component
console.log(
    MyComponent() // Title: Default Title, ID: 0, Text: Default Text
)
// This MyComponent function can be used as a JSX component
```
