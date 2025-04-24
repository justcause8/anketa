import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../apiContent/apiClient";
import "./Analysis.css";

function LoadingSpinner() {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
        </div>
    );
}

function AnalysisPage() {
    const { id } = useParams();
    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedUsers, setExpandedUsers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestionnaire = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/questionnaire/${id}`);
                setQuestionnaire(response.data);
            } catch (error) {
                alert("Не удалось загрузить данные анкеты. Пожалуйста, попробуйте позже.");
                navigate("/account");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestionnaire();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="analysis-page">
                <LoadingSpinner />
            </div>
        );
    }

    if (!questionnaire || !Array.isArray(questionnaire.questions)) {
        return (
            <div className="analysis-page">
                <h1 className="analysis-title error-title">Ошибка</h1>
                <p className="error-message">
                    Анкета не найдена или в ней нет вопросов. Возможно, она была удалена.
                </p>
                <button onClick={() => navigate("/account")} className="btn-back">
                    Вернуться в аккаунт
                </button>
            </div>
        );
    }

    const groupAnswersByUser = () => {
        const users = {};
        questionnaire.questions.forEach((question) => {
            const questionIdentifier = question.id || question.text;
            if (question.answers && question.answers.length > 0) {
                question.answers.forEach((answer) => {
                    const userId = answer.userId || `anonymous_${Date.now()}_${Math.random()}`;
                    if (!users[userId]) {
                        users[userId] = {
                            userId: userId,
                            name: answer.isAnonymous ? "Анонимный пользователь" : (answer.userName || "Пользователь"),
                            answers: [],
                        };
                    }
                    let existingAnswerIndex = users[userId].answers.findIndex(
                        (ua) => ua.questionIdentifier === questionIdentifier
                    );
                    const currentAnswerText = answer.selectedOptionText || answer.text;
                    if (existingAnswerIndex !== -1) {
                        if (answer.selectedOptionText && currentAnswerText) {
                            if (users[userId].answers[existingAnswerIndex].answerText && currentAnswerText) {
                                users[userId].answers[existingAnswerIndex].answerText += `, ${currentAnswerText}`;
                            } else {
                                users[userId].answers[existingAnswerIndex].answerText = currentAnswerText;
                            }
                        }
                    } else {
                        users[userId].answers.push({
                            questionIdentifier: questionIdentifier,
                            questionText: question.text,
                            answerText: currentAnswerText || "Нет ответа",
                            createdAt: answer.createdAt,
                        });
                    }
                });
            }
        });
        Object.values(users).forEach(userData => {
            userData.answers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        return Object.values(users);
    };

    const userAnswers = groupAnswersByUser();

    const toggleUserAnswers = (userId) => {
        setExpandedUsers((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    return (
        <div className="analysis-page">
            <h1 className="analysis-title">{questionnaire.title || "Анализ ответов"}</h1>
            <p className="analysis-description">
                {questionnaire.description || "Просмотрите ответы пользователей на вопросы анкеты."}
            </p>
            <div className="users-container">
                {userAnswers.length > 0 ? (
                    userAnswers.map((user) => {
                        const isExpanded = !!expandedUsers[user.userId];
                        const lastAnswerTime = user.answers.length > 0 
                            ? new Date(user.answers[user.answers.length - 1].createdAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) 
                            : "Нет данных";
                        return (
                            <div key={user.userId} className={`user-block ${isExpanded ? "expanded" : ""}`}>
                                <div
                                    className="user-header"
                                    onClick={() => toggleUserAnswers(user.userId)}
                                    role="button"
                                    aria-expanded={isExpanded}
                                    aria-controls={`user-answers-${user.userId}`}
                                >
                                    <h3 className="user-name">{user.name}</h3>
                                    <span className="toggle-icon" aria-hidden="true"></span>
                                </div>
                                <div
                                    id={`user-answers-${user.userId}`}
                                    className="user-answers-wrapper"
                                >
                                    <div className="user-answers">
                                        {user.answers.map((answer, idx) => (
                                            <div key={idx} className="answer-item">
                                                <p className="answer-question">
                                                    {answer.questionText}
                                                </p>
                                                <p className="answer-text">
                                                    {answer.answerText}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Новый контейнер для времени */}
                                    <div className="user-footer">
                                        <small className="user-last-answered">
                                            Последнее обновление: {lastAnswerTime}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-answers-block">
                        <p>Пока нет ни одного ответа на эту анкету.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnalysisPage;