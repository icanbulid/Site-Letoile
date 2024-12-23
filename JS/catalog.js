
// Функция для загрузки хедера
function loadHeader() {
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            highlightActiveLink(); // Вызываем highlightActiveLink после загрузки хедера
        })
        .catch(error => console.error('Ошибка при загрузке header.html:', error));
}

// Функция для загрузки продуктов
async function loadproducts() {
    try {
        const response = await fetch('http://localhost:5502/api/products'); // Замените на ваш API-эндпоинт
        const products = await response.json();
        const productsContainer = document.getElementById('products-container');

        // Проверка на наличие данных
        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="text-center">Нет доступных продуктов.</p>';
            return;
        }

        products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-4';
            col.innerHTML = `
                <div class="card text-center hover-effect" onclick="location.href='product.html?id=${product.id}'">
                    <img src="${window.location.origin}/${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.short_description}</p>
                        <p class="card-text"><strong>${product.price} ₽</strong></p>
                       </div>
                </div>
            `;
            productsContainer.appendChild(col);
        });
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '<p class="text-center">Ошибка при загрузке продуктов.</p>';
    }
}

// Функция для выделения активной ссылки
function highlightActiveLink() {
    const currentUrl = window.location.pathname; // Получаем текущий путь
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach(link => {
        // Если href заканчивается на текущий URL и не является ссылкой на аккаунт
        if (link.href.includes(currentUrl) && !link.classList.contains('account-link')) {
            link.classList.add("active-link");
        }
    });
}

// Добавляем обработчики события load
window.addEventListener('load', function() {
    loadHeader();
    loadproducts(); // Загружаем продукты только на странице каталога

    // Проверяем, находимся ли мы на странице продукта
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        loadproductDetails(productId); // Загружаем детали продукта только если есть ID
    }
});

// Функция для загрузки деталей продукта
async function loadproductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:5502/api/products/${productId}`); // Замените на ваш API-эндпоинт
        const product = await response.json();
        const productDetailsContainer = document.getElementById('product-details');

        if (!product) {
            productDetailsContainer.innerHTML = '<p class="text-center">продукт не найден.</p>';
            return;
        }

        productDetailsContainer.innerHTML = `
            <h2>${product.name}</h2>
            <img src="${window.location.origin}/${product.image}" alt="${product.name}" class="img-fluid">
            <p><strong>Описание:</strong> ${product.full_description}</p>
            <p><strong>Цена:</strong> ${product.price} ₽</p>
            <p><strong>Место назначения:</strong> ${product.destination}</p>
            <a href="catalog.html" class="btn btn-primary">Вернуться к каталогу</a>
        `;
    } catch (error) {
        console.error('Ошибка при загрузке деталей продукта:', error);
        const productDetailsContainer = document.getElementById('product-details');
        productDetailsContainer.innerHTML = '<p class="text-center">Ошибка при загрузке деталей продукта.</p>';
    }
}