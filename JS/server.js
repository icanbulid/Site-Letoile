const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');




const app = express();
const port = 5502;
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Измените путь здесь
// Указываем папку для статических файлов
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use('/JS', express.static(path.join(__dirname, '../JS')));
app.use(express.static(path.join(__dirname, '../pages')));

app.use(cors({
    origin: '*', // Разрешить запросы с любого источника
}));
app.use(bodyParser.json());




const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Web_labs',
    password: 'XDemon',
    port: 5432,
});



// Registration route

app.post('/register', async (req, res) => {
    const { email, username, first_name, last_name, password } = req.body;

    try {
        // Check for existing user
        const existingUser  = await pool.query(
            'SELECT * FROM users WHERE username = \$1 OR email = \$2',
            [username, email]
        );

        if (existingUser .rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким логином или почтой уже существует' });
        }


        // Insert new user into the database
        const result = await pool.query(
            'INSERT INTO users (email, username, first_name, last_name, password) VALUES (\$1, \$2, \$3, \$4, \$5) RETURNING *',
            [email, username, first_name, last_name, password]
        );

        res.status(201).json({ message: 'Пользователь успешно зарегистрировался', user: result.rows[0] });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE (username = \$1 OR email = \$1) AND password = \$2',
            [username, password]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Сохраняем информацию о пользователе в localStorage
            res.status(200).json({ 
                message: 'Успешный вход', 
                user: { id: user.id, username: user.username } 
            });
        } else {
            res.status(401).json({ message: 'Неверный логин или пароль' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});




app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Route для получения информации о пользователе
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = \$1', [id]);

        if (result.rows.length > 0) {
            res.status(200).json({ user: result.rows[0] });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.get('/index.html', (req, res) => {
    console.log('Запрос к /index.html');
    res.sendFile(path.join(__dirname, '../pages/index.html'), (err) => {
        if (err) {
            console.error('Ошибка при отправке файла:', err);
            res.status(err.status).end();
        }
    });
});

app.get('/Catalog.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/Catalog.html'));
});

// Route для получения всех продуктов
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE available > 0'); // выбираем только доступные продукты
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Route для получения продукта по ID
app.get('/api/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        const result = await pool.query('SELECT * FROM products WHERE id = \$1 AND available > 0', [productId]); // выбираем продукт по ID
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]); // Возвращаем найденный продукт
        } else {
            res.status(404).send('продукт не найден');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});
// Route for searching products
app.get('/api/search', async (req, res) => {
    const { query } = req.query; // Get the search query from the request

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE available > 0 AND (name ILIKE \$1 OR short_description ILIKE \$1)',
            [`%${query}%`] // Using ILIKE for case-insensitive search
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});


app.post('/send-message', async (req, res) => {
    const { mail, message_text, user_id } = req.body; // Получаем user_id из тела запроса

    try {
        // Проверяем, существует ли пользователь с таким user_id
        const userResult = await pool.query('SELECT * FROM users WHERE id = \$1', [user_id]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        // Вставляем новое сообщение в базу данных
        const result = await pool.query(
            'INSERT INTO messages (mail, message_text, user_id) VALUES (\$1, \$2, \$3) RETURNING *',
            [mail, message_text, user_id]
        );

        res.status(201).json({ message: 'Сообщение успешно отправлено' });
    } catch (error) {
        console.error(error); // Логируем ошибку для отладки
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});





// Route для получения изображений продукта по ID
app.get('/api/products/:productId/images', async (req, res) => {
    const productId = parseInt(req.params.productId);

    try {
        // Измените запрос на использование таблицы productimages
        const result = await pool.query('SELECT image_url FROM productimages WHERE product_id = \$1', [productId]);

        if (result.rows.length > 0) {
            const images = result.rows.map(row => row.image_url); // Извлекаем URL изображений
            res.status(200).json(images); // Возвращаем массив изображений
        } else {
            res.status(404).json({ error: 'Изображения для данного продукта не найдены' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});
