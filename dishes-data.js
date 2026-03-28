// Этот файл больше не используется, данные загружаются с API
// dishes-data.js закомментирован для лабораторной работы №7
/*
// Массив всех блюд
const dishes = [
    // Супы
    {
        keyword: "tomato_soup",
        name: "Томатный суп с базиликом",
        price: 270,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic1.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "mushroom_cream_soup",
        name: "Грибной крем-суп",
        price: 290,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic2.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "pumpkin_cream_soup",
        name: "Тыквенный крем-суп",
        price: 320,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic3.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "fish_soup",
        name: "Уха по-фински",
        price: 350,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic17.jpg",
        kind: "fish" // рыбный
    },
    {
        keyword: "chicken_noodle_soup",
        name: "Куриный суп с лапшой",
        price: 280,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic18.jpg",
        kind: "meat" // мясной
    },
    {
        keyword: "borscht",
        name: "Борщ с говядиной",
        price: 300,
        category: "soup",
        count: "350 мл",
        image: ".vscode/pic19.jpg",
        kind: "meat" // мясной
    },
    
    // Главные блюда
    {
        keyword: "lasagna",
        name: "Лазанья с мясом",
        price: 385,
        category: "main",
        count: "400 г",
        image: ".vscode/pic4.jpg",
        kind: "meat" // мясное
    },
    {
        keyword: "tom_yum",
        name: "Том Ям с креветками",
        price: 365,
        category: "main",
        count: "350 г",
        image: ".vscode/pic5.jpg",
        kind: "fish" // рыбное
    },
    {
        keyword: "chicken_cutlets",
        name: "Котлеты из курицы с пюре",
        price: 325,
        category: "main",
        count: "450 г",
        image: ".vscode/pic6.jpg",
        kind: "meat" // мясное
    },
    {
        keyword: "fried_potatoes",
        name: "Жареная картошка с грибами",
        price: 280,
        category: "main",
        count: "400 г",
        image: ".vscode/pic7.jpg",
        kind: "veg" // вегетарианское
    },
    {
        keyword: "pasta_carbonara",
        name: "Паста Карбонара",
        price: 340,
        category: "main",
        count: "380 г",
        image: ".vscode/pic8.jpg",
        kind: "meat" // мясное
    },
    {
        keyword: "mushroom_risotto",
        name: "Ризотто с грибами",
        price: 310,
        category: "main",
        count: "350 г",
        image: ".vscode/pic9.jpg",
        kind: "veg" // вегетарианское
    },
    {
        keyword: "grilled_salmon",
        name: "Лосось на гриле",
        price: 420,
        category: "main",
        count: "300 г",
        image: ".vscode/pic20.jpg",
        kind: "fish" // рыбное
    },
    {
        keyword: "vegetable_stew",
        name: "Овощное рагу",
        price: 290,
        category: "main",
        count: "350 г",
        image: ".vscode/pic21.jpg",
        kind: "veg" // вегетарианское
    },
    
    // Напитки
    {
        keyword: "orange_juice",
        name: "Апельсиновый сок",
        price: 120,
        category: "drink",
        count: "300 мл",
        image: ".vscode/pic10.jpg",
        kind: "cold" // холодный
    },
    {
        keyword: "apple_juice",
        name: "Яблочный сок",
        price: 90,
        category: "drink",
        count: "300 мл",
        image: ".vscode/pic11.jpg",
        kind: "cold" // холодный
    },
    {
        keyword: "carrot_juice",
        name: "Морковный сок",
        price: 110,
        category: "drink",
        count: "300 мл",
        image: ".vscode/pic12.jpg",
        kind: "cold" // холодный
    },
    {
        keyword: "cola",
        name: "Coca-Cola",
        price: 80,
        category: "drink",
        count: "330 мл",
        image: ".vscode/pic13.jpg",
        kind: "cold" // холодный
    },
    {
        keyword: "mineral_water",
        name: "Минеральная вода",
        price: 60,
        category: "drink",
        count: "500 мл",
        image: ".vscode/pic14.jpg",
        kind: "cold" // холодный
    },
    {
        keyword: "tea",
        name: "Чай зеленый/черный",
        price: 70,
        category: "drink",
        count: "300 мл",
        image: ".vscode/pic15.jpg",
        kind: "hot" // горячий
    },
    {
        keyword: "coffee",
        name: "Кофе американо",
        price: 100,
        category: "drink",
        count: "250 мл",
        image: ".vscode/pic22.jpg",
        kind: "hot" // горячий
    },
    {
        keyword: "cappuccino",
        name: "Капучино",
        price: 150,
        category: "drink",
        count: "300 мл",
        image: ".vscode/pic23.jpg",
        kind: "hot" // горячий
    },
    
    // Салаты и стартеры
    {
        keyword: "caesar_salad",
        name: "Салат Цезарь",
        price: 320,
        category: "starter",
        count: "250 г",
        image: ".vscode/pic24.jpg",
        kind: "meat" // мясной
    },
    {
        keyword: "shrimp_cocktail",
        name: "Коктейль из креветок",
        price: 380,
        category: "starter",
        count: "200 г",
        image: ".vscode/pic25.jpg",
        kind: "fish" // рыбный
    },
    {
        keyword: "greek_salad",
        name: "Греческий салат",
        price: 280,
        category: "starter",
        count: "300 г",
        image: ".vscode/pic26.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "caprese_salad",
        name: "Салат Капрезе",
        price: 260,
        category: "starter",
        count: "250 г",
        image: ".vscode/pic27.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "vegetable_salad",
        name: "Овощной салат",
        price: 220,
        category: "starter",
        count: "300 г",
        image: ".vscode/pic28.jpg",
        kind: "veg" // вегетарианский
    },
    {
        keyword: "bruschetta",
        name: "Брускетта с томатами",
        price: 190,
        category: "starter",
        count: "200 г",
        image: ".vscode/pic29.jpg",
        kind: "veg" // вегетарианский
    },
    
    // Десерты
    {
        keyword: "tiramisu",
        name: "Тирамису",
        price: 280,
        category: "dessert",
        count: "150 г",
        image: ".vscode/pic30.jpg",
        kind: "medium" // средняя порция
    },
    {
        keyword: "cheesecake",
        name: "Чизкейк Нью-Йорк",
        price: 320,
        category: "dessert",
        count: "180 г",
        image: ".vscode/pic31.jpg",
        kind: "medium" // средняя порция
    },
    {
        keyword: "chocolate_cake",
        name: "Шоколадный торт",
        price: 350,
        category: "dessert",
        count: "200 г",
        image: ".vscode/pic32.jpg",
        kind: "large" // большая порция
    },
    {
        keyword: "fruit_salad",
        name: "Фруктовый салат",
        price: 180,
        category: "dessert",
        count: "200 г",
        image: ".vscode/pic33.jpg",
        kind: "small" // маленькая порция
    },
    {
        keyword: "ice_cream",
        name: "Мороженое пломбир",
        price: 150,
        category: "dessert",
        count: "100 г",
        image: ".vscode/pic34.jpg",
        kind: "small" // маленькая порция
    },
    {
        keyword: "pancakes",
        name: "Панкейки с кленовым сиропом",
        price: 220,
        category: "dessert",
        count: "180 г",
        image: ".vscode/pic35.jpg",
        kind: "small" // маленькая порция
    }
];
*/