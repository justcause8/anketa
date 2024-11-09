import React from 'react';
import './Modal.css';

const Modal = ({ onClose, onRegisterOpen }) => { 
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Вход в аккаунт</h2>
                <input type="email" placeholder="Эл. почта" />
                <input type="password" placeholder="Пароль" />
                <label>
                    <input type="checkbox" />
                    Запомнить меня
                </label>
                <div className="modal-buttons">
                    <button className="login-btn">войти</button>
                    <button 
                        className="register-btn" 
                        onClick={() => {
                            onClose();
                            onRegisterOpen();
                        }}
                    >
                        регистрация
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
