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
            if (typeof deepPartial[key] === `object` && deepPartial[key] !== null && !Array.isArray(deepPartial[key]))
                result[key] = deepMerge(result[key] || {}, deepPartial[key] || {})
            else if (deepPartial[key] !== undefined)
                result[key] = deepPartial[key]

    return result as T
}

interface ComponentInterface<ConfigProps, InstanceProps, ContentProps> {
    config: ConfigProps
    instance: InstanceProps
    content: ContentProps
}

export function createHigherOrderComponent<ConfigProps, InstanceProps, ContentProps>(
    component: (props: ComponentInterface<ConfigProps, InstanceProps, ContentProps>) => string,
    defaults: ComponentInterface<ConfigProps, InstanceProps, ContentProps>,
):
    (configProps?: DeepPartial<
        ConfigProps & {
            instance: InstanceProps
            content: ContentProps
            component: typeof component
        }
    >) => (instanceProps?: DeepPartial<
        InstanceProps & {
            config: ConfigProps
            content: ContentProps
            component: typeof component
        }
    >) => (contentProps?: DeepPartial<
        ContentProps & {
            config: ConfigProps
            instance: InstanceProps
            component: typeof component
        }
    >) => string {

    return (configProps) => {
        const {
            instance: config_InstanceProps,
            content: config_ContentProps,
            component: config_Component,
            ...config_ConfigProps
        } = configProps || {}

        let props = deepMerge(defaults, {
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
            } = instanceProps || {}

            props = deepMerge(props, {
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
                } = contentProps || {}

                props = deepMerge(props, {
                    config: content_ConfigProps,
                    instance: content_InstanceProps,
                    content: content_ContentProps,
                })

                const renderComponent = (content_Component || instance_Component || config_Component || component) as typeof component

                return renderComponent(props)
            }
        }
    }
}
