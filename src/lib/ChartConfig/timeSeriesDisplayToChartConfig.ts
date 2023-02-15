import { ChartConfig } from "@/components/TimeSeriesComponent/lib/ChartConfig"
import { ChartSeries } from "@/components/TimeSeriesComponent/lib/ChartSeries"
import { cssLineStyleFromFews, chartMarkerFromFews } from "./Styles"

export function timeSeriesDisplayToChartConfig(subplot: any, title: string): ChartConfig {
  const yAxis = subplot.items[0].yAxis
  const config: ChartConfig = {
    title: title,
    xAxis: [],
    yAxis: [{
      type: 'value',
      location: yAxis.axisPosition,
      label: yAxis.axisLabel,
      defaultDomain: [yAxis.axisMinValue, yAxis.axisMaxValue]
    }],
  }
  const chartSeriesArray: ChartSeries[] = []
  for (const item of subplot.items) {
    if (item.lineStyle !== undefined && item.lineStyle !== "none") {
      const chartSeries = {
        id: `${item.request}`,
        dataResources: [
          `${item.request}`
        ],
        name: item.legend,
        unit: item.unit,
        type: 'line',
        options: {
          x: {
            key: "x",
            axisIndex: 0
          },
          y: {
            key: "y",
            axisIndex: 0
          },
        },
        style: {
          ...cssLineStyleFromFews(item.lineStyle),
          stroke: item.color,
        },
      }
      chartSeriesArray.push(chartSeries)
    }
    if (item.markerStyle !== undefined && item.markerStyle !== "none") {
      const chartSeries = {
        id: `${item.request}`,
        dataResources: [
          `${item.request}`
        ],
        name: item.legend,
        unit: item.unit,
        type: 'marker',
        options: {
          x: {
            key: "x",
            axisIndex: 0
          },
          y: {
            key: "y",
            axisIndex: 0
          },
        },
        style: {
          stroke: item.color,
          fill: item.color,
          'stroke-width': item.lineWidth + 'px',
        },
        marker: chartMarkerFromFews(item.markerStyle)
      }
      chartSeriesArray.push(chartSeries)
    }
  }
  config.series = chartSeriesArray
  return config
}
