document.addEventListener("DOMContentLoaded", () => {
    
    loadResponses(); // Загружаем ответы после загрузки страницы

    const ta = document.getElementById('user-input');
    ta.style.resize = 'none';
    
    // Дополнительно можно эмулировать поведение input
    ta.style.overflowY = 'hidden';
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
});

let responses = {}; // Объект для хранения данных с ответами

// Проверяем, есть ли сохранённое имя пользователя в локальном хранилище
let storedUserName = localStorage.getItem("userName");

// Если нет сохранённого значения, устанавливаем "Пользователь" по умолчанию
let userName = storedUserName ? storedUserName : "Пользователь";




// Проверяем, есть ли сохранённый пол пользователя в локальном хранилище
let storedUserGender = localStorage.getItem("userGender");

// Если нет сохранённого значения, устанавливаем "не определено"
let userGender = storedUserGender ? storedUserGender : "не_определен"; // Глобальная переменная для пола пользователя ("мужской" или "женский")



// Проверяем, есть ли сохранённая ссылка на аватарку пользователя в локальном хранилище
let storedUserAvatarURL = localStorage.getItem("userAvatarURL");

// Если нет сохранённого значения, устанавливаем ссылку по умолчанию
let userAvatarURL = storedUserAvatarURL ? storedUserAvatarURL : 'https://sun9-3.userapi.com/impg/Oe6G-yCq8KEP3Z19DcgwonXbwNfhB5DARTyflQ/m89IaVLxWh0.jpg?size=1080x1080&quality=95&sign=e42402995b711c049a2a105b07af8e9e&type=album';


let avatarUrlBot = 'Avrora.jpg';
let BotName = 'Аврора';





// Проверяем, есть ли сохранённый стиль общения в локальном хранилище
let storedStyleMode = localStorage.getItem("styleMode");

// Если нет сохранённого значения, устанавливаем "вежливая"
let styleMode = storedStyleMode ? storedStyleMode : "вежливая"; // Глобальная переменная для выбора стиля общения ("родная" или "вежливая")



function setupClearStorageShortcut() {
    document.addEventListener('keydown', (event) => {
        // Проверяем комбинацию Ctrl + F7
        if (event.ctrlKey && (event.code === 'F7' || event.keyCode === 118)) {
            event.preventDefault(); // Блокируем стандартное поведение
            // Запрос подтверждения
            if (confirm('Очистить всё локальное хранилище? Действие нельзя отменить!')) {
                localStorage.clear(); // Очищаем localStorage
                alert('Локальное хранилище очищено.');
            }
        }
    });
}

// Активировать обработчик
setupClearStorageShortcut();









// Функция для загрузки данных из файла "responses.json"
function loadResponses() {
    fetch("responses.json")  // Загружаем JSON файл
        .then(response => response.json()) // Парсим JSON-ответ
        .then(data => responses = data); // Сохраняем данные в переменную responses
}

// Функция для отправки сообщения пользователя
function sendMessage() {
    // Находим элемент текстового поля ввода по его ID ("user-input")
    let inputField = document.getElementById("user-input");

    // Получаем текст из поля ввода и убираем лишние пробелы с начала и конца
    let userText = inputField.value.trim();

    // Проверяем, пустой ли текст; если да, прерываем выполнение функции
    if (userText === "") return;

    // Обрабатываем текст пользователя через функцию formatMessage (асинхронная, возвращает промис),
    // которая форматирует текст (например, добавляет HTML для ссылок, изображений и т.д.)
    formatMessage(userText).then(formattedText => {
        // Добавляем отформатированное сообщение пользователя в чат, используя текущее имя пользователя (userName)
        appendMessage(userName, formattedText);

        // Очищаем поле ввода после отправки сообщения
        inputField.value = "";

        // Устанавливаем задержку в 500 миллисекунд перед тем, как бот ответит
        setTimeout(() => {
            // Вызываем функцию getResponse для получения ответа бота
            // Передаём userText дважды: первый раз для сравнения с вопросами,
            // второй раз как оригинальный текст для сохранения регистра в командах
            let reply = getResponse(userText, userText);

            // Анимируем появление ответа бота в чате
            animateBotMessage(reply);
        }, 500); // Задержка в 500 мс имитирует "человеческое" время реакции
    });
}   

// Добавляем обработчик событий на поле ввода
document.getElementById("user-input").addEventListener("keydown", function(event) {
    // Проверяем одновременное нажатие Ctrl + Enter
    if (event.ctrlKey && (event.key === "Enter" || event.keyCode === 13)) {
        event.preventDefault(); // Предотвращаем действие по умолчанию
        sendMessage(); // Вызываем функцию отправки сообщения
    }
});



 /**
 * Выбирает ответ бота на основе текста пользователя, разделяя вопрос и выражение с цифрами.
 * @param {string} userText - Текст, введенный пользователем.
 * @returns {string} - Ответ бота.
 */
