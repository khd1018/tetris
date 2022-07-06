import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//SETTING
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500; // 블럭이 떨어지는 시간
let downInterval;
let tempMovingItem;

const movingItem = {
  type: "",
  direction: 0, // 화살표 방향
  top: 0, // 아래 위 위치
  left: 0, // 좌우 위치
};

init();

function init() {
  score = 0;
  scoreDisplay.innerText = score;
  for (let i = 0; i < GAME_ROWS; i++) prependNewLine();

  generateNewBlock();
}

// 화면에 레이아웃 그리기
function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < 10; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

// 렌더링
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;

  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  BLOCKS[type][direction].some((block) => {
    let [x, y] = [block[0] + left, block[1] + top];
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      // 이해가 잘 안되는 부분..
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");

        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });

  movingItem.direction = direction;
  movingItem.top = top;
  movingItem.left = left;
}

// 게임오버 시 보여줄 화면
function showGameoverText() {
  gameText.style.display = "flex";
}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");

  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });

  checkMatch();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      const seizedBlock = li.classList.contains("seized");
      if (!seizedBlock) {
        matched = false;
      }
    });

    if (matched) {
      child.remove();
      prependNewLine();
      score += 10;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);

  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks();
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

function changeBlocks() {
  const direction = tempMovingItem.direction;
  direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

//event handling

document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 40:
      moveBlock("top", 1);
      break;
    case 39:
      moveBlock("left", 1);
      break;
    case 38:
      changeBlocks();
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
});

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none";
  init();
});
