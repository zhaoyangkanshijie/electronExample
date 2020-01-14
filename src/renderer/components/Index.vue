<template>
  <div id="index">
    <div class="item" v-for="item in stock" :key="item.id">
      |<span>{{item.name}}</span>|<span>{{item.nowPrice}}</span>|<span>{{item.percentage}}</span>|
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  const fs = require("fs");

  export default {
    name: 'index',
    data() {
      return {
        stock: []
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getApiData(data) {
        axios.get('http://hq.sinajs.cn/list='+data)
        .then((response)=>{
          //console.log(response.data)
          let data = response.data.toString();
          let content = data.split('"').filter((value,index,arr)=>{
            return index % 2 == 1;
          });
          let tmp = [];
          let stock = [];
          for(let i = 0;i < content.length;i++){
            var detail = content[i].split(',');
            let name = detail[0].toString().slice(0,2);
            let yesterdayPrice = parseFloat(detail[2]);
            let nowPrice = parseFloat(detail[3]);
            let highest = parseFloat(detail[4]);
            let lowest = parseFloat(detail[5]);
            let delta = parseFloat(nowPrice)-parseFloat(yesterdayPrice);
            let percent = (parseFloat(delta)/parseFloat(yesterdayPrice)*100).toFixed(2);
            let percentage = percent >= 0 ? '+'+percent+"%" : ' '+percent+"%";
            let obj = {
              id: i,
              name: name,
              yesterdayPrice: yesterdayPrice,
              priceNumber: nowPrice,
              nowPrice: nowPrice.toFixed(2).toString().padStart(7,'0'),
              highest: highest,
              lowest: lowest,
              delta: delta,
              percent: percent,
              percentage: percentage
            }
            tmp.push(obj)
          }
          Array.prototype.push.apply(stock,tmp.slice(0,3));
          //console.log(1,stock)
          tmp = tmp.slice(3);
          //console.log(2,stock)
          tmp.sort((a,b)=>{
            return parseFloat(a.percent) - parseFloat(b.percent);
          });
          //console.log(3,stock)
          Array.prototype.push.apply(stock,tmp);
          this.stock = stock;
          //console.log(4,this.stock)
        })
        .catch((error)=>{
          console.log(error)
        })
      }
    },
    mounted() {
      let data = fs.readFileSync("src/userData/stock.data", "utf8");
      //console.log(data)
      setInterval(()=>{this.getApiData(data)},2000);
    },
  }
</script>

<style lang="scss" scope>
  @import "../scss/index.scss";
</style>
