import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
/**
 * Generated class for the XingChengPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-xing-cheng',
  templateUrl: 'xing-cheng.html',
})
export class XingChengPage {
  items = [];
  status = { '-1':'用户已取消','0':'等待救援','1':'救援中','2':'救援中','3':'等待用户支付','4':'救援完成' };
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad XingChengPage');
    this.getInfo()
  }
  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // this.getInfo()
        resolve();
      }, 500);
    })
  }
  getInfo(){
    this.bmob.Bmob_GetUserObjectId().then(objectId => {
      console.log(objectId)
      let pointId =  this.bmob.Bmob_CreatePoint('userInfo',objectId);
      this.bmob.Bomb_Search('Order',{'carUser':pointId}).then((data:any) => {
        this.items = data;
      })
    })
  }
}
