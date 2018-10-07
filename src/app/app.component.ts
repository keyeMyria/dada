import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { BaiduMapProvider } from "../providers/baidu-map/baidu-map";
import { BmobProvider } from "../providers/bmob/bmob"
// declare var cordova: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  // rootPage:any = 'RegisterPage';
  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public bmob: BmobProvider) {
    platform.ready().then((readySource) => {
      statusBar.styleDefault();
      setTimeout(() => {
        splashScreen.hide();
      }, 1000)
      this.initApp()
    });
  }
  initApp(){
    //  判断当前用户是否登录
    this.bmob.getUserInfo().then(res => {
      console.log(res)
      this.rootPage = !!res ? 'TabsPage' : 'LoginPage'
    })
  }
}
