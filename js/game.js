const pages = document.querySelectorAll("[pagina]");
const form = document.querySelector("form");

// adiciona ouvinte de eventos para o evento "click" nos links de navegação
document.querySelectorAll(".link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const pagina = link.getAttribute("href").replace("#", "");
    // oculta todas as páginas
    pages.forEach((page) => {
      page.style.display = "none";
    });
    // exibe a página correspondente ao link clicado
    document.querySelector(`[pagina="${pagina}"]`).style.display = "block";
  });
});
function validateEmail(email) {
  const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return regex.test(email);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // impede que o formulário seja enviado e a página seja atualizada
  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;

  if (name.trim() === "" || email.trim() === "") {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Por favor, insira um e-mail válido.");
    return;
  }

  document.querySelector('[pagina="game"]').style.display = "block";
  document.querySelector('[pagina="home"]').style.display = "none";
  const retorno = await getApiUrl("register", { name, email });
  if (retorno.status === 200) {
    alert("Cadastro realizado com sucesso! Bem vindo ao jogo!");
    btnShare.style.visibility = "visible";
    retorno.isPresent = true;
    savePlayer(retorno);
    console.log(retorno);
    onInit();
  }
});

const dictionaries = {};
const state = {
  config: {
    attempts: 6,
    wordLength: 6,
    hardMode: false,
    ultraHardMode: false,
    displayCandidates: false,
    autoFirstWord: false,
    quickAnimations: false,
  },
  lettersTried: {},
  wordsTried: [],
  wordToGuess: "",
  gamesPlayed: 0,
  gamesWon: 0,
  victoryStreak: 0,
  victoryStreakRecord: 0,
  guessDistribution: {},
};
const endMessages = {
  positive: [
    "Ótimo",
    "Fantástico",
    "Maravilhoso",
    "Brilhante",
    "Super",
    "Incrível",
    "Perfeito",
    "Surpreendente",
    "Espetacular",
  ],
  negative: [
    "Ah não",
    "Oops",
    "Desculpe",
    "Quase lá",
    "Por pouco",
    "Quase",
    "Talvez na próxima vez",
    "Poxa vida",
  ],
};

const SVG_SHARE =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path></svg>';
const SVG_HOWTO =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg>';
const SVG_STATS =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"></path></svg>';
const SVG_SETTINGS =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path></svg>';
const SVG_CLOSE =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>';
const SVG_BACKSPACE =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path></svg>';
const wordsGuessable = [
  "cigar",
  "rebut",
  "sissy",
  "humph",
  "awake",
  "blush",
  "focal",
  "evade",
  "naval",
  "serve",
];
const wordsAcceptedAsInput = [
  "aahed",
  "aalii",
  "aargh",
  "aarti",
  "abaca",
  "abaci",
  "abacs",
  "abaft",
  "abaka",
  "abamp",
];

function cloneState() {
  return {
    lettersTried: { ...state.lettersTried },
    wordsTried: state.wordsTried.slice(),
    wordToGuess: state.wordToGuess,
  };
}

function displayToast(message, duration = 1.5e3, zIndex = 500) {
  document.querySelectorAll(".toast").forEach((node) => node.remove());
  if (!message) {
    return;
  }
  let div = document.createElement("div");
  let span = document.createElement("span");
  div.classList.add("toast");
  div.append(span);
  div.style.zIndex = zIndex;
  if (state.wordsTried.length === 1) {
    div.style.top = "32vh";
  }
  span.innerText = message;
  document.body.append(div);
  setTimeout(() => {
    div
      .animate(
        { opacity: 0, easing: "ease-out" },
        { duration: 300, fill: "forwards" }
      )
      .addEventListener("finish", () => div.remove());
  }, duration);
}

function getCurrentWordDiv(offset = 0) {
  return Array.from(document.querySelector(".words").children)[
    state.wordsTried.length + offset
  ];
}

function getCurrentTypedWord() {
  let div = getCurrentWordDiv();
  return (div && div.textContent) || "";
}

function getLetterDiv(filled = false) {
  let letterIndexFrom = state.wordsTried.length * state.config.wordLength;
  let letters = Array.from(document.querySelectorAll(".letter")).slice(
    letterIndexFrom,
    letterIndexFrom + state.config.wordLength
  );
  return filled
    ? letters.reverse().find((node) => node.childElementCount !== 0)
    : letters.find((node) => node.childElementCount === 0);
}

