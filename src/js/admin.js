// const { copy } = require("../../router");

function generateFlightsData(number = 3) {
    const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '南京', '苏州', '天津', '西安', '芜湖', '合肥', '哈尔滨', '乌鲁木齐', '厦门'];
    const airlines = ['中国国际航空', '东方航空', '南方航空', '海南航空', '厦门航空', '春秋航空'];
    const random_flights = [];

    for (let i = 0; i < number; i++) {
        const startCity = cities[Math.floor(Math.random() * cities.length)];
        let endCity = cities[Math.floor(Math.random() * cities.length)];
        while (endCity === startCity) {
            endCity = cities[Math.floor(Math.random() * cities.length)];
        }
        const departure_timestamp = Date.now() + Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30);
        const arrival_timestamp = departure_timestamp + 1000 * 60 * 60 + Math.floor(Math.random() * 1000 * 60 * 60 * 20);
        const departureDate = new Date(departure_timestamp);
        const arrivalDate = new Date(arrival_timestamp);
        const price = 250 + Math.round(Math.random() * 4999); // 生成 0 到 10000 之间的随机价格（保留两位小数）
        const discount = Math.round(Math.random() * 100) / 100; // 生成 0 到 1 之间的随机折扣（保留两位小数）
        const discounted_tickets = Math.floor(Math.random() * 30); // 生成 0 到 30 之间的随机优惠票数量
        const rest_tickets = discounted_tickets + Math.floor(Math.random() * 100); // 在优惠券基础上生成 0 到 100 之间的随机余票数量
        const airline = airlines[Math.floor(Math.random() * airlines.length)]; // 从航空公司列表中随机选择一个

        // 转换时间为MySQL的数据类型
        const formattedDepartureDate = departureDate.toISOString().slice(0, 10);
        const formattedArrivalDate = arrivalDate.toISOString().slice(0, 10);
        const formattedDepartureTime = departureDate.toISOString().slice(11, 19);
        const formattedArrivalTime = arrivalDate.toISOString().slice(11, 19);
        // 随机生成两个大写字母
        const letter_number = 1 + Math.floor(Math.random() * 2);
        const digit_number = 3 + Math.floor(Math.random() * 2);
        let flight = '';
        for (let i = 0; i < letter_number; i++) {
            flight += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
        flight += Math.floor(100 + Math.random() * 10000).toString();

        random_flights.push({
            flight: flight,
            start_city: startCity,
            end_city: endCity,
            departure_date: formattedDepartureDate,
            departure_time: formattedDepartureTime,
            arrival_date: formattedArrivalDate,
            arrival_time: formattedArrivalTime,
            price: price,
            discounted_tickets: discounted_tickets,
            discount: discount,
            rest_tickets: rest_tickets,
            airline: airline
        });
    }

    return random_flights;
}

function flightInfoValid(info) {
    let res = true;
    Object.entries(info).forEach(([key, value]) => {
        if (value.trim().length == 0) {
            // console.log(`value[${key}] length = ${value.trim().length}`);
            res = false;
        }
    });
    return res;
}

function showMessage(message, duration = 3000) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    messageElement.style.transition = 'opacity 0.5s ease-out';

    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s ease-in';
        // 在定时器回调函数中执行其他操作
    }, duration);
}

function handleAddConfirmButton() {
    // 获取表单数据
    const form = document.getElementById('add_flight_form');
    const newFlightElements = form.elements;
    const newFlightInfo = {
        flight: newFlightElements.flight_number.value,
        start_city: newFlightElements.start_city.value,
        end_city: newFlightElements.end_city.value,
        departure_date: newFlightElements.departure_date.value,
        departure_time: newFlightElements.departure_time.value,
        arrival_date: newFlightElements.arrival_date.value,
        arrival_time: newFlightElements.arrival_time.value,
        price: newFlightElements.price.value,
        discounted_tickets: newFlightElements.discounted_tickets.value,
        discount: newFlightElements.discount.value,
        rest_tickets: newFlightElements.rest_tickets.value,
        airline: newFlightElements.airline.value
    }
    // 检查表单数据
    if (flightInfoValid(newFlightInfo)) {
        // 发送POST请求，将表单数据存入数据库
        console.log('发送新增请求');
        fetch('/addFlight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([newFlightInfo])
        })
            .then(res => res.json())
            .then(data => {
                console.log('response data =', data);
                if (data.success) {
                    showMessage('添加成功！');
                    handleQueryButtonClick();
                }
                else {
                    showMessage('添加失败！');
                }
            })
            .catch(error => {
                console.error(error);
                showMessage('添加异常！');
            });
    } else {
        showMessage('任意航班信息值不能为空！');
    }
}

