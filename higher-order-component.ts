type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
    ? DeepPartialArray<U>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

interface DeepPartialArray<T> extends Array<DeepPartial<T>> { }

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

type Prioritise<T, K extends keyof T> = T[K] & Omit<T, K>

type PartialProps<T, K extends keyof T> = DeepPartial<Prioritise<T, K>>

interface ComponentInterface<ConfigProps = any, InstanceProps = any, ContentProps = any> {
    config: ConfigProps
    instance: InstanceProps
    content: ContentProps
}

export function HigherOrderComponent<
    Rendered,

    Props extends ComponentInterface,
    Component extends { component(props: Props): Rendered },

    Configurable extends (
        configProps?: PartialProps<Props, "config"> & Partial<Component>
    ) => (
        instanceProps?: PartialProps<Props, "instance"> & Partial<Component>
    ) => (
        contentProps?: PartialProps<Props, "content"> & Partial<Component>
    ) => Rendered,
    Instantiable extends ReturnType<Configurable>,
    Renderable extends ReturnType<Instantiable>
>(
    defaults: Props,
    component: Component["component"],
): {
    configure: Configurable,
    instantiate: Instantiable,
    render: Renderable,
} {
    const configure = (
        (configProps) => {
            const {
                instance: config_InstanceProps,
                content: config_ContentProps,
                component: config_Component,
                ...config_ConfigProps
            } = configProps || {} as PartialProps<Props, "config">

            let propsFromConfiguration = deepMerge(defaults, {
                config: config_ConfigProps,
                instance: config_InstanceProps,
                content: config_ContentProps,
            })

            return (instanceProps) => {
                const {
                    config: instance_ConfigProps,
                    content: instance_ContentProps,
                    component: instance_Component,
                    ...instance_InstanceProps
                } = instanceProps || {} as PartialProps<Props, "instance">

                let propsFromInstantiation = deepMerge(propsFromConfiguration, {
                    config: instance_ConfigProps,
                    instance: instance_InstanceProps,
                    content: instance_ContentProps,
                })

                return (contentProps) => {
                    const {
                        config: content_ConfigProps,
                        instance: content_InstanceProps,
                        component: content_Component,
                        ...content_ContentProps
                    } = contentProps || {} as PartialProps<Props, "content">

                    let props = deepMerge(propsFromInstantiation, {
                        config: content_ConfigProps,
                        instance: content_InstanceProps,
                        content: content_ContentProps,
                    })

                    const render = (content_Component || instance_Component || config_Component || component) as Component["component"]

                    return render(props)
                }
            }
        }
    ) as Configurable
    const instantiate = configure() as Instantiable
    const render = instantiate() as Renderable

    return { configure, instantiate, render }
}
