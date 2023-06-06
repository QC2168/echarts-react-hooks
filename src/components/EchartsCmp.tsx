import React, {useEffect, useRef} from "react";
import useEcharts, {UseEchartsOption} from "../hooks/useEcharts";
import {EChartsOption} from "echarts";
import {clear} from "size-sensor";

export interface PropsType extends UseEchartsOption {
    option: EChartsOption;
    loading?: boolean;
    height?: number;
    width?: number;
}

export default (props: PropsType):React.FC => {
    // 获取dom元素
    const el = useRef<HTMLDivElement | null>(null)
    // 传递元素给useEcharts
    const {setOption, showLoading, hideLoading} = useEcharts(el,{
        theme:props.theme
    })

    useEffect(() => {
        // 设置图表内容
        console.log(props.option)
        if (props.option) {
            setOption(props.option);

        }
    }, [props.option])

    useEffect(() => {
        if (props.loading) {
            showLoading()
        } else {
            hideLoading()
        }
    }, [props.loading])


    return(
        <>
            <div ref={el} style={{height: `${props.height}px`, width: `${props.width}px`}}></div>
        </>
    )
}
