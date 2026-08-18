document.addEventListener("DOMContentLoaded", async () => {
	const grid = document.getElementById("games-grid");
	const searchInput = document.getElementById("search-bar");
	const sortBtn = document.getElementById("sort-btn");
	const sortOptions = document.getElementById("sort-options");
	let games = [];

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

			const card = document.createElement("a");
			card.classList.add("game-card");
			card.href = game.eshop_link;
			card.target = "_blank";
			card.rel = "noopener noreferrer";
			card.innerHTML = `
<img class="game-image" src="${game.image_url}" alt="${game.name}" loading="lazy" decoding="async" />
<div class="game-info">
<h3 class="game-title">${game.name}</h3>
<div class="game-genres">${genreChips}</div>
<p class="game-size">
<img class="size-icon" src="./assets/icons/floppy-disk-back-bold.svg" alt="" />
${game.storage_size} GB
</p>
</div>
`;
			grid.appendChild(card);
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