function handleAddInOneButon() {
    // 发送POST请求，将表单数据存入数据库
    console.log('发送新增请求');
    fetch('/addFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateFlightsData())
    })
        .then(res => res.json())
        .then(data => {
            console.log('response data =', data);
            if (data.success) {
                showMessage('添加成功！');
                handleQueryButtonClick();
            }
            else {
                showMessage('添加失败！');
            }
        })
        .catch(error => {
            console.error(error);
            showMessage('添加异常！');
        });

}

function handleAddButtonClick() {
    // 先删除旧监听器
    addBtn.removeEventListener('click', handleAddButtonClick);

    // 将新增按钮分裂为确认、取消、随机添加
    addBtn.style.display = 'none';
    const addConfirmButton = document.createElement('input');
    addConfirmButton.type = 'button';
    addConfirmButton.value = '确认添加';
    addConfirmButton.id = 'addConfirmBtn';
    const addCancelButton = document.createElement('input');
    addCancelButton.type = 'button';
    addCancelButton.value = '取消添加';
    addCancelButton.id = 'addCancelBtn';
    const addInOneButton = document.createElement('input');
    addInOneButton.type = 'button';
    addInOneButton.value = '随机添加';
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('form-buttons');
    buttonContainer.classList.add('form-buttons-added');
    buttonContainer.appendChild(addConfirmButton);
    buttonContainer.appendChild(addCancelButton);
    buttonContainer.appendChild(addInOneButton);
    flight_table.parentNode.parentNode.appendChild(buttonContainer);

    // 添加表单
    const form = document.createElement('form');
    form.id = 'add_flight_form';
    form.classList.add('flight_form');
    form.classList.add('add_flight_form');
    form.innerHTML = `
    <h2>添加航班信息</h2>
    <table id="add_flight_table">
      <thead>
        <tr>
          <th>航班号</th>
          <th>出发城市</th>
          <th>到达城市</th>
          <th>出发日期</th>
          <th>出发时间</th>
          <th>到达日期</th>
          <th>到达时间</th>
          <th>价格</th>
          <th>优惠票数量</th>
          <th>折扣</th>
          <th>余票数量</th>
          <th>航空公司</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="text" id="flight_number" name="flight_number" required></td>
          <td><input type="text" id="start_city" name="start_city" required></td>
          <td><input type="text" id="end_city" name="end_city" required></td>
          <td><input type="date" id="departure_date" name="departure_date" required></td>
          <td><input type="time" id="departure_time" name="departure_time" required></td>
          <td><input type="date" id="arrival_date" name="arrival_date" required></td>
          <td><input type="time" id="arrival_time" name="arrival_time" required></td>
          <td><input type="number" id="price" name="price" required></td>
          <td><input type="number" id="discounted_tickets" name="discounted_tickets" required></td>
          <td><input type="number" id="discount" name="discount" required></td>
          <td><input type="number" id="rest_tickets" name="rest_tickets" required></td>
          <td><input type="text" id="airline" name="airline" required></td>
        </tr>
      </tbody>
    </table>
  `;
    flight_table.parentNode.parentNode.insertBefore(form, buttonContainer);

    // 监听"取消添加"按钮的点击事件
    addCancelButton.addEventListener('click', () => {
        addBtn.style.display = 'inline-block';
        addBtn.addEventListener('click', handleAddButtonClick);
        buttonContainer.remove();
        form.remove();
    });

    // 监听“确认添加”按钮的点击事件
    addConfirmButton.addEventListener('click', handleAddConfirmButton);

    // 监听“随机添加”按钮
    addInOneButton.addEventListener('click', handleAddInOneButon);
}

function refreshFlightTable(flights) {
    const flightTable = flight_table;
    const tbody = flightTable.querySelector('tbody');
    // 清空表格中原有的内容
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    // 将查询到的数据插入到表格中
    for (const flight of flights) {
        const tr = tbody.insertRow();
        tr.insertCell().innerHTML = '<input type="checkbox">';
        tr.insertCell().textContent = flight.flight;
        tr.insertCell().textContent = flight.start_city;
        tr.insertCell().textContent = flight.end_city;
        tr.insertCell().textContent = flight.departure_date.substring(0, 10);;
        tr.insertCell().textContent = flight.departure_time;
        tr.insertCell().textContent = flight.arrival_date.substring(0, 10);;
        tr.insertCell().textContent = flight.arrival_time;
        tr.insertCell().textContent = flight.price;
        tr.insertCell().textContent = flight.discounted_tickets;
        tr.insertCell().textContent = flight.discount;
        tr.insertCell().textContent = flight.rest_tickets;
        tr.insertCell().textContent = flight.airline;
    }
}

