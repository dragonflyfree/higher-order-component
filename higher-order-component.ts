function deepMerge<T>(base: T, deepPartial: any): T {
    const result: any = { ...base }

    for (const key in deepPartial)
        if (deepPartial.hasOwnProperty(key))
            if (typeof deepPartial[key] === "object" && deepPartial[key] !== null && !Array.isArray(deepPartial[key]))
                result[key] = deepMerge(result[key], deepPartial[key] || {})
            else if (deepPartial[key] !== undefined)
                result[key] = deepPartial[key]

    return result as T
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

type Prioritise<T, K> = K extends keyof T ? T[K] & Omit<T, K> : T

type ConsumerProps<Props extends Object, Callback extends (props: Props) => any, K = "">
    = DeepPartial<Prioritise<Props, K>> & { component?: Callback }

export function HigherOrderComponent<
    Props extends Object,
    Callback extends (props: Props) => any,

    Configurable extends
    (configProps?: ConsumerProps<Props, Callback, "config">) =>
        (instanceProps?: ConsumerProps<Props, Callback, "instance">) =>
            (renderProps?: ConsumerProps<Props, Callback>) =>
                ReturnType<Callback>,
    Instantiable extends ReturnType<Configurable>,
    Renderable extends ReturnType<Instantiable>
>(
    defaults: Props,
    component: Callback
): {
    configure: Configurable
    instantiate: Instantiable
    render: Renderable
} {
    const configure = (
        (config) => {
            const { component: configComponent, ...configAndMiscProps } = config || {}

            const configMiscProps: any = {}
            const configProps: any = {}
            for (const key in configAndMiscProps) {
                const prop = (configAndMiscProps as Record<string, any>)[key]

                if (defaults.hasOwnProperty(key))
                    configMiscProps[key] = prop
                else
                    configProps[key] = prop
            }

            let propsFromConfiguration = deepMerge(defaults,
                { config: configProps, ...configMiscProps }
            )

            return (instance) => {
                const { component: instanceComponent, ...instanceAndMiscProps } = instance || {}

                const instanceMiscProps: any = {}
                const instanceProps: any = {}
                for (const key in instanceAndMiscProps) {
                    const prop = (instanceAndMiscProps as Record<string, any>)[key]

                    if (defaults.hasOwnProperty(key))
                        instanceMiscProps[key] = prop
                    else
                        instanceProps[key] = prop
                }

                let propsFromInstantiation = deepMerge(propsFromConfiguration,
                    { instance: instanceProps, ...instanceMiscProps }
                )

                return (render) => {
                    const { component: renderComponent, ...renderProps } = render || {}
                    let props = deepMerge(propsFromInstantiation, renderProps)
                    return (renderComponent || instanceComponent || configComponent || component)(props)
                }
            }
        }
    ) as Configurable
    const instantiate = configure() as Instantiable
    const render = instantiate() as Renderable

    return { configure, instantiate, render }
}
