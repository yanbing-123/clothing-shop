/**
 * 服装购买系统 - 商品数据
 */
var PRODUCTS = [
  {
    id: 1,
    name: '纯棉T恤',
    price: 89.00,
    category: '男装',
    subCategory: '上衣',
    emoji: '👕',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: '白色', value: '#FFFFFF' },
      { name: '黑色', value: '#333333' },
      { name: '蓝色', value: '#4477AA' }
    ],
    stockKey: '1'
  },
  {
    id: 2,
    name: '休闲牛仔裤',
    price: 199.00,
    category: '男装',
    subCategory: '裤子',
    emoji: '👖',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: '深蓝', value: '#1A3A5C' },
      { name: '浅蓝', value: '#6B8EAD' }
    ],
    stockKey: '2'
  },
  {
    id: 3,
    name: '轻奢风衣',
    price: 399.00,
    category: '女装',
    subCategory: '上衣',
    emoji: '🧥',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: '卡其', value: '#C8B58B' },
      { name: '黑色', value: '#333333' },
      { name: '军绿', value: '#556B2F' }
    ],
    stockKey: '3'
  },
  {
    id: 4,
    name: '碎花连衣裙',
    price: 259.00,
    category: '女装',
    subCategory: '裙子',
    emoji: '👗',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: '粉色', value: '#FFB6C1' },
      { name: '白色', value: '#FFFFFF' }
    ],
    stockKey: '4'
  },
  {
    id: 5,
    name: '运动板鞋',
    price: 229.00,
    category: '男装',
    subCategory: '鞋子',
    emoji: '👟',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: [
      { name: '白色', value: '#FFFFFF' },
      { name: '黑色', value: '#333333' }
    ],
    stockKey: '5'
  },
  {
    id: 6,
    name: '针织开衫',
    price: 169.00,
    category: '女装',
    subCategory: '上衣',
    emoji: '🧶',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: '米白', value: '#F5F5DC' },
      { name: '粉色', value: '#FFB6C1' },
      { name: '灰色', value: '#888888' }
    ],
    stockKey: '6'
  },
  {
    id: 7,
    name: '儿童卡通卫衣',
    price: 99.00,
    category: '童装',
    subCategory: '上衣',
    emoji: '🧸',
    sizes: ['100', '110', '120', '130', '140'],
    colors: [
      { name: '蓝色', value: '#4477AA' },
      { name: '粉色', value: '#FFB6C1' },
      { name: '黄色', value: '#FFD700' }
    ],
    stockKey: '7'
  },
  {
    id: 8,
    name: '儿童运动裤',
    price: 79.00,
    category: '童装',
    subCategory: '裤子',
    emoji: '🩲',
    sizes: ['100', '110', '120', '130', '140'],
    colors: [
      { name: '深蓝', value: '#1A3A5C' },
      { name: '黑色', value: '#333333' }
    ],
    stockKey: '8'
  }
];

var LS_STOCK    = 'clothing_stock';
var LS_CART     = 'clothing_cart';
var LS_SHOWCASE = 'clothing_showcase';
var LS_POINTS   = 'clothing_points';
var LS_ORDERS   = 'clothing_orders';
var LS_WISHLIST = 'clothing_wishlist';

var UPLOAD_POINTS = 10;
var MAX_SHOWCASE  = 50;