function isAnimatingHints() {
  const wordDiv = getCurrentWordDiv(-1);
  if (!wordDiv) {
    return false;
  }
  const lettersDivs = Array.from(wordDiv.children);
  return lettersDivs.some((l) =>
    l.getAnimations().some((a) => a.playState !== "finished")
  );
}

function addHints(
  wordDiv,
  onEndAnimation,
  quick = state.config.quickAnimations
) {
  return new Promise((resolve, reject) => {
    if (!wordDiv) {
      wordDiv = getCurrentWordDiv();
    }
    let lettersToGuess = Array.from(state.wordToGuess);
    let lettersGuessed = Array.from(wordDiv.textContent.toLowerCase());
    let lettersDivs = Array.from(wordDiv.children);
    let hints = lettersToGuess.slice();
    let animationDuration = 350;
    let letterClasses = {};
    for (let index = 0; index < state.config.wordLength; index++) {
      let correctLetter = lettersToGuess[index];
      let guessedLetter = lettersGuessed[index];
      if (correctLetter === guessedLetter) {
        hints[index] = undefined;
        letterClasses[index] = "correct";
      }
    }
    for (let index = 0; index < state.config.wordLength; index++) {
      if (letterClasses[index] === "correct") {
        continue;
      }
      let correctLetter = lettersToGuess[index];
      let guessedLetter = lettersGuessed[index];
      let letterClass = "incorrect";
      if (hints.includes(guessedLetter)) {
        let semiIndex = hints.indexOf(guessedLetter);
        hints[semiIndex] = undefined;
        letterClass = "semi";
      }
      letterClasses[index] = letterClass;
    }
    for (let index = 0; index < state.config.wordLength; index++) {
      let letterDiv = lettersDivs[index];
      let guessedLetter = lettersGuessed[index];
      let keyboardKeyState = state.lettersTried[guessedLetter] || "";
      let keyboardKeyNextState = letterClasses[index];
      letterDiv
        .animate(
          { transform: ["rotateX(0)", "rotateX(-90deg)"] },
          {
            duration: animationDuration * 0.5,
            delay: index * animationDuration - (quick ? 250 : 20) * index,
            fill: "forwards",
          }
        )
        .addEventListener("finish", (event) => {
          event.target.finish();
          let letterClass = letterClasses[index];
          if (letterClass) {
            letterDiv.classList.add(letterClass);
            let keyboardKeyState = state.lettersTried[guessedLetter] || "";
            if (
              !keyboardKeyState ||
              keyboardKeyState === "incorrect" ||
              (keyboardKeyState === "semi" && letterClass === "correct") ||
              keyboardKeyState === letterClass
            ) {
              state.lettersTried[guessedLetter] = letterClass;
              let keyboardBtn = document.querySelector(".key-" + guessedLetter);
              if (keyboardBtn) {
                keyboardBtn.classList.remove("incorrect", "semi");
                keyboardBtn.classList.add(keyboardKeyNextState);
              }
            }
          }
          let anim = letterDiv.animate(
            { transform: ["rotateX(90deg)", "rotateX(0deg)"] },
            {
              duration: animationDuration * 0.5,
              fill: "forwards",
            }
          );
          if (index === state.config.wordLength - 1) {
            anim.addEventListener("finish", () => {
              resolve();
              if (typeof onEndAnimation === "function") {
                onEndAnimation();
              }
            });
          }
        });
    }
  });
}

function fillLetter(letter) {
  letter = letter.replace(/[^a-z]+/gi, "");
  if (letter.length !== 1) {
    return;
  }
  let div = getLetterDiv();
  if (div) {
    let span = document.createElement("span");
    span.innerHTML = letter.toUpperCase();
    div.append(span);
    div.animate(
      {
        transform: ["scale(1.0)", "scale(1.16)", "scale(1.0)"],
        easing: ["ease-in-out", "ease-in-out", "ease-in-out"],
      },
      50
    );
  }
}

function unfillLetter() {
  let div = getLetterDiv(true);
  if (div) {
    Array.from(div.children).forEach((node) => node.remove());
  }
}

function clearLettersFilled() {
  for (let i = 0; i < state.config.wordLength; i++) {
    unfillLetter();
  }
}

