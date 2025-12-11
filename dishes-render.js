// Функция для загрузки блюд с сервера API
async function loadDishes() {
    try {
        console.log('Загрузка блюд с сервера API...');
        
        const API_URL = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
        const API_KEY = '9bcdd3a0-f5ab-4f24-af75-f01ebb79f6c3';
        
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
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
        
        // Возвращаем пустой массив чтобы показать ошибку загрузки
        return [];
    }
}