import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
import { Company } from "../../model/dada"
/**
 * Generated class for the CompanyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-company',
  templateUrl: 'company.html',
})
export class CompanyPage {
  company:Company = new Company();
  hasCompany:Boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams,public actionSheetCtrl: ActionSheetController,public camera: Camera, public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CompanyPage');
    this.getInfo()
  }
  getInfo(){
    this.bmob.getUserInfo().then((res: any) => {
      let uPoint = this.bmob.Bmob_CreatePoint('_User',res.objectId)
      this.bmob.Bomb_Search('company',{'user':uPoint}).then((data:Array<Company>) => {
        this.hasCompany = data.length>0
        data.length>0 && (this.company = data[0])
      })
    })
  }
  async nextStep(){
    //  提交
    console.log(this.company)
    //  验证判断
    if(this.company.companyName == undefined || this.company.companyName == ''){
      this.util.showToast('企业名称不能为空')
      return
    }
    if(this.company.companyCEO == undefined || this.company.companyCEO == ''){
      this.util.showToast('身份证号不能为空')
      return
    }
    if(this.company.companyCard == undefined || this.company.companyCard == ''){
      this.util.showToast('请上传营业执照')
      return
    }
    //  上传,获取当前用户信息
    this.util.startLoading()
    let objectId,params;
    await this.bmob.getUserInfo().then((res:any) => {
      objectId = res.objectId
    })
    let u = this.bmob.Bmob_CreatePoint('_User',objectId)
    this.company.user = u;
    this.company.status = '0';//  审核初始状态
    this.bmob.Bomb_Add('company',this.company).then(async(data:any) => {
      //  更新user信息,审核成功后才更新user 状态
      this.bmob.Bmob_Update('_User',objectId,{'isCompany': '0' }).then(res => {
        console.log('添加成功');
      })
      //  跳转至待审核页
      this.navCtrl.push('ReviewPage')

      this.util.stopLoading();
    }).catch(err => {
      this.util.showToast('上传失败，请重新上传');
      this.util.stopLoading();
    })
  }

   // 选择照片来源
   selectPhotoType(type) {
    let that = this;
    this.actionSheetCtrl.create({
      buttons: [
        {
          text: '相册',
          handler: () => {
            this.util.startLoading();
            that.takePhotos(0,0,type);
          }
        }, {
          text: '拍照',
          handler: () => {
            this.util.startLoading();
            that.takePhotos(1, 0, type);
          }
        }, {
          text: '取消',
          role: 'cancel',
          handler: () => { }
        }
      ]
    }).present();
  }
  // 选择照片
  /*
  * sourceType 0相册，1相机
  * mediaType 0照片，1视频
  */
  takePhotos(sourceType, mediaType, type) {
    let that = this;
    const options: CameraOptions = {
      quality: 50,// 图片质量
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: sourceType, // sourceType 0表示相册，1表示相机
      mediaType: mediaType
    }
    this.camera.getPicture(options).then((filePath) => {
      let base64Image = 'data:image/jpeg;base64,' + filePath;
      this.bmob.Bmob_UploadFile(base64Image).then(res => {
        this.company.companyCard = res[0].url;
        this.util.stopLoading();
      }).catch(err => {
        this.util.stopLoading();
      })
    }, (err) => {
      this.util.stopLoading();
      console.error(err);
    });
  }
}