function createWordRow(letterCount = 5) {
  let divWord = document.createElement("div");
  divWord.classList.add("word");
  for (let i = 0; i < letterCount; i++) {
    let divLetter = document.createElement("div");
    divLetter.classList.add("letter");
    divWord.append(divLetter);
  }
  return divWord;
}

function setupKeyboard() {
  let keyboardDiv = document.querySelector(".keyboard");
  for (let child of keyboardDiv.children) {
    child.remove();
  }
  let layout = ["qwertyuiop", "asdfghjkl", "#zxcvbnm!"];
  for (let row of layout) {
    let keyboardRow = document.createElement("div");
    keyboardRow.classList.add("keyboard-row");
    for (let letter of Array.from(row)) {
      let extraClass;
      if (letter === "#") {
        letter = "Enter";
        extraClass = "larger";
      } else if (letter === "!") {
        letter = "Backspace";
        extraClass = "larger";
      }
      let keyboardBtn = document.createElement("button");
      keyboardBtn.classList.add(
        "keyboard-button",
        "key-" + letter.toLowerCase()
      );
      if (extraClass) {
        keyboardBtn.classList.add(extraClass);
      }
      keyboardBtn.innerHTML = letter === "Backspace" ? SVG_BACKSPACE : letter;
      keyboardBtn.onclick = (e) => {
        onType({ key: letter });
        e.stopPropagation();
        e.preventDefault();
      };
      if (letter === "Backspace") {
        addOnLongTouchCallback(keyboardBtn, () => {
          clearLettersFilled();
        });
      }
      keyboardRow.append(keyboardBtn);
    }
    keyboardDiv.append(keyboardRow);
  }
}

function addOnLongTouchCallback(el, callback, delay = 650) {
  let timer = null;
  el.addEventListener("touchstart", (e) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      callback();
    }, delay);
  });
  el.addEventListener("touchend", (e) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });
}

function checkHardInput(word, ultra = false, stateData = state) {
  for (let attemptMade of stateData.wordsTried) {
    let wordToGuess = Array.from(stateData.wordToGuess);
    let currentGuess = Array.from(word);
    if (!attemptMade) {
      continue;
    }
    attemptMade = Array.from(attemptMade);
    for (let index = 0; index < wordToGuess.length; index++) {
      let s = ["st", "nd", "rd"][index] || "th";
      if (attemptMade[index] === wordToGuess[index]) {
        if (currentGuess[index] !== attemptMade[index]) {
          return `${index + 1}${s} letra deve ser ${attemptMade[
            index
          ].toUpperCase()}`;
        }
        attemptMade[index] = undefined;
        wordToGuess[index] = undefined;
        currentGuess[index] = undefined;
      } else if (
        ultra &&
        ((stateData.lettersTried[currentGuess[index]] === "semi" &&
          attemptMade[index] === currentGuess[index]) ||
          (stateData.lettersTried[currentGuess[index]] === "correct" &&
            attemptMade[index] === currentGuess[index] &&
            wordToGuess[index] !== currentGuess[index]))
      ) {
        return `${index + 1}${s} letra não deve ser ${currentGuess[
          index
        ].toUpperCase()}`;
      }
    }
    for (let index = 0; index < wordToGuess.length; index++) {
      if (attemptMade[index] && wordToGuess.includes(attemptMade[index])) {
        let currentGuessIndex = currentGuess.indexOf(attemptMade[index]);
        let wordToGuessIndex = wordToGuess.indexOf(attemptMade[index]);
        if (currentGuessIndex === -1) {
          return `Deve conter letra ${attemptMade[index].toUpperCase()}`;
        }
        currentGuess[currentGuessIndex] = undefined;
        wordToGuess[wordToGuessIndex] = undefined;
        attemptMade[index] = undefined;
      }
    }
    if (ultra) {
      for (let index = 0; index < wordToGuess.length; index++) {
        if (
          currentGuess[index] &&
          !stateData.wordToGuess.includes(currentGuess[index]) &&
          stateData.lettersTried[currentGuess[index]]
        ) {
          return `Não deve conter letra ${currentGuess[index].toUpperCase()}`;
        }
        if (
          currentGuess[index] &&
          /^(semi|correct)$/.test(stateData.lettersTried[currentGuess[index]])
        ) {
          let regex = new RegExp(`[^${currentGuess[index]}]`, "ig");
          let repetitions = word.replace(regex, "").length;
          let lastAttemptRepetitions = stateData.wordsTried
            .slice(-1)[0]
            .replace(regex, "").length;
          let answerRepetitions = stateData.wordToGuess.replace(
            regex,
            ""
          ).length;
          if (
            lastAttemptRepetitions > answerRepetitions &&
            repetitions >= lastAttemptRepetitions
          ) {
            return `Existem muitos ${currentGuess[index].toUpperCase()}s`;
          }
        }
      }
    }
  }
}

