document.addEventListener('DOMContentLoaded', function() {
    let selectedDishes = loadSelectedDishes();
    let dishes = [];
    
    // Базовый URL API
    const API_BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';
    
    // Загрузка выбранных блюд из localStorage
    function loadSelectedDishes() {
        const saved = localStorage.getItem('selectedDishes');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            soup: null,
            starter: null,
            main: null,
            drink: null,
            dessert: null
        };
    }
    
    // Сохранение выбранных блюд в localStorage
    function saveSelectedDishes() {
        const dishesToSave = {};
        
        Object.entries(selectedDishes).forEach(([category, dishId]) => {
            if (dishId) {
                const dish = dishes.find(d => d.id === dishId);
                if (dish) {
                    dishesToSave[category] = {
                        id: dish.id,
                        name: dish.name,
                        price: dish.price,
                        image: dish.image,
                        count: dish.count,
                        keyword: dish.keyword,
                        category: dish.category
                    };
                }
            } else {
                dishesToSave[category] = null;
            }
        });
        
        localStorage.setItem('selectedDishes', JSON.stringify(dishesToSave));
        updateCheckoutPanel();
    }
    
    // Функция для загрузки блюд с сервера API
    async function loadDishesFromAPI() {
        try {
            console.log('Загрузка блюд с сервера API...');
            
            const response = await fetch(`${API_BASE_URL}/dishes?api_key=${API_KEY}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Получены данные с сервера:', data.length, 'блюд');
            
            // Преобразуем данные в нужный формат
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
            
            return formattedDishes;
            
        } catch (error) {
            console.error('Ошибка при загрузке данных с сервера:', error);
            console.log('Используются демо-данные');
            return generateDemoDishes();
        }
    }
    
    // Функция для получения изображения по умолчанию
    function getDefaultImage(category) {
        const defaultImages = {
            soup: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Суп',
            main: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Основное',
            drink: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Напиток',
            starter: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Салат',
            dessert: 'https://via.placeholder.com/300x200/FECA57/FFFFFF?text=Десерт'
        };
        return defaultImages[category] || 'https://via.placeholder.com/300x200/DDD/333?text=Блюдо';
    }
    
    // Генерация демо-данных блюд (если API недоступно)
    function generateDemoDishes() {
        // Возвращаем пустой массив, чтобы показать, что API недоступно
        return [];
    }
    
    // Добавление блюда в заказ
    function addDishToOrder(dish) {
        selectedDishes[dish.category] = dish.id;
        saveSelectedDishes();
        highlightSelectedDish(dish.category);
    }
    
    // Подсветка выбранного блюда
    function highlightSelectedDish(selectedCategory) {
        const allDishesInCategory = document.querySelectorAll(`.dish-item[data-category="${selectedCategory}"]`);
        allDishesInCategory.forEach(item => {
            item.classList.remove('selected');
            item.style.border = 'none';
            item.style.transform = 'none';
        });
        
        const selectedDishId = selectedDishes[selectedCategory];
        if (selectedDishId) {
            const selectedItem = document.querySelector(`.dish-item[data-dish-id="${selectedDishId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
                selectedItem.style.border = '2px solid tomato';
                selectedItem.style.transform = 'translateY(-5px)';
            }
        }
    }
    
    // Инициализация
    async function init() {
        const menuColumn = document.querySelector('.menu-column');
        menuColumn.innerHTML = '<div class="loading-indicator">Загрузка меню...</div>';
        
        dishes = await loadDishesFromAPI();
        
        if (dishes.length === 0) {
            menuColumn.innerHTML = '<div class="error-message">Не удалось загрузить меню. Пожалуйста, попробуйте позже.</div>';
            return;
        }
        
        renderDishes();
        updateCheckoutPanel();
        highlightAllSelectedDishes();
        showNotification(`Загружено ${dishes.length} блюд`, 'success');
    }
    
    // Рендеринг всех блюд
    function renderDishes() {
        const menuColumn = document.querySelector('.menu-column');
        menuColumn.innerHTML = '';
        
        const dishesByCategory = {
            soup: dishes.filter(dish => dish.category === 'soup'),
            main: dishes.filter(dish => dish.category === 'main'),
            drink: dishes.filter(dish => dish.category === 'drink'),
            starter: dishes.filter(dish => dish.category === 'starter'),
            dessert: dishes.filter(dish => dish.category === 'dessert')
        };
        
        for (const [categoryKey, categoryDishes] of Object.entries(dishesByCategory)) {
            if (categoryDishes.length > 0) {
                const section = document.createElement('section');
                section.className = 'dishes-section';
                
                const title = document.createElement('h2');
                title.textContent = getCategoryTitle(categoryKey);
                section.appendChild(title);
                
                const filtersContainer = createFiltersForCategory(categoryKey);
                section.appendChild(filtersContainer);
                
                const grid = document.createElement('div');
                grid.className = 'dishes-grid';
                grid.id = `grid-${categoryKey}`;
                
                categoryDishes.forEach(dish => {
                    const dishElement = createDishElement(dish);
                    grid.appendChild(dishElement);
                });
                
                section.appendChild(grid);
                menuColumn.appendChild(section);
            }
        }
        
        addCheckoutPanel();
    }
    
    // Создание элемента блюда
    function createDishElement(dish) {
        const dishItem = document.createElement('div');
        dishItem.className = 'dish-item';
        dishItem.setAttribute('data-dish-id', dish.id);
        dishItem.setAttribute('data-category', dish.category);
        
        dishItem.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" onerror="this.src='${getDefaultImage(dish.category)}'" />
            <p class="price">${dish.price}Р</p>
            <p class="name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="add-btn">Добавить</button>
        `;
        
        return dishItem;
    }
    
    // Подсветка всех выбранных блюд при загрузке
    function highlightAllSelectedDishes() {
        Object.keys(selectedDishes).forEach(category => {
            highlightSelectedDish(category);
        });
    }
    
    // Создание фильтров для категории
    function createFiltersForCategory(category) {
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'filters-container';
        
        const filters = getFiltersForCategory(category);
        
        if (filters.length > 0) {
            filters.forEach(filter => {
                const filterButton = document.createElement('button');
                filterButton.className = 'filter-btn';
                filterButton.setAttribute('data-category', category);
                filterButton.setAttribute('data-kind', filter.kind);
                filterButton.textContent = filter.label;
                
                filterButton.addEventListener('click', function() {
                    toggleFilter(this);
                });
                
                filtersContainer.appendChild(filterButton);
            });
        }
        
        return filtersContainer;
    }
    
    // Получение фильтров по категории
    function getFiltersForCategory(category) {
        const filtersMap = {
            soup: [
                { kind: 'fish', label: 'рыбный' },
                { kind: 'meat', label: 'мясной' },
                { kind: 'veg', label: 'вегетарианский' }
            ],
            main: [
                { kind: 'fish', label: 'рыбное' },
                { kind: 'meat', label: 'мясное' },
                { kind: 'veg', label: 'вегетарианское' }
            ],
            starter: [
                { kind: 'fish', label: 'рыбный' },
                { kind: 'meat', label: 'мясной' },
                { kind: 'veg', label: 'вегетарианский' }
            ],
            drink: [
                { kind: 'cold', label: 'холодный' },
                { kind: 'hot', label: 'горячий' }
            ],
            dessert: [
                { kind: 'small', label: 'маленькая порция' },
                { kind: 'medium', label: 'средняя порция' },
                { kind: 'large', label: 'большая порция' }
            ]
        };
        
        return filtersMap[category] || [];
    }
    
    // Переключение фильтра
    function toggleFilter(filterButton) {
        const category = filterButton.getAttribute('data-category');
        const kind = filterButton.getAttribute('data-kind');
        const grid = document.getElementById(`grid-${category}`);
        
        if (filterButton.classList.contains('active')) {
            filterButton.classList.remove('active');
            showAllDishesInCategory(category);
        } else {
            const allFilters = document.querySelectorAll(`.filter-btn[data-category="${category}"]`);
            allFilters.forEach(btn => btn.classList.remove('active'));
            filterButton.classList.add('active');
            filterDishesByKind(category, kind);
        }
    }
    
    // Показать все блюда категории
    function showAllDishesInCategory(category) {
        const grid = document.getElementById(`grid-${category}`);
        const allDishesInCategory = dishes.filter(dish => dish.category === category);
        
        grid.innerHTML = '';
        allDishesInCategory.forEach(dish => {
            const dishElement = createDishElement(dish);
            grid.appendChild(dishElement);
        });
        
        highlightSelectedDish(category);
    }
    
    // Фильтрация блюд по типу
    function filterDishesByKind(category, kind) {
        const grid = document.getElementById(`grid-${category}`);
        const filteredDishes = dishes.filter(dish => 
            dish.category === category && dish.kind === kind
        );
        
        grid.innerHTML = '';
        filteredDishes.forEach(dish => {
            const dishElement = createDishElement(dish);
            grid.appendChild(dishElement);
        });
        
        highlightSelectedDish(category);
    }
    
    // Получение русского названия категории
    function getCategoryTitle(categoryKey) {
        const titles = {
            soup: 'Супы',
            main: 'Главные блюда',
            drink: 'Напитки',
            starter: 'Салаты и стартеры',
            dessert: 'Десерты'
        };
        return titles[categoryKey] || categoryKey;
    }
    
    // Добавление панели оформления заказа
    function addCheckoutPanel() {
        const oldOrderColumn = document.querySelector('.order-column');
        if (oldOrderColumn) {
            oldOrderColumn.remove();
        }

        const orderColumn = document.createElement('div');
        orderColumn.className = 'order-column';
        orderColumn.innerHTML = `
            <div class="order-summary checkout-panel">
                <h2>Ваш заказ</h2>
                <div class="order-items">
                    <div class="order-item">
                        <span class="item-category">Суп</span>
                        <span class="item-name">– Не выбран –</span>
                    </div>
                    <div class="order-item">
                        <span class="item-category">Салат</span>
                        <span class="item-name">– Не выбран –</span>
                    </div>
                    <div class="order-item">
                        <span class="item-category">Главное блюдо</span>
                        <span class="item-name">– Не выбрано –</span>
                    </div>
                    <div class="order-item">
                        <span class="item-category">Напиток</span>
                        <span class="item-name">– Не выбран –</span>
                    </div>
                    <div class="order-item">
                        <span class="item-category">Десерт</span>
                        <span class="item-name">– Не выбран –</span>
                    </div>
                </div>
                
                <div class="checkout-total">
                    <div class="total-price">
                        <span>Итого:</span>
                        <span id="checkout-total-price">0Р</span>
                    </div>
                    <a href="checkout.html" class="btn-primary checkout-btn" id="checkout-link">
                        Перейти к оформлению
                    </a>
                </div>
                
                <div class="order-empty">
                    <p>Добавьте блюда в заказ</p>
                </div>
            </div>
        `;

        const orderContainer = document.querySelector('.order-container');
        if (orderContainer) {
            orderContainer.appendChild(orderColumn);
        }

        updateCheckoutPanel();
    }
    
    // Обновление панели оформления
    function updateCheckoutPanel() {
        const orderItems = document.querySelectorAll('.checkout-panel .order-item .item-name');
        const totalPriceElement = document.getElementById('checkout-total-price');
        const checkoutLink = document.getElementById('checkout-link');
        const orderEmpty = document.querySelector('.checkout-panel .order-empty');
        const checkoutTotal = document.querySelector('.checkout-panel .checkout-total');

        let totalPrice = 0;
        let hasSelectedItems = false;

        const categories = ['soup', 'starter', 'main', 'drink', 'dessert'];
        const displayNames = ['Суп', 'Салат', 'Главное блюдо', 'Напиток', 'Десерт'];

        categories.forEach((category, index) => {
            const dishId = selectedDishes[category];
            if (dishId && orderItems[index]) {
                const dish = dishes.find(d => d.id === dishId);
                if (dish) {
                    orderItems[index].textContent = dish.name;
                    orderItems[index].style.color = '#333';
                    orderItems[index].style.fontWeight = '500';
                    totalPrice += dish.price;
                    hasSelectedItems = true;
                }
            } else if (orderItems[index]) {
                orderItems[index].textContent = '– Не выбран –';
                orderItems[index].style.color = '#666';
                orderItems[index].style.fontWeight = 'normal';
            }
        });

        if (hasSelectedItems) {
            totalPriceElement.textContent = `${totalPrice}Р`;
            if (checkoutTotal) checkoutTotal.style.display = 'block';
            if (orderEmpty) orderEmpty.style.display = 'none';
            
            const isValid = validateLunchComposition();
            if (isValid) {
                checkoutLink.style.opacity = '1';
                checkoutLink.style.cursor = 'pointer';
                checkoutLink.style.pointerEvents = 'auto';
            } else {
                checkoutLink.style.opacity = '0.7';
                checkoutLink.style.cursor = 'not-allowed';
                checkoutLink.style.pointerEvents = 'none';
            }
        } else {
            if (checkoutTotal) checkoutTotal.style.display = 'none';
            if (orderEmpty) orderEmpty.style.display = 'block';
        }
    }
    
    // Проверка состава ланча
    function validateLunchComposition() {
        const selected = selectedDishes;
        
        const validCombinations = [
            selected.soup && selected.main && selected.starter && selected.drink,
            selected.soup && selected.main && selected.drink,
            selected.soup && selected.starter && selected.drink,
            selected.main && selected.starter && selected.drink,
            selected.main && selected.drink
        ];
        
        return validCombinations.some(combination => combination);
    }
    
    // Функция для показа уведомления
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
    
    // Делегирование событий
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-btn')) {
            const dishItem = e.target.closest('.dish-item');
            const dishId = parseInt(dishItem.getAttribute('data-dish-id'));
            const dish = dishes.find(d => d.id === dishId);
            
            if (dish) {
                addDishToOrder(dish);
                showNotification(`Добавлено: ${dish.name}`, 'success');
            }
        }
    });
    
    // Запускаем инициализацию
    init();
});