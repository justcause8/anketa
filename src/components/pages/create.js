import React, { useState } from 'react';
import apiClient from '../apiContent/apiClient';
import './create.css';
// import { Link } from 'lucide-react';
import { Link } from 'react-router-dom';

const SurveyPage = () => {
    const [questions, setQuestions] = useState([
        { id: 1, type: "Открытый", text: "", answers: [] },
    ]);
    const [draggedId, setDraggedId] = useState(null);
    const [dropdownsOpen, setDropdownsOpen] = useState({});

    const options = ["Открытый", "Закрытый", "Множественный выбор", "Шкала"];

    // Преобразование типа вопроса в числовой ID
    const getQuestionTypeId = (type) => {
        switch (type) {
            case "Открытый":
                return 1;
            case "Закрытый":
                return 2;
            case "Множественный выбор":
                return 3;
            case "Шкала":
                return 4;
            default:
                throw new Error("Неизвестный тип вопроса.");
        }
    };

    // Обработчик сохранения анкеты
    const handleSave = async () => {
        try {
            const title = document.querySelector('.survey-title input').value;
            if (!title) {
                alert('Введите название анкеты.');
                return;
            }

            const questionnaireId = await createQuestionnaire(title, questions);
            alert(`Анкета успешно создана! ID: ${questionnaireId}`);
        } catch (error) {
            console.error('Ошибка при сохранении анкеты:', error.response?.data || error.message);
            alert('Ошибка при сохранении анкеты.');
        }
    };

    // Функция для создания анкеты
    const createQuestionnaire = async (title, questions) => {
        try {
            const response = await apiClient.post('/questionnaire/create', {
                Title: title,
            });

            const questionnaireId = response.data.questionnaireId;

            // Добавляем вопросы к анкете
            for (const question of questions) {
                await addQuestion(questionnaireId, question);
            }

            return questionnaireId;
        } catch (error) {
            console.error('Ошибка при создании анкеты:', error.response?.data || error.message);
            throw error;
        }
    };

    // Функция для добавления вопроса
    const addQuestion = async (questionnaireId, question) => {
        try {
            await apiClient.post(`/questionnaire/${questionnaireId}/questions/add-question`, {
                Text: question.text,
                QuestionType: getQuestionTypeId(question.type),
                Options: question.answers?.map((a) => a.text) || [],
            });
        } catch (error) {
            console.error('Ошибка при добавлении вопроса:', error.response?.data || error.message);
            throw error;
        }
    };

    // Перетаскивание вопросов
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        if (draggedId === targetId) return;
        const updatedQuestions = [...questions];
        const draggedQuestion = updatedQuestions.find(q => q.id === draggedId);
        const targetIndex = updatedQuestions.findIndex(q => q.id === targetId);
        const draggedIndex = updatedQuestions.findIndex(q => q.id === draggedId);

        updatedQuestions.splice(draggedIndex, 1);
        updatedQuestions.splice(targetIndex, 0, draggedQuestion);

        const newQuestionsWithIds = updatedQuestions.map((question, index) => ({
            ...question,
            id: index + 1,
        }));
        setQuestions(newQuestionsWithIds);
    };

    const handleDragStart = (id) => {
        setDraggedId(id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Добавление нового вопроса
    const addNewQuestion = (id) => {
        const newQuestion = { type: "Открытый", text: "", answers: [] };
        const index = questions.findIndex(q => q.id === id);
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index + 1, 0, newQuestion);

        const newQuestionsWithIds = updatedQuestions.map((question, index) => ({
            ...question,
            id: index + 1,
        }));
        setQuestions(newQuestionsWithIds);
    };

    // Удаление вопроса
    const deleteQuestion = (id) => {
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            const updatedQuestions = [...questions];
            updatedQuestions.splice(index, 1);

            const newQuestionsWithIds = updatedQuestions.map((q, i) => ({
                ...q,
                id: i + 1,
            }));
            setQuestions(newQuestionsWithIds);
        }
    };

    // Изменение типа вопроса
    const handleOptionSelect = (id, option) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, type: option } : q
        ));
        setDropdownsOpen({ ...dropdownsOpen, [id]: false });
    };

    // Добавление ответа
    const addAnswer = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                const newAnswer = {
                    id: (q.answers?.length || 0) + 1,
                    text: "",
                };
                return {
                    ...q,
                    answers: [...(q.answers || []), newAnswer],
                };
            }
            return q;
        }));
    };

    // Удаление ответа
    const deletAnswer = (questionId) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    answers: q.answers.length > 0 ? q.answers.slice(0, -1) : [],
                };
            }
            return q;
        }));
    };

    return (
        <div className="survey-page">
            <div className="survey-title">
                <span>Название анкеты</span>
                <input type="text" placeholder="название" />
            </div>
            {questions.map((question) => (
                <div
                    className="question-container"
                    key={question.id}
                    id={`question-${question.id}`}
                    draggable
                    onDragStart={() => handleDragStart(question.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, question.id)}
                >
                    <div className="question">
                        Тип вопроса
                        <div className="dropdown">
                            <div
                                className="punkt"
                                onClick={() => setDropdownsOpen({ ...dropdownsOpen, [question.id]: !dropdownsOpen[question.id] })}
                            >
                                <div
                                    className={`punktGalka ${dropdownsOpen[question.id] ? 'rotate' : ''}`}
                                ></div>
                            </div>
                            {dropdownsOpen[question.id] && (
                                <ul className="dropdown-menu">
                                    {options.map((option, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleOptionSelect(question.id, option)}
                                            className="dropdown-item"
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {question.type}
                        <div className="numberQuestion">
                            Вопрос {question.id}
                        </div>
                        <input
                            type="text"
                            placeholder="вопрос"
                            value={question.text}
                            onChange={(e) =>
                                setQuestions(questions.map(q =>
                                    q.id === question.id ? { ...q, text: e.target.value } : q
                                ))
                            }
                            id={`question-text-${question.id}`}
                        />
                        {["Закрытый", "Множественный выбор"].includes(question.type) && (
                            <div>
                                {question.answers.map((answer) => (
                                    <div key={answer.id} className="answer-container" id={`answer-${answer.id}`}>
                                        <input
                                            type="text"
                                            placeholder="ответ"
                                            value={answer.text}
                                            onChange={(e) =>
                                                setQuestions(questions.map(q =>
                                                    q.id === question.id ? {
                                                        ...q,
                                                        answers: q.answers.map(a =>
                                                            a.id === answer.id ? { ...a, text: e.target.value } : a
                                                        ),
                                                    } : q
                                                ))
                                            }
                                            id={`answer-text-${answer.id}`}
                                        />
                                    </div>
                                ))}
                                <button
                                    className="add-button"
                                    onClick={() => addAnswer(question.id)}
                                    id={`add-answer-${question.id}`}
                                >
                                    добавить ответ
                                </button>
                                {question.answers.length > 0 && (
                                    <button
                                        className="delete-button"
                                        onClick={() => deletAnswer(question.id)}
                                        id={`delete-answer-${question.id}`}
                                    >
                                        удалить ответ
                                    </button>
                                )}
                            </div>
                        )}
                        {question.type === "Шкала" && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="левое значение шкалы"
                                    id={`left-scale-${question.id}`}
                                />
                                <input
                                    type="text"
                                    placeholder="правое значение шкалы"
                                    id={`right-scale-${question.id}`}
                                />
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "gray", fontSize: "16px" }}>
                                    <label htmlFor={`divisions-${question.id}`} id={`label-divisions-${question.id}`}>
                                        количество делений
                                    </label>
                                    <input
                                        id={`divisions-${question.id}`}
                                        type="number"
                                        min="1"
                                        max="10"
                                        placeholder=""
                                        style={{ width: "50px", textAlign: "center" }}
                                        defaultValue="5"
                                        onInput={(e) => {
                                            const value = Math.max(0, Math.min(10, e.target.value));
                                            e.target.value = value;
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="action">
                        <div className="newBlock" onClick={() => addNewQuestion(question.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                            новый блок
                        </div>
                        <div className="trash" onClick={() => deleteQuestion(question.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                            </svg>
                            удалить
                        </div>
                    </div>
                </div>
            ))}

            <div className="ButtonSaveContainer">
                <Link to="/Linkk" onClick={handleSave} className="ButtonSave">Сохранить</Link>

                {/* <button onClick={handleSave} className="ButtonSave">
                    Сохранить
                </button> */}
            </div>
        </div>
    );
};

export default SurveyPage;