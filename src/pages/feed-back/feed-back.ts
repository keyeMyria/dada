import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
/**
 * Generated class for the FeedBackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feed-back',
  templateUrl: 'feed-back.html',
})
export class FeedBackPage {
  item = {
    text:'',
    mobile:''
  }
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedBackPage');
  }
  async toApply(){
    console.log(this.item)
    if(this.item.text == ''){
      this.util.showToast('请输入反馈信息')
      return
    }
    this.util.startLoading();
    let phone,uPoint;
    await this.bmob.getUserInfo().then((res:any) => {
      uPoint = this.bmob.Bmob_CreatePoint('_User',res.objectId);
      phone = res.username
    })
    let data ={
      content:this.item.text,
      mobile: this.item.mobile,
      phone:phone,
      user: uPoint
    }
    this.bmob.Bomb_Add('feedBack',data).then((dd:any) => {
      this.util.showToastWithCloseButton('感谢您的反馈，我们就及时改进，祝您生活愉快');
      this.navCtrl.setRoot('HomePage')
      this.util.stopLoading()
    }).catch(err => {
      this.util.showToast('服务出错，反馈失败,请稍后再试')
      this.util.stopLoading();
    })
  }
}