function getResponse(userText) {
    // Регулярное выражение для поиска первой цифры в тексте пользователя
    const numberRegex = /\d/;
    // Находим индекс первой цифры в тексте, чтобы разделить вопрос на части
    const firstNumberIndex = userText.search(numberRegex);

    // Инициализируем переменные для хранения частей текста
    let questionPrefix = userText; // Часть текста до первой цифры (например, "сколько будет")
    let expressionPart = "";       // Часть текста с цифрами и операторами (например, "2 + 3")

    // Если в тексте есть цифра, разделяем его на две части
    if (firstNumberIndex !== -1) {
        questionPrefix = userText.substring(0, firstNumberIndex).trim(); // До цифры, убираем лишние пробелы
        expressionPart = userText.substring(firstNumberIndex).trim();    // От цифры и дальше
    }

    // Перебираем все ключи в объекте responses из файла responses.json
    for (let key in responses) {
        // Проверяем, начинается ли соответствующая часть текста с одного из вопросов в responses.json
        if (responses[key].questions.some(question => 
            (firstNumberIndex === -1 ? userText : questionPrefix).toLowerCase().startsWith(question.toLowerCase())
        )) {
            // Получаем объект с ответами для текущего стиля общения
            let answersObj = responses[key].answers;

            // Проверяем, есть ли ответы для текущего стиля (например, "родная")
            if (answersObj && answersObj[styleMode]) {
                let answers = answersObj[styleMode];
                // Выбираем ответы в зависимости от пола пользователя, если их нет — берем общие
                let possibleAnswers = answers[userGender] || answers;
                // Выбираем случайный ответ из массива возможных ответов
                let randomAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];

                // Обрабатываем команды в ответе, передавая нужную часть текста
                return processCommands(randomAnswer, expressionPart || userText);
            }
        }
    }

    // Если совпадений не найдено, возвращаем стандартный ответ для случаев "не понял"
    const noResponseAnswers = {
        "вежливая": [
            "Извините, я не поняла ваш вопрос.",
            "Могу ли я помочь вам чем-то еще?",
            "Я не совсем поняла, что вы имеете в виду. Можете переформулировать?",
            "К сожалению, у меня нет ответа на это. Давайте попробуем что-то другое.",
            "Прошу прощения, но я не знаю, как на это ответить."
        ],
        "родная": [
            "Эй, я не врубаюсь, о чем ты.",
            "Может, попробуем спросить по-другому?",
            "Чет не понимаю, попробуй перефразировать.",
            "Хм, я без понятия. Давай попробуем что-то другое.",
            "Ой, не знаю, как на это ответить."
        ]
    };

    // Выбираем случайный стандартный ответ в зависимости от стиля общения
    return noResponseAnswers[styleMode][Math.floor(Math.random() * noResponseAnswers[styleMode].length)];
}

/**
 * Обрабатывает команды в ответе бота (например, $calcbase) и заменяет их результатами.
 * @param {string} answer - Исходный ответ бота с командами.
 * @param {string} userText - Текст пользователя для обработки команд.
 * @returns {string} - Ответ с замененными командами.
 */
function processCommands(answer, userText) {
    // Регулярное выражение для поиска команд вида $command (например, $calcbase)
    const commandRegex = /\$(\w+)/g;
    let match;

    // Пока находятся команды в тексте ответа, обрабатываем их
    while ((match = commandRegex.exec(answer)) !== null) {
        const commandName = match[1]; // Извлекаем имя команды (например, "calcbase")
        const commandFunction = commandMap[commandName]; // Ищем функцию для этой команды в маппинге

        // Если функция для команды найдена
        if (commandFunction) {
            // Вызываем функцию, передавая ей текст пользователя и текущий ответ
            const result = commandFunction(userText, answer);
            // Заменяем команду в ответе на результат выполнения функции
            answer = answer.replace(`$${commandName}`, result);
        } else {
            // Если команда неизвестна, заменяем её на сообщение об ошибке
            answer = answer.replace(`$${commandName}`, "[Неизвестная команда]");
        }
    }

    // Возвращаем обработанный ответ с замененными командами
    return answer;
}

/**
 * Объект, связывающий команды (например, $calcbase) с их функциями.
 */
const commandMap = {
    "calcbase": calcbase, // Команда $calcbase, помогает производить простые вычисления.
    "calcage": calcage,    // Команда $calcage, считает возраст на основе д.р.
    "calcmedical": calcmedical, // Команда $calcmedical, считает завышение или занижение от нормы
    "todaypoem": todaypoem, // Команда $todaypoem, открывает страницу с сегодняшним катреном и дает ссылку на нее
    "detectgender": detectgender, // Команда $detectgender, устанавливает пол пользователя.
    "detectstylemode": detectstylemode, // Команда $detectstylemode, изменяет стиль общения бота.
    "detectusername": detectusername // Команда $detectUserName, устанавливает имя пользователя.
};


/**
 * Вычисляет арифметическое выражение из текста пользователя (например, "2 + 3").
 * @param {string} userText - Текст с выражением для вычисления.
 * @param {string} answer - Исходный ответ бота (не используется в текущей логике).
 * @returns {string} - Результат вычисления или сообщение об ошибке.
 */
