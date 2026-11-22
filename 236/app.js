const recipes = [
  { name: "Veggie Burger", ingredients: ["bun", "lettuce", "tomato"], emoji: "🍔" },
  { name: "Garden Pizza", ingredients: ["dough", "tomato", "cheese"], emoji: "🍕" },
  { name: "Breakfast Toast", ingredients: ["bread", "egg", "cheese"], emoji: "🍳" },
  { name: "Super Salad", ingredients: ["lettuce", "tomato", "cheese"], emoji: "🥗" },
  { name: "Cheese Omelet", ingredients: ["egg", "cheese", "tomato"], emoji: "🍳" },
];

const ingredients = [
  { id: "bun", name: "Bun", emoji: "🍞" },
  { id: "bread", name: "Bread", emoji: "🍞" },
  { id: "lettuce", name: "Lettuce", emoji: "🥬" },
  { id: "tomato", name: "Tomato", emoji: "🍅" },
  { id: "cheese", name: "Cheese", emoji: "🧀" },
  { id: "egg", name: "Egg", emoji: "🥚" },
  { id: "dough", name: "Dough", emoji: "🫓" },
];

const customers = ["Mia", "Leo", "Zoe", "Kai", "Ruby"];
let plate = [];
let orders = [];
let score = 0;
let streak = 0;
let lives = 3;
let timeLeft = 90;
let gameActive = false;
let timerId = null;
let cooked = false;

