import { createContext, useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import api from '../services/api.service';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState({ show: false, message: '', variant: 'success' });
    const { user } = useAuth();

    const showCartNotice = (message, variant = 'success') => {
        setNotice({ show: true, message, variant });
    };

    // Lấy giỏ hàng khi user đăng nhập
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ items: [] });
        }
    }, [user]);

    const fetchCart = async () => {
        if (!localStorage.getItem('token')) {
            setCart({ items: [] });
            return;
        }
        try {
            setLoading(true);
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (err) {
            if (err.response?.status !== 401) {
                console.error(err);
            }
            setCart({ items: [] });
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, variantId = null) => {
        try {
            const res = await api.post('/cart/add', { productId, quantity, variantId });
            setCart(res.data);
            showCartNotice(
                quantity > 1
                    ? `Đã thêm ${quantity} sản phẩm vào giỏ hàng.`
                    : 'Đã thêm sản phẩm vào giỏ hàng.'
            );
            return true;
        } catch (error) {
            showCartNotice(error.response?.data?.message || 'Không thể thêm vào giỏ hàng', 'danger');
            return false;
        }
    };

    const removeFromCart = async (productId, variantId = null) => {
        if (!productId) return false;
        try {
            const url = variantId 
                ? `/cart/remove/${productId}/${variantId}` 
                : `/cart/remove/${productId}`;
            const res = await api.delete(url);
            setCart(res.data);
            return true;
        } catch (error) {
            alert(error.response?.data?.message || 'Không thể xóa sản phẩm');
            return false;
        }
    };

    const updateCartQuantity = async (productId, quantity, variantId = null) => {
        if (!productId) return false;
        try {
            const res = await api.put('/cart/update', { productId, quantity, variantId });
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
        <>
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
            <ToastContainer position="top-end" className="cart-toast-container p-3">
                <Toast
                    show={notice.show}
                    onClose={() => setNotice((prev) => ({ ...prev, show: false }))}
                    delay={2600}
                    autohide
                    className={`cart-toast cart-toast-${notice.variant}`}
                >
                    <Toast.Body>
                        <i className={`bi ${notice.variant === 'danger' ? 'bi-exclamation-circle' : 'bi-check-circle-fill'}`} />
                        <span>{notice.message}</span>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};
