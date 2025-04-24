import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import apiClient from '../apiContent/apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import './create.css'; 

const EditSurveyPage = () => {
    const { id: questionnaireId } = useParams(); // ID анкеты
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('');
    const [dropdownsOpen, setDropdownsOpen] = useState({});
    const [deletedQuestionIds, setDeletedQuestionIds] = useState([]); // ID вопросов для удаления на сервере
    const [deletedOptionIds, setDeletedOptionIds] = useState([]);
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const questionRefs = useRef({});

    // Состояние для ошибок
    const [error, setError] = useState("");
    const [questionErrors, setQuestionErrors] = useState({});
    const [deleteError, setDeleteError] = useState(null);

    const options = ["Открытый", "Закрытый", "Множественный выбор", "Шкала"];
    const ANIMATION_DURATION = 450; // Длительность анимации

    const getQuestionIdentifier = (q) => q.id ?? q.tempId;
    const getAnswerIdentifier = (a) => a.id ?? a.tempId;

    const questionIndices = useMemo(() => {
        const indices = {};
        questions.forEach((q, index) => {
            indices[getQuestionIdentifier(q)] = index;
        });
        return indices;
    }, [questions]);

    const draggedIndex = useMemo(() => (draggedId ? questionIndices[draggedId] : -1), [draggedId, questionIndices]);

    const setQuestionRef = (id, element) => {
        if (!id) return;
        if (element) {
            questionRefs.current[id] = element;
        } else {
            delete questionRefs.current[id];
        }
    };

    const updateDisplayIds = (currentQuestions) => {
        return currentQuestions.map((q, index) => ({
            ...q,
            displayId: index + 1,
        }));
    };

    // Очистка состояния анимации 
    const clearAnimationState = useCallback((identifier) => {
        if (!identifier) return;
        setQuestions(prev => prev.map(q =>
            getQuestionIdentifier(q) === identifier && q.animationState
                ? { ...q, animationState: null }
                : q
        ));
    }, []);

    // Очистка всех состояний анимации 
    const clearAllAnimationStates = () => {
        setQuestions(prev => prev.map(q => ({ ...q, animationState: null })));
    };

    // Анимация появления новых блоков
    useEffect(() => {
        questions.forEach(q => {
            const identifier = getQuestionIdentifier(q);
            if (q.isNew && identifier) {
                const element = questionRefs.current[identifier];
                if (element) {
                    element.classList.add('question-enter');
                    requestAnimationFrame(() => {
                        element.classList.remove('question-enter');
                    });
                }
                const timer = setTimeout(() => {
                    setQuestions(prev => prev.map(pq =>
                        getQuestionIdentifier(pq) === identifier ? { ...pq, isNew: false } : pq
                    ));
                }, ANIMATION_DURATION);
                return () => clearTimeout(timer);
            }
        });
    }, [questions]);

    useEffect(() => {
        if (dragOverId === null) {
            setQuestions(prev => prev.map(q =>
                q.animationState?.startsWith('make-space') ? { ...q, animationState: null } : q
            ));
        }
    }, [dragOverId]);


    const questionTypeMapping = { "Открытый": 1, "Закрытый": 2, "Множественный выбор": 3, "Шкала": 4 };
    const getQuestionTypeText = (typeId) => {
        switch (typeId) {
            case 1: return "Открытый";
            case 2: return "Закрытый";
            case 3: return "Множественный выбор";
            case 4: return "Шкала";
            default: return "Неизвестный";
        }
    };

    // Загрузка данных анкеты
    useEffect(() => {
        if (questionnaireId) {
            fetchQuestionnaire(questionnaireId);
        }
    }, [questionnaireId]);

    const fetchQuestionnaire = async (qId) => {
        try {
            const response = await apiClient.get(`/questionnaire/${qId}`);
            const data = response.data;

            if (!data || !Array.isArray(data.questions)) {
                throw new Error("Некорректный формат данных анкеты.");
            }

            const processedQuestions = data.questions.map((q, index) => {
                let baseQuestion = {
                    id: q.id, // Backend ID
                    displayId: index + 1, // UI ID
                    type: getQuestionTypeText(q.questionTypeId),
                    text: q.text || "",
                    answers: q.options?.map(o => ({
                        id: o.id, // Backend ID
                        text: o.optionText || "",
                        isNew: false,
                    })) || [],
                    leftScaleValue: "",
                    rightScaleValue: "",
                    divisions: 5,
                    isNew: false, // Существующий вопрос
                    isDeleting: false,
                    animationState: null,
                };

                if (baseQuestion.type === "Шкала") {
                    const parts = baseQuestion.text.split('|');
                    baseQuestion.text = parts[0] || ""; // Текст вопроса
                    baseQuestion.leftScaleValue = parts[1] || "";
                    baseQuestion.rightScaleValue = parts[2] || "";
                    baseQuestion.divisions = parseInt(parts[3]) || 5;
                }

                return baseQuestion;
            });

            setTitle(data.title);
            setQuestions(processedQuestions);
        } catch (err) {
            console.error('Ошибка при загрузке анкеты:', err.response?.data || err.message);
            setError(`Не удалось загрузить анкету: ${err.message}`);
        }
    };

    const validateQuestions = () => {
        const errors = {};
        let isValid = true;

        if (!title.trim()) {
            setError("Название анкеты должно быть заполнено");
            isValid = false;
        } else if (title.length > 250) {
            setError("Название анкеты не может превышать 250 символов");
            isValid = false;
        } else {
            setError("");
        }

        questions.forEach((question) => {
            if (question.isDeleting) return;
            const identifier = getQuestionIdentifier(question);
            const errorKey = identifier;

            if (!question.text.trim() && question.type !== "Шкала") {
                errors[errorKey] = "Текст вопроса не может быть пустым";
                isValid = false;
            } else if (question.text.length > 250) {
                errors[errorKey] = "Текст вопроса не может превышать 250 символов";
                isValid = false;
            }

            if (question.type === "Шкала") {
                if (!question.leftScaleValue.trim() || !question.rightScaleValue.trim()) {
                    errors[errorKey] = "Значения шкалы должны быть заполнены";
                    isValid = false;
                } else if (question.leftScaleValue.length > 250 || question.rightScaleValue.length > 250) {
                    errors[errorKey] = "Значения шкалы не могут превышать 250 символов";
                    isValid = false;
                }
            }

            if (["Закрытый", "Множественный выбор"].includes(question.type)) {
                if (question.answers.filter(a => !a.isDeleting).length === 0) { // Проверяем не удаленные ответы
                    errors[errorKey] = "Необходимо добавить хотя бы один вариант ответа";
                    isValid = false;
                } else {
                    const emptyAnswers = question.answers.filter(a => !a.isDeleting && !a.text.trim());
                    if (emptyAnswers.length > 0) {
                        errors[errorKey] = "Варианты ответов не могут быть пустыми";
                        isValid = false;
                    } else {
                        const invalidAnswers = question.answers.filter(a => !a.isDeleting && a.text.length > 250);
                        if (invalidAnswers.length > 0) {
                            errors[errorKey] = "Варианты ответов не могут превышать 250 символов";
                            isValid = false;
                        }
                    }
                }
            }
        });

        setQuestionErrors(errors);
        return isValid;
    };

    const handleSave = async () => {
        clearAllAnimationStates();
        if (!validateQuestions()) {
            console.log("Ошибка валидации", questionErrors);
            return;
        }

        try {
            // 1. Обновить название анкеты
            await apiClient.put(`/questionnaire/${questionnaireId}/title`, { NewTitle: title });
            console.log("Название обновлено");

            const questionsToProcess = questions.filter(q => !q.isDeleting);
            const createdQuestionMap = {};

            // 2. Создать новые вопросы
            for (const question of questionsToProcess.filter(q => q.isNew)) {
                const tempId = getQuestionIdentifier(question);
                console.log(`Создание нового вопроса (tempId: ${tempId})...`);
                const questionPayload = {
                    Text: question.type === "Шкала"
                        ? `${question.text || ''}|${question.leftScaleValue || ""}|${question.rightScaleValue || ""}|${question.divisions || 5}`
                        : question.text,
                    QuestionType: questionTypeMapping[question.type],
                };
                const response = await apiClient.post(`/questionnaire/${questionnaireId}/questions/add-question`, questionPayload);
                const newBackendId = response.data.questionId;
                createdQuestionMap[tempId] = newBackendId;
                console.log(`Новый вопрос создан, ID: ${newBackendId}`);

                // Создать опции для нового вопроса
                if (["Закрытый", "Множественный выбор"].includes(question.type)) {
                    for (const answer of question.answers.filter(a => !a.isDeleting)) {
                        if (answer.text.trim()) {
                            console.log(`  Добавление опции "${answer.text}" к новому вопросу ${newBackendId}`);
                            await apiClient.post(`/questionnaire/${questionnaireId}/questions/${newBackendId}/options`, { OptionText: answer.text });
                        }
                    }
                }
            }

            // 3. Обновить существующие вопросы
            for (const question of questionsToProcess.filter(q => !q.isNew && q.id)) {
                const backendId = question.id;
                console.log(`Обновление вопроса ID: ${backendId}...`);
                const newText = question.type === "Шкала"
                    ? `${question.text || ''}|${question.leftScaleValue || ""}|${question.rightScaleValue || ""}|${question.divisions || 5}`
                    : question.text;

                await apiClient.put(`/questionnaire/${questionnaireId}/questions/${backendId}/text`, { NewText: newText });
                await apiClient.put(`/questionnaire/${questionnaireId}/questions/${backendId}/type`, { NewQuestionType: questionTypeMapping[question.type] });

                // Обновить/создать/удалить опции для существующего вопроса
                if (["Закрытый", "Множественный выбор"].includes(question.type)) {
                    for (const answer of question.answers) {
                        const answerId = getAnswerIdentifier(answer);
                        if (answer.isDeleting && answer.id) {
                            console.log(`  Удаление опции ID: ${answer.id} у вопроса ${backendId}`);

                            await apiClient.delete(`/questionnaire/${questionnaireId}/questions/${backendId}/options/${answer.id}`);
                        } else if (answer.isNew && !answer.isDeleting && answer.text.trim()) {
                            console.log(`  Добавление новой опции "${answer.text}" к вопросу ${backendId}`);
                            await apiClient.post(`/questionnaire/${questionnaireId}/questions/${backendId}/options`, { OptionText: answer.text });
                        } else if (!answer.isNew && !answer.isDeleting && answer.id && answer.text.trim()) {
                            console.log(`  Обновление опции ID: ${answer.id} у вопроса ${backendId}`);
                            await apiClient.put(`/questionnaire/${questionnaireId}/questions/${backendId}/options/${answer.id}`, { NewOptionText: answer.text });
                        }
                    }
                } else if (question.type === "Открытый" || question.type === "Шкала") {
                    for (const answer of question.answers.filter(a => a.id && !a.isNew)) {
                        console.log(`  Удаление лишней опции ID: ${answer.id} у вопроса ${backendId} (смена типа)`);
                        await apiClient.delete(`/questionnaire/${questionnaireId}/questions/${backendId}/options/${answer.id}`);
                    }
                }
            }

            for (const deletedId of deletedQuestionIds) {
                console.log(`Удаление вопроса ID: ${deletedId}...`);
                await apiClient.delete(`/questionnaire/${questionnaireId}/questions/${deletedId}`);
            }

            setDeletedQuestionIds([]);
            setDeletedOptionIds([]);
            navigate('/Account');

            // alert('Анкета успешно обновлена!');
            fetchQuestionnaire(questionnaireId);

        } catch (err) {
            console.error('Ошибка при сохранении анкеты:', err.response?.data || err.message);
            setError(`Ошибка при сохранении: ${err.response?.data?.title || err.message}`);
        }
    };

    const handleDragStart = useCallback((e, identifier) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(identifier);
        setTimeout(() => {
            const element = questionRefs.current[identifier];
            if (element) element.classList.add('dragging');
        }, 0);
    }, []);

    const handleDragOver = useCallback((e, targetIdentifier) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (targetIdentifier === draggedId) {
            if (dragOverId && dragOverId !== targetIdentifier) {
                clearAnimationState(dragOverId);
            }
            setDragOverId(null);
            return;
        }

        if (targetIdentifier !== dragOverId) {
            if (dragOverId) {
                clearAnimationState(dragOverId);
            }
            setDragOverId(targetIdentifier);
            const targetIndex = questionIndices[targetIdentifier];

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const direction = draggedIndex < targetIndex ? 'make-space-up' : 'make-space-down';
                setQuestions(prev => prev.map(q =>
                    getQuestionIdentifier(q) === targetIdentifier ? { ...q, animationState: direction } : q
                ));
            }
        }
    }, [draggedId, dragOverId, questionIndices, draggedIndex, clearAnimationState]);

    const handleDragLeave = useCallback((e, identifier) => {
        const container = questionRefs.current[identifier];
        if (container && !container.contains(e.relatedTarget)) {
            if (identifier === dragOverId) {
                clearAnimationState(identifier);
                setDragOverId(null);
            }
        }
    }, [dragOverId, clearAnimationState]);

    const handleDrop = useCallback((e, targetIdentifier) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetIdentifier) {
            if (dragOverId) clearAnimationState(dragOverId);
            setDragOverId(null);
            if (draggedId && questionRefs.current[draggedId]) {
                questionRefs.current[draggedId].classList.remove('dragging');
            }
            setDraggedId(null);
            return;
        }

        const targetIndex = questionIndices[targetIdentifier];
        if (draggedIndex === -1 || targetIndex === -1) return;

        clearAnimationState(targetIdentifier);

        setQuestions(prevQuestions => {
            const updatedQuestions = [...prevQuestions];
            const [draggedItem] = updatedQuestions.splice(draggedIndex, 1);
            const cleanDraggedItem = { ...draggedItem, animationState: null, isNew: draggedItem.isNew, isDeleting: false };
            updatedQuestions.splice(targetIndex, 0, cleanDraggedItem);
            return updateDisplayIds(updatedQuestions.map(q => ({ ...q, isDeleting: false })));
        });

        if (questionRefs.current[draggedId]) {
            questionRefs.current[draggedId].classList.remove('dragging');
        }
        setDraggedId(null);
        setDragOverId(null);
    }, [draggedId, draggedIndex, questionIndices, clearAnimationState]);

    const handleDragEnd = useCallback(() => {
        if (draggedId && questionRefs.current[draggedId]) {
            questionRefs.current[draggedId].classList.remove('dragging');
        }
        if (dragOverId) {
            clearAnimationState(dragOverId);
        }
        setDraggedId(null);
        setDragOverId(null);
    }, [draggedId, dragOverId, clearAnimationState]);


    // Добавление нового вопроса 
    const addNewQuestion = async () => {
        try {
            // Создаём новый вопрос на сервере
            const response = await apiClient.post(`/questionnaire/${questionnaireId}/questions/add-question`, {
                Text: "", // Пустой текст для нового вопроса
                QuestionType: questionTypeMapping["Открытый"], // По умолчанию тип "Открытый"
                Options: [] // Пустой список вариантов ответов
            });
            const newQuestionId = response.data.questionId; // Получаем ID нового вопроса
            // Добавляем новый вопрос в состояние
            const newQuestion = {
                id: newQuestionId,
                type: "Открытый",
                text: "",
                answers: []
            };
            setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
            console.log(`✅ Новый вопрос создан: ID = ${newQuestionId}`);
        } catch (error) {
            console.error('🔴 Ошибка при создании нового вопроса:', error.response?.data || error.message);
            alert('Не удалось создать новый вопрос.');
        }
    };

    // Перемещение стрелками
    const moveQuestion = useCallback((identifier, direction) => {
        const index = questionIndices[identifier];
        if (index === -1) return;

        let targetIndex = -1;
        let movingItemAnimState = null;
        let targetItemAnimState = null;

        if (direction === 'up' && index > 0) {
            targetIndex = index - 1;
            movingItemAnimState = 'levitate-up';
            targetItemAnimState = 'levitate-down';
        } else if (direction === 'down' && index < questions.length - 1) {
            targetIndex = index + 1;
            movingItemAnimState = 'levitate-down';
            targetItemAnimState = 'levitate-up';
        }

        if (targetIndex !== -1) {
            const targetIdentifier = getQuestionIdentifier(questions[targetIndex]);

            // 1. Установить анимацию
            setQuestions(prev => prev.map(q => {
                const currentId = getQuestionIdentifier(q);
                if (currentId === identifier) return { ...q, animationState: movingItemAnimState };
                if (currentId === targetIdentifier) return { ...q, animationState: targetItemAnimState };
                return q;
            }));

            // 2. Задержка и перестановка
            setTimeout(() => {
                setQuestions(prevQuestions => {
                    const currentIdx = prevQuestions.findIndex(q => getQuestionIdentifier(q) === identifier);
                    const currentTargetIdx = prevQuestions.findIndex(q => getQuestionIdentifier(q) === targetIdentifier);
                    if (currentIdx === -1 || currentTargetIdx === -1) return prevQuestions;

                    const updatedQuestions = [...prevQuestions];
                    [updatedQuestions[currentIdx], updatedQuestions[currentTargetIdx]] =
                        [updatedQuestions[currentTargetIdx], updatedQuestions[currentIdx]];
                    return updateDisplayIds(updatedQuestions);
                });

                // 3. Задержка и сброс анимации
                setTimeout(() => {
                    clearAnimationState(identifier);
                    clearAnimationState(targetIdentifier);
                }, ANIMATION_DURATION);

            }, 50);
        }
    }, [questions, questionIndices, clearAnimationState, ANIMATION_DURATION]);

    // Удаление вопроса
    const deleteQuestion = useCallback((identifier) => {
        if (questions.filter(q => !q.isDeleting).length <= 1) {
            setDeleteError("Нельзя удалить единственный вопрос");
            setTimeout(() => setDeleteError(null), 3000);
            return;
        }
        const questionToDelete = questions.find(q => getQuestionIdentifier(q) === identifier);

        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                getQuestionIdentifier(q) === identifier
                    ? { ...q, isDeleting: true, animationState: null }
                    : q
            )
        );

        if (questionToDelete && questionToDelete.id && !questionToDelete.isNew) {
            setDeletedQuestionIds(prev => [...new Set([...prev, questionToDelete.id])]);
        }

        setTimeout(() => {
            setQuestions(prevQuestions => {
                const remainingQuestions = prevQuestions.filter(q => getQuestionIdentifier(q) !== identifier);
                return updateDisplayIds(remainingQuestions);
            });
            delete questionRefs.current[identifier];
        }, ANIMATION_DURATION);
    }, [questions, ANIMATION_DURATION]);

    const handleOptionSelect = (identifier, option) => {
        setQuestions(
            questions.map((q) => {
                if (getQuestionIdentifier(q) === identifier) {
                    const isChoiceType = ["Закрытый", "Множественный выбор"].includes(option);
                    const needsDefaultAnswers = isChoiceType && q.answers.filter(a => !a.isDeleting).length === 0;
                    const defaultAnswers = [
                        { tempId: `a_${Date.now()}_1`, text: "", isNew: true, isDeleting: false },
                        { tempId: `a_${Date.now()}_2`, text: "", isNew: true, isDeleting: false }
                    ];

                    return {
                        ...q,
                        type: option,
                        // Добавить 2 пустых ответа, если тип - выбор и ответов нет
                        answers: isChoiceType
                            ? (needsDefaultAnswers ? defaultAnswers : q.answers)
                            : [], // Очистить ответы для не-выборных типов
                        leftScaleValue: option === "Шкала" ? q.leftScaleValue : "",
                        rightScaleValue: option === "Шкала" ? q.rightScaleValue : "",
                        divisions: option === "Шкала" ? q.divisions : 5,
                        animationState: null,
                    };
                }
                return q;
            })
        );
        // Очистить ошибку для этого вопроса
        setQuestionErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[identifier];
            return newErrors;
        });
        setDropdownsOpen(prev => ({ ...prev, [identifier]: false }));
    };

    // Добавление ответа
    const addAnswer = (questionIdentifier) => {
        setQuestions(
            questions.map((q) => {
                if (getQuestionIdentifier(q) === questionIdentifier) {
                    // Считаем только активные ответы
                    if (q.answers.filter(a => !a.isDeleting).length >= 10) {
                        setDeleteError("Нельзя добавить больше 10 ответов");
                        setTimeout(() => setDeleteError(null), 3000);
                        return q;
                    }
                    const newAnswer = {
                        tempId: `a_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                        id: null,
                        text: "",
                        isNew: true, // Флаг нового ответа
                        isDeleting: false,
                    };

                    return { ...q, answers: [...q.answers, newAnswer] };
                }
                return q;
            })
        );
        // Очистить ошибку, связанную с ответами
        if (questionErrors[questionIdentifier]?.includes("ответ")) {
            setQuestionErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[questionIdentifier];
                return newErrors;
            });
        }
    };

    // Удаление ответа
    const deleteAnswer = (questionIdentifier, answerIdentifier) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => {
                if (getQuestionIdentifier(q) === questionIdentifier) {
                    // Считаем активные ответы
                    if (q.answers.filter(a => !a.isDeleting).length <= 2) {
                        setDeleteError("Минимум 2 ответа");
                        setTimeout(() => setDeleteError(null), 3000);
                        return q;
                    }
                    const answerToDelete = q.answers.find(a => getAnswerIdentifier(a) === answerIdentifier);
                    const updatedAnswers = q.answers.map(a =>
                        getAnswerIdentifier(a) === answerIdentifier
                            ? { ...a, isDeleting: true }
                            : a
                    );
                    return { ...q, answers: updatedAnswers };
                }
                return q;
            })
        );
        // Очистить ошибку, связанную с ответами
        if (questionErrors[questionIdentifier]?.includes("ответ")) {
            setQuestionErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[questionIdentifier];
                return newErrors;
            });
        }
    };

    // Изменение текста ответа
    const handleAnswerChange = (questionIdentifier, answerIdentifier, newText) => {
        setQuestions(
            questions.map(q => {
                if (getQuestionIdentifier(q) === questionIdentifier) {
                    return {
                        ...q,
                        answers: q.answers.map(a =>
                            getAnswerIdentifier(a) === answerIdentifier
                                ? { ...a, text: newText }
                                : a
                        ),
                    };
                }
                return q;
            })
        );
        // Очистить ошибку пустого ответа при вводе
        if (newText.trim() && questionErrors[questionIdentifier]?.includes("пустыми")) {
            setQuestionErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[questionIdentifier];
                return newErrors;
            });
        }
    };

    // Изменение параметров шкалы
    const handleScaleChange = (identifier, field, value) => {
        setQuestions(prevQuestions => prevQuestions.map(q =>
            getQuestionIdentifier(q) === identifier ? { ...q, [field]: value } : q
        ));
        // Очистить ошибку шкалы
        if (questionErrors[identifier]?.includes("шкалы")) {
            setQuestionErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[identifier];
                return newErrors;
            });
        }
    };

    //  Формирование имени класса для контейнера вопроса
    const getQuestionContainerClassName = (question) => {
        let classes = ['question-container'];
        if (question.isDeleting) classes.push('question-exit-active');
        if (question.animationState) classes.push(question.animationState);
        // Класс 'dragging' добавляется отдельно через ref в handleDragStart
        return classes.join(' ');
    };


    return (
        <div className="survey-page">
            <div className="survey-title">
                <span>Название анкеты</span>
                <input
                    type="text"
                    placeholder="название"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength="250"
                    aria-label="Название анкеты"
                />
                {/* Отображение общей ошибки */}
                {error && <p className="error-message-create">{error}</p>}
            </div>

            {questions.filter(q => !q.isDeleting).map((question) => {
                const identifier = getQuestionIdentifier(question);
                // Считаем активные ответы для условий рендера
                const activeAnswers = question.answers?.filter(a => !a.isDeleting) || [];

                return (
                    <div
                        ref={(el) => setQuestionRef(identifier, el)}
                        className={getQuestionContainerClassName(question)}
                        key={identifier}
                        id={`question-${identifier}`}
                        draggable={!question.isDeleting && !question.animationState}
                        onDragStart={(e) => handleDragStart(e, identifier)}
                        onDragOver={(e) => handleDragOver(e, identifier)}
                        onDrop={(e) => handleDrop(e, identifier)}
                        onDragEnd={handleDragEnd}
                        onDragLeave={(e) => handleDragLeave(e, identifier)}
                    >
                        <div className="question">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    Тип вопроса
                                    <div className="dropdown">
                                        <button
                                            type="button"
                                            className="punkt"
                                            onClick={() =>
                                                setDropdownsOpen(prev => ({ ...prev, [identifier]: !prev[identifier] }))
                                            }
                                            aria-haspopup="listbox"
                                            aria-expanded={!!dropdownsOpen[identifier]}
                                            aria-controls={`dropdown-menu-${identifier}`}
                                            title="Выбрать тип вопроса"
                                            disabled={!!question.animationState} // Блокируем во время анимации
                                        >
                                            <div className={`punktGalka ${dropdownsOpen[identifier] ? "rotate" : ""}`}></div>
                                        </button>
                                        <ul
                                            className={`dropdown-menu ${dropdownsOpen[identifier] ? "open" : ""}`}
                                            id={`dropdown-menu-${identifier}`}
                                            role="listbox"
                                        >
                                            {options.map((option) => (
                                                <li
                                                    key={option}
                                                    onClick={() => handleOptionSelect(identifier, option)}
                                                    className="dropdown-item"
                                                    role="option"
                                                    aria-selected={question.type === option}
                                                >
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <span style={{ marginLeft: '5px', fontWeight: '500' }}>{question.type}</span>
                                </div>
                            </div>

                            {/* Текст вопроса */}
                            <input
                                type="text"
                                placeholder={question.type === "Шкала" ? "описание шкалы" : "текст вопроса"}
                                value={question.text}
                                onChange={(e) =>
                                    setQuestions(prev => prev.map(q =>
                                        getQuestionIdentifier(q) === identifier ? { ...q, text: e.target.value } : q
                                    ))
                                }
                                maxLength="250"
                                id={`question-text-${identifier}`}
                                aria-label={`Текст вопроса ${question.displayId}`}
                            />
                            {/* Отображение ошибки для текста вопроса */}
                            {questionErrors[identifier] && questionErrors[identifier].includes("Текст вопроса") && (
                                <p className="error-message-create">{questionErrors[identifier]}</p>
                            )}

                            {/* Варианты ответов */}
                            {["Закрытый", "Множественный выбор"].includes(question.type) && (
                                <div style={{ marginTop: '20px' }}>
                                    {question.answers?.filter(a => !a.isDeleting).map((answer, index) => {
                                        const answerIdentifier = getAnswerIdentifier(answer);
                                        return (
                                            <div
                                                key={answerIdentifier}
                                                className="answer-container"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder={`вариант ${index + 1}`}
                                                    value={answer.text}
                                                    onChange={(e) => handleAnswerChange(identifier, answerIdentifier, e.target.value)}
                                                    maxLength="250"
                                                    id={`answer-text-${identifier}-${answerIdentifier}`}
                                                    aria-label={`Вариант ответа ${index + 1} для вопроса ${question.displayId}`}
                                                />
                                                {activeAnswers.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteAnswer(identifier, answerIdentifier)}
                                                        title="Удалить этот вариант"
                                                        className="delete-button"
                                                        aria-label={`Удалить вариант ответа ${index + 1}`}
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {/* Отображение ошибки для ответов */}
                                    {questionErrors[identifier] && (questionErrors[identifier].includes("ответ") || questionErrors[identifier].includes("пустыми")) && (
                                        <p className="error-message-create">{questionErrors[identifier]}</p>
                                    )}
                                    {/* Ошибка добавления/удаления ответов */}
                                    {deleteError && <p className="error-message-create">{deleteError}</p>}
                                    <button
                                        type="button"
                                        className="add-button"
                                        onClick={() => addAnswer(identifier)}
                                        disabled={activeAnswers.length >= 10 || !!question.animationState}
                                        id={`add-answer-${identifier}`}
                                    >
                                        {activeAnswers.length >= 10 ? "Максимум вариантов" : "добавить вариант"}
                                    </button>
                                </div>
                            )}

                            {/* Параметры шкалы */}
                            {question.type === "Шкала" && (
                                <div style={{ marginTop: '20px' }}>
                                    <input
                                        type="text"
                                        placeholder="левое значение шкалы"
                                        value={question.leftScaleValue}
                                        onChange={(e) => handleScaleChange(identifier, "leftScaleValue", e.target.value)}
                                        maxLength="250"
                                        id={`left-scale-${identifier}`}
                                        style={{ marginBottom: '10px', width: 'calc(100% - 10px)' }}
                                        aria-label={`Левое значение шкалы для вопроса ${question.displayId}`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="правое значение шкалы"
                                        value={question.rightScaleValue}
                                        onChange={(e) => handleScaleChange(identifier, "rightScaleValue", e.target.value)}
                                        maxLength="250"
                                        id={`right-scale-${identifier}`}
                                        style={{ marginBottom: '10px', width: 'calc(100% - 10px)' }}
                                        aria-label={`Правое значение шкалы для вопроса ${question.displayId}`}
                                    />
                                    <div
                                        style={{ display: "flex", alignItems: "center", gap: "10px", color: "gray", fontSize: "16px", marginTop: '10px' }}
                                    >
                                        <label htmlFor={`divisions-${identifier}`} id={`label-divisions-${identifier}`}>
                                            количество делений:
                                        </label>
                                        <input
                                            id={`divisions-${identifier}`}
                                            type="number"
                                            min="2"
                                            max="10"
                                            value={question.divisions}
                                            onChange={(e) => handleScaleChange(identifier, "divisions", parseInt(e.target.value) || 2)}
                                            style={{ width: "60px", textAlign: "center", padding: '3px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            aria-labelledby={`label-divisions-${identifier}`}
                                        />
                                    </div>
                                    {/* Отображение ошибки для шкалы */}
                                    {questionErrors[identifier] && questionErrors[identifier].includes("шкалы") && (
                                        <p className="error-message-create">{questionErrors[identifier]}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Панель действий */}
                        <div className="action">
                            <button
                                type="button"
                                className="newBlock"
                                onClick={() => addNewQuestion(identifier)}
                                disabled={questions.filter(q => !q.isDeleting).length >= 10 || !!question.animationState}
                                style={{ opacity: questions.filter(q => !q.isDeleting).length >= 10 ? 0.5 : 1 }}
                                title={questions.filter(q => !q.isDeleting).length >= 10 ? "Достигнут лимит вопросов" : "Добавить новый вопрос после этого"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                </svg>
                                новый блок
                            </button>
                            <div className="swap">
                                <button
                                    type="button"
                                    onClick={() => moveQuestion(identifier, 'up')}
                                    disabled={question.displayId === 1 || !!question.animationState}
                                    style={{ opacity: (question.displayId === 1 || !!question.animationState) ? 0.3 : 1 }}
                                    aria-label="Переместить вопрос вверх"
                                    title="Переместить вверх"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveQuestion(identifier, 'down')}
                                    disabled={question.displayId === questions.filter(q => !q.isDeleting).length || !!question.animationState}
                                    style={{ opacity: (question.displayId === questions.filter(q => !q.isDeleting).length || !!question.animationState) ? 0.3 : 1 }}
                                    aria-label="Переместить вопрос вниз"
                                    title="Переместить вниз"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                                    </svg>
                                </button>
                                <span style={{ marginLeft: '5px' }}>переместить</span>
                            </div>
                            <button
                                type="button"
                                className="trash"
                                onClick={() => deleteQuestion(identifier)}
                                disabled={questions.filter(q => !q.isDeleting).length <= 1 || !!question.animationState}
                                style={{ opacity: (questions.filter(q => !q.isDeleting).length <= 1 || !!question.animationState) ? 0.3 : 1 }}
                                title={questions.filter(q => !q.isDeleting).length <= 1 ? "Нельзя удалить единственный вопрос" : "Удалить этот вопрос"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3V2h11v1z" />
                                </svg>
                                удалить
                            </button>
                        </div>
                    </div>
                )
            })}

            <div className="ButtonSaveContainer">
                <button
                    onClick={handleSave}
                    className="ButtonSave"
                    type="button"
                >
                    Сохранить изменения
                </button>
            </div>
        </div>
    );
};

export default EditSurveyPage;