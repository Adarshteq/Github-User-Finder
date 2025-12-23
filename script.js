// DOM Elements
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const themeToggle = document.getElementById("theme-toggle");
const profileContainer = document.getElementById("profile-container");
const loadingOverlay = document.getElementById("loading-overlay");
const errorContainer = document.getElementById("error-container");
const retryBtn = document.getElementById("retry-btn");
const mainContent = document.getElementById("main-content");

// Profile Elements
let avatar = document.getElementById("avatar");
let nameElement = document.getElementById("name");
let usernameElement = document.getElementById("username");
let bioElement = document.getElementById("bio");
let locationElement = document.getElementById("location");
let locationContainer = document.getElementById("location-container");
let joinedDateElement = document.getElementById("joined-date");
let profileLink = document.getElementById("profile-link");
let followers = document.getElementById("followers");
let following = document.getElementById("following");
let repos = document.getElementById("repos");
let companyElement = document.getElementById("company");
let companyContainer = document.getElementById("company-container");
let blogContainer = document.getElementById("blog-container");
let twitterContainer = document.getElementById("twitter-container");
let reposContainer = document.getElementById("repos-container");
let repoCount = document.getElementById("repo-count");
let loadMoreBtn = document.getElementById("load-more");
let languageChartCtx = document.getElementById("language-chart").getContext("2d");
let chartPlaceholder = document.getElementById("chart-placeholder");
let particlesContainer = document.getElementById("particles");

// Note: blogElement and twitterElement will be handled dynamically
// as they might switch between <a> and <span> elements

// State Variables
let languageChart = null;
let currentUser = null;
let currentRepos = [];
let reposPage = 1;
const reposPerPage = 6;
let allReposLoaded = false;
let blogElement = document.getElementById("blog");
let twitterElement = document.getElementById("twitter");

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize default state
    initializeDefaultState();
    
    // Theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Create particles
    createParticles();
    
    // Initial search
    searchUser();
});

// Event Listeners
searchBtn.addEventListener("click", searchUser);
themeToggle.addEventListener("click", toggleTheme);
retryBtn.addEventListener("click", () => {
    searchInput.focus();
    searchUser();
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchUser();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
    }
});

// Initialize default state
function initializeDefaultState() {
    // Set default values for required elements
    nameElement.textContent = "GitHub User";
    avatar.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Crect width='140' height='140' fill='%2300b7ff' opacity='0.1'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dy='.3em' fill='%2300b7ff'%3EGitHub%3C/text%3E%3C/svg%3E";
    avatar.alt = "GitHub user avatar";
    profileLink.href = "https://github.com";
}

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    
    themeToggle.innerHTML = isLight ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Update chart colors if exists
    if (languageChart) {
        updateChartColors();
    }
}

// Create background particles
function createParticles() {
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        const size = Math.random() * 4 + 1;
        const opacity = Math.random() * 0.3 + 0.1;
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(0, 183, 255, ${opacity});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${duration}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Main search function
async function searchUser() {
    const username = searchInput.value.trim();
    
    if (!username) {
        showError("Please enter a GitHub username");
        return;
    }
    
    try {
        // Reset state
        resetState();
        
        // Show loading
        loadingOverlay.classList.remove("hidden");
        errorContainer.classList.add("hidden");
        
        // Fetch user data
        const userData = await fetchWithTimeout(`https://api.github.com/users/${username}`, 10000);
        
        if (!userData.ok) {
            if (userData.status === 404) {
                throw new Error("User not found");
            }
            throw new Error(`API Error: ${userData.status}`);
        }
        
        currentUser = await userData.json();
        
        // Display user data
        displayUserData(currentUser);
        
        // Update element references after DOM changes
        updateElementReferences();
        
        // Fetch repositories and language data in parallel
        await Promise.all([
            fetchRepositories(currentUser.repos_url, true),
            fetchLanguageData(username)
        ]);
        
        // Show profile
        profileContainer.classList.remove("hidden");
        
        // Haptic feedback
        if ("vibrate" in navigator) {
            navigator.vibrate([50]);
        }
        
        // Scroll to profile
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message.includes("not found") ? 
            "User not found. Please check the username." : 
            "Failed to fetch data. Please try again.");
    } finally {
        loadingOverlay.classList.add("hidden");
    }
}

