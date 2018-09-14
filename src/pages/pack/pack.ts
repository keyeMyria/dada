import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BmobProvider } from "../../providers/bmob/bmob"
import { UtilsProvider } from "../../providers/utils/utils";
/**
 * Generated class for the PackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pack',
  templateUrl: 'pack.html',
})
export class PackPage {
  items =[];
  amount:Number = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PackPage');
    this.getInfo()
  }
  getInfo(){
    this.util.startLoading()
    let tempAmount = 0;
    this.bmob.getUserInfo().then((res:any) => {
      let uPoint = this.bmob.Bmob_CreatePoint('_User',res.objectId)
      this.bmob.Bomb_Search('bankAccount',{'user': uPoint,'status':'1'}).then((data:any) => {
        data.length> 0 && (this.items = data)
        if(data.length> 0){
          for(let i =0;i<data.length;i++){
            if(data[i].type === 0){
              tempAmount -= data[i].amount
            }else{
              tempAmount += data[i].amount
            }
          }
          this.amount = tempAmount;
        }
        this.util.stopLoading()
      }).catch(err => {
        this.util.showToast('数据请求失败，请稍后再试')
        this.util.stopLoading()
      })
    })
  }
}
