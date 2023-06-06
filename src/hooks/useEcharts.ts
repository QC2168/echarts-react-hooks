import {MutableRefObject, useEffect} from "react";
import * as echarts from 'echarts';
import type {EChartsType, ResizeOpts} from 'echarts';
import {bind, clear} from "size-sensor";
import type {RendererType} from "echarts/types/src/util/types";

export interface UseEchartsOption {
    autoResize?: boolean
    renderer?: RendererType,
    theme?: string | object
    width?: number | 'auto'
    height?: number | 'auto'
}

const defaultResizeOpt = {
    width: 'auto',
    height: 'auto',
}
export default function useEcharts(el: MutableRefObject<HTMLElement | null>, opt: UseEchartsOption = {}) {
    // echarts实例
    let instance: EChartsType | null = null
    useEffect(() => {
        if (instance !== null) return
        initChart(el.current as HTMLElement)
    }, [el])

    const setOption = (option) => {
        if(!instance) initChart(el.current!)
        hideLoading()
        instance.setOption(option)
    }

    const showLoading = () => {
        if(!instance) initChart(el.current!)
        instance.showLoading()
    }
    const hideLoading = () => {
        instance?.hideLoading()
    }
    const resize = (opt: ResizeOpts = {}) => {
        try {
            instance?.resize(opt || defaultResizeOpt as ResizeOpts);
        } catch (e) {
            console.warn(e);
        }
    }
    const dispose=()=>{
        const ele=el.current
        if (instance && !instance.isDisposed()) {
            try {
                clear(ele);
            } catch (e) {
                6300
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

    const initChart = (el: HTMLElement) => {
        if (!el) return
        const {
            autoResize = true, renderer = 'canvas', theme = 'default', width = 'auto',
            height = 'auto'
        } = opt
        instance = echarts.init(el as HTMLElement, theme, {
            renderer: renderer as RendererType,
            width,
            height
        })
        if (autoResize) {
            bind(el, () => {
                resize();
            });
        }
    }
    return {
        setOption,
        showLoading,
        hideLoading
    }
}
