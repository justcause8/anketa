import React, { useState } from 'react';
import apiClient from '../apiContent/apiClient'; // Импортируем API-клиент
import './Modal.css';

const Modal = ({ onClose, onRegisterOpen, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Функция для обработки входа
    const handleLogin = async () => {
        try {
            const response = await apiClient.post('/auth/login', {
                Login: email,
                Password: password,
            });

            const { access_token, refresh_token } = response.data;

            // Сохраняем токены в localStorage
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Уведомляем Navbar об успешном входе
            onLoginSuccess();

            alert('Вы успешно вошли!');
            onClose(); // Закрываем модальное окно
        } catch (error) {
            console.error('Ошибка входа:', error.response?.data || error.message);
            alert('Неверный логин или пароль.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                <h2>Вход в аккаунт</h2>
                <input
                    type="email"
                    placeholder="Эл. почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <label>
                    <input type="checkbox" />
                    Запомнить меня
                </label>
                <div className="modal-buttons">
                    <button className="login-btn" onClick={handleLogin}>
                        Войти
                    </button>
                    <button
                        className="register-btn"
                        onClick={() => {
                            onClose();
                            onRegisterOpen();
                        }}
                    >
                        Регистрация
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;