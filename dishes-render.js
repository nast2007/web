// dishes-render.js
// Функция загрузки блюд с API
async function loadDishes() {
    try {
        const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
        const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';

        const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const dishes = await response.json();
        console.log('✅ Загружено блюд:', dishes.length);
        return dishes; // данные уже в нужном формате
    } catch (error) {
        console.error('❌ Ошибка загрузки блюд:', error);
        // Можно показать сообщение пользователю или использовать демо-данные,
        // но по заданию требуется только API, так что возвращаем пустой массив.
        return [];
    }
}

// Функция отрисовки меню
function renderMenu(dishes) {
    const container = document.querySelector('.menu-column');
    if (!container) {
        console.error('Контейнер .menu-column не найден');
        return;
    }

    // Группировка по категориям
    const categories = {
        soup: { title: 'Супы', icon: '🍜' },
        main: { title: 'Главные блюда', icon: '🍛' },
        starter: { title: 'Салаты и стартеры', icon: '🥗' },
        drink: { title: 'Напитки', icon: '🥤' },
        dessert: { title: 'Десерты', icon: '🍰' }
    };

    let html = '';

    for (const [catKey, catInfo] of Object.entries(categories)) {
        const items = dishes.filter(d => d.category === catKey);
        if (items.length === 0) continue;

        html += `
            <div class="menu-category" data-category="${catKey}">
                <h3>${catInfo.icon} ${catInfo.title}</h3>
                <div class="dishes-grid">
        `;

        items.forEach(dish => {
            html += `
                <div class="dish-card" data-dish-keyword="${dish.keyword}" 
                     data-category="${dish.category}" 
                     data-price="${dish.price}" 
                     data-kind="${dish.kind}">
                    <img src="${dish.image}" alt="${dish.name}" 
                         onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22><path d=%22M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z%22/></svg>'">
                    <h4>${dish.name}</h4>
                    <p class="dish-meta">${dish.count} • ${dish.price}₽</p>
                    <button class="btn-select" type="button">Выбрать</button>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector('.menu-column')) {
        const dishes = await loadDishes();
        if (dishes.length > 0) {
            renderMenu(dishes);
        } else {
            document.querySelector('.menu-column').innerHTML = `
                <p style="text-align: center; color: #e74c3c; font-size: 18px;">
                    Не удалось загрузить меню. Проверьте подключение к интернету.
                </p>
            `;
        }
    }
});