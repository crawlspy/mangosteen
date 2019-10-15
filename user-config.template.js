/**
* 用户的自定义配置文件，存放用户的一些账号信息。
* 执行npm命令后会自动生成.user-config.js文件。
* 目前相关信息只会影响到电子邮箱与关键词的翻译
*/
export default {
    emailUserName: '', // 电子邮箱账号
    emailPassword: '', // 电子邮箱的授权码
    googletrans: true, // 默认使用google 翻译
    themoviedbAppKey: '',
    feedbackAPI: 'https://submit-form.com/your-form',
    baiDuTranslationAppId: '', // 百度翻译的appID
    baiDuTranslationAppKey: '' // 百度翻译的appKey
}
