(function() {
  'use strict';

  var LS_REVIEWS = 'clothing_reviews';
  var reviewsData = {};

  function init() {
    loadReviews();
    setupStarSelector();
    updateAverageRatings();
  }

  function loadReviews() {
    var saved = localStorage.getItem(LS_REVIEWS);
    if (saved) {
      try { reviewsData = JSON.parse(saved); } catch(e) { reviewsData = {}; }
    } else {
      reviewsData = {};
    }
  }

  function saveReviews() {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(reviewsData));
  }

  function getProductReviews(pid) {
    return reviewsData[pid] || [];
  }

  function getAverageRating(pid) {
    var list = reviewsData[pid];
    if (!list || list.length === 0) return { average: 0, count: 0 };
    var sum = 0;
    for (var i = 0; i < list.length; i++) {
      sum += list[i].rating;
    }
    return { average: sum / list.length, count: list.length };
  }

  function renderStars(rating) {
    var full = Math.round(rating);
    var s = '';
    for (var i = 1; i <= 5; i++) {
      if (i <= full) {
        s += '<span class="s-star s-on">★</span>';
      } else {
        s += '<span class="s-star s-off">☆</span>';
      }
    }
    return s;
  }

  function updateAverageRatings() {
    var cards = document.querySelectorAll('.product-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var pid = parseInt(card.getAttribute('data-pid'), 10);
      if (!pid) continue;
      var info = getAverageRating(pid);
      var el = card.querySelector('.card-rating');
      if (!el) continue;
      if (info.count > 0) {
        el.innerHTML = renderStars(info.average) + ' <span class="rating-num">' + info.average.toFixed(1) + '</span>';
      } else {
        el.innerHTML = '';
      }
    }
  }

  // ===== Review Modal =====
  function openReviews(pid, productName) {
    var overlay = document.getElementById('reviewsOverlay');
    var modal = document.getElementById('reviewsModal');
    if (!overlay || !modal) return;

    modal.dataset.productId = pid;

    var titleEl = document.getElementById('reviewsModalTitle');
    if (titleEl) titleEl.textContent = productName + ' - 商品评价';

    var form = document.getElementById('reviewsForm');
    if (form) form.reset();
    var errEl = document.getElementById('errReview');
    if (errEl) errEl.textContent = '';

resetStarSelector();
    renderReviewsList(pid);

    overlay.classList.add('show');
    modal.classList.add('show');
    setTimeout(function() { document.getElementById('reviewNickname').focus(); }, 100);
  }

  function closeReviews() {
    var overlay = document.getElementById('reviewsOverlay');
    var modal = document.getElementById('reviewsModal');
    if (overlay) overlay.classList.remove('show');
    if (modal) modal.classList.remove('show');
  }

  function resetStarSelector() {
    var stars = document.querySelectorAll('.star-selector .star');
    for (var i = 0; i < stars.length; i++) {
      stars[i].className = 'star';
    }
    var rv = document.getElementById('ratingValue');
    if (rv) rv.value = '0';
    updateRatingLabel(0);
  }

  function updateRatingLabel(rating) {
    var hint = document.getElementById('ratingHint');
    if (!hint) return;
    var labels = ['', '非常差', '较差', '一般', '满意', '非常满意'];
    hint.textContent = rating > 0 ? labels[rating] : '请点击星星评分';
  }

  function renderReviewsList(pid) {
    var container = document.getElementById('reviewsList');
    if (!container) return;
    var list = getProductReviews(pid);

    if (list.length === 0) {
      container.innerHTML = '<div class="review-empty">还没有评价，快来发表第一条评价吧~</div>';
      return;
    }

    container.innerHTML = '';
    for (var i = list.length - 1; i >= 0; i--) {
      var r = list[i];
      var div = document.createElement('div');
      div.className = 'review-item';
      var contentHtml = r.content ? '<div class="review-content">' + escapeHtml(r.content) + '</div>' : '';
      div.innerHTML =
        '<div class="review-header">' +
          '<span class="review-nickname">' + escapeHtml(r.nickname) + '</span>' +
          '<span class="review-date">' + r.date + '</span>' +
        '</div>' +
        '<div class="review-stars">' + renderStars(r.rating) + '</div>' +
        contentHtml +
        '<div class="review-actions">' +
          '<button class="review-delete" onclick="window._cloth.deleteReview(' + pid + ',' + r.id + ')">删除</button>' +
        '</div>';
      container.appendChild(div);
    }
  }

  // ===== Submit Review =====
  function submitReview(e) {
    e.preventDefault();
    var modal = document.getElementById('reviewsModal');
    var pid = parseInt(modal.dataset.productId, 10);
    var nicknameInput = document.getElementById('reviewNickname');
    var contentInput = document.getElementById('reviewContent');
    var ratingInput = document.getElementById('ratingValue');
    var errEl = document.getElementById('errReview');

    var nickname = nicknameInput ? nicknameInput.value.trim() : '';
    var content = contentInput ? contentInput.value.trim() : '';
    var rating = parseInt(ratingInput ? ratingInput.value : '0', 10);

    if (!nickname) {
      if (errEl) errEl.textContent = '请输入昵称';
      return;
    }
    if (nickname.length > 20) {
      if (errEl) errEl.textContent = '昵称不能超过20个字符';
      return;
    }
    if (rating < 1 || rating > 5) {
      if (errEl) errEl.textContent = '请点击星星选择评分';
      return;
    }
    if (errEl) errEl.textContent = '';

    var list = reviewsData[pid];
    if (!list) {
      list = [];
      reviewsData[pid] = list;
    }
    list.push({
      id: Date.now() + Math.random(),
      nickname: nickname,
      rating: rating,
      content: content,
      date: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    });
    saveReviews();
    renderReviewsList(pid);
    updateAverageRatings();
    if (nicknameInput) nicknameInput.value = '';
    if (contentInput) contentInput.value = '';
    resetStarSelector();
    if (errEl) errEl.textContent = '';
    showToast('评价发表成功 ✓');
  }

  // ===== Delete Review =====
  function deleteReviewAction(pid, reviewId) {
    if (!confirm('确定要删除这条评价吗？')) return;
    var list = reviewsData[pid];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === reviewId) {
        list.splice(i, 1);
        break;
      }
    }
    if (list.length === 0) delete reviewsData[pid];
    saveReviews();
    var modal = document.getElementById('reviewsModal');
    if (modal) {
      renderReviewsList(parseInt(modal.dataset.productId, 10));
    }
    updateAverageRatings();
    showToast('评价已删除');
  }

  // ===== Star Selector Setup =====
  function setupStarSelector() {
    var container = document.getElementById('starSelector');
    if (!container) return;
    var stars = container.querySelectorAll('.star');

    function setRating(idx) {
      var rating = idx + 1;
      var rv = document.getElementById('ratingValue');
      if (rv) rv.value = rating;
      updateRatingLabel(rating);
      for (var j = 0; j < stars.length; j++) {
        if (j <= idx) {
          stars[j].className = 'star active';
          stars[j].setAttribute('aria-checked', 'true');
        } else {
          stars[j].className = 'star';
          stars[j].setAttribute('aria-checked', 'false');
        }
      }
    }

    for (var i = 0; i < stars.length; i++) {
      stars[i].index = i;
      stars[i].onclick = function() { setRating(this.index); };
      stars[i].onkeydown = function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          var next = Math.min(this.index + 1, stars.length - 1);
          stars[next].focus();
          setRating(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          var prev = Math.max(this.index - 1, 0);
          stars[prev].focus();
          setRating(prev);
        }
      };
      stars[i].onmouseenter = function() {
        var idx = this.index;
        for (var j = 0; j < stars.length; j++) {
          if (j <= idx) {
            stars[j].className = 'star hover';
          } else {
            stars[j].className = 'star';
          }
        }
      };
      stars[i].onmouseleave = function() {
        for (var j = 0; j < stars.length; j++) {
          if (stars[j].className.indexOf('active') !== -1) {
            stars[j].className = 'star active';
          } else {
            stars[j].className = 'star';
          }
        }
      };
    }
  }

  // ===== Utility =====
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ===== Expose to window._cloth =====
  if (!window._cloth) window._cloth = {};
  window._cloth.updateAverageRatings = updateAverageRatings;
  window._cloth.openReviews = openReviews;
  window._cloth.closeReviews = closeReviews;
  window._cloth.submitReview = submitReview;
  window._cloth.deleteReview = deleteReviewAction;

  init();

})();
