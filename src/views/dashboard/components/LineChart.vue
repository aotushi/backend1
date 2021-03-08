<template>
  <div :style="{ width, height }"></div>
</template>

<script>
import echarts from "echarts";
require('echarts/theme/macarons')  //主题引入需要使用commonjs
import resize from './mixins/resize'
export default {
  mixins: [resize],
  name: "",
  data() {
    return {
      chart:null
    };
  },
  props: {
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "350px"
    },
    chartData: {
      type: Object,
      required: true
    },
    yTittle: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.initChart();
  },
  // 监视原因: 因为数据是异步传过来的
  watch:{
    chartData:{
      deep:true,
      handler(newVal, oldVal) {
        this.setOption(newVal)
      }
    }
  },

  methods: {
    initChart() {
      // echarts.init(this.$el, 'macarons') $el是根元素, macarons是主题,可不加
      this.chart = echarts.init(this.$el, "macarons");
      this.setOption(this.chartData);
    },

    setOption({ expectedData = [], actualData = [] }) {
      this.chart.setOption({
        // 图表标题
        // title: {
        //   text: "ECharts 入门示例"
        // },
        //提示信息
        tooltip: {
          trigger:'axis',
          axisPointer:{type:'cross'},  //cross 鼠标
          
        },

        //图例
        legend: {
          data: ["期望", "实际"]
        },
        //x轴
        xAxis: {
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
          boundaryGap:false   //x轴是否两边不留白,和边缘重合 boundaryGap:false, 
        },
        //y轴 一般不需要写数据
        yAxis: {
          name:this.yTittle
        },

        // 网格,用来设置图表整体大小 距离边缘距离grid
        grid:{
          left:10,
          right:10,
          top:40,
          bottom:10,
          containeLabel:true  //是否包含图表的坐标轴
        },

        //系列
        series: [
          {
            name: "销量",
            type: "line", //柱状图
            data: expectedData,
            itemStyle:{
              color:'red'
            },
            lineStyle:{
              width:4
            }
          },
          {
            name: "库存",
            type: "line", //折线图
            data: actualData,
            itemStyle:{
              color:'blue'
            },
            lineStyle:{
              width:4
            },
            areaStyle:{
              color:'gray'
            }
          }
        ]
      });
    }
  }
};
</script>

<style></style>