// Update element references dynamically
function updateElementReferences() {
    // Update blog element reference if it was replaced
    blogElement = document.getElementById('blog');
    
    // Update twitter element reference if it was replaced
    twitterElement = document.getElementById('twitter');
}

// Display user data
function displayUserData(user) {
    // Avatar - use placeholder if no avatar
    if (user.avatar_url) {
        avatar.src = user.avatar_url;
    } else {
        // Fallback to generated avatar based on username
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.login)}&background=00b7ff&color=fff&size=140`;
    }
    avatar.alt = `${user.login}'s avatar`;
    
    // Name and username
    nameElement.textContent = user.name || user.login;
    usernameElement.textContent = `@${user.login}`;
    
    // Bio
    bioElement.textContent = user.bio || "No bio available";
    
    // Location
    if (user.location && user.location.trim()) {
        locationElement.textContent = user.location;
        locationContainer.style.display = "flex";
    } else {
        locationContainer.style.display = "none";
    }
    
    // Join date
    joinedDateElement.textContent = formatDate(user.created_at);
    
    // Profile link
    profileLink.href = user.html_url;
    
    // Stats
    followers.textContent = formatNumber(user.followers);
    following.textContent = formatNumber(user.following);
    repos.textContent = formatNumber(user.public_repos);
    
    // Company
    if (user.company && user.company.trim()) {
        const companyText = user.company.replace(/^@/, '');
        companyElement.textContent = companyText;
        companyContainer.style.display = "flex";
    } else {
        companyContainer.style.display = "none";
    }
    
    // Blog/Website
    if (user.blog && user.blog.trim()) {
        const blogUrl = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
        
        // Convert blog span to link
        const blogContainerElement = document.getElementById('blog-container');
        const blogElementDiv = blogContainerElement.querySelector('div');
        
        // Remove existing element and create new link
        const oldBlogElement = blogElementDiv.querySelector('#blog');
        if (oldBlogElement) oldBlogElement.remove();
        
        const newBlogElement = document.createElement('a');
        newBlogElement.id = 'blog';
        newBlogElement.href = blogUrl;
        newBlogElement.target = '_blank';
        newBlogElement.className = 'detail-value link';
        newBlogElement.textContent = user.blog;
        
        blogElementDiv.appendChild(newBlogElement);
        blogContainer.style.display = "flex";
    } else {
        // Ensure it's a span if no website
        const blogContainerElement = document.getElementById('blog-container');
        const blogElementDiv = blogContainerElement.querySelector('div');
        
        // Remove existing element
        const oldBlogElement = blogElementDiv.querySelector('#blog');
        if (oldBlogElement) oldBlogElement.remove();
        
        const newBlogElement = document.createElement('span');
        newBlogElement.id = 'blog';
        newBlogElement.className = 'detail-value no-link';
        newBlogElement.textContent = 'No website';
        
        blogElementDiv.appendChild(newBlogElement);
        blogContainer.style.display = "flex";
    }
    
    // Twitter
    if (user.twitter_username && user.twitter_username.trim()) {
        const twitterUrl = `https://twitter.com/${user.twitter_username}`;
        
        // Convert twitter span to link
        const twitterContainerElement = document.getElementById('twitter-container');
        const twitterElementDiv = twitterContainerElement.querySelector('div');
        
        // Remove existing element and create new link
        const oldTwitterElement = twitterElementDiv.querySelector('#twitter');
        if (oldTwitterElement) oldTwitterElement.remove();
        
        const newTwitterElement = document.createElement('a');
        newTwitterElement.id = 'twitter';
        newTwitterElement.href = twitterUrl;
        newTwitterElement.target = '_blank';
        newTwitterElement.className = 'detail-value link';
        newTwitterElement.textContent = `@${user.twitter_username}`;
        
        twitterElementDiv.appendChild(newTwitterElement);
        twitterContainer.style.display = "flex";
    } else {
        // Ensure it's a span if no Twitter
        const twitterContainerElement = document.getElementById('twitter-container');
        const twitterElementDiv = twitterContainerElement.querySelector('div');
        
        // Remove existing element
        const oldTwitterElement = twitterElementDiv.querySelector('#twitter');
        if (oldTwitterElement) oldTwitterElement.remove();
        
        const newTwitterElement = document.createElement('span');
        newTwitterElement.id = 'twitter';
        newTwitterElement.className = 'detail-value no-link';
        newTwitterElement.textContent = 'No Twitter';
        
        twitterElementDiv.appendChild(newTwitterElement);
        twitterContainer.style.display = "flex";
    }
}

