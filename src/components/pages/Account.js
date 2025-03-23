import React, { useState, useEffect } from 'react';
import './Account.css';
import setting from './../../img/settings.png';
import { Pencil, BarChart2, Lock, Unlock, Trash2 } from "lucide-react";
import { Link } from 'react-router-dom';

// Компонент для карточки анкеты
function SurveyCard({ survey, isClosed, onDelete }) {
    const [isHovered, setIsHovered] = useState(false); // Состояние для отслеживания наведения

    // Функция для обрезки текста до maxLength символов
    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;

        // Обрезаем текст до maxLength
        let truncated = text.slice(0, maxLength);

        // Проверяем, есть ли пробелы в обрезанной части
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        // Если есть пробел, обрежем до последнего пробела
        if (lastSpaceIndex > 0) {
            truncated = truncated.slice(0, lastSpaceIndex);
        }

        // Добавляем многоточие
        return `${truncated}...`;
    };

    return (
        <div
            className="Open"
            onMouseEnter={() => setIsHovered(true)} // При наведении включаем состояние
            onMouseLeave={() => setIsHovered(false)} // При уходе курсора выключаем состояние
        >
            {/* Название анкеты */}
            <h2
                className={`text-lg ${isHovered ? 'expanded' : ''}`} // Добавляем класс при наведении
                title={survey.title} // Полное название для подсказки при наведении
            >
                {isHovered
                    ? survey.title.length > 124
                        ? truncateText(survey.title, 124) // Обрезаем до 144 символов при наведении, если текст длинный
                        : survey.title // Полный текст, если длина <= 144
                    : truncateText(survey.title, 60)} {/* Обрезаем до 32 символов без наведения */}
            </h2>
            <div className="cursorItems">
                <div className="left-cursor">
                    <Pencil className="cursor-pointer hover:text-blue-500" size={24} />
                    <BarChart2 className="cursor-pointer hover:text-green-500" size={24} />
                    {isClosed ? (
                        <Lock className="cursor-pointer hover:text-gray-500" size={24} />
                    ) : (
                        <Unlock className="cursor-pointer hover:text-gray-500" size={24} />
                    )}
                </div>
                <div className="right-cursor">
                    {/* Иконка мусорки для удаления */}
                    <Trash2
                        className="cursor-pointer hover:text-red-500"
                        size={24}
                        onClick={() => onDelete(survey.id)}
                    />
                </div>
            </div>
        </div>
    );
}
// Основной компонент страницы
function AccountPage() {
    const [surveys, setSurveys] = useState([]); // Список анкет

    useEffect(() => {
        const mockSurveys = [
            { id: 1, title: " Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет  Привет Привет Привет ", isClosed: false },
            { id: 2, title: "Тест на пуджапикера", isClosed: true },
            { id: 3, title: "Анкета", isClosed: false },
            { id: 4, title: "Привет", isClosed: true },
            { id: 5, title: "Асалам алейкум", isClosed: false },
            { id: 6, title: "Дима сосиска", isClosed: true },
            { id: 7, title: "Голосование за лавочки на курилке в комнате ожиданий", isClosed: false },
            { id: 8, title: "123", isClosed: true }
        ];

        setSurveys(mockSurveys);
    }, []);

    // Функция для удаления анкеты
    const handleDelete = (id) => {
        const updatedSurveys = surveys.filter((survey) => survey.id !== id); // Удаляем анкету с указанным ID
        setSurveys(updatedSurveys); // Обновляем состояние
    };

    // Фильтруем анкеты
    const openSurveys = surveys.filter((survey) => !survey.isClosed);
    const closedSurveys = surveys.filter((survey) => survey.isClosed);

    return (
        <div className="ac-page">
            <div className="Nick">
                nickName
                <Link to="/AccountEdit">
                    <img
                        src={setting}
                        alt="setting img"
                        className="settingImg"
                        style={{ cursor: 'pointer' }}
                    />
                </Link>
            </div>

            {/* Раздел "Открытые" */}
            <div>
                <div className="type-qw">Открытые</div>
                <div className="Open-list">
                    {openSurveys.length > 0 ? (
                        openSurveys.map((survey) => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                isClosed={false}
                                onDelete={handleDelete} // Передаем функцию удаления
                            />
                        ))
                    ) : (
                        <p className="no-surveys">Нет открытых анкет</p>
                    )}
                </div>
            </div>

            {/* Раздел "Закрытые" */}
            <div>
                <div className="type-qw">Закрытые</div>
                <div className="Open-list">
                    {closedSurveys.length > 0 ? (
                        closedSurveys.map((survey) => (
                            <SurveyCard
                                key={survey.id}
                                survey={survey}
                                isClosed={true}
                                onDelete={handleDelete} // Передаем функцию удаления
                            />
                        ))
                    ) : (
                        <p className="no-surveys">Нет закрытых анкет</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AccountPage;