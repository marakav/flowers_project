function previewImage() {
    const fileInput = document.getElementById('flowerImage');
    const preview = document.getElementById('imagePreview');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.innerHTML = `
                <div>
                    <img src="${e.target.result}">
                    <p>Фото готово к анализу!</p>
                </div>
            `;
        }

        reader.readAsDataURL(fileInput.files[0]);
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function logout() {
    window.location.href = "/logout";
}

function showSection(sectionId) {
    document.querySelectorAll('.account-section-content').forEach(section => {
        section.style.display = 'none';
    });

    const sectionToShow = document.getElementById(sectionId + '-section');
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }

    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function generateToken() {
    fetch('/generate-token')
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showTokenStatus('Ошибка при генерации токена', 'error');
        });
}

function submitTokenForm(event) {
    event.preventDefault();

    const tokenInput = document.getElementById('tokenInput');
    const token = tokenInput ? tokenInput.value.trim() : '';

    if (!token) {
        showTokenStatus('Введите токен', 'error');
        return;
    }

    const tokenRegex = /^[a-f0-9]{32}$/i;
    if (!tokenRegex.test(token)) {
        showTokenStatus('Неверный формат токена', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Обработка...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append('token', token);

    fetch('/submit-token', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showTokenStatus('Ошибка сети', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function showTokenStatus(message, type = 'error') {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
        const className = type === 'error' ? 'flash-error' : 'flash-success';
        tokenStatus.innerHTML = `<div class="flash-message ${className}">${message}</div>`;
        tokenStatus.style.display = 'block';

        tokenStatus.scrollIntoView({ behavior: 'smooth' });
    }
}

function copyTokenToClipboard() {
    const tokenElement = document.getElementById('generatedToken');
    if (tokenElement) {
        const token = tokenElement.textContent;
        navigator.clipboard.writeText(token).then(() => {
            showTokenStatus('Токен скопирован!', 'success');
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            showTokenStatus('Не удалось скопировать токен', 'error');
        });
    }
}

function openPrivacyPolicy() {
    event.preventDefault();
    closeModal('registerModal');
    openModal('privacyPolicyModal');
}

window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const flowerResult = document.getElementById('flowerResult');
    if (flowerResult && flowerResult.style.display !== 'none') {
        flowerResult.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const flashMessages = document.querySelectorAll('.flash-error');
    flashMessages.forEach(message => {
        if (message.textContent.includes('email') || message.textContent.includes('пароль') || message.textContent.includes('Регистрация')) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('login_error')) {
                openModal('loginModal');
            } else if (urlParams.has('register_error')) {
                openModal('registerModal');
            }
        }
    });

    const tokenForm = document.getElementById('tokenForm');
    if (tokenForm) {
        tokenForm.addEventListener('submit', submitTokenForm);
    }

    const generateTokenBtn = document.querySelector('[onclick="generateToken()"]');
    if (generateTokenBtn) {
        generateTokenBtn.addEventListener('click', generateToken);
    }

    const sectionButtons = document.querySelectorAll('.sidebar-menu a[onclick*="showSection"]');
    sectionButtons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        const match = onclickAttr.match(/showSection\('([^']+)'\)/);
        if (match && match[1]) {
            button.onclick = function(event) {
                showSection(match[1]);
            };
        }
    });

    const flashSuccess = document.querySelector('.flash-success');
    if (flashSuccess) {
        const tokenMatch = flashSuccess.textContent.match(/токен:\s*([a-f0-9]{32})/i);
        if (tokenMatch && tokenMatch[1]) {
            const tokenResult = document.getElementById('tokenResult');
            const generatedToken = document.getElementById('generatedToken');

            if (tokenResult && generatedToken) {
                generatedToken.textContent = tokenMatch[1];
                tokenResult.style.display = 'block';
            }
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.getElementsByClassName('modal');
        for (let modal of modals) {
            modal.style.display = 'none';
        }
    }
});