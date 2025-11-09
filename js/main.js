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

document.addEventListener("DOMContentLoaded", () => {
	const contactBtn = document.getElementById("contact-btn");
	const savedBtn = document.getElementById("saved-btn");

	contactBtn.addEventListener("click", () => {
		// Abrir WhatsApp con mensaje predefinido
		window.open("https://wa.me/+5351643954?text=Hola", "_blank");
	});

	savedBtn.addEventListener("click", () => {
		alert("Función aún en desarrollo");
	});
});
