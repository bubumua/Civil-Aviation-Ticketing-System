// 获取元素
const loginElements = document.querySelectorAll('.login');
const signupElements = document.querySelectorAll('.signup');
const confirmPasswordLabel = document.createElement('label');
const confirmPasswordInput = document.createElement('input');

// 给确认密码输入框添加属性
confirmPasswordInput.type = 'password';
confirmPasswordInput.id = 'confirm-password';
confirmPasswordInput.name = 'confirm-password';
confirmPasswordInput.required = true;

// 给确认密码标签添加文本
confirmPasswordLabel.textContent = '确认密码';

// 给“用户注册”按钮添加事件监听器
signupElements[1].addEventListener('click', function () {
    // 显示确认密码输入框和标签
    document.querySelector('.usermsg').appendChild(confirmPasswordLabel);
    document.querySelector('.usermsg').appendChild(confirmPasswordInput);

    // 隐藏登录元素，显示注册元素
    loginElements.forEach(function (el) {
        el.classList.add('slide-leave-active');
        el.addEventListener('transitionend', function () {
            el.style.display = 'none';
        }, { once: true });
    });
    signupElements.forEach(function (el) {
        el.classList.remove('fade-enter');
        el.classList.add('slide-enter-active');
        el.style.display = 'inline-block';
    });
});

// 给“返回”按钮添加事件监听器
signupElements[4].addEventListener('click', function () {
    // 隐藏确认密码输入框和标签
    document.querySelector('.usermsg').removeChild(confirmPasswordLabel);
    document.querySelector('.usermsg').removeChild(confirmPasswordInput);

    // 隐藏注册元素，显示登录元素
    loginElements.forEach(function (el) {
        el.classList.remove('slide-leave-active');
        el.classList.add('slide-enter-active');
        el.style.display = 'inline-block';
    });
    signupElements.forEach(function (el) {
        el.classList.add('fade-leave-active');
        el.addEventListener('transitionend', function () {
            el.style.display = 'none';
        }, { once: true });
    });
});