function calcbase(userText, answer) {
    // Регулярное выражение для поиска арифметических выражений (например, "2 + 3" или "5.5 * 2")
    const calcRegex = /(\d*\.?\d+)\s*([+\-*/])\s*(\d*\.?\d+)/g;
    let expression = userText; // Копируем текст пользователя для обработки
    let match;

    // Пока находятся выражения в тексте, выполняем вычисления
    while ((match = calcRegex.exec(expression)) !== null) {
        const num1 = parseFloat(match[1]); // Первое число (может быть дробным)
        const operator = match[2];          // Оператор (+, -, *, /)
        const num2 = parseFloat(match[3]); // Второе число (может быть дробным)

        let result; // Переменная для хранения результата вычисления
        switch (operator) {
            case "+":
                result = num1 + num2; // Сложение
                break;
            case "-":
                result = num1 - num2; // Вычитание
                break;
            case "*":
                result = num1 * num2; // Умножение
                break;
            case "/":
                if (num2 === 0) return "Деление на ноль невозможно"; // Проверка деления на ноль
                result = num1 / num2; // Деление
                break;
            default:
                return "Неизвестный оператор"; // Если оператор не поддерживается
        }

        // Заменяем найденное выражение (например, "2 + 3") на результат (например, "5")
        expression = expression.replace(match[0], result);
        calcRegex.lastIndex = 0; // Сбрасываем индекс регулярного выражения для следующего поиска
    }

    // Проверяем, является ли итоговое выражение числом
    const finalResult = parseFloat(expression);
    if (!isNaN(finalResult)) {
        return finalResult.toString(); // Возвращаем результат как строку
    }

    // Если выражение не удалось вычислить, возвращаем сообщение об ошибке
    return "Не удалось найти выражение для вычисления";
}


// Функция для вычисления арифметических выражений
function calculateExpression(expression) {
    try {
        // Используем eval для вычислений (для простых выражений)
        let result = eval(expression); 

        // Если выражение корректное, возвращаем результат
        if (!isNaN(result)) {
            return result;
        } else {
            return "Ошибка в вычислениях";
        }
    } catch (error) {
        return "Ошибка в вычислениях";
    }
}

/**
 * Вычисляет возраст человека на основе даты рождения в формате дд.мм.гггг, дд/мм/гг и т.д.
 * @param {string} userText - Текст с датой рождения.
 * @param {string} answer - Исходный ответ бота (не используется в текущей логике).
 * @returns {string} - Возраст или сообщение об ошибке.
 */
