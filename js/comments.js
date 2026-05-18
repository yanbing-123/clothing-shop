(function() {
  'use strict';

  var LS_COMMENTS = 'clothing_comments';
  var commentsData = {};  // pid -> [{id, nickname, content, date}]

  // ===== Initialization =====
  function init() {
    loadComments();
  }

  // ===== Persistence =====
  function loadComments() {
    var saved = safeParse(LS_COMMENTS, {});
    if (saved && typeof saved === 'object') {
      commentsData = saved;
    } else {
      commentsData = {};
    }
  }

  function saveComments() {
    localStorage.setItem(LS_COMMENTS, JSON.stringify(commentsData));
  }

  function getProductComments(pid) {
    return commentsData[pid] || [];
  }

  // ===== Add Comment =====
  function addComment(pid, nickname, content) {
    var list = commentsData[pid];
    if (!list) {
      list = [];
      commentsData[pid] = list;
    }
    list.push({
      id: Date.now() + Math.random(),
      nickname: nickname.trim(),
      content: content.trim(),
      date: new Date().toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    });
    saveComments();
  }

  // ===== Delete Comment =====
  function deleteComment(pid, commentId) {
    var list = commentsData[pid];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === commentId) {
        list.splice(i, 1);
        break;
      }
    }
    if (list.length === 0) {
      delete commentsData[pid];
    }
    saveComments();
  }

  // ===== Get Comment Count =====
  function getCommentCount(pid) {
    var list = commentsData[pid];
    return list ? list.length : 0;
  }

  // ===== Open Comments Modal =====
  function openComments(pid, productName) {
    var overlay = document.getElementById('commentsOverlay');
    var modal = document.getElementById('commentsModal');
    if (!overlay || !modal) return;

    // Set product context
    modal.dataset.productId = pid;

    // Set title
    var titleEl = document.getElementById('commentsModalTitle');
    if (titleEl) titleEl.textContent = productName + ' - 用户评论';

    // Clear form
    var form = document.getElementById('commentsForm');
    if (form) form.reset();
    var errEl = document.getElementById('errComment');
    if (errEl) errEl.textContent = '';

// Render comments
    renderComments(pid);

    // Show modal
    overlay.classList.add('show');
    modal.classList.add('show');
    setTimeout(function() { document.getElementById('commentNickname').focus(); }, 100);
  }

  function closeComments() {
    var overlay = document.getElementById('commentsOverlay');
    var modal = document.getElementById('commentsModal');
    if (overlay) overlay.classList.remove('show');
    if (modal) modal.classList.remove('show');
  }

  // ===== Render Comments =====
  function renderComments(pid) {
    var container = document.getElementById('commentsList');
    if (!container) return;

    var list = getProductComments(pid);

    if (list.length === 0) {
      container.innerHTML = '<div class="comments-empty">还没有评论，快来发表第一条评论吧~</div>';
      return;
    }

    container.innerHTML = '';

    // Show newest first
    for (var i = list.length - 1; i >= 0; i--) {
      var c = list[i];
      var div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML =
        '<div class="comment-header">' +
          '<span class="comment-nickname">' + escapeHtml(c.nickname) + '</span>' +
          '<span class="comment-date">' + c.date + '</span>' +
        '</div>' +
        '<div class="comment-content">' + escapeHtml(c.content) + '</div>' +
        '<div class="comment-actions">' +
          '<button class="comment-delete" onclick="window._cloth.deleteComment(' + pid + ',' + c.id + ')">删除</button>' +
        '</div>';
      container.appendChild(div);
    }
  }

  // ===== Submit Comment =====
  function submitComment(e) {
    e.preventDefault();
    var modal = document.getElementById('commentsModal');
    var pid = parseInt(modal.dataset.productId, 10);
    var nicknameInput = document.getElementById('commentNickname');
    var contentInput = document.getElementById('commentContent');
    var errEl = document.getElementById('errComment');

    var nickname = nicknameInput ? nicknameInput.value.trim() : '';
    var content = contentInput ? contentInput.value.trim() : '';

    if (!nickname) {
      if (errEl) errEl.textContent = '请输入昵称';
      return;
    }
    if (nickname.length < 1 || nickname.length > 20) {
      if (errEl) errEl.textContent = '昵称长度需要在1-20个字符之间';
      return;
    }
    if (!content) {
      if (errEl) errEl.textContent = '请输入评论内容';
      return;
    }
    if (content.length < 2) {
      if (errEl) errEl.textContent = '评论内容太短，请至少输入2个字符';
      return;
    }
    if (content.length > 200) {
      if (errEl) errEl.textContent = '评论内容不能超过200个字符';
      return;
    }
    if (errEl) errEl.textContent = '';

    addComment(pid, nickname, content);
    renderComments(pid);
    updateCommentCounts();

    // Clear form
    if (nicknameInput) nicknameInput.value = '';
    if (contentInput) contentInput.value = '';
    if (errEl) errEl.textContent = '';

    showToast('评论发表成功 ✓');
  }

  // ===== Delete Comment (exposed) =====
  function deleteCommentAction(pid, commentId) {
    if (!confirm('确定要删除这条评论吗？')) return;
    deleteComment(pid, commentId);
    var modal = document.getElementById('commentsModal');
    if (modal) {
      renderComments(parseInt(modal.dataset.productId, 10));
    }
    updateCommentCounts();
    showToast('评论已删除');
  }

  // ===== Update Comment Count Badges =====
  function updateCommentCounts() {
    var badges = document.querySelectorAll('.comment-count-badge');
    for (var i = 0; i < badges.length; i++) {
      var badge = badges[i];
      var pid = parseInt(badge.id.replace('commentCount', ''), 10);
      if (!isNaN(pid)) {
        badge.textContent = getCommentCount(pid);
      }
    }
  }

  // ===== Utility =====
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ===== Expose to window._cloth =====
  if (!window._cloth) window._cloth = {};
  window._cloth.getCommentCount = getCommentCount;
  window._cloth.openComments = openComments;
  window._cloth.closeComments = closeComments;
  window._cloth.submitComment = submitComment;
  window._cloth.deleteComment = deleteCommentAction;
  window._cloth.updateCommentCounts = updateCommentCounts;

  init();

})();
