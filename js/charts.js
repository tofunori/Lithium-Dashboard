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
}

// Fonction pour mettre à jour les graphiques avec de nouvelles données
function updateCharts(filteredRefineries) {
    // Mettre à jour le graphique de distribution par pays
    updateCountryChart(filteredRefineries);
    
    // Mettre à jour le graphique de distribution par statut
    updateStatusChart(filteredRefineries);
    
    // Mettre à jour le graphique de capacité
    updateCapacityChart(filteredRefineries);
}

// Mettre à jour le graphique de distribution par pays
function updateCountryChart(refineries) {
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

// Mettre à jour le graphique de capacité
function updateCapacityChart(refineries) {
    // Filtrer et trier les installations par capacité
    const capacityData = refineries
        .filter(r => r.production !== 'N/A' && r.production !== 'Variable')
        .map(r => ({
            name: r.name,
            production: parseInt(r.production.replace(/,/g, '')) || 0
        }))
        .sort((a, b) => b.production - a.production)
        .slice(0, 6); // Limiter à 6 pour la lisibilité
    
    // Mettre à jour les données du graphique
    charts.capacity.data.labels = capacityData.map(d => d.name);
    charts.capacity.data.datasets[0].data = capacityData.map(d => d.production);
    charts.capacity.update();
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