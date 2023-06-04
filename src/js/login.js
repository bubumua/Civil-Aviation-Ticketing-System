// 获取元素
const loginElements = document.querySelectorAll('.login');
const signupElements = document.querySelectorAll('.signup');
const confirmPasswordLabel = document.createElement('label');
const confirmPasswordInput = document.createElement('input');
const form = document.querySelector('.login-form');
const userLoginButton = document.getElementById('user-login');
// const adminLoginButton = document.getElementById('admin-login');
const userSignupButton = document.getElementById('user-signup');
const extraParamsInput = document.createElement('input');
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('errorMessage');

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
// adminLoginButton.addEventListener('click', function () {
//     extraParamsInput.value = 'true';
// });
userSignupButton.addEventListener('click', function () {
    extraParamsInput.value = 'false';
});

// 给确认密码输入框添加属性和文本
confirmPasswordInput.type = 'password';
confirmPasswordInput.id = 'confirm_password';
confirmPasswordInput.name = 'confirm_password';
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

// 给“用户登录”按钮添加点击监听器
loginElements[0].addEventListener('click', (e) => {
    e.preventDefault();
    const username = loginForm.elements.username.value;
    const password = loginForm.elements.password.value;
    console.log(`Login as ${username}`);
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
        // 将响应数据解析为 JavaScript 对象
        .then(response => response.json())
        // 根据响应，作出不同的处理
        .then(data => {
            console.log('response data =', data);
            // 若登录成功，则分情况进入用户或管理员界面
            if (data.success) {
                const user = {
                    username: username,
                    isAdmin: data.isAdmin
                }
                document.cookie = `user=${JSON.stringify(user)}; path=/`;
                window.location.href = data.isAdmin ? '/pages/admin.html' : '/pages/user.html';
            } else {
                errorMessage.textContent = '❌无效的用户名或密码'; // 显示错误消息
            }
        })
        .catch(error => {
            console.error(error);
            errorMessage.textContent = 'An error occurred'; // 显示错误消息
        });
});

// 给“确认注册”按钮添加事件监听器
signupElements[0].addEventListener('click', (e) => {
    e.preventDefault();
    const username = loginForm.elements.username.value;
    const password = loginForm.elements.password.value;
    const password_confirm = loginForm.elements.confirm_password.value;
    // 对用户的注册信息加以限制
    if (password !== password_confirm) {
        errorMessage.textContent = '❌确认密码与密码不符'; // 显示错误消息
    } else if (password.trim().length < 1 || username.trim().length < 1) {
        errorMessage.textContent = '❌用户名和密码不能为空或空格'; // 显示错误消息
    }
    else {
        console.log(`Login as ${username},${password_confirm}`);
        fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                isAdmin: false
            })
        })
            // 将响应数据解析为 JavaScript 对象
            .then(response => response.json())
            // 根据响应，作出不同的处理
            .then(data => {
                console.log(data);
                // 若登录成功，则返回登录
                if (data.success) {
                    window.location.href = '/login.html';
                    const usernameEle = document.getElementById('username');
                    const passwordEle = document.getElementById('password');
                    usernameEle.value = username;
                    passwordEle.value = password;
                    console.log(`set ${username} and ${password}`);
                }
                // 否则显示登录失败消息
                else {
                    errorMessage.textContent = '❌该用户名已被占用';
                }
            })
            // 若后端故障，显示错误消息
            .catch(error => {
                console.error(error);
                errorMessage.textContent = 'An error occurred';
            });
    }
});
