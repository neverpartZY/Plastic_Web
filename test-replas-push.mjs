import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const REPLAS_SECRET = 'GP_Secret_2026_!#'

function cleanContent(raw) {
  const authorIdx = raw.indexOf('作者：')
  const recIdx   = raw.indexOf('### 推荐文章')
  let body = ''
  if (authorIdx !== -1 && recIdx !== -1 && authorIdx < recIdx) {
    body = raw.slice(authorIdx, recIdx)
  } else {
    body = raw
  }
  body = body.replace(/^作者：.*?\n发布于：.*?\n分类：.*?\n/, '')
  body = body.replace(/!\[.*?\]\(https:\/\/static2\.xunxiang\.site\/.*?\)/g, '')
  body = body.replace(/!\[.*?\]\(https:\/\/wework\.qpic\.cn\/.*?\)/g, '')
  body = body.replace(/^#  \[ !\[logo\].*?\)\n/m, '\n')
  body = body.replace(/^\* \[ (展会概况|观众中心|展商中心|会议论坛|新闻资讯|联系方式|协会支持).*?\]\(https:\/\/www\.replas.*?\)\n/gm, '')
  body = body.replace(/^中文简体\n/gm, '')
  body = body.replace(/^!\[\]\(https:\/\/static2\.xunxiang\.site\/dist\/theme\/static\/flags\/.*?\)\n/gm, '')
  body = body.replace(/^分享\n+/g, '')
  body = body.replace(/^\* \[  \]\(javascript:void\(0\);\).*\n?/gm, '')
  body = body.replace(/^\* \[ .*?\]\(javascript:\).*\n?/gm, '')
  body = body.replace(/扫码加微信咨询\n*/g, '')
  body = body.replace(/本篇文章来源于微信公众号:.*$/gm, '')
  body = body.replace(/^\* \[ 上一篇：.*?\]\(.*?\)\n?/gm, '')
  body = body.replace(/^\* \[ 下一篇：.*?\]\(.*?\)\n?/gm, '')
  body = body.replace(/信息咨询，老朋友请联系工作人员，新朋友请扫码电话：[\d（）]+（微信同号）\n?/g, '')
  body = body.replace(/^联系电话：[\d\-]+ ?/gm, '')
  body = body.replace(/^联系邮箱：[\w@．.]+ ?/gm, '')
  body = body.replace(/^地址：.*$/gm, '')
  body = body.replace(/^微信公众号\n\| \[协会支持\].*$/gm, '')
  body = body.replace(/\n{3,}/g, '\n\n')
  return body.trim()
}

const json = JSON.parse(readFileSync('D:/Download/replas_2026_04_full_202604292027.json', 'utf8'))
const a = json.articles[0]
const cleaned = cleanContent(a.content)

const payload = {
  title: a.title,
  date: a.date,
  source: '中国合成树脂协会塑料循环利用分会',
  url: a.url,
  full_content: cleaned,
}

const hash = createHash('sha256').update(a.url.trim().toLowerCase()).digest('hex').slice(0, 32)
console.log('URL hash:', hash)
console.log('Cleaned length:', cleaned.length)
console.log('First 200 chars:\n', cleaned.slice(0, 200))

const res = await fetch('https://greenplastic.ai/api/refine', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + REPLAS_SECRET,
  },
  body: JSON.stringify(payload),
})
const data = await res.json()
console.log('\nResponse:', res.status, JSON.stringify(data, null, 2))