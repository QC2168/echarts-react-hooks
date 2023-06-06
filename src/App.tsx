import {useEffect, useState} from 'react'
import './App.css'
import * as echarts from 'echarts';
import EchartsCmp from "./components/EchartsCmp";

type EChartsOption = echarts.EChartsOption;

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
