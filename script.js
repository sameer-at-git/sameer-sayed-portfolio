document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const resumeButtons = document.querySelectorAll('.resume-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const themeToggle = document.getElementById('themeToggle');
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const closeModal = document.getElementById('closeModal');
    const videoLinks = document.querySelectorAll('.project-link.video');
    const contactForm = document.getElementById('contactForm');
    const reposList = document.getElementById('reposList');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    resumeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const link = document.createElement('a');
            link.href = 'assets/resume.pdf';
            link.download = 'Resume-Md.Sameer Sayed.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    projectCards.forEach(card => {
        const video = card.querySelector('.project-video');
        
        card.addEventListener('mouseenter', function() {
            if (video) {
                video.play().catch(e => console.log('Video autoplay failed:', e));
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
    });

    videoLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('data-video');
            const projectCard = this.closest('.project-card');
            const projectTitle = projectCard.querySelector('h3').textContent;
            const projectDesc = projectCard.querySelector('p').textContent;
            
            if (videoSrc) {
                modalVideo.src = videoSrc;
                document.getElementById('videoTitle').textContent = projectTitle;
                document.getElementById('videoDescription').textContent = projectDesc;
                videoModal.style.display = 'flex';
            }
        });
    });

    closeModal.addEventListener('click', function() {
        videoModal.style.display = 'none';
        modalVideo.pause();
    });

    window.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            videoModal.style.display = 'none';
            modalVideo.pause();
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#') && !this.getAttribute('href').includes('resume')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
                
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            const mailtoLink = `mailto:mdsameersayed0@gmail.com?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage: ${data.message}`)}`;
            window.location.href = mailtoLink;
            
            contactForm.reset();
            alert('Thank you for your message! Your email client will open to send the message.');
        }
    });

    function validateForm() {
        let isValid = true;
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');
        
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const subjectError = document.getElementById('subjectError');
        const messageError = document.getElementById('messageError');
        
        nameError.style.display = 'none';
        emailError.style.display = 'none';
        subjectError.style.display = 'none';
        messageError.style.display = 'none';
        
        if (!name.value.trim()) {
            nameError.textContent = 'Name is required';
            nameError.style.display = 'block';
            isValid = false;
        }
        
        if (!email.value.trim()) {
            emailError.textContent = 'Email is required';
            emailError.style.display = 'block';
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
            emailError.style.display = 'block';
            isValid = false;
        }
        
        if (!subject.value.trim()) {
            subjectError.textContent = 'Subject is required';
            subjectError.style.display = 'block';
            isValid = false;
        }
        
        if (!message.value.trim()) {
            messageError.textContent = 'Message is required';
            messageError.style.display = 'block';
            isValid = false;
        }
        
        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function fetchGitHubRepos() {
        const username = 'sameer-at-git';
        const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=24`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GitHub API limit exceeded or user not found');
                }
                return response.json();
            })
            .then(repos => {
                displayRepos(repos);
            })
            .catch(error => {
                console.error('Error fetching GitHub repos:', error);
                reposList.innerHTML = '<div class="repo-loading">Unable to load repositories. Please check your GitHub username or try again later.</div>';
            });
    }

    function displayRepos(repos) {
        if (!repos || repos.length === 0) {
            reposList.innerHTML = '<div class="repo-loading">No repositories found.</div>';
            return;
        }
        
        reposList.innerHTML = '';
        
        repos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card';
            
            repoCard.innerHTML = `
                <a href="${repo.html_url}" class="repo-name" target="_blank">${repo.name}</a>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-meta">
                    <span class="repo-language">
                        <span class="language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
                        ${repo.language || 'Unknown'}
                    </span>
                    <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                </div>
            `;
            
            reposList.appendChild(repoCard);
        });
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Java': '#b07219',
            'TypeScript': '#2b7489',
            'C++': '#f34b7d',
            'C#': '#178600',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'CSS': '#563d7c',
            'HTML': '#e34c26',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33'
        };
        
        return colors[language] || '#cccccc';
    }

    fetchGitHubRepos();

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});