import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

const AUTH_PATHS = ['/login', '/register'];

function AppLayout() {
    const location = useLocation();
    const isAuthPage = AUTH_PATHS.includes(location.pathname);

    return (
        <div className={`d-flex flex-column min-vh-100 ${isAuthPage ? '' : 'aura-app'}`}>
            {!isAuthPage && <Navbar />}

            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/article/:id" element={<ArticleDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </main>

            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppLayout />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
