let statsCharts = {};

function destroyChart(key) {
    if (statsCharts[key]) {
        statsCharts[key].destroy();
        delete statsCharts[key];
    }
}

function formatDateShort(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

async function loadStatistics() {
    const errorEl = document.getElementById("statsError");
    errorEl.classList.add("hidden");

    try {
        const response = await apiFetch("/api/admin/stats");
        if (!response) return;
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Erreur lors du chargement des statistiques.");
        }

        renderSalesEvolutionChart(result.ventes);
        renderTopProductsChart(result.topProduits);
        renderTopCategoriesChart(result.topCategories);
        renderNewUsersChart(result.nouveauxUtilisateurs);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
    }
}

function getChartColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
        accent: styles.getPropertyValue("--color-accent").trim() || "#e09f3e",
        muted: styles.getPropertyValue("--color-muted").trim() || "#A0AEC0",
        text: styles.getPropertyValue("--color-text").trim() || "#111827",
    };
}

function renderSalesEvolutionChart(ventes) {
    destroyChart("sales");
    const colors = getChartColors();
    const ctx = document.getElementById("salesEvolutionChart");

    statsCharts.sales = new Chart(ctx, {
        type: "line",
        data: {
            labels: ventes.map((v) => formatDateShort(v.date)),
            datasets: [{
                label: "Ventes (Ar)",
                data: ventes.map((v) => v.valeur),
                borderColor: colors.accent,
                backgroundColor: colors.accent + "33",
                fill: true,
                tension: 0.3,
                pointRadius: 2,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: colors.muted }, grid: { display: false } },
                y: { ticks: { color: colors.muted }, grid: { color: colors.muted + "22" } },
            },
        },
    });
}

function renderTopProductsChart(topProduits) {
    destroyChart("topProducts");
    const colors = getChartColors();
    const ctx = document.getElementById("topProductsChart");

    statsCharts.topProducts = new Chart(ctx, {
        type: "bar",
        data: {
            labels: topProduits.map((p) => p.nom),
            datasets: [{
                label: "Unités vendues",
                data: topProduits.map((p) => p.quantite),
                backgroundColor: colors.accent,
                borderRadius: 6,
            }],
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: colors.muted }, grid: { color: colors.muted + "22" } },
                y: { ticks: { color: colors.text }, grid: { display: false } },
            },
        },
    });

    const empty = document.getElementById("topProductsEmpty");
    empty.classList.toggle("hidden", topProduits.length > 0);
}

function renderTopCategoriesChart(topCategories) {
    destroyChart("topCategories");
    const colors = getChartColors();
    const ctx = document.getElementById("topCategoriesChart");

    const palette = [colors.accent, "#3b82f6", "#10b981", "#f43f5e", "#8b5cf6", "#eab308", "#06b6d4", "#f97316"];

    statsCharts.topCategories = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: topCategories.map((c) => c.nom),
            datasets: [{
                data: topCategories.map((c) => c.quantite),
                backgroundColor: topCategories.map((_, i) => palette[i % palette.length]),
                borderWidth: 0,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { color: colors.text, boxWidth: 12 } },
            },
        },
    });

    const empty = document.getElementById("topCategoriesEmpty");
    empty.classList.toggle("hidden", topCategories.length > 0);
}

function renderNewUsersChart(nouveauxUtilisateurs) {
    destroyChart("newUsers");
    const colors = getChartColors();
    const ctx = document.getElementById("newUsersChart");

    statsCharts.newUsers = new Chart(ctx, {
        type: "bar",
        data: {
            labels: nouveauxUtilisateurs.map((u) => formatDateShort(u.date)),
            datasets: [{
                label: "Nouveaux clients",
                data: nouveauxUtilisateurs.map((u) => u.valeur),
                backgroundColor: colors.accent,
                borderRadius: 4,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: colors.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, grid: { display: false } },
                y: { ticks: { color: colors.muted, precision: 0 }, grid: { color: colors.muted + "22" } },
            },
        },
    });
}

document.querySelector('[data-section="stats"]')?.addEventListener("click", () => loadStatistics(), { once: true });