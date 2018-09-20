import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"

/**
 * Generated class for the TestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-test',
  templateUrl: 'test.html',
})
export class TestPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public bmob: BmobProvider, public util: UtilsProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TestPage');
  }
  async addOrder(){
    // 113.061466,28.242882
    // 112.969122,28.232486
    // 116.399095,39.924453
    let point = this.bmob.Bmob_CreateLocation(39.924453,116.399095)
    console.log(point)
    let objectId;
    await this.bmob.getUserInfo().then((res:any) => {
      objectId = res.objectId
    })
    let u = this.bmob.Bmob_CreatePoint('_User',objectId)
    let params = {
      addressFrom: '天俺们',
      addressFromDetail: '背景市开福区世界之窗',
      addressTo: '星火钱包',
      addressToDetail: '湖南省长沙市岳麓区岳麓大道世贸商业区3楼星火钱包',
      locationFrom: point,
      status: '0',
      toLat: 38.232486,
      toLng: 115.969122,
      amount: 2100,
      user: u,
    }
    this.bmob.Bomb_Add('Order',params).then(da => {
      console.log('订单添加成功')
    }).catch(error => {
      console.log('添加失败')
    })

  }

}