function calcage(userText, answer) {
    // Регулярное выражение для поиска даты в форматах: дд.мм.гггг, дд/мм/гг, мм.дд.гг и т.д.
    const dateRegex = /(\d{1,2}[./]\d{1,2}[./](\d{4}|\d{2}))/;
    const match = userText.match(dateRegex);

    // Если дата не найдена, возвращаем ошибку
    if (!match) {
        return "Не удалось найти дату рождения в формате дд.мм.гггг или类似";
    }

    // Извлекаем дату из текста (например, "15.03.1990")
    const dateStr = match[0];
    // Разделяем строку по точкам или слэшам
    const separator = dateStr.includes(".") ? "." : "/";
    const parts = dateStr.split(separator);

    let day, month, year;
    // Определяем формат: дд.мм или мм.дд
    if (dateStr.match(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/)) {
        // Предполагаем, что формат дд.мм.гггг или дд/мм/гг
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1; // Месяцы в JS начинаются с 0
        year = parseInt(parts[2], 10);
    }

    // Если год двухзначный (например, "90"), преобразуем в полный
    if (year < 100) {
        year += year < 30 ? 2000 : 1900; // Если < 30 — 20xx, иначе 19xx
    }

    // Создаем объект даты рождения
    const birthDate = new Date(year, month, day);
    // Текущая дата (задаем как 22 февраля 2025 года)
    const today = new Date(2025, 1, 22); // Месяцы с 0, поэтому 1 = февраль

    // Проверяем валидность даты
    if (isNaN(birthDate.getTime()) || birthDate > today) {
        return "Некорректная дата рождения";
    }

    // Вычисляем разницу в годах
    let age = today.getFullYear() - birthDate.getFullYear();
    // Проверяем, был ли день рождения в этом году
    const hasBirthdayPassed = today.getMonth() > birthDate.getMonth() ||
                             (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    // Если день рождения еще не прошел, уменьшаем возраст на 1
    if (!hasBirthdayPassed) {
        age--;
    }

    // Возвращаем возраст как строку
    return age.toString();
}

/**
 * Функция для анализа медицинских норм.
 * Ищет первое число (значение) и два последующих числа (норма "от" и "до").
 * Вычисляет, во сколько раз значение превышает или занижено относительно нормы.
 */
function calcmedical(userText, answer) {
    // Глобальная переменная для выбора стиля общения
    let styleMode = "родная"; // Возможные значения: "родная", "вежливая"
    
    // Регулярное выражение для поиска чисел (включая десятичные через точку или запятую)
    const numberRegex = /\d+(?:[\.,]\d+)?/g;
    let numbers = userText.match(numberRegex);
    
    if (!numbers || numbers.length < 3) {
        return styleMode === "родная" 
            ? "Не удалось определить значение и норму. Пожалуйста, укажи три числа." 
            : "Не удалось определить значение и норму. Пожалуйста, укажите три числа.";
    }
    
    // Преобразуем числа в float, заменяя запятую на точку
    let [value, normMin, normMax] = numbers.map(num => parseFloat(num.replace(",", ".")));
    
    if (isNaN(value) || isNaN(normMin) || isNaN(normMax)) {
        return styleMode === "родная"
            ? "Ошибка в данных. Пожалуйста, укажи корректные числовые значения."
            : "Ошибка в данных. Пожалуйста, укажите корректные числовые значения.";
    }
    
    // Проверяем, находится ли значение в пределах нормы
    if (value >= normMin && value <= normMax) {
        return styleMode === "родная"
            ? "Твой показатель в норме."
            : "Ваш показатель находится в норме.";
    }
    
    // Вычисляем, во сколько раз превышен или занижен показатель
    let deviation;
    if (value < normMin) {
        deviation = (normMin / value).toFixed(2);
        return styleMode === "родная"
            ? `Твой показатель занижен в ${deviation} раз.`
            : `Ваш показатель занижен в ${deviation} раз.`;
    } else {
        deviation = (value / normMax).toFixed(2);
        return styleMode === "родная"
            ? `Твой показатель превышает норму в ${deviation} раз.`
            : `Ваш показатель превышает норму в ${deviation} раз.`;
    }
}
/**
 * Открывает сегодняшнюю страницу с катреном.
 * @returns {string} - Ссылка на сегодняшнюю страницу с катреном в HTML формате.
 */
function todaypoem() {
    let today = new Date();
    let day = String(today.getDate()).padStart(2, "0"); 
    let month = String(today.getMonth() + 1).padStart(2, "0"); 
    let year = String(today.getFullYear()).slice(2); // Оставляем только последние две цифры года

    let formattedDate = `${day}.${month}.${year}`;
    let url = `https://blagayavest.info/poems/${formattedDate}.html`;
    
    // Открываем ссылку в новой вкладке
    window.open(url, "_blank");

    // Возвращаем ссылку в HTML формате
    return `<a href='${url}' target='_blank'>${url}</a> Если запрашиваемая страница не найдена, значит катрен еще не вышел.`;
}


/**
 * Устанавливает пол пользователя на основе ключевых слов в его сообщении.
 * @param {string} userText - Текст, введенный пользователем.
 * @param {string} answer - Исходный ответ бота (не используется в текущей логике).
 * @returns {string} - Сообщение о новом установленном поле.
 */
function detectgender(userText, answer) {
    const maleKeywords = ["мужчина", "муж.", "мужской", "мужик", "мальчик"];
    const femaleKeywords = ["женщина", "жен.", "женский", "девушка", "девочка"];

    let detectedGender = null;
    
    if (maleKeywords.some(word => userText.toLowerCase().includes(word))) {
        detectedGender = "мужской";
    } else if (femaleKeywords.some(word => userText.toLowerCase().includes(word))) {
        detectedGender = "женский";
    }

    if (detectedGender) {
        userGender = detectedGender;
        localStorage.setItem("userGender", detectedGender);
        return `Установлен пол: ${detectedGender}.`;
    }
    
    return "Пол не изменен.";
}

/**
 * Устанавливает стиль общения на основе ключевых слов в сообщении пользователя.
 * @param {string} userText - Текст, введенный пользователем.
 * @returns {string} - Сообщение о новом установленном стиле общения.
 */
function detectstylemode(userText) {
    const informalKeywords = ["давай на ты", "лучше на ты", "давай просто", "будь простой"];
    const formalKeywords = ["можно на вы", "лучше на вы", "давайте уважительно", "будьте вежливой"];

    let detectedStyle = null;

    if (informalKeywords.some(word => userText.toLowerCase().includes(word))) {
        detectedStyle = "родная";
    } else if (formalKeywords.some(word => userText.toLowerCase().includes(word))) {
        detectedStyle = "вежливая";
    }

    if (detectedStyle) {
        styleMode = detectedStyle;
        localStorage.setItem("styleMode", detectedStyle);
        return `Стиль общения изменен на: ${detectedStyle}.`;
    }

    return "Стиль общения не изменен.";
}

/**
 * Устанавливает имя пользователя на основе ключевых слов в его сообщении.
 * @param {string} userText - Текст, введенный пользователем.
 * @returns {string} - Сообщение о новом установленном имени.
 */
function detectusername(userText) {
    // Массив ключевых слов, которые указывают на запрос установки имени
    const nameKeywords = ["мое имя", "обращайся ко мне", "зови меня"];

    // Перебираем каждое ключевое слово из массива
    for (let keyword of nameKeywords) {
        // Ищем позицию ключевого слова в тексте, игнорируя регистр (приводим к нижнему)
        let index = userText.toLowerCase().indexOf(keyword);

        // Если ключевое слово найдено (index не равен -1)
        if (index !== -1) {
            // Вычисляем начало текста имени: позиция после ключевого слова
            let possibleNameStart = index + keyword.length;

            // Извлекаем потенциальное имя из оригинального текста, убирая лишние пробелы
            let possibleName = userText.substring(possibleNameStart).trim();

            // Если имя не пустое, устанавливаем его
            if (possibleName) {
                // Присваиваем новое имя глобальной переменной userName с сохранением оригинального регистра
                userName = possibleName;

                // Сохраняем имя в локальное хранилище браузера для постоянного использования
                localStorage.setItem("userName", userName);

                // Возвращаем сообщение с подтверждением, включая установленное имя
                return `Хорошо, установлено имя: ${userName}.`;
            } else {
                // Если после ключевого слова ничего нет, просим указать имя
                return "Вы не указали имя. Попробуйте снова.";
            }
        }
    }

    // Если ни одно ключевое слово не найдено, возвращаем сообщение об ошибке
    return "Имя не изменено.";
}









document.getElementById("user-input").addEventListener("input", function () {
    let textarea = this;
    let text = textarea.value;

    // Регулярное выражение для поиска ссылок на изображения
    const imageRegex = /(?<!['"])(https?:\/\/[^\s]+?\.(jpg|jpeg|png|gif|webp|svg))(?!['"])/gi;
    
    // Регулярное выражение для поиска ссылок на сайты, исключая YouTube
    const youTubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+)/;
    const linkRegex = /(?<!['"<])(https?:\/\/(?!www\.youtube\.com|youtu\.be)[^\s]+)(?!['">])/gi;

    // Проверяем, есть ли уже обработанные элементы или YouTube-ссылка
    if (/<img\s+src=['"][^'"]+['"]>/i.test(text) || /<a\s+href=['"][^'"]+['"]>/i.test(text) || youTubeRegex.test(text)) {
        return; // Не трогаем текст, если это YouTube-ссылка
    }

    // Заменяем ссылки на изображения
    text = text.replace(imageRegex, "<img src='$1'>");
    
    // Заменяем ссылки на сайты, исключая YouTube
    text = text.replace(linkRegex, function(match) {
        return /<a\s+href=['"]/.test(text) ? match : `<a href='${match}' target='_blank'>${match}</a>`;
    });
    
    textarea.value = text;
});









// Функция для добавления сообщения с дополнительными элементами управления
async function appendMessage(sender, text) {
    // Получаем элемент для вывода чата (контейнер сообщений).
    let chatBox = document.getElementById("chat-box");

    // Получаем текущее время с помощью вспомогательной функции.
    let time = getCurrentTime();
    
    // Создаем контейнер для нового сообщения.
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container"); // Добавляем общий класс для контейнера сообщения.

    // В зависимости от отправителя, присваиваем класс для идентификации типа сообщения.
    if (sender === BotName) {
        messageContainer.classList.add("bot-message"); // Сообщение от бота.
    } else {
        messageContainer.classList.add("user-message"); // Сообщение от пользователя.
    }

    // Создаем элемент для аватара (картинка пользователя или бота).
    let avatarElement = document.createElement("img");
    avatarElement.classList.add("avatar"); // Применяем стиль для аватара.
    avatarElement.src = sender === BotName ? avatarUrlBot : userAvatarURL; // В зависимости от отправителя, выбираем URL для аватара.

    // Создаем элемент для отметок (например, галочки, подтверждающие отправку сообщения).
    let checkmarksElement = document.createElement("div");
    checkmarksElement.classList.add("checkmarks"); // Применяем стиль для отметок.
    checkmarksElement.innerHTML = `<span class="checkmark">✔</span><span class="checkmark">✔</span>`; // Вставляем две галочки.

    // Создаем элемент для отображения времени сообщения.
    let timeElement = document.createElement("div");
    timeElement.classList.add("message-time");
    timeElement.textContent = time; // Устанавливаем текст времени.

    // Создаем основной элемент для сообщения.
    let messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Создаем кнопку меню для обработки дополнительных действий с сообщением.
    let menuButton = createMenuButton(text, messageContainer);

    // Создаем контейнер для содержания сообщения.
    let contentSpan = document.createElement("span");
    contentSpan.className = "message-content"; // Применяем стиль для текста сообщения.

    // Заполняем основное сообщение с отправителем.
    messageElement.innerHTML = `<strong>${sender}:</strong> `;
    messageElement.appendChild(contentSpan); // Вставляем контейнер для текста сообщения.

    // Регулярное выражение для поиска ссылок на видео YouTube в тексте.
    const youTubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+)/;
    let match = text.match(youTubeRegex); // Применяем регулярное выражение для поиска ссылки.

    // Если найдено видео YouTube
    if (match) {
        // Извлекаем ID видео из ссылки.
        const videoId = match[0].match(/(?:v=|youtu\.be\/)([\w-]{11})/)[1];
        console.log("YouTube video ID:", videoId); // Логируем ID видео для отладки.

        // Создаем контейнер для встраивания iframe (YouTube видео).
        let iframeContainer = document.createElement("div");
        iframeContainer.style.position = "relative"; // Стили для контейнера iframe.
        iframeContainer.style.width = "100%";
        iframeContainer.style.height = "250px";
        iframeContainer.style.borderRadius = "15px";
        iframeContainer.style.overflow = "hidden";

        // Создаем сам iframe для встраивания видео.
        let iframe = document.createElement("iframe");
        iframe.width = "100%"; // Устанавливаем ширину iframe.
        iframe.height = "100%"; // Устанавливаем высоту iframe.
        iframe.src = `https://www.youtube.com/embed/${videoId}`; // Устанавливаем ссылку на видео.
        iframe.frameBorder = "0"; // Убираем рамки у iframe.
        iframe.allowFullscreen = true; // Разрешаем полноэкранный режим.
        iframe.style.borderRadius = "12px"; // Стили для округления углов.

        iframeContainer.appendChild(iframe); // Добавляем iframe в контейнер.
        contentSpan.appendChild(iframeContainer); // Добавляем контейнер в span с текстом сообщения.

        console.log("Final contentSpan content:", contentSpan.innerHTML); // Логируем результат в contentSpan для отладки.

        // Обработчик события загрузки iframe (когда видео полностью загружено).
        iframe.onload = () => {
            console.log("User iframe loaded"); // Логируем сообщение о загрузке iframe.
            // Скроллим чат, чтобы новое сообщение стало видимым.
            chatBox.scrollIntoView({ behavior: "smooth", block: "end" });
        };
    } else {
        // Если это обычный текст, просто вставляем его в contentSpan.
        contentSpan.innerHTML = text;
    }

    // Добавляем элементы в контейнер сообщения.
    messageContainer.appendChild(checkmarksElement); // Добавляем галочки.
    messageContainer.appendChild(timeElement); // Добавляем время.
    messageContainer.appendChild(messageElement); // Добавляем сам текст сообщения.
    messageContainer.appendChild(menuButton); // Добавляем кнопку меню.
    messageContainer.appendChild(avatarElement); // Добавляем аватар.

    // Вставляем контейнер сообщения в чат.
    chatBox.appendChild(messageContainer);
    // Скроллим чат, чтобы последнее сообщение стало видимым.
    chatBox.scrollIntoView({ behavior: "smooth", block: "end" });
}




// Функция для показа уведомления
function showNotification(message) {
    let notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = message;

    let notificationContainer = document.getElementById("notification-container");
    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 500); // Было 500, увеличено до 1500
    }, 2000); // Было 2000, увеличено до 3000
    
}


// Функция для получения текущего времени в формате чч:мм
function getCurrentTime() {
    let date = new Date();
    let hours = date.getHours().toString().padStart(2, '0'); // Форматируем часы
    let minutes = date.getMinutes().toString().padStart(2, '0'); // Форматируем минуты
    return `${hours}:${minutes}`; // Возвращаем время в формате чч:мм
}


// Функция для форматирования сообщений (обрабатывает ссылки, изображения, видео, аудио)
async function formatMessage(text) {
    console.log("formatMessage input:", text); // Отладка входного текста. Логируем исходное сообщение для проверки.

    // Регулярное выражение для поиска ссылок на видео YouTube в сообщении.
    const youTubeRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+)/;
    // Применяем регулярное выражение для поиска ссылки на YouTube.
    let match = text.match(youTubeRegex);

    // Если в тексте есть ссылка на YouTube
    if (match) {
        // Создаем HTML код для встраивания YouTube видео.
        let videoEmbed = createYouTubeEmbed(match[0]);
        // Заменяем ссылку на YouTube в тексте на соответствующий HTML элемент.
        let newText = text.replace(match[0], videoEmbed);
        console.log("formatMessage output (YouTube):", newText); // Отладка: логируем результат для видео.
        return newText.trim(); // Возвращаем новый текст с видео, убирая лишние пробелы.
    }

    // Проверка, является ли текст ссылкой на изображение.
    const isImage = await checkIfImage(text);
    // Если это изображение
    if (isImage) {
        // Создаем HTML элемент для отображения изображения с ограничением по ширине и высоте.
        let imageHtml = `<img src="${text}" alt="Изображение" style="max-width: 100%; max-height: 300px; display: block; margin: auto;">`;
        console.log("formatMessage output (Image):", imageHtml); // Отладка: логируем результат для изображения.
        return imageHtml; // Возвращаем HTML элемент изображения.
    }

    // Проверка, является ли текст ссылкой на аудиофайл.
    const isAudio = checkIfAudio(text);
    // Если это аудиофайл
    if (isAudio) {
        // Создаем HTML элемент для встраивания аудиоплеера.
        let audioHtml = createAudioPlayer(text);
        console.log("formatMessage output (Audio):", audioHtml); // Отладка: логируем результат для аудио.
        return audioHtml; // Возвращаем HTML элемент аудиоплеера.
    }

    // Если в тексте присутствуют символы новой строки (несколько строк текста)
    if (text.includes('\n')) {
        // Разбиваем текст на строки и заменяем символы новой строки на тег <br>, чтобы сохранить форматирование.
        let multiLineText = text.split('\n').join('<br>');
        console.log("formatMessage output (Multiline):", multiLineText); // Отладка: логируем результат для многострочного текста.
        return multiLineText; // Возвращаем многострочный текст с тегами <br>.
    }

    // Если ни одна из проверок не прошла, возвращаем исходный текст как есть (например, простой текст).
    console.log("formatMessage output (Plain):", text); // Отладка: логируем исходный текст.
    return text; // Возвращаем текст без изменений.
}






