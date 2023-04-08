const socket = io("https://wormworld-switch.herokuapp.com/");
//const socket = io("http://localhost:4100");
socket.connect();

let lastBlockRef = 0;

document.addEventListener("keypress", handleKeyPress);
document.addEventListener("keydown", handleKeyDown);

socket.on("receive_word", handleReceiveWord);
socket.on("receive_answer", handleReceiveAnswer);

const form = document.getElementById("form");
const nickname = document.getElementById("nickname");
form.addEventListener("submit", handleSubmitForm);

function handleSubmitForm(event) {
  event.preventDefault();
  const socket = io();
  socket.emit("joinroom", {
    nickname: nickname.value,
    room: "brasil_01",
  });
  hideForm();
  showGame();
  setCurrentBlocks();
}

function handleKeyPress(event) {
  if (isGameHidden()) return;
  const unoccupiedBlocks = getUnoccupiedBlocks();
  if (!unoccupiedBlocks.length) return;

  const char = getUpperCaseCharacter(event.key);
  if (isValidCharacter(char)) {
    let ref = findFirstUnoccupiedBlock(unoccupiedBlocks);
    unoccupiedBlocks[ref].innerHTML = char;
    lastBlockRef = ref;
  }
}

function handleKeyDown(event) {
  if (event.key !== "Backspace" || lastBlockRef < 0) return;
  if (isGameHidden()) return;

  const unoccupiedBlocks = getUnoccupiedBlocks();
  unoccupiedBlocks[lastBlockRef].innerHTML = "";
  lastBlockRef--;
}

function handleReceiveWord(data) {
  localStorage.setItem("wordId", data.id);
}

function handleReceiveAnswer(data) {
  giveHint(data.peso);
  if (data.isCorrect) {
    alert("Correct answer!");
  }
}

function giveHint(weight) {
  const currentBlocks = getCurrentBlocks();
  if (!currentBlocks.length) return;
  weight.forEach((element, i) => {
    if (element === 2) {
      currentBlocks[i].classList.add("peso2");
    }
    if (element === 1) {
      currentBlocks[i].classList.add("peso1");
    }
  });
  lockCurrentBlocks();
  setCurrentBlocks();
}

function submitAnswer() {
  const wordId = localStorage.getItem("wordId");
  const answer = getAnswer();
  if (!answer) return;

  socket.emit("submit_answer", { wordId, answer });
}

function getAnswer() {
  const unoccupiedBlocks = getUnoccupiedBlocks();
  const answer = getAnswerString(unoccupiedBlocks);
  if (!answer) {
    alert("You didn't enter any letters!");
    return;
  }
  if (answer.length < 6) {
    alert("You didn't enter all the letters!");
    return;
  }
  return answer;
}

function getUpperCaseCharacter(char) {
  const regex = /[a-zA-ZÁÀÃÂÄÉÈÊËẽÍÌÎÏÓÒÕÔÖÚÙÛÜÇ]/gim;
  return regex.test(char) ? char.toUpperCase() : null;
}

function isValidCharacter(char) {
  return char !== null;
}

function findFirstUnoccupiedBlock(blocks) {
  let ref = 0;
  while (blocks[ref].innerHTML !== "") {
    ref++;
    if (ref === 6 || ref === blocks.length) {
      return;
    }
  }
  return ref;
}

function getUnoccupiedBlocks() {
  return document.querySelectorAll(".block:not(.lock)");
}

function getCurrentBlocks() {
  return document.querySelectorAll(".block.current");
}

function getAnswerString(blocks) {
  let answer = "";
  for (let i = 0; i < 6; i++) {
    answer += blocks[i].innerHTML;
  }
  return answer.length === 0 ? null : answer;
}

function lockCurrentBlocks() {
  const currentBlocks = getCurrentBlocks();
  currentBlocks.forEach((block) => {
    block.classList.add("lock");
    block.classList.remove("current");
  });
}

function setCurrentBlocks() {
  const unoccupiedBlocks = getUnoccupiedBlocks();
  if (!unoccupiedBlocks.length) return;
  for (let i = 0; i < 6; i++) {
    unoccupiedBlocks[i].classList.add("current");
  }
}

function isGameHidden() {
  return document.getElementById("game").style.display === "none";
}

function hideForm() {
  document.getElementById("form").style.display = "none";
}

function showGame() {
  document.getElementById("game").style.display = "block";
}