function queryAndRefresh(queryCondition) {
    fetch('/queryFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryCondition)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('response data =', data);
                refreshFlightTable(data.queryRes);
            }
            else {
                console.log('Query fail!');
                showMessage('查询失败！');
            }
        })
        .catch(error => {
            console.error(error);
            showMessage('查询异常！');
        });
}

function handleQueryButtonClick() {
    const start = flight_form.elements.start_to_seartch.value;
    const end = flight_form.elements.end_to_seartch.value;
    const departure_order = flight_form.elements.departure_order.value;
    const arrival_order = flight_form.elements.arrival_order.value;
    const queryCondition = {
        start_city: start,
        end_city: end,
        departure_order: departure_order,
        arrival_order: arrival_order
    }
    queryAndRefresh(queryCondition);
};

function handleDeleteButtonClick() {
    // 获取表格元素和所有行元素
    const table = flight_table;
    const rows = table.querySelectorAll('tbody tr');
    // 遍历所有行元素，生成被选中的行的数组
    let deletedFlights = [];

    rows.forEach((row) => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const flight = row.getElementsByTagName("td")[1].innerHTML.trim();
        if (checkbox.checked) {
            deletedFlights.push(flight);
        }
    });
    // console.log(deletedFlights);
    fetch('/deleteFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletedFlights)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('response data =', data);
                handleQueryButtonClick();
            }
            else {
                console.log('Delete fail!');
                showMessage('删除失败！');
            }
        })
        .catch(error => {
            console.error(error);
            showMessage('删除异常！');
        });
}

function handleUpdateConfirmButton() {
    // 获取表单数据
    const form = document.getElementById('update_flight_table');
    const update_table = form.querySelector('tbody');
    const update_rows = update_table.querySelectorAll('tbody tr');

    // 生成待更新航班数组
    let updatedFlights = [];
    rows.forEach((row) => {
        const flight = row.getElementsByTagName("td")[1].innerHTML.trim();
        if (checkbox.checked) {
            deletedFlights.push(flight);
        }
    });
}

