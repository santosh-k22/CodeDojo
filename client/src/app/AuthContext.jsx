import { createContext, useReducer, useEffect } from 'react';
import api from './api';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            dispatch({ type: 'LOGIN', payload: user });
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const loginWithChallenge = async (handle) => {
        // Vite's proxy handles the redirect to backend
        const response = await api.post('/auth/verify', { handle });

        if (response.data && response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            dispatch({ type: 'LOGIN', payload: response.data });
            return response.data;
        }
        throw new Error('Login failed.');
    }

    return (
        <AuthContext.Provider value={{ ...state, user: state.user, logout, loginWithChallenge }}>
            {children}
        </AuthContext.Provider>
    );
};