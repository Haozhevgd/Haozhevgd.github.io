/* jshint esversion: 6 */
// Show/hide sections (navigation)

function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const selectedSection = document.getElementById(id);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // Reset animation
        selectedSection.classList.remove('section');
        void selectedSection.offsetWidth; // Trigger reflow
        selectedSection.classList.add('section');
    }
}

const moneyAudio = new Audio("audio/Money.mp3");
// Show default section on page load
window.onload = () => {
    showSection('types');
    initGame(); // Initialize game on load (optional)
};

const btnFS=document.querySelector("#btnFS");
const btnWS=document.querySelector("#btnWS");
btnFS.addEventListener("click",enterFullscreen);
btnWS.addEventListener("click",exitFullscreen);
function enterFullscreen() { //must be called by user generated event
if (document.documentElement.requestFullscreen) {
document.documentElement.requestFullscreen();
} else if (document.documentElement.mozRequestFullScreen) { // Firefox
document.documentElement.mozRequestFullScreen();
} else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
document.documentElement.webkitRequestFullscreen();
} else if (document.documentElement.msRequestFullscreen) { // IE/Edge
document.documentElement.msRequestFullscreen();
}
}
function exitFullscreen() {
if (document.exitFullscreen) {
document.exitFullscreen();
} else if (document.mozCancelFullScreen) { // Firefox
document.mozCancelFullScreen();
} else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
document.webkitExitFullscreen();
} else if (document.msExitFullscreen) { // IE/Edge
document.msExitFullscreen();
}
}
/* ==========================
    Quiz Code
========================== */

document.getElementById('startQuizButton').addEventListener('click', startQuiz);

let currentQuestion = 0;
let score = 0;
let userAnswers = []; // Array to store the user's answers

const questions = [
    { question: "Is milk a good source of calcium?", answer: "yes" },
    { question: "Does milk contain gluten?", answer: "no" },
    { question: "Is almond milk dairy-free?", answer: "yes" },
    { question: "Is soy milk a good source of protein?", answer: "yes" },
    { question: "Is casein the primary protein found in cow's milk?", answer: "yes" },
    { question: "Does pasteurization destroy all vitamins in milk?", answer: "no" },
    { question: "Is lactose the sugar naturally present in milk?", answer: "yes" },
    { question: "Does milk from grass-fed cows have higher omega-3 fatty acids?", answer: "yes" },
    { question: "Is A2 milk free of the A1 beta-casein protein variant?", answer: "yes" },
    { question: "Does homogenization separate cream from milk?", answer: "no" },
    { question: "Is vitamin B12 naturally found only in animal-derived milk?", answer: "yes" },
    { question: "Does raw milk pose a higher risk of bacterial contamination?", answer: "yes" },
    { question: "Is milk an effective source of bioavailable calcium?", answer: "yes" },
    { question: "Do all types of plant-based milk contain protein levels comparable to cow’s milk?", answer: "no" }
];

function startQuiz() {
    score = 0;
    currentQuestion = 0;
    userAnswers = []; // Reset user's answers
    document.getElementById("quiz-container").style.display = "block";
    document.getElementById("startQuizButton").style.display = "none";
    document.getElementById("quiz-result").textContent = "";
    showQuestion();
}

function showQuestion() {
    if (currentQuestion < questions.length) {
        document.getElementById("question").textContent = questions[currentQuestion].question;
    }
}

function checkAnswer(answer) {
    if (currentQuestion >= questions.length) return; // Ignore if quiz ended

    // Store user's answer
    userAnswers.push(answer);

    if (answer === questions[currentQuestion].answer) {
        score++;
    }
    currentQuestion++;

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        displayResults();
    }
}

function displayResults() {
    document.getElementById("quiz-result").textContent = `You scored ${score} out of ${questions.length}.`;

    // Display which questions were correct and which were wrong
    let resultHTML = "<h3>Results:</h3><ul>";
    for (let i = 0; i < questions.length; i++) {
        let result = userAnswers[i] === questions[i].answer ? "Correct" : "Wrong";
        resultHTML += `<li><strong>Q${i + 1}:</strong> ${questions[i].question}<br>Your answer: ${userAnswers[i]}<br>Result: ${result}</li>`;
    }
    resultHTML += "</ul>";

    // Display results
    document.getElementById("quiz-result").innerHTML += resultHTML;

    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("startQuizButton").style.display = "block";

    // setTimeout(() => {
    //     if (confirm("Do you want to restart the quiz?")) {
    //         startQuiz();
    //     }
    // }, 1000);
}

