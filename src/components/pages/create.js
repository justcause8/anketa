import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './create.css';

const SurveyPage = () => {
    const [questions, setQuestions] = useState([
        { id: 1, type: "Открытый", text: "", answers: [] },
    ]);

    const [draggedId, setDraggedId] = useState(null);

    const [dropdownsOpen, setDropdownsOpen] = useState({}); // Состояние для каждого меню

    const options = ["Открытый", "Закрытый", "Множественный выбор", "Шкала"];

    // Драгон дроп
    const handleDrop = (e, targetId) => {
        e.preventDefault();

        if (draggedId === targetId) return;

        const updatedQuestions = [...questions];
        const draggedQuestion = updatedQuestions.find(q => q.id === draggedId);
        const targetIndex = updatedQuestions.findIndex(q => q.id === targetId);
        const draggedIndex = updatedQuestions.findIndex(q => q.id === draggedId);

        // Убираем перетаскиваемый элемент из старой позиции
        updatedQuestions.splice(draggedIndex, 1);
        // Вставляем его в новую позицию
        updatedQuestions.splice(targetIndex, 0, draggedQuestion);

        // Пересчитываем id для всех вопросов
        const newQuestionsWithIds = updatedQuestions.map((question, index) => ({
            ...question,
            id: index + 1,
        }));

        setQuestions(newQuestionsWithIds);
    };

    // Драгон дроп
    const handleDragStart = (id) => {
        setDraggedId(id); // Устанавливаем ID перетаскиваемого элемента
    };
    // Драгон дроп
    const handleDragOver = (e) => {
        e.preventDefault(); // Разрешаем перетаскивание
    };
    

    // Добавление нового вопроса под текущим
    const addNewQuestion = (id) => {
        const newQuestion = { type: "Открытый", text: "", answers: [] };
        const index = questions.findIndex(q => q.id === id);
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index + 1, 0, newQuestion);

        // Пересчет id для всех вопросов
        const newQuestionsWithIds = updatedQuestions.map((question, index) => ({
            ...question,
            id: index + 1,
        }));

        setQuestions(newQuestionsWithIds);
    };
    // Изменение типа вопроса
    const handleOptionSelect = (id, option) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, type: option } : q
        ));
        setDropdownsOpen({ ...dropdownsOpen, [id]: false }); 
    };

    // Переключение видимости меню для конкретного вопроса
    const toggleDropdown = (id) => {
        setDropdownsOpen({ ...dropdownsOpen, [id]: !dropdownsOpen[id] });
    };


    const moveQuestionUp = (id) => {
        const index = questions.findIndex(q => q.id === id);
        if (index > 0) {
            const updatedQuestions = [...questions];

            const questionElementUp = document.getElementById(`question-${id}`);
            const questionElementDown = document.getElementById(`question-${updatedQuestions[index - 1].id}`);

            questionElementUp.classList.add('move-up');
            questionElementDown.classList.add('move-down');

            setTimeout(() => {
                [updatedQuestions[index], updatedQuestions[index - 1]] = [updatedQuestions[index - 1], updatedQuestions[index]]; 
                setQuestions(updatedQuestions);

                const newQuestionsWithIds = updatedQuestions.map((q, i) => ({
                    ...q,
                    id: i + 1,
                }));
                setQuestions(newQuestionsWithIds);

                questionElementUp.classList.remove('move-up');
                questionElementDown.classList.remove('move-down');
            }, 70); 
        }
    };

    const moveQuestionDown = (id) => {
        const index = questions.findIndex(q => q.id === id);
        if (index < questions.length - 1) {
            const updatedQuestions = [...questions];

            const questionElementDown = document.getElementById(`question-${id}`);
            const questionElementUp = document.getElementById(`question-${updatedQuestions[index + 1].id}`);

            questionElementDown.classList.add('move-down');
            questionElementUp.classList.add('move-up');

            setTimeout(() => {
                [updatedQuestions[index], updatedQuestions[index + 1]] = [updatedQuestions[index + 1], updatedQuestions[index]]; 
                setQuestions(updatedQuestions);

                const newQuestionsWithIds = updatedQuestions.map((q, i) => ({
                    ...q,
                    id: i + 1,
                }));
                setQuestions(newQuestionsWithIds);

                questionElementDown.classList.remove('move-down');
                questionElementUp.classList.remove('move-up');
            }, 70); 
        }
    };


    const deleteQuestion = (id) => {
        const index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
            const delQuestions = [...questions]; 
            delQuestions.splice(index, 1); 

            const newQuestionsWithIds = delQuestions.map((q, i) => ({
                ...q,
                id: i + 1, 
            }));
            setQuestions(newQuestionsWithIds); // Обновляем состояние
        }
    };

    // Обновление текста ответа для вопроса "Множественный выбор"
    const updateAnswerText = (questionId, answerId, newText) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.answers) {
                return {
                    ...q,
                    answers: q.answers.map(a =>
                        a.id === answerId ? { ...a, text: newText } : a
                    ),
                };
            }
            return q;
        }));
    };

    // Добавление нового ответа для вопроса "Множественный выбор"
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

    // Удаление нового ответа для вопроса "Множественный выбор"
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
                <div className="question-container" key={question.id} id={`question-${question.id}`}
                    draggable
                    onDragStart={() => handleDragStart(question.id)} // Устанавливаем ID перетаскиваемого элемента
                    onDragOver={handleDragOver} // Разрешаем перетаскивание
                    onDrop={(e) => handleDrop(e, question.id)} // Отпускаем элемент на целевой позиции
                >
                    <div className="question">
                        Тип вопроса
                        <div className="dropdown">
                            <div
                                className="punkt"
                                onClick={() => toggleDropdown(question.id)} // Передаём id
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
                            id={`question-text-${question.id}`} // Уникальный id для input
                        />
                        {question.type === "Закрытый" && (
                            <div>
                                {question.answers.map((answer) => (
                                    <div key={answer.id} className="answer-container" id={`answer-${answer.id}`}>
                                        <input
                                            type="text"
                                            placeholder="ответ"
                                            value={answer.text}
                                            onChange={(e) =>
                                                updateAnswerText(question.id, answer.id, e.target.value)
                                            }
                                            id={`answer-text-${answer.id}`} // Уникальный id для каждого ответа
                                        />
                                    </div>
                                ))}

                                <button
                                    className="add-button"
                                    onClick={() => addAnswer(question.id)}
                                    id={`add-answer-${question.id}`} // Уникальный id для кнопки добавления ответа
                                >
                                    добавить ответ
                                </button>

                                {question.answers.length > 0 && (
                                    <button
                                        className="delete-button"
                                        onClick={() => deletAnswer(question.id)}
                                        id={`delete-answer-${question.id}`} // Уникальный id для кнопки удаления ответа
                                    >
                                        удалить ответ
                                    </button>
                                )}
                            </div>
                        )}

                        {question.type === "Множественный выбор" && (
                            <div>
                                {question.answers.map((answer) => (
                                    <div key={answer.id} className="answer-container" id={`answer-${answer.id}`}>
                                        <input
                                            type="text"
                                            placeholder="ответ"
                                            value={answer.text}
                                            onChange={(e) =>
                                                updateAnswerText(question.id, answer.id, e.target.value)
                                            }
                                            id={`answer-text-${answer.id}`} // Уникальный id для каждого ответа
                                        />
                                    </div>
                                ))}

                                <button
                                    className="add-button"
                                    onClick={() => addAnswer(question.id)}
                                    id={`add-answer-${question.id}`} // Уникальный id для кнопки добавления ответа
                                >
                                    добавить ответ
                                </button>

                                {question.answers.length > 0 && (
                                    <button
                                        className="delete-button"
                                        onClick={() => deletAnswer(question.id)}
                                        id={`delete-answer-${question.id}`} // Уникальный id для кнопки удаления ответа
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
                                    id={`left-scale-${question.id}`} // Уникальный id для левого значения шкалы
                                />
                                <input
                                    type="text"
                                    placeholder="правое значение шкалы"
                                    id={`right-scale-${question.id}`} // Уникальный id для правого значения шкалы
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
                        <div className="swap">
                            <svg
                                onClick={() => moveQuestionUp(question.id)}
                                xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                            </svg>

                            <svg
                                onClick={() => moveQuestionDown(question.id)}
                                xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                            </svg>
                            переместить
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
                <Link to="/Linkk" className="ButtonSave">Сохранить</Link>
            </div>
        </div>
    );

};

export default SurveyPage;