const els = {
  ingredientGrid: document.querySelector("#ingredientGrid"),
  plateIngredients: document.querySelector("#plateIngredients"),
  cookButton: document.querySelector("#cookButton"),
  clearPlate: document.querySelector("#clearPlate"),
  serveButton: document.querySelector("#serveButton"),
  pan: document.querySelector("#pan"),
  panFood: document.querySelector("#panFood"),
  orderList: document.querySelector("#orderList"),
  ticketCount: document.querySelector("#ticketCount"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  hearts: document.querySelector("#hearts"),
  timeLeft: document.querySelector("#timeLeft"),
  toast: document.querySelector("#toast"),
  startScreen: document.querySelector("#startScreen"),
  gameOverScreen: document.querySelector("#gameOverScreen"),
};

function initIngredients() {
  els.ingredientGrid.innerHTML = ingredients.map(item =>
    `<button class="ingredient" type="button" data-id="${item.id}" aria-label="Add ${item.name}">
      <span class="emoji">${item.emoji}</span><span>${item.name}</span>
    </button>`
  ).join("");

  els.ingredientGrid.addEventListener("click", event => {
    const button = event.target.closest(".ingredient");
    if (!button || !gameActive) return;
    if (plate.length >= 4) {
      showToast("Plate is full!");
      return;
    }
    const item = ingredients.find(food => food.id === button.dataset.id);
    plate.push(item);
    cooked = false;
    renderPlate();
  });
}

function renderPlate() {
  els.plateIngredients.innerHTML = plate.map(item =>
    `<span class="plate-food">${item.emoji}</span>`
  ).join("");

  els.panFood.textContent = plate.length
    ? plate.map(item => item.emoji).join(" ")
    : "";
  els.pan.classList.remove("cooking");
}

function clearPlate() {
  plate = [];
  cooked = false;
  renderPlate();
}

function createOrder() {
  const recipe = recipes[Math.floor(Math.random() * recipes.length)];
  return {
    id: Date.now() + Math.random(),
    recipe,
    customer: customers[Math.floor(Math.random() * customers.length)],
    patience: 100,
  };
}

function renderOrders() {
  els.orderList.innerHTML = orders.map((order, index) =>
    `<article class="order-card ${index === 0 ? "active" : ""}">
      <div class="customer">
        <span class="customer-name">${order.customer}'s order</span>
        <div class="patience"><div class="patience-bar" style="width:${order.patience}%"></div></div>
      </div>
      <h3 class="order-name">${order.recipe.emoji} ${order.recipe.name}</h3>
      <div class="order-ingredients">
        ${order.recipe.ingredients.map(id => {
          const item = ingredients.find(food => food.id === id);
          return `<span class="mini-food" title="${item.name}">${item.emoji}</span>`;
        }).join("")}
      </div>
    </article>`
  ).join("");
  els.ticketCount.textContent = orders.length;
}

function serveOrder() {
  if (!gameActive) return;
  if (!orders.length) return;

  if (!cooked) {
    showToast("Cook it first!");
    return;
  }

  const wanted = [...orders[0].recipe.ingredients].sort();
  const given = [...plate.map(item => item.id)].sort();
  const exact = wanted.length === given.length && wanted.every((item, index) => item === given[index]);

  if (exact) {
    score += 100 + Math.round(orders[0].patience) + streak * 20;
    streak += 1;
    showToast(streak >= 3 ? `Perfect! ${streak} streak!` : "Delicious! +100");
    orders.shift();
    while (orders.length < 2) orders.push(createOrder());
  } else {
    lives -= 1;
    streak = 0;
    showToast("Wrong order!");
  }

  clearPlate();
  updateStats();
  renderOrders();

  if (lives <= 0) endGame();
}

function cook() {
  if (!gameActive || cooked) return;
  if (!plate.length) {
    showToast("Add ingredients first!");
    return;
  }

  els.cookButton.disabled = true;
  els.pan.classList.add("cooking");

  let seconds = 3;
  els.cookButton.querySelector("span").textContent = seconds;
  const countdown = setInterval(() => {
    seconds -= 1;
    els.cookButton.querySelector("span").textContent = seconds > 0 ? seconds : "DONE!";
  }, 1000);

  setTimeout(() => {
    clearInterval(countdown);
    cooked = true;
    els.pan.classList.remove("cooking");
    els.cookButton.disabled = false;
    els.cookButton.querySelector("span").textContent = "COOK";
    showToast("Fresh & hot!");
  }, 3000);
}

function updateStats() {
  els.score.textContent = score;
  els.streak.textContent = streak;
  els.hearts.textContent = "❤️ ".repeat(lives).trim() || "—";
  els.timeLeft.textContent = timeLeft;
}

function startGame() {
  plate = [];
  orders = [createOrder(), createOrder()];
  score = 0;
  streak = 0;
  lives = 3;
  timeLeft = 90;
  cooked = false;
  gameActive = true;
  els.startScreen.classList.add("hidden");
  els.gameOverScreen.classList.add("hidden");
  clearInterval(timerId);
  clearPlate();
  renderOrders();
  updateStats();

  timerId = setInterval(() => {
    timeLeft -= 1;
    els.timeLeft.textContent = timeLeft;

    orders.forEach(order => {
      order.patience = Math.max(0, order.patience - 1.25);
    });
    renderOrders();

    if (orders.some(order => order.patience <= 0)) {
      const impatient = orders.findIndex(order => order.patience <= 0);
      if (impatient >= 0) {
        orders.splice(impatient, 1);
        lives -= 1;
        streak = 0;
        showToast("Customer left!");
        while (orders.length < 2) orders.push(createOrder());
        updateStats();
        renderOrders();
      }
    }

    if (timeLeft <= 0 || lives <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(timerId);
  document.querySelector("#finalScore").textContent = score;
  document.querySelector("#resultIcon").textContent = score >= 600 ? "🏆" : "🍳";
  document.querySelector("#resultTitle").textContent = score >= 600 ? "Great service!" : "Nice try!";
  els.gameOverScreen.classList.remove("hidden");
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1500);
}

initIngredients();
els.clearPlate.addEventListener("click", clearPlate);
els.cookButton.addEventListener("click", cook);
els.serveButton.addEventListener("click", serveOrder);
document.querySelector("#startButton").addEventListener("click", startGame);
document.querySelector("#restartButton").addEventListener("click", startGame);
