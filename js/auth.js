/**
 * 服装购买系统 - 用户认证（注册 / 登录 / 登出）
 * 使用 localStorage 持久化用户数据（纯前端演示）
 */
(function() {
  'use strict';

  var LS_USERS    = 'clothing_users';
  var LS_SESSION  = 'clothing_session';

  var currentUser = null;  // { username, password, phone, address }

  // ===== 初始化 =====
  function init() {
    loadSession();
    updateAuthUI();
  }

  // ===== 会话恢复 =====
  function loadSession() {
    var saved = safeParse(LS_SESSION, null);
    if (!saved || !saved.username) return;
    var users = safeParse(LS_USERS, []);
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === saved.username) {
        currentUser = users[i];
        return;
      }
    }
  }

  // ===== 用户列表持久化 =====
  function getUsers() {
    return safeParse(LS_USERS, []);
  }

  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  // ===== 注册 =====
  function register(username, password, phone, address) {
    if (!username || username.length < 2) {
      showToast('用户名至少需要 2 个字符');
      return false;
    }
    if (!password || password.length < 6) {
      showToast('密码至少需要 6 个字符');
      return false;
    }

    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        showToast('用户名已存在');
        return false;
      }
    }

    users.push({
      username: username,
      password: password,
      phone: phone || '',
      address: address || '',
      createdAt: Date.now()
    });
    saveUsers(users);
    return true;
  }

  // ===== 登录 =====
  function login(username, password) {
    if (!username || !password) {
      showToast('请输入用户名和密码');
      return false;
    }

    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username && users[i].password === password) {
        currentUser = users[i];
        localStorage.setItem(LS_SESSION, JSON.stringify({ username: username }));
        updateAuthUI();
        showToast('登录成功，欢迎 ' + username + '！');
        return true;
      }
    }

    showToast('用户名或密码错误');
    return false;
  }

  // ===== 登出 =====
  function logout() {
    currentUser = null;
    localStorage.removeItem(LS_SESSION);
    updateAuthUI();
    showToast('已退出登录');
  }

  // ===== 查询状态 =====
  function isLoggedIn() {
    return currentUser !== null;
  }

  function getCurrentUser() {
    return currentUser;
  }

  // ===== UI 更新（头部） =====
  function updateAuthUI() {
    var container = document.getElementById('authContainer');
    if (!container) return;

    if (currentUser) {
      container.innerHTML =
        '<span class="user-greeting">你好，' + escapeHtml(currentUser.username) + '</span>' +
        '<button class="auth-btn" onclick="window._cloth.logout()">退出</button>';
    } else {
      container.innerHTML =
        '<button class="auth-btn" onclick="window._cloth.openLogin()">登录</button>' +
        '<button class="auth-btn auth-btn-register" onclick="window._cloth.openRegister()">注册</button>';
    }
  }

  // ===== 登录弹窗 =====
  function openLogin() {
    document.getElementById('loginOverlay').classList.add('show');
    document.getElementById('loginModal').classList.add('show');
    setTimeout(function() { document.getElementById('loginUsername').focus(); }, 100);
  }

  function closeLogin() {
    document.getElementById('loginOverlay').classList.remove('show');
    document.getElementById('loginModal').classList.remove('show');
    var form = document.getElementById('loginForm');
    if (form) form.reset();
  }

  function submitLogin(e) {
    e.preventDefault();
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!username) { showToast('请输入用户名'); return; }
    if (!password) { showToast('请输入密码'); return; }
    if (login(username, password)) closeLogin();
  }

  // ===== 注册弹窗 =====
  function openRegister() {
    document.getElementById('registerOverlay').classList.add('show');
    document.getElementById('registerModal').classList.add('show');
    setTimeout(function() { document.getElementById('regUsername').focus(); }, 100);
  }

  function closeRegister() {
    document.getElementById('registerOverlay').classList.remove('show');
    document.getElementById('registerModal').classList.remove('show');
    var form = document.getElementById('registerForm');
    if (form) form.reset();
  }

  function submitRegister(e) {
    e.preventDefault();
    var username = document.getElementById('regUsername').value.trim();
    var password = document.getElementById('regPassword').value;
    var confirmPwd = document.getElementById('regConfirmPassword').value;
    var phone = document.getElementById('regPhone').value.trim();
    var address = document.getElementById('regAddress').value.trim();

    if (!username || username.length < 2) { showToast('用户名至少需要 2 个字符'); return; }
    if (!password || password.length < 6) { showToast('密码至少需要 6 个字符'); return; }
    if (password !== confirmPwd) { showToast('两次密码输入不一致'); return; }

    if (register(username, password, phone, address)) {
      closeRegister();
      showToast('注册成功，请登录');
    }
  }

  // ===== 集成：结算时自动填充用户信息 =====
  function patchCheckout() {
    if (!window._cloth || !window._cloth.openCheckout) return;
    var origOpenCheckout = window._cloth.openCheckout;
    window._cloth.openCheckout = function() {
      if (currentUser) {
        autoFillCheckout();
      }
      return origOpenCheckout.apply(this, arguments);
    };
  }

  function autoFillCheckout() {
    var nameField = document.getElementById('fName');
    var phoneField = document.getElementById('fPhone');
    var addressField = document.getElementById('fAddress');
    if (nameField && !nameField.value) nameField.value = currentUser.username;
    if (phoneField && !phoneField.value) phoneField.value = currentUser.phone || '';
    if (addressField && !addressField.value) addressField.value = currentUser.address || '';
  }

  // ===== 工具 =====
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // ===== 暴露到 window._cloth =====
  if (!window._cloth) window._cloth = {};
  window._cloth.openLogin     = openLogin;
  window._cloth.closeLogin    = closeLogin;
  window._cloth.submitLogin   = submitLogin;
  window._cloth.openRegister  = openRegister;
  window._cloth.closeRegister = closeRegister;
  window._cloth.submitRegister = submitRegister;
  window._cloth.logout        = logout;
  window._cloth.isLoggedIn    = isLoggedIn;
  window._cloth.getCurrentUser = getCurrentUser;

  init();
  patchCheckout();

})();
