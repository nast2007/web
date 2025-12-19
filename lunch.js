document.addEventListener('DOMContentLoaded', function () {
    let selectedDishes = loadSelectedDishes();
    let dishes = [];
    const LOCAL_JSON_FILE = 'dishes.json';

    function loadSelectedDishes() {
        const saved = localStorage.getItem('selectedDishes');
        return saved ? JSON.parse(saved) : {
            soup: null,
            starter: null, // ← ВАЖНО: starter, не salad
            main: null,
            drink: null,
            dessert: null
        };
    }

    function saveSelectedDishes() {
        const toSave = {};
        for (const category in selectedDishes) {
            const id = selectedDishes[category];
            if (id !== null) {
                const dish = dishes.find(d => d.id === id);
                toSave[category] = dish ? {
                    id: dish.id,
                    name: dish.name,
                    price: dish.price,
                    image: dish.image,
                    count: dish.count,
                    keyword: dish.keyword,
                    category: dish.category
                } : null;
            } else {
                toSave[category] = null;
            }
        }
        localStorage.setItem('selectedDishes', JSON.stringify(toSave));
        updateCheckoutPanel();
    }

    async function loadDishesFromAPI() {
        try {
            const response = await fetch(LOCAL_JSON_FILE);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return data.map((dish, index) => ({
                id: index + 1,
                keyword: dish.keyword,
                name: dish.name,
                price: dish.price,
                category: dish.category,
                count: dish.count,
                image: dish.image,
                kind: dish.kind
            }));
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return [];
        }
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

    function addDishToOrder(dish) {
        selectedDishes[dish.category] = dish.id;
        saveSelectedDishes();
        highlightSelectedDish(dish.category);
    }

    function highlightSelectedDish(category) {
        document.querySelectorAll(`.dish-item[data-category="${category}"]`).forEach(el => {
            el.classList.remove('selected');
            el.style.border = '';
            el.style.transform = '';
        });
        const id = selectedDishes[category];
        if (id !== null) {
            const el = document.querySelector(`.dish-item[data-dish-id="${id}"]`);
            if (el) {
                el.classList.add('selected');
                el.style.border = '2px solid tomato';
                el.style.transform = 'translateY(-5px)';
            }
        }
    }

    async function init() {
        const container = document.querySelector('.menu-column');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center;padding:40px;">Загрузка меню...</p>';
        dishes = await loadDishesFromAPI();

        if (dishes.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#e74c3c;padding:40px;">Не удалось загрузить меню. Проверьте dishes.json.</p>';
            return;
        }

        renderMenu();
        addCheckoutPanel();
        highlightAllSelectedDishes();
    }

    function renderMenu() {
        const container = document.querySelector('.menu-column');
        container.innerHTML = '';

        const categories = {
            soup: 'Супы',
            starter: 'Салаты и стартеры',
            main: 'Главные блюда',
            drink: 'Напитки',
            dessert: 'Десерты'
        };

        for (const [key, title] of Object.entries(categories)) {
            const items = dishes.filter(d => d.category === key);
            if (items.length === 0) continue;

            const section = document.createElement('div');
            section.className = 'dishes-section';
            const h2 = document.createElement('h2');
            h2.textContent = title;
            section.appendChild(h2);

            const filters = createFilters(key);
            if (filters.children.length > 0) section.appendChild(filters);

            const grid = document.createElement('div');
            grid.className = 'dishes-grid';
            grid.id = `grid-${key}`;
            items.forEach(d => grid.appendChild(createDishElement(d)));
            section.appendChild(grid);
            container.appendChild(section);
        }
    }

    function createDishElement(dish) {
        const el = document.createElement('div');
        el.className = 'dish-item';
        el.dataset.dishId = dish.id;
        el.dataset.category = dish.category;
        const imgOnError = `this.onerror=null;this.src='${getDefaultImage(dish.category)}'`;
        el.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" onerror="${imgOnError}" />
            <p class="price">${dish.price}₽</p>
            <p class="name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="add-btn">Добавить</button>
        `;
        return el;
    }

    function createFilters(category) {
        const container = document.createElement('div');
        container.className = 'filters-container';
        const filters = getFiltersForCategory(category);
        filters.forEach(f => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = category;
            btn.dataset.kind = f.kind;
            btn.textContent = f.label;
            btn.addEventListener('click', () => toggleFilter(btn));
            container.appendChild(btn);
        });
        return container;
    }

    function getFiltersForCategory(category) {
        const map = {
            soup: [{ kind: 'fish', label: 'рыбный' }, { kind: 'meat', label: 'мясной' }, { kind: 'veg', label: 'вегетарианский' }],
            starter: [{ kind: 'fish', label: 'рыбный' }, { kind: 'meat', label: 'мясной' }, { kind: 'veg', label: 'вегетарианский' }],
            main: [{ kind: 'fish', label: 'рыбное' }, { kind: 'meat', label: 'мясное' }, { kind: 'veg', label: 'вегетарианское' }],
            drink: [{ kind: 'cold', label: 'холодный' }, { kind: 'hot', label: 'горячий' }],
            dessert: [{ kind: 'small', label: 'маленькая порция' }, { kind: 'medium', label: 'средняя порция' }, { kind: 'large', label: 'большая порция' }]
        };
        return map[category] || [];
    }

    function toggleFilter(btn) {
        const category = btn.dataset.category;
        const kind = btn.dataset.kind;
        const isActive = btn.classList.contains('active');
        document.querySelectorAll(`.filter-btn[data-category="${category}"]`).forEach(b => b.classList.remove('active'));
        if (isActive) {
            showAllDishes(category);
        } else {
            btn.classList.add('active');
            filterDishes(category, kind);
        }
        highlightSelectedDish(category);
    }

    function showAllDishes(category) {
        const grid = document.getElementById(`grid-${category}`);
        const items = dishes.filter(d => d.category === category);
        grid.innerHTML = '';
        items.forEach(d => grid.appendChild(createDishElement(d)));
    }

    function filterDishes(category, kind) {
        const grid = document.getElementById(`grid-${category}`);
        const items = dishes.filter(d => d.category === category && d.kind === kind);
        grid.innerHTML = '';
        items.forEach(d => grid.appendChild(createDishElement(d)));
    }

    function highlightAllSelectedDishes() {
        Object.keys(selectedDishes).forEach(highlightSelectedDish);
    }

    function addCheckoutPanel() {
        const orderContainer = document.querySelector('.order-container');
        if (!orderContainer) return;

        const panel = document.createElement('div');
        panel.className = 'order-column';
        panel.innerHTML = `
            <div class="order-summary checkout-panel">
                <h2>Ваш заказ</h2>
                <div class="order-items">
                    <div class="order-item"><span class="item-category">Суп</span><span class="item-name">– Не выбран –</span></div>
                    <div class="order-item"><span class="item-category">Салат</span><span class="item-name">– Не выбран –</span></div>
                    <div class="order-item"><span class="item-category">Главное блюдо</span><span class="item-name">– Не выбрано –</span></div>
                    <div class="order-item"><span class="item-category">Напиток</span><span class="item-name">– Не выбран –</span></div>
                    <div class="order-item"><span class="item-category">Десерт</span><span class="item-name">– Не выбран –</span></div>
                </div>
                <div class="checkout-total">
                    <div class="total-price">
                        <span>Итого:</span>
                        <span id="checkout-total-price">0₽</span>
                    </div>
                    <a href="checkout.html" class="btn-primary checkout-btn" id="checkout-link">Перейти к оформлению</a>
                </div>
                <div class="order-empty">Добавьте блюда в заказ</div>
            </div>
        `;
        orderContainer.appendChild(panel);
        updateCheckoutPanel();
    }

    function updateCheckoutPanel() {
        const items = document.querySelectorAll('.order-item .item-name');
        const totalEl = document.getElementById('checkout-total-price');
        const link = document.getElementById('checkout-link');
        const empty = document.querySelector('.order-empty');
        const totalBlock = document.querySelector('.checkout-total');

        const cats = ['soup', 'starter', 'main', 'drink', 'dessert'];
        let total = 0, has = false;

        cats.forEach((cat, i) => {
            const id = selectedDishes[cat];
            if (id !== null && items[i]) {
                const d = dishes.find(x => x.id === id);
                if (d) {
                    items[i].textContent = d.name;
                    items[i].style.color = '#333';
                    items[i].style.fontWeight = '500';
                    total += d.price;
                    has = true;
                }
            } else if (items[i]) {
                items[i].textContent = '– Не выбран –';
                items[i].style.color = '#999';
                items[i].style.fontWeight = 'normal';
            }
        });

        if (has) {
            totalEl.textContent = `${total}₽`;
            totalBlock.style.display = 'block';
            empty.style.display = 'none';

            const valid = validateLunch();
            link.style.pointerEvents = valid ? 'auto' : 'none';
            link.style.opacity = valid ? '1' : '0.6';
            link.style.cursor = valid ? 'pointer' : 'not-allowed';
        } else {
            totalBlock.style.display = 'none';
            empty.style.display = 'block';
        }
    }

    function validateLunch() {
        const s = selectedDishes;
        return !!(s.soup && s.main && s.starter && s.drink) ||
               !!(s.soup && s.main && s.drink) ||
               !!(s.soup && s.starter && s.drink) ||
               !!(s.main && s.starter && s.drink) ||
               !!(s.main && s.drink);
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const item = e.target.closest('.dish-item');
            if (item) {
                const id = parseInt(item.dataset.dishId);
                const dish = dishes.find(d => d.id === id);
                if (dish) addDishToOrder(dish);
            }
        }
    });

    init();
});