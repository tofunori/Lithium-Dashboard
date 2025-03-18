// Objet pour stocker les références aux graphiques
let charts = {};

// Fonction pour initialiser les graphiques avec Chart.js
function initCharts() {
    // Graphique de distribution par pays
    const countryCtx = document.getElementById('country-chart').getContext('2d');
    charts.country = new Chart(countryCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: CHART_COLORS,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value * 100) / total);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Graphique de distribution par statut
    const statusCtx = document.getElementById('status-chart').getContext('2d');
    charts.status = new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: Object.values(STATUS_COLORS),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value * 100) / total);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Graphique de capacité de recyclage
    const capacityCtx = document.getElementById('capacity-chart').getContext('2d');
    charts.capacity = new Chart(capacityCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Capacité (tpa)',
                data: [],
                backgroundColor: '#4a6bff',
                borderColor: '#3451db',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') + '33'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Mettre à jour immédiatement les graphiques avec toutes les données
    // C'est important pour que les graphiques s'affichent au chargement initial
    setTimeout(() => {
        updateCharts(refineries);
    }, 500);
}

// Fonction pour mettre à jour les graphiques avec de nouvelles données
function updateCharts(filteredRefineries) {
    // S'assurer que les graphiques ont été initialisés
    if (!charts.country || !charts.status || !charts.capacity) {
        console.error('Les graphiques n\'ont pas été initialisés correctement');
        return;
    }
    
    // Mettre à jour le graphique de distribution par pays
    updateCountryChart(filteredRefineries);
    
    // Mettre à jour le graphique de distribution par statut
    updateStatusChart(filteredRefineries);
    
    // Mettre à jour le graphique de capacité
    updateCapacityChart(filteredRefineries);
}

// Mettre à jour le graphique de distribution par pays
function updateCountryChart(refineries) {
    if (!charts.country) return;
    
    // Compter le nombre d'installations par pays
    const countryData = {};
    refineries.forEach(refinery => {
        countryData[refinery.country] = (countryData[refinery.country] || 0) + 1;
    });
    
    // Mettre à jour les données du graphique
    charts.country.data.labels = Object.keys(countryData);
    charts.country.data.datasets[0].data = Object.values(countryData);
    charts.country.update();
}

// Mettre à jour le graphique de distribution par statut
function updateStatusChart(refineries) {
    if (!charts.status) return;
    
    // Compter le nombre d'installations par statut
    const statusData = {};
    refineries.forEach(refinery => {
        statusData[refinery.status] = (statusData[refinery.status] || 0) + 1;
    });
    
    // Mettre à jour les données du graphique
    charts.status.data.labels = Object.keys(statusData);
    charts.status.data.datasets[0].data = Object.values(statusData);
    
    // Mettre à jour les couleurs
    const statusColors = [];
    for (const status of Object.keys(statusData)) {
        statusColors.push(STATUS_COLORS[status] || '#808080');
    }
    charts.status.data.datasets[0].backgroundColor = statusColors;
    
    charts.status.update();
}

// Extraire le nombre à partir d'une chaîne de production
function extractCapacityNumber(production) {
    if (production === 'N/A' || production === 'Variable') {
        return 0;
    }
    
    // Patterns courants dans les chaînes de production
    // 1. "10 000+ tonnes de masse noire par an"
    // 2. "750 000 VE par an (prévu)"
    // 3. "600-1 100 tonnes de pCAM par an"
    // 4. "60 GWh par an (prévu)"
    
    // Cas 1: Extraire les nombres (en ignorant les unités)
    const numericMatch = production.match(/(\d[\d\s]*[\d,\.]+)/);
    if (numericMatch) {
        // Nettoyer et convertir en nombre
        const cleanNum = numericMatch[0].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '');
        const num = parseInt(cleanNum);
        if (!isNaN(num)) {
            return num;
        }
    }
    
    // Cas 2: Extraire la plage et prendre la moyenne
    const rangeMatch = production.match(/(\d[\d\s]*[\d,\.]+)\s*-\s*(\d[\d\s]*[\d,\.]+)/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, ''));
        const max = parseInt(rangeMatch[2].replace(/\s/g, '').replace(/,/g, '').replace(/\./g, ''));
        if (!isNaN(min) && !isNaN(max)) {
            return Math.floor((min + max) / 2);
        }
    }
    
    return 0;
}

// Mettre à jour le graphique de capacité
function updateCapacityChart(refineries) {
    if (!charts.capacity) return;
    
    try {
        // Filtrer et trier les installations par capacité
        const capacityData = refineries
            .filter(r => r.production !== 'N/A' && r.production !== 'Variable')
            .map(r => ({
                name: r.name,
                production: extractCapacityNumber(r.production)
            }))
            .filter(d => d.production > 0)
            .sort((a, b) => b.production - a.production)
            .slice(0, 6); // Limiter à 6 pour la lisibilité
        
        // Mettre à jour les données du graphique
        charts.capacity.data.labels = capacityData.map(d => d.name);
        charts.capacity.data.datasets[0].data = capacityData.map(d => d.production);
        charts.capacity.update();
    } catch (e) {
        console.error('Erreur lors de la mise à jour du graphique de capacité:', e);
    }
}

// Fonction pour mettre à jour les thèmes des graphiques
function updateChartThemes() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color') + '33';
    
    // Mettre à jour les couleurs du texte pour tous les graphiques
    for (const chart of Object.values(charts)) {
        if (!chart) continue;
        
        if (chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        
        if (chart.options.scales && chart.options.scales.x) {
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.x.grid.color = borderColor;
        }
        
        if (chart.options.scales && chart.options.scales.y) {
            chart.options.scales.y.ticks.color = textColor;
            if (chart.options.scales.y.grid.display !== false) {
                chart.options.scales.y.grid.color = borderColor;
            }
        }
        
        chart.update();
    }
}