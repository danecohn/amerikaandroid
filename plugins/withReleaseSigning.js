const {withAppBuildGradle}=require('@expo/config-plugins');
module.exports=config=>withAppBuildGradle(config,config=>{
 let source=config.modResults.contents;
 source=source.replace('signingConfigs {',`signingConfigs {
        if (System.getenv("AMERIKA_UPLOAD_STORE_FILE")) {
            upload {
                storeFile file(System.getenv("AMERIKA_UPLOAD_STORE_FILE"))
                storePassword System.getenv("AMERIKA_UPLOAD_STORE_PASSWORD")
                keyAlias System.getenv("AMERIKA_UPLOAD_KEY_ALIAS")
                keyPassword System.getenv("AMERIKA_UPLOAD_KEY_PASSWORD")
            }
        }`);
 const start=source.indexOf('        release {');
 if(start<0)throw Error('Cannot locate Android release configuration');
 source=source.slice(0,start)+source.slice(start).replace('signingConfig signingConfigs.debug','if (System.getenv("AMERIKA_UPLOAD_STORE_FILE")) { signingConfig signingConfigs.upload } else { signingConfig null }');
 config.modResults.contents=source;return config;
});
