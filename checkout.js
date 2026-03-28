document.addEventListener('DOMContentLoaded', function() {
    const ORDERS_API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';
    const DISHES_API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
    const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';
    let selectedDishes = {};
    let allDishes = [];

    async function init() {
        await loadAllDishes();
        loadSelectedDishesFromStorage();
        renderCheckoutDishes();
        updateOrderSummary();
        setupEventListeners();
    }

    async function loadAllDishes() {
        try {
            const response = await fetch(`${DISHES_API_URL}?api_key=${API_KEY}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            allDishes = data.map((dish, i) => ({
                id: i + 1,
                ...dish
            }));
        } catch (error) {
            console.error('Ошибка загрузки блюд:', error);
            allDishes = [];
        }
    }

    function loadSelectedDishesFromStorage() {
        const saved = localStorage.getItem('selectedDishes');
        selectedDishes = {
            soup: null,
            starter: null,
            main: null,
            drink: null,
            dessert: null
        };
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                selectedDishes = {
                    soup: parsed.soup?.id || null,
                    starter: parsed.starter?.id || null, // ← starter, не salad!
                    main: parsed.main?.id || null,
                    drink: parsed.drink?.id || null,
                    dessert: parsed.dessert?.id || null
                };
            } catch (e) {
                console.error('Ошибка парсинга localStorage');
            }
        }
    }

    function renderCheckoutDishes() {
        const checkoutDishes = document.getElementById('checkout-dishes');
        const emptyMessage = document.getElementById('empty-cart-message');
        const hasSelected = Object.values(selectedDishes).some(id => id !== null);

        if (!hasSelected) {
            checkoutDishes.style.display = 'none';
            emptyMessage.style.display = 'block';
            return;
        }

        checkoutDishes.style.display = 'block';
        emptyMessage.style.display = 'none';
        checkoutDishes.innerHTML = '<h3>Выбранные блюда:</h3><div class="checkout-dishes-grid"></div>';
        const grid = checkoutDishes.querySelector('.checkout-dishes-grid');

        for (const [catKey, dishId] of Object.entries(selectedDishes)) {
            if (dishId) {
                const dish = allDishes.find(d => d.id === dishId);
                if (dish) {
                    const el = createCheckoutDishElement(dish, catKey);
                    grid.appendChild(el);
                }
            }
        }
    }

    function createCheckoutDishElement(dish, category) {
        const categoryNames = {
            soup: 'Суп',
            starter: 'Салат',
            main: 'Главное блюдо',
            drink: 'Напиток',
            dessert: 'Десерт'
        };
        const dishItem = document.createElement('div');
        dishItem.className = 'checkout-dish-item';
        dishItem.dataset.dishId = dish.id;
        dishItem.dataset.category = category;
        dishItem.innerHTML = `
            <div class="checkout-dish-image">
                <img src="${dish.image}" alt="${dish.name}" onerror="this.src='${getDefaultImage(dish.category)}'" />
                <div class="dish-category">${categoryNames[category]}</div>
            </div>
            <div class="checkout-dish-info">
                <p class="checkout-dish-name">${dish.name}</p>
                <p class="checkout-dish-price">${dish.price}₽</p>
                <button type="button" class="remove-btn">Удалить</button>
            </div>
        `;
        return dishItem;
    }

    function getDefaultImage(category) {
        const map = {
            soup: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Суп',
            starter: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Салат',
            main: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Основное',
            drink: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Напиток',
            dessert: 'https://via.placeholder.com/300x200/FECA57/FFFFFF?text=Десерт'
        };
        return map[category] || 'https://via.placeholder.com/300x200/eee/333?text=Блюдо';
    }

    function removeDishFromOrder(dishId, category) {
        selectedDishes[category] = null;
        localStorage.setItem('selectedDishes', JSON.stringify({
            soup: allDishes.find(d => d.id === selectedDishes.soup) || null,
            starter: allDishes.find(d => d.id === selectedDishes.starter) || null,
            main: allDishes.find(d => d.id === selectedDishes.main) || null,
            drink: allDishes.find(d => d.id === selectedDishes.drink) || null,
            dessert: allDishes.find(d => d.id === selectedDishes.dessert) || null
        }));

        renderCheckoutDishes();
        updateOrderSummary();
        updateSubmitButton();
    }

    function updateOrderSummary() {
        const categories = ['soup', 'starter', 'main', 'drink', 'dessert'];
        let total = 0;

        categories.forEach(cat => {
            const id = selectedDishes[cat];
            const nameEl = document.getElementById(`${cat === 'starter' ? 'salad' : cat}-item`);
            const priceEl = document.getElementById(`${cat === 'starter' ? 'salad' : cat}-price`);
            const hiddenField = document.getElementById(`${cat === 'starter' ? 'salad' : cat}_id`);

            if (id) {
                const dish = allDishes.find(d => d.id === id);
                if (dish) {
                    nameEl.textContent = dish.name;
                    nameEl.style.color = '#333';
                    nameEl.style.fontWeight = '500';
                    priceEl.textContent = `${dish.price}₽`;
                    priceEl.style.display = 'inline';
                    if (hiddenField) hiddenField.value = dish.id;
                    total += dish.price;
                }
            } else {
                nameEl.textContent = '– Не выбран –';
                nameEl.style.color = '#666';
                nameEl.style.fontWeight = 'normal';
                priceEl.textContent = '';
                priceEl.style.display = 'none';
                if (hiddenField) hiddenField.value = '';
            }
        });

        document.getElementById('total-price').textContent = `${total}₽`;
        document.querySelector('.order-total').style.display = total > 0 ? 'flex' : 'none';
    }

    function validateLunchComposition() {
        const s = selectedDishes;
        return !!(s.drink) && (
            (s.soup && s.main && s.starter && s.drink) ||
            (s.soup && s.main && s.drink) ||
            (s.soup && s.starter && s.drink) ||
            (s.main && s.starter && s.drink) ||
            (s.main && s.drink)
        );
    }

    function updateSubmitButton() {
        const btn = document.getElementById('submit-order-btn');
        btn.disabled = !validateLunchComposition();
        btn.style.opacity = btn.disabled ? '0.6' : '1';
        btn.style.cursor = btn.disabled ? 'not-allowed' : 'pointer';
    }

    async function submitOrder(orderData) {
        const url = `${ORDERS_API_URL}?api_key=${API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${response.status}`);
        }
        return await response.json();
    }

    function setupEventListeners() {
        document.addEventListener('click', e => {
            if (e.target.classList.contains('remove-btn')) {
                const item = e.target.closest('.checkout-dish-item');
                const id = parseInt(item.dataset.dishId);
                const cat = item.dataset.category;
                removeDishFromOrder(id, cat);
            }
        });

        const form = document.getElementById('checkout-form');
        form.addEventListener('submit', async e => {
            e.preventDefault();
            if (!validateLunchComposition()) {
                alert('Выберите корректный состав ланча (см. варианты).');
                return;
            }

            const fd = new FormData(form);
            const data = {
                full_name: fd.get('full_name'),
                email: fd.get('email'),
                subscribe: fd.has('subscribe') ? 1 : 0,
                phone: fd.get('phone'),
                delivery_address: fd.get('delivery_address'),
                delivery_type: fd.get('delivery_type'),
                delivery_time: fd.get('delivery_time'),
                comment: fd.get('comment'),
                soup_id: selectedDishes.soup || null,
                salad_id: selectedDishes.starter || null, // API ожидает salad_id!
                main_course_id: selectedDishes.main || null,
                drink_id: selectedDishes.drink,
                dessert_id: selectedDishes.dessert || null
            };

            if (!data.full_name || !data.email || !data.phone || !data.delivery_address) {
                alert('Заполните все обязательные поля.');
                return;
            }
            if (data.delivery_type === 'by_time' && !data.delivery_time) {
                alert('Укажите время доставки.');
                return;
            }

            try {
                await submitOrder(data);
                localStorage.removeItem('selectedDishes');
                alert('Заказ успешно оформлен!');
                window.location.href = 'lunch.html';
            } catch (err) {
                alert('Ошибка при оформлении заказа: ' + err.message);
            }
        });

        // Переключение времени доставки
        const nowRadio = document.getElementById('delivery_type_now');
        const timeRadio = document.getElementById('delivery_type_by_time');
        const timeInput = document.querySelector('.time-input');

        nowRadio?.addEventListener('change', () => timeInput.style.display = 'none');
        timeRadio?.addEventListener('change', () => timeInput.style.display = 'block');
    }

    init();
});