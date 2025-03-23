// import React, { useState, useEffect } from 'react';
// import './Answers.css';

// function AnswersPage() {
//     const [author, setAuthor] = useState({ firstName: '', lastName: '' });
//     const [ansTitle, setAnsTitle] = useState(''); // Для названия анкеты
//     const [sliderValue, setSliderValue] = useState(5);
//     const [questionText, setQuestionText] = useState('');
//     const [answerText, setAnswerText] = useState('');
//     const [radioQuestion, setRadioQuestion] = useState('Выберите вариант:');
//     const [radioAnswer, setRadioAnswer] = useState('');
//     const [checkboxQuestion, setCheckboxQuestion] = useState('Выберите один или несколько вариантов:');
//     const [checkboxAnswers, setCheckboxAnswers] = useState([]);
//     const [sliderQuestion, setSliderQuestion] = useState('Оцените по шкале:');

//     useEffect(() => {
//         setAuthor({
//             firstName: 'Иван',
//             lastName: 'Иванов',
//         });
//         setAnsTitle('Анкета о сложной жизни');
//         setQuestionText('Какой ваш любимый цвет?');
//     }, []);

//     const handleCheckboxChange = (value) => {
//         setCheckboxAnswers((prev) =>
//             prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
//         );
//     };

//     return (
//         <div className="ans-page">
//             <div className="answers-title">
//                 <span className="ans-title">{ansTitle}</span>
//                 <span className="author-name">Автор: {author.firstName} {author.lastName}</span>
//             </div>

//             <div className="otv-title">
//                 <span>{questionText}</span>
//                 <input 
//                     type="text" 
//                     placeholder="Ответ" 
//                     value={answerText} 
//                     onChange={(e) => setAnswerText(e.target.value)}
//                 />
//             </div>

//             <div className="rad-title">
//                 <span>{radioQuestion}</span>
//                 <label>
//                     <input type="radio" name="question2" value="option1" onChange={(e) => setRadioAnswer(e.target.value)} />
//                     Ответ 1
//                 </label>
//                 <label>
//                     <input type="radio" name="question2" value="option2" onChange={(e) => setRadioAnswer(e.target.value)} />
//                     Ответ 2
//                 </label>
//                 <label>
//                     <input type="radio" name="question2" value="option3" onChange={(e) => setRadioAnswer(e.target.value)} />
//                     Ответ 3
//                 </label>
//             </div>

//             <div className="checkbox-title">
//                 <span className="text-qw">{checkboxQuestion}</span>
//                 <label className="custom-checkbox">
//                     <input type="checkbox" name="question2" value="option1" onChange={() => handleCheckboxChange('option1')} />
//                     <span>Ответ 1</span>
//                 </label>
//                 <label className="custom-checkbox">
//                     <input type="checkbox" name="question2" value="option2" onChange={() => handleCheckboxChange('option2')} />
//                     <span>Ответ 2</span>
//                 </label>
//                 <label className="custom-checkbox">
//                     <input type="checkbox" name="question2" value="option3" onChange={() => handleCheckboxChange('option3')} />
//                     <span>Ответ 3</span>
//                 </label>
//             </div>

//             <div className="slider-title">
//                 <div className="scale-title">
//                     <span className="text-slider">{sliderQuestion}</span>
//                     <div className="slider-container">
//                         <input
//                             type="range"
//                             min="0"
//                             max="9"
//                             step="1"
//                             value={sliderValue}
//                             onChange={(e) => setSliderValue(e.target.value)}
//                             className="slider"
//                         />
//                         <div className="slider-labels">
//                             {Array.from({ length: 10 }, (_, i) => (
//                                 <span key={i} className="label">{i}</span>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default AnswersPage;


import React, { useState, useEffect } from 'react';
import './Answers.css';

function AnswersPage() {
    const [author, setAuthor] = useState({ firstName: '', lastName: '' });
    const [ansTitle, setAnsTitle] = useState(''); 
    const [sliderValue, setSliderValue] = useState(5);
    const [questionText, setQuestionText] = useState('');
    const [answerText, setAnswerText] = useState('');
    const [radioAnswer, setRadioAnswer] = useState('');
    const [checkboxAnswers, setCheckboxAnswers] = useState([]);

    useEffect(() => {
        setAuthor({ firstName: 'Иван', lastName: 'Иванов' });
        setAnsTitle('Анкета о сложной жизни');
        setQuestionText('Какой ваш любимый цвет?');
    }, []);

    const handleCheckboxChange = (value) => {
        setCheckboxAnswers((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };

    return (
        <div className="ans-page">
            <div className="answers-title">
                <span className="ans-title">{ansTitle}</span>
                <span className="author-name">Автор: {author.firstName} {author.lastName}</span>
            </div>

            <div className="otv-title">
                <span>{questionText}</span>
                <input 
                    type="text" 
                    placeholder="Ответ" 
                    value={answerText} 
                    onChange={(e) => setAnswerText(e.target.value)}
                />
            </div>

            <div className="rad-title">
                <span>Выберите вариант:</span>
                <label>
                    <input type="radio" name="question2" value="option1" onChange={(e) => setRadioAnswer(e.target.value)} />
                    Ответ 1
                </label>
                <label>
                    <input type="radio" name="question2" value="option2" onChange={(e) => setRadioAnswer(e.target.value)} />
                    Ответ 2
                </label>
                <label>
                    <input type="radio" name="question2" value="option3" onChange={(e) => setRadioAnswer(e.target.value)} />
                    Ответ 3
                </label>
                <p>Выбранный вариант: {radioAnswer}</p>
            </div>

            <div className="checkbox-title">
                <span className="text-qw">Выберите один или несколько вариантов:</span>
                <label className="custom-checkbox">
                    <input type="checkbox" name="question2" value="option1" onChange={() => handleCheckboxChange('option1')} />
                    <span>Ответ 1</span>
                </label>
                <label className="custom-checkbox">
                    <input type="checkbox" name="question2" value="option2" onChange={() => handleCheckboxChange('option2')} />
                    <span>Ответ 2</span>
                </label>
                <label className="custom-checkbox">
                    <input type="checkbox" name="question2" value="option3" onChange={() => handleCheckboxChange('option3')} />
                    <span>Ответ 3</span>
                </label>
                <p>Выбранные варианты: {checkboxAnswers.join(', ')}</p>
            </div>

            <div className="slider-title">
                <div className="scale-title">
                    <span className="text-slider">Оцените по шкале:</span>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="9"
                            step="1"
                            value={sliderValue}
                            onChange={(e) => setSliderValue(e.target.value)}
                            className="slider"
                        />
                        <div className="slider-labels">
                            {Array.from({ length: 10 }, (_, i) => (
                                <span key={i} className="label">{i}</span>
                            ))}
                        </div>
                    </div>
                    <p>Текущая оценка: {sliderValue}</p>
                </div>
            </div>
        </div>
    );
}

export default AnswersPage;

