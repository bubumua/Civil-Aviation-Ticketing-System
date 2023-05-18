function login() {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', '/flight');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log(data); // 在控制台中打印查询结果
                // 在这里可以使用JavaScript处理查询结果

            } else {
                console.error(xhr.statusText);
            }
        }
    };

    xhr.send();
}