// Fetch repositories
async function fetchRepositories(reposUrl, initialLoad = false) {
    try {
        if (initialLoad) {
            reposPage = 1;
            allReposLoaded = false;
            currentRepos = [];
            loadMoreBtn.classList.add("hidden");
            reposContainer.innerHTML = '<div class="repo-placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading repositories...</p></div>';
        }
        
        const response = await fetch(
            `${reposUrl}?per_page=${reposPerPage}&page=${reposPage}&sort=updated`
        );
        
        if (!response.ok) throw new Error("Failed to load repositories");
        
        const newRepos = await response.json();
        
        // Check if we have more repos
        if (newRepos.length < reposPerPage) {
            allReposLoaded = true;
            loadMoreBtn.classList.add("hidden");
        }
        
        if (initialLoad) {
            currentRepos = newRepos;
            reposContainer.innerHTML = '';
        } else {
            currentRepos = [...currentRepos, ...newRepos];
        }
        
        // Update UI
        displayRepos(currentRepos);
        updateRepoCount();
        
        // Show load more button if there are more repos
        if (!allReposLoaded && currentRepos.length > 0) {
            loadMoreBtn.classList.remove("hidden");
            loadMoreBtn.onclick = () => {
                reposPage++;
                fetchRepositories(reposUrl, false);
            };
        }
        
    } catch (error) {
        console.error('Error fetching repos:', error);
        reposContainer.innerHTML = '<div class="repo-placeholder"><i class="fas fa-exclamation-circle"></i><p>Failed to load repositories</p></div>';
    }
}

// Display repositories
function displayRepos(repos) {
    if (repos.length === 0) {
        reposContainer.innerHTML = '<div class="repo-placeholder"><i class="fas fa-code"></i><p>No repositories found</p></div>';
        return;
    }
    
    reposContainer.innerHTML = '';
    
    repos.forEach((repo) => {
        const repoCard = document.createElement("div");
        repoCard.className = "repo-card";
        
        const updatedAt = formatDate(repo.updated_at);
        const isFork = repo.fork ? '<span class="fork-badge">Fork</span>' : '';
        
        repoCard.innerHTML = `
            <div class="repo-header">
                <a href="${repo.html_url}" target="_blank" class="repo-name">
                    ${repo.name} ${isFork}
                </a>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <i class="fas fa-star"></i>
                        <span>${formatNumber(repo.stargazers_count)}</span>
                    </div>
                    <div class="repo-stat">
                        <i class="fas fa-code-fork"></i>
                        <span>${formatNumber(repo.forks_count)}</span>
                    </div>
                </div>
            </div>
            <p class="repo-description">${repo.description || "No description provided"}</p>
            <div class="repo-footer">
                <div class="repo-language">
                    ${repo.language ? `
                        <span class="language-dot" style="background: ${getLanguageColor(repo.language)}"></span>
                        <span>${repo.language}</span>
                    ` : ''}
                </div>
                <div class="repo-updated">
                    Updated ${updatedAt}
                </div>
            </div>
        `;
        
        reposContainer.appendChild(repoCard);
    });
}

