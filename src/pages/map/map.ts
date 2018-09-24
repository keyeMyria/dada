import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ActionSheetController,Platform } from 'ionic-angular';
import { BaiduMapProvider } from "../../providers/baidu-map/baidu-map";
import { OrderList } from "../../model/dada"
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppAvailability } from '@ionic-native/app-availability';
/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var BMap;
@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  orderItem:OrderList = new OrderList();
  curStatus = "";// 当前状态
  objectId = "";// 当前状态
  u_objectId = "";
  username = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public bdMap: BaiduMapProvider, public util: UtilsProvider,public bomb: BmobProvider,private iab: InAppBrowser,private appAvailability: AppAvailability,public actionSheetCtrl: ActionSheetController,public plt: Platform) {
  }
 async ionViewDidEnter(){
    let item = this.navParams.get('item')
    item && (this.orderItem = item)
    console.log(item)
    // this.createMap(113.014288,28.23678,item.fromLng,item.fromLat)
    await this.bdMap.getCurrentPosition().then((res:any) => {
       item && this.createMap(res.longitude,res.latitude,item.fromLng,item.fromLat)
    }).catch(err => {
      alert('定位失败')
    })
  }
  /**
   * 创建地图
   * @param longitude 救援司机起始地点经度
   * @param latitude 救援司机起始地点纬度
   * @param lng 车主位置
   * @param lat 车主位置
   */
  createMap(longitude,latitude,lng,lat){
    var map = new BMap.Map("container");
    map.centerAndZoom(new BMap.Point(longitude, latitude), 14);
    var driving = new BMap.DrivingRoute(map, {
        renderOptions: {
            map: map,
            autoViewport: true
    }
    });
    var start = new BMap.Point(longitude, latitude);
    var end = new BMap.Point(lng, lat);
    driving.search(start, end);
    var startIcon = new BMap.Icon("assets/imgs/start.png",new BMap.Size(24,40))
    var endIcon = new BMap.Icon("assets/imgs/end.png",new BMap.Size(24,40))
    driving.setMarkersSetCallback(function(res){
      res[0].marker.setIcon(startIcon)
      res[1].marker.setIcon(endIcon)
    })
  }
  /**
   * 获取用户状态
   */
  getStatus(){
    //  获取当前用户最新信息
    return new Promise((resolve,reject) => {
      this.bomb.getUserInfo().then((res:any) => {
        this.objectId = res.objectId;// 当前用户objectId
        this.bomb.Bmob_GetInfoByObjectId('_User',res.objectId).then((da:any) => {
          resolve(da)
        })
      })
    })

  }
  confirm(e){
    if(e){
      //  点击了确定,跳转到认证界面
      this.navCtrl.push('AuthenticationPage')
    }else{
      this.curStatus = '-2';
    }
  }
   /**
   * 接受订单
   */
  async toAcceptOrder(item){
    //  先判断师傅有没有认证
    await this.getStatus().then((u:any) => {
      this.curStatus = u.status
      this.username = u.username
    })
    if(this.curStatus === '0') return;
    let objectId,curMasterStatus ;
    await this.bomb.Bomb_Search('userInfo',{username:this.username}).then((data:any) => {
      if(data.length>0){
        objectId = data[0].objectId
        curMasterStatus = data[0].status
      }
    })

    //  已经验证过，抢单，1.验证订单状态
    if(item.status === '0'){
      //  抢单
      if(curMasterStatus === '1'){
        this.util.showToastWithCloseButton('您还有订单未完成，如救援已完成，请点击完成救援');
        return
      }
      this.bomb.Bmob_GetInfoByObjectId('Order',item.o_objectId).then(async(res: any) => {
        if(res.status === '0'){
          //  可以抢单,更改订单状态，以及carUser字段
          let temp = this.bomb.Bmob_CreatePoint('userInfo',objectId)
          this.bomb.Bmob_Update('Order',item.o_objectId,{carUser: temp,status:'1'}).then(t => {
            //  抢单成功，弹出提示框

          }).catch(err => {
            this.util.showToast('系统错误，抢单失败，请重新抢单')
          })
          this.bomb.Bmob_Update('userInfo',objectId,{status:'1'}).then(s => {
            console.log('师傅抢单成功')
            //  刷新
            // this.getInfo()
          }).catch(err => {
            console.log(err)
          })

        }else{
          this.util.showAlert('提示','手慢了，订单已被抢，下次再接再厉！')
        }
      })
    }else if(item.status === '1'){
      //  已抢到单，立即救援,跳转到第三方导航app 跳转后更新order status
      this.actionSheetCtrl.create({
        buttons: [
          {
            text: '高德地图',
            handler: () => {
              // this.util.startLoading();
              this.toOpenApp(1)
            }
          }, {
            text: '百度地图',
            handler: () => {
              // this.util.startLoading();
              this.toOpenApp(2)
            }
          }, {
            text: '取消',
            role: 'cancel',
            handler: () => { }
          }
        ]
      }).present();

    }else if(item.status === '2'){

      this.bdMap.getCurrentPosition().then((data:any) => {
        this.bdMap.getDistanceByPoint(data.latitude,data.longitude,this.orderItem.fromLng,this.orderItem.fromLat,'el').then((tt:any) => {
          console.log(tt.distance)
          let d = parseFloat(tt.distance.replace('公里',''))
          if(d > 1.5){
            //  超过1公里，不能点击到达救援点
            this.util.showToastWithCloseButton('未在用户故障点附近，不能点击到达救援点，请到达救援点再操作')
            return
          }
          //  救援完成,提示用户是否确定完成，然后更改状态
          this.util.showConfirm('提示','是否确认到达救援点？',()=> {},()=>{
            this.bomb.Bmob_Update('Order',item.o_objectId,{status:'3'}).then(res => {
              this.orderItem.status = '3';
            })

            //  更改救援师傅状态
            // this.bomb.Bmob_Update('userInfo',objectId,{status:'0'}).then(r => {
            //   console.log()
            // })
            //  添加流水
          //  let uPoint =  this.bomb.Bmob_CreatePoint('_User',this.objectId)
          //   let ls ={
          //     type: 1,
          //     amount: parseInt((item.amount * 0.9).toFixed(2)),
          //     user: uPoint,
          //     status: '0'
          //   }
          //   console.log(ls)
          //   this.bomb.Bomb_Add('bankAccount',ls).then(t => {
          //     console.log('流水添加成功')
          //   })
          })
        })
      })

      //  救援完成,提示用户是否确定完成，然后更改状态
      // this.util.showConfirm('提示','是否确认完成救援？',()=> {},()=>{
      //   this.bomb.Bmob_Update('Order',item.o_objectId,{status:'3'}).then(res => {
      //     // this.navCtrl.push('HomePage')
      //     this.navCtrl.setRoot('HomePage')
      //   })
      //   //  更改救援师傅状态
      //   this.bomb.Bmob_Update('userInfo',objectId,{status:'0'}).then(r => {
      //     // console.log()
      //   })
      //   //  添加流水
      //  let uPoint =  this.bomb.Bmob_CreatePoint('_User',this.objectId)
      //  let ls ={
      //    type: 1,
      //    amount: parseFloat((item.amount * 0.9).toFixed(2)),
      //    user: uPoint,
      //    status: '0'
      //  }
      //  this.bomb.Bomb_Add('bankAccount',ls).then(t => {
      //    console.log('流水添加成功')
      //  })
      // })
    }
  }

  toOpenApp(type){
    //  打开高德地图

    let schemeIntent,createName;
    if(type === 1){
      if(this.plt.is('ios')){
        schemeIntent="iosamap://";
        createName = "iosamap://";
      }else if(this.plt.is('android')){
        schemeIntent = 'com.autonavi.minimap';
        createName = 'androidamap://'
      }
    }else{
      if(this.plt.is('ios')){
        schemeIntent = 'baidumap://';
        createName = "baidumap://";
      }else if(this.plt.is('android')){
        schemeIntent = 'com.baidu.BaiduMap';
        createName = 'bdapp://'
      }
    }
    this.appAvailability.check(schemeIntent).then((yes: boolean) => {
      // this.util.stopLoading();
        if(type === 1){
          this.iab.create(createName+'navi?sourceApplication=MyApp&lat='+this.orderItem.fromLat+'&lon='+this.orderItem.fromLng+'&dev=1&style=2');
        }else{
          // bdapp://map/direction?region=beijing&origin=39.98871,116.43234&destination=西直门&mode=driving&src=andr.baidu.openAPIdemo
          // this.iab.create(createName+'map/navi?location='+this.orderItem.fromLat,this.orderItem.fromLng+'&src=io.ionic.starter.dadasos')
          this.iab.create(createName+'map/direction?origin='+this.orderItem.fromLat,this.orderItem.fromLng+'&mode=driving&src=io.ionic.starter.dadasos')
        }
        //  更改订单状态
      this.bomb.Bmob_Update('Order',this.orderItem.o_objectId,{status:'2'}).then(res => {
        this.orderItem.status = '2';
      })
      },
      (no: boolean) => {
        // this.util.stopLoading();
          /* 未安装，请编写提示代码或跳转下载 */
        this.util.showToastWithCloseButton('您暂未安装该客户端，请选择其它导航app')
      })
  }
  toDaoHang(){
    this.actionSheetCtrl.create({
      buttons: [
        {
          text: '高德地图',
          handler: () => {
            // this.util.startLoading();
            this.toOpenApp(1)
          }
        }, {
          text: '百度地图',
          handler: () => {
            // this.util.startLoading();
            this.toOpenApp(2)
          }
        }, {
          text: '取消',
          role: 'cancel',
          handler: () => { }
        }
      ]
    }).present();
  }


}