const gameState = {
    milk: 0,
    milkPerClick: 1,
    pmilkPerClick: 1,
    critChance: 0.05,  
    autoMilkPerSecond: 0,
    autoSpeed: 1000,   // in milliseconds
    cheese: 0,
    milkMultiplier: 1,
    cheeseMultiplier: 1, // for prestige gains
    cheeseMilkBonus: false, // one-time bonus flag
    finalUpgrades: {
  appetizer: false,
  mainCourse: false,
  dessert: false
},
gameWon: false,
    upgrades: {
        milkPerClickLevel: 0,
        critChanceLevel: 0,
        autoMilkLevel: 0,
        autoSpeedLevel: 0,
        prestigeCheeseBoostLevel: 0,
        milkClickLevel: 0,
    },
    prestigeUnlocked: false
    
};

let autoInterval = null;

function initGame() {
    const gameSection = document.getElementById('game');
    if (!gameSection) return;

    // Add a message display area for feedback
    gameSection.innerHTML = `
    <h2>Milk Incremental Game</h2>
    <div class="resource-display">
        <p>Milk: <span id="milkAmount">0</span></p>
        <p>Cheese: <span id="cheeseAmount">0</span></p>
    </div>
    <!-- Message display area -->
    <div id="gameMessage" style="min-height: 24px; margin-bottom: 10px; color: green; font-weight: bold;"></div>

    <button id="milkButton">Get Milk</button>

    <div class="upgrades">
        <h3>Upgrades</h3>
        <button id="upgradeMilkPerClick">Increase Milk per Click (Cost: 10 Milk)</button>
        <button id="upgradeCritChance">Increase Critical Hit Chance (Cost: 15 Milk)</button>
        <button id="upgradeAutoMilk">Unlock Auto Milk Generator (Cost: 300 Milk)</button>
        <button id="upgradeAutoSpeed">Increase Auto Generator Speed (Cost: 50 Milk)</button>
    </div>

    <div class="prestige" style="margin-top: 20px;">
        <h3>Prestige</h3>
        <button id="prestigeReset" disabled>Reset to generate Cheese (Requires 1000 Milk)</button>
        <p id="prestigeMessage" style="color: green; min-height: 1.5em; margin-top: 8px;"></p>

        <h3>Cheese Upgrades</h3>
        <button id="cheeseUpgradeMilkClick" onclick="buyMilkClickUpgrade()">Cheese Milk Click Upgrade</button>
        <button id="cheeseUpgradePrestige" onclick="buyCheesePrestigeBoost()">Cheese Prestige Boost</button>
        <button id="cheeseMilkBonus" onclick="buyMilkBonusFromCheese()">Milk Bonus from Cheese</button>
    </div>

    <div class="final-upgrades" style="margin-top: 30px;">
        <h3>Final Course (Endgame)</h3>
        <button id="finalAppetizer"> Cheese Fondue - Cost: 10,000 Milk, 100 Cheese</button>
        <button id="finalMainCourse"> Creamy Milk Stew - Cost: 25,000 Milk, 250 Cheese</button>
        <button id="finalDessert"> Cheesecake Supreme - Cost: 50,000 Milk, 500 Cheese</button>
    </div>
`;

    // Event listeners
    document.getElementById('milkButton').addEventListener('click', milkClick);
    document.getElementById('upgradeMilkPerClick').addEventListener('click', buyMilkPerClickUpgrade);
    document.getElementById('upgradeCritChance').addEventListener('click', buyCritChanceUpgrade);
    document.getElementById('upgradeAutoMilk').addEventListener('click', buyAutoMilkUpgrade);
    document.getElementById('upgradeAutoSpeed').addEventListener('click', buyAutoSpeedUpgrade);
    document.getElementById('prestigeReset').addEventListener('click', prestigeReset);
    document.getElementById('cheeseUpgradeMilkClick').addEventListener('click', buyMilkClickUpgrade);
    document.getElementById('cheeseUpgradePrestige').addEventListener('click', buyCheesePrestigeBoost);
    document.getElementById('cheeseMilkBonus').addEventListener('click', buyMilkBonusFromCheese);
    document.getElementById("finalAppetizer").addEventListener("click", buyFinalAppetizer);
    document.getElementById("finalMainCourse").addEventListener("click", buyFinalMainCourse);
    document.getElementById("finalDessert").addEventListener("click", buyFinalDessert);


    updateUI();
    startAutoMilk();
}