function handleUpdateButtonClick() {
    // 先删除旧监听器
    updateBtn.removeEventListener('click', handleUpdateButtonClick);

    // 将修改按钮分裂为确认、取消
    updateBtn.style.display = 'none';
    const updateConfirmButton = document.createElement('input');
    updateConfirmButton.type = 'button';
    updateConfirmButton.value = '确认修改';
    updateConfirmButton.id = 'updateConfirmButton';
    const updateCancelButton = document.createElement('input');
    updateCancelButton.type = 'button';
    updateCancelButton.value = '取消修改';
    updateCancelButton.id = 'updateCancelButton';
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('form-buttons');
    buttonContainer.classList.add('form-buttons-added');
    buttonContainer.appendChild(updateConfirmButton);
    buttonContainer.appendChild(updateCancelButton);
    flight_table.parentNode.parentNode.appendChild(buttonContainer);

    // 添加表单
    const form = document.createElement('form');
    form.id = 'update_flight_form';
    form.classList.add('flight_form');
    form.classList.add('add_flight_form');
    form.innerHTML = `
    <h2>修改航班信息</h2>
    <table id="update_flight_table">
      <thead>
        <tr>
          <th>航班号</th>
          <th>出发城市</th>
          <th>到达城市</th>
          <th>出发日期</th>
          <th>出发时间</th>
          <th>到达日期</th>
          <th>到达时间</th>
          <th>价格</th>
          <th>优惠票数量</th>
          <th>折扣</th>
          <th>余票数量</th>
          <th>航空公司</th>
        </tr>
      </thead>
      <tbody id="update_flight_table_tbody">
        <!-- 航班信息 -->
      </tbody>
    </table>
  `;
    flight_table.parentNode.parentNode.insertBefore(form, buttonContainer);
    // 复制选中行的数据到新表格
    const table = flight_table;
    const rows = table.querySelectorAll('tbody tr');
    const updateTableTbody = document.getElementById('update_flight_table_tbody');
    console.log(rows);
    rows.forEach((row) => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        // 根据原表，插入待更新的表单项
        if (checkbox.checked) {
            console.log(row);
            const copyRow = updateTableTbody.insertRow();

            const td1 = row.getElementsByTagName("td")[1].innerHTML.trim();
            // copyRow.insertCell().innerHTML = `<input type="text" id="flight_number" name="flight_number" value="${td1}" required>`;
            copyRow.insertCell().innerHTML = `${td1}`;

            const td2 = row.getElementsByTagName("td")[2].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="text" id="start_city" name="start_city" value="${td2}" required>`;

            const td3 = row.getElementsByTagName("td")[3].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="text" id="end_city" name="end_city" value="${td3}" required>`;

            const td4 = row.getElementsByTagName("td")[4].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="date" id="departure_date" name="departure_date" value="${td4}" required>`;

            const td5 = row.getElementsByTagName("td")[5].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="time" id="departure_time" name="departure_time" value="${td5}" required>`;

            const td6 = row.getElementsByTagName("td")[6].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="date" id="arrival_date" name="arrival_date" value="${td6}" required>`;

            const td7 = row.getElementsByTagName("td")[7].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="time" id="arrival_time" name="arrival_time" value="${td7}" required>`;

            const td8 = row.getElementsByTagName("td")[8].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="number" id="price" name="price" value="${td8}" required>`;

            const td9 = row.getElementsByTagName("td")[9].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="number" id="discounted_tickets" name="discounted_tickets" value="${td9}" required>`;

            const td10 = row.getElementsByTagName("td")[10].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="number" id="discount" name="discount" value="${td10}" required>`;

            const td11 = row.getElementsByTagName("td")[11].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="number" id="rest_tickets" name="rest_tickets" value="${td11}" required>`;

            const td12 = row.getElementsByTagName("td")[12].innerHTML.trim();
            copyRow.insertCell().innerHTML = `<input type="text" id="airline" name="airline" value="${td12}" required>`;

        }
    });

    // 监听"取消修改"按钮的点击事件
    updateCancelButton.addEventListener('click', () => {
        updateBtn.style.display = 'inline-block';
        updateBtn.addEventListener('click', handleUpdateButtonClick);
        buttonContainer.remove();
        form.remove();
    });

    // 监听“确认修改”按钮的点击事件
    updateConfirmButton.addEventListener('click', handleUpdateConfirmButton);

}

// 获取页面元素
const flight_form = document.getElementById('flight_form');
const flight_table = document.getElementById('flight_table');
const addBtn = flight_form.querySelector('input[value="新增"]');
const queryBtn = flight_form.querySelector('input[value="查询"]');
const deleteBtn = flight_form.querySelector('input[value="删除"]');
const updateBtn = flight_form.querySelector('input[value="修改"]');

// 添加监听器：点击表项后选中
flight_form.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'TD') {
        const checkbox = target.parentNode.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            target.parentNode.classList.toggle('selected', checkbox.checked);
        }
    }
});

flight_form.addEventListener("click", () => {
    // console.log('flight_form checkbox changed');
    const inputs = flight_form.querySelectorAll('input[type="checkbox"]');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked) {
            // 如果有任何一个输入框被勾选或者有值，则启用“修改”按钮
            updateBtn.disabled = false;
            return;
        }
    }
    // 否则禁用“修改”按钮
    updateBtn.disabled = true;
});

// 监听新增按钮的点击事件
addBtn.addEventListener('click', handleAddButtonClick);

// 监听查询按钮
queryBtn.addEventListener('click', handleQueryButtonClick);

// 监听删除按钮
deleteBtn.addEventListener('click', handleDeleteButtonClick);

// 监听修改按钮
updateBtn.addEventListener('click', handleUpdateButtonClick);

// 获取cookie
const cookies = document.cookie.split(';');
const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
var user;
try {
    user = userCookie ? JSON.parse(userCookie.split('=')[1]) : null;
} catch (error) {
    console.log(error);
    throw (error);
}
console.log(user, 'logs in');
// 通过cookie设置用户信息
const usertype = document.getElementById('usertype');
const username = document.getElementById('username');
usertype.textContent = user.isAdmin ? '管理员' : '用户';
username.textContent = user.username;
// 刷新航班信息
handleQueryButtonClick();
// 禁用修改
updateBtn.disabled = true;