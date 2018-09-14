import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BmobProvider } from "../../providers/bmob/bmob"
import { UtilsProvider } from "../../providers/utils/utils";
/**
 * Generated class for the CashFlowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cash-flow',
  templateUrl: 'cash-flow.html',
})
export class CashFlowPage {

  items = []
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CashFlowPage');
    this.getInfo();
  }
  getInfo(){
    this.util.startLoading()
    this.bmob.getUserInfo().then((res:any) => {
      //  res.objectId
      let uPoint = this.bmob.Bmob_CreatePoint('_User',res.objectId)
      this.bmob.Bomb_Search('bankAccount',{'user': uPoint}).then((data:any) => {
        data.length> 0 && (this.items = data)
        this.util.stopLoading();
      }).catch(err => {
        this.util.showToast('数据请求失败，请稍后再试');
        this.util.stopLoading();
      })
    })
  }
}