// Fetch language data
async function fetchLanguageData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        
        if (!response.ok) throw new Error("Failed to fetch language data");
        
        const repos = await response.json();
        
        // Calculate language distribution
        const languages = {};
        let totalReposWithLanguage = 0;
        
        for (const repo of repos) {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
                totalReposWithLanguage++;
            }
        }
        
        // Sort by frequency and take top 7
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([language, count]) => ({
                language,
                count,
                percentage: totalReposWithLanguage > 0 ? ((count / totalReposWithLanguage) * 100).toFixed(1) : "0.0"
            }));
        
        // Render chart
        renderLanguageChart(sortedLanguages);
        
    } catch (error) {
        console.error('Error fetching language data:', error);
        chartPlaceholder.classList.remove("hidden");
        if (languageChart) {
            languageChart.destroy();
            languageChart = null;
        }
    }
}

// Render language chart
function renderLanguageChart(languages) {
    // Destroy previous chart
    if (languageChart) {
        languageChart.destroy();
    }
    
    // Show placeholder if no data
    if (languages.length === 0) {
        chartPlaceholder.classList.remove("hidden");
        return;
    }
    
    chartPlaceholder.classList.add("hidden");
    
    const labels = languages.map(lang => lang.language);
    const data = languages.map(lang => lang.count);
    const percentages = languages.map(lang => lang.percentage);
    
    // Generate colors based on primary color
    const colors = generateChartColors(languages.length);
    
    languageChart = new Chart(languageChartCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        font: {
                            size: 12,
                            family: "'Segoe UI', sans-serif"
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = percentages[context.dataIndex];
                            return `${label}: ${value} repos (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update chart colors based on theme
function updateChartColors() {
    if (!languageChart) return;
    
    const borderColor = document.body.classList.contains('light-mode') ? '#ffffff' : '#1e293b';
    
    languageChart.options.plugins.legend.labels.color = 
        getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
    
    languageChart.data.datasets[0].borderColor = borderColor;
    languageChart.update();
}

// Helper functions
function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, { signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'CSS': '#563d7c',
        'HTML': '#e34c26',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Shell': '#89e051',
        'Vue': '#41b883',
        'React': '#61dafb',
        'Angular': '#dd0031',
        'Svelte': '#ff3e00',
        'Dart': '#00b4ab',
        'Elixir': '#6e4a7e',
        'Scala': '#c22d40',
        'Perl': '#0298c3',
        'Lua': '#000080',
        'Haskell': '#5e5086',
        'Clojure': '#db5855',
        'Julia': '#a270ba',
        'R': '#198CE7',
        'MATLAB': '#e16737',
        'Objective-C': '#438eff',
        'PowerShell': '#012456'
    };
    
    return colors[language] || '#00b7ff';
}

function generateChartColors(count) {
    const colors = [];
    const baseHue = 195; // Hue for #00b7ff
    
    for (let i = 0; i < count; i++) {
        const hue = (baseHue + (i * 137.508)) % 360; // Golden angle approximation
        const saturation = 70 + (i * 5) % 20;
        const lightness = 40 + (i * 8) % 25;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
}

function resetState() {
    currentUser = null;
    currentRepos = [];
    reposPage = 1;
    allReposLoaded = false;
    
    if (languageChart) {
        languageChart.destroy();
        languageChart = null;
    }
    
    loadMoreBtn.classList.add("hidden");
    profileContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
}

function showError(message = "An error occurred") {
    errorContainer.classList.remove("hidden");
    profileContainer.classList.add("hidden");
    
    const errorMessage = errorContainer.querySelector('p');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
}

function updateRepoCount() {
    if (!currentUser) return;
    
    const totalRepos = currentUser.public_repos;
    const displayedRepos = currentRepos.length;
    
    if (allReposLoaded) {
        repoCount.textContent = `${displayedRepos} of ${totalRepos} repos`;
    } else {
        repoCount.textContent = `${displayedRepos}+ of ${totalRepos} repos`;
    }
}

// Add CSS animation for float effect if not already in style.css
function addParticleAnimation() {
    if (!document.querySelector('#particle-animation')) {
        const style = document.createElement('style');
        style.id = 'particle-animation';
        style.textContent = `
            @keyframes float {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(5px, -5px) rotate(120deg); }
                66% { transform: translate(-5px, 5px) rotate(240deg); }
                100% { transform: translate(0, 0) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Call this at initialization
addParticleAnimation();