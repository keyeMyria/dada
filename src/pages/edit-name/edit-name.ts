import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"

/**
 * Generated class for the EditNamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-name',
  templateUrl: 'edit-name.html',
})
export class EditNamePage {
  nickname = '';
  callBack:Function;
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider) {
    this.nickname = navParams.get('nickname');
    this.callBack = navParams.get('callBack');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditNamePage');
  }
  changeName(){
    console.log(this.nickname)
    if(!!this.nickname && this.nickname != ''){
      //  获取当前用户objectId
      this.bmob.getUserInfo().then((res:any) => {
        this.bmob.Bmob_Update('_User',res.objectId,{'nickname':this.nickname}).then(data => {
          //  更新成功，返回上级
          this.navCtrl.pop(this.callBack(this.nickname));
        }).catch(error => {
          this.util.showToast('更新失败，请稍后再试')
        })
      })
    }
  }
}
