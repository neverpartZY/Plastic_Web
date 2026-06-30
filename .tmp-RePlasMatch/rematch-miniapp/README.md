# 再塑通 - AI废塑再塑自动撮合小程序

> AI-native v3：一句话发布，秒级匹配。AI驱动的塑料回收再生两极供需撮合引擎 - 微信小程序版（uni-app）

## 项目简介

**再塑通**是面向废塑料回收行业的AI-native撮合平台。与传统的表单式发布不同，v3版本采用**AI对话式交互**——用户只需用自然语言描述需求（"我有30吨三色瓶砖在定州5800出"），AI自动解析品类、数量、价格、地点等信息，结构化存储并匹配最佳合作伙伴。

### v3 核心理念：AI-native

| 特性 | v1 (表单式) | v3 (AI-native) |
|------|-----------|----------------|
| 发布方式 | 填写表单，逐字段选择 | 一句话自然语言输入 |
| 品类识别 | 下拉选择品类 | AI自动匹配60+品类分类体系 |
| 黑话理解 | 无 | 自动翻译60+行业黑话 |
| 数据解析 | 纯表单验证 | 智能提取数量/价格/地点 |
| 置信度 | 100%（人工填写） | AI评估解析置信度 |
| 交互体验 | 5步表单 | 1秒对话 |

### 核心功能

- **🤖 AI智能输入中心**：首页即为AI输入区（占50%屏幕），支持文字、语音、拍照、文件四种输入方式
- **🗣️ 自然语言解析**：识别行业黑话（"片子""粒子""上车价"等60+术语），自动归类到标准化品类体系
- **📊 多源智能匹配**：融合本地匹配、全网匹配、91再生、变宝网等多数据源，五维度评分（品类50分+形态15分+位置15分+价格10分+数量10分）
- **📈 行情价格**：10+品类废塑料实时行情，价格涨跌走势图
- **📝 AI解析记录**：记录每次AI自然语言→结构化解析历史，可追溯
- **👤 角色切换**：支持回收商/采购商/贸易商角色切换，AI解析自动适配方向

### 技术栈

- **框架**: uni-app (Vue 2)
- **平台**: 微信小程序 (mp-weixin)
- **后端**: 微信云开发 (CloudBase)
- **样式**: SCSS + rpx 响应式单位
- **AI解析**: utils/ai-parser.js（完整分类体系+黑话映射+城市映射）

## 快速开始

### 1. 导入微信开发者工具

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择「导入项目」
3. 项目目录选择本项目的根目录 `rematch-miniapp/`
4. AppID 填入您的小程序 AppID（或使用测试号）
5. 点击确定导入

### 2. 配置云开发环境

1. 在微信开发者工具中，点击「云开发」按钮开通云开发
2. 创建一个云环境（建议命名为 `rematch-prod`）
3. 在 `App.vue` 的 `onLaunch` 中将 `env` 改为您的云环境 ID：

```javascript
wx.cloud.init({
  env: '你的云环境ID',
  traceUser: true
});
```

4. 同样在 `utils/cloud.js` 中修改 `initCloud` 函数中的环境 ID。

### 3. 部署云函数

1. 在微信开发者工具左侧文件树中，找到 `cloudfunctions/` 目录
2. 右键点击每个云函数文件夹（如 `publishSupply`），选择「上传并部署：云端安装依赖」
3. 依次部署所有云函数：
   - `login` - 用户登录
   - `publishSupply` - 发布供应
   - `publishDemand` - 发布需求
   - `getMatches` - 查询匹配
   - `getPrices` - 查询行情

4. 创建云数据库集合：
   - `supplies` - 供应数据
   - `demands` - 需求数据
   - `matches` - 匹配记录
   - `prices` - 价格数据
   - `users` - 用户信息

5. 设置数据库权限：每个集合的权限设置为「仅创建者可读写」或根据业务需要调整。

### 4. 本地开发测试

项目内置了本地存储回退机制，无需云开发环境即可进行 UI 开发和功能测试：

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev:mp-weixin