function makeAttempt(word) {
  word = word.replace(/[^a-z]+/gi, "").toLowerCase();
  const dictionary = dictionaries[state.config.wordLength];
  if (word.length !== state.config.wordLength) {
    if (!isAnimatingHints() && !isGameOver()) {
      displayToast("Letras insuficientes");
    }
    return;
  } else if (
    !dictionary ||
    (!dictionary.wordsGuessable.has(word) &&
      !dictionary.wordsAcceptable.has(word))
  ) {
    return displayToast("Palavra que não está no dicionário");
  } else if (state.wordsTried.includes(word)) {
    return displayToast("Adivinhação de palavras repetidas");
  } else if (isGameOver()) {
    return;
  }
  if (state.config.hardMode || state.config.ultraHardMode) {
    const problem = checkHardInput(word, state.config.ultraHardMode);
    if (problem) {
      return displayToast(problem);
    }
  }
  displayToast();
  clearLettersFilled();
  for (const letter of word) {
    fillLetter(letter);
  }
  const div = getCurrentWordDiv();
  div.classList.add("attempted");
  state.previousAttemptState = cloneState();
  state.wordsTried.push(word);
  const hintsPromise = addHints(div);
  if (isGameOver()) {
    hintsPromise.then(() => setTimeout(() => onEndGame(), 500));
  } else {
    hintsPromise.then(() => setupCandidatesLeft());
  }
  saveState();
}

function getPossibleWordsLeft() {
  const dictionary = dictionaries[state.config.wordLength];
  const stateToConsider = isGameOver() ? state.previousAttemptState : state;
  return [dictionary.wordsGuessable, dictionary.wordsAcceptable]
    .flatMap((s) => Array.from(s))
    .filter(
      (w) => !checkHardInput(w, state.config.ultraHardMode, stateToConsider)
    );
}

function isGameOver() {
  return (
    hasWon() ||
    state.wordsTried.length >= state.config.attempts ||
    document.querySelector(".modal").classList.contains("show") ||
    document.body.classList.contains("game-over")
  );
}

function hasWon() {
  return state.wordsTried.includes(state.wordToGuess);
}

function onType(e) {
  if (e.key === "Enter") {
    makeAttempt(getCurrentTypedWord());
    onClickPlayAgain();
    if (typeof e.preventDefault === "function") {
      e.preventDefault();
      e.stopPropagation();
    }
  } else if (/Backspace|Delete/.test(e.key)) {
    unfillLetter();
  } else if (/^[a-z]$/i.test(e.key)) {
    if (isGameOver()) {
      return;
    }
    fillLetter(e.key);
  } else if (e.key === "Escape" && !isGameOver()) {
    clearLettersFilled();
  }
}

function randomInteger(min = 0, max = 10) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function codeToWordIndex(code, arrayLength) {
  const multiplier = Number(code.slice(0, 3));
  const xor = multiplier * 1e3 + multiplier;
  let index = Number(code.slice(3));
  index = (index ^ xor) / multiplier;
  if (arrayLength) {
    index %= arrayLength;
  }
  return index;
}

function wordIndexToCode(index, arrayLength) {
  const multiplier = randomInteger(150, 350);
  const xor = multiplier * 1e3 + multiplier;
  if (arrayLength) {
    index += randomInteger(1, 13) * arrayLength;
  }
  return String(multiplier) + String((index * multiplier) ^ xor);
}

function getWordToGuess(code) {
  const words = Array.from(
    dictionaries[state.config.wordLength].wordsGuessable || []
  );
  if (code) {
    return words[codeToWordIndex(code, words.length)];
  }
  return words[randomInteger(0, words.length - 1)];
}

function onCloseModal(callback) {
  let called = false;
  let btnClose = document.querySelector(".modal-close");
  let func = () => {
    if (!called) {
      called = true;
      callback();
    }
  };
  btnClose.addEventListener("click", func, { once: true });
}

