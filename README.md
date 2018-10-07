
## 第三方插件安装
- jpush
```
cordova plugin add jmessage-phonegap-plugin --variable APP_KEY=c49b12d82b7e58b7c98d97b2
```
JKS 密钥库使用专用格式。建议使用 "keytool -importkeystore -srckeystore dadasos.keystore -destkeystore dadasos.keystore -deststoretype pkcs12" 迁移到行业标准格式 PKCS12。

进入到 .android 文件中，输入如下指令即可获取
发布版SHA1：在cmd下  keytool -list -v -keystore /Users/liwenhong/car-help/dada/dadasos.keystore 
开发版SHA1：在cmd下  keytool -list -v -keystore debug.keystore


## 安卓打包
```
ionic cordova build android --prod --release

# 密码: 123456
jarsigner -verbose -keystore dadasos.keystore -signedjar dadasos.apk platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk dadasos.keystore


# zipalign 需要下载并设置path
zipalign -v 4 /Users/liwenhong/car-help/dada/dadasos.apk 哒哒救援.apk

```

## 安卓微信微博的 应用签名: 
```
0c98d830700c3470a7d112c21fb2a134
```

## ios打包
```
## step1 clean

xcodebuild clean -project /Users/haokur/code/project/com.bananafish.coupon/platforms/ios/香蕉鱼.xcodeproj -configuration ${CONFIGURATION} -alltargets

## step2 archive

xcodebuild archive -project /Users/haokur/code/project/com.bananafish.coupon/platforms/ios/香蕉鱼.xcodeproj -scheme 香蕉鱼 -archivePath bin/香蕉鱼.xcarchive

## step3 配置AdHocExportOptions.plist(xml格式)

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key>
	<string>ad-hoc</string>
	<key>compileBitcode</key>
	<string>NO</string>
</dict>
</plist>

## step4 导出ipa
xcodebuild -exportArchive -archivePath bin/香蕉鱼.xcarchive  -exportOptionsPlist /Users/haokur/code/project/com.bananafish.coupon/AdHocExportOptions.plist -exportPath /Users/haokur/code/ 

## step4并不支持自选profile(错误)
-exportProvisioningProfile /Users/haokur/Desktop/8119b17d-acc3-4cc9-a63a-04aedff1b8bb.mobileprovision

```
