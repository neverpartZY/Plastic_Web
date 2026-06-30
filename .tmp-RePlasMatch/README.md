# 再塑通 RePlasMatch — 再生塑料撮合小程序

## 项目结构

```
RePlasMatch/
├── app.html              # 前端单页应用（可直接浏览器打开）
├── backend/              # Express API 后端
│   ├── server.js         # 主入口，端口 3456，同时托管前端静态文件
│   ├── db.js             # JSON 文件数据库（非 SQLite，零依赖）
│   ├── helpers.js        # 工具函数（sanitize、验证等）
│   ├── match_engine.js   # 撮合引擎
│   ├── package.json      # Node 依赖：express, cors, uuid
│   ├── routes/
│   │   ├── users.js      # 用户注册/登录
│   │   ├── listings.js   # 供需发布/查询
│   │   ├── matches.js    # 撮合匹配
│   │   ├── prices.js     # 行情价格
│   │   └── stats.js      # 统计数据
│   └── data/
│       └── zaisutong.db  # 种子数据（JSON 格式），含 20 条供需 + 4 个用户
└── rematch-miniapp/      # uni-app 微信小程序源码
    ├── pages/            # 4 个主页面：index/market/match/mine
    ├── components/       # 6 个组件：SupplyForm/DemandForm/MatchCard 等
    ├── cloudfunctions/   # 云函数（供微信小程序后端使用）
    └── utils/            # 工具模块
```

## 快速启动（Web 版）

### 前置条件
- Node.js >= 16
- 无需数据库（使用 JSON 文件存储）

### 步骤

```bash
# 1. 进入 backend 目录
cd RePlasMatch/backend

# 2. 安装依赖（3 个包：express, cors, uuid）
npm install

# 3. 启动服务
node server.js

# 4. 浏览器打开
# http://localhost:3456
```

后端启动后，`/` 根路径自动托管 `app.html` 前端页面，前后端一体化。

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| GET | /api/listings?type=&material=&location= | 供需列表查询 |
| POST | /api/listings | 发布供需 |
| GET | /api/matches?userId= | 撮合匹配结果 |
| GET | /api/prices?material= | 行情价格 |
| GET | /api/stats | 平台统计 |
| GET | /api/health | 健康检查 |

### 技术说明

- **数据库**：`db.js` 实现了 SQLite 兼容的 JSON 文件存储，无需安装 better-sqlite3（已避开原生编译问题）
- **数据文件**：`data/zaisutong.db` 是纯 JSON 格式，可直接读写
- **种子数据**：已预填充 20 条真实塑料回收供需（PET/HDPE/PP/LDPE/ABS/PC/PVC/PA6）+ 4 个用户

## 小程序版（rematch-miniapp）

`rematch-miniapp/` 是一个 uni-app 项目，使用微信开发者工具导入即可运行。

```bash
# 安装 uni-app 依赖
cd rematch-miniapp
npm install

# 用微信开发者工具打开此目录
# 或运行：npx @dcloudio/uvm
```

小程序依赖云函数（cloudfunctions/）提供后端能力：
- login — 微信登录
- getMatches — 撮合查询
- getPrices — 行情查询
- publishSupply / publishDemand — 发布供需

## 种子数据

预置 20 条再生塑料供需，覆盖品类：

| 类别 | 数量 | 品种 |
|------|------|------|
| 供应 | 11 条 | PET瓶砖/瓶片、HDPE破碎/颗粒、PP粉碎/颗粒、LDPE膜/颗粒、ABS破碎、PC破碎、PVC颗粒 |
| 需求 | 9 条 | PET瓶砖/颗粒、PP编织袋/颗粒、HDPE破碎、ABS破碎、PE颗粒、PS颗粒、PA6尼龙 |

价格参考 2026 年 6 月真实行情。

## 注意事项

1. `db.js` 的 INSERT 使用 SQL 解析器从语句中**动态提取列名**映射参数，不要硬编码字段列表
2. 文本编码统一 UTF-8，中文角色名（打包站/再生工厂/制品·改性·色母/贸易商）须完整匹配
3. `zaisutong.db` 是 JSON 文件，节点重启后数据不会丢失