// Проверка, является ли ссылка видео с YouTube
function checkIfYouTube(url) {
    const youTubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
    return youTubeRegex.test(url);
}

// Создание встроенного YouTube-видео
function createYouTubeEmbed(url) {
    // Извлекаем идентификатор видео из URL
    const videoId = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)[1];
    return `
        <div style="
            position: relative;
            width: 100%;
            height: 250px;
            border-radius: 15px;
            overflow: hidden;
        ">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allowfullscreen
                style="border-radius: 12px;">
            </iframe>
        </div>`;
}

// Проверка, является ли ссылка аудиофайлом
function checkIfAudio(url) {
    return /\.(mp3|wav|ogg|m4a)$/i.test(url);
}

// Создание аудиоплеера с кнопкой управления
function createAudioPlayer(url) {
    // Генерируем уникальный идентификатор для аудиоплеера
    const audioId = `audio-${Math.random().toString(36).substr(2, 9)}`;
    return `
        <audio id="${audioId}" src="${url}" preload="none"></audio>
        <button onclick="toggleAudio('${audioId}')" 
                style="display: block; margin-top: 5px;">
            ▶️ Воспроизвести
        </button>`;
}

// Функция для управления воспроизведением аудио
function toggleAudio(audioId) {
    const audio = document.getElementById(audioId);
    // Если аудио на паузе, воспроизводим его, иначе останавливаем
    if (audio.paused) {
        audio.play();
        event.target.textContent = "⏸️ Остановить";
    } else {
        audio.pause();
        event.target.textContent = "▶️ Воспроизвести";
    }
}

