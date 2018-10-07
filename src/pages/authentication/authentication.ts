import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UtilsProvider } from "../../providers/utils/utils";
import { BmobProvider } from "../../providers/bmob/bmob"
import { ValidUser } from "../../model/dada"

/**
 * Generated class for the AuthenticationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-authentication',
  templateUrl: 'authentication.html',
})
export class AuthenticationPage {
  // realName:string;
  // cardId:string;
  // carNumber:string;
  user:ValidUser = new ValidUser();
  selectStatus: Object = { 1:'cardFoward',2: 'cardBack', 3: 'drivieCard',4: 'xingshiCard',5:'carPic' };
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController,public camera: Camera, public util: UtilsProvider,public bmob: BmobProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AuthenticationPage');
  }

  async nextStep(){
    //  提交
    console.log(this.user)
    //  验证判断
    if(this.user.realName == undefined || this.user.realName == ''){
      this.util.showToast('车主姓名不能为空')
      return
    }
    if(this.user.mobile == undefined || this.user.mobile == ''){
      this.util.showToast('车主电话不能为空')
      return
    }
    if(!this.util.isMobile(this.user.mobile)){
      this.util.showToast('车主电话格式不正确')
      return
    }
    if(this.user.cardId == undefined || this.user.cardId == ''){
      this.util.showToast('身份证号不能为空')
      return
    }
    if(!this.util.isIDCardNum(this.user.cardId)){
      this.util.showToast('身份证号格式不正确')
      return
    }
    if(this.user.carNumber == undefined || this.user.carNumber == ''){
      this.util.showToast('车牌号不能为空')
      return
    }
    if(this.user.cardFoward == undefined || this.user.cardFoward == ''){
      this.util.showToast('请上传身份证正面照')
      return
    }
    if(this.user.cardBack == undefined || this.user.cardBack == ''){
      this.util.showToast('请上传身份证反面照')
      return
    }
    if(this.user.drivieCard == undefined || this.user.drivieCard == ''){
      this.util.showToast('请上传驾驶证正面照')
      return
    }
    if(this.user.xingshiCard == undefined || this.user.xingshiCard == ''){
      this.util.showToast('请上传行驶证正面照')
      return
    }
    this.util.startLoading()
    //  上传,获取当前用户信息
    let objectId,isCompany,tempBool = false;
    await this.bmob.getUserNewInfo().then((res:any) => {
      objectId = res.objectId;
      isCompany = res.isCompany;
    })
    let u = this.bmob.Bmob_CreatePoint('_User',objectId)
    this.user.user = u;
    //  该用户是企业用户
    if(!!isCompany && isCompany ==='1'){
     await this.bmob.Bomb_Search('company',{'user':u}).then((c:any) => {
       if(c.length > 0){
        this.user.company = this.bmob.Bmob_CreatePoint('company',c[0].objectId)
        this.user.status = '2'
       }
     })
      //  如果是企业的话，则注册一个车主账号，密码默认1111111
      let d = {
        mobile:this.user.mobile,
        pwd: '1111111',
        status: '1',
        // carInfo: c,
        nickName:this.user.realName
      }
      await this.bmob.register(d).then((r:any) => {
        console.log('注册成功')
        let p = this.bmob.Bmob_CreatePoint('userInfo',r.uObjectId)
        this.user.uInfo = p
        objectId = r.objectId
        // this.bmob.Bmob_Update('validUser',data.objectId,{'uInfo':p })
      }).catch(er =>{
        console.log(er)
        tempBool = true
        this.util.stopLoading()
        this.util.showToastWithCloseButton("添加失败，请检查手机号是否重复")
        return
      })
    }
    if(tempBool) return
    // this.user.company = compay_point
    this.bmob.Bomb_Add('validUser',this.user).then(async(data:any) => {
      //  更新user信息
      let c = this.bmob.Bmob_CreatePoint('validUser',data.objectId)
      this.bmob.Bmob_Update('_User',objectId,{'carInfo': c })
      //  短信通知管理员
      this.bmob.sendSmsCode('18575501087','车主审核').then(uu => {})
      if(!!isCompany && isCompany ==='1'){
        this.navCtrl.pop()
      }else{
        this.navCtrl.push('ReviewPage')
      }
      //  跳转至待审核页
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
        switch(type){
          case 1:
          this.user.cardFoward = res[0].url;
          break;
          case 2:
          this.user.cardBack = res[0].url;
          break;
          case 3:
          this.user.xingshiCard = res[0].url;
          break
          case 4:
          this.user.drivieCard = res[0].url;
          break;
        }
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
