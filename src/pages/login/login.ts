import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob";
import { TabsPage } from '../../pages/tabs/tabs';


/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  mobile: String = "";
  pwd: String = "";
  toNext: Boolean = false;
  isOldUser: Boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public util: UtilsProvider,public bmob: BmobProvider) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad LoginPage");
    let mobile = this.navParams.get('mobile')
    if(mobile){
      this.mobile = mobile
    }
  }
  //  登录
  toLogin(){
    console.log('....')
  }
  //  判断手机号
  judgeMobile(){
    this.toNext = this.util.isMobile(this.mobile) && this.pwd.length>=6
  }
  toUse(){
    //  登录
    this.util.startLoading()
    this.bmob.login(this.mobile,this.pwd).then(res => {
      console.log(res)
      //  保存用户信息 && 跳转到首页
      this.navCtrl.setRoot('TabsPage');
      this.util.showToast('登录成功')
      this.util.stopLoading()
    }).catch(err => {
      console.log(err)
      //  提示错误
      if(err.code === 101){
        this.util.showToast('用户名或密码错误')
      }else{
        this.util.showToast(err.error)
      }
      this.util.stopLoading()
    })
  }
  //  忘记密码
  forgetPwd(){
    this.navCtrl.push('RegisterPage');
  }
}
