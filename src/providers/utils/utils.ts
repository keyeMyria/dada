import { Injectable } from "@angular/core";
import { ToastController, AlertController, LoadingController } from "ionic-angular";

/*
  Generated class for the UtilsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilsProvider {
  private loading:any;
  constructor(
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
  ) {
    console.log("Hello UtilsProvider Provider");
  }
  /**
   * 验证是否是手机号码
   * @param mobile 手机号码
   */
  isMobile(mobile) {
    if (mobile) {
      let moreg = /^1\d{10}$/;
      return moreg.test(mobile.trim());
    } else {
      return false;
    }
  }
  /**
   * 全局加载
   */
  startLoading() {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        content: '请稍候...'
      });
      this.loading.present();
      console.log('loading init');
    }
  }
  /**
   * 结束加载
   */
  stopLoading() {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
      console.log('loading dismiss');
    }
  }
  /**
   * 提示
   * @param message 提示信息
   * @param position 显示位置
   */
  showToast(message, position = "buttom") {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: position
    });
    toast.present(toast);
  }

  /**
   * 带关闭按钮的提示框
   * @param message 提示信息
   */
  showToastWithCloseButton(message) {
    const toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      closeButtonText: "确定"
    });
    toast.present();
  }
  // 全局Alert
  showAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ["确定"]
    });
    alert.present();
  }
  /**
   * 弹框确认
   * @param title 标题
   * @param message 确认信息
   * @param cancelHander 取消事件
   * @param sureHander 确定事件
   */
  showConfirm(
    title: string,
    message: string,
    cancelHander: Function,
    sureHander: Function
  ) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "取消",
          handler: () => {
            cancelHander();
          }
        },
        {
          text: "确定",
          handler: () => {
            sureHander();
          }
        }
      ]
    });
    confirm.present();
  }

  /**
   * 全局缓存
   */
  setItem(key,value){
    window.localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
  }
  getItem(key){
    return window.localStorage.getItem(key);
  }
  getUserName(){
    let da = window.localStorage.getItem('userInfo');
    if(da){
      return JSON.parse(da).username
    }else{
      return false
    }
  }
  removeItem(key){
    window.localStorage.removeItem(key);
  }
  clear(){
    window.localStorage.clear();
  }

  //判断是否是身份号码
  isIDCardNum(num) {
    num = num.toUpperCase();
    //身份证号码为18位，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
    if (!/(^\d{17}([0-9]|X)$)/.test(num)) {
      return false;
    }
    //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
    //下面分别分析出生日期和校验位
    let re,
      nTemp = 0,
      len = num.length,
      arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
      arrCh = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
    if (len === 18) {
      re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
      let arrSplit = num.match(re);

      //检查生日日期是否正确
      let dtmBirth = new Date(
        arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]
      );
      let bGoodDay;
      bGoodDay =
        dtmBirth.getFullYear() == Number(arrSplit[2]) &&
        dtmBirth.getMonth() + 1 == Number(arrSplit[3]) &&
        dtmBirth.getDate() == Number(arrSplit[4]);
      if (!bGoodDay) {
        return false;
      } else {
        //检验18位身份证的校验码是否正确。
        //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
        let valnum;
        for (let i = 0; i < 17; i++) {
          nTemp += num.substr(i, 1) * arrInt[i];
        }
        valnum = arrCh[nTemp % 11];
        return arrCh[nTemp % 11] == num.substr(17, 1);
      }
    }
    return false;
  }
}
