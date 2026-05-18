// require('dotenv').config();
// //import các nguồn cần dùng
// const express = require('express');
// // const configViewEngine = require('./config/viewEngine');
// // const apiRoutes = require('./routes/api');
// // const connection = require('./config/database');
// // const { getHomepage } = require('./controllers/homeController');

// const configViewEngine = require('./config/viewEngine');
// const apiRoutes = require('./routes/api');
// const connection = require('./config/database');
// const { getHomepage } = require('./controllers/homeController');


// const cors = require('cors');
// const app = express(); //cấu hình app là express



// //cấu hình port, nếu tìm thấy port trong env, không thì trả về 8888
// const port = process.env.PORT || 8888;

// app.use(cors()); //config cors
// app.use(express.json()) //config Req.body cho json
// app.use(express.urlencoded({ extended: true })) // for form data
// configViewEngine(app); //config template engine

// //config route cho view ejs
// const webAPI = express.Router();
// webAPI.get("/", getHomepage);
// app.use('/', webAPI);

// //khai báo route cho API
// app.use('/v1/api/', apiRoutes);

// (async () => {
//     try {
//         //kết nối database using mongoose
//         await connection();

//         //lắng nghe port trong env
//         app.listen(port, () => {
//             console.log(`Backend Nodejs App listening on port ${port}`)
//         })
//     } catch (error) {
//         console.log(">>> Error connect to DB: ", error)
//     }
// })()



// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/database');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Kết nối DB
// connectDB();

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/categories', require('./routes/category'));
// app.use('/api/products', require('./routes/product'));
// app.use('/api/articles', require('./routes/article'));
// app.use('/api/promotions', require('./routes/promotion'));
// app.use('/api/cart', require('./routes/cart'));
// app.use('/api/orders', require('./routes/order'));

// app.get('/', (req, res) => {
//     res.json({ message: '🚀 Aura Lips Backend đang chạy...' });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`✅ Server Aura Lips chạy tại: http://localhost:${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ảnh nằm trong frontend/public (Vite cũng serve thư mục này khi dev)
const staticDir = path.join(__dirname, '../../frontend/public');
app.use(express.static(staticDir));
app.use('/public', express.static(staticDir));

// Kết nối Database
connectDB();

// ==================== ROUTES ====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/products', require('./routes/product'));
app.use('/api/articles', require('./routes/article'));
app.use('/api/promotions', require('./routes/promotion'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 Aura Lips Backend đang chạy...',
        staticFiles: 'http://localhost:3000/3ce/bìa.jpg (kiểm tra ảnh)'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server Aura Lips chạy tại: http://localhost:${PORT}`);
    console.log(`📁 Static files được serve từ thư mục: /public`);
});