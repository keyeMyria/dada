import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob";
import { TabsPage } from '../../pages/tabs/tabs';
/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  mobile: String = "";
  pwd: String = "";
  toNext: Boolean = false;
  code = "";
  codeMsg = "获取验证码";
  timer: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }
  ionViewWillLeave() {
    //  关闭定时器
    if(this.timer){
      clearInterval(this.timer);
    }
  }
  judgeMobile(){
    this.toNext = this.code.length === 6 && this.util.isMobile(this.mobile) && this.pwd.length>=6
  }
  /**
   * 获取短信验证码
   */
  getSmsCode(){
    //  检查手机号格式是否正确
    if(this.util.isMobile(this.mobile)){
      this.util.startLoading()
      this.bmob.sendSmsCode(this.mobile,'注册').then(res => {
        console.log(res)
        let number = 180;
        this.timer = setInterval(() => {
          number--;
          if (number < 0) {
            this.codeMsg = "获取验证码";
            clearInterval(this.timer);
          } else {
            this.codeMsg = number + "s后重新获取";
          }
        }, 1000);
        this.util.stopLoading()
      }).catch(error => {
        this.util.showToast('短信获取失败')
        this.util.stopLoading()
      })
    }else{
      this.util.showToast('手机号码格式不正确')
    }
  }
  toUse(){
    //  注册，1.验证短信验证码是否正确
    this.bmob.verifySmsCode(this.mobile,this.code).then(res => {
      //  验证成功，注册，更新userInfo表
      let data = {
        mobile: this.mobile,
        pwd: this.pwd,
        status: '0'
      }
      this.bmob.register(data).then(d =>{
        this.util.showToast('注册成功,请登录')
        this.navCtrl.setRoot('LoginPage',{ mobile: this.mobile })
      }).catch(error => {
        if(error.code === 202){
          this.util.showToast("该手机号码已经注册")
        }else{
          this.util.showToast(error.error)
        }
      })
    }).catch(error => {
      if(error.code === 207){
        this.util.showToast('验证码错误')
      }else{
        this.util.showToast(error.error)
      }
    })

  }
}
