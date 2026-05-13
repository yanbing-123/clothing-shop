# 👔 CLOTHING STORE — 服装购买系统

> 基于 HTML5 + CSS3 + Vanilla JS 的纯前端服装购物系统，无需后端，浏览器直接打开即可运行。

## 功能特性

- 👕 **8种服装商品**：纯棉T恤/牛仔裤/轻奢风衣/碎花连衣裙/运动板鞋/针织开衫/儿童卡通卫衣/儿童运动裤
- 🏷️ **分类筛选**：男装/女装/童装（即时生效，完全重绘）
- 👖 **多尺码+多颜色**：每件商品独立尺码按钮组 + 颜色选择器（色块），缺货不可选
- 🛒 **侧边购物车抽屉**：+/-数量/删除/清空确认/实时总价/底部固定结算栏
- 💾 **localStorage 持久化**：`clothing_stock`（按尺码+颜色维度）+ `clothing_cart`
- 🔒 **三层防超卖**：addToCart / updateQuantity / submitOrder 全库存校验
- 📦 **结算表单**：姓名/手机(/^1[3-9]\d{9}$/)/地址验证 + 订单成功页（订单号+明细）
- 📱 **响应式**：手机单列 → 平板双列 → PC四列自适应
- 🎨 **简约时尚风格**：黑(#333)+白+金(#C9A96E)配色，都市轻奢定位
- 🔌 **window._cloth** 暴露所有关键函数

## 商品列表

| ID | 商品 | 分类 | 类型 | 价格 | 尺码 |
|----|------|------|------|------|------|
| 1 | 纯棉T恤 | 男装 | 上衣 | ¥89.00 | S/M/L/XL/XXL |
| 2 | 休闲牛仔裤 | 男装 | 裤子 | ¥199.00 | S/M/L/XL/XXL |
| 3 | 轻奢风衣 | 女装 | 上衣 | ¥399.00 | S/M/L/XL |
| 4 | 碎花连衣裙 | 女装 | 裙子 | ¥259.00 | S/M/L/XL |
| 5 | 运动板鞋 | 男装 | 鞋子 | ¥229.00 | 39-44 |
| 6 | 针织开衫 | 女装 | 上衣 | ¥169.00 | S/M/L/XL |
| 7 | 儿童卡通卫衣 | 童装 | 上衣 | ¥99.00 | 100-140 |
| 8 | 儿童运动裤 | 童装 | 裤子 | ¥79.00 | 100-140 |

## 库存维度

每件商品库存按 **尺码 + 颜色** 组合维度存储，精确到具体 SKU 级别。

## 项目结构

```
clothing-shop/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js     # 商品数据（PRODUCTS + LS keys）
│   └── app.js      # 业务逻辑（IIFE 封装）
└── README.md
```

## 运行方式

直接在浏览器打开 `index.html`，无需任何服务器或构建工具。

```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html   # Linux
```

## 技术栈

- HTML5 + CSS3（Flexbox + Grid + CSS Variables）
- Vanilla JavaScript（ES5 严格模式 + IIFE 封装，无 let/const 兼容旧浏览器）
- localStorage API

## 设计风格

| 元素 | 设计 |
|------|------|
| 主色 | 黑色 #333333 |
| 强调色 | 金色 #C9A96E |
| 背景色 | 浅灰 #F5F5F5 |
| 字体 | PingFang SC / Microsoft YaHei / Arial |
| 布局 | Sticky Header + Filter Bar + Product Grid + Fixed Bottom Cart Bar |

## License

MIT