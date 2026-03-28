document.addEventListener('DOMContentLoaded', function () {
    let orders = [];
    let allDishes = [];
    let currentEditingOrder = null;

    // ✅ Корректные URL и ключ
    const ORDERS_API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';
    const DISHES_API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';

    // Инициализация
    async function init() {
        setupEventListeners();
        await loadDishes(); // Загружаем блюда для отображения названий
        await loadOrders();
    }

    // Загрузка блюд (для отображения названий по ID)
    async function loadDishes() {
        try {
            const response = await fetch(`${DISHES_API_URL}?api_key=${API_KEY}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            allDishes = data.map((dish, i) => ({ id: i + 1, ...dish }));
        } catch (error) {
            console.error('❌ Не удалось загрузить блюда:', error);
        }
    }

    // Загрузка заказов
    async function loadOrders() {
        showLoading();
        try {
            const response = await fetch(`${ORDERS_API_URL}?api_key=${API_KEY}`);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Неверный API-ключ. Обратитесь к преподавателю.');
                }
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
            orders = await response.json();
            // Сортировка: новые — первыми
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            displayOrders();
        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            showError(`Не удалось загрузить заказы: ${error.message}`);
            // Демо-данные для тестирования (без отправки на сервер)
            orders = generateDemoOrders();
            displayOrders();
        }
    }

    // Отображение заказов
    function displayOrders() {
        const list = document.getElementById('orders-list');
        const empty = document.getElementById('orders-empty');
        const loading = document.getElementById('orders-loading');

        loading.style.display = 'none';

        if (orders.length === 0) {
            empty.style.display = 'block';
            list.style.display = 'none';
            return;
        }

        empty.style.display = 'none';
        list.style.display = 'block';

        list.innerHTML = orders.map((order, index) => `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Заказ #${order.id || index + 1}</h3>
                        <div class="order-meta">
                            <span>${formatDate(order.created_at)}</span>
                            <span class="status-${order.status || 'pending'}">
                                ${getOrderStatus(order.status)}
                            </span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn-icon btn-view" onclick="viewOrder(${order.id})">
                            <i class="bi bi-eye"></i> Подробнее
                        </button>
                        <button class="btn-icon btn-edit" onclick="editOrder(${order.id})">
                            <i class="bi bi-pencil"></i> Редактировать
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmDelete(${order.id})">
                            <i class="bi bi-trash"></i> Удалить
                        </button>
                    </div>
                </div>
                <div class="order-dishes">
                    ${getDishesList(order)}
                </div>
                <div class="order-price">
                    ${calculateOrderTotal(order)}₽
                </div>
                <div class="order-delivery-time">
                    ${getDeliveryTimeText(order)}
                </div>
            </div>
        `).join('');
    }

    // ✅ Получение названий блюд по ID
    function getDishesList(order) {
        const names = [];
        if (order.soup_id) {
            const d = allDishes.find(d => d.id === order.soup_id);
            if (d) names.push(d.name);
        }
        if (order.salad_id) {
            const d = allDishes.find(d => d.id === order.salad_id);
            if (d) names.push(d.name);
        }
        if (order.main_course_id) {
            const d = allDishes.find(d => d.id === order.main_course_id);
            if (d) names.push(d.name);
        }
        if (order.drink_id) {
            const d = allDishes.find(d => d.id === order.drink_id);
            if (d) names.push(d.name);
        }
        if (order.dessert_id) {
            const d = allDishes.find(d => d.id === order.dessert_id);
            if (d) names.push(d.name);
        }
        return names.length > 0 ? names.join(', ') : 'Блюда не указаны';
    }

    function calculateOrderTotal(order) {
        let total = 0;
        if (order.soup_id) total += allDishes.find(d => d.id === order.soup_id)?.price || 0;
        if (order.salad_id) total += allDishes.find(d => d.id === order.salad_id)?.price || 0;
        if (order.main_course_id) total += allDishes.find(d => d.id === order.main_course_id)?.price || 0;
        if (order.drink_id) total += allDishes.find(d => d.id === order.drink_id)?.price || 0;
        if (order.dessert_id) total += allDishes.find(d => d.id === order.dessert_id)?.price || 0;
        return total;
    }

    function getDeliveryTimeText(order) {
        if (order.delivery_type === 'by_time' && order.delivery_time) {
            return `К ${order.delivery_time}`;
        } else {
            return 'Как можно скорее (с 7:00 до 23:00)';
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getOrderStatus(status) {
        const map = {
            pending: 'Ожидает обработки',
            confirmed: 'Подтвержден',
            preparing: 'Готовится',
            delivering: 'Доставляется',
            delivered: 'Доставлен',
            cancelled: 'Отменен'
        };
        return map[status] || 'Ожидает обработки';
    }

    // Модальные окна
    window.viewOrder = function (orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        document.getElementById('view-order-id').textContent = order.id;
        document.getElementById('view-order-date').textContent = formatDate(order.created_at);
        document.getElementById('view-order-status').textContent = getOrderStatus(order.status);
        document.getElementById('view-order-total').textContent = `${calculateOrderTotal(order)}₽`;
        document.getElementById('view-order-delivery-time').textContent = getDeliveryTimeText(order);
        document.getElementById('view-order-address').textContent = order.delivery_address || '—';
        document.getElementById('view-order-phone').textContent = order.phone || '—';
        document.getElementById('view-order-email').textContent = order.email || '—';
        document.getElementById('view-order-comment').textContent = order.comment || '—';

        const dishesList = document.getElementById('view-order-dishes');
        const dishes = [];
        ['soup_id', 'salad_id', 'main_course_id', 'drink_id', 'dessert_id'].forEach(key => {
            if (order[key]) {
                const d = allDishes.find(d => d.id === order[key]);
                if (d) dishes.push(`${d.name} — ${d.price}₽`);
            }
        });
        dishesList.innerHTML = dishes.length ? dishes.map(d => `<div class="dish-item-modal">${d}</div>`).join('') : '<div>Нет блюд</div>';

        document.getElementById('view-order-modal').style.display = 'block';
    };

    window.editOrder = function (orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        currentEditingOrder = order;
        const form = document.getElementById('edit-order-form');
        form.querySelector('[name="full_name"]').value = order.full_name || '';
        form.querySelector('[name="email"]').value = order.email || '';
        form.querySelector('[name="phone"]').value = order.phone || '';
        form.querySelector('[name="delivery_address"]').value = order.delivery_address || '';
        form.querySelector('[name="comment"]').value = order.comment || '';

        const isByTime = order.delivery_type === 'by_time';
        const soonRadio = form.querySelector('input[value="soon"]');
        const timeRadio = form.querySelector('input[value="specified"]');
        const timeGroup = document.getElementById('edit-time-group');

        if (isByTime) {
            timeRadio.checked = true;
            timeGroup.style.display = 'block';
            form.querySelector('[name="delivery_time"]').value = order.delivery_time || '';
        } else {
            soonRadio.checked = true;
            timeGroup.style.display = 'none';
        }

        document.getElementById('edit-order-modal').style.display = 'block';
    };

    window.confirmDelete = function (orderId) {
        document.getElementById('delete-order-id').value = orderId;
        document.getElementById('delete-order-modal').style.display = 'block';
    };

    // Отправка данных на сервер
    async function updateOrder() {
        if (!currentEditingOrder) return;

        const form = document.getElementById('edit-order-form');
        const formData = new FormData(form);
        const deliveryType = formData.get('delivery_type') === 'specified' ? 'by_time' : 'now';
        let deliveryTime = null;
        if (deliveryType === 'by_time') {
            deliveryTime = formData.get('delivery_time');
            if (!deliveryTime) {
                showNotification('Укажите время доставки', 'error');
                return;
            }
            // Валидация времени
            const [h, m] = deliveryTime.split(':').map(Number);
            if (h < 7 || h > 23 || m % 5 !== 0) {
                showNotification('Время должно быть с 7:00 до 23:00 с шагом 5 мин', 'error');
                return;
            }
        }

        const updateData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            delivery_address: formData.get('delivery_address'),
            delivery_type: deliveryType,
            delivery_time: deliveryTime,
            comment: formData.get('comment'),
            // Сохраняем блюда без изменений
            soup_id: currentEditingOrder.soup_id,
            salad_id: currentEditingOrder.salad_id,
            main_course_id: currentEditingOrder.main_course_id,
            drink_id: currentEditingOrder.drink_id,
            dessert_id: currentEditingOrder.dessert_id
        };

        try {
            showNotification('Сохранение...', 'info');
            const response = await fetch(`${ORDERS_API_URL}/${currentEditingOrder.id}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const updated = await response.json();
            const idx = orders.findIndex(o => o.id === currentEditingOrder.id);
            if (idx !== -1) orders[idx] = { ...orders[idx], ...updated };

            closeAllModals();
            await loadOrders(); // Перезагружаем данные
            showNotification('Заказ обновлён!', 'success');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    async function deleteOrder() {
        const orderId = document.getElementById('delete-order-id').value;
        try {
            showNotification('Удаление...', 'info');
            const response = await fetch(`${ORDERS_API_URL}/${orderId}?api_key=${API_KEY}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            closeAllModals();
            await loadOrders(); // Перезагружаем данные
            showNotification('Заказ удалён!', 'success');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Демо-данные (только для отображения, без отправки на сервер)
    function generateDemoOrders() {
        return [
            {
                id: 1,
                created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
                status: 'delivered',
                full_name: 'Иван Иванов',
                email: 'ivan@example.com',
                phone: '+70000000000',
                delivery_address: 'ул. Примерная, д. 123',
                delivery_type: 'by_time',
                delivery_time: '13:00',
                soup_id: 1,
                salad_id: 15,
                main_course_id: 7,
                drink_id: 21,
                dessert_id: 29
            }
        ];
    }

    // Вспомогательные функции
    function showLoading() {
        document.getElementById('orders-loading').style.display = 'block';
        document.getElementById('orders-list').style.display = 'none';
        document.getElementById('orders-empty').style.display = 'none';
    }

    function showEmptyState() {
        document.getElementById('orders-loading').style.display = 'none';
        document.getElementById('orders-list').style.display = 'none';
        document.getElementById('orders-empty').style.display = 'block';
    }

    function showError(message) {
        const list = document.getElementById('orders-list');
        list.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Ошибка</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="loadOrders()">Повторить</button>
            </div>
        `;
        list.style.display = 'block';
        document.getElementById('orders-loading').style.display = 'none';
    }

    function showNotification(message, type = 'info') {
        const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db' };
        const notification = document.createElement('div');
        notification.innerHTML = `<span>${message}</span>`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${colors[type] || '#3498db'};
            color: white; padding: 12px 20px;
            border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000; font-size: 14px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        currentEditingOrder = null;
    }

    function setupEventListeners() {
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn =>
            btn.addEventListener('click', closeAllModals)
        );
        document.querySelectorAll('.modal').forEach(modal =>
            modal.addEventListener('click', e => e.target === modal && closeAllModals())
        );
        document.querySelectorAll('input[name="delivery_type"]').forEach(radio =>
            radio.addEventListener('change', () => {
                const timeGroup = document.getElementById('edit-time-group');
                timeGroup.style.display = radio.value === 'specified' ? 'block' : 'none';
            })
        );
        document.getElementById('edit-order-form').addEventListener('submit', e => {
            e.preventDefault();
            updateOrder();
        });
        document.getElementById('confirm-delete-btn').addEventListener('click', deleteOrder);
    }

    // Запуск
    init();
});