import fetch from 'electron-fetch'
import userConfig from '../../.user-config.js'

const { feedbackAPI } = userConfig

/**
 * 发送一封邮件
 * @param {Object} data 邮件的主体内容
 * @param {*} telUser 主题中第三个框中的内容
 * @param {Object} appInfo 邮件的相关信息
 */
// eslint-disable-next-line import/prefer-default-export
export function newEmail(data, telUser, appInfo) {
  return new Promise((resolve, reject) => {
    // 设置发件内容
    const mailOptions = {
      // from: 'strawberrypaper@163.com', // 发件人地址
      // to: 'strawberrypaper@163.com', // 收件人地址
      subject: `【${appInfo.emailType}:草莓壁纸】[${
        appInfo.version
      }]${telUser}`, // 主题
      text: '',
      html: (() => {
        let html = ''
        for (const [key, value] of Object.entries(data)) {
          html += `<div><strong>${key}:</strong><span>${value}</span><div>`
        }
        return html
      })()
    }
    const baseUrl = feedbackAPI

    fetch(baseUrl, {
      method: 'POST',
      body: JSON.stringify(mailOptions),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.text())
      .then(result => {
        resolve(result)
      })
      .catch(error => {
        reject(error.response)
      })
  })
}
