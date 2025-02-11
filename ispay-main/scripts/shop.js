
document.addEventListener("DOMContentLoaded", () => {
    const crystalsButton = document.getElementById("crystals-button");
    const goldButton = document.getElementById("gold-button");
    const subscriptionBanner = document.getElementById("subscription-banner");
    const boosters = document.querySelectorAll(".booster");

    crystalsButton.addEventListener("click", () => {
        const randomCrystals = Math.floor(Math.random() * 1000) + 1;
        crystalsButton.textContent = `Кристаллы: ${randomCrystals}`;
    });

    goldButton.addEventListener("click", () => {
        const randomGold = Math.floor(Math.random() * 1000) + 1;
        goldButton.textContent = `Золото: ${randomGold}`;
    });

    // Инициализация с блоком кристаллов по умолчанию
    crystalsButton.click();
});
