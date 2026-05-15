(function() {
  'use strict';

  var LS_WISHLIST = 'clothing_wishlist';
  var wishlistData = [];

  // ===== Persistence =====
  function loadWishlist() {
    var saved = localStorage.getItem(LS_WISHLIST);
    if (saved) {
      try { wishlistData = JSON.parse(saved); } catch(e) { wishlistData = []; }
    } else {
      wishlistData = [];
    }
  }

  function saveWishlist() {
    localStorage.setItem(LS_WISHLIST, JSON.stringify(wishlistData));
  }

  function isInWishlist(pid) {
    for (var i = 0; i < wishlistData.length; i++) {
      if (wishlistData[i] === pid) return true;
    }
    return false;
  }

  function getProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  // ===== Toggle =====
  function toggleWishlist(pid) {
    var idx = -1;
    for (var i = 0; i < wishlistData.length; i++) {
      if (wishlistData[i] === pid) { idx = i; break; }
    }
    if (idx === -1) {
      wishlistData.push(pid);
    } else {
      if (!confirm('确定要移出收藏吗？')) return;
      wishlistData.splice(idx, 1);
    }
    saveWishlist();
    updateWishlistBadge();
    // Re-render product grid to update heart icons
    if (window._cloth && window._cloth.renderProducts) {
      window._cloth.renderProducts();
    }
    // Re-render wishlist grid if it's visible
    var wishlistSection = document.getElementById('wishlistSection');
    if (wishlistSection && wishlistSection.style.display !== 'none') {
      renderWishlist();
    }
    showToast(idx === -1 ? '已收藏 ♥' : '已取消收藏');
  }

  // ===== Badge =====
  function updateWishlistBadge() {
    var badge = document.getElementById('wishlistBadge');
    if (!badge) return;
    var n = wishlistData.length;
    badge.textContent = n;
    badge.style.display = n > 0 ? 'inline' : 'none';
  }

  // ===== View Wrapping =====
  var origSwitchView = null;

  function wrapSwitchView() {
    if (!window._cloth || !window._cloth.switchView) return;
    origSwitchView = window._cloth.switchView;
    window._cloth.switchView = function(view) {
      var ws = document.getElementById('wishlistSection');
      if (ws) ws.style.display = 'none';

      origSwitchView(view);

      if (view === 'wishlist') {
        if (ws) {
          ws.style.display = 'block';
          renderWishlist();
        }
        var navLinks = document.querySelectorAll('.nav-link');
        for (var i = 0; i < navLinks.length; i++) {
          navLinks[i].classList.toggle('active', navLinks[i].dataset.view === 'wishlist');
        }
      }
    };
  }

  // ===== Render Wishlist =====
  function renderWishlist() {
    var grid = document.getElementById('wishlistGrid');
    var empty = document.getElementById('wishlistEmpty');
    if (!grid) return;

    if (wishlistData.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = '';

    for (var i = 0; i < wishlistData.length; i++) {
      var pid = wishlistData[i];
      var p = getProduct(pid);
      if (!p) continue;

      var card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML =
        '<div class="card-img" style="position:relative;">' +
          p.emoji +
          '<button class="card-wishlist-btn active" onclick="window._cloth.toggleWishlist(' + p.id + ')">♥</button>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-name">' + p.name + '</div>' +
          '<div class="card-price">¥' + p.price.toFixed(2) + '</div>' +
          '<div class="card-stock">' + p.category + ' · ' + p.subCategory + '</div>' +
          '<button class="btn-add" onclick="window._cloth.switchView(\'shop\')">加入购物车</button>' +
        '</div>';
      grid.appendChild(card);
    }
  }

  // ===== Clear All =====
  function clearWishlist() {
    if (wishlistData.length === 0) return;
    if (!confirm('确定要清空所有收藏吗？')) return;
    wishlistData = [];
    saveWishlist();
    updateWishlistBadge();
    renderWishlist();
    if (window._cloth && window._cloth.renderProducts) {
      window._cloth.renderProducts();
    }
    showToast('收藏已清空');
  }

  // ===== Toast =====
  function showToast(msg) {
    var old = document.getElementById('toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'toast'; t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(51,51,51,0.92);color:#fff;padding:10px 24px;border-radius:20px;font-size:0.88rem;z-index:9999;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.2);';
    document.body.appendChild(t);
    setTimeout(function() {
      t.style.transition = 'opacity 0.3s'; t.style.opacity = '0';
      setTimeout(function() { t.remove(); }, 300);
    }, 1800);
  }

  // ===== Init =====
  function init() {
    loadWishlist();
    wrapSwitchView();
    updateWishlistBadge();
    // Re-render product grid now that wishlist module is loaded,
    // so heart icons reflect saved wishlist state
    if (window._cloth && window._cloth.renderProducts) {
      window._cloth.renderProducts();
    }
  }

  // ===== Expose =====
  if (!window._cloth) window._cloth = {};
  window._cloth.isInWishlist = isInWishlist;
  window._cloth.toggleWishlist = toggleWishlist;
  window._cloth.wishlistUpdateHearts = function() {};
  window._cloth.renderWishlist = renderWishlist;
  window._cloth.clearWishlist = clearWishlist;

  init();

})();
