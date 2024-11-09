import React from 'react';
import './ModalReg.css';

const Modal = ({ onClose, onLoginOpen }) => { 
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2>Регистрация</h2>
                <input type="email" placeholder="Эл. почта" />
                <input type="password" placeholder="Пароль" />
                <input type="password" placeholder="Подтвердите пароль" />
                <label>
                    <input type="checkbox" />
                    Я согласен на&nbsp;
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => window.open('https://www.figma.com/design/FnqNuTY0TwAiTo1mSKRADx/Конструктор-анкет?node-id=0-1&node-type=canvas&t=AVcmbkWQHdclinB5-0', '_blank')}
                    >
                        обработку персональных данных
                    </button>
                </label>
                <label>
                    <input type="checkbox" />
                    Я ознакомлен&nbsp;
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => window.open('https://avatars.mds.yandex.net/i?id=7f227e472ce817cdad5bb5a582e0e331_l-10340874-images-thumbs&n=13')}
                    >
                        с политикой конфиденциальности
                    </button>
                </label>
                <div className="modal-buttons">
                    <button className="reg-btn">Зарегистрироваться</button>
                </div>
                <label 
                    className="link-button perehod" 
                    onClick={() => {
                        onClose();
                        onLoginOpen();
                    }}
                >
                    уже есть аккаунт
                </label>
            </div>
        </div>
    );
};

export default Modal;
