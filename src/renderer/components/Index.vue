<template>
  <div id="index" ref="box">
    <div class="draggable" ref="container">
      <div class="option">
        <p class="color" @click="changeColor()">颜色</p>
        <p class="background" @click="changeBackground()">背景</p>
        <p class="opacity" @click="changeOpacity()">透明</p>
        <p class="hide" @click="hideMenu()">隐藏</p>
        <p class="hide" @click="openOption()">选项</p>
      </div>
      <div class="init" v-show="state == 1">
        <textarea class="number" type="text" placeholder="sh600001,sz000001" v-model="stockNumber"></textarea>
        <button class="button" @click="confirmStock()">确定</button>
      </div>
      <div class="list" v-show="state == 2">
        <div class="item" v-for="item in stock" :key="item.id">
          <span class="name" @click="showPicture(item.number)">|{{item.name}}</span>
          <span class="price">|{{item.nowPrice}}</span>
          <span class="precent">|{{item.percentage}}|</span>
        </div>
      </div>
      <div class="options" v-show="state == 3">
        <input class="frequency" placeholder="刷新频率" v-model="options.frequency" />
        <p class="sort">
          <span class="aesc" :class="options.orderByAesc == true ? 'active': ''" @click="options.orderByAesc = true">正序</span>
          <span class="desc" :class="options.orderByAesc == false ? 'active': ''" @click="options.orderByAesc = false">倒序</span>
        </p>
        <button class="optionsSubmit" @click="submitOptions()">确定</button>
        <button class="initStock" @click="initStock()">初始化</button>
      </div>
      <div class="actual" v-show="state == 4">
        <div class="actual-function">
          <button class="actual-title" @click="actualTime='min'">分钟</button>
          <button class="actual-title" @click="actualTime='daily'">日</button>
          <button class="actual-title" @click="actualTime='weekly'">周</button>
          <button class="actual-title" @click="actualTime='monthly'">月</button>
        </div>
        <img class="picture" :src="'http://image.sinajs.cn/newchart/'+actualTime+'/n/'+activeNumber+'.gif'" />
        <button @click="state = 2">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  //const fs = require("fs");
  //const path = require("path");
  let ipcRenderer = require('electron').ipcRenderer;

  export default {
    name: 'index',
    data() {
      return {
        stock: [],
        //colorCollection: ["#000000","#ffffff","#ff0000","#00ff00","#0000ff"],
        currentColor: 1,
        //backgroundCollection: ["transparent","#000000","#ffff00","#00ffff","#ff00ff"],
        currentBackground: 1,
        //backgroundCollection: [0.2,0.4,0.6,0.8,1],
        currentOpacity: 1,
        state: 1,
        stockNumber: 'sz399001,sh000001,sz399006,sh588000,sh601933,sz002815,sz002189,sz300533,sz300773,sz300498,sz000938,sh600487,sh603936,sz002252,sz300666,sz300632,sh601211,sz000555,sz002296,sh601186,sz000963,sz300020,sz300231,sz002938,sz300042,sh600373,sh600837,sz300007,sh600741,sh600643,sz002602,sh510710,sh512710,sh515750,sz002236,sz159998,sz002384,sz002230,sz002001,sh601601,sz002465,sz002281,sz159870',
        options: {
          orderByAesc: true,
          frequency: 2000
        },
        timer: null,
        actualTime: 'min',
        activeNumber: 'sz399001'
      }
    },
    methods: {
      confirmStock() {
        this.state = 2;
        this.timer = setInterval(()=>{
          this.getApiData()
        },this.options.frequency);
      },
      changeColor() {
        //let i = this.colorCollection.indexOf(this.$refs.container.style.color);
        //console.log(this.$refs.container.style.color,i)
        //this.$refs.container.style.color = this.colorCollection[++i>=this.colorCollection.length?0:i];
        
        if(this.currentColor == 1){
          this.currentColor = 2;
          this.$refs.container.style.color = "#ffffff";
        }
        else if(this.currentColor == 2){
          this.currentColor = 3;
          this.$refs.container.style.color = "#ff0000";
        }
        else if(this.currentColor == 3){
          this.currentColor = 4;
          this.$refs.container.style.color = "#00ff00";
        }
        else if(this.currentColor == 4){
          this.currentColor = 5;
          this.$refs.container.style.color = "#0000ff";
        }
        else{
          this.currentColor = 1;
          this.$refs.container.style.color = "#000000";
        }
      },
      changeBackground() {
        if(this.currentBackground == 1){
          this.currentBackground = 2;
          this.$refs.container.style.backgroundColor = "#000000";
        }
        else if(this.currentBackground == 2){
          this.currentBackground = 3;
          this.$refs.container.style.backgroundColor = "#ffff00";
        }
        else if(this.currentBackground == 3){
          this.currentBackground = 4;
          this.$refs.container.style.backgroundColor = "#00ffff";
        }
        else if(this.currentBackground == 4){
          this.currentBackground = 5;
          this.$refs.container.style.backgroundColor = "#ff00ff";
        }
        else{
          this.currentBackground = 1;
          this.$refs.container.style.backgroundColor = "transparent";
        }
      },
      changeOpacity() {
        if(this.currentOpacity == 1){
          this.currentOpacity = 2;
          this.$refs.box.style.opacity = 0.4;
        }
        else if(this.currentOpacity == 2){
          this.currentOpacity = 3;
          this.$refs.box.style.opacity = 0.6;
        }
        else if(this.currentOpacity == 3){
          this.currentOpacity = 4;
          this.$refs.box.style.opacity = 0.8;
        }
        else if(this.currentOpacity == 4){
          this.currentOpacity = 5;
          this.$refs.box.style.opacity = 1;
        }
        else{
          this.currentOpacity = 1;
          this.$refs.box.style.opacity = 0.2;
        }
      },
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      getApiData() {
        axios.get('http://hq.sinajs.cn/list='+this.stockNumber)
        .then((response)=>{
          //console.log(response.data)
          let data = response.data.toString();
          let content = data.split('"').filter((value,index,arr)=>{
            return index % 2 == 1;
          });
          let tmp = [];
          let stock = [];
          let number = this.stockNumber.split(',');
          for(let i = 0;i < content.length;i++){
            var detail = content[i].split(',');
            let name = detail[0].toString();
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
              number: number[i],
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
          Array.prototype.push.apply(stock,tmp.slice(0,4));
          //console.log(1,stock)
          tmp = tmp.slice(4);
          //console.log(2,stock)
          if(this.options.orderByAesc){
            tmp.sort((a,b)=>{
              return parseFloat(a.percent) - parseFloat(b.percent);
            });
          }
          else{
            tmp.sort((a,b)=>{
              return parseFloat(b.percent) - parseFloat(a.percent);
            });
          }
          //console.log(3,stock)
          Array.prototype.push.apply(stock,tmp);
          this.stock = stock;
          //console.log(4,this.stock)
        })
        .catch((error)=>{
          console.log(error)
        })
      },
      keyboardEvent() {
        document.onkeydown = (e) => {
          //console.log(e.keyCode,this)
          if(e.keyCode == 81){
            this.$refs.container.style.color = "#000000";
          }
          else if(e.keyCode == 87){
            this.$refs.container.style.color = "#ffffff";
          }
          else if(e.keyCode == 69){
            this.$refs.container.style.color = "#ff0000";
          }
          else if(e.keyCode == 82){
            this.$refs.container.style.color = "#00ff00";
          }
          else if(e.keyCode == 84){
            this.$refs.container.style.color = "#0000ff";
          }
          else if(e.keyCode == 65){
            this.$refs.container.style.backgroundColor = "transparent";
          }
          else if(e.keyCode == 83){
            this.$refs.container.style.backgroundColor = "#000000";
          }
          else if(e.keyCode == 68){
            this.$refs.container.style.backgroundColor = "#ffff00";
          }
          else if(e.keyCode == 70){
            this.$refs.container.style.backgroundColor = "#00ffff";
          }
          else if(e.keyCode == 71){
            this.$refs.container.style.backgroundColor = "#ff00ff";
          }
          else if(e.keyCode == 90){
            this.$refs.box.style.opacity = 0.2;
          }
          else if(e.keyCode == 88){
            this.$refs.box.style.opacity = 0.4;
          }
          else if(e.keyCode == 67){
            this.$refs.box.style.opacity = 0.6;
          }
          else if(e.keyCode == 86){
            this.$refs.box.style.opacity = 0.8;
          }
          else if(e.keyCode == 66){
            this.$refs.box.style.opacity = 1;
          }
          else if(e.keyCode == 80){
            this.hideMenu();
          }
        }
      },
      hideMenu() {
        ipcRenderer.send('window-min');
      },
      openOption() {
        this.state = 3;
      },
      submitOptions() {
        clearInterval(this.timer);
        this.state = 2;
        this.timer = setInterval(()=>{
          this.getApiData()
        },this.options.frequency);
      },
      initStock() {
        this.state = 1;
        clearInterval(this.timer);
      },
      showPicture(number) {
        console.log(number)
        this.state = 4;
        this.activeNumber = number;
      }
    },
    mounted() {
      //let data = fs.readFileSync(path.join(__dirname, '../userData/stock.data'), "utf8");
      //console.log(path.join(__dirname, '../userData/stock.data'));
      //console.log(data)
      this.keyboardEvent();
    },
  }
</script>

<style lang="scss" scope>
  @import "../scss/index.scss";
</style>
