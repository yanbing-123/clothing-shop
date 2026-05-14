(function() {
  'use strict';

  // ===== State =====
  var showcaseData = [];
  var points = 0;

  // ===== Initialization =====
  function init() {
    loadShowcaseData();
    loadPoints();
    updatePointsUI();
    setupFileInput();
  }

  // ===== Data Persistence =====
  function loadShowcaseData() {
    var saved = localStorage.getItem(LS_SHOWCASE);
    if (saved) {
      showcaseData = JSON.parse(saved);
    } else {
      showcaseData = [];
    }
  }

  function saveShowcaseData() {
    localStorage.setItem(LS_SHOWCASE, JSON.stringify(showcaseData));
  }

  function loadPoints() {
    var saved = localStorage.getItem(LS_POINTS);
    points = saved ? parseInt(saved, 10) : 0;
  }

  function savePoints() {
    localStorage.setItem(LS_POINTS, String(points));
  }

  function addPoints(amount) {
    points += amount;
    savePoints();
    updatePointsUI();
  }

  function updatePointsUI() {
    var badge = document.getElementById('pointsCount');
    var showcasePts = document.getElementById('showcasePoints');
    if (badge) badge.textContent = points;
    if (showcasePts) showcasePts.textContent = points;
  }

  // ===== View Switching =====
  function switchView(view) {
    var shopSection = document.getElementById('productGrid');
    var showcaseSection = document.getElementById('showcaseSection');
    var ordersSection = document.getElementById('ordersSection');
    var filterBar = document.querySelector('.filter-bar');

    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.toggle('active', navLinks[i].dataset.view === view);
    }

    // Hide all sections
    shopSection.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';
    if (showcaseSection) showcaseSection.style.display = 'none';
    if (ordersSection) ordersSection.style.display = 'none';

    if (view === 'shop') {
      shopSection.style.display = '';
      if (filterBar) filterBar.style.display = '';
    } else if (view === 'showcase') {
      showcaseSection.style.display = 'block';
      renderShowcase();
    } else if (view === 'orders') {
      ordersSection.style.display = 'block';
      if (window._cloth && window._cloth.renderOrders) {
        window._cloth.renderOrders();
      }
    }
  }

  // ===== File Input Setup =====
  function setupFileInput() {
    var fileInput = document.getElementById('fileInput');
    if (!fileInput) return;
    fileInput.onchange = function() {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      var btnSubmit = document.getElementById('btnSubmitUpload');
      var placeholder = document.getElementById('uploadPlaceholder');
      var preview = document.getElementById('uploadPreview');
      var errEl = document.getElementById('errUpload');
      if (errEl) errEl.textContent = '';

      if (file.size > 2 * 1024 * 1024) {
        if (errEl) errEl.textContent = '文件大小不能超过 2MB';
        fileInput.value = '';
        if (btnSubmit) btnSubmit.disabled = true;
        return;
      }

      var reader = new FileReader();
      reader.onload = function(e) {
        if (placeholder) placeholder.style.display = 'none';
        if (preview) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        }
        if (btnSubmit) btnSubmit.disabled = false;
      };
      reader.readAsDataURL(file);
    };
  }

  // ===== Upload Modal =====
  function openUpload() {
    document.getElementById('uploadOverlay').classList.add('show');
    document.getElementById('uploadModal').classList.add('show');
  }

  function closeUpload() {
    document.getElementById('uploadOverlay').classList.remove('show');
    document.getElementById('uploadModal').classList.remove('show');
    resetUploadForm();
  }

  function resetUploadForm() {
    var form = document.getElementById('uploadForm');
    if (form) form.reset();
    var fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    var preview = document.getElementById('uploadPreview');
    if (preview) { preview.style.display = 'none'; preview.src = ''; }
    var placeholder = document.getElementById('uploadPlaceholder');
    if (placeholder) placeholder.style.display = '';
    var btnSubmit = document.getElementById('btnSubmitUpload');
    if (btnSubmit) btnSubmit.disabled = true;
    var errEl = document.getElementById('errUpload');
    if (errEl) errEl.textContent = '';
  }

  function showUploadError(msg) {
    var errEl = document.getElementById('errUpload');
    if (errEl) errEl.textContent = msg;
  }

  function btnDisabled(disabled) {
    var btn = document.getElementById('btnSubmitUpload');
    if (btn) btn.disabled = disabled;
  }

  function submitUpload(e) {
    e.preventDefault();

    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files && fileInput.files[0];
    var descInput = document.getElementById('uploadDesc');
    var desc = descInput ? descInput.value.trim() : '';

    if (!file) {
      showUploadError('请选择一张照片');
      return;
    }
    if (!desc) {
      showUploadError('请输入穿搭描述');
      return;
    }
    if (desc.length < 4) {
      showUploadError('描述太短，请详细描述你的穿搭');
      return;
    }
    if (showcaseData.length >= MAX_SHOWCASE) {
      showUploadError('买家秀已达到上限，请删除旧的再上传');
      return;
    }

    var reader = new FileReader();
    btnDisabled(true);
    reader.onload = function(e) {
      showcaseData.push({
        id: Date.now(),
        imageData: e.target.result,
        description: desc,
        date: new Date().toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })
      });
      saveShowcaseData();
      addPoints(UPLOAD_POINTS);
      closeUpload();
      renderShowcase();
      showToast('上传成功！获得 ' + UPLOAD_POINTS + ' 积分 ⭐');
    };
    reader.onerror = function() {
      showUploadError('图片读取失败，请重试');
      btnDisabled(false);
    };
    reader.readAsDataURL(file);
  }

  // ===== Render Showcase =====
  function renderShowcase() {
    var grid = document.getElementById('showcaseGrid');
    var empty = document.getElementById('showcaseEmpty');
    if (!grid) return;

    updatePointsUI();

    if (showcaseData.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';
    grid.innerHTML = '';

    // Show newest first
    for (var i = showcaseData.length - 1; i >= 0; i--) {
      var item = showcaseData[i];
      var card = document.createElement('div');
      card.className = 'showcase-card';
      card.innerHTML =
        '<div class="showcase-img-wrap">' +
          '<img class="showcase-img" src="' + item.imageData + '" alt="穿搭照" loading="lazy">' +
        '</div>' +
        '<div class="showcase-card-body">' +
          '<p class="showcase-desc">' + escapeHtml(item.description) + '</p>' +
          '<div class="showcase-meta">' +
            '<span class="showcase-date">📅 ' + item.date + '</span>' +
            '<button class="showcase-delete" onclick="window._cloth.deleteShowcase(' + item.id + ')" title="删除">🗑</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    }
  }

  function deleteShowcase(id) {
    if (!confirm('确定要删除这张买家秀吗？')) return;
    for (var i = 0; i < showcaseData.length; i++) {
      if (showcaseData[i].id === id) {
        showcaseData.splice(i, 1);
        break;
      }
    }
    saveShowcaseData();
    renderShowcase();
    showToast('已删除');
  }

  // ===== Utilities =====
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
      t.style.transition = 'opacity 0.3s';
      t.style.opacity = '0';
      setTimeout(function() { t.remove(); }, 300);
    }, 1800);
  }

  // ===== Expose to window._cloth =====
  if (!window._cloth) window._cloth = {};
  window._cloth.switchView = switchView;
  window._cloth.openUpload = openUpload;
  window._cloth.closeUpload = closeUpload;
  window._cloth.submitUpload = submitUpload;
  window._cloth.deleteShowcase = deleteShowcase;

  init();

})();
