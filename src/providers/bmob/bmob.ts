import { Injectable } from '@angular/core';
import Bmob from "hydrogen-js-sdk";
/*
  Generated class for the BmobProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BmobProvider {
  private debug:Boolean = true;
  constructor() {
    //  初始化bmob
    Bmob.initialize('1245fbae9dd53f523ac14b293ee5dc60', '590809d4a7db3777c5647c2f8f17fd88')
  }
  /**
   * 获取当前用户信息---登录后才有值
   */
  getUserInfo(){
    return new Promise((resolve,reject) => {
      resolve(Bmob.User.current())
    })
  }
  /**
   * 获取用户最新信息
   */
  getUserNewInfo(){
    return new Promise((resolve,reject) => {
      this.getUserInfo().then((res:any) => {
        this.Bmob_GetInfoByObjectId('_User',res.objectId).then((da:any) => {
          console.log(da)
          resolve(da)
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    })
  }
  /**
   * 发送短信验证码
   * @param mobile 电话号码
   * @param template 短信模版名称
   */
  sendSmsCode(mobile,template){
    return new Promise((resolve,reject) =>{
      let params = {
        mobilePhoneNumber: mobile, //string
        template: template
      }
      Bmob.requestSmsCode(params).then((response) => {
        response && resolve(response)
      })
      .catch((error) =>  {
        reject(error)
        console.log(error);
      });
    })
  }

  /**
   * 验证短信验证码
   * @param mobile 手机号码
   * @param smsCode 短信验证码
   */
  verifySmsCode(mobile,smsCode){
    return new Promise((resolve,reject) => {
      let data = {
        mobilePhoneNumber: mobile
      }
      Bmob.verifySmsCode(smsCode, data).then(function (response) {
        console.log(response);
        resolve(response)
      })
      .catch(function (error) {
        reject(error)
        console.log(error);
      });
    })
  }

  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   */
  login(username,password){
    return new Promise((resolve,reject) => {
      Bmob.User.login(username,password).then(res => {
        console.log(res)
        resolve(res)
      }).catch(err => {
       console.log(err)
       reject(err)
     });
    })
  }
  /**
   * 退出登录
   */
  logonOut(){
    return Bmob.User.logout()
  }
  /**
   * 注册
   * @param data 用户注册数据
   */
  register(data){
    return new Promise((resolve,reject) => {
      let params:any = {
        username: data.mobile,
        password: data.pwd,
        phone: data.mobile,
        status: data.status,
        nickName:!!data.nickName?data.nickName:'',
      }
      if(!!data.carInfo){
        params.carInfo = data.carInfo
      }
      Bmob.User.register(params).then(res => {
        console.log(res)
        //  注册成功后往userInfo表里添数据
        const pointer = Bmob.Pointer('_User')
        const poiID = pointer.set(res.objectId)
        let da = {
          username: data.mobile,
          status: '0',
          type: '2',
          user: poiID,
          nickName:!!data.realName?data.realName:''
        }
        this.Bomb_Add('userInfo', da).then(t => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        console.log(err)
        reject(err)
      });
    })
  }
  /**
   * 更新userInfo表
   * @param params 更新参数
   */
  updateUserInfo(params){
    return new Promise((resolve,reject) => {
      Bmob.User.update(params).then(result => {
        console.log(result)
        resolve(result)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 查询--通过主键获取一行记录
   * @param {表名称} table
   * @param {主键id} objectId
   */
  Bmob_QueryByObjectId(table,objectId){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      query.get(objectId).then(res => {
      this.debug && console.log(res)
      resolve(res)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 修改一行记录
   * @param {表名称} table
   * @param {主键ID} objectId
   */
  Bmob_Update(table,objectId,params){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      query.get(objectId).then(res => {
        this.debug && console.log(res)
        for(let key in params){
          res.set(key, params[key])
        }
        res.save()
        resolve('success')
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 根据objectId 查找信息
   * @param table 表名
   * @param objectId
   */
  Bmob_GetInfoByObjectId(table,objectId){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      query.get(objectId).then(res => {
        this.debug && console.log(res)
        resolve(res)
      }).catch(err => {
        this.debug && console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 根据条件查询数据
   * @param table 表名称
   * @param params 查询参数
   */
  Bomb_Search(table,params){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      for(let key in params){
        query.equalTo(key,"==", params[key])
      }
      query.order("-updatedAt");
      query.find().then(t => {
        this.debug && console.log(t)
        resolve(t)
      }).catch(error => {
        reject(error)
      })
    })
  }
  /**
   * 添加数据
   * @param table 表名
   * @param params 参数
   */
  Bomb_Add(table,params){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      for(let key in params){
        query.set(key, params[key])
      }
      query.save().then(res => {
        this.debug && console.log(res)
        resolve(res)
      }).catch(err => {
        this.debug && console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 查询Pointer 关联表数据
   * @param table 表名
   * @param params 参数
   */
  Bmob_IncludeQuery(table,params,include){
    return new Promise((resolve,reject) => {
      const query = Bmob.Query(table);
      query.include(include.key,include.value)
      for(let key in params){
        query.equalTo(key,'==',params[key])
      }
      query.find().then(res => {
        this.debug && console.log(res)
        resolve(res)
      }).catch(err => {
        this.debug && console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 创建地理位置
   * @param latitude 纬度
   * @param longitude 经度
   */
  Bmob_CreateLocation(latitude,longitude){
    return Bmob.GeoPoint({ latitude: latitude,longitude: longitude })
    // return new Promise((resolve,rejct) => {
    //   const point = Bmob.GeoPoint({ latitude: latitude,longitude: longitude })
    //   resolve(point)
    // })
  }
  /**
   * 修改地理位置
   * @param latitude 纬度
   * @param longitude 经度
   */
  Bmob_UpdateLocation(latitude,longitude,objectId,table,key){
    return new Promise((resolve,reject) => {
      const point = Bmob.GeoPoint({ latitude: latitude,longitude: longitude })
      const query = Bmob.Query(table)
      query.get(objectId).then(res => {
        res.set(key,point)
        res.save()
        resolve('success')
      }).catch(err => {
        reject(err)
      })
    })
  }
  /**
   * 根据地理位置查询订单信息
   * @param table 表名
   * @param latitude 维度
   * @param langitude 经度
   * @param km 范围
   * @param key 地理位置字段名
   */
  Bmob_QueryLocation(table,latitude,langitude,km = 10,key,status,objectId){
    return new Promise((resolve,reject) => {
      const point = Bmob.GeoPoint({ latitude: latitude,longitude: langitude })
      const pointer = Bmob.Pointer('userInfo');
      const poiID = pointer.set(objectId); //  当前用户的objectId
      console.log(poiID);
      const query = Bmob.Query(table);
      query.withinKilometers(key, point, km);  //10指的是公里
      query.include('carUser','userInfo')
      query.include('user','_User')
      // const query1 = query.containedIn("status",['0','1'])
      query.equalTo('status','!=','4')
      query.equalTo('status','!=','-1')
      // query.equalTo('status','==',status)
      // const query1 =  query.equalTo('status','==','1')
      // const query2 = query.equalTo("carUser","==", poiID);
      // query.or(query2);
      query.find().then(res => {
        this.debug && console.log(res)
        let temp = []
        for(let i =0;i<res.length;i++){
          if(!!res[i].carUser && !!res[i].carUser.objectId && res[i].carUser.objectId != ''){
            if(res[i].carUser.objectId != objectId) continue
          }
          temp.push(res[i])
        }
        resolve(temp)
      }).catch(err => {
        this.debug && console.log(err)
        reject(err)
      })
    })
  }
  Bmob_QueryOrderByObject(objectId){
    return new Promise((resolve,reject) => {
      const pointer = Bmob.Pointer('userInfo');
      const poiID = pointer.set(objectId); //  当前用户的objectId
      const query = Bmob.Query('Order');
      query.equalTo('status','==','1')
      query.equalTo("carUser","==", poiID);
      query.find().then(res => {
        this.debug && console.log(res)
        resolve(res)
      }).catch(err => {
        this.debug && console.log(err)
        reject(err)
      })
    })
  }
  /**
   * 创建数据关联表
   * @param table 表名
   * @param objectId ID
   */
  Bmob_CreatePoint(table,objectId){
    const pointer = Bmob.Pointer(table)
    const poiID = pointer.set(objectId)
    return poiID
  }
  /**
   * 获取当前用户的车主objectId
   */
  Bmob_GetUserObjectId(){
    return new Promise((resolve,reject) => {
      this.getUserInfo().then((res:any) => {
        this.Bomb_Search('userInfo',{username: res.username}).then(data => {
          resolve(data[0].objectId)
        }).catch(err => {
          reject(err)
        })
      })
    })
  }
  /**
   * 上传文件/图片
   * @param path 文件路径
   */
  Bmob_UploadFile(path){
    return new Promise(async(resolve,reject) => {
      await this.dataURLtoBlob(path).then(dd => {
        let file = Bmob.File('dadasos.png', dd);
        file.save().then(res => {
          resolve(res)
          // alert(JSON.stringify(res))
        }).catch(err => {
          alert(JSON.stringify(err))
          reject(err)
        })
      })
    })
  }
  /**
   * 将base64转为二进制流
   * @param dataurl base64数据
   */
  dataURLtoBlob(dataurl) {
    return new Promise((resolve,reject) => {
      var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
      while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new Blob([u8arr], {
          type: mime
      }))
    })
  }
  sendMudule(item){
    let modelData = {
        "touser": item.openid,
        "template_id": "LTUlbF0gAhCnls9EDZxDspApKqs3AEqQP8T7mVtd2Cw",
        "page": "pages/orderDetail/main?objectId="+ item.o_objectId+"&lat="+item.fromLat+"&lng="+item.fromLng,
        "form_id":item.formId,
        "data": {
            "keyword1": {
                "value": "救援师傅已接单",
                "color": "#173177"
            },
            "keyword2": {
                "value": item.o_objectId
            },
            "keyword3": {
                "value": item.addressFromDetail
            },
            "keyword4": {
                "value": item.addressToDetail
            },
            "keyword5": {
              "value": item.createdAt
            },
            "keyword6": {
              "value": item.amount
            }
        }
        ,"emphasis_keyword": ""
    }

    Bmob.sendWeAppMessage(modelData).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log(error);
    });
  }
}
