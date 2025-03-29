import React, { useContext, useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../apiContent/AuthContext';
import ModalLogin from '../js/Modal';
import ModalRegister from '../js/ModalReg';
import BtnDarkMode from '../btnDarkMode/BtnDarkMode';
import '../header/header.css';
import logo from './../../img/logo_checklist.png';
import "./Navbar.css";

const Navbar = () => {
    const { isLoggedIn, login, logout } = useContext(AuthContext);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const openLoginModal = () => setLoginModalOpen(true);
    const closeLoginModal = () => setLoginModalOpen(false);
    const openRegisterModal = () => setRegisterModalOpen(true);
    const closeRegisterModal = () => setRegisterModalOpen(false);
    const toggleMenu = () => setMenuOpen(!isMenuOpen);

    // Закрытие меню при нажатии вне его
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

    return (
        <>
            <nav className="nav">
                <div className="container">
                    <div className="nav-row">
                        <img src={logo} alt="Project img" className="project__img" />
                        <NavLink to="/Header" className="logo">
                            Конструктор
                            <span>анкет</span>
                        </NavLink>
                        <BtnDarkMode />
                        <button className="hamburger" onClick={toggleMenu}>
                            ☰
                        </button>
                        {/* Применение рефа к меню */}
                        <ul ref={menuRef} className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-list__item">
                                        <NavLink to="/Account" className="nav-button">
                                            Личный кабинет
                                        </NavLink>
                                    </li>
                                    <li className="nav-list__item">
                                        <button onClick={logout} className="nav-button">
                                            Выйти
                                        </button>
                                    </li>
                                </>
                            ) : (
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
            {isLoginModalOpen && (
                <ModalLogin
                    onClose={closeLoginModal}
                    onRegisterOpen={openRegisterModal}
                    onLoginSuccess={login} // Обновляем состояние после входа
                />
            )}
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