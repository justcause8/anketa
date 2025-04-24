import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../apiContent/AuthContext';
import ModalLogin from '../js/Modal';
import ModalRegister from '../js/ModalReg';
import BtnDarkMode from '../btnDarkMode/BtnDarkMode';
import logo from './../../img/logo_checklist.png';
import './Navbar.css';

const Navbar = () => {
    const { isLoggedIn, login, logout } = useContext(AuthContext);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Функции для управления модальными окнами
    const openLoginModal = () => setLoginModalOpen(true);
    const closeLoginModal = () => setLoginModalOpen(false);
    const openRegisterModal = () => setRegisterModalOpen(true);
    const closeRegisterModal = () => setRegisterModalOpen(false);

    // Функция для переключения мобильного меню
    const toggleMenu = () => setMenuOpen(!isMenuOpen);

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        console.log("isLoginModalOpen:", isLoginModalOpen);
        console.log("isRegisterModalOpen:", isRegisterModalOpen);
    }, [isLoginModalOpen, isRegisterModalOpen]);

    // Обработчик выхода
    const handleLogout = () => {
        logout(); // Вызываем функцию выхода из AuthContext
        navigate('/Header'); // Перенаправляем на /HEADER
    };

    return (
        <>
            <nav className="nav">
                <div className="container">
                    <div className="nav-row">
                        {/* Логотип */}
                        <img src={logo} alt="Project img" className="project__img" />
                        <NavLink to="/HEADER" className="logo">
                            Конструктор
                            <span>анкет</span>
                        </NavLink>

                        {/* Кнопка темной темы */}
                        <BtnDarkMode />

                        {/* Кнопка гамбургера для мобильного меню */}
                        <button className="hamburger" onClick={toggleMenu}>
                            ☰
                        </button>

                        {/* Меню навигации */}
                        <ul ref={menuRef} className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
                            {isLoggedIn ? (
                                // Если пользователь авторизован
                                <>
                                    <li className="nav-list__item">
                                        <NavLink to="/Account" className="nav-button">
                                            Личный кабинет
                                        </NavLink>
                                    </li>
                                    <li className="nav-list__item">
                                        <button onClick={handleLogout} className="nav-button">
                                            Выйти
                                        </button>
                                    </li>
                                </>
                            ) : (
                                // Если пользователь не авторизован
                                <>
                                    <li className="nav-list__item">
                                        <button onClick={openLoginModal} className="nav-button">
                                            Войти
                                        </button>
                                    </li>
                                    <li className="nav-list__item">
                                        <button onClick={openRegisterModal} className="nav-button">
                                            Регистрация
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Модальное окно для входа */}
            {isLoginModalOpen && (
                <ModalLogin
                    onClose={closeLoginModal}
                    onRegisterOpen={openRegisterModal}
                    onLoginSuccess={login} // Обновляем состояние после входа
                />
            )}

            {/* Модальное окно для регистрации */}
            {isRegisterModalOpen && (
                <ModalRegister
                    onClose={closeRegisterModal}
                    onLoginOpen={openLoginModal}
                    onRegisterSuccess={login} // Обновляем состояние после регистрации
                />
            )}
        </>
    );
};

export default Navbar;