// Функция для проверки, является ли ссылка изображением
function checkIfImage(url) {
    return new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(true);  // Если изображение загружено успешно, возвращаем true
        img.onerror = () => resolve(false); // Если произошла ошибка загрузки, возвращаем false
        img.src = url;
    });
}


// Функция для анимации печати ответа ИИ
async function animateBotMessage(text) {
    // Получаем элемент чата, куда будем добавлять сообщение
    let chatBox = document.getElementById("chat-box");

    // Создаем контейнер для сообщения бота
    let messageContainer = document.createElement("div");
    messageContainer.classList.add("message-container", "bot-message"); // Добавляем классы для стилизации

    // Создаем элемент для галочек
    let checkmarksElement = document.createElement("div");
    checkmarksElement.classList.add("checkmarks"); // Применяем класс для стилизации галочек
    checkmarksElement.innerHTML = `
        <span class="checkmark">✔</span>
        <span class="checkmark">✔</span>
    `; // Вставляем две галочки как HTML

    // Создаем элемент для времени отправки сообщения
    let timeElement = document.createElement("div");
    timeElement.classList.add("message-time"); // Класс для стилизации времени
    timeElement.textContent = getCurrentTime(); // Устанавливаем текущее время (например, "14:35")

    // Создаем элемент для текста сообщения
    let messageElement = document.createElement("div");
    messageElement.classList.add("message"); // Класс для стилизации текста сообщения

    // Добавляем имя отправителя (бота) в сообщение
    let senderSpan = document.createElement("strong");
    senderSpan.textContent = `${BotName}: `; // Имя бота выделено жирным
    messageElement.appendChild(senderSpan); // Добавляем имя в элемент сообщения

    // Создаем элемент для анимированного текста сообщения
    let textSpan = document.createElement("span");
    messageElement.appendChild(textSpan); // Добавляем его после имени отправителя

    // Создаем кнопку меню с дополнительными действиями (копировать, удалить)
    let menuButton = createMenuButton(text, messageContainer);

    // Создаем аватар бота
    let botAvatar = document.createElement("img");
    botAvatar.classList.add("avatar"); // Класс для стилизации аватара
    botAvatar.src = avatarUrlBot; // Устанавливаем URL аватара бота

    // Собираем все элементы в контейнер сообщения в нужном порядке
    messageContainer.appendChild(checkmarksElement); // Галочки идут первыми
    messageContainer.appendChild(timeElement); // Затем время
    messageContainer.appendChild(messageElement); // Затем текст сообщения
    messageContainer.appendChild(menuButton); // Кнопка меню
    messageContainer.appendChild(botAvatar); // Аватар в конце

    // Добавляем готовый контейнер сообщения в чат
    chatBox.appendChild(messageContainer);

    

    // Добавляем обработчик события наведения мыши на контейнер
    messageContainer.addEventListener('mouseenter', function handler() {
        checkmarksElement.classList.add('viewed'); // Добавляем класс "viewed", чтобы галочки стали синими
        // Удаляем обработчик после первого наведения, чтобы цвет не менялся обратно
        messageContainer.removeEventListener('mouseenter', handler);
    });

    // Форматируем текст сообщения (обрабатываем ссылки, изображения и т.д.)
    let formattedText = await formatMessage(text);

    // Проверяем, содержит ли текст медиа (видео, изображения, аудио)
    if (formattedText.includes("<iframe") || formattedText.includes("<img") || formattedText.includes("<audio")) {
        textSpan.innerHTML = formattedText; // Если есть медиа, сразу вставляем отформатированный текст
        let iframe = textSpan.querySelector("iframe"); // Ищем iframe (например, для YouTube)
        if (iframe) {
            // Ждем загрузки iframe и прокручиваем чат вниз
            iframe.onload = () => {
                setTimeout(() => {
                    messageContainer.scrollIntoView({ behavior: "smooth", block: "end" });
                }, 300); // Небольшая задержка для плавности
            };
        }
    } else {
        // Если медиа нет, запускаем анимацию текста
        animateText(textSpan, text, 0, 50, () => {
            messageContainer.scrollIntoView({ behavior: "smooth", block: "end" }); // Прокрутка после анимации
        });
    }

    // Обрабатываем загрузку изображений, если они есть
    let img = textSpan.querySelector("img");
    if (img) {
        img.addEventListener("load", () => {
            messageContainer.scrollIntoView({ behavior: "smooth", block: "end" }); // Прокрутка после загрузки изображения
        });
    }

    // Наблюдаем за изменением размера контейнера (например, при загрузке контента)
    const observer = new ResizeObserver(() => {
        messageContainer.scrollIntoView({ behavior: "smooth", block: "end" }); // Прокрутка при изменении размера
    });
    observer.observe(messageContainer); // Начинаем наблюдение
}


