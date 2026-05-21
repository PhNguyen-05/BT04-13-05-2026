import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import News from './pages/News';
import ArticleDetail from './pages/ArticleDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import AdminOrders from './pages/AdminOrders';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

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
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/article/:id" element={<ArticleDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
                    <Route
                        path="/user/profile"
                        element={
                            <ProtectedRoute>
                                <UserProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/profile"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminOrders />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <CartProvider>
            <Router>
                <AppLayout />
            </Router>
        </CartProvider>
    );
}

export default App;
