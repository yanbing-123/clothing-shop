(function() {
  'use strict';

  // ===== Render Orders =====
  function renderOrders() {
    var container = document.getElementById('ordersContainer');
    var empty = document.getElementById('ordersEmpty');
    if (!container) return;

    var orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');

    if (orders.length === 0) {
      container.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    container.innerHTML = '';

    // Show newest first
    for (var i = orders.length - 1; i >= 0; i--) {
      var order = orders[i];

      // Items HTML
      var itemsHtml = '';
      for (var j = 0; j < order.items.length; j++) {
        var item = order.items[j];
        itemsHtml +=
          '<div class="order-item">' +
            '<span class="order-item-emoji">' + item.emoji + '</span>' +
            '<div class="order-item-info">' +
              '<div class="order-item-name">' + escapeHtml(item.name) + '</div>' +
              '<div class="order-item-meta">' + item.size + ' | ' + item.color + ' × ' + item.qty + '</div>' +
            '</div>' +
            '<span class="order-item-sub">¥' + item.subtotal.toFixed(2) + '</span>' +
          '</div>';
      }

      var recipientHtml = '';
      if (order.name) {
        recipientHtml = '<div class="order-recipient">收货人：' + escapeHtml(order.name);
        if (order.phone) recipientHtml += ' | ' + escapeHtml(order.phone);
        recipientHtml += '</div>';
      }

      var card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML =
        '<div class="order-header">' +
          '<span class="order-no">📄 ' + order.orderNo + '</span>' +
          '<span class="order-status">' + order.status + '</span>' +
        '</div>' +
        '<div class="order-date">🕐 ' + (order.date || '') + '</div>' +
        '<div class="order-items-list">' + itemsHtml + '</div>' +
        recipientHtml +
        '<div class="order-footer">' +
          '<button class="order-delete" onclick="window._cloth.deleteOrder(\'' + order.orderNo + '\')" title="删除订单">删除</button>' +
          '<span class="order-total">合计：<strong>¥' + order.total.toFixed(2) + '</strong></span>' +
        '</div>';
      container.appendChild(card);
    }
  }

  // ===== Delete Single Order =====
  function deleteOrder(orderNo) {
    if (!confirm('确定要删除此订单记录吗？')) return;
    var orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].orderNo === orderNo) {
        orders.splice(i, 1);
        break;
      }
    }
    localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
    renderOrders();
    showToast('订单已删除');
  }

  // ===== Clear All Orders =====
  function clearOrders() {
    var orders = JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
    if (orders.length === 0) return;
    if (!confirm('确定要清空所有订单记录吗？此操作不可撤销。')) return;
    localStorage.setItem(LS_ORDERS, '[]');
    renderOrders();
    showToast('所有订单已清空');
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

  // ===== Utility =====
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ===== Expose =====
  if (!window._cloth) window._cloth = {};
  window._cloth.renderOrders = renderOrders;
  window._cloth.deleteOrder = deleteOrder;
  window._cloth.clearOrders = clearOrders;

})();