// Функция для создания кнопки меню с тремя точками
function createMenuButton(text, messageContainer) {
    // Создаем кнопку меню
    let menuButton = document.createElement("div");
    menuButton.classList.add("menu-button");
    menuButton.textContent = "⋮";

    // Создаем контекстное меню
    let contextMenu = document.createElement("div");
    contextMenu.classList.add("context-menu");
    contextMenu.style.display = "none"; // Изначально скрываем меню

    // Создаем кнопку копирования
    let copyButton = document.createElement("div");
    copyButton.classList.add("context-option", "copy-button"); // Новый класс для кнопки копирования
    let copyIcon = document.createElement("span");
    copyIcon.classList.add("copy-icon"); // Иконка для копирования
    copyIcon.textContent = "📋"; // Юникод иконки для копирования
    copyButton.appendChild(copyIcon); // Вставляем иконку в кнопку
    copyButton.appendChild(document.createTextNode("Копировать")); // Добавляем текст кнопки
    copyButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Предотвращаем всплытие, чтобы глобальный клик не закрыл меню сразу
        navigator.clipboard.writeText(text); // Копируем текст в буфер обмена
        showNotification("Скопировано"); // Показываем уведомление
        contextMenu.style.display = "none"; // Закрываем меню после копирования
    });

    // Создаем кнопку удаления
    let deleteButton = document.createElement("div");
    deleteButton.classList.add("context-option", "delete-button"); // Новый класс для кнопки удаления
    let deleteIcon = document.createElement("span");
    deleteIcon.classList.add("delete-icon"); // Иконка для удаления
    deleteIcon.textContent = "🗑️"; // Юникод иконки для корзины
    deleteButton.appendChild(deleteIcon); // Вставляем иконку в кнопку
    deleteButton.appendChild(document.createTextNode("Удалить")); // Добавляем текст кнопки
    deleteButton.addEventListener("click", () => {
        messageContainer.remove(); // Удаляем сообщение
        showNotification("Удалено"); // Показываем уведомление
    });

    // Добавляем кнопки в контекстное меню
    contextMenu.appendChild(copyButton);
    contextMenu.appendChild(deleteButton);

    // Добавляем обработчик клика на кнопку меню
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Останавливаем всплытие события
        contextMenu.style.display = contextMenu.style.display === "none" ? "block" : "none"; // Переключаем отображение меню
    });

    // Закрываем контекстное меню при клике вне его
    document.addEventListener("click", () => {
        contextMenu.style.display = "none";
    });

    // Добавляем контекстное меню внутрь кнопки меню
    menuButton.appendChild(contextMenu);
    return menuButton; // Возвращаем кнопку меню
}







