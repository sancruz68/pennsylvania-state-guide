
const cities = [
  {
    id: "philadelphia",
    name: "Philadelphia",
    region: "Eastern",
    category: "History & Culture",
    description:
      "Explore one of Pennsylvania's largest cities, known for its historic landmarks, museums, and food scene.",
    highlights: [
      "Independence Hall",
      "Reading Terminal Market",
      "Philadelphia Museum of Art"
    ]
  },
  {
    id: "pittsburgh",
    name: "Pittsburgh",
    region: "Western",
    category: "City & Architecture",
    description:
      "Discover a city known for its rivers, bridges, distinctive neighborhoods, and industrial history.",
    highlights: [
      "Point State Park",
      "Mount Washington overlooks",
      "Carnegie Museums"
    ]
  },
  {
    id: "harrisburg",
    name: "Harrisburg",
    region: "Central",
    category: "Capital & History",
    description:
      "Visit Pennsylvania's capital along the Susquehanna River, featuring government landmarks and riverfront spaces.",
    highlights: [
      "Pennsylvania State Capitol",
      "City Island",
      "Riverfront Park"
    ]
  },
  {
    id: "york",
    name: "York",
    region: "South Central",
    category: "Historic Downtown",
    description:
      "Explore York's historic downtown, local businesses, markets, and Pennsylvania heritage.",
    highlights: [
      "Central Market House",
      "Downtown York",
      "York County History Center"
    ]
  },
  {
    id: "lancaster",
    name: "Lancaster",
    region: "South Central",
    category: "Markets & Culture",
    description:
      "Experience Lancaster's historic city center, local markets, arts, and surrounding countryside.",
    highlights: [
      "Lancaster Central Market",
      "Gallery Row",
      "Lancaster County countryside"
    ]
  },
  {
    id: "state-college",
    name: "State College",
    region: "Central",
    category: "College Town & Outdoors",
    description:
      "Discover a college town surrounded by central Pennsylvania scenery, parks, and outdoor recreation.",
    highlights: [
      "Penn State University Park",
      "The Arboretum at Penn State",
      "Mount Nittany"
    ]
  }
];

const cityGrid = document.getElementById("cityGrid");
const searchInput = document.getElementById("citySearch");
const regionFilter = document.getElementById("regionFilter");
const savedFilter = document.getElementById("savedFilter");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");

const dialog = document.getElementById("cityDialog");
const closeDialog = document.getElementById("closeDialog");

let showSavedOnly = false;

// Restore saved destinations from browser storage
let savedCities = new Set();

try {
  const stored = JSON.parse(
    localStorage.getItem("pa-saved-cities") || "[]"
  );

  if (Array.isArray(stored)) {
    savedCities = new Set(
      stored.filter(id => typeof id === "string")
    );
  }
} catch {
  savedCities = new Set();
}

function saveFavorites() {
  try {
    localStorage.setItem(
      "pa-saved-cities",
      JSON.stringify([...savedCities])
    );
  } catch {
    // The website remains usable if storage is unavailable.
  }
}

function getFilteredCities() {
  const query = searchInput.value.trim().toLowerCase();
  const region = regionFilter.value;

  return cities.filter(city => {
    const text = [
      city.name,
      city.region,
      city.category,
      city.description
    ].join(" ").toLowerCase();

    const matchesSearch = text.includes(query);
    const matchesRegion =
      region === "all" || city.region === region;
    const matchesSaved =
      !showSavedOnly || savedCities.has(city.id);

    return matchesSearch && matchesRegion && matchesSaved;
  });
}

function createCityCard(city) {
  const article = document.createElement("article");
  article.className = "city-card";

  const isSaved = savedCities.has(city.id);

  // This markup uses only the fixed city data defined above.
  article.innerHTML = `
    <div class="card-visual">
      <span>${city.region.toUpperCase()} PENNSYLVANIA</span>
      <strong>${city.name.slice(0, 2).toUpperCase()}</strong>
    </div>

    <div class="card-content">
      <h3>${city.name}</h3>
      <p>${city.description}</p>

      <div class="card-actions">
        <button
          class="details-button"
          type="button"
          data-open="${city.id}"
        >
          Explore city →
        </button>

        <button
          class="favorite-button"
          type="button"
          data-save="${city.id}"
          aria-pressed="${isSaved}"
          aria-label="${isSaved ? "Remove" : "Save"} ${city.name}"
        >
          ${isSaved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </div>
  `;

  return article;
}

function renderCities() {
  const results = getFilteredCities();

  cityGrid.replaceChildren();

  results.forEach(city => {
    cityGrid.appendChild(createCityCard(city));
  });

  resultsCount.textContent =
    `Showing ${results.length} of ${cities.length} destinations`;

  emptyState.hidden = results.length !== 0;
}

function toggleFavorite(id) {
  if (savedCities.has(id)) {
    savedCities.delete(id);
  } else {
    savedCities.add(id);
  }

  saveFavorites();
  renderCities();
}

function openCityDetails(id) {
  const city = cities.find(item => item.id === id);

  if (!city) return;

  document.getElementById("dialogRegion").textContent =
    `${city.region} Pennsylvania · ${city.category}`;

  document.getElementById("dialogTitle").textContent =
    city.name;

  document.getElementById("dialogDescription").textContent =
    city.description;

  const highlights = document.getElementById(
    "dialogHighlights"
  );

  highlights.replaceChildren();

  city.highlights.forEach(highlight => {
    const item = document.createElement("li");
    item.textContent = highlight;
    highlights.appendChild(item);
  });

  dialog.showModal();
}

// Search and filtering
searchInput.addEventListener("input", renderCities);
regionFilter.addEventListener("change", renderCities);

savedFilter.addEventListener("click", () => {
  showSavedOnly = !showSavedOnly;

  savedFilter.setAttribute(
    "aria-pressed",
    String(showSavedOnly)
  );

  savedFilter.textContent = showSavedOnly
    ? "★ Saved only"
    : "☆ Saved only";

  renderCities();
});

// Card button interactions
cityGrid.addEventListener("click", event => {
  const openButton = event.target.closest("[data-open]");
  const saveButton = event.target.closest("[data-save]");

  if (openButton) {
    openCityDetails(openButton.dataset.open);
  }

  if (saveButton) {
    toggleFavorite(saveButton.dataset.save);
  }
});

// Dialog interactions
closeDialog.addEventListener("click", () => {
  dialog.close();
});

dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    dialog.close();
  }
});

// Initial page render
renderCities();
