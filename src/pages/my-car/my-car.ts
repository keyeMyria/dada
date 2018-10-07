import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
import { ValidUser } from "../../model/dada"
/**
 * Generated class for the MyCarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-car',
  templateUrl: 'my-car.html',
})
export class MyCarPage {

  carInfo:any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public util:UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidEnter() {
    this.getInfo()
  }
  getInfo(){
    this.util.startLoading()
    this.bmob.getUserNewInfo().then(async (obj:any) => {
      let uPoint = this.bmob.Bmob_CreatePoint('_User',obj.objectId),cObjectId;
      if(!!obj.isCompany && obj.isCompany >0){
        // 查找企业ID
        await this.bmob.Bomb_Search('company',{'user':uPoint}).then((tt:any) => {
          if(tt.length>0){
            cObjectId = this.bmob.Bmob_CreatePoint('company',tt[0].objectId)
          }
        })
        this.bmob.Bmob_IncludeQuery('validUser',{'company':cObjectId},{key:'uInfo',value:'userInfo'}).then(async(res:Array<ValidUser>) => {
          res.length > 0 && (this.carInfo = res);
          this.util.stopLoading();
        }).catch(err => {
          console.log(err)
          this.util.stopLoading();
        })
      }else{
        console.log(obj.carInfo.objectId)
        if(!!obj.carInfo && !!obj.carInfo.objectId){
          this.bmob.Bmob_IncludeQuery('validUser',{'objectId':obj.carInfo.objectId},{key:'uInfo',value:'userInfo'}).then((res:Array<ValidUser>) => {
            res.length > 0 && (this.carInfo = res)
            this.util.stopLoading();
          }).catch(err => {
            this.util.stopLoading();
          })
        }
      }
    })

  }
}
