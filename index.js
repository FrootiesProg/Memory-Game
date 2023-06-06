const pokeAPIBaseUrl = "https://pokeapi.co/api/v2/pokemon/";
const game = document.getElementById("game");
const timer = document.getElementById("timer");
const startButton = document.getElementById("startButton");

let firstPick;
let isPaused = true;
let matches;
let countdown;

const colors = {
  fire: "#FDDFDF",
  grass: "#DEFDE0",
  electric: "#FCF7DE",
  water: "#DEF3FD",
  ground: "#f4e7da",
  rock: "#d5d5d4",
  fairy: "#fceaff",
  poison: "#98d7a5",
  bug: "#f8d5a3",
  dragon: "#97b3e6",
  psychic: "#eaeda1",
  flying: "#F5F5F5",
  fighting: "#E6E0D4",
  normal: "#F5F5F5",
};

const loadPokemon = async () => {
  const randomIds = new Set();
  while (randomIds.size < 8) {
    const randomNumber = Math.ceil(Math.random() * 150);
    randomIds.add(randomNumber);
  }
  const pokePromises = [...randomIds].map((id) => fetch(pokeAPIBaseUrl + id));
  const results = await Promise.all(pokePromises);
  return await Promise.all(results.map((res) => res.json()));
};

const startTimer = () => {
  let time = 60;
  timer.textContent = time;

  countdown = setInterval(() => {
    time--;
    timer.textContent = time;
    if (time <= 0) {
      clearInterval(countdown);
      endGame();
    }
  }, 1000);
};

const resetGame = async () => {
  game.innerHTML = "";
  isPaused = true;
  firstPick = null;
  matches = 0;
  clearInterval(countdown);
  timer.textContent = "";
  startButton.disabled = true;
  setTimeout(async () => {
    const loadedPokemon = await loadPokemon();
    displayPokemon([...loadedPokemon, ...loadedPokemon]);
    isPaused = false;
    startTimer();
    startButton.disabled = false;
  }, 200);
};

const endGame = () => {
  isPaused = true;
  clearInterval(countdown);

  if (matches === 8) {
    alert("Congratulations! You win!");
  } else {
    alert("Game Over! You couldn't complete the game in time.");
  }
};

const displayPokemon = (pokemon) => {
  pokemon.sort((_) => Math.random() - 0.5);
  const pokemonHTML = pokemon
    .map((pokemon) => {
      const type = pokemon.types[0]?.type?.name;
      const color = colors[type] || "#F5F5F5";
      return `
          <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}" style="background-color:${color};">
            <div class="front"></div>
            <div class="back rotated" style="background-color:${color};">
              <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
              <h2>${pokemon.name}</h2>
            </div>
          </div>
      `;
    })
    .join("");
  game.innerHTML = pokemonHTML;
};

const clickCard = (e) => {
  const pokemonCard = e.currentTarget;
  const [front, back] = getFrontAndBackFromCard(pokemonCard);
  if (front.classList.contains("rotated") || isPaused) {
    return;
  }
  isPaused = true;
  rotateElements([front, back]);
  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;
    if (firstPokemonName !== secondPokemonName) {
      const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
      setTimeout(() => {
        rotateElements([front, back, firstFront, firstBack]);
        firstPick = null;
        isPaused = false;
      }, 500);
    } else {
      matches++;
      if (matches === 8) {
        clearInterval(countdown);
        endGame();
      }
      firstPick = null;
      isPaused = false;
    }
  }
};

const getFrontAndBackFromCard = (card) => {
  const front = card.querySelector(".front");
  const back = card.querySelector(".back");
  return [front, back];
};

const rotateElements = (elements) => {
  if (typeof elements !== "object" || !elements.length) return;
  elements.forEach((element) => element.classList.toggle("rotated"));
};

startButton.addEventListener("click", resetGame);
