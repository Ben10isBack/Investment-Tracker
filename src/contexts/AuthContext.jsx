import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('invest_tracker_token') || localStorage.getItem('lumina_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (token) {
            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    localStorage.removeItem('invest_tracker_token');
                    localStorage.removeItem('lumina_token');
                    setToken(null);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error('Unable to connect to the backend server. Please verify server.js is running on port 3001.');
        }
        if (!res.ok) throw new Error(data?.error || 'Login failed');
        localStorage.setItem('invest_tracker_token', data.token);
        localStorage.removeItem('lumina_token');
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (username, password) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        let data;
        try {
            data = await res.json();
        } catch {
            throw new Error('Unable to connect to the backend server. Please verify server.js is running on port 3001.');
        }
        if (!res.ok) throw new Error(data?.error || 'Registration failed');
        localStorage.setItem('invest_tracker_token', data.token);
        localStorage.removeItem('lumina_token');
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('invest_tracker_token');
        localStorage.removeItem('lumina_token');
        localStorage.removeItem('invest_tracker_active_portfolio');
        localStorage.removeItem('lumina_active_portfolio');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