// Функция для анимации текста
function animateText(element, text, index = 0, delay = 50, callback = null) {
    // Сохраняем оригинальный текст с тегами
    const originalText = text;
    // Формируем текст для анимации: заменяем <br> на \n и убираем теги <b> и <i>
    const animText = text
      .replace(/<br\s*\/?>(?!$)/g, '\n')
      .replace(/<\/?(b|i)>/g, '');
  
    if (index < animText.length) {
      // Поочерёдно добавляем символы из очищенного текста
      element.textContent += animText[index];
      document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
  
      // Если количество строк становится большим – сразу выводим оставшийся текст
      if (element.textContent.split('\n').length >= 5) {
        setTimeout(() => {
          element.textContent = animText;
          // При завершении анимации выводим оригинальный текст,
          // заменяя \n на <br>, чтобы восстановить разрывы строк,
          // а HTML-теги (<b>, <i>) уже будут работать
          element.innerHTML = linkify(originalText.replace(/\n/g, "<br>"));
          document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
          if (callback) callback();

          

        }, 250);
        return;
      }
  
      setTimeout(() => {
        animateText(element, originalText, index + 1, delay, callback);
      }, delay);
    } else {
      element.innerHTML = linkify(originalText.replace(/\n/g, "<br>"));
      document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
      if (callback) callback();
      // Прокручиваем чат после завершения анимации
      const chatBox = document.getElementById("chat-box");
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
  




// Функция для замены URL в тексте на кликабельные ссылки
function linkify(text) {
    let urlPattern = /(\bhttps?:\/\/[^\s]+)/g; // Регулярное выражение для поиска ссылок
    return text.replace(urlPattern, '$1'); // Заменяем на текст ссылки без HTML-атрибутов
}

// Функция для обработки нажатия клавиши "Enter" в поле ввода
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Функция для переключения отображения окна выбора смайликов
function toggleEmojiPicker() {
    let emojiPicker = document.getElementById("emoji-picker");
    emojiPicker.style.display = emojiPicker.style.display === "none" ? "block" : "none";
}

// Функция для выбора смайлика
function selectEmoji(emoji) {
    let inputField = document.getElementById("user-input");
    inputField.value += emoji; // Добавляем смайлик в поле ввода
    toggleEmojiPicker(); // Закрываем окно выбора смайликов
}

// Обработчик клика по документу, чтобы свернуть окно с эмодзи, если клик был вне его
document.addEventListener("click", (event) => {
    let emojiPicker = document.getElementById("emoji-picker");
    let emojiButton = document.getElementById("emoji-button");
    
    // Проверяем, был ли клик вне окна с эмодзи и кнопки для его открытия
    if (!emojiPicker.contains(event.target) && event.target !== emojiButton) {
        emojiPicker.style.display = "none"; // Закрываем окно эмодзи
    }
});


