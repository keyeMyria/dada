import { Component } from '@angular/core';
import { NavController, IonicPage, Platform} from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
import { BaiduMapProvider } from "../../providers/baidu-map/baidu-map";
import { addressInfo, OrderList } from "../../model/dada"


@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  orderList: Array<OrderList> =[]
  addressInfo: addressInfo = new addressInfo();
  curStatus = "";// 当前状态
  objectId = "";// 当前状态
  u_objectId = "";
  username = "";
  isCompany = "";
  timer:any;
  constructor(public navCtrl: NavController,
    public util: UtilsProvider,
    public bomb: BmobProvider,
    public bdMap: BaiduMapProvider,
    public platform: Platform) {
    platform.ready().then(async(readySource) => {
      if(readySource === 'cordova'){
        await this.getStatus()
        this.getLocation()
      }
    })
  }
  // ionViewDidLoad(){
  //   this.bomb.Bmob_GetUserObjectId().then((res: any) => {
  //     this.u_objectId = res
  //     console.log(this.u_objectId)
  //   })
  // }
  ionViewDidLeave(){
    this.timer && clearInterval(this.timer)
  }
  async ionViewDidEnter(){
    await this.bomb.Bmob_GetUserObjectId().then((res: any) => {
      this.u_objectId = res
    })
    this.getStatus() // 运行在手机上要注释掉
    this.getInfo()
    // this.test()
    this.timer = setInterval(() => {
      this.getInfo()
      this.getLocation()
    },60000)
  }
  test(){
    // this.bdMap.SearchAddress('聚鑫','湖南省')
    // 113.06146,28.242882
    this.bdMap.getDistanceByPoint(28.242882,113.06146,28.232486,112.969122,'el').then(res => {
      console.log(res)
    })
  }
  /**
   * 接受订单
   */
  async toAcceptOrder(item){
    if(this.isCompany === '1'){
      //  是企业用户
      this.util.showToastWithCloseButton('您是企业用户，请指定车辆接单')
      return
    }
    //  先判断师傅有没有认证
    if(this.curStatus === '-2' || this.curStatus === '0'){
      this.curStatus = '0'
      return
    }
    let objectId,curMasterStatus ;
    await this.bomb.Bomb_Search('userInfo',{username:this.username}).then(data => {
      objectId = data[0].objectId
      curMasterStatus = data[0].status
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
            this.util.showAlert('提示','抢单成功，立即前往救援吧');
            //  刷新
            this.getInfo()
          }).catch(err => {
            console.log(err)
          })

        }else{
          this.util.showAlert('提示','手慢了，订单已被抢，下次再接再励！')
        }
      })
    }else if(item.status === '1'){
      //  已抢到单，立即救援,跳转到map 更新order status
      this.navCtrl.push('MapPage',{item: item})
      // this.bomb.Bmob_Update('Order',item.o_objectId,{status:'2'}).then(res => {
      //   item.status = '2';
      //   this.navCtrl.push('MapPage',{item: item})
      // })
    }else{
      //  救援完成,提示用户是否确定完成，然后更改状态
      this.util.showConfirm('提示','是否确认完成救援？',()=> {},()=>{
        this.bomb.Bmob_Update('Order',item.o_objectId,{status:'3'}).then(res => {
          this.getInfo()
        })
         //  更改救援师傅状态
        this.bomb.Bmob_Update('userInfo',objectId,{status:'0'}).then(r => {
          console.log()
        })
        //  添加流水
       let uPoint =  this.bomb.Bmob_CreatePoint('_User',this.objectId)
        let ls ={
          type: 1,
          amount: parseFloat((item.amount * 0.9).toFixed(2)),
          user: uPoint,
          status: '0'
        }
        console.log(ls)
        this.bomb.Bomb_Add('bankAccount',ls).then(t => {
          console.log('流水添加成功')
        })
      })
    }
  }
  /**
   * 获取位置信息
   */
  getLocation(){
    this.bdMap.getCurrentPosition().then((res:any) => {
      //  获得定位信息，保存在本地
      this.util.setItem('address',res)
      this.addressInfo = res
      //  获取位置信息成功后，更新userInfo表
      this.updateUserInfo(res)
    })
  }
  /**
   * 获取用户状态
   */
  getStatus(){
    //  获取当前用户最新信息
    this.bomb.getUserInfo().then((res:any) => {
      console.log(res)
      this.objectId = res.objectId;// 当前用户objectId
      this.bomb.Bmob_GetInfoByObjectId('_User',res.objectId).then((da:any) => {
        this.curStatus = da.status
        this.username = da.username
        this.isCompany = da.isCompany
      })
      // let u =  this.bomb.Bmob_CreatePoint('_User',this.objectId)
      // this.bomb.Bomb_Search('company',{'user':u}).then(c => {

      // })
    })
  }
  /**
   * 获取订单信息
   * 暂不支持socket.io 定时查询，每10S查询一次
   * 根据地理位置
   */
  getInfo(){
    if(!!this.addressInfo.latitude && !!this.addressInfo.longitude){
      this.util.startLoading();
      this.bomb.Bmob_QueryLocation('Order',this.addressInfo.latitude,this.addressInfo.longitude,10,'locationFrom','0',this.u_objectId).then(async(res:any) => {
        // res.length>0 && (this.orderList = res)
        if(res.length>0){
          let tempObj;
          this.orderList = [];
          for(let i = 0;i< res.length;i++){
            tempObj = new OrderList()
            await this.bdMap.getDistanceByPoint(this.addressInfo.latitude,this.addressInfo.longitude,res[i].locationFrom.latitude,res[i].locationFrom.longitude,'el').then((d:any) => {
              tempObj.username = res[i].user.username;
              tempObj.addressFrom = res[i].addressFrom;
              tempObj.addressTo = res[i].addressTo;
              tempObj.addressFromDetail = res[i].addressFromDetail;
              tempObj.addressToDetail = res[i].addressToDetail;
              tempObj.amount = res[i].amount;
              tempObj.createdAt = res[i].createdAt;
              tempObj.fromLat = res[i].locationFrom.latitude;
              tempObj.fromLng = res[i].locationFrom.longitude;
              tempObj.nickname = res[i].user.nickname;
              tempObj.userPic = res[i].user.userPic;
              tempObj.o_objectId = res[i].objectId;
              tempObj.u_objectId = res[i].user.objectId;
              tempObj.phone = res[i].user.phone;
              tempObj.status = res[i].status;
              tempObj.toLat = res[i].toLat;
              tempObj.toLng = res[i].toLng;
              tempObj.updatedAt = res[i].updatedAt;
              tempObj.durtion = d.durtion;
              tempObj.distance = d.distance;
            })
            console.log(tempObj)
            this.orderList.push(tempObj)
          }
        }else{
          this.orderList = [];
        }
        this.util.stopLoading();
      }).catch(err => {
        console.log(err)
        console.log('暂无救援订单')
        this.util.stopLoading();
      })
    }
  }
  toPage(item){
    this.navCtrl.push('MapPage',{item: item})
  }
  /**
   * 添加或者更新userInfo表
   * @param location 位置信息
   */
  async updateUserInfo(location){
    const point = this.bomb.Bmob_CreateLocation(location.latitude,location.longitude)
    let params = {
      province: location.province,
      city: location.city,
      district: location.district,
      street: location.street,
      street_number: location.locationDescribe,
      location: point
    }
    let objId;
    await this.bomb.Bmob_GetUserObjectId().then(data => {
      objId = data;
    })
    this.bomb.Bmob_Update('userInfo',objId,params).then(res => {
      console.log('更新成功')
    })

  }
  confirm(e){
    console.log(e)
    if(e){
      //  点击了确定,跳转到认证界面，要先判断该用户是否有在认证中的信息
      this.bomb.Bmob_IncludeQuery('_User',{ objectId: this.objectId },{ key:'carInfo',value:'validUser' }).then((res:any) => {
        if(res.length>0 && !!res[0].carInfo){
          this.navCtrl.push('ReviewPage')
        }else{
          this.navCtrl.push('AuthenticationPage')
        }
      })
    }else{
      this.curStatus = '-2'
    }
  }

  getAddress(langitude,latitude){
    this.bdMap.getAddressByPoint(langitude,latitude).then(res => {
      console.log(res)
    })
  }

}
