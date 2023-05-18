// 获取元素
const loginElements = document.querySelectorAll('.login');
const signupElements = document.querySelectorAll('.signup');
const confirmPasswordLabel = document.createElement('label');
const confirmPasswordInput = document.createElement('input');
const form = document.querySelector('.login-form');
const userLoginButton = document.getElementById('user-login');
const adminLoginButton = document.getElementById('admin-login');
const userSignupButton = document.getElementById('user-signup');
const extraParamsInput = document.createElement('input');

// 设置隐藏的input元素
extraParamsInput.type = 'hidden';
extraParamsInput.name = 'isAdmin';
extraParamsInput.value = 'false';
// 将隐藏的input元素添加到表单中
form.appendChild(extraParamsInput);

// 给不同的submit按钮添加事件监听器，只有“管理员登录”额外参数才为true
userLoginButton.addEventListener('click', function () {
    extraParamsInput.value = 'false';
});
adminLoginButton.addEventListener('click', function () {
    extraParamsInput.value = 'true';
});
userSignupButton.addEventListener('click', function () {
    extraParamsInput.value = 'false';
});

// 给确认密码输入框添加属性和文本
confirmPasswordInput.type = 'password';
confirmPasswordInput.id = 'confirm-password';
confirmPasswordInput.name = 'confirm-password';
confirmPasswordInput.required = true;
confirmPasswordLabel.textContent = '确认密码';

console.log(signupElements);
console.log(loginElements);

// 给“用户注册”按钮添加事件监听器
loginElements[1].addEventListener('click', function () {
    // 显示确认密码输入框和标签
    document.querySelector('.usermsg').appendChild(confirmPasswordLabel);
    document.querySelector('.usermsg').appendChild(confirmPasswordInput);

    // 隐藏登录元素，显示注册元素
    loginElements.forEach(function (el) {
        el.style.display = 'none';
    });
    signupElements.forEach(function (el) {
        el.style.display = 'inline-block';
    });
});

// 给“返回”按钮添加事件监听器
signupElements[1].addEventListener('click', function () {
    // 隐藏确认密码输入框和标签
    document.querySelector('.usermsg').removeChild(confirmPasswordLabel);
    document.querySelector('.usermsg').removeChild(confirmPasswordInput);

    // 隐藏注册元素，显示登录元素
    loginElements.forEach(function (el) {
        el.style.display = 'inline-block';
    });
    signupElements.forEach(function (el) {
        el.style.display = 'none';
    });
});