function toggleModal(state) {
  let modal = document.querySelector(".modal");
  let backdrop = document.querySelector(".backdrop");
  if (state === undefined) {
    state = !modal.classList.contains("show");
  }
  if (state) {
    modal.classList.add("show");
    backdrop.classList.add("show");
  } else {
    modal.classList.remove("show");
    backdrop.classList.remove("show");
  }
}

function share() {
  const shareData = {
    title: "Venha Jogar",
    text: "Me ajude a adivinhar a palavra",
    url: location.host +  "/?id=" + playerCurrent.id,
  };

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => alert("Compartilhamento bem-sucedido"))
      .catch((error) => alert("Erro ao compartilhar", error));
  } else {
    navigator.clipboard.writeText(shareData.url);
    alert("Texto copiado para a área de transferência!");
  }
  displayToast("Obrigado por compartilhar!");
}

function setupEndGameModal() {
  let title = document.querySelector(".modal-title");
  let modalContent = document.querySelector(".modal-content");
  Array.from(modalContent.children).forEach((node) => node.remove());
  if (title) {
    title.innerHTML = "Estatisticas";
  }
  let statisticsGrid = document.createElement("div");
  statisticsGrid.classList.add("statistics");
  for (let label of [
    state.gamesPlayed,
    "Jogada",
    state.gamesWon,
    "Jogos\nGanhos",
    ((state.gamesWon / state.gamesPlayed) * 100 || 0).toFixed(0),
    "Ganhar %",
    state.victoryStreak,
    "Sequência\nAtual",
    state.victoryStreakRecord,
    "Máx\nFaixa",
  ]) {
    let span = document.createElement("span");
    span.textContent = label;
    statisticsGrid.append(span);
  }
  modalContent.append(statisticsGrid);
  let distributionGrid = document.createElement("div");
  distributionGrid.classList.add("distribution");
  let bestGuessed = Math.max(...Object.values(state.guessDistribution));
  for (let attempt = 1; attempt <= state.config.attempts; attempt++) {
    let attemptLabel = document.createElement("span");
    attemptLabel.innerText = String(attempt);
    let distributionDiv = document.createElement("div");
    let distributionLabel = document.createElement("span");
    let distribution = state.guessDistribution[attempt] || 0;
    distributionDiv.style.width =
      6 + Math.floor((distribution / bestGuessed) * 94) + "%";
    distributionDiv.style.background =
      hasWon() && attempt === state.wordsTried.length ? "#538d4e" : "#3a3a3c";
    distributionLabel.innerText = distribution;
    distributionDiv.append(distributionLabel);
    distributionGrid.append(attemptLabel, distributionDiv);
  }
  modalContent.append(distributionGrid);
}

function getShareContent() {
  const decoder = new TextDecoder("utf-8");
  const squareGlyphs = [
    decoder.decode(new Uint8Array([226, 172, 155])),
    decoder.decode(new Uint8Array([240, 159, 159, 168])),
    decoder.decode(new Uint8Array([240, 159, 159, 169])),
  ];
  const colorMatrix = Array.from(document.querySelectorAll(".word"))
    .map((row) => {
      return Array.from(row.children)
        .map((letter) => {
          const glyphIndex =
            (letter.classList.contains("correct") && 2) ||
            (letter.classList.contains("semi") && 1) ||
            (letter.classList.contains("incorrect") && 0);
          return squareGlyphs[glyphIndex] || "";
        })
        .join("");
    })
    .filter((row) => row);
  const word = document.getElementById("word-answer").innerHTML;
  const wordIndex = wordsGuessable.indexOf(word.toLowerCase());
  const url = new URL(window.location);
  url.searchParams.set(
    "word",
    wordIndexToCode(wordIndex, wordsGuessable.length)
  );
  const text = [
    `Unlimited Wordle ${colorMatrix.length}/${state.config.attempts}`,
    ...colorMatrix,
    `Tente adivinhar esta palavra aqui: ${url.toString()}`,
  ].join("\n");
  return text;
}

async function writeToClipboard(content) {
  let success = false;
  try {
    const result = await navigator.permissions.query({
      name: "clipboard-write",
    });
    if (result.state === "granted") {
      await navigator.clipboard.writeText(content);
      success = true;
    } else {
      throw new Error("forbidden");
    }
  } catch (err) {}
  if (!success) {
    const element = document.createElement("div");
    element.innerHTML = content;
    Object.assign(element.style, {
      opacity: 0,
      pointerEvents: "none",
      position: "fixed",
      transform: "translateX(-100%)",
      whiteSpace: "pre",
    });
    document.body.append(element);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    const result = document.execCommand("copy");
    setTimeout(() => element.remove(), 100);
  }
}

