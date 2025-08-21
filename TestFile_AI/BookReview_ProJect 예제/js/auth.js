// ===== BookReview 인증 시스템 - 가이드 기반 =====

document.addEventListener('DOMContentLoaded', function() {
    // 가이드 토글 시스템 초기화
    initGuideToggleSystem();
    
    // 현재 페이지 확인
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        initLoginPage();
    } else if (currentPage === 'register.html') {
        initRegisterPage();
    }
});

// ===== 가이드 토글 시스템 초기화 =====

function initGuideToggleSystem() {
    const guideToggleBtn = document.getElementById('guideToggleBtn');
    const guideComments = document.querySelectorAll('.guide-comment');
    let guideCommentsVisible = false;

    if (guideToggleBtn) {
        guideToggleBtn.addEventListener('click', function() {
            guideCommentsVisible = !guideCommentsVisible;
            
            if (guideCommentsVisible) {
                // 코멘트 표시
                guideComments.forEach(comment => {
                    comment.classList.add('show');
                });
                
                guideToggleBtn.classList.add('active');
                guideToggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 가이드 설명 숨기기';
                
                showNotification('가이드 활용 설명이 표시되었습니다! 📚', 'success');
                
            } else {
                // 코멘트 숨기기
                guideComments.forEach(comment => {
                    comment.classList.remove('show');
                });
                
                guideToggleBtn.classList.remove('active');
                guideToggleBtn.innerHTML = '<i class="fas fa-info-circle"></i> 가이드 활용 설명 보기';
                
                showNotification('가이드 설명이 숨겨졌습니다.', 'info');
            }
        });
    }
}

// ===== 로그인 페이지 초기화 - 가이드 "로그인 시스템" 활용 =====

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 소셜 로그인 버튼들
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            showNotification(`${provider} 로그인은 개발 중입니다.`, 'info');
        });
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    
    // 유효성 검사 - 가이드 "폼 유효성 검사" 활용
    if (!email) {
        showNotification('이메일을 입력해주세요.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
        return;
    }
    
    if (!password) {
        showNotification('비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    // 로그인 처리 - 가이드 data.js의 loginUser 함수 활용
    const result = loginUser(email, password);
    
    if (result.success) {
        showNotification('로그인에 성공했습니다! 환영합니다! 🎉', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } else {
        showNotification(result.message, 'error');
    }
}

// ===== 회원가입 페이지 초기화 - 가이드 "회원가입 시스템" 활용 =====

function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 실시간 유효성 검사
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (emailInput) {
        emailInput.addEventListener('input', checkEmailAvailability);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // 소셜 가입 버튼들
    const socialBtns = document.querySelectorAll('.btn-social');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            showNotification(`${provider} 가입은 개발 중입니다.`, 'info');
        });
    });
}

function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username')?.trim(),
        email: formData.get('email')?.trim(),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        agreeTerms: formData.get('agreeTerms')
    };
    
    // 유효성 검사 - 가이드 "회원가입 유효성 검사" 활용
    if (!userData.username || userData.username.length < 2) {
        showNotification('사용자 이름은 2글자 이상 입력해주세요.', 'error');
        return;
    }
    
    if (!userData.email || !isValidEmail(userData.email)) {
        showNotification('올바른 이메일을 입력해주세요.', 'error');
        return;
    }
    
    if (!userData.password || userData.password.length < 6) {
        showNotification('비밀번호는 6자리 이상 입력해주세요.', 'error');
        return;
    }
    
    if (userData.password !== userData.confirmPassword) {
        showNotification('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    if (!userData.agreeTerms) {
        showNotification('이용약관에 동의해주세요.', 'error');
        return;
    }
    
    // 회원가입 처리 - 가이드 data.js의 registerUser 함수 활용
    const result = registerUser(userData.username, userData.email, userData.password);
    
    if (result.success) {
        showNotification('회원가입이 완료되었습니다! 로그인해주세요. 🎉', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } else {
        showNotification(result.message, 'error');
    }
}

// ===== 실시간 유효성 검사 함수들 =====

function checkEmailAvailability() {
    const email = this.value.trim();
    const emailCheck = document.getElementById('emailCheck');
    
    if (!email) {
        emailCheck.innerHTML = '';
        return;
    }
    
    if (!isValidEmail(email)) {
        emailCheck.innerHTML = '<i class="fas fa-times-circle"></i> 올바른 이메일 형식이 아닙니다.';
        emailCheck.className = 'email-check invalid';
        return;
    }
    
    // 이메일 중복 확인 - 가이드 data.js 활용
    const users = getUsers();
    const existingUser = users.find(user => user.email === email.toLowerCase());
    
    if (existingUser) {
        emailCheck.innerHTML = '<i class="fas fa-times-circle"></i> 이미 사용중인 이메일입니다.';
        emailCheck.className = 'email-check invalid';
    } else {
        emailCheck.innerHTML = '<i class="fas fa-check-circle"></i> 사용 가능한 이메일입니다.';
        emailCheck.className = 'email-check valid';
    }
}

function checkPasswordStrength() {
    const password = this.value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }
    
    let strength = 0;
    let strengthText = '';
    let strengthClass = '';
    
    // 길이 체크
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    
    // 복잡성 체크
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
        strengthText = '약함';
        strengthClass = 'weak';
    } else if (strength <= 4) {
        strengthText = '보통';
        strengthClass = 'medium';
    } else {
        strengthText = '강함';
        strengthClass = 'strong';
    }
    
    strengthDiv.innerHTML = `
        <span>비밀번호 강도: ${strengthText}</span>
        <div class="strength-bar">
            <div class="strength-fill ${strengthClass}"></div>
        </div>
    `;
}

function checkPasswordMatch() {
    const password = document.getElementById('password')?.value;
    const confirmPassword = this.value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (!confirmPassword) {
        matchDiv.innerHTML = '';
        return;
    }
    
    if (password === confirmPassword) {
        matchDiv.innerHTML = '<i class="fas fa-check-circle"></i> 비밀번호가 일치합니다.';
        matchDiv.className = 'password-match valid';
    } else {
        matchDiv.innerHTML = '<i class="fas fa-times-circle"></i> 비밀번호가 일치하지 않습니다.';
        matchDiv.className = 'password-match invalid';
    }
}

// ===== 유틸리티 함수들 =====

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 애니메이션 적용
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 4초 후 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}