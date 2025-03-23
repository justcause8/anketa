import React, { useState } from 'react';
import './AccountEdit.css';
import { Link } from 'react-router-dom';

function AccountEditPage() {
    // Состояния для хранения значений полей
    const [nick, setNick] = useState("Arbuz");
    const [email, setEmail] = useState("VodilaLifta@mail.ru");
    const [number, setNumber] = useState("89501236464");
    const [password, setPassword] = useState("Password");

    return (
        <div className="acEdit-page">
            {/* Поле для имени пользователя */}
            <div className="survey-titleLine">
                <input
                    type="text"
                    className="text-line"
                    value={nick}
                    onChange={(e) => setNick(e.target.value)}
                />
            </div>

            {/* Поле для email */}
            <div className="survey-titleLine">
                <input
                    type="email"
                    className="text-line"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {/* Поле для номера телефона */}
            <div className="survey-titleLine">
                <input
                    type="text"
                    className="text-line"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                />
            </div>

            {/* Поле для пароля */}
            <div className="survey-titleLine">
                <input
                    type="password"
                    className="text-line"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Кнопка "Сохранить" */}
            <div className="ButtonSaveContainer">
                <Link to="/Account" className="ButtonSave">
                    Сохранить
                </Link>
            </div>
        </div>
    );
}

export default AccountEditPage;