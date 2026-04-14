# 循环塑料产业平台

> 中国塑料循环利用行业数字基石 —— 6位1体产业服务体系

面向塑料回收产业链上下游，提供从资讯获取、智库研究、产业协会到会展活动、技术攻关、产业基金的一站式数字化服务平台。

---

## 功能模块

### 发现资源

| 模块 | 路由 | 说明 |
|---|---|---|
| 行业媒体 | `/news` | 实时抓取行业资讯，多维标签检索，支持全文搜索与收藏 |
| 产业地图 | `/explore` | X-Y 轴双维度标签体系，精准浏览 2,400+ 企业坐标 |
| 每日情报 | `/subscribe` | 精选推送，支持邮件、企业微信等多渠道订阅 |

### 行业服务

| 模块 | 路由 | 说明 |
|---|---|---|
| 智库研究 | `/think-tank` | 深度研究报告库、行业数据看板、专家咨询服务 |
| 行业协会 | `/association` | 200+ 成员单位，三级会员体系，研究报告索取 |
| 会展活动 | `/events` | 行业峰会、专业展览、技术工坊，一键在线报名 |

### 攻坚支撑

| 模块 | 路由 | 说明 |
|---|---|---|
| 技术攻关 | `/technology` | 联合 12 所高校，跟踪机械/化学/酶解/分选四大技术方向 |
| 产业基金 | `/fund` | 5 亿+ 管理规模，覆盖天使到 B 轮全周期投资赋能 |

### 数据基石

| 模块 | 路由 | 说明 |
|---|---|---|
| 数据基石 | `/database` | 企业数据库、产业地图、结构化标签体系 |

---

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | [Next.js 14](https://nextjs.org/) (App Router) |
| 语言 | TypeScript 5 |
| UI | [Tailwind CSS 3](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| 图标 | [Lucide React](https://lucide.dev/) |
| 数据库 | PostgreSQL + [Prisma 5](https://www.prisma.io/) |
| 认证 | [NextAuth.js v4](https://next-auth.js.org/) + Prisma Adapter |
| 表单 | React Hook Form + Zod |
| 状态 | Zustand |

---

## 数据模型

```
User          # 用户账号，支持普通/管理员/高级会员角色
News          # 行业资讯，含标签、来源、浏览量
Tag           # 多维标签（实体/应用/材料/工艺/技术/地区/话题）
Dashboard     # 用户自定义看板，关联标签订阅
Bookmark      # 资讯收藏
Company       # 产业地图企业库，X-Y 轴双维度分类
Intelligence  # 每日情报条目
Subscriber    # 邮件/微信订阅者
ServiceReport # 研究报告
ServiceEvent  # 会展活动
ServiceApplication  # 统一申请表（入会/报名/融资/技术申报）
```

---

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库

### 安装与启动

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 填写 DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL

# 推送数据库结构并生成 Prisma Client
npm run db:push

# 填充初始数据（可选）
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run start        # 启动生产服务
npm run db:studio    # 打开 Prisma Studio 可视化数据库
npm run db:migrate   # 数据库迁移
```

---

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx            # 首页
│   ├── news/               # 行业媒体
│   ├── explore/            # 产业地图
│   ├── subscribe/          # 每日情报订阅
│   ├── think-tank/         # 智库研究
│   ├── association/        # 行业协会
│   ├── events/             # 会展活动
│   ├── technology/         # 技术攻关
│   ├── fund/               # 产业基金
│   ├── dashboard/          # 用户看板
│   ├── admin/              # 后台管理
│   └── auth/               # 登录 / 注册
│
├── components/
│   ├── home/               # 首页区块组件
│   │   ├── HeroSearch.tsx  # 搜索主区
│   │   ├── Features.tsx    # 6位1体业务展示
│   │   ├── SixModulesGrid.tsx
│   │   ├── DataEcosystem.tsx
│   │   ├── MatrixHub.tsx
│   │   ├── NewsFeed.tsx
│   │   └── TagCloud.tsx
│   ├── layout/             # 全局布局
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                 # 基础 UI 组件（Radix 封装）
│
└── lib/                    # 工具函数、Prisma 实例、认证配置
```

---

## 设计规范

- **主色**：深青色 `cyan-700`（海洋）、翡翠绿 `emerald-600`（可持续）
- **强调色**：青柠绿 `lime-500` 用于极少数点缀（如热门标签）
- **圆角**：全站 `rounded-2xl` / `rounded-3xl`，营造亲和感
- **卡片**：白色底 + `border border-slate-100` + `shadow-xl shadow-slate-100`
- **图标**：圆形彩色底块 `rounded-full`，各模块独立色系
- **文字**：标题 `font-black text-slate-900`，正文 `text-slate-500`
- **背景**：纯白为主，功能区用 `bg-cyan-50` / `bg-emerald-50` 区分

---

## 环境变量

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | NextAuth 签名密钥（随机字符串） |
| `NEXTAUTH_URL` | 应用访问地址，如 `http://localhost:3000` |

---

## License

Private — 仅供内部使用