function onEndGame(toastDuration = 1.5e3) {
  let victory = hasWon();
  let endMessagesArray = endMessages[victory ? "positive" : "negative"];
  let message =
    endMessagesArray[randomInteger(0, endMessagesArray.length - 1)] + "!";
  if (!victory) {
    message += "\nResposta: " + state.wordToGuess.toUpperCase();
    toastDuration *= 2;
  }
  if (victory) {
    state.gamesWon++;
    state.guessDistribution[state.wordsTried.length] =
      (state.guessDistribution[state.wordsTried.length] || 0) + 1;
    state.victoryStreak++;
    state.victoryStreakRecord = Math.max(
      state.victoryStreakRecord,
      state.victoryStreak
    );
  } else {
    state.victoryStreak = 0;
  }
  state.gamesPlayed++;
  state.previousGame = cloneState();
  saveState();
  displayToast(message, toastDuration);
  setTimeout(() => {
    setupEndGameModal();
    toggleModal(true);
    resetGame();
    saveState();
    onCloseModal(() => {
      document.body.classList.add("game-over");
    });
  }, toastDuration);
}

function onClickPlayAgain() {
  if (
    document.body.classList.contains("game-over") &&
    document
      .querySelector(".end-actions button")
      .getAnimations()
      .every((a) => a.playState === "finished")
  ) {
    const autoFirstAttempt =
      state.config.autoFirstWord &&
      document.getElementById("word-answer").innerHTML;
    resetGame(true);
    setupCandidatesLeft();
    if (autoFirstAttempt) {
      makeAttempt(autoFirstAttempt);
    }
  }
}

function saveState() {
  localStorage.setItem("state", JSON.stringify(state));
}

function savePlayer(player) {
  localStorage.setItem("player", JSON.stringify(player));
}

function mergeObjs(src, obj) {
  if (typeof src !== "object" || !src || typeof obj !== "object" || !obj) {
    return src;
  }
  for (let key in obj) {
    let srcValue = src[key];
    let objValue = obj[key];
    if (
      typeof srcValue === "object" &&
      srcValue &&
      typeof objValue === "object" &&
      objValue
    ) {
      mergeObjs(srcValue, objValue);
    } else {
      src[key] = objValue;
    }
  }
  return src;
}

function loadState() {
  try {
    let data = JSON.parse(localStorage.getItem("state"));
    if (data) {
      mergeObjs(state, data);
    }
    return state;
  } catch (err) {}
}

function loadPlayer() {
  try {
    let data = JSON.parse(localStorage.getItem("player"));
    return data;
  } catch (err) {}
}

function setupCandidatesLeft() {
  const el = document.getElementById("candidates-left");
  if (el) {
    if (state.config.displayCandidates) {
      el.innerHTML = `Candidatos à esquerda: ${getPossibleWordsLeft().length}`;
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  }
}

function addSliderSetting(key, name, description) {
  const settingsEl = document.querySelector(".settings");
  settingsEl.innerHTML +=
    '<br><div><div style="display: flex; flex-direction: column; max-width: 75%;"><span style="font-size: 18px;">' +
    name +
    '</span><span style="font-size: 12px; color: #787c7e;">' +
    description +
    '</span></div><div class="slider" prop="' +
    key +
    '"></div></div><div class="line-sep"></div>';
}

const endActionsDiv = document.querySelector(".end-actions");

const btnHowToPlay = document.getElementById("howtoplay");
btnHowToPlay.innerHTML = SVG_HOWTO;
btnHowToPlay.addEventListener("click", (e) => {
  document.querySelector(".overlay").classList.add("show");
  document.querySelector(".howtoplay").classList.add("show");
  document.querySelector(".settings").classList.remove("show");
});
const btnCloseHowToPlay = document.querySelector(".howtoplay-close");
btnCloseHowToPlay.innerHTML = SVG_CLOSE;
btnCloseHowToPlay.addEventListener("click", (e) => {
  document.querySelector(".overlay").classList.remove("show");
});

const btnShare = document.getElementById("btnShare");
btnShare.innerHTML = SVG_SHARE;
btnShare.addEventListener("click", (e) => {
  share();
});

// ci
const btnCloseSettings = document.querySelector(".settings-close");
btnCloseSettings.innerHTML = SVG_CLOSE;
btnCloseSettings.addEventListener("click", (e) => {
  document.querySelector(".overlay").classList.remove("show");
});

const btnCloseModal = document.querySelector(".modal-close");
const backdrop = document.querySelector(".backdrop");
btnCloseModal.innerHTML = SVG_CLOSE;
btnCloseModal.addEventListener(
  "click",
  (e) => {
    if (!document.querySelector(".modal").classList.contains("show")) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleModal(false);
  },
  { capture: true }
);
backdrop.addEventListener("click", () => {
  if (backdrop.getAnimations().some((a) => a.playState !== "finished")) {
    return;
  }
  btnCloseModal.click();
  btnCloseHowToPlay.click();
  btnCloseSettings.click();
});

Array.from(document.querySelectorAll(".slider")).forEach((node) => {
  let prop = node.getAttribute("prop");
  if (state.config[prop]) {
    node.classList.add("on");
  }
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("slider")) {
    e.preventDefault();
    e.stopPropagation();
    if (/^(|true)$/i.test(e.target.getAttribute("disabled"))) {
      return;
    }
    if (e.target.classList.contains("on")) {
      e.target.classList.remove("on");
    } else {
      e.target.classList.add("on");
    }
    let prop = e.target.getAttribute("prop");
    onSliderChange(prop, e.target.classList.contains("on"));
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    backdrop.click();
  }
});

