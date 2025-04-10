const words = "it on set fact both way still could because govern present person she write be do than more day too take he hand such world long more over in develop too just and while people nation stand people change these may again she change should".split(' ')
const wordCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

function addClass(el, name) {
    if (el === null || name === null) return;
    if (el.className.includes(name)) return;

    el.className += ' ' + name;
    console.log(el);
}

function removeClass(el, name) {
    if (el === null || name === null) return;

    el.className = el.className.replace(name, '');
}

function randomWord() {
    const randomIndex = Math.ceil(Math.random() * wordCount);

    return words[randomIndex - 1]; 
}

function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</div>`;
}

function newGame() {
    document.getElementById("words").innerHTML = "";
    document.getElementById("info").innerHTML = gameTime/1000;

    for (let i = 0; i < 200; i++) {
        document.getElementById("words").innerHTML += formatWord(randomWord());
    }

    addClass(document.querySelector('.word'), "current");
    addClass(document.querySelector('.letter'), "current");
    
    const cursor = document.getElementById("cursor");
    cursor.style.top = document.querySelector('.letter').getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = document.querySelector('.letter').getBoundingClientRect().left + 'px';

    window.timer = null;
    removeClass(document.getElementById("game"), "over");
}

function getWpm() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const redLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return redLetters.length === 0 && correctLetters.length == letters.length;
    });

    return correctWords.length * (60*1000/gameTime);
}

function gameOver() {
    clearInterval(window.timer);
    addClass(document.getElementById("game"), "over");
    document.getElementById("info").innerHTML = `WPM: ${getWpm()}`;
}

document.getElementById('game').addEventListener('keyup', ev => {
    const key = ev.key;
    const currentLetter = document.querySelector('.letter.current');
    const currentWord = document.querySelector('.word.current');
    const expected = currentLetter !== null ? currentLetter.innerHTML.replace(" ", "") : "";
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === " ";
    const isBackspace = key === "Backspace";
    const cursor = document.getElementById("cursor");

    const isFirstLetter = currentLetter === currentWord.firstChild;

    if (document.querySelector('#game.over')) {
        return;
    }

    if (!window.timer && (isLetter || isSpace)  ) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            }

            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = (gameTime / 1000) - sPassed;
            if (sLeft <= 0) {
                gameOver();
                return;
            }
            document.getElementById("info").innerHTML = sLeft;
        }, 1000);
    }

    if (isLetter && currentLetter) {
        console.log(expected);
        console.log(currentLetter);

        addClass(currentLetter, expected === key ? "correct" : "incorrect");

        removeClass(currentLetter, "current");
        addClass(currentLetter.nextSibling, "current");
    } else if (isLetter) {
        const incorrectLetter = document.createElement('span');
        incorrectLetter.innerHTML = key;
        incorrectLetter.className = "letter incorrect extra";
        currentWord.appendChild(incorrectLetter);
    }

    if (isSpace) {
        if (expected !== " ") {
            const lettersToInvalidate = [...document.querySelectorAll(".word.current .letter:not(.correct)")];
            lettersToInvalidate.forEach(letter => {
                addClass(letter, "incorrect");
            });

            removeClass(currentWord, "current");
            addClass(currentWord.nextSibling, "current");
            addClass(currentWord.nextSibling.firstChild, "current");

            if (currentLetter) {
                removeClass(currentLetter, "current");  
            }
        }
    }

    if (isBackspace) {
        if (currentLetter && isFirstLetter && currentWord.previousSibling) {
            removeClass(currentWord, "current");
            addClass(currentWord.previousSibling, "current");
            removeClass(currentLetter, "current");
            addClass(currentWord.previousSibling.lastChild, "current");
            removeClass(currentWord.previousSibling.lastChild, "correct");
            removeClass(currentWord.previousSibling.lastChild, "incorrect");
        }

        if (currentLetter && currentLetter.previousSibling) {
            removeClass(currentLetter, "current");
            addClass(currentLetter.previousSibling, "current");
            removeClass(currentLetter.previousSibling, "correct");
            removeClass(currentLetter.previousSibling, "incorrect");
        }

        if (!currentLetter && currentWord) {
            addClass(currentWord.lastChild, "current");
            removeClass(currentWord.lastChild, "correct");
            removeClass(currentWord.lastChild, "incorrect");
        }
    }

    // move lines
    if (currentWord.getBoundingClientRect().top > 220) {
        const words = document.getElementById("words");
        const margin = parseInt(words.style.marginTop || 0);
        // words.style.marginTop = "-35px";
        words.style.marginTop = (margin - 35) + "px";
    }

    // move cursor
    const nextLetter = document.querySelector(".letter.current");
    const nextWord = document.querySelector('.word.current');
    
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
});

document.getElementById("newGameBtn").addEventListener("click", () => {
    gameOver();
    newGame();
});

newGame();