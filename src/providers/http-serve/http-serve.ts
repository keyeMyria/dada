import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { UtilsProvider } from '../utils/utils'
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { TimeoutError } from "rxjs";
/*
  Generated class for the HttpServeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpServeProvider {

  private timeoutMillisecond = 15000;// 超时时间设置为15秒
  constructor(public http: Http,public utils: UtilsProvider) {
    console.log('Hello HttpServeProvider Provider');
  }
      // post 和 get请求
  public post(url: string, paramObj: any, cb?: Function) {
    this.utils.startLoading();
    console.log("请求地址:" + url);
    console.log("参数:"+JSON.stringify(paramObj));
      let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});
      return this.http.post(url, this.toBodyString(paramObj), new RequestOptions({headers: headers,withCredentials:true})).map(res => res.json()).timeout(this.timeoutMillisecond).subscribe(
      data => {
        this.utils.stopLoading();
        console.log(data);
        cb(data)
      },
      err => {
        this.utils.stopLoading();
        cb({status: 0, info: this.getErrMsg(err)})
      }
    );
    }


  public get(url, params?: Object, cb?: Function) {
    this.utils.startLoading();
    console.log("请求地址:" + url);
    console.log("参数:"+JSON.stringify(params));
    var searchParams = new URLSearchParams;
    if (params) {
      for (var key in params) {
        searchParams.append(key, params[key])
      }
    }
    let options = new RequestOptions({ search: searchParams ,withCredentials:true});
    return this.http.get(url, options).map(res => res.json()).timeout(this.timeoutMillisecond).subscribe(
      data => { this.utils.stopLoading(); console.log(data); cb(data);},
      err => { this.utils.stopLoading(); cb({status: 0, info: this.getErrMsg(err)}) }
    );
  }
  private toBodyString(obj) {
    let ret = [];
    for (let key in obj) {
      key = encodeURIComponent(key);
      let values = obj[key];
      if (values && values.constructor == Array) {//数组
        let queryValues = [];
        for (let i = 0, len = values.length, value; i < len; i++) {
          value = values[i];
          queryValues.push(this.toQueryPair(key, value));
        }
        ret = ret.concat(queryValues);
      } else { //字符串
        ret.push(this.toQueryPair(key, values));
      }
    }
    return ret.join('&');
  }
  private toQueryPair(key, value) {
    if (typeof value == 'undefined') {
      return key;
    }
    return key + '=' + encodeURIComponent(value === null ? '' : String(value));
  }
  private getErrMsg(error: Response | any) {
    console.error("origin error: " + error);
    let errMsg: string;
    if (error instanceof Response) {
      errMsg = "网络出错啦~";
    } else {
      if (error instanceof TimeoutError) {
        //请求超时异常
        errMsg = "请求超时，请重试！";
      } else {
        errMsg = "服务器出小差啦~";
      }
    }
    console.error("errmsg: " + errMsg);
    return errMsg;
  }
}
