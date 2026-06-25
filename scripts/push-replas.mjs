/**
 * 处理 replas.org.cn 批量爬取结果
 * 清洗噪音内容 → /api/refine 推送
 *
 * 用法: node scripts/push-replas.mjs <json文件路径>
 *       node scripts/push-replas.mjs                    # 默认 D:/Download/replas_2026_04_full_202604292027.json
 */

import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const REPLAS_SECRET = process.env.REFINE_SECRET ?? 'GP_Secret_2026_!#'
const API_BASE = process.env.REFINE_API ?? 'https://greenplastic.ai/api/refine'

// ── 内容清洗 ─────────────────────────────────────────────────────────────────

function cleanContent(raw) {
  // 1. 定位正文区间：第一个"作者："之后，第一个"### 推荐文章"之前
  //    replas.org.cn 内容结构：
  //    [噪音: site header x2 + company info x2]
  //    作者：xxx
  //    发布于：xxx
  //    分类：xxx
  //    [正文段落]
  //    ### 推荐文章
  //    [噪音: footer nav + contact + toolbar]
  const authorIdx = raw.indexOf('作者：')
  const recIdx   = raw.indexOf('### 推荐文章')

  let body = ''
  if (authorIdx !== -1 && recIdx !== -1 && authorIdx < recIdx) {
    // 提取：作者行 到 推荐文章前一段
    body = raw.slice(authorIdx, recIdx)
  } else {
    // 降级：把整个文件当正文（极少情况）
    body = raw
  }

  // 2. 移除作者/发布时间/分类行
  body = body.replace(/^作者：.*?\n发布于：.*?\n分类：.*?\n/, '')

  // 3. 移除 Markdown 图片语法
  body = body.replace(/!\[.*?\]\(https:\/\/static2\.xunxiang\.site\/.*?\)/g, '')
  body = body.replace(/!\[.*?\]\(https:\/\/static2\.xunxiang\.site\/.*?\n.*?\)/g, '')   // 跨行
  body = body.replace(/!\[.*?\]\(https:\/\/wework\.qpic\.cn\/.*?\)/g, '')             // 二维码
  body = body.replace(/!\[.*?\]\(https:\/\/wework\.qpic\.cn\/.*?\n.*?\)/g, '')

  // 4. 移除 xunxiang.site 的 logo 图片行
  body = body.replace(/^#  \[ !\[logo\].*?\)\n/m, '\n')
  body = body.replace(/^\[ !\[logo\].*?\)\n/m, '\n')

  // 5. 移除顶部导航链接块（展会概况、关于展会、展区规划...）
  body = body.replace(/^\* \[ (展会概况|观众中心|展商中心|会议论坛|新闻资讯|联系方式|协会支持).*?\]\(https:\/\/www\.replas.*?\)\n/gm, '')

  // 6. 移除语言切换行
  body = body.replace(/^中文简体\n/gm, '')
  body = body.replace(/^!\[\]\(https:\/\/static2\.xunxiang\.site\/dist\/theme\/static\/flags\/.*?\)\n/gm, '')

  // 7. 移除社交分享按钮行
  body = body.replace(/^分享\n+/g, '')

  // 8. 移除微信二维码提示
  body = body.replace(/扫码加微信咨询\n*/g, '')

  // 9. 移除文末微信公众号来源
  body = body.replace(/本篇文章来源于微信公众号:.*$/gm, '')

  // 10. 移除"上一篇文章 / 下一篇文章"链接
  body = body.replace(/^\* \[ 上一篇：.*?\]\(.*?\)\n?/gm, '')
  body = body.replace(/^\* \[ 下一篇：.*?\]\(.*?\)\n?/gm, '')

  // 11. 移除图片引用后的 info block（信息咨询、联系电话等）
  body = body.replace(/信息咨询，老朋友请联系工作人员，新朋友请扫码电话：[\d（）]+（微信同号）\n?/g, '')

  // 12. 移除残留的 logo 引用行
  body = body.replace(/^!\[\]\(https:\/\/static2\.xunxiang\.site\/.*?\.png\)\n?/gm, '')

  // 13. 移除 contact block（电话、邮箱、地址、微信公众号）
  body = body.replace(/^联系电话：[\d\-]+ ?/gm, '')
  body = body.replace(/^联系邮箱：[\w@．.]+ ?/gm, '')
  body = body.replace(/^地址：.*$/gm, '')
  body = body.replace(/^微信公众号\n\| \[协会支持\].*$/gm, '')

  // 14. 清理多余空行
  body = body.replace(/\n{3,}/g, '\n\n')

  return body.trim()
}

// ── 主逻辑 ────────────────────────────────────────────────────────────────────

async function pushArticle(article, retries = 3) {
  const cleaned = cleanContent(article.content)

  if (cleaned.length < 200) {
    return { url: article.url, skipped: true, reason: `内容太短（${cleaned.length} chars）` }
  }

  const payload = {
    title:        article.title,
    date:         article.date,
    source:       '中国合成树脂协会塑料循环利用分会',
    url:          article.url,
    full_content: cleaned,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(API_BASE, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${REPLAS_SECRET}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      })

      if (res.ok) {
        const data = await res.json()
        return {
          url:     article.url,
          ok:      true,
          id:      data.id ?? null,
          updated: data.updated ?? false,
        }
      }

      // 502/504 重试，其他错误直接退出循环
      if (res.status === 502 || res.status === 504 || res.status === 503) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1200 * attempt))
          continue
        }
      }

      const data = await res.json().catch(() => ({}))
      return { url: article.url, ok: false, status: res.status, reason: data.error ?? res.statusText }

    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt))
        continue
      }
      return { url: article.url, ok: false, reason: e.message }
    }
  }
}

async function main() {
  const filePath = process.argv[2] ?? 'D:/Download/replas_2026_04_full_202604292027.json'
  const json = JSON.parse(readFileSync(filePath, 'utf8'))
  const articles = json.articles.filter(a => a.success)

  console.log(`\n📦 replas.org.cn ${articles.length} 篇文章待推送\n`)

  let created = 0, updated = 0, skipped = 0, failed = 0

  for (let i = 0; i < articles.length; i++) {
    const a = articles[i]
    process.stdout.write(`[${i + 1}/${articles.length}] ${a.title.slice(0, 36)}... `)

    const result = await pushArticle(a)

    if (result.skipped) {
      console.log(`⏭️  跳过（${result.reason}）`)
      skipped++
    } else if (result.ok) {
      console.log(result.updated ? `🔄 更新 id=${result.id}` : `✅ 新建 id=${result.id}`)
      if (result.updated) updated++; else created++
    } else {
      console.log(`❌ ${result.reason ?? result.status}`)
      failed++
    }

    await new Promise(r => setTimeout(r, 400))
  }

  console.log(`\n✅ 完成：新建 ${created}，更新 ${updated}，跳过 ${skipped}，失败 ${failed}\n`)
}

main().catch(console.error)