import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameoverText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//SETTING
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0; // 점수를 저장하는 변수
let duration = 500; // 블럭이 떨어지는 시간
let downInterval; // 블록을 자동으로 내려오게 할 때 사용하는 setInterval을 할당하는 변수
let tempMovingItem; // 블록 랜더링 시 사용할 객체 변수

// 오류발생시(블록이 격자를 넘어갈 시) 되돌릴 직전 블록 상태를 저장하는 객체
const movingItem = {
  type: "", // 블럭의 type
  direction: 0, // 화살표 방향
  top: 0, // 아래 위 위치
  left: 0, // 좌우 위치
};

init();

// 게임을 시작하면 테트리스 격자를 그리고, 블록을 생성한다
function init() {
  score = 0;
  scoreDisplay.innerText = score;

  for (let i = 0; i < GAME_ROWS; i++) prependNewLine();

  generateNewBlock();
}

// 화면에 격자를 그리는 함수
function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

// 블록 랜더링 함수
function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;

  // 블록을 이동시킨 경우, 이동하기 전의 블록을 지우기 위해 이전 블록 el의 클래스를 지워주는 작업
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });

  // 블록의 각 구성요소의 위치에 격자가 존재하면 구성요소의 DOM element에 moving과 해당 블록 type을 클래스 추가하여 블록을 생성
  // 격자가 없을 경우, 직전의 블록을 불러와 다시 랜더링함
  // 만약 아래방향으로 격자가 없는 경우 블록을 해당 위치에 고정함
  BLOCKS[type][direction].some((block) => {
    let [x, y] = [block[0] + left, block[1] + top];
    const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;

    if (isMovable(target)) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };

      // 만약 두 번이나 격자가 존재하지 않을 경우 게임을 종료메세지를 띄움
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
        return true;
      }
      setTimeout(() => {
        // 게임 종료를 위해 retry를 parameter로 넣어줌.
        renderBlocks("retry");

        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  // 블록을 성공적으로 랜더링했을 시 movingItem에 현재 블록의 상태를 저장
  Object.assign(movingItem, tempMovingItem);
}

// 게임오버 시 보여줄 화면을 띄우는 함수
function showGameoverText() {
  gameoverText.style.display = "flex";
}

// 블록이 더이상 내려갈 수 없는 위치에 블록을 고정하는 함수
function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");

  // 블록 elements에 moving 클래스를 제거하고 seized 클래스를 추가한다.
  // moving을 제거하는 이유는 블록을 화면에 계속 표시하기 위함임
  // sezied을 추가하는 이유는 후에 한 줄이 찼을 때 해당 줄을 삭제하기 위함임
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });

  checkMatch();
}

// 한 줄이 블록으로 모두 차있는지 확인하는 함수
function checkMatch() {
  const childNodes = playground.childNodes;

  // 각 라인을 순회
  childNodes.forEach((child) => {
    let matched = true;
    // 한줄의 모든 element의 클래스에 seized가 있다면 한 줄이 모두 블록으로 찬 것이므로 이를 확인
    child.children[0].childNodes.forEach((li) => {
      const seizedBlock = li.classList.contains("seized");
      if (!seizedBlock) {
        matched = false;
      }
    });
    // 해당 라인을 삭제하고 점수를 추가 한다
    removeLine(matched, child);
  });
  generateNewBlock();
}

function removeLine(matched, child) {
  if (!matched) {
    return;
  }

  child.remove();
  // 한 줄을 삭제하고 상단에 한 줄을 추가해주기 위해 prependNewLine()을 호출
  prependNewLine();
  addScore(10);
}

function addScore(point) {
  score += point;
  scoreDisplay.innerText = score;
}

// 새로운 블록을 생성하는 함수
function generateNewBlock() {
  clearInterval(downInterval);

  // 블록이 duration에 한번 아래로 한칸 이동
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  // 난수를 생성하여 랜덤으로 블록을 선택
  const blockTypes = Object.keys(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockTypes.length);

  // movingItem에 해당 블록과 초기값을 저장
  const defaultValues = [blockTypes[randomIndex], 0, 0, 3];

  Object.keys(movingItem).forEach((key, i) => {
    movingItem[key] = defaultValues[i];
  });

  tempMovingItem = { ...movingItem };
  renderBlocks();
}

// 블록이 이동하려고 하는 격자가 없거나 격자에 이미 블록이 존재하는 지 확인
function isMovable(target) {
  return target && !target.classList.contains("seized");
}

// 블록의 위치값을 변경하는 함수
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

// 블록의 모양을 변경하는 함수
function changeBlocks() {
  const direction = tempMovingItem.direction;
  direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);
  renderBlocks();
}

// 스페이스바를 누를 시 블록을 빠르게 내려오게 하는 함수
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

//event handling

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowDown":
      moveBlock("top", 1);
      break;
    case "ArrowRight":
      moveBlock("left", 1);
      break;
    case "ArrowUp":
      changeBlocks();
      break;
    case "ArrowLeft":
      moveBlock("left", -1);
      break;
    case " ":
      dropBlock();
      break;
    default:
      break;
  }
});

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameoverText.style.display = "none";
  init();
});
