(function() {
  'use strict';

  // ===== 状态 =====
  var stockData     = {};
  var cartData      = [];
  var currentCat    = '全部';
  var currentSub    = '全部';
  var selSizes      = {};   // pid -> size string
  var selColors     = {};   // pid -> color value string
  var lastOrderSnap = [];

  // ===== 初始化 =====
  function init() {
    loadStock();
    loadCart();
    syncSelections();
    renderProducts();
    updateBadge();
    updateBottomBar();
  }

  // ===== 库存 =====
  function loadStock() {
    var saved = localStorage.getItem(LS_STOCK);
    if (saved) {
      stockData = JSON.parse(saved);
    } else {
      for (var i = 0; i < PRODUCTS.length; i++) {
        stockData[PRODUCTS[i].stockKey] = {};
        var p = PRODUCTS[i];
        for (var si = 0; si < p.sizes.length; si++) {
          var size = p.sizes[si];
          for (var ci = 0; ci < p.colors.length; ci++) {
            var color = p.colors[ci];
            var baseQty = getBaseStock(p, size, color);
            stockData[p.stockKey][size + '_' + color.value] = baseQty;
          }
        }
      }
      saveStock();
    }
  }

  function getBaseStock(p, size, color) {
    // 初始库存按尺码+颜色分配一个基础值
    var base = Math.floor(Math.random() * 10) + 5;
    return base;
  }

  function saveStock() { localStorage.setItem(LS_STOCK, JSON.stringify(stockData)); }

  function getStock(pid, size, colorVal) {
    var sk = getProduct(pid).stockKey;
    return (stockData[sk] && stockData[sk][size + '_' + colorVal]) || 0;
  }

  function decStock(pid, size, colorVal, qty) {
    var sk = getProduct(pid).stockKey;
    if (!stockData[sk]) stockData[sk] = {};
    stockData[sk][size + '_' + colorVal] = (stockData[sk][size + '_' + colorVal] || 0) - qty;
    if (stockData[sk][size + '_' + colorVal] < 0) stockData[sk][size + '_' + colorVal] = 0;
  }

  // ===== 购物车 =====
  function loadCart() {
    var saved = localStorage.getItem(LS_CART);
    if (saved) cartData = JSON.parse(saved);
  }

  function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(cartData)); }

  function cartIndex(pid, size, colorVal) {
    for (var i = 0; i < cartData.length; i++) {
      var c = cartData[i];
      if (c.id === pid && c.size === size && c.colorValue === colorVal) return i;
    }
    return -1;
  }

  function cartCount() {
    var t = 0;
    for (var i = 0; i < cartData.length; i++) t += cartData[i].quantity;
    return t;
  }

  function cartTotal() {
    var t = 0;
    for (var i = 0; i < cartData.length; i++) t += cartData[i].price * cartData[i].quantity;
    return t;
  }

  // 同步尺码/颜色选择
  function syncSelections() {
    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i];
      if (!selSizes[p.id])  selSizes[p.id]  = p.sizes[0];
      if (!selColors[p.id]) selColors[p.id] = p.colors[0].value;
    }
  }

  // ===== 商品渲染 =====
  function renderProducts() {
    var grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i];
      if (currentCat !== '全部' && p.category !== currentCat) continue;
      if (currentSub !== '全部' && p.subCategory !== currentSub) continue;

      var size  = selSizes[p.id]  || p.sizes[0];
      var colorVal = selColors[p.id] || p.colors[0].value;
      var stock = getStock(p.id, size, colorVal);
      var outOfStock = stock <= 0;

      // 尺码按钮
      var sizeHtml = '';
      for (var si = 0; si < p.sizes.length; si++) {
        var sz = p.sizes[si];
        var szStock = getStock(p.id, sz, colorVal);
        var disabled = szStock <= 0 ? ' disabled' : '';
        var selected = sz === size ? ' selected' : '';
        sizeHtml += '<button class="size-btn' + selected + disabled + '" onclick="window._cloth.selectSize(' + p.id + ',\'' + sz + '\')">' + sz + '</button>';
      }

      // 颜色按钮
      var colorHtml = '';
      for (var ci = 0; ci < p.colors.length; ci++) {
        var c = p.colors[ci];
        var cStock = hasAnyStock(p.id, c.value);
        var selected = c.value === colorVal ? ' selected' : '';
        colorHtml += '<button class="color-btn' + selected + '" data-value="' + c.value + '" data-name="' + c.name + '" style="background:' + c.value + ';border-color:' + c.value + '" onclick="window._cloth.selectColor(' + p.id + ',\'' + escapeQuote(c.value) + '\',\'' + escapeQuote(c.name) + '\')"></button>';
      }

      var catBg = p.category === '男装' ? '#E3F2FD' : p.category === '女装' ? '#FCE4EC' : '#FFF8E1';
      var catColor = p.category === '男装' ? '#1565C0' : p.category === '女装' ? '#AD1457' : '#E65100';

      var card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML =
        '<div class="card-img">' + p.emoji + '</div>' +
        '<div class="card-body">' +
          '<span class="card-cat-tag ' + p.category + '" style="background:' + catBg + ';color:' + catColor + '">' + p.category + ' · ' + p.subCategory + '</span>' +
          '<div class="card-name">' + p.name + '</div>' +
          '<div class="card-price">¥' + p.price.toFixed(2) + '</div>' +
          '<div class="size-section">' +
            '<span class="size-label">尺码：' + size + '</span>' +
            '<div class="size-btns">' + sizeHtml + '</div>' +
          '</div>' +
          '<div class="color-section">' +
            '<span class="color-label">颜色</span>' +
            '<div class="color-btns">' + colorHtml + '</div>' +
          '</div>' +
          '<div class="card-stock' + (outOfStock ? ' zero' : '') + '">' + (outOfStock ? '缺货' : '库存 ' + stock + ' 件') + '</div>' +
          '<button class="btn-add" onclick="window._cloth.addToCart(' + p.id + ')"' + (outOfStock ? ' disabled' : '') + '>' + (outOfStock ? '缺货' : '加入购物车') + '</button>' +
        '</div>';
      grid.appendChild(card);
    }
  }

  function hasAnyStock(pid, colorVal) {
    var p = getProduct(pid);
    var total = 0;
    for (var i = 0; i < p.sizes.length; i++) {
      total += getStock(pid, p.sizes[i], colorVal);
    }
    return total;
  }

  function escapeQuote(str) {
    return str.replace(/'/g, "\\'");
  }

  // ===== 筛选 =====
  function filterBy(dim, value) {
    if (dim === 'cat') {
      currentCat = value;
      document.querySelectorAll('[data-cat]').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.cat === value || (value === '全部' && btn.dataset.cat === '全部'));
      });
    } else if (dim === 'sub') {
      currentSub = value;
      document.querySelectorAll('[data-sub]').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.sub === value || (value === '全部' && btn.dataset.sub === '全部'));
      });
    }
    renderProducts();
  }

  // ===== 选择尺码 =====
  function selectSize(pid, size) {
    selSizes[pid] = size;
    renderProducts();
  }

  // ===== 选择颜色 =====
  function selectColor(pid, colorVal, colorName) {
    selColors[pid] = colorVal;
    renderProducts();
  }

  // ===== 加入购物车（第一层校验） =====
  function addToCart(pid) {
    var p = getProduct(pid);
    var size = selSizes[pid] || p.sizes[0];
    var colorVal = selColors[pid] || p.colors[0].value;
    var colorName = getColorName(p, colorVal);
    var stock = getStock(pid, size, colorVal);
    var idx = cartIndex(pid, size, colorVal);
    var currentQty = idx >= 0 ? cartData[idx].quantity : 0;

    if (currentQty >= stock) {
      showToast(p.name + ' [' + size + '][' + colorName + ']已达库存上限(' + stock + ')');
      return;
    }

    if (idx >= 0) {
      cartData[idx].quantity++;
    } else {
      cartData.push({
        id: pid, name: p.name, price: p.price,
        size: size, color: colorName, colorValue: colorVal,
        quantity: 1, emoji: p.emoji
      });
    }

    saveCart();
    updateBadge();
    updateBottomBar();
    renderProducts();
    showToast('已加入购物车 ✓');
  }

  function getColorName(p, colorVal) {
    for (var i = 0; i < p.colors.length; i++) {
      if (p.colors[i].value === colorVal) return p.colors[i].name;
    }
    return colorVal;
  }

  // ===== 修改数量（第二层校验） =====
  function updateQuantity(idx, delta) {
    var item = cartData[idx];
    if (!item) return;

    var next = item.quantity + delta;
    var stock = getStock(item.id, item.size, item.colorValue);

    if (next <= 0) {
      removeItem(idx); return;
    }
    if (next > stock) {
      showToast('数量不能超过库存(' + stock + ')'); return;
    }

    item.quantity = next;
    saveCart();
    updateDrawer();
    updateBadge();
    updateBottomBar();
  }

  // ===== 删除商品 =====
  function removeItem(idx) {
    cartData.splice(idx, 1);
    saveCart();
    updateDrawer();
    updateBadge();
    updateBottomBar();
    renderProducts();
  }

  // ===== 清空购物车 =====
  function clearCart() {
    if (cartData.length === 0) return;
    if (!confirm('确定要清空购物车吗？此操作不可撤销。')) return;
    cartData = [];
    saveCart();
    updateDrawer();
    updateBadge();
    updateBottomBar();
    renderProducts();
    showToast('购物车已清空');
  }

  // ===== UI 更新 =====
  function updateBadge() {
    var badge = document.getElementById('cartBadge');
    var n = cartCount();
    badge.textContent = n;
    badge.className = 'cart-badge' + (n > 0 ? ' show' : '');
  }

  function updateBottomBar() {
    var bar = document.getElementById('cartBar');
    var n = cartCount();
    var t = cartTotal();
    var btnBar = document.getElementById('btnSettle');
    var btnDrawer = document.getElementById('btnCheckout');

    bar.classList.toggle('show', n > 0);
    document.getElementById('cartCountBar').textContent = n;
    document.getElementById('cartTotalBar').textContent = '¥' + t.toFixed(2);
    btnBar.disabled = n === 0;
    btnDrawer.disabled = n === 0;
  }

  function updateDrawer() {
    var container = document.getElementById('drawerItems');
    var totalEl = document.getElementById('drawerTotal');

    if (cartData.length === 0) {
      container.innerHTML = '<div class="drawer-empty">购物车是空的，快去挑选服装吧~</div>';
      totalEl.textContent = '¥0.00';
      return;
    }

    container.innerHTML = '';
    for (var i = 0; i < cartData.length; i++) {
      var item = cartData[i];
      var div = document.createElement('div');
      div.className = 'drawer-item';
      div.innerHTML =
        '<span class="drawer-item-emoji">' + item.emoji + '</span>' +
        '<div class="drawer-item-info">' +
          '<div class="drawer-item-name">' + item.name + '</div>' +
          '<div class="drawer-item-meta">' + item.size + ' | ' + item.color + '</div>' +
          '<div class="drawer-item-sub">¥' + (item.price * item.quantity).toFixed(2) + '</div>' +
        '</div>' +
        '<div class="drawer-item-controls">' +
          '<button class="qty-btn" onclick="window._cloth.updateQuantity(' + i + ',-1)"' + (item.quantity <= 1 ? ' disabled' : '') + '>−</button>' +
          '<span class="qty-num">' + item.quantity + '</span>' +
          '<button class="qty-btn" onclick="window._cloth.updateQuantity(' + i + ',1)">+</button>' +
        '</div>' +
        '<button class="btn-remove" onclick="window._cloth.removeItem(' + i + ')">🗑</button>';
      container.appendChild(div);
    }
    totalEl.textContent = '¥' + cartTotal().toFixed(2);
  }

  function toggleDrawer() {
    var open = document.getElementById('cartDrawer').classList.toggle('open');
    document.getElementById('drawerOverlay').classList.toggle('show', open);
    if (open) updateDrawer();
  }

  // ===== 结算（第三层校验） =====
  function openCheckout() {
    if (cartData.length === 0) return;

    for (var i = 0; i < cartData.length; i++) {
      var item = cartData[i];
      var stock = getStock(item.id, item.size, item.colorValue);
      if (item.quantity > stock) {
        showToast('部分商品库存不足，请调整购物车'); return;
      }
    }

    toggleDrawer();
    document.getElementById('summaryCount').textContent = cartCount();
    document.getElementById('summaryTotal').textContent = '¥' + cartTotal().toFixed(2);
    document.getElementById('checkoutForm').reset();
    clearErrors();
    document.getElementById('modalOverlay').classList.add('show');
    document.getElementById('checkoutModal').classList.add('show');
  }

  function closeCheckout() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.getElementById('checkoutModal').classList.remove('show');
  }

  function submitOrder(e) {
    e.preventDefault();
    if (!validateForm()) return;

    for (var i = 0; i < cartData.length; i++) {
      var item = cartData[i];
      var stock = getStock(item.id, item.size, item.colorValue);
      if (item.quantity > stock) { showToast('库存不足，订单无法提交'); return; }
    }

    lastOrderSnap = cartData.map(function(item) {
      return {
        name: item.name, size: item.size, color: item.color,
        emoji: item.emoji, qty: item.quantity,
        subtotal: item.price * item.quantity
      };
    });

    for (var j = 0; j < cartData.length; j++) {
      var cj = cartData[j];
      decStock(cj.id, cj.size, cj.colorValue, cj.quantity);
    }
    saveStock();

    var orderNo = 'CL' + Date.now();
    cartData = [];
    saveCart();

    closeCheckout();
    updateBadge();
    updateBottomBar();
    renderProducts();

    document.getElementById('orderNum').textContent = '订单编号：' + orderNo;
    var html = '';
    for (var k = 0; k < lastOrderSnap.length; k++) {
      var s = lastOrderSnap[k];
      html += s.emoji + ' ' + s.name + ' [' + s.size + '][' + s.color + '] × ' + s.qty + ' = ¥' + s.subtotal.toFixed(2) + '<br>';
    }
    document.getElementById('orderItems').innerHTML = html;
    document.getElementById('successOverlay').classList.add('show');
    document.getElementById('successModal').classList.add('show');
  }

  function closeSuccess() {
    document.getElementById('successOverlay').classList.remove('show');
    document.getElementById('successModal').classList.remove('show');
    lastOrderSnap = [];
  }

  // ===== 表单验证 =====
  function validateForm() {
    var valid = true;
    clearErrors();

    var name = document.getElementById('fName').value.trim();
    var phone = document.getElementById('fPhone').value.trim();
    var address = document.getElementById('fAddress').value.trim();

    if (!name) { showErr('fName', 'errName', '请输入收货人姓名'); valid = false; }
    if (!phone) { showErr('fPhone', 'errPhone', '请输入手机号'); valid = false; }
    else if (!/^1[3-9]\d{9}$/.test(phone)) { showErr('fPhone', 'errPhone', '手机号格式不正确'); valid = false; }
    if (!address) { showErr('fAddress', 'errAddress', '请输入收货地址'); valid = false; }
    else if (address.length < 5) { showErr('fAddress', 'errAddress', '地址太短，请填写完整'); valid = false; }

    return valid;
  }

  function showErr(inpId, errId, msg) {
    document.getElementById(inpId).classList.add('error');
    document.getElementById(errId).textContent = msg;
  }

  function clearErrors() {
    ['fName','fPhone','fAddress'].forEach(function(id) { document.getElementById(id).classList.remove('error'); });
    ['errName','errPhone','errAddress'].forEach(function(id) { document.getElementById(id).textContent = ''; });
  }

  // ===== Toast =====
  function showToast(msg) {
    var old = document.getElementById('toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(51,51,51,0.92);color:#fff;padding:10px 24px;border-radius:20px;font-size:0.88rem;z-index:9999;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.2);';
    document.body.appendChild(t);
    setTimeout(function() {
      t.style.transition = 'opacity 0.3s'; t.style.opacity = '0';
      setTimeout(function() { t.remove(); }, 300);
    }, 1800);
  }

  // ===== 辅助 =====
  function getProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  // ===== 暴露到 window =====
  window._cloth = {
    filterBy: filterBy,
    selectSize: selectSize,
    selectColor: selectColor,
    addToCart: addToCart,
    updateQuantity: updateQuantity,
    removeItem: removeItem,
    clearCart: clearCart,
    toggleDrawer: toggleDrawer,
    openCheckout: openCheckout,
    closeCheckout: closeCheckout,
    submitOrder: submitOrder,
    closeSuccess: closeSuccess
  };

  init();

})();