import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Answers.css';

function AnswersPage() {
    const { id } = useParams(); // Получаем токен анкеты из URL
    const [author, setAuthor] = useState({ firstName: '', lastName: '' });
    const navigate = useNavigate();
    const [ansTitle, setAnsTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // Состояние для хранения текста ошибки

    useEffect(() => {
        const fetchQuestionnaire = async () => {
            try {
                const response = await axios.get(`https://localhost:7109/questionnaire/access/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                console.log('Полученные данные:', response.data);
                const { title, questions, author } = response.data; // Извлекаем данные об авторе

                if (!questions || !Array.isArray(questions)) {
                    console.error('Данные вопросов отсутствуют или имеют неверный формат:', response.data);
                    return;
                }

                // Сохраняем данные об авторе в состояние
                setAuthor(author || { firstName: '', lastName: '' });

                const processedQuestions = questions.map((q) => {
                    if (q.questionTypeId === 4) {
                        const parts = q.text.split('|');
                        if (parts.length < 4) {
                            console.warn(`Некорректный формат текста для вопроса с ID ${q.id}: ${q.text}`);
                            return q;
                        }
                        const text = parts[0] || "";
                        const leftScaleValue = parts[1] || "";
                        const rightScaleValue = parts[2] || "";
                        const divisions = parseInt(parts[3]) || 5;
                        return {
                            ...q,
                            text,
                            leftScaleValue,
                            rightScaleValue,
                            divisions,
                        };
                    }
                    return q;
                });

                setAnsTitle(title);
                setQuestions(processedQuestions);

                const initialAnswers = {};
                processedQuestions.forEach((q) => {
                    initialAnswers[q.id] = q.questionTypeId === 4 ? 5 : '';
                });
                setAnswers(initialAnswers);
            } catch (error) {
                console.error('Ошибка при загрузке анкеты:', error.response?.data || error.message);
                if (error.response?.status === 404) {
                    setError('Анкета закрыта или была удалена');
                } else {
                    setError('Произошла ошибка при загрузке анкеты.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestionnaire();
    }, [id]);

    const isValidAnswer = (questionId, answer) => {
        const question = questions.find((q) => q.id === questionId);
        if (!question) return false;
        switch (question.questionTypeId) {
            case 2: // Выбор одного варианта
                return question.options.some((option) => option.id === answer);
            case 3: // Множественный выбор
                return Array.isArray(answer) && answer.every((id) => question.options.some((option) => option.id === id));
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            for (const [questionId, answer] of Object.entries(answers)) {
                const question = questions.find((q) => q.id === parseInt(questionId));
                if (!question) continue;
                if (!isValidAnswer(question.id, answer)) {
                    setError(`Неверный ответ для вопроса ${question.text}`);
                    return;
                }
                let payload = null;
                switch (question.questionTypeId) {
                    case 1:
                        payload = { AnswerText: answer };
                        break;
                    case 2:
                        const selectedOption = question.options.find((opt) => opt.id === parseInt(answer, 10));
                        if (!selectedOption) {
                            console.error('Вариант ответа не найден:', answer);
                            return;
                        }
                        payload = { AnswerClose: selectedOption.order };
                        break;
                    case 3: // Множественный выбор
                        console.log('Тип answer:', typeof answer);
                        console.log('Сравнение с options:', question.options.map((opt) => opt.id));
                        // Проверяем, что ответы корректны
                        if (!Array.isArray(answer) || !answer.every((id) => question.options.some((option) => option.id === id))) {
                            console.error('Неверный формат ответов:', answer);
                            return;
                        }
                        // Формируем payload с массивом order выбранных вариантов
                        const selectedOrders = answer.map((id) => {
                            const option = question.options.find((opt) => opt.id === id);
                            if (!option) {
                                console.error('Вариант ответа не найден:', id);
                                return null;
                            }
                            return option.order;
                        });
                        // Проверяем, что все варианты были найдены
                        if (selectedOrders.some((order) => order === null)) {
                            console.error('Один или несколько вариантов ответа не найдены.');
                            return;
                        }
                        payload = { AnswerMultiple: selectedOrders };
                        break;
                    case 4:
                        payload = { AnswerScale: parseInt(answer, 10) };
                        break;
                    default:
                        console.warn(`Неизвестный тип вопроса: ${question.questionTypeId}`);
                        continue;
                }
                console.log('Отправляемый ответ:', { questionId, answer });
                console.log('Доступные варианты:', question.options);
                await axios.post(
                    `https://localhost:7109/questionnaire/access/${id}/questions/${questionId}/answer`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json', // Указываем тип контента
                        },
                    }
                );
            }
            navigate('/Thk', { state: { questionnaireId: id } });
        } catch (error) {
            console.error('Ошибка при отправке ответов:', error.response?.data || error.message);

            if (error.response?.status === 404) {
                setError('Анкета закрыта или была удалена.');
            } else {
                setError('Не удалось отправить ответы.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (questionId, optionId) => {
        setAnswers((prev) => {
            const currentAnswers = prev[questionId] || [];
            const updatedAnswers = currentAnswers.includes(optionId)
                ? currentAnswers.filter((id) => id !== optionId)
                : [...currentAnswers, optionId];
            return { ...prev, [questionId]: updatedAnswers };
        });
    };

    const renderQuestionInput = (question) => {
        switch (question.questionTypeId) {
            case 1: // Текстовый вопрос
                return (
                    <div className="otv-title">
                        <span>{question.text}</span>
                        <input
                            type="text"
                            placeholder="Ответ"
                            value={answers[question.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        />
                    </div>
                );
            case 2: // Выбор одного варианта
                return (
                    <div className="rad-title">
                        <span>{question.text}</span>
                        {(question.options || []).map((option) => (
                            <label key={option.id}>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.id}
                                    checked={answers[question.id] === option.id}
                                    onChange={() => setAnswers({ ...answers, [question.id]: parseInt(option.id, 10) })}
                                />
                                {option.optionText}
                            </label>
                        ))}
                    </div>
                );
            case 3: // Множественный выбор
                return (
                    <div className="checkbox-title">
                        <span className="text-qw">{question.text}</span>
                        {(question.options || []).map((option) => (
                            <label key={option.id} className="custom-checkbox">
                                <input
                                    type="checkbox"
                                    name={`question-${question.id}`}
                                    value={option.id}
                                    checked={(answers[question.id] || []).includes(option.id)}
                                    onChange={() => handleCheckboxChange(question.id, option.id)}
                                />
                                <span>{option.optionText}</span>
                            </label>
                        ))}
                    </div>
                );
            case 4: // Шкала
                return (
                    <div className="slider-title">
                        <div className="scale-title">
                            <span className="text-slider">{question.text}</span>
                            <p>{question.leftScaleValue}</p> <p>{question.rightScaleValue}</p>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    min="1"
                                    max={question.divisions}
                                    step="1"
                                    value={answers[question.id] || 5}
                                    onChange={(e) => setAnswers({ ...answers, [question.id]: parseInt(e.target.value) })}
                                    className="slider"
                                />
                                <div className="slider-labels">
                                    {Array.from({ length: question.divisions }, (_, i) => (
                                        <span key={i + 1} className="label">{i + 1}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="ans-page">
            {error && <div className="error-message-answers">{error}</div>}

            {!error && (
                <>
                    <div className="answers-title">
                        <span className="ans-title">{ansTitle}</span>
                        <span className="author-name">
                            {/* Автор: {author?.firstName || 'Неизвестно'} {author?.lastName || ''} */}
                        </span>
                    </div>

                    {questions.map((question) => (
                        <div key={question.id} className={`question-type-${question.questionTypeId}`}>
                            {renderQuestionInput(question)}
                        </div>
                    ))}

                    <div className="ButtonSaveContainer">
                        <button className="ButtonSave" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Отправка...' : 'Отправить'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AnswersPage;