# 生产构建
npm run build:mp-weixin
```

在开发模式下：
- 云函数调用会自动回退到 localStorage
- 所有数据存储在本地，关闭小程序后数据不丢失
- AI解析功能完整可用（纯前端运行）
- 支持完整的自然语言发布、匹配计算、价格展示等功能

### 5. 构建与发布

```bash
# 构建微信小程序
npm run build:mp-weixin
```

构建完成后：
1. 在微信开发者工具中打开 `dist/dev/mp-weixin/` 目录
2. 点击「上传」按钮提交代码
3. 在微信公众平台提交审核

## 项目结构

```
rematch-miniapp/
├── manifest.json              # uni-app 配置清单
├── pages.json                 # 页面路由与TabBar配置 (4 Tab)
├── App.vue                    # 根组件
├── main.js                    # 入口文件
├── uni.scss                   # 全局SCSS变量
├── package.json               # 依赖配置
├── cloudfunctions/            # 云函数目录
│   ├── publishSupply/         # 发布供应（含自动匹配）
│   ├── publishDemand/         # 发布需求（含自动匹配）
│   ├── getMatches/            # 查询匹配结果
│   ├── getPrices/             # 查询行情价格
│   └── login/                 # 微信登录
├── pages/                     # 页面 (4 Tab)
│   ├── index/                 # 🏠 首页 - AI输入中心
│   ├── match/                 # 🔍 匹配中心 - 多源筛选+列表
│   ├── market/                # 📈 行情页 - 走势图+价格列表
│   └── mine/                  # 👤 我的 - AI解析记录+角色切换
├── components/                # 公共组件
│   ├── MatchCard.vue          # 匹配卡片（含来源标签）
│   ├── MatchDetail.vue        # 匹配详情弹窗（五维度分析）
│   ├── PriceRow.vue           # 价格行组件
│   ├── SupplyForm.vue         # 供应表单（保留兼容）
│   ├── DemandForm.vue         # 需求表单（保留兼容）
│   └── EnterpriseCard.vue     # 企业信息卡片
├── utils/                     # 工具函数
│   ├── ai-parser.js           # 🆕 AI自然语言解析器（核心）
│   ├── cloud.js               # 云函数封装（含本地回退）
│   ├── storage.js             # 本地存储封装
│   └── match.js               # 匹配算法（五维度评分）
├── static/                    # 静态资源
│   └── logo.png               # 应用Logo
└── README.md                  # 项目说明
```

## AI解析器 (utils/ai-parser.js)

AI解析器是v3版本的核心模块，包含完整的行业知识体系：

### 数据体系

| 模块 | 条目数 | 说明 |
|------|--------|------|
| 废塑料品类分类 (WASTE_TAXONOMY) | 60+ | PET/HDPE/LDPE/PP/ABS/PS/PC/PA/PVC等品种 |
| 再生料品类分类 (RECYCLED_TAXONOMY) | 50+ | 各品种再生颗粒、回料等 |
| 行业黑话映射 (BLACK_SPEECH_MAP) | 60+ | "片子"→瓶片、"粒子"→颗粒、"上车价"等 |
| 城市映射 (CITY_MAP) | 80+ | 覆盖全国主要废塑料集散地 |

### 解析流程

```
用户输入 → Step 1: 判断供/需方向
        → Step 2: 判断废料/再生料
        → Step 3: 翻译行业黑话
        → Step 4: 匹配品类分类体系
        → Step 5: 提取数量/价格/地点/形态
        → Step 6: 生成结构化结果 + 置信度
```

### 使用示例

```javascript
import aiParse from '@/utils/ai-parser.js';

// 回收商卖废料
const result = aiParse('我有30吨三色瓶砖在定州5800出', 'supplier');
// → { category: 'PET三色瓶砖', quantity: 30, price: 5800, location: '河北省定州', direction: 'supply', ... }

// 采购商买再生料
const result2 = aiParse('求购HDPE一级再生颗粒20吨 预算4500 东莞', 'buyer');
// → { category: 'HDPE一级再生颗粒', quantity: 20, price: 4500, location: '广东省东莞', direction: 'demand', ... }
```

## 匹配算法说明

匹配分数采用五维度加权计算（满分100分）：

| 维度 | 满分 | 说明 |
|------|------|------|
| 品类匹配 | 50分 | 必须匹配，否则直接淘汰 |
| 形态兼容 | 15分 | 瓶片/颗粒/破碎料等形态兼容性矩阵 |
| 地理位置 | 15分 | 同城15分、同省10分、跨省5分 |
| 价格兼容 | 10分 | 偏差≤5%得10分，≤15%得7分，≤30%得4分 |
| 数量匹配 | 10分 | 比例≤1.2得10分，≤2得7分，≤5得4分 |

匹配等级：强烈推荐(≥85%) ｜ 推荐(70-84%) ｜ 可考虑(50-69%)

## 设计规范

- 主色调：`#07C160`（微信绿）
- 单位：`rpx`（响应式像素，750rpx = 屏幕宽度）
- 卡片：白色背景、16rpx圆角、阴影
- AI输入区：渐变绿色背景、半透明圆角输入框
- 分数圆环：≥85%绿色、70-84%蓝色、50-69%黄色
- 来源标签：本平台(绿)、全网(蓝)、91再生(橙)、变宝网(红)

## TabBar 结构 (v3)

v3将发布功能融入首页AI输入，从5个Tab精简为4个：

| Tab | 页面 | 说明 |
|-----|------|------|
| 🏠 首页 | pages/index/index | AI输入中心 - 一句话发布 |
| 🔍 匹配 | pages/match/match | 多源筛选匹配结果 |
| 📈 行情 | pages/market/index | 价格走势+明细 |
| 👤 我的 | pages/mine/mine | AI解析记录+供需管理 |

## 常见问题

**Q: 云函数调用失败？**
A: 检查云环境是否正确初始化，确保 `App.vue` 和 `utils/cloud.js` 中的环境 ID 一致。

**Q: AI解析不准确怎么办？**
A: 可以在解析结果弹窗中点击「修改」返回重新输入。解析置信度低于50%时会提示补充信息。排查方向：输入的品类是否在分类体系中、黑话是否被正确翻译。

**Q: 本地存储数据如何清除？**
A: 在「我的」页面 → 设置 → 清除缓存，或在微信开发者工具中清除 storage。

**Q: 如何添加新的废塑料品类？**
A: 修改 `utils/ai-parser.js` 中的 `WASTE_TAXONOMY` 或 `RECYCLED_TAXONOMY` 映射表，以及对应的 `BLACK_SPEECH_MAP` 黑话映射。

**Q: v1的发布表单还能用吗？**
A: SupplyForm.vue 和 DemandForm.vue 组件保留在项目中，可供需要精确填写的场景使用。推荐使用首页AI输入进行快速发布。

## License

MIT
