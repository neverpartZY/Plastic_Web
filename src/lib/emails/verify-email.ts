/**
 * 邮箱验证邮件模板
 */
export function buildVerifyEmailHtml(options: { name: string; verifyUrl: string }): string {
  const { name, verifyUrl } = options
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证您的邮箱地址</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">国嘉基业情报平台</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Intelligence Platform</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #374151;">您好 ${name}，</p>
      <p style="font-size: 16px; color: #374151;">感谢您注册国嘉基业情报平台！请点击下方按钮验证您的邮箱地址：</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%); color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">验证邮箱</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">或者复制以下链接到浏览器打开：</p>
      <p style="font-size: 13px; color: #1a56db; word-break: break-all;">${verifyUrl}</p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 32px;">此链接将在24小时后失效。如非本人操作，请忽略此邮件。</p>
    </div>
  </div>
</body>
</html>
`
}
