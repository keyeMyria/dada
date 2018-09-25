import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
/**
 * Generated class for the SettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  jdFw = '10';
  userInfo:any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams,public util: UtilsProvider,public bmob: BmobProvider,public app:App,public alertCtrl: AlertController) {
    let f = util.getItem('jdFw')
    if(!!f && f !='') this.jdFw = f;
  }

  ionViewDidEnter() {
    console.log('ionViewDidLoad SettingPage');
    this.bmob.getUserNewInfo().then((res:any) => {
      this.userInfo = res;
    })
  }
  toLogout(){
    this.util.showConfirm('提示','是否确定退出登录?',()=>{},()=>{
      this.bmob.logonOut();
      this.app.getRootNav().setRoot('LoginPage');
    })
  }
  toPage(value, type) {
    let obj = {
      nickName:'',
      userPic: ''
    }
    if(type == 1){
      obj.nickName = this.userInfo.nickName;
    }else{
      obj.userPic = this.userInfo.userPic;
    }
    this.navCtrl.push(value, obj);
  }
  showRadio() {
    let alert = this.alertCtrl.create();
    alert.setTitle('设置接单范围');
    alert.addInput({
      type: 'radio',
      label: '1~5公里',
      value: '5',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: '5~10公里',
      value: '10',
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: '10~15公里',
      value: '15',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: '15~20公里',
      value: '20',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: '20~50公里',
      value: '50',
      checked: false
    });

    alert.addButton('取消');
    alert.addButton({
      text: '确定',
      handler: data => {
        console.log(data)
        this.jdFw = data;
        this.util.setItem('jdFw',data);// 存入本地
      }
    });
    alert.present();
  }
  showPrompt() {
    const prompt = this.alertCtrl.create({
      title: '设置用户名',
      message: "",
      inputs: [
        {
          name: 'nickName',
          placeholder: '输入用户名'
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '修改',
          handler: data => {
            console.log(data);
            if(data.nickName == ""){
              this.util.showToast("请填写您的用户名")
              return
            }
            // this.bmob.getUserInfo().then((res:any) => {
            //   this.bmob.Bmob_Update('_User',res.objectId,{'nickName':data.nickName}).then(da => {
            //     this.util.showToast("修改成功")
            //     this.userInfo.nickName = data.nickName;
            //   })
            // })
          }
        }
      ]
    });
    prompt.present();
  }
}