function showMessage(text, color = 'green') {
    const msgDiv = document.getElementById('gameMessage');
    msgDiv.textContent = text;
    msgDiv.style.color = color;

    // Optional: clear the message after 3 seconds
    clearTimeout(showMessage.timeout);
    showMessage.timeout = setTimeout(() => {
        msgDiv.textContent = '';
    }, 3000);
}

function milkClick() {
    let milkGained = gameState.milkPerClick * gameState.pmilkPerClick;

    // Critical hit?
    if (Math.random() <gameState.critChance) {
        milkGained *= 2;
        showMessage('Critical hit! Milk gained doubled.');
    }
// Cheese-based milk boost
    let cheeseBonusMultiplier = 1;
    if (gameState.cheeseMilkBonus) {
        cheeseBonusMultiplier += gameState.cheese * 0.00005; // +0.005% per cheese
    }

    milkGained *= gameState.milkMultiplier * cheeseBonusMultiplier;
    milkGained = Math.floor(milkGained);

    gameState.milk += milkGained;
    updateUI();
    checkPrestigeUnlock();
}

function buyMilkPerClickUpgrade() {
    const cost = 10 * (gameState.upgrades.milkPerClickLevel + 1);
    if (gameState.milk >= cost) {
        gameState.milk -= cost;
        gameState.upgrades.milkPerClickLevel++;

        // Update effective milkPerClick = base milkPerClick * pmilkPerClick
        const baseMilkPerClick = 1 + gameState.upgrades.milkPerClickLevel;
        gameState.milkPerClick = baseMilkPerClick * gameState.pmilkPerClick;
        moneyAudio.play();
        updateUI();
    } else {
        showMessage('Not enough milk for this upgrade!', 'red');
    }
}

function buyCritChanceUpgrade() {
    const cost = 15 * (gameState.upgrades.critChanceLevel + 1);
    if (gameState.milk >= cost) {
        gameState.milk -= cost;
        gameState.upgrades.critChanceLevel++;
        gameState.critChance = Math.min(0.5, gameState.critChance + 0.005);
        moneyAudio.play();
        updateUI();
    } else {
        showMessage('Not enough milk for this upgrade!', 'red');
    }
}

function buyAutoMilkUpgrade() {
    const cost = 300 * (gameState.upgrades.autoMilkLevel + 1);
    if (gameState.milk >= cost && gameState.upgrades.autoMilkLevel === 0) {
        gameState.milk -= cost;
        gameState.upgrades.autoMilkLevel++;
        gameState.autoMilkPerSecond += 1;
        moneyAudio.play();
        updateUI();
        startAutoMilk();

        // Hide the Auto Milk Upgrade button after buying it once
        const autoMilkBtn = document.getElementById('upgradeAutoMilk');
        if (autoMilkBtn) {
            autoMilkBtn.style.display = 'none';
        }
    } else if (gameState.upgrades.autoMilkLevel > 0) {
        showMessage('Auto Milk Generator already unlocked!', 'red');
    } else {
        showMessage('Not enough milk for this upgrade!', 'red');
    }
}

function buyAutoSpeedUpgrade() {
    if (gameState.upgrades.autoMilkLevel === 0) {
        alert('You must buy the Auto Milk Generator first!');
        return;
    }

    const cost = 50 * (gameState.upgrades.autoSpeedLevel + 1);
    if (gameState.milk >= cost) {
        gameState.milk -= cost;
        gameState.upgrades.autoSpeedLevel++;
        // Increase speed by reducing interval by 100ms each level but minimum 200ms
        gameState.autoSpeed = Math.max(200, gameState.autoSpeed - 100);
       moneyAudio.play();
        restartAutoMilk();
        updateUI();
    } 
}

