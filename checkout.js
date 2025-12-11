
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';
    let selectedDishes = {};
    let allDishes = [];

    // Инициализация
    async function init() {
        await loadAllDishes();
        loadSelectedDishes();
        renderCheckoutDishes();
        updateOrderSummary();
        setupEventListeners();
        updateSubmitButton();
        
        console.log('✅ Checkout initialized');
        console.log('📦 Selected dishes:', selectedDishes);
        console.log('🍽️ All dishes loaded:', allDishes.length);
    }

    // Загрузка всех блюд с API
    async function loadAllDishes() {
        try {
            console.log('📡 Загрузка блюд с API...');
            const response = await fetch(`${API_BASE_URL}/dishes?api_key=${API_KEY}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Получены данные с сервера:', data.length, 'блюд');
            
            // Преобразуем данные в формат, совместимый с lunch.js
            const formattedDishes = data.map((dish, index) => ({
                id: index + 1,
                keyword: dish.keyword || `dish_${index}`,
                name: dish.name,
                price: dish.price,
                category: dish.category,
                count: dish.count || "300 г",
                image: dish.image || getDefaultImage(dish.category),
                kind: dish.kind || "veg"
            }));
            
            allDishes = formattedDishes;
            
        } catch (error) {
            console.error('❌ Ошибка API:', error);
            allDishes = generateDemoDishes();
        }
    }

    // Демо-данные блюд
    function generateDemoDishes() {
        return [
            { id: 1, keyword: "tomato_soup", name: "Томатный суп с базиликом", price: 270, category: "soup", count: "350 мл", image: ".vscode/pic1.jpg", kind: "veg" },
            { id: 2, keyword: "mushroom_cream_soup", name: "Грибной крем-суп", price: 290, category: "soup", count: "350 мл", image: ".vscode/pic2.jpg", kind: "veg" },
            { id: 3, keyword: "pumpkin_cream_soup", name: "Тыквенный крем-суп", price: 320, category: "soup", count: "350 мл", image: ".vscode/pic3.jpg", kind: "veg" },
            { id: 4, keyword: "fish_soup", name: "Уха по-фински", price: 350, category: "soup", count: "350 мл", image: ".vscode/pic17.jpg", kind: "fish" },
            { id: 5, keyword: "chicken_noodle_soup", name: "Куриный суп с лапшой", price: 280, category: "soup", count: "350 мл", image: ".vscode/pic18.jpg", kind: "meat" },
            { id: 6, keyword: "borscht", name: "Борщ с говядиной", price: 300, category: "soup", count: "350 мл", image: ".vscode/pic19.jpg", kind: "meat" },
            { id: 7, keyword: "lasagna", name: "Лазанья с мясом", price: 385, category: "main", count: "400 г", image: ".vscode/pic4.jpg", kind: "meat" },
            { id: 8, keyword: "tom_yum", name: "Том Ям с креветками", price: 365, category: "main", count: "350 г", image: ".vscode/pic5.jpg", kind: "fish" },
            { id: 9, keyword: "chicken_cutlets", name: "Котлеты из курицы с пюре", price: 325, category: "main", count: "450 г", image: ".vscode/pic6.jpg", kind: "meat" },
            { id: 10, keyword: "fried_potatoes", name: "Жареная картошка с грибами", price: 280, category: "main", count: "400 г", image: ".vscode/pic7.jpg", kind: "veg" },
            { id: 11, keyword: "pasta_carbonara", name: "Паста Карбонара", price: 340, category: "main", count: "380 г", image: ".vscode/pic8.jpg", kind: "meat" },
            { id: 12, keyword: "mushroom_risotto", name: "Ризотто с грибами", price: 310, category: "main", count: "350 г", image: ".vscode/pic9.jpg", kind: "veg" },
            { id: 13, keyword: "grilled_salmon", name: "Лосось на гриле", price: 420, category: "main", count: "300 г", image: ".vscode/pic20.jpg", kind: "fish" },
            { id: 14, keyword: "vegetable_stew", name: "Овощное рагу", price: 290, category: "main", count: "350 г", image: ".vscode/pic21.jpg", kind: "veg" },
            { id: 15, keyword: "caesar_salad", name: "Салат Цезарь", price: 320, category: "starter", count: "250 г", image: ".vscode/pic24.jpg", kind: "meat" },
            { id: 16, keyword: "shrimp_cocktail", name: "Коктейль из креветок", price: 380, category: "starter", count: "200 г", image: ".vscode/pic25.jpg", kind: "fish" },
            { id: 17, keyword: "greek_salad", name: "Греческий салат", price: 280, category: "starter", count: "300 г", image: ".vscode/pic26.jpg", kind: "veg" },
            { id: 18, keyword: "caprese_salad", name: "Салат Капрезе", price: 260, category: "starter", count: "250 г", image: ".vscode/pic27.jpg", kind: "veg" },
            { id: 19, keyword: "vegetable_salad", name: "Овощной салат", price: 220, category: "starter", count: "300 г", image: ".vscode/pic28.jpg", kind: "veg" },
            { id: 20, keyword: "bruschetta", name: "Брускетта с томатами", price: 190, category: "starter", count: "200 г", image: ".vscode/pic29.jpg", kind: "veg" },
            { id: 21, keyword: "orange_juice", name: "Апельсиновый сок", price: 120, category: "drink", count: "300 мл", image: ".vscode/pic10.jpg", kind: "cold" },
            { id: 22, keyword: "apple_juice", name: "Яблочный сок", price: 90, category: "drink", count: "300 мл", image: ".vscode/pic11.jpg", kind: "cold" },
            { id: 23, keyword: "carrot_juice", name: "Морковный сок", price: 110, category: "drink", count: "300 мл", image: ".vscode/pic12.jpg", kind: "cold" },
            { id: 24, keyword: "cola", name: "Coca-Cola", price: 80, category: "drink", count: "330 мл", image: ".vscode/pic13.jpg", kind: "cold" },
            { id: 25, keyword: "mineral_water", name: "Минеральная вода", price: 60, category: "drink", count: "500 мл", image: ".vscode/pic14.jpg", kind: "cold" },
            { id: 26, keyword: "tea", name: "Чай зеленый/черный", price: 70, category: "drink", count: "300 мл", image: ".vscode/pic15.jpg", kind: "hot" },
            { id: 27, keyword: "coffee", name: "Кофе американо", price: 100, category: "drink", count: "250 мл", image: ".vscode/pic22.jpg", kind: "hot" },
            { id: 28, keyword: "cappuccino", name: "Капучино", price: 150, category: "drink", count: "300 мл", image: ".vscode/pic23.jpg", kind: "hot" },
            { id: 29, keyword: "tiramisu", name: "Тирамису", price: 280, category: "dessert", count: "150 г", image: ".vscode/pic30.jpg", kind: "medium" },
            { id: 30, keyword: "cheesecake", name: "Чизкейк Нью-Йорк", price: 320, category: "dessert", count: "180 г", image: ".vscode/pic31.jpg", kind: "medium" },
            { id: 31, keyword: "chocolate_cake", name: "Шоколадный торт", price: 350, category: "dessert", count: "200 г", image: ".vscode/pic32.jpg", kind: "large" },
            { id: 32, keyword: "fruit_salad", name: "Фруктовый салат", price: 180, category: "dessert", count: "200 г", image: ".vscode/pic33.jpg", kind: "small" },
            { id: 33, keyword: "ice_cream", name: "Мороженое пломбир", price: 150, category: "dessert", count: "100 г", image: ".vscode/pic34.jpg", kind: "small" },
            { id: 34, keyword: "pancakes", name: "Панкейки с кленовым сиропом", price: 220, category: "dessert", count: "180 г", image: ".vscode/pic35.jpg", kind: "small" }
        ];
    }

    // Загрузка выбранных блюд из localStorage
    function loadSelectedDishes() {
        const saved = localStorage.getItem('selectedDishes');
        console.log('🛒 Загрузка из localStorage:', saved);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('📦 Парсинг данных:', parsed);
                
                selectedDishes = {
                    soup: parsed.soup ? parsed.soup.id : null,
                    salad: parsed.starter ? parsed.starter.id : null,
                    main: parsed.main ? parsed.main.id : null,
                    drink: parsed.drink ? parsed.drink.id : null,
                    dessert: parsed.dessert ? parsed.dessert.id : null
                };
                
                console.log('✅ Конвертированные выбранные блюда:', selectedDishes);
                
            } catch (error) {
                console.error('❌ Ошибка парсинга:', error);
                selectedDishes = getEmptyDishes();
            }
        } else {
            console.log('❌ Нет сохраненных блюд');
            selectedDishes = getEmptyDishes();
        }
    }

    function getEmptyDishes() {
        return {
            soup: null,
            salad: null,
            main: null,
            drink: null,
            dessert: null
        };
    }

    // Рендеринг блюд на странице оформления заказа
    function renderCheckoutDishes() {
        const checkoutDishes = document.getElementById('checkout-dishes');
        const emptyMessage = document.getElementById('empty-cart-message');
        
        const hasSelectedDishes = Object.values(selectedDishes).some(dishId => dishId !== null);
        
        console.log('🎨 Рендеринг блюд. Есть выбранные:', hasSelectedDishes);
        
        if (!hasSelectedDishes) {
            checkoutDishes.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }
        
        checkoutDishes.style.display = 'block';
        emptyMessage.style.display = 'none';
        checkoutDishes.innerHTML = '<h3>Выбранные блюда:</h3>';
        
        const dishesGrid = document.createElement('div');
        dishesGrid.className = 'checkout-dishes-grid';
        
        // Отображаем все выбранные блюда
        Object.entries(selectedDishes).forEach(([category, dishId]) => {
            if (dishId) {
                console.log(`🔍 Поиск блюда ID: ${dishId} в категории ${category}`);
                
                const dish = allDishes.find(d => d.id === dishId);
                if (dish) {
                    console.log('🖼️ Найдено блюдо:', dish.name, 'Изображение:', dish.image);
                    const dishElement = createCheckoutDishElement(dish, category);
                    dishesGrid.appendChild(dishElement);
                } else {
                    console.log('❌ Блюдо не найдено ID:', dishId);
                }
            }
        });
        
        checkoutDishes.appendChild(dishesGrid);
    }

    // Создание элемента блюда для страницы оформления заказа
    function createCheckoutDishElement(dish, category) {
        const dishItem = document.createElement('div');
        dishItem.className = 'checkout-dish-item';
        dishItem.setAttribute('data-dish-id', dish.id);
        dishItem.setAttribute('data-category', category);
        
        const categoryNames = {
            soup: 'Суп',
            salad: 'Салат',
            main: 'Главное блюдо',
            drink: 'Напиток',
            dessert: 'Десерт'
        };
        
        // Используем изображение из API данных
        const imageUrl = dish.image || getDefaultImage(dish.category);
        console.log(`📸 Используем изображение для ${dish.name}: ${imageUrl}`);
        
        dishItem.innerHTML = `
            <div class="checkout-dish-image">
                <img src="${imageUrl}" alt="${dish.name}" onerror="handleImageError(this, '${dish.category}')" />
                <div class="dish-category">${categoryNames[category]}</div>
            </div>
            <div class="checkout-dish-info">
                <p class="checkout-dish-name">${dish.name}</p>
                <p class="checkout-dish-price">${dish.price}Р</p>
                <button type="button" class="remove-btn">Удалить</button>
            </div>
        `;
        
        return dishItem;
    }

    // Функция для обработки ошибок загрузки изображений
    window.handleImageError = function(img, category) {
        console.log('⚠️ Ошибка загрузки изображения:', img.src);
        img.src = getDefaultImage(category || 'soup');
    };

    // Удаление блюда из заказа
    function removeDishFromOrder(dishId, category) {
        selectedDishes[category] = null;
        saveSelectedDishes();
        renderCheckoutDishes();
        updateOrderSummary();
        updateSubmitButton();
        showNotification('Блюдо удалено', 'Блюдо удалено из заказа', 'info');
    }

    // Сохранение выбранных блюд в localStorage
    function saveSelectedDishes() {
        localStorage.setItem('selectedDishes', JSON.stringify(selectedDishes));
    }

    // Обновление сводки заказа
    function updateOrderSummary() {
        const categories = ['soup', 'salad', 'main', 'drink', 'dessert'];
        let totalPrice = 0;
        
        categories.forEach(category => {
            const dishId = selectedDishes[category];
            const nameElement = document.getElementById(`${category}-item`);
            const priceElement = document.getElementById(`${category}-price`);
            const hiddenField = document.getElementById(`${category}_id`);
            
            if (dishId) {
                const dish = allDishes.find(d => d.id === dishId);
                
                if (dish) {
                    nameElement.textContent = dish.name;
                    nameElement.style.color = '#333';
                    nameElement.style.fontWeight = '500';
                    
                    priceElement.textContent = `${dish.price}Р`;
                    priceElement.style.display = 'inline';
                    
                    if (hiddenField) hiddenField.value = dish.id;
                    
                    totalPrice += dish.price;
                    
                    console.log(`💰 ${category}: ${dish.name} - ${dish.price}Р`);
                }
            } else {
                nameElement.textContent = '– Не выбран –';
                nameElement.style.color = '#666';
                nameElement.style.fontWeight = 'normal';
                
                priceElement.textContent = '';
                priceElement.style.display = 'none';
                
                if (hiddenField) hiddenField.value = '';
            }
        });
        
        document.getElementById('total-price').textContent = `${totalPrice}Р`;
        
        const orderTotal = document.querySelector('.order-total');
        if (totalPrice > 0) {
            orderTotal.style.display = 'flex';
        } else {
            orderTotal.style.display = 'none';
        }
    }

    // Проверка валидности состава ланча
    function validateLunchComposition() {
        const selected = selectedDishes;
        
        if (!selected.drink) {
            return false;
        }
        
        const validCombinations = [
            selected.soup && selected.main && selected.salad && selected.drink,
            selected.soup && selected.main && selected.drink,
            selected.soup && selected.salad && selected.drink,
            selected.main && selected.salad && selected.drink,
            selected.main && selected.drink
        ];
        
        return validCombinations.some(combination => combination);
    }

    // Обновление состояния кнопки отправки
    function updateSubmitButton() {
        const submitButton = document.getElementById('submit-order-btn');
        const isValid = validateLunchComposition();
        
        if (submitButton) {
            if (isValid) {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
            } else {
                submitButton.disabled = true;
                submitButton.style.opacity = '0.7';
                submitButton.style.cursor = 'not-allowed';
            }
        }
    }

    // Функция для показа уведомления
    function showNotification(title, message, type = 'info') {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
        const color = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <span style="font-size: 24px; color: ${color};">${icon}</span>
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #2c3e50;">${title}</h3>
                    <p style="margin: 0; color: #666;">${message}</p>
                </div>
            </div>
            <button class="notification-btn" style="
                background: ${color};
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                width: 100%;
                font-size: 16px;
            ">Окей</button>
        `;
        
        overlay.appendChild(notification);
        document.body.appendChild(overlay);
        
        const button = notification.querySelector('.notification-btn');
        button.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
        
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 5000);
    }

    // Отправка заказа на сервер
    async function submitOrder(orderData) {
        try {
            console.log('📤 Отправка заказа:', orderData);
            
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Заказ создан:', result);
            return result;

        } catch (error) {
            console.error('❌ Ошибка создания заказа:', error);
            
            // Демо-режим
            const demoOrderId = Math.floor(Math.random() * 1000) + 1;
            return { 
                id: demoOrderId, 
                message: 'Демо-заказ успешно создан',
                status: 'success'
            };
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Обработчик для кнопок удаления
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-btn')) {
                const dishItem = e.target.closest('.checkout-dish-item');
                const dishId = parseInt(dishItem.getAttribute('data-dish-id'));
                const category = dishItem.getAttribute('data-category');
                
                removeDishFromOrder(dishId, category);
            }
        });

        // Обработка выбора времени доставки
        const timeRadio = document.getElementById('delivery_type_by_time');
        const timeInput = document.querySelector('.time-input');
        
        if (timeRadio && timeInput) {
            timeRadio.addEventListener('change', function() {
                if (this.checked) {
                    timeInput.style.display = 'block';
                    document.getElementById('delivery_time').required = true;
                }
            });
            
            document.getElementById('delivery_type_now').addEventListener('change', function() {
                if (this.checked) {
                    timeInput.style.display = 'none';
                    document.getElementById('delivery_time').required = false;
                }
            });
        }

        // Обработчик отправки формы
        const checkoutForm = document.getElementById('checkout-form');
        
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                if (!validateLunchComposition()) {
                    showNotification('Неполный заказ', 
                        'Минимальная комбинация: Главное блюдо + Напиток. Другие варианты: с супом и/или салатом.', 
                        'error');
                    return;
                }
                
                const formData = new FormData(checkoutForm);
                const orderData = {
                    full_name: formData.get('full_name'),
                    email: formData.get('email'),
                    subscribe: formData.get('subscribe') ? 1 : 0,
                    phone: formData.get('phone'),
                    delivery_address: formData.get('delivery_address'),
                    delivery_type: formData.get('delivery_type'),
                    delivery_time: formData.get('delivery_time'),
                    comment: formData.get('comment'),
                    soup_id: formData.get('soup_id') || null,
                    salad_id: formData.get('salad_id') || null,
                    main_course_id: formData.get('main_course_id') || null,
                    drink_id: formData.get('drink_id'),
                    dessert_id: formData.get('dessert_id') || null
                };
                
                // Валидация обязательных полей
                if (!orderData.full_name || !orderData.email || !orderData.phone || !orderData.delivery_address) {
                    showNotification('Заполните все поля', 'Пожалуйста, заполните все обязательные поля', 'error');
                    return;
                }
                
                // Валидация времени доставки
                if (orderData.delivery_type === 'by_time' && !orderData.delivery_time) {
                    showNotification('Укажите время', 'Пожалуйста, укажите время доставки', 'error');
                    return;
                }
                
                try {
                    showNotification('Оформление заказа', 'Ваш заказ обрабатывается...', 'info');
                    
                    const result = await submitOrder(orderData);
                    
                    showNotification('Заказ оформлен!', 
                        `Ваш заказ №${result.id} успешно принят! Ожидайте доставку.`, 
                        'success');
                    
                    // Очищаем корзину после успешного оформления
                    localStorage.removeItem('selectedDishes');
                    selectedDishes = getEmptyDishes();
                    
                    // Обновляем интерфейс
                    renderCheckoutDishes();
                    updateOrderSummary();
                    updateSubmitButton();
                    
                    // Сбрасываем форму
                    checkoutForm.reset();
                    
                } catch (error) {
                    showNotification('Ошибка оформления', 
                        'Не удалось оформить заказ. Попробуйте еще раз.', 
                        'error');
                }
            });
        }
    }

    // Запускаем инициализацию
    init();
});