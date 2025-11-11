document.addEventListener("DOMContentLoaded", async () => {
	const grid = document.getElementById("games-grid");
	const searchInput = document.getElementById("search-bar");
	const sortBtn = document.getElementById("sort-btn");
	const sortOptions = document.getElementById("sort-options");

	let games = [];

	// -------- FUNCIÓN DE RENDERIZADO --------
	function renderGames(filteredGames) {
		grid.innerHTML = "";

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

	// -------- FUNCIÓN DE ORDENAMIENTO --------
	function sortGames(sortType) {
		let sorted = [...games];

		switch (sortType) {
			case "name-asc":
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name-desc":
				sorted.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "size-asc":
				sorted.sort(
					(a, b) => parseFloat(a.storage_size) - parseFloat(b.storage_size)
				);
				break;
			case "size-desc":
				sorted.sort(
					(a, b) => parseFloat(b.storage_size) - parseFloat(a.storage_size)
				);
				break;
			case "recent":
				sorted = games.slice().reverse();
				break;

			default:
				break;
		}

		renderGames(sorted);
	}

	// -------- CARGA DE JUEGOS --------
	try {
		const response = await fetch("./db/games.json");
		games = await response.json();
		renderGames(games.slice().reverse());

		// -------- FILTRO DE BÚSQUEDA --------
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

	// -------- MENÚ DE ORDENAMIENTO --------
	sortBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		sortOptions.classList.toggle("hidden");
	});

	document.addEventListener("click", (e) => {
		if (!e.target.closest(".sort-dropdown")) {
			sortOptions.classList.add("hidden");
		}
	});

	document.querySelectorAll("#sort-options li").forEach((option) => {
		option.addEventListener("click", (e) => {
			const sortType = e.target.dataset.sort;
			sortGames(sortType);
			sortOptions.classList.add("hidden");
		});
	});
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
