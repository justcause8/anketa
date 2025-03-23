import React, { useState } from "react";
import './Link.css';
import Copy from './../../img/copy.png';
import Arrow from './../../img/Arrow.png';
import QrIcon from './../../img/QrIcon.png';
import { Link } from 'react-router-dom';

function LinkQuestionnairePage() {
    const textToCopy = "https://i.pinimg.com/originals/e8/82/67/e88267a222de3b152d6aced055fc84a7.jpg";
    const [popup, setPopup] = useState({ visible: false, x: 0, y: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Обработчик для копирования текста
    const handleCopy = (event) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setPopup({ visible: true, x: event.clientX, y: event.clientY });
            setTimeout(() => setPopup({ ...popup, visible: false }), 2000);
        });
    };

    return (
        <div className="page-container">

            <div className="survey-pageLink">
                <div className="You">Ваша анкета создана!</div>

                <div className="survey-titleLink">
                    <span className="link-text">{textToCopy}</span>
                    <div className="button-group">
                        <img
                            src={QrIcon}
                            alt="QR"
                            className="QRButton"
                            onClick={() => setIsModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                        />
                        <img
                            src={Copy}
                            alt="Copy link"
                            className="Copy"
                            onClick={handleCopy}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                </div>

                {/* Модальное окно */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <span className="close-modal" onClick={() => setIsModalOpen(false)}>
                                &times;
                            </span>
                            <h3>QR-код</h3>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${textToCopy}`}
                                alt="QR Code"
                                className="qr-image"
                            />
                        </div>
                    </div>
                )}
                <Link to="/Account">

                    <div className="HomeLink">
                        <span>

                            Личный кабинет
                            <img src={Arrow} alt="Arrow link" className="Arrow" />

                        </span>
                    </div>
                </Link>
                {/* Всплывающее сообщение*/}
                {popup.visible && (
                    <div className="copy-popup" style={{ top: popup.y + 10, left: popup.x + 10 }}>
                        Скопировано!
                    </div>
                )}
            </div>
        </div>
    );
}

export default LinkQuestionnairePage;