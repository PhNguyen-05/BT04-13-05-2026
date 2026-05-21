import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, updateUser as updateUserAction, logout as logoutAction } from '../store/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    const login = useCallback(
        (userData, authToken) => dispatch(setCredentials({ user: userData, token: authToken })),
        [dispatch]
    );

    const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);

    const updateUser = useCallback(
        (data) => dispatch(updateUserAction(data)),
        [dispatch]
    );

    return {
        user,
        token,
        login,
        logout,
        updateUser,
        isAdmin: user?.role === 'admin',
        isLoggedIn: Boolean(user && token),
    };
};
