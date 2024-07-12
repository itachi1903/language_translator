const fromText = document.querySelector(".from-text"),
    toText = document.querySelector(".to-text"),
    exchageIcon = document.querySelector(".exchange"),
    selectTag = document.querySelectorAll("select"),
    icons = document.querySelectorAll(".row i"),
    historyBox = document.querySelector('.history-box'),
    translateBtn = document.querySelector("button");

function loadTranslationHistory() {
    const history = JSON.parse(localStorage.getItem('translationHistory')) || [];
    historyBox.innerHTML = '';
    history.forEach(entry => {
        historyBox.innerHTML += `<div class='history-item'><h6>${entry.date}</h6><h5 class='history-text'>${entry.text}</h5><i class='fas fa-copy history'></i></div>`;
    });
    addHistoryCopyEvent();
}

function addHistoryCopyEvent() {
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('history')) {
                const text = item.querySelector('.history-text').innerHTML;
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Copied to clipboard:', text);
                }).catch(err => {
                    console.error('Error copying text: ', err);
                });
            }
        });
    });
}

selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "hi-IN" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
        translateFrom = selectTag[0].value,
        translateTo = selectTag[1].value;
    if (!text) return;
    toText.setAttribute("placeholder", "Translating...");
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    fetch(apiUrl).then(res => res.json()).then(data => {
        toText.value = data.responseData.translatedText;
        toText.setAttribute("placeholder", "Translation");
        saveTranslationHistory(toText.value);
    });
});

function saveTranslationHistory(text) {
    let history = localStorage.getItem('translationHistory');
    if (!history) {
        history = [];
    } else {
        history = JSON.parse(history);
    }
    const newEntry = {
        text: text,
        date: new Date().toLocaleString()
    };
    history.unshift(newEntry);
    localStorage.setItem('translationHistory', JSON.stringify(history));
    loadTranslationHistory();
}

loadTranslationHistory();

icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (target.classList.contains("fa-copy")) {
            if (target.id === "from") {
                navigator.clipboard.writeText(fromText.value).then(() => {
                    console.log('Copied from text to clipboard:', fromText.value);
                });
            } else if (target.id === "to") {
                navigator.clipboard.writeText(toText.value).then(() => {
                    console.log('Copied to text to clipboard:', toText.value);
                });
            }
        } else {
            let utterance;
            if (target.id === "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.voice = getVoice(selectTag[0].value);
            } else if (target.id === "to") {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.voice = getVoice(selectTag[1].value);
            }
            if (utterance) {
                speechSynthesis.speak(utterance);
            }
        }
    });
});

function getVoice(lang) {
    const voices = speechSynthesis.getVoices();
    return voices.find(voice => voice.lang === lang) || voices[0];
}

document.querySelector('.show-history').addEventListener('click', () => {
    document.querySelector('.history-box').classList.toggle('hide');
});
