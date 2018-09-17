import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
/**
 * Generated class for the MePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-me',
  templateUrl: 'me.html',
})
export class MePage {

  private username:string = '';
  private pic:string;
  private isCompany:string;
  user:any;
  constructor(public navCtrl: NavController, public util: UtilsProvider,public bmob: BmobProvider) {

  }
  ionViewDidEnter(){
    this.bmob.getUserInfo().then((res:any) => {
      this.pic = res.userPic;
      this.username = !!res.nickName? res.nickName: res.username;
    })
  }
  toPage(page){
    this.navCtrl.push(page)
  }


}
