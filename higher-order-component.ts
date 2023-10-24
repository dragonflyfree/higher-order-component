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

import { Children } from "@kitajs/html"
interface ComponentInterface<ConfigProps = any, InstanceProps = any> {
    config: ConfigProps
    instance: InstanceProps
    misc: any

    children: Children
}

export function HigherOrderComponent<
    Props extends Partial<ComponentInterface>,
    Callback extends (props: Props) => any,

    Configurable extends
    (configProps?: DeepPartial<Prioritise<Props, "config">> & Partial<{ component: Callback }>) =>
        (instanceProps?: DeepPartial<Prioritise<Props, "instance">> & Partial<{ component: Callback }>) =>
            (renderProps?: DeepPartial<Props> & Partial<{ component: Callback }>) =>
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
        (configProps) => {
            const {
                instance: config_InstanceProps,
                component: config_Component,
                ...config_ConfigPropsAndOtherProps
            } = configProps || {} as DeepPartial<Prioritise<Props, "config">> & Partial<{ component: Callback }>

            const config_OtherProps = {} as any
            const config_ConfigProps = {} as any
            for (const key in config_ConfigPropsAndOtherProps) {
                if (defaults.hasOwnProperty(key))
                    config_OtherProps[key] = config_ConfigPropsAndOtherProps[key]
                else
                    config_ConfigProps[key] = config_ConfigPropsAndOtherProps[key]
            }

            let propsFromConfiguration = deepMerge(defaults, {
                config: config_ConfigProps,
                instance: config_InstanceProps,
                ...config_OtherProps
            })

            return (instanceProps) => {
                const {
                    config: instance_ConfigProps,
                    component: instance_Component,
                    ...instance_InstancePropsAndOtherProps
                } = instanceProps || {} as DeepPartial<Prioritise<Props, "instance">> & Partial<{ component: Callback }>

                const instance_OtherProps = {} as any
                const instance_InstanceProps = {} as any
                for (const key in instance_InstancePropsAndOtherProps) {
                    if (defaults.hasOwnProperty(key))
                        instance_OtherProps[key] = instance_InstancePropsAndOtherProps[key]
                    else
                        instance_InstanceProps[key] = instance_InstancePropsAndOtherProps[key]
                }

                let propsFromInstantiation = deepMerge(propsFromConfiguration, {
                    config: instance_ConfigProps,
                    instance: instance_InstanceProps,
                    ...instance_OtherProps
                })

                return (renderProps) => {
                    const {
                        component: render_Component,
                        ...render_Props
                    } = renderProps || {} as DeepPartial<Props> & Partial<{ component: Callback }>

                    let props = deepMerge(propsFromInstantiation, render_Props)

                    const render = (render_Component || instance_Component || config_Component || component) as Callback

                    return render(props)
                }
            }
        }
    ) as Configurable
    const instantiate = configure() as Instantiable
    const render = instantiate() as Renderable

    return { configure, instantiate, render }
}
