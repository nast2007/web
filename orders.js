document.addEventListener('DOMContentLoaded', function() {
    let orders = [];
    let currentEditingOrder = null;
    
    const API_BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';

    // Инициализация
    async function init() {
        setupEventListeners();
        await loadOrders();
    }

    // Загрузка заказов из API
    async function loadOrders() {
        showLoading();
        
        try {
            console.log('📡 Загрузка заказов с API...');
            const response = await fetch(`${API_BASE_URL}/orders?api_key=${API_KEY}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Ошибка авторизации. Проверьте API Key.');
                }
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Получены заказы:', data.length);
            
            if (data && data.length > 0) {
                orders = data;
                displayOrders();
                showNotification(`Загружено ${orders.length} заказов`, 'success');
            } else {
                showEmptyState();
            }
            
        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            showError('Не удалось загрузить заказы. Проверьте подключение к интернету.');
            // Используем демо-данные для тестирования
            orders = generateDemoOrders();
            displayOrders();
        }
    }

    // Отображение списка заказов
    function displayOrders() {
        const ordersList = document.getElementById('orders-list');
        const emptyState = document.getElementById('orders-empty');
        const loading = document.getElementById('orders-loading');

        loading.style.display = 'none';

        if (orders.length === 0) {
            ordersList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        ordersList.style.display = 'block';

        // Сортируем по дате (новые сначала)
        const sortedOrders = [...orders].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        ordersList.innerHTML = sortedOrders.map((order, index) => `
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
                            <i class="bi bi-eye"></i>
                            <span>Подробнее</span>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editOrder(${order.id})">
                            <i class="bi bi-pencil"></i>
                            <span>Редактировать</span>
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmDelete(${order.id})">
                            <i class="bi bi-trash"></i>
                            <span>Удалить</span>
                        </button>
                    </div>
                </div>
                <div class="order-dishes">
                    ${getDishesList(order)}
                </div>
                <div class="order-price">
                    ${calculateOrderTotal(order)}Р
                </div>
                <div class="order-delivery-time">
                    ${getDeliveryTimeText(order)}
                </div>
            </div>
        `).join('');
    }

    // Получение списка блюд заказа
    function getDishesList(order) {
        // Здесь нужно преобразовать данные блюд из API
        const dishes = [];
        
        if (order.soup_name) dishes.push(order.soup_name);
        if (order.salad_name) dishes.push(order.salad_name);
        if (order.main_course_name) dishes.push(order.main_course_name);
        if (order.drink_name) dishes.push(order.drink_name);
        if (order.dessert_name) dishes.push(order.dessert_name);
        
        return dishes.filter(Boolean).join(', ') || 'Блюда не указаны';
    }

    // Расчет стоимости заказа
    function calculateOrderTotal(order) {
        let total = 0;
        if (order.soup_price) total += order.soup_price;
        if (order.salad_price) total += order.salad_price;
        if (order.main_course_price) total += order.main_course_price;
        if (order.drink_price) total += order.drink_price;
        if (order.dessert_price) total += order.dessert_price;
        return total;
    }

    // Получение текста времени доставки
    function getDeliveryTimeText(order) {
        if (order.delivery_time) {
            return `К ${order.delivery_time}`;
        } else {
            return 'Как можно скорее (с 7:00 до 23:00)';
        }
    }

    // Форматирование даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Получение статуса заказа
    function getOrderStatus(status) {
        const statusMap = {
            'pending': 'Ожидает обработки',
            'confirmed': 'Подтвержден',
            'preparing': 'Готовится',
            'delivering': 'Доставляется',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status || 'Ожидает обработки';
    }

    // Просмотр заказа
    window.viewOrder = async function(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        // Заполняем модальное окно
        document.getElementById('view-order-id').textContent = order.id;
        document.getElementById('view-order-date').textContent = formatDate(order.created_at);
        document.getElementById('view-order-status').textContent = getOrderStatus(order.status);
        document.getElementById('view-order-total').textContent = calculateOrderTotal(order) + 'Р';
        document.getElementById('view-order-delivery-time').textContent = getDeliveryTimeText(order);
        document.getElementById('view-order-address').textContent = order.delivery_address || 'Не указан';
        document.getElementById('view-order-phone').textContent = order.phone || 'Не указан';
        document.getElementById('view-order-email').textContent = order.email || 'Не указан';
        document.getElementById('view-order-comment').textContent = order.comment || 'Нет комментария';
        
        // Заполняем список блюд
        const dishesList = document.getElementById('view-order-dishes');
        const dishes = [];
        if (order.soup_name) dishes.push(`${order.soup_name} - ${order.soup_price}Р`);
        if (order.salad_name) dishes.push(`${order.salad_name} - ${order.salad_price}Р`);
        if (order.main_course_name) dishes.push(`${order.main_course_name} - ${order.main_course_price}Р`);
        if (order.drink_name) dishes.push(`${order.drink_name} - ${order.drink_price}Р`);
        if (order.dessert_name) dishes.push(`${order.dessert_name} - ${order.dessert_price}Р`);
        
        dishesList.innerHTML = dishes.map(dish => `
            <div class="dish-item-modal">${dish}</div>
        `).join('');

        document.getElementById('view-order-modal').style.display = 'block';
    };

    // Редактирование заказа
    window.editOrder = function(orderId) {
        const order = orders.find(o => o.id == orderId);
        if (!order) return;

        currentEditingOrder = order;

        // Заполняем форму
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-full-name').value = order.full_name || '';
        document.getElementById('edit-email').value = order.email || '';
        document.getElementById('edit-phone').value = order.phone || '';
        document.getElementById('edit-address').value = order.delivery_address || '';
        document.getElementById('edit-comment').value = order.comment || '';

        // Тип доставки
        const deliveryType = order.delivery_time ? 'specified' : 'soon';
        document.querySelector(`input[name="delivery_type"][value="${deliveryType}"]`).checked = true;

        // Время доставки
        const timeGroup = document.getElementById('edit-time-group');
        if (deliveryType === 'specified') {
            timeGroup.style.display = 'block';
            document.getElementById('edit-delivery-time').value = order.delivery_time || '';
        } else {
            timeGroup.style.display = 'none';
        }

        document.getElementById('edit-order-modal').style.display = 'block';
    };

    // Сохранение изменений
    async function updateOrder() {
        if (!currentEditingOrder) return;

        const formData = new FormData(document.getElementById('edit-order-form'));
        const updateData = {
            full_name: formData.get('full_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            delivery_address: formData.get('delivery_address'),
            delivery_type: formData.get('delivery_type'),
            comment: formData.get('comment')
        };

        // Время доставки
        if (formData.get('delivery_type') === 'specified') {
            updateData.delivery_time = formData.get('delivery_time');
        } else {
            updateData.delivery_time = null;
        }

        try {
            showNotification('Сохранение изменений...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/orders/${currentEditingOrder.id}?api_key=${API_KEY}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
            }

            const updatedOrder = await response.json();
            
            // Обновляем локальный список
            const orderIndex = orders.findIndex(o => o.id === currentEditingOrder.id);
            if (orderIndex !== -1) {
                orders[orderIndex] = { ...orders[orderIndex], ...updatedOrder };
            }

            closeAllModals();
            displayOrders();
            showNotification('Заказ успешно обновлен!', 'success');

        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Подтверждение удаления
    window.confirmDelete = function(orderId) {
        document.getElementById('delete-order-id').value = orderId;
        document.getElementById('delete-order-modal').style.display = 'block';
    };

    // Удаление заказа
    async function deleteOrder() {
        const orderId = document.getElementById('delete-order-id').value;

        try {
            showNotification('Удаление заказа...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
            }

            // Удаляем из локального списка
            orders = orders.filter(order => order.id != orderId);
            
            closeAllModals();
            displayOrders();
            showNotification('Заказ успешно удален!', 'success');

        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
            showNotification(`Ошибка: ${error.message}`, 'error');
        }
    }

    // Генерация демо-данных для тестирования
    function generateDemoOrders() {
        return [
            {
                id: 1,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'delivered',
                full_name: 'Иван Иванов',
                email: 'ivan@example.com',
                phone: '+7-000-000-00-00',
                delivery_address: 'ул. Примерная, д. 123, кв. 45',
                delivery_time: '13:00',
                comment: 'Доставить к 13:00',
                soup_name: 'Томатный суп с базиликом',
                soup_price: 270,
                salad_name: 'Салат Цезарь',
                salad_price: 320,
                main_course_name: 'Лазанья с мясом',
                main_course_price: 385,
                drink_name: 'Апельсиновый сок',
                drink_price: 120,
                dessert_name: 'Тирамису',
                dessert_price: 280
            },
            {
                id: 2,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'preparing',
                full_name: 'Петр Петров',
                email: 'petr@example.com',
                phone: '+7-111-111-11-11',
                delivery_address: 'ул. Тестовая, д. 67, кв. 8',
                delivery_time: null,
                comment: 'Позвонить за 15 минут',
                soup_name: 'Грибной крем-суп',
                soup_price: 290,
                main_course_name: 'Паста Карбонара',
                main_course_price: 340,
                drink_name: 'Кофе американо',
                drink_price: 100,
                dessert_name: 'Чизкейк Нью-Йорк',
                dessert_price: 320
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
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="loadOrders()">Попробовать снова</button>
            </div>
        `;
        ordersList.style.display = 'block';
        document.getElementById('orders-loading').style.display = 'none';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            font-size: 14px;
        `;
        
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        currentEditingOrder = null;
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        // Закрытие по клику вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeAllModals();
                }
            });
        });

        // Переключение типа доставки в форме редактирования
        document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const timeGroup = document.getElementById('edit-time-group');
                if (this.value === 'specified') {
                    timeGroup.style.display = 'block';
                } else {
                    timeGroup.style.display = 'none';
                }
            });
        });

        // Обработчик формы редактирования
        document.getElementById('edit-order-form').addEventListener('submit', function(e) {
            e.preventDefault();
            updateOrder();
        });

        // Обработчик подтверждения удаления
        document.getElementById('confirm-delete-btn').addEventListener('click', deleteOrder);
    }

    // Запускаем приложение
    init();
});