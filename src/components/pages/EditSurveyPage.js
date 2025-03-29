import React, { useState, useEffect } from 'react';
import apiClient from '../apiContent/apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import './create.css';

const EditSurveyPage = () => {
  const { id } = useParams(); // ID анкеты
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]); // Список вопросов
  const [title, setTitle] = useState(''); // Название анкеты
  const [dropdownsOpen, setDropdownsOpen] = useState({}); // Состояние выпадающих списков
  const [deletedQuestions, setDeletedQuestions] = useState([]); // Список ID удаленных вопросов

  // Отображение строковых значений типов вопросов
  const options = ["Открытый", "Закрытый", "Множественный выбор", "Шкала"];

  // Маппинг строковых значений на числовые идентификаторы
  const questionTypeMapping = {
    "Открытый": 1,
    "Закрытый": 2,
    "Множественный выбор": 3,
    "Шкала": 4
  };

  // Преобразование числовых идентификаторов в текстовые значения
  const getQuestionTypeText = (id) => {
    switch (id) {
      case 1: return "Открытый";
      case 2: return "Закрытый";
      case 3: return "Множественный выбор";
      case 4: return "Шкала";
      default: return "Неизвестный";
    }
  };

  // Загрузка данных анкеты
  useEffect(() => {
    if (id) {
      fetchQuestionnaire(id);
    }
  }, [id]);

  const fetchQuestionnaire = async (questionnaireId) => {
    try {
      const response = await apiClient.get(`/questionnaire/${questionnaireId}`);
      console.log("Fetched questionnaire data:", response.data);
      const data = response.data;

      // Проверяем структуру данных
      if (!data || !data.questions) {
        throw new Error("Неверная структура данных: отсутствует поле 'questions'.");
      }
      if (!Array.isArray(data.questions)) {
        throw new Error("Поле 'questions' должно быть массивом.");
      }

      // Адаптируем данные под ожидаемый формат
      const { title, questions } = data;
      const processedQuestions = questions.map((q) => ({
        id: q.id, // API возвращает id, а не Id
        type: getQuestionTypeText(q.questionTypeId), // Используем questionTypeId
        text: q.text || "",
        answers: q.options?.map((o) => ({
          id: o.id, // API возвращает id, а не Id
          text: o.optionText || ""
        })) || [],
      }));

      setTitle(title);
      setQuestions(processedQuestions);
    } catch (error) {
      console.error('Ошибка при загрузке анкеты:', error.response?.data || error.message);
      alert('Не удалось загрузить анкету.');
    }
  };

  // Обработчик сохранения изменений
  const handleSave = async () => {
    try {
      if (!title) {
        alert('Введите название анкеты.');
        return;
      }

      // Обновляем название анкеты
      await apiClient.put(`/questionnaire/${id}/title`, { NewTitle: title });

      // Сначала создаем новые вопросы
      for (const question of questions) {
        if (question.isNew) {
          await createNewQuestion(parseInt(id), question);
        }
      }

      // Затем обновляем уже существующие вопросы
      for (const question of questions) {
        if (question.id && question.id > 0) {
          await updateQuestion(parseInt(id), question);
        }
      }

      // Удаляем вопросы
      for (const deletedQuestionId of deletedQuestions) {
        await apiClient.delete(`/questionnaire/${id}/questions/${deletedQuestionId}`);
      }

      // Очищаем список удаленных вопросов
      setDeletedQuestions([]);

      alert('Анкета успешно обновлена!');
    } catch (error) {
      console.error('Ошибка при сохранении анкеты:', error.response?.data || error.message);
      alert('Ошибка при сохранении анкеты.');
    }
  };

  // Функция для создания нового вопроса
  const createNewQuestion = async (questionnaireId, question) => {
    try {
      const response = await apiClient.post(`/questionnaire/${questionnaireId}/questions/add-question`, {
        Text: question.text,
        QuestionType: questionTypeMapping[question.type],
        Options: question.answers?.map(a => a.text) || []
      });

      const newQuestionId = response.data.questionId; // API вернул ID

      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.tempId === question.tempId
            ? { ...q, id: newQuestionId, tempId: undefined, isNew: false }
            : q
        )
      );

      console.log(`✅ Новый вопрос добавлен: ID = ${newQuestionId}`);
    } catch (error) {
      console.error('🔴 Ошибка при создании нового вопроса:', error.response?.data || error.message);
      throw error;
    }
  };

  // Функция для обновления вопроса
  const updateQuestion = async (questionnaireId, question) => {
    if (!question.id || question.id < 1) {
      console.warn(`Пропущено обновление вопроса: ${question.text} (ID не установлен)`);
      return;
    }
  
    try {
      // Обновляем текст вопроса
      await apiClient.put(`/questionnaire/${questionnaireId}/questions/${question.id}/text`, {
        NewText: question.text
      });
  
      // Обновляем тип вопроса
      await apiClient.put(`/questionnaire/${questionnaireId}/questions/${question.id}/type`, {
        NewQuestionType: questionTypeMapping[question.type]
      });
  
      // Если есть варианты ответов, обновляем их
      if (["Закрытый", "Множественный выбор"].includes(question.type)) {
        for (const answer of question.answers) {
          if (answer.isNew) {
            // Добавляем новый вариант ответа
            await apiClient.post(`/questionnaire/${questionnaireId}/questions/${question.id}/options`, {
              OptionText: answer.text
            });
          } else {
            // Обновляем существующий вариант ответа
            await apiClient.put(`/questionnaire/${questionnaireId}/questions/${question.id}/options/${answer.id}`, {
              NewOptionText: answer.text
            });
          }
        }
      }
  
      console.log(`✅ Вопрос успешно обновлен: ID = ${question.id}`);
    } catch (error) {
      console.error(`🔴 Ошибка при обновлении вопроса ${question.id}:`, error.response?.data || error.message);
      throw error;
    }
  };

  // const addNewQuestion = () => {
  //   const newQuestion = {
  //     tempId: Date.now(), // Временный ID для нового вопроса
  //     isNew: true,
  //     type: "Открытый",
  //     text: "",
  //     answers: []
  //   };
  //   setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
  // };

  const addNewQuestion = async () => {
    try {
      // Создаём новый вопрос на сервере
      const response = await apiClient.post(`/questionnaire/${id}/questions/add-question`, {
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

  // Удаление вопроса
  const deleteQuestion = (questionId) => {
    // Удаляем вопрос из состояния на клиенте
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);

    // Добавляем ID удаленного вопроса в список для последующего удаления на сервере
    if (questionId > 0) {
      setDeletedQuestions([...deletedQuestions, questionId]);
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
  // const addAnswer = (questionId) => {
  //   setQuestions(questions.map(q => {
  //     if (q.id === questionId) {
  //       const newAnswer = { id: Date.now(), text: "" }; // Временный ID для нового ответа
  //       return { ...q, answers: [...(q.answers || []), newAnswer] };
  //     }
  //     return q;
  //   }));
  // };
  const addAnswer = async (questionId) => {
    try {
      // Находим вопрос, к которому добавляем ответ
      const question = questions.find(q => q.id === questionId);
      if (!question) {
        console.error(`Вопрос с ID ${questionId} не найден.`);
        return;
      }
  
      // Создаём пустой вариант ответа на сервере
      const response = await apiClient.post(`/questionnaire/${id}/questions/${questionId}/options`, {
        OptionText: "" // Пустой текст для нового варианта ответа
      });
  
      const newOptionId = response.data.optionId; // Получаем ID нового варианта ответа
      const newAnswer = { id: newOptionId, text: "" }; // Создаём объект нового ответа
  
      // Обновляем состояние вопросов
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId
            ? { ...q, answers: [...(q.answers || []), newAnswer] }
            : q
        )
      );
  
      console.log(`✅ Новый вариант ответа добавлен: ID = ${newOptionId}`);
    } catch (error) {
      console.error('🔴 Ошибка при добавлении варианта ответа:', error.response?.data || error.message);
      alert('Не удалось добавить вариант ответа.');
    }
  };

  // Удаление ответа
  // const deleteAnswer = (questionId) => {
  //   setQuestions(questions.map(q => {
  //     if (q.id === questionId) {
  //       return { ...q, answers: q.answers.length > 0 ? q.answers.slice(0, -1) : [] };
  //     }
  //     return q;
  //   }));
  // };

  const deleteAnswer = async (questionId, answerId) => {
    try {
      // Удаляем вариант ответа с сервера
      await apiClient.delete(`/questionnaire/${id}/questions/${questionId}/options/${answerId}`);
  
      // Удаляем ответ из состояния
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId
            ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
            : q
        )
      );
  
      console.log(`✅ Вариант ответа удален: ID = ${answerId}`);
    } catch (error) {
      console.error('🔴 Ошибка при удалении варианта ответа:', error.response?.data || error.message);
      alert('Не удалось удалить вариант ответа.');
    }
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
        />
      </div>
      {questions.map((question, index) => (
        <div key={question.id || `temp-${index}-${Date.now()}`} className="question-container">
          <div className="question">
            Тип вопроса
            <div className="dropdown">
              <div
                className="punkt"
                onClick={() =>
                  setDropdownsOpen({
                    ...dropdownsOpen,
                    [question.id]: !dropdownsOpen[question.id],
                  })
                }
              >
                <div className={`punktGalka ${dropdownsOpen[question.id] ? 'rotate' : ''}`}></div>
              </div>
              {dropdownsOpen[question.id] && (
                <ul className="dropdown-menu">
                  {options.map((option) => (
                    <li
                      key={option}
                      onClick={() => handleOptionSelect(question.id, option)}
                      className="dropdown-item"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="numberQuestion">
              Вопрос {question.id}: {question.type}
            </div>
            <input
              type="text"
              placeholder="вопрос"
              value={question.text}
              onChange={(e) => setQuestions(prevQuestions =>
                prevQuestions.map(q =>
                  q.id === question.id ? { ...q, text: e.target.value } : q
                )
              )}
            />
            {["Закрытый", "Множественный выбор"].includes(question.type) && (
              <div>
                {question.answers.map((answer) => (
                  <div key={answer.id} className="answer-container">
                    <input
                      type="text"
                      placeholder="ответ"
                      value={answer.text}
                      onChange={(e) => setQuestions(prevQuestions =>
                        prevQuestions.map(q =>
                          q.id === question.id ? {
                            ...q,
                            answers: q.answers.map(a =>
                              a.id === answer.id ? { ...a, text: e.target.value } : a
                            ),
                          } : q
                        )
                      )}
                    />
                  </div>
                ))}
                <button
                  className="add-button"
                  onClick={() => addAnswer(question.id)}
                >
                  добавить ответ
                </button>
                {question.answers.length > 0 && (
                  <button
                    className="delete-button"
                    onClick={() => deleteAnswer(question.id)}
                  >
                    удалить ответ
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="action">
            <div className="newBlock" onClick={() => addNewQuestion()}>
              новый блок
            </div>
            <div className="trash" onClick={() => deleteQuestion(question.id)}>
              удалить
            </div>
          </div>
        </div>
      ))}
      <div className="ButtonSaveContainer">
        <button onClick={handleSave} className="ButtonSave">
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default EditSurveyPage;