function startAutoMilk() {
    if (autoInterval) clearInterval(autoInterval);
    if (gameState.autoMilkPerSecond > 0) {
        autoInterval = setInterval(() => {
            gameState.milk += gameState.autoMilkPerSecond * gameState.milkMultiplier;
            updateUI();
            checkPrestigeUnlock();
        }, gameState.autoSpeed);
    }
}

function restartAutoMilk() {
    startAutoMilk();
}

// Prestige Upgrades
function buyMilkClickUpgrade() {
    const cost = Math.pow(3, gameState.upgrades.milkClickLevel); // 1, 3, 9, 27...

    if (gameState.cheese >= cost) {
        gameState.cheese -= cost;
        gameState.upgrades.milkClickLevel++;

        // Double the prestige milk per click multiplier
        gameState.pmilkPerClick *= 2;

        // Update effective milkPerClick = base milkPerClick (including normal upgrades) * pmilkPerClick
        // Assume baseMilkPerClick = 1 + milkPerClickLevel upgrades
        const baseMilkPerClick = 1 + gameState.upgrades.milkPerClickLevel;
        gameState.milkPerClick = baseMilkPerClick * gameState.pmilkPerClick;
moneyAudio.play();
        showMessage(`Milk per click doubled! Now: ${gameState.milkPerClick}`);
        updateUI();
    } else {
        showMessage("Not enough cheese for this upgrade!", "red");
    }
}
function buyCheesePrestigeBoost() {
    const baseCost = 10;
    const cost = baseCost * Math.pow(2, gameState.upgrades.prestigeCheeseBoostLevel); // 10, 20, 40...

    if (gameState.cheese >= cost) {
        gameState.cheese -= cost;
        gameState.upgrades.prestigeCheeseBoostLevel++;
        gameState.cheeseMultiplier += 1;
moneyAudio.play();
        showMessage(`Cheese gained from prestige increased! Now: x${gameState.cheeseMultiplier}`);
        updateUI();
    } else {
        showMessage("Not enough cheese for this upgrade!", "red");
    }
}
function buyMilkBonusFromCheese() {
    const cost = 7;

    if (gameState.cheese >= cost && !gameState.cheeseMilkBonus) {
        gameState.cheese -= cost;
        gameState.cheeseMilkBonus = true;
        showMessage("Milk production bonus unlocked based on cheese count!");
            moneyAudio.play();
        updateUI();
    } else if (gameState.cheeseMilkBonus) {
        showMessage("This upgrade has already been purchased.", "orange");
    } else {
        showMessage("Not enough cheese for this upgrade!", "red");
    }
}
function updateUI() {
    document.getElementById('milkAmount').textContent = Math.floor(gameState.milk);
    document.getElementById('cheeseAmount').textContent = Math.floor(gameState.cheese);

    // 💡 Calculate cheese milk bonus multiplier (if active)
    let cheeseBonusMultiplier = 1;
    if (gameState.cheeseMilkBonus) {
        cheeseBonusMultiplier += gameState.cheese * 0.00005; // +0.005% per cheese
    }

    // Upgrade costs
    const milkPerClickCost = 10 * (gameState.upgrades.milkPerClickLevel + 1);
    const critChanceCost = 15 * (gameState.upgrades.critChanceLevel + 1);
    const autoMilkCost = 300 * (gameState.upgrades.autoMilkLevel + 1);
    const autoSpeedCost = 50 * (gameState.upgrades.autoSpeedLevel + 1);
const prestigeBoostCost = 10 * Math.pow(2, gameState.upgrades.prestigeCheeseBoostLevel);
const cheeseCost = Math.pow(3, gameState.upgrades.milkClickLevel);
    // Milk per click button
    const milkPerClickBtn = document.getElementById('upgradeMilkPerClick');
    milkPerClickBtn.textContent = 
        `Increase Milk per Click (Cost: ${milkPerClickCost} Milk) — Current: ${gameState.milkPerClick}`;
    milkPerClickBtn.disabled = gameState.milk <milkPerClickCost;

    // Crit chance button
    const critChanceBtn = document.getElementById('upgradeCritChance');
    critChanceBtn.textContent = 
        `Increase Critical Hit Chance (Cost: ${critChanceCost} Milk) — Current: ${(gameState.critChance * 100).toFixed(1)}%`;
    critChanceBtn.disabled = gameState.milk <critChanceCost;

    // Auto milk button (hide if bought)
    const autoMilkBtn = document.getElementById('upgradeAutoMilk');
    if (gameState.upgrades.autoMilkLevel > 0) {
        autoMilkBtn.style.display = 'none';
    } else {
        autoMilkBtn.style.display = 'inline-block';
        autoMilkBtn.textContent = `Unlock Auto Milk Generator (Cost: ${autoMilkCost} Milk)`;
        autoMilkBtn.disabled = gameState.milk <autoMilkCost;
    }

    // Auto speed button
    const autoSpeedBtn = document.getElementById('upgradeAutoSpeed');
    autoSpeedBtn.textContent = `Increase Auto Generator Speed (Cost: ${autoSpeedCost} Milk)`;
    autoSpeedBtn.disabled = gameState.upgrades.autoMilkLevel === 0 || gameState.milk <autoSpeedCost;

    // Prestige button
    const prestigeBtn = document.getElementById('prestigeReset');
    prestigeBtn.disabled = gameState.milk <1000;

   const milkClickCheeseBtn = document.getElementById('cheeseUpgradeMilkClick');
const cheesePrestigeBtn = document.getElementById('cheeseUpgradePrestige');
const milkBonusBtn = document.getElementById('cheeseMilkBonus');

    milkClickCheeseBtn.textContent = `Double Milk/Click - Cost: ${cheeseCost} Cheese`;
    milkClickCheeseBtn.disabled = gameState.cheese <cheeseCost;


    cheesePrestigeBtn.textContent = `Boost Prestige Cheese Gain - Cost: ${prestigeBoostCost} Cheese`;
    cheesePrestigeBtn.disabled = gameState.cheese <prestigeBoostCost;


    milkBonusBtn.textContent = `Milk Bonus from Cheese (One-time, 7 Cheese)`;
    milkBonusBtn.disabled = gameState.cheese <7 || gameState.cheeseMilkBonus;

    const finalAppetizerMilkCost = 10000;
    const finalAppetizerCheeseCost = 100;

    const finalMainCourseMilkCost = 25000;
    const finalMainCourseCheeseCost = 250;

    const finalDessertMilkCost = 50000;
    const finalDessertCheeseCost = 500;

    const finalAppetizerBtn = document.getElementById("finalAppetizer");
    const finalMainCourseBtn = document.getElementById("finalMainCourse");
    const finalDessertBtn = document.getElementById("finalDessert");

    // Disable if already bought (true means bought)
    // OR if not enough resources
    finalAppetizerBtn.disabled = gameState.finalUpgrades.appetizer || 
        gameState.milk < finalAppetizerMilkCost || gameState.cheese <finalAppetizerCheeseCost;

    finalMainCourseBtn.disabled = gameState.finalUpgrades.mainCourse || 
        gameState.milk < finalMainCourseMilkCost || gameState.cheese <finalMainCourseCheeseCost;

    finalDessertBtn.disabled = gameState.finalUpgrades.dessert || 
        gameState.milk < finalDessertMilkCost || gameState.cheese <finalDessertCheeseCost;
}
function checkPrestigeUnlock() {
    if (!gameState.prestigeUnlocked && gameState.milk >= 1000) {
        gameState.prestigeUnlocked = true;
        showMessage('You can now prestige and unlock cheese! Reset to get Cheese!');
    }
}

function prestigeReset() {
    if (gameState.milk <1000) {
        showMessage('You need at least 1000 Milk to prestige!', 'red');
        return;
    }

    // Instead of confirm pop-up, just reset directly
    // If you want, you can add a confirmation button or UI before this reset in your HTML.

    // Reset progress but keep multiplier and cheese unlocked
   
        // Calculate cheese to add
        const cheeseToAdd = Math.floor(gameState.milk / 1000) * gameState.cheeseMultiplier;
        
        // Add cheese to game state
        gameState.cheese += cheeseToAdd;
    gameState.milk = 0;
     const pmilkPerClick = gameState.pmilkPerClick;
    gameState.milkPerClick =  1* pmilkPerClick;
    gameState.critChance = 0.05;
    gameState.autoMilkPerSecond = 0;
    gameState.autoSpeed = 1000;
    gameState.milkMultiplier= 1;
    gameState.upgrades= {
        milkPerClickLevel: 0,
        critChanceLevel: 0,
        autoMilkLevel: 0,
        autoSpeedLevel: 0,
        prestigeCheeseBoostLevel: gameState.upgrades.prestigeCheeseBoostLevel, 
    milkClickLevel: gameState.upgrades.milkClickLevel,
    };

    gameState.prestigeUnlocked = true; // reset unlock to false, can re-unlock next prestige cycle
    restartAutoMilk();
    updateUI();
    showMessage('Prestige complete!');
}

