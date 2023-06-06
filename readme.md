## 前言

最近在一个`react`项目中需要使用到`echarts`图表，但是直接把`echarts`里`demo`实例直接搬运到项目上又有点不优雅，所以我用`react+hooks`的方式二次封装了`hook`和组件方便以后项目直接使用，也就了这一篇文章

> 如果您想看Vue版本的echarts封装，可以看看[如何在Vue3中更优雅的使用echart图表](https://juejin.cn/post/7098646141889151006)这一篇文章，主要讲述了在`Vue3`中如何结合`compositionApi`来使用`echarts`这个图表组件库

## 普通的使用echarts

我们先来看一下，我们普通的使用`hooks`和写图表需要怎么做的

```tsx
import {useEffect, useRef} from 'react'
import * as echarts from 'echarts';
import {EChartsType} from 'echarts';

type EChartsOption = echarts.EChartsOption;

function App() {
    // echart实例
    let chartInstance: EChartsType | null = null
    // 获取dom元素
    const el = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        // 初始化数据
        chartInstance = echarts.init(el.current as unknown as HTMLDivElement)
        const option: EChartsOption = {
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: [150, 230, 224, 218, 135, 147, 260],
                    type: 'line'
                }
            ]
        };
        // 设置图表内容
        chartInstance.setOption(option);
        // 注销实例
        return () => {
            chartInstance?.dispose()
        }
    }, [])
    return (
        <>
            <div>
                {/*图表元素*/}
                <div style={{height: '500px', width: '500px'}} ref={el}></div>
            </div>

        </>
    )
}
```
![20230606212748](https://raw.githubusercontent.com/QC2168/note-img/main/20230606212748.png)

从上面的代码中，我们简单的将`echarts`中的折线图案例放到了一个`react-hook`项目中

嗯.. 从目前来看很简单的吧，但是在业务上我们还需要加载图表时的加载状态、当页面大小改变时执行一些操作，使得代码变得更加的复杂不好维护，而且图表数量越多也会使得代码耦合度越高

这个时候，我们可以利用`react16.8`之后的`hook feature`对`echarts`进行二次封装，把一些常用的功能进行封装复用，有效的减少代码的耦合度

### 先看效果

### hooks封装

在封装这个`hooks`之前，我们首先要确定我们需要什么样子的功能

- 自动生成一个`echarts`实例
- 提供一个设置`option`的钩子，供图标数据更新
- 在渲染图标之前，显示`loading`效果

```tsx
export default function useEcharts(el: MutableRefObject<HTMLElement | null>) {
    // echarts实例
    let instance: EChartsType | null = null

    const initChart = (el: HTMLElement) => {
        if (!el) return
        instance = echarts.init(el as HTMLElement)
    }
    
    useEffect(() => {
        if (instance !== null) return
        initChart(el.current as HTMLElement)
    }, [el])
    

    const setOption = (option:ECBasicOption) => {
        hideLoading()
        instance?.setOption(option)
    }

    const showLoading = () => {
        instance?.showLoading()
    }
    const hideLoading = () => {
        instance?.hideLoading()
    }

    return {
        setOption,
        showLoading,
        hideLoading
    }
}
```
经过上面简单的代码封装，现在我们在组件中使用图表只需要给`hook`传入一个元素作为渲染图表元素，更新图表时使用`hook`导出的`setOption`即可，如果您还想显示loading效果，你可以使用`showLoading`，`hideLoading`方法

### 在组件时使用
```tsx
// 获取dom元素
const el = useRef<HTMLDivElement | null>(null)
// 传递元素给useEcharts
const {setOption} = useEcharts(el)
useEffect(() => {
    const option: EChartsOption = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }
        ]
    };
    // 设置图表内容
    setOption(option);
}, [])
```

## 额外封装

### 重置图表大小

当页面大小发生变化时，图表元素的宽高可能也会发生改变

这个时候，我们需要对图表的大小进行调整，这个`echarts`已经提供了`Api`（`echartsInstance.resize`）

我们在`hooks`中添加一个`resize`方法，用于重置图表大小并导出`resize`方法

在`hooks`的第二个对象参数里接收一个`autoResize`参数，用于判断当元素大小变动时是否`resize`图表

> 这里代码就不贴全啦，只贴核心代码
```tsx
export interface UseEchartsOption {
    autoResize?: boolean
}
```
```tsx
import {bind} from "size-sensor";
// 初始化图表时
const resize = (opt: ResizeOpts = {}) => {
    try {
        instance?.resize(opt || defaultResizeOpt as ResizeOpts);
    } catch (e) {
        console.warn(e);
    }
}

const initChart = (el: HTMLElement) => {
    const {
        autoResize = true
    } = opt
    // 添加以下代码
    if (autoResize) {
        bind(el, () => {
            resize();
        });
    }
}
```

> size-sensor包，是用于检测DOM元素的尺寸变化的，当DOM元素的大小变化，执行一些用户操

### 主题设定

考虑到用户可能会使用到`echarts`的主题设置功能，我们也要把主题属性提供给用户操作

同样，在`option`中新增接收一个`theme`属性，在初始化的时候传入在`init`函数

```ts
export interface UseEchartsOption {
    // ...
    theme?: string
}
```

```ts
const initChart = (el: HTMLElement) => {
    if (!el) return
    // 默认情况下，theme值为default
    const {autoResize = true, theme = 'default'} = opt
    instance = echarts.init(el as HTMLElement, theme)
    if (autoResize) {
        bind(el, () => {
            resize();
        });
    }
}
```
### 渲染器

`echarts`默认的使用`canvas`元素进行渲染的，其实它还提供了另外一种渲染方式，那就是`SVG`模式

当用户想要使用`SVG`模式渲染时，目前`hook`是还没有实现这一块功能的，我们在`option`中新增接收`renderer`作为渲染模式选择的参数

```ts
export interface UseEchartsOption {
    // ...
    renderer?: 'SVG'|'CANVAS'
}
```

```tsx
const initChart = (el: HTMLElement) => {
    if (!el) return
    const {
        autoResize = true, renderer = 'canvas', theme = 'default'
    } = opt
    instance = echarts.init(el as HTMLElement, theme, {
        renderer: renderer as RendererType,
    })
}
```
### 遇到个小问题

在封装这里的时候，**遇到个问题**，我不能直接写`{renderer}`，而是`renderer: renderer as RendererType`，`renderer`我默认是给的一个字符串的`canvas`，但是`typescript`却给我一个警告说类型不匹配，有点神奇~

所以我只能把`renderer`断言为`RendererType`类型解决它 

```ts
// RendererType的类型也是字符串，不太明白为什么不能这样子写
// 有大佬讲解下么  谢谢
export declare type RendererType = 'canvas' | 'svg';
```

### 注销事件

当用户在离开页面时，我们需要把图表实例注销和元素绑定的事件进行注销，在`hooks`添加一个`dispose`方法，用于注销一系列的事件。

```ts
const dispose=()=>{
    const ele=el.current
    if (instance && !instance.isDisposed()) {
        try {
            clear(ele);
        } catch (e) {
            console.warn(e);
        }
        instance.dispose();
    }
}
useEffect(()=>{
    return ()=>{
        dispose();
    }
},[])
```

到了这里，封装的`hook`基本上就完成啦，但是我觉得还不够~

接下来我还要再封装一个组件 😀😀

> hook的完整代码：[useEcharts.ts](https://github.com/QC2168/echarts-react-hooks/blob/main/src/hooks/useEcharts.tsx)
> 
> 这里就不直接贴出来了 因为太占地方了有点影响阅读体验 📄

### 组件封装

除了用`hook`来进行封装，我们可以再进行组件封装，把图表封装在一个组件里面

之后，我们需要渲染一个图表的时候，只需要引入这个组件并传入一个`option`即可

```tsx
function App() {
    const [option, setOption] = useState<EChartsOption>({
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [15, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }
        ]
    })
    return (
        <>
            <EchartsCmp option={option} width={500} height={500}></EchartsCmp>
        </>
    )
}

export default App
```

### 项目仓库地址

[echarts-react-hooks](https://github.com/QC2168/echarts-react-hooks)