function setupDictionary() {
  for (let word of wordsGuessable) {
    addWordToDict(word, true);
  }
  for (let word of wordsAcceptedAsInput) {
    addWordToDict(word, false);
  }
}

function setupForCurrentState() {
  document.querySelector(".end-actions span").innerText =
    state.wordToGuess.toUpperCase();
  let lettersAndKeys = [
    ...document.querySelectorAll(".keyboard-button"),
    ...document.querySelectorAll(".letter"),
  ].flat();
  lettersAndKeys.forEach((node) => {
    node.classList.remove("correct", "semi", "incorrect");
  });
  let wordList = Array.from(document.querySelector(".words").children);
  for (
    let wordTriedIndex = 0;
    wordTriedIndex < state.wordsTried.length;
    wordTriedIndex++
  ) {
    let wordDiv = wordList[wordTriedIndex];
    let letterList = Array.from(wordDiv.children);
    let wordTried = Array.from(state.wordsTried[wordTriedIndex]);
    for (let letterIndex = 0; letterIndex < wordTried.length; letterIndex++) {
      let letter = wordTried[letterIndex];
      let letterDiv = letterList[letterIndex];
      if (letterDiv) {
        Array.from(letterDiv.children).forEach((node) => node.remove());
        let span = document.createElement("span");
        span.innerText = letter.toUpperCase();
        letterDiv.append(span);
      }
    }
    const promise = addHints(wordDiv, null, true);
    if (wordTriedIndex === state.wordsTried.length - 1) {
      promise.then(() => setupCandidatesLeft());
    }
  }
  if (state.wordsTried.length === 0) {
    setupCandidatesLeft();
  }
}

function setupWordList() {
  const divWordList = document.querySelector(".words");
  Array.from(divWordList.children).forEach((node) => node.remove());
  for (let i = 0; i < state.config.attempts; i++) {
    let divWord = createWordRow();
    divWordList.append(divWord);
  }
}

function resetGame(resetInterface, nextWord) {
  state.wordsTried = [];
  state.lettersTried = {};
  state.wordToGuess = nextWord || getWordToGuess();
  if (resetInterface) {
    resetUI();
  }
}

function resetUI() {
  setupWordList();
  setupForCurrentState();
  document.body.classList.remove("game-over");
}

function resetStatistics() {
  state.gamesPlayed = 0;
  state.gamesWon = 0;
  state.guessDistribution = {};
  state.victoryStreak = 0;
  state.victoryStreakRecord = 0;
  saveState();
}

function updateConfig(newConfig) {
  Object.assign(state.config, newConfig);
  saveState();
}

function onSliderChange(prop, bool) {
  if (prop in state.config) {
    state.config[prop] = !!bool;
    saveState();
  }
  if (/displayCandidates|hard/i.test(prop)) {
    setupCandidatesLeft();
  }
}

