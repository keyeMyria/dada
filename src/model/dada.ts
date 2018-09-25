export class addressInfo{
  constructor(){
    this.latitude = 28.23678;
    this.longitude = 113.014288
    this.city = '长沙市'
  }
  province:string;
  city: string;
  district: string;
  street: string;
  street_number: string;
  latitude: number;
  longitude: number;
  locationDescribe:string;
}

export class OrderList{
  constructor(){}
  addressFrom:string;
  addressFromDetail:string;
  addressTo:string;
  addressToDetail:string;
  createdAt:string;
  status:string;
  toLat:number;
  toLng:number;
  fromLat:number;
  fromLng:number;
  updatedAt:string;
  username:string;
  o_objectId:string;
  u_objectId:string;
  c_objectId:string;
  phone:string;
  nickName:string;
  userPic:string;
  amount:number;
  durtion:string;
  distance:string;
  formId:string;
  openid:string;
}
export class ValidUser{
  constructor(){
    this.status = '0'
  }
  realName:string;//  真实姓名
  cardId:string; // 身份证号
  user: any;
  cardFoward: string;
  carNumber: string;//  车牌号
  carPic:string;//  人车图片
  xingshiCard: string;
  company: any;
  status: string;
  cardBack: string;
  drivieCard: string;//驾驶证照片
  mobile: string;
  uInfo:any;
}
export class Company{
  constructor(){}
  user:any;
  status:string;
  companyCard:string;
  companyName:string;
  chargeMobile:string;
  companyCEO:string;
  companyAddress:string;
}