function resetApp() {
    // Reset Quiz
    score = 0;
    currentQuestion = 0;
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("startQuizButton").style.display = "block";
    document.getElementById("quiz-result").textContent = "";

    // Reset Game State
    gameState.milk = 0;
    gameState.milkPerClick = 1 * gameState.pmilkPerClick;
    gameState.critChance = 0.05;
    gameState.autoMilkPerSecond = 0;
    gameState.autoSpeed = 1000;
    gameState.cheese = 0;
    gameState.milkMultiplier = 1;

    // Reset upgrades
    gameState.upgrades = {
        milkPerClickLevel: 0,
        critChanceLevel: 0,
        autoMilkLevel: 0,
        autoSpeedLevel: 0,
        prestigeCheeseBoostLevel: 0,
        milkClickLevel: 0,
    };

    // Reset cheese milk bonus flag
    gameState.cheeseMilkBonus = false;

    // Reset final upgrades
    gameState.finalUpgrades = {
        appetizer: false,
        mainCourse: false,
        dessert: false,
    };

    gameState.prestigeUnlocked = true;

    // Stop any auto milk
    if (autoInterval) clearInterval(autoInterval);

    // Reinitialize game UI
    initGame();

    console.log("App has been fully reset!");
}

function buyFinalAppetizer() {
  if (gameState.milk >= 10000 && gameState.cheese >= 100 && !gameState.finalUpgrades.appetizer) {
    gameState.milk -= 10000;
    gameState.cheese -= 100;
    gameState.finalUpgrades.appetizer = true;
    showMessage("Appetizer served: Cheese Fondue!");
    moneyAudio.play();
    updateUI();
    checkForWin();
  } else {
    showMessage("You need 10,000 Milk and 100 Cheese!", 'red');
  }
}

function buyFinalMainCourse() {
  if (gameState.milk >= 25000 && gameState.cheese >= 250 && !gameState.finalUpgrades.mainCourse) {
    gameState.milk -= 25000;
    gameState.cheese -= 250;
    gameState.finalUpgrades.mainCourse = true;
    showMessage("Main Course served: Creamy Milk Stew!");
    moneyAudio.play();
    updateUI();
    checkForWin();
  } else {
    showMessage("You need 25,000 Milk and 250 Cheese!", 'red');
  }
}

function buyFinalDessert() {
  if (gameState.milk >= 50000 && gameState.cheese >= 500 && !gameState.finalUpgrades.dessert) {
    gameState.milk -= 50000;
    gameState.cheese -= 500;
    gameState.finalUpgrades.dessert = true;
    showMessage("Dessert served: Cheesecake Supreme!");
    moneyAudio.play();
    updateUI();
    checkForWin();
  } else {
    showMessage("You need 50,000 Milk and 500 Cheese!", 'red');
  }
}

function checkForWin() {
  const f = gameState.finalUpgrades;
  if (f.appetizer && f.mainCourse && f.dessert && !gameState.gameWon) {
    gameState.gameWon = true;
    alert("🎉 You’ve completed the Three-Course Meal! You Win!");
    showMessage("🎊 Victory! Your milk and cheese journey ends in culinary glory!");
    // Optional: stop game functions or disable all buttons
  }
}