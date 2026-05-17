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
            await api.post('/cart/add', { productId, quantity });
            await fetchCart(); // Refresh giỏ hàng
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        // TODO: Thêm route delete ở backend sau
        alert('Chức năng xóa đang được cập nhật');
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
            getTotalItems,
            getTotalPrice,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};