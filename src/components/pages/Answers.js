import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Импортируем хук useParams
import './Answers.css';

function AnswersPage() {
    const { id } = useParams(); // Получаем ID анкеты из URL
    const [author] = useState({ firstName: '', lastName: '' });
    const [ansTitle, setAnsTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        const fetchQuestionnaire = async () => {
            try {
                const response = await axios.get(`/api/questionnaire/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });

                const { title, questions: fetchedQuestions } = response.data;
                setAnsTitle(title);
                setQuestions(fetchedQuestions);

                // Инициализация пустых ответов для каждого вопроса
                const initialAnswers = {};
                fetchedQuestions.forEach((q) => {
                    initialAnswers[q.Id] = q.QuestionTypeId === 4 ? 5 : ''; // Для шкалы ставим значение по умолчанию 5
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Ошибка при загрузке анкеты:', error.response?.data || error.message);
                alert('Не удалось загрузить анкету.');
            }
        };

        fetchQuestionnaire();
    }, [id]);

    return (
        <div className="ans-page">
            <div className="answers-title">
                <span className="ans-title">{ansTitle}</span>
                <span className="author-name">Автор: {author.firstName} {author.lastName}</span>
            </div>

            {questions.map((question) => (
                <div key={question.Id} className={`question-type-${question.QuestionTypeId}`}>
                    <span>{question.Text}</span>
                    {renderQuestionInput(question)}
                </div>
            ))}
        </div>
    );

    function renderQuestionInput(question) {
        switch (question.QuestionTypeId) {
            case 1: // Текстовый вопрос
                return (
                    <input
                        type="text"
                        placeholder="Ответ"
                        value={answers[question.Id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question.Id]: e.target.value })}
                    />
                );
            case 2: // Выбор одного варианта
                return (
                    <div>
                        {question.Options.map((option) => (
                            <label key={option.Id}>
                                <input
                                    type="radio"
                                    name={`question-${question.Id}`}
                                    value={option.Id}
                                    checked={answers[question.Id] === option.Id}
                                    onChange={() => setAnswers({ ...answers, [question.Id]: option.Id })}
                                />
                                {option.OptionText}
                            </label>
                        ))}
                    </div>
                );
            case 3: // Множественный выбор
                return (
                    <div>
                        {question.Options.map((option) => (
                            <label key={option.Id} className="custom-checkbox">
                                <input
                                    type="checkbox"
                                    name={`question-${question.Id}`}
                                    value={option.Id}
                                    checked={(answers[question.Id] || []).includes(option.Id)}
                                    onChange={() => handleCheckboxChange(question.Id, option.Id)}
                                />
                                <span>{option.OptionText}</span>
                            </label>
                        ))}
                    </div>
                );
            case 4: // Шкала
                return (
                    <div className="slider-container">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={answers[question.Id] || 5}
                            onChange={(e) => setAnswers({ ...answers, [question.Id]: parseInt(e.target.value) })}
                        />
                        <p>Текущая оценка: {answers[question.Id]}</p>
                    </div>
                );
            default:
                return null;
        }
    }

    function handleCheckboxChange(questionId, optionId) {
        setAnswers((prev) => {
            const currentAnswers = prev[questionId] || [];
            const updatedAnswers = currentAnswers.includes(optionId)
                ? currentAnswers.filter((id) => id !== optionId)
                : [...currentAnswers, optionId];
            return { ...prev, [questionId]: updatedAnswers };
        });
    }
}

export default AnswersPage;