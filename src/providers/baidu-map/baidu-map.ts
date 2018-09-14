import { Injectable } from '@angular/core';
// import { UtilsProvider } from '../utils/utils'
declare var cordova: any;
declare var BMap;

/*
  Generated class for the BaiduMapProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BaiduMapProvider {
  constructor() {
    console.log('Hello BaiduMapProvider Provider');
  }
  getCurrentPosition(){
    // this.util.startLoading()
    return new Promise((resolve,reject) => {
      cordova.plugins.baidumap_location.getCurrentPosition((result) => {
        // alert(JSON.stringify(result, null, 4))
        console.log("================")
        console.log(JSON.stringify(result, null, 4));
        resolve(result)
        // this.util.stopLoading()
      }, (error) => {
        alert(JSON.stringify(error))
        reject(error)
        // this.util.stopLoading()
      });
    })
  }

  /**
   * 逆地址解析服务--通过经纬度获取地理位置
   * @param langitude 经度
   * @param latitude 维度
   */
  getAddressByPoint(langitude,latitude){
    return new Promise((resolve,reject) => {
      let myGeo = new BMap.Geocoder();
      myGeo.getLocation(new BMap.Point(langitude, latitude), function(result){
        if (result){
          resolve(result)
        }
      });
    })
  }
  /**
   * 根据两地经纬度获取两地之间多距离以及时间
   * @param latitude1 起点纬度
   * @param langitude1 起点经度
   * @param latitude2 终点纬度
   * @param langitude2 终点经度
   */
  getDistanceByPoint(latitude1,langitude1,latitude2,langitude2,el){
    return new Promise((resolve,reject) => {
      let pointA = new BMap.Point(langitude1,latitude1); // 创建点坐标A
      let pointB = new BMap.Point(langitude2,latitude2); // 创建点坐标B
      var map = new BMap.Map(el);
      // map.centerAndZoom(new BMap.Point(116.404, 39.915), 14);
      var options = {
          onSearchComplete: function(results){
              if (driving.getStatus() == 0){
                  // 获取第一条方案
                  let plan = results.getPlan(0);
                  // 获取方案的驾车线路
                  let durtion = plan.getDuration(false)/60;
                  let distance = plan.getDistance(true)
                  let data ={
                    durtion:durtion.toFixed(1)+'分钟',
                    distance: distance
                  }
                  resolve(data)
              }else{
                reject('error')
              }
          }
      };
      var driving = new BMap.DrivingRoute(map, options);
      driving.search(pointA, pointB);
    })
  }


}
