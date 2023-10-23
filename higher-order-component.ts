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

import { Children } from "@kitajs/html"
interface ComponentInterface<ConfigProps = any, InstanceProps = any, ContentProps = any> {
    config: ConfigProps
    instance: InstanceProps

    // TODO: content is redundant due to `Props extends Partial<ComponentInterface>`,
    // can extend with whatever props I want, which are available as first class props
    // to render function caller, which is what content is meant to be for
    content: ContentProps

    children: Children
}

export function HigherOrderComponent<
    Rendered,

    Props extends Partial<ComponentInterface>,
    Component extends { component(props: Props): Rendered },

    Configurable extends
    (configProps?: PartialProps<Props, "config"> & Partial<Component>) =>
        (instanceProps?: PartialProps<Props, "instance"> & Partial<Component>) =>
            (contentProps?: PartialProps<Props, "content"> & Partial<Component>) =>
                Rendered,
    Instantiable extends ReturnType<Configurable>,
    Renderable extends ReturnType<Instantiable>
>(
    defaults: Props,
    component: Component["component"]
): {
    configure: Configurable
    instantiate: Instantiable
    render: Renderable
} {
    const configure = (
        (configProps) => {
            const {
                instance: config_InstanceProps,
                content: config_ContentProps,
                component: config_Component,
                ...config_ConfigPropsAndExtendedProps
            } = configProps || {} as PartialProps<Props, "config">

            const config_ExtendedProps = {} as any
            const config_ConfigProps = {} as any
            for (const key in config_ConfigPropsAndExtendedProps) {
                if (defaults.hasOwnProperty(key))
                    config_ExtendedProps[key] = config_ConfigPropsAndExtendedProps[key]
                else
                    config_ConfigProps[key] = config_ConfigPropsAndExtendedProps[key]
            }

            let propsFromConfiguration = deepMerge(defaults, {
                config: config_ConfigProps,
                instance: config_InstanceProps,
                content: config_ContentProps,
                ...config_ExtendedProps
            })

            return (instanceProps) => {
                const {
                    config: instance_ConfigProps,
                    content: instance_ContentProps,
                    component: instance_Component,
                    ...instance_InstancePropsAndExtendedProps
                } = instanceProps || {} as PartialProps<Props, "instance">

                const instance_ExtendedProps = {} as any
                const instance_InstanceProps = {} as any
                for (const key in instance_InstancePropsAndExtendedProps) {
                    if (defaults.hasOwnProperty(key))
                        instance_ExtendedProps[key] = instance_InstancePropsAndExtendedProps[key]
                    else
                        instance_InstanceProps[key] = instance_InstancePropsAndExtendedProps[key]
                }

                let propsFromInstantiation = deepMerge(propsFromConfiguration, {
                    config: instance_ConfigProps,
                    instance: instance_InstanceProps,
                    content: instance_ContentProps,
                    ...instance_ExtendedProps
                })

                return (contentProps) => {
                    const {
                        config: content_ConfigProps,
                        instance: content_InstanceProps,
                        component: content_Component,
                        ...content_ContentPropsAndExtendedProps
                    } = contentProps || {} as PartialProps<Props, "content">

                    const content_ExtendedProps = {} as any
                    const content_ContentProps = {} as any
                    for (const key in content_ContentPropsAndExtendedProps) {
                        if (defaults.hasOwnProperty(key))
                            content_ExtendedProps[key] = content_ContentPropsAndExtendedProps[key]
                        else
                            content_ContentProps[key] = content_ContentPropsAndExtendedProps[key]
                    }

                    let props = deepMerge(propsFromInstantiation, {
                        config: content_ConfigProps,
                        instance: content_InstanceProps,
                        content: content_ContentProps,
                        ...content_ExtendedProps
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
