document.addEventListener("DOMContentLoaded", async () => {
	const grid = document.getElementById("games-grid");
	const searchInput = document.getElementById("search-bar");
	const sortBtn = document.getElementById("sort-btn");
	const sortOptions = document.getElementById("sort-options");
	const favoritesBtn = document.getElementById("favorites-btn");
	const favoritesModal = document.getElementById("favorites-modal");
	const favoritesCloseBtn = document.getElementById("favorites-close-btn");
	const favoritesList = document.getElementById("favorites-list");
	let games = [];

	const FAVORITES_KEY = "joycon-lab-favorites";

	function loadFavorites() {
		try {
			return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
		} catch {
			return [];
		}
	}

	function saveFavorites() {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
	}

	let favoriteIds = loadFavorites();

	function isFavorite(gameId) {
		return favoriteIds.includes(gameId);
	}

	function toggleFavorite(gameId) {
		favoriteIds = isFavorite(gameId)
			? favoriteIds.filter((id) => id !== gameId)
			: [...favoriteIds, gameId];
		saveFavorites();

		const cardBtn = grid.querySelector(
			`.favorite-btn[data-game-id="${gameId}"]`,
		);
		if (cardBtn) {
			const active = isFavorite(gameId);
			cardBtn.classList.toggle("is-favorite", active);
			cardBtn.setAttribute("aria-pressed", String(active));
		}

		if (favoritesModal.classList.contains("is-open")) {
			renderFavoritesModal();
		}
	}

	// Rendering
	function renderGames(filteredGames) {
		grid.innerHTML = "";

		if (filteredGames.length === 0) {
			grid.innerHTML = `
<div class="empty-state">
<span class="empty-icon">🎮</span>
<p>No se encontró ningún juego</p>
</div>
`;
			return;
		}

		filteredGames.forEach((game) => {
			const genreChips = game.genre
				.split(",")
				.map((g) => `<span class="genre-chip">${g.trim()}</span>`)
				.join("");

			const card = document.createElement("div");
			card.classList.add("game-card");
			card.innerHTML = `
<a class="game-card-link" href="${game.eshop_link}" target="_blank" rel="noopener noreferrer">
<img class="game-image" src="${game.image_url}" alt="${game.name}" loading="lazy" decoding="async" />
<div class="game-info">
<h3 class="game-title">${game.name}</h3>
<div class="game-genres">${genreChips}</div>
<p class="game-size">
<img class="size-icon" src="./assets/icons/floppy-disk-back-bold.svg" alt="" />
${game.storage_size} GB
</p>
</div>
</a>
<button
type="button"
class="favorite-btn${isFavorite(game.id) ? " is-favorite" : ""}"
data-game-id="${game.id}"
aria-pressed="${isFavorite(game.id)}"
aria-label="Agregar a favoritos"
>
<svg class="favorite-icon" viewBox="0 0 256 256" aria-hidden="true">
<path class="favorite-icon-outline" d="M225.84,54.13A62.07,62.07,0,0,0,138.32,54L128,63.58,117.68,54a62,62,0,0,0-87.58,87.8l89.35,90.65a12,12,0,0,0,17.1,0l89.29-90.59a62,62,0,0,0,0-87.7Zm-17,70.79L128,206.9,47.13,124.85a38,38,0,0,1,53.74-53.74c.1.1.2.2.31.29l18.64,17.36a12,12,0,0,0,16.36,0L154.82,71.4c.11-.09.21-.19.31-.29a38,38,0,1,1,53.68,53.81Z" />
<path class="favorite-icon-fill" d="M240,98a57.63,57.63,0,0,1-17,41L133.7,229.62a8,8,0,0,1-11.4,0L33,139a58,58,0,0,1,82-82.1L128,69.05l13.09-12.19A58,58,0,0,1,240,98Z" />
</svg>
</button>
`;
			grid.appendChild(card);
		});

		grid.querySelectorAll(".favorite-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				toggleFavorite(Number(btn.dataset.gameId));
			});
		});
	}

	// Sorting
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
				sorted.sort((a, b) => a.storage_size - b.storage_size);
				break;
			case "size-desc":
				sorted.sort((a, b) => b.storage_size - a.storage_size);
				break;
			case "recent":
				sorted = games.slice().reverse();
				break;
			default:
				break;
		}
		renderGames(sorted);
	}

	// Load games
	try {
		const response = await fetch("./db/games.json");
		games = await response.json();
		renderGames(games.slice().reverse());

		// Search filter
		searchInput.addEventListener("input", (e) => {
			const query = e.target.value.toLowerCase().trim();
			const filtered = games.filter(
				(game) =>
					game.name.toLowerCase().includes(query) ||
					game.genre.toLowerCase().includes(query),
			);
			renderGames(filtered);
		});
	} catch (error) {
		console.error("Error cargando los juegos:", error);
		grid.innerHTML = "<p>Error al cargar el catálogo.</p>";
	}

	// Sort menu
	sortBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		const isOpen = !sortOptions.classList.contains("hidden");
		sortOptions.classList.toggle("hidden");
		sortBtn.setAttribute("aria-expanded", String(!isOpen));
	});
	document.addEventListener("click", (e) => {
		if (!e.target.closest(".sort-dropdown")) {
			sortOptions.classList.add("hidden");
			sortBtn.setAttribute("aria-expanded", "false");
		}
	});
	document.querySelectorAll("#sort-options li").forEach((option) => {
		option.addEventListener("click", (e) => {
			const sortType = e.target.dataset.sort;
			sortGames(sortType);
			sortOptions.classList.add("hidden");
			sortBtn.setAttribute("aria-expanded", "false");
		});
	});

	// Favorites modal
	function renderFavoritesModal() {
		favoritesList.innerHTML = "";

		const favoriteGames = games.filter((game) => favoriteIds.includes(game.id));

		if (favoriteGames.length === 0) {
			favoritesList.innerHTML = `<li class="favorites-empty">Aún no tienes juegos favoritos</li>`;
			return;
		}

		favoriteGames.forEach((game) => {
			const item = document.createElement("li");
			item.classList.add("favorites-item");
			item.innerHTML = `
<img class="favorites-item-image" src="${game.image_url}" alt="${game.name}" loading="lazy" />
<div class="favorites-item-info">
<p class="favorites-item-name">${game.name}</p>
<p class="favorites-item-genre">${game.genre}</p>
<p class="favorites-item-size">${game.storage_size} GB</p>
</div>
<button type="button" class="favorites-remove-btn" data-game-id="${game.id}">Eliminar</button>
`;
			favoritesList.appendChild(item);
		});

		favoritesList.querySelectorAll(".favorites-remove-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				toggleFavorite(Number(btn.dataset.gameId));
			});
		});
	}

	function openFavoritesModal() {
		renderFavoritesModal();
		favoritesModal.classList.add("is-open");
		document.body.classList.add("modal-open");
		favoritesCloseBtn.focus({ preventScroll: true });
	}

	function closeFavoritesModal() {
		favoritesModal.classList.remove("is-open");
		document.body.classList.remove("modal-open");
		favoritesBtn.focus({ preventScroll: true });
	}

	favoritesBtn.addEventListener("click", openFavoritesModal);
	favoritesCloseBtn.addEventListener("click", closeFavoritesModal);
	favoritesModal.addEventListener("click", (e) => {
		if (e.target === favoritesModal) {
			closeFavoritesModal();
		}
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && favoritesModal.classList.contains("is-open")) {
			closeFavoritesModal();
		}
	});
});

// Scroll-in animation observer
const animatedElements = document.querySelectorAll(
	".show-up, .show-down, .bounce-in",
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
	{ root: null, rootMargin: "0px", threshold: 0.2 },
);
animatedElements.forEach((el) => observer.observe(el));

// Supabase visit counter
async function trackProjectActivity(projectName) {
	try {
		const { error } = await _supabase.rpc("increment_visit", {
			name_param: projectName,
		});
		if (error) throw error;
	} catch (err) {
		console.warn("Offline mode");
	}
}
trackProjectActivity("JoyCon-Lab");
