import React from 'react';

import "./header.css";
import './reset.css';
import pictureMain from './../../img/pictureMain.png';
import imgMain2 from './../../img/imgMain2.png';
import Ellipse from './../../img/Ellipse.png';
import Group1 from './../../img/Group1.png';
import Group2 from './../../img/Group2.png';
import shkala from './../../img/shkala.png';
import shema from './../../img/shema.png';


function Header() {
    return (
        <>

            <header className="header1">

                <div className="header__wrapper">

                    <h1 className="header__title span">
                        <div className='desktop-only'>
                            <span>Начните</span>
                            <span>создавать</span>
                            <span>свои анкеты</span>
                            <span>прямо сейчас</span>
                        </div>
                        <div className='mobile-only'>
                            <span >Начните создавать</span>
                            <span >свои анкеты</span>
                            <span >прямо сейчас</span>
                        </div>
                    </h1>
                    <a href="#!" className="btn">Создать анкету</a>
                </div>
                <img src={pictureMain} alt="Project img" className="imgMain" />
                <img src={imgMain2} alt="Project img" className="imgMain2" />
                <a href="#!" className="btn2">Создать анкету</a>
            </header>

            <main className="section">
                <div className="containerBlock2">
                    <div className="content-wrapper">
                        <ul className="content-list">
                            <div className="instruction-text">

                                <div className='mobile_instruction'>
                                    <span>Используйте разные</span>
                                    <span>виды ответов</span>
                                </div>
                            </div>
                            <li className="content-list__item Pole">
                                Открытые
                                <a href="#!" className="poleMain">ваш ответ</a>
                            </li>
                            <li className="content-list__item inline-content">
                                <img src={Ellipse} alt="Project img" className="imgBlock" />
                                Закрытие
                            </li>
                            <li className="content-list__item inline-Group">
                                <img src={Group1} alt="Project img" className="imgBlock" />
                                C множественным
                            </li>
                            <li className="content-list__item inline-Group">
                                <img src={Group2} alt="Project img" className="imgBlock" />
                                выбором
                            </li>
                            <li className="content-list__item shkala">
                                Шкалы оценки
                            </li>
                            <li className="content-list__item shkala">
                                <img src={shkala} alt="Project img" className="imgShkala" />
                            </li>
                        </ul>
                        <div className="instruction-text">
                            <div className='desktop_instruction'>
                                Используйте<br />
                                разные виды<br />
                                ответов
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="section_view">
                <div className="shema__container">

                    <div className="shema__title">
                        <span>Просматривайте</span>
                        <span>ответы в удобном</span>
                        <span>формате</span>
                    </div>

                </div>

                <img src={shema} alt="Shema img" className="imgShema" />

            </section>

        </>
    );
}

export default Header;