function setupUI() {
  addSliderSetting(
    "hardMode",
    "Modo Difícil",
    "Qualquer dica revelada deve ser usada nas tentativas subsequentes."
  );
  addSliderSetting(
    "ultraHardMode",
    "Modo Ultra Difícil",
    "Proíbe o uso de letras que já foram tentadas e coloca letras amarelas no mesmo espaço. Isso também ativa o Modo Difícil."
  );
  addSliderSetting(
    "displayCandidates",
    "Exibir Contagem de Candidatos",
    "Mostra quantas palavras podem ser tentadas que correspondem a cada dica recebida."
  );
  addSliderSetting(
    "autoFirstWord",
    "Auto Primeira Palavra",
    "Inicia o próximo jogo com a palavra da rodada anterior."
  );
  addSliderSetting(
    "quickAnimations",
    "Animações Rápidas",
    "Faz com que as animações rodem muito mais rápido."
  );
  setupWordList();
  setupKeyboard();
}

function onInit() {
  loadState();

  window.addEventListener("keydown", onType, { capture: true });

  setupDictionary();
  setupUI();

  const url = new URL(window.location);
  const urlWord = url.searchParams.get("word");
  if (urlWord) {
    resetGame();
    const word = getWordToGuess(urlWord);
    if (word) {
      state.wordToGuess = word;
      displayToast("Adivinhe a palavra dada pelo link!", 3 * 1e3);
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("word");
      window.history.replaceState({}, document.title, newUrl.toString());
    } else {
      displayToast(
        "Palavra do link é inválida.\nUsará palavra aleatória",
        8 * 1e3
      );
    }
  } else if (!state.wordToGuess) {
    resetGame();
  }

  setupForCurrentState();

  if (isGameOver()) {
    setTimeout(() => {
      if (isGameOver()) {
        onEndGame();
      }
    }, 1e3);
  }
}

function addWordToDict(word, guessable) {
  let length = word.length;
  let dictInfo = dictionaries[length];
  if (!dictInfo) {
    dictInfo = {
      wordsGuessable: new Set(),
      wordsAcceptable: new Set(),
    };
    dictionaries[length] = dictInfo;
  }
  if (guessable) {
    dictInfo.wordsGuessable.add(word);
  } else {
    dictInfo.wordsAcceptable.add(word);
  }
}

async function getApiUrl(action, params) {
  let retorno = null;
  if (action === "register") {
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.status === 400) {
        alert("E-mail já cadastrado.");
        //throw new Error("E-mail já cadastrado.");
      }

      const data = await response.json();
      data.status = 200;
      // Faça algo com o ID de usuário, como armazená-lo localmente ou usá-lo para outras requisições

      retorno = data; // Atribuir o objeto de dados retornado à variável 'retorno'
    } catch (error) {
      console.error("Erro no cadastro:", error.message);
      // Mostre uma mensagem de erro ao usuário ou faça algo apropriado
    }
  }

  
  if (action === "leaderboardAdd") {
    // Adicionar jogador ao ranking
    fetch(`//${room}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    })
    .then((res) => res.json())
    .then((leaderboard) => {
      // Atualize a tabela de classificação no cliente com a nova classificação
    });
  }
  if (action === "leaderboardRemove") {
    // Remover jogador do ranking
    fetch(`/leaderboard/${room}/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    }).then(() => {
      // Atualize a tabela de classificação no cliente após a remoção do jogador
    });
  }
  
  if (action === "leaderboardTop10") {
    // Obter o ranking (Top 10)
    fetch(`/leaderboard/${room}/top10`)
    .then((res) => res.json())
    .then((leaderboard) => {
      // Atualize a tabela de classificação no cliente com o top 10
    });
  }
  if (action === "leaderboardTop3") {
    // Obter o ranking (Top 3)
    fetch(`/leaderboard/${room}/top3`)
    .then((res) => res.json())
    .then((leaderboard) => {
      // Atualize a tabela de classificação no cliente com o top 3
    });
  }
  return retorno; 
}

var playerCurrent = loadPlayer();
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

if (id) {
  playerCurrent = {};
  playerCurrent.id = id;
}

if(playerCurrent){
  document.querySelector('[pagina="game"]').style.display = "block";
  document.querySelector('[pagina="home"]').style.display = "none";
  onInit();
  if(playerCurrent.isPresent){
    btnShare.style.visibility = "visible";
  }
}
console.log(playerCurrent);