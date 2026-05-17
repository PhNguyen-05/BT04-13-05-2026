import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.service';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    // Lấy giỏ hàng khi user đăng nhập
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ items: [] });
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await api.post('/cart/add', { productId, quantity });
            setCart(res.data);
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        if (!productId) return false;
        try {
            const res = await api.delete(`/cart/remove/${productId}`);
            setCart(res.data);
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể xóa sản phẩm');
            return false;
        }
    };

    const updateCartQuantity = async (productId, quantity) => {
        if (!productId) return false;
        try {
            const res = await api.put('/cart/update', { productId, quantity });
            setCart(res.data);
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể cập nhật số lượng');
            return false;
        }
    };

    const getTotalItems = () => {
        return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const getTotalPrice = () => {
        return cart.items?.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0) || 0;
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            updateCartQuantity,
            getTotalItems,
            getTotalPrice,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};