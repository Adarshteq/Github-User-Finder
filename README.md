## GitHub User Finder 🔍

A modern, responsive web application to search for GitHub users and display their profile information, repositories, and language statistics with a beautiful UI.

<img src="https://img.shields.io/badge/GitHub-User_Finder-00b7ff?style=for-the-badge&logo=github" />

<img width="1512" height="1773" alt="Screenshot_2025-12-23_12-01-17" src="https://github.com/user-attachments/assets/a4f9a8c8-cc10-4c2d-8a9a-7da73c4b2c63" />

## ✨ Features

🔍 Search GitHub Users - Find any GitHub user by username

🎨 Modern UI/UX - Clean, responsive design with dark/light theme toggle

📊 User Statistics - View followers, following, repositories count

📈 Language Charts - Interactive doughnut chart showing language distribution

📱 Repository Display - View latest repositories with star and fork counts

🌓 Theme Support - Toggle between dark and light modes

⚡ Fast & Responsive - Optimized performance for all devices

🎯 Keyboard Shortcuts - Use / to quickly focus search

🔗 External Links - Direct links to GitHub profiles, websites, and Twitter


## 🛠️ Technologies Used

Frontend: HTML5, CSS3, JavaScript (ES6+)

APIs: GitHub REST API v3

Charts: Chart.js for language visualization

Icons: Font Awesome 6

Effects: Party.js for confetti animations

Styling: CSS Variables for theming, Flexbox, Grid

## 🎮 How to Use

Search for Users

Enter a GitHub username in the search bar

Press Enter or click the Search button

Press / to quickly focus the search input

View Profile

See user avatar, name, bio, and join date

Check location, company, website, and Twitter

View follower/following counts and repository statistics

Explore Repositories

Scroll through latest repositories

See stars, forks, and languages for each repo

Click "Load More" to see additional repositories

Analyze Language Data

View language distribution in an interactive chart

See percentage breakdown of languages used

Customize Experience

Toggle between dark/light theme using the moon/sun button

Theme preference is saved in local storage

## 📁 Project Structure
text
Github-User-Finder/
├── index.html          # Main HTML file
├── style.css           # All styles (theming, responsive design)
├── script.js           # Main JavaScript functionality
├── README.md           # This file

## 🔧 API Usage

This project uses the public GitHub REST API:

User Data: https://api.github.com/users/{username}

Repositories: https://api.github.com/users/{username}/repos

Rate Limiting: 60 requests per hour (unauthenticated)

Authentication: Not required for basic usage

## 🌈 Color Scheme

Primary Color: #00b7ff (Bright Cyan)

Dark Theme: Professional dark background with subtle gradients

Light Theme: Clean, modern light interface

Accent Colors: Various shades derived from the primary color

## 📱 Responsive Design

The application is fully responsive and works on:

Desktop: Optimized layout with multi-column grids

Tablet: Adjusted spacing and font sizes

Mobile: Single column layout with touch-friendly controls
