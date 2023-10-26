export function defineComponent<
    Props,
    Callback extends (props: Props) => any,
    ConsumerProps extends DeepPartial<Props> & { callback?: Callback },

    Configurable extends
    (config?: ConsumerProps)
        => (instance?: ConsumerProps)
            => (render?: ConsumerProps | { props?: ConsumerProps }) => ReturnType<Callback>,
    Instantiable extends ReturnType<Configurable>,
    Renderable extends ReturnType<Instantiable>,
>(
    defaults: Props extends { props: any } ? never : Props extends { callback: any } ? never : Props,
    callback: Callback
): {
    configure: Configurable
    instantiate: Instantiable
    render: Renderable
} {
    const configure = (
        (config) => {
            const configureProps = deepMerge({ ...defaults, callback }, config)

            return (instance) => {
                const instantiateProps = deepMerge(configureProps, instance)

                return (render) => {
                    if (render !== undefined && "props" in render)
                        render = render.props

                    const renderProps = deepMerge(instantiateProps, render)
                    const { callback, ...props } = renderProps

                    return callback(props as Props)
                }
            }
        }
    ) as Configurable
    const instantiate = configure() as Instantiable
    const render = instantiate() as Renderable

    return { configure, instantiate, render }
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends Record<string, any> ? DeepPartial<T[P]> : T[P] }

function deepMerge<T>(base: T, partial?: Record<string, any>): T {
    const result: any = { ...base }

    for (const key in partial)
        if (partial.hasOwnProperty(key))
            if (typeof partial[key] === "object" && partial[key] !== null && !Array.isArray(partial[key]))
                result[key] = deepMerge(result[key], partial[key] || {})
            else if (partial[key] !== undefined)
                result[key] = partial[key]

    return result as T
}
