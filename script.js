// DOM Elements
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("search-btn");
const themeToggle = document.getElementById("theme-toggle");
const profileContainer = document.getElementById("profile-container");
const loadingOverlay = document.getElementById("loading-overlay");
const errorContainer = document.getElementById("error-container");
const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const usernameElement = document.getElementById("username");
const bioElement = document.getElementById("bio");
const locationElement = document.getElementById("location");
const joinedDateElement = document.getElementById("joined-date");
const profileLink = document.getElementById("profile-link");
const followers = document.getElementById("followers");
const following = document.getElementById("following");
const repos = document.getElementById("repos");
const companyElement = document.getElementById("company");
const blogElement = document.getElementById("blog");
const twitterElement = document.getElementById("twitter");
const companyContainer = document.getElementById("company-container");
const blogContainer = document.getElementById("blog-container");
const twitterContainer = document.getElementById("twitter-container");
const reposContainer = document.getElementById("repos-container");
const languageChartCtx = document.getElementById("language-chart").getContext("2d");
const particlesContainer = document.getElementById("particles");

// State
let languageChart = null;
let currentRepos = [];

// Initialize
searchBtn.addEventListener("click", searchUser);
themeToggle.addEventListener("click", toggleTheme);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchUser();
});

// Create particles
createParticles();

// Set keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});

// Initial search
searchUser();

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  if (document.body.classList.contains("light-mode")) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

// Create background particles
function createParticles() {
  // Define keyframes once
  if (!document.getElementById('particle-animation')) {
    const style = document.createElement('style');
    style.id = 'particle-animation';
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0); }
        50% { transform: translate(5px, 5px); }
        100% { transform: translate(0, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.width = `${Math.random() * 5 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.background = "rgba(139, 226, 250, 0.3)";
    particle.style.borderRadius = "50%";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    particle.style.opacity = Math.random();
    particlesContainer.appendChild(particle);
  }
}

async function searchUser() {
  const username = searchInput.value.trim();

  if (!username) return;

  try {
    // Reset UI
    profileContainer.classList.add("hidden");
    errorContainer.classList.add("hidden");
    loadingOverlay.classList.remove("hidden");
    
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) throw new Error("User not found");
    
    const userData = await userResponse.json();
    
    // Display user data
    displayUserData(userData);
    
    // Fetch repositories
    await fetchRepositories(userData.repos_url);
    
    // Fetch language data
    await fetchLanguageData(username);
    
    // Show the profile
    profileContainer.classList.remove("hidden");
    
    // Confetti effect
    confettiEffect();
    
    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(30);
    }
  } catch (error) {
    showError();
  } finally {
    loadingOverlay.classList.add("hidden");
  }
}

function displayUserData(user) {
  avatar.src = user.avatar_url;
  nameElement.textContent = user.name || user.login;
  usernameElement.textContent = `@${user.login}`;
  bioElement.textContent = user.bio || "No bio available";

  locationElement.textContent = user.location || "Not specified";
  joinedDateElement.textContent = formatDate(user.created_at);

  profileLink.href = user.html_url;
  followers.textContent = user.followers;
  following.textContent = user.following;
  repos.textContent = user.public_repos;

  // Company info
  if (user.company) {
    companyElement.textContent = user.company;
    companyContainer.style.display = "flex";
  } else {
    companyContainer.style.display = "none";
  }

  // Blog info
  if (user.blog) {
    blogElement.textContent = user.blog;
    blogElement.href = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
    blogContainer.style.display = "flex";
  } else {
    blogContainer.style.display = "none";
  }

  // Twitter info
  if (user.twitter_username) {
    twitterElement.textContent = `@${user.twitter_username}`;
    twitterElement.href = `https://twitter.com/${user.twitter_username}`;
    twitterContainer.style.display = "flex";
  } else {
    twitterContainer.style.display = "none";
  }
}

async function fetchRepositories(reposUrl) {
  reposContainer.innerHTML = '<div class="loading-repos">Loading repositories...</div>';

  try {
    const response = await fetch(`${reposUrl}?per_page=6&sort=updated`);
    const repos = await response.json();
    currentRepos = repos;
    displayRepos(repos);
  } catch (error) {
    reposContainer.innerHTML = '<div class="no-repos">Failed to load repositories</div>';
  }
}

function displayRepos(repos) {
  if (repos.length === 0) {
    reposContainer.innerHTML = '<div class="no-repos">No repositories found</div>';
    return;
  }

  reposContainer.innerHTML = "";

  repos.forEach((repo) => {
    const repoCard = document.createElement("div");
    repoCard.className = "repo-card";
    
    // Add pinned badge for demonstration
    const isPinned = Math.random() > 0.7;
    if (isPinned) {
      const pinnedBadge = document.createElement("div");
      pinnedBadge.className = "pinned-badge";
      pinnedBadge.innerHTML = '<i class="fas fa-thumbtack"></i> Pinned';
      repoCard.appendChild(pinnedBadge);
    }

    const updatedAt = formatDate(repo.updated_at);

    repoCard.innerHTML = `
      <a href="${repo.html_url}" target="_blank" class="repo-name">
        <i class="fas fa-book"></i> ${repo.name}
      </a>
      <p class="repo-description">${repo.description || "No description available"}</p>
      <div class="repo-meta">
        ${
          repo.language
            ? `
          <div class="repo-meta-item">
            <i class="fas fa-circle"></i> ${repo.language}
          </div>
        `
            : ""
        }
        <div class="repo-meta-item">
          <i class="fas fa-star"></i> ${repo.stargazers_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-code-fork"></i> ${repo.forks_count}
        </div>
        <div class="repo-meta-item">
          <i class="fas fa-history"></i> ${updatedAt}
        </div>
      </div>
    `;

    reposContainer.appendChild(repoCard);
  });
}

async function fetchLanguageData(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await response.json();
    
    // Calculate language distribution
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });
    
    // Sort languages by count
    const sortedLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Render chart
    renderLanguageChart(sortedLanguages);
  } catch (error) {
    console.error("Failed to load language data:", error);
  }
}

function renderLanguageChart(languages) {
  // Destroy previous chart if exists
  if (languageChart) {
    languageChart.destroy();
  }
  
  // If no languages, show message
  if (languages.length === 0) {
    languageChartCtx.canvas.parentNode.innerHTML = '<p class="no-data">No language data available</p>';
    return;
  }
  
  const labels = languages.map(lang => lang[0]);
  const data = languages.map(lang => lang[1]);
  
  languageChart = new Chart(languageChartCtx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(139, 226, 250, 0.7)',
          'rgba(92, 200, 246, 0.7)',
          'rgba(181, 242, 253, 0.7)',
          'rgba(100, 210, 255, 0.7)',
          'rgba(70, 180, 230, 0.7)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: document.body.classList.contains('light-mode') ? '#333' : '#f3f4f6',
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
}

// Confetti effect
function confettiEffect() {
  party.confetti(profileContainer, {
    count: 40,
    size: 1.5,
    spread: 20
  });
}

function showError() {
  errorContainer.classList.remove("hidden");
  profileContainer.classList.add("hidden");
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}