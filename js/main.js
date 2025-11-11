document.addEventListener("DOMContentLoaded", async () => {
	const grid = document.getElementById("games-grid");
	const searchInput = document.getElementById("search-bar");

	let games = [];

	function renderGames(filteredGames) {
		grid.innerHTML = "";

		if (filteredGames.length === 0) {
			grid.innerHTML = "<p>No se encontraron juegos.</p>";
			return;
		}

		filteredGames.forEach((game) => {
			const card = document.createElement("a");
			card.classList.add("game-card");
			card.href = game.eshop_link;
			card.target = "_blank";
			card.innerHTML = `
				<img class="game-image" src="${game.image_url}" alt="${game.name}" />
				<div class="game-info">
					<h3 class="game-title">${game.name}</h3>
					<p class="game-genre">${game.genre}</p>
					<p class="game-size">${game.storage_size} GB</p>
				</div>
			`;
			grid.appendChild(card);
		});
	}

	try {
		const response = await fetch("./db/games.json");
		games = await response.json();

		renderGames(games);

		searchInput.addEventListener("input", (e) => {
			const query = e.target.value.toLowerCase().trim();

			const filtered = games.filter(
				(game) =>
					game.name.toLowerCase().includes(query) ||
					game.genre.toLowerCase().includes(query)
			);

			renderGames(filtered);
		});
	} catch (error) {
		console.error("Error cargando los juegos:", error);
		grid.innerHTML = "<p>Error al cargar el catálogo.</p>";
	}
});

// Interception Observer
const animatedElements = document.querySelectorAll(
	".show-up, .show-down, .show-left, .show-right, .bounce-in, .rotate-left, .rotate-right"
);

const observer = new IntersectionObserver(
	(entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("animated");
				observer.unobserve(entry.target);
			}
		});
	},
	{ root: null, rootMargin: "0px", threshold: 0.2 }
);

animatedElements.forEach((el) => observer.observe(el));

// Temporal
const callAlert = document.getElementById("call-alert");

callAlert.addEventListener("click", function (event) {
	event.preventDefault();
	alert("Función en desarrollo");
});
