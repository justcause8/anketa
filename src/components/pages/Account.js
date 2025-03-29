import React, { useState, useEffect } from 'react';
import './Account.css';
import setting from './../../img/settings.png';
import { Pencil, BarChart2, Lock, Unlock, Trash2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { getUserSurveys } from '../apiContent/apiClient'; // Импортируем API-клиент и метод getUserSurveys
import { getNicknameFromToken } from '../js/authUtils'; // Импортируем функцию для извлечения имени

// Компонент для отображения карточки анкеты
function SurveyCard({ survey, isClosed, onDelete, onEdit }) {
    const [isHovered, setIsHovered] = useState(false); // Состояние для отслеживания наведения

    // Функция для обрезки текста до maxLength символов
    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;

        let truncated = text.slice(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > 0) {
            truncated = truncated.slice(0, lastSpaceIndex);
        }

        return `${truncated}...`;
    };

    return (
        <div
            className="Open"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <h2
                className={`text-lg ${isHovered ? 'expanded' : ''}`}
                title={survey.title}
            >
                {isHovered
                    ? survey.title.length > 124
                        ? truncateText(survey.title, 124)
                        : survey.title
                    : truncateText(survey.title, 60)}
            </h2>
            <div className="cursorItems">
                <div className="left-cursor">
                    {/* Иконка редактирования */}
                    <Pencil
                        className="cursor-pointer hover:text-blue-500"
                        size={24}
                        onClick={() => onEdit(survey.id)} // Добавляем обработчик
                    />
                    <BarChart2 className="cursor-pointer hover:text-green-500" size={24} />
                    {isClosed ? (
                        <Lock className="cursor-pointer hover:text-gray-500" size={24} />
                    ) : (
                        <Unlock className="cursor-pointer hover:text-gray-500" size={24} />
                    )}
                </div>
                <div className="right-cursor">
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

// Основной компонент AccountPage
function AccountPage() {
    const [surveys, setSurveys] = useState([]); // Список анкет
    const [nickname, setNickname] = useState('Гость'); // Никнейм пользователя
    const navigate = useNavigate(); // Для навигации

    useEffect(() => {
        // Получаем список анкет
        const fetchSurveys = async () => {
            try {
                const userSurveys = await getUserSurveys(); // Используем метод getUserSurveys из apiClient
                setSurveys(userSurveys); // Устанавливаем данные из бэкенда
            } catch (error) {
                console.error('Не удалось загрузить анкеты:', error);
            }
        };

        // Получаем никнейм пользователя из токена
        const fetchNickname = () => {
            const nickname = getNicknameFromToken(); // Используем функцию из authUtils
            setNickname(nickname);
        };

        fetchSurveys(); // Загружаем анкеты при монтировании компонента
        fetchNickname(); // Получаем никнейм пользователя
    }, []);

    // Функция для удаления анкеты
    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/questionnaire/${id}`); // Удаляем анкету на бэкенде
            const updatedSurveys = surveys.filter((survey) => survey.id !== id); // Удаляем анкету из состояния
            setSurveys(updatedSurveys);
        } catch (error) {
            console.error('Ошибка при удалении анкеты:', error.response?.data || error.message);
            alert('Не удалось удалить анкету.');
        }
    };

    // Функция для редактирования анкеты
    const handleEdit = (id) => {
        navigate(`/edit-survey/${id}`); // Перенаправляем на страницу редактирования
    };

    // Фильтруем анкеты
    const openSurveys = surveys.filter((survey) => !survey.isClosed);
    const closedSurveys = surveys.filter((survey) => survey.isClosed);

    return (
        <div className="ac-page">
            {/* Блок с никнеймом */}
            <div className="Nick">
                <span>{nickname}</span>
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
                                onDelete={handleDelete}
                                onEdit={handleEdit} // Передаем функцию редактирования
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
                                onDelete={handleDelete}
                                onEdit={handleEdit} // Передаем функцию редактирования
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