// ==UserScript==
// @name         Виртуальный помощник с FAQ
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет виртуального помощника с FAQ, структурированными по категориям.
// @author       Ваше имя
// @match        https://cplink.simprint.pro/*
// @icon         https://cplink.simprint.pro/axiom/img/icon/icon32.png
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function() {
    'use strict';
    // Создаем родительский контейнер для всех элементов виртуального помощника
    const faqContainer = document.createElement('div');
    faqContainer.id = 'faq-container';
    document.body.appendChild(faqContainer);
    const style = document.createElement('style');
    style.textContent = `
    /* Базовые стили */
    #faq-container * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    /* Стили кнопки помощника */
    #faq-container #virtual-assistant {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        cursor: pointer;
        border-radius: 50%;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    #faq-container #virtual-assistant:hover {
        transform: scale(1.1);
    }
    /* Стили модального окна */
    #faq-container #faq-modal {
        position: fixed;
        bottom: 80px;
        right: 90px;
        width: 350px;
        padding: 15px;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: none;
        transition: opacity 0.3s ease, transform 0.3s ease;
        overflow: hidden;
    }
    #faq-container #faq-modal h2 {
        margin-bottom: 15px;
        font-size: 18px;
        text-align: center;
    }
    #faq-container #faq-content {
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
        word-wrap: break-word;
    }
    /* Стили спиннера */
    .loader {
        font-size: 18px;
        color: #6c757d;
        text-align: center;
        margin: 20px auto;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
    }
    .loader::after {
        content: "Загрузка";
        animation: loading-dots 1.5s infinite;
    }
    @keyframes loading-dots {
        0% { content: "Загрузка"; }
        25% { content: "Загрузка."; }
        50% { content: "Загрузка.."; }
        75% { content: "Загрузка..."; }
        100% { content: "Загрузка.."; }
    }
    /* Стили категорий */
    #faq-container .category {
        margin-bottom: 10px;
    }
    #faq-container .category h3 {
        background-color: #e0f7fa;
        color: #007BFF;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s ease, transform 0.3s ease;
    }
    #faq-container .category h3:hover {
        background-color: #b3e5fc;
        transform: scale(1.02);
    }
    /* Стили вопросов */
    #faq-container .faq-tile {
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        word-wrap: break-word;
    }
    #faq-container .faq-tile:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
/* Стили для контейнера ответа */
.faq-answer {
ы    align-items: center; /* Выравнивание по вертикали */
    margin-top: 5px;
    font-size: 14px;
    color: #555;
    word-wrap: break-word;

}

/* Стили для иконки видео */
.video-icon {
    width: 20px; /* Размер иконки */
    height: 20px;
margin-left: 8px !important;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.video-icon:hover {
    transform: scale(1.1); /* Небольшое увеличение при наведении */
    opacity: 0.8; /* Небольшое затемнение */
}
        /* Стили всплывающего окна для изображений */
        #image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        #image-modal img {
            max-width: 50%;
            max-height: 50%;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        #image-modal button {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: #fff;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #image-modal button:hover {
            background-color: #f0f0f0;
        }
        /* Стили модального окна для видео */
        #faq-container #video-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        }
        #faq-container #video-modal iframe {
            width: 80%;
            height: 80%;
            border: none;
        }
        #faq-container #video-modal button {
            position: absolute;
            top: 20px;
            right: 20px;
            background-color: #fff;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        #faq-container #video-modal button:hover {
            background-color: #f0f0f0;
        }
    `;
    faqContainer.appendChild(style);
    // URL файла FAQ на GitHub
    const FAQ_URL = 'https://github.com/Xemul032/Pet/raw/refs/heads/main/faq.json';
    // Создаем кнопку виртуального помощника (изображение .webp)
    const assistantButton = document.createElement('img');
    assistantButton.id = 'virtual-assistant';
    assistantButton.src = 'https://klev.club/uploads/posts/2023-10/thumbs/1697447936_klev-club-p-trafareti-novogodnie-korgi-43.png'; // Укажите URL вашего .webp изображения
    assistantButton.style.position = 'fixed';
    assistantButton.style.bottom = '20px';
    assistantButton.style.right = '20px';
    assistantButton.style.width = '60px';
    assistantButton.style.height = '60px';
    assistantButton.style.cursor = 'pointer';
    assistantButton.style.borderRadius = '50%';
    assistantButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    assistantButton.style.transition = 'transform 0.3s ease'; // Анимация при наведении
    assistantButton.addEventListener('mouseenter', () => {
        assistantButton.style.transform = 'scale(1.1)';
    });
    assistantButton.addEventListener('mouseleave', () => {
        assistantButton.style.transform = 'scale(1)';
    });
    // Добавляем кнопку на страницу
    faqContainer.appendChild(assistantButton);
    // Создаем модальное окно для FAQ
    const modal = document.createElement('div');
    modal.id = 'faq-modal';
    modal.innerHTML = `
        <h2>FAQ</h2>
        <div id="faq-content" style="max-height: 400px; overflow-y: auto;"></div>
    `;
    faqContainer.appendChild(modal);
    // Создаем всплывающее окно для изображений
    const imageModal = document.createElement('div');
    imageModal.id = 'image-modal';
    imageModal.innerHTML = `
        <button id="zoom-button">🔍</button>
        <img id="modal-image" src="" alt="FAQ Image">
    `;
    faqContainer.appendChild(imageModal);
    // Создаем модальное окно для видео
    const videoModal = document.createElement('div');
    videoModal.id = 'video-modal';
    videoModal.innerHTML = `
        <button id="close-video">×</button>
        <iframe id="video-player" src="" frameborder="0" allowfullscreen></iframe>
    `;
    faqContainer.appendChild(videoModal);
    // Загружаем FAQ из файла на GitHub
    function loadFAQ() {
        const faqContent = document.getElementById('faq-content');
        faqContent.innerHTML = '<div class="loader"></div>'; // Показываем спиннер
        setTimeout(() => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: FAQ_URL,
                onload: function(response) {
                    try {
                        const faqData = JSON.parse(response.responseText);
                        renderFAQ(faqData);
                    } catch (error) {
                        console.error('Ошибка при загрузке FAQ:', error);
                        faqContent.innerHTML = '<p>Не удалось загрузить FAQ.</p>';
                    }
                },
                onerror: function(error) {
                    console.error('Ошибка сети:', error);
                    faqContent.innerHTML = '<p>Не удалось загрузить FAQ.</p>';
                }
            });
        }, 50); // Небольшая задержка для отрисовки спиннера
    }
    // Отображаем FAQ в модальном окне
    function renderFAQ(faqData) {
        const faqContent = document.getElementById('faq-content');
        const loader = faqContent.querySelector('.loader');
        if (loader) {
            loader.remove(); // Удаляем спиннер
        }
        faqContent.innerHTML = ''; // Очищаем контент
        faqData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.category;
            categoryTitle.addEventListener('click', () => {
                const questionsContainer = categoryDiv.querySelector('.questions');
                if (questionsContainer) {
                    questionsContainer.remove();
                } else {
                    document.querySelectorAll('.category .questions').forEach(container => container.remove());
                    renderCategoryQuestions(category.questions, categoryDiv);
                }
            });
            categoryDiv.appendChild(categoryTitle);
            faqContent.appendChild(categoryDiv);
        });
    }
    // Отображает вопросы категории
function renderCategoryQuestions(questions, parentElement) {
    const questionsContainer = document.createElement('div');
    questionsContainer.classList.add('questions');
    let activeQuestion = null;

    questions.forEach(item => {
        const questionTile = document.createElement('div');
        questionTile.classList.add('faq-tile');
        questionTile.innerHTML = `<strong>${item.question}</strong>`;

        questionTile.addEventListener('mousedown', () => {
            questionTile.style.transform = 'scale(0.98)';
            questionTile.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        });

        questionTile.addEventListener('mouseup', () => {
            questionTile.style.transform = 'scale(1)';
            questionTile.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });

        questionTile.addEventListener('click', (event) => {
            event.stopPropagation();
            const answer = questionTile.querySelector('.faq-answer');

            if (answer) {
                answer.remove();
                activeQuestion = null;
                return;
            }

            if (activeQuestion && activeQuestion !== questionTile) {
                const activeAnswer = activeQuestion.querySelector('.faq-answer');
                if (activeAnswer) {
                    activeAnswer.remove();
                }
            }

            const newAnswer = document.createElement('div');
            newAnswer.classList.add('faq-answer');
            newAnswer.innerHTML = item.answer;

                          // Если в ответе есть изображение
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image;
                    img.style.cursor = 'pointer';
                    img.style.maxWidth = '100%';
                    img.style.marginTop = '10px';

                    // Открываем всплывающее окно при клике на изображение
                    img.addEventListener('click', () => {
                        const modalImage = document.getElementById('modal-image');
                        modalImage.src = item.image;
                        modalImage.style.transform = 'scale(1)'; // Начинаем с размера 50%

                        const zoomButton = document.getElementById('zoom-button');
                        let isZoomed = false;

                        // Кнопка увеличения
                        zoomButton.onclick = () => {
                            if (isZoomed) {
                                modalImage.style.transform = 'scale(1)';
                            } else {
                                modalImage.style.transform = 'scale(2)';
                            }
                            isZoomed = !isZoomed;
                        };

                        // Показываем всплывающее окно
                        imageModal.style.display = 'flex';
                    });

                    newAnswer.appendChild(img);
                }

            if (item.video) {
                const videoIcon = document.createElement('img');
                videoIcon.classList.add('video-icon');
                videoIcon.src = 'https://github.com/Xemul032/Pet/blob/main/youtube.png?raw=true';
                videoIcon.style.cursor = 'pointer';
                videoIcon.addEventListener('click', () => {
                    const videoPlayer = document.getElementById('video-player');
                    videoPlayer.src = getEmbedUrl(item.video);
                    videoModal.style.display = 'flex';
                });
                newAnswer.appendChild(videoIcon);
            }

            questionTile.appendChild(newAnswer);
            activeQuestion = questionTile;
        });

        questionsContainer.appendChild(questionTile);
    });

    parentElement.appendChild(questionsContainer);
}
    // Функция для преобразования ссылки в embed-формат
    function getEmbedUrl(videoUrl) {
        if (videoUrl.includes('rutube.ru')) {
            const videoId = videoUrl.split('/video/')[1]?.split('/')[0];
            return `https://rutube.ru/play/embed/${videoId}`;
        } else if (videoUrl.includes('vk.com') || videoUrl.includes('vkvideo.ru')) {
            const match = videoUrl.match(/video(-?\d+)_(\d+)/);
            if (match) {
                const ownerId = match[1];
                const videoId = match[2];
                return `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}`;
            }
            console.error('Неверный формат ссылки на VK Video:', videoUrl);
            return null;
        } else if (videoUrl.includes('drive.google.com')) {
            const fileId = videoUrl.match(/file\/d\/([^/]+)/)?.[1];
            return `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (videoUrl.includes('youtube.com')) {
            const videoId = videoUrl.split('v=')[1];
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }
        console.error('Неизвестный формат ссылки:', videoUrl);
        return videoUrl; // Если формат не распознан, возвращаем исходную ссылку
    }
    // Показываем/скрываем модальное окно
    assistantButton.addEventListener('click', () => {
        if (modal.style.display === 'none' || modal.style.display === '') {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transform = 'translateY(0)';
            }, 10);
            loadFAQ(); // Загружаем FAQ при открытии окна
        } else {
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });

    // Закрываем модальное окно при клике вне его
    window.addEventListener('click', (event) => {
        if (!modal.contains(event.target) && event.target !== assistantButton) {
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });
    // Закрываем всплывающее окно для изображений при клике вне него
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    // Закрываем модальное окно для видео
    document.getElementById('close-video').addEventListener('click', () => {
        const videoModal = document.getElementById('video-modal');
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = ''; // Очищаем iframe
        videoModal.style.display = 'none';
    });
})();