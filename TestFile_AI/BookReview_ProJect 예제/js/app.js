// ===== BookReview 메인 애플리케이션 - 가이드 Step2 기반 =====

// 전역 변수
let currentFilter = '';
let currentSort = 'newest';
let currentSearchQuery = '';
let guideCommentsVisible = false;

// DOM 요소 참조
const elements = {
    // 가이드 토글 관련
    guideToggleBtn: document.getElementById('guideToggleBtn'),
    guideComments: document.querySelectorAll('.guide-comment'),
    
    // 사용자 관련
    userGreeting: document.getElementById('userGreeting'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // 검색 관련
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    genreFilter: document.getElementById('genreFilter'),
    sortBy: document.getElementById('sortBy'),
    
    // 통계 관련
    totalBooks: document.getElementById('totalBooks'),
    totalReviews: document.getElementById('totalReviews'),
    totalUsers: document.getElementById('totalUsers'),
    avgRating: document.getElementById('avgRating'),
    
    // 콘텐츠 영역
    popularBooksGrid: document.getElementById('popularBooksGrid'),
    recentReviewsContainer: document.getElementById('recentReviewsContainer'),
    loadMoreReviews: document.getElementById('loadMoreReviews'),
    
    // 모달 관련
    addBookBtn: document.getElementById('addBookBtn'),
    addBookModal: document.getElementById('addBookModal'),
    closeAddBookModal: document.getElementById('closeAddBookModal'),
    addBookForm: document.getElementById('addBookForm'),
    cancelAddBook: document.getElementById('cancelAddBook')
};

// ===== 애플리케이션 초기화 - 가이드 "앱 초기화" 섹션 =====

document.addEventListener('DOMContentLoaded', function() {
    // 사용자 인증 상태 확인
    updateUserInterface();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 데이터 로드
    loadDashboardData();
    
    // 샘플 데이터 초기화 (개발용)
    if (getBooks().length === 0) {
        initializeSampleData();
        loadDashboardData();
    }
});

// ===== 이벤트 리스너 설정 - 가이드 "이벤트 처리" 활용 =====

function setupEventListeners() {
    // 가이드 토글 버튼
    if (elements.guideToggleBtn) {
        elements.guideToggleBtn.addEventListener('click', toggleGuideComments);
    }
    
    // 로그아웃 버튼
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 검색 관련
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', handleSearch);
    }
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // 실시간 검색 (입력 후 500ms 대기)
        let searchTimeout;
        elements.searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(handleSearch, 500);
        });
    }
    
    // 필터 및 정렬
    if (elements.genreFilter) {
        elements.genreFilter.addEventListener('change', handleFilterChange);
    }
    
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', handleSortChange);
    }
    
    // 책 추가 모달
    if (elements.addBookBtn) {
        elements.addBookBtn.addEventListener('click', openAddBookModal);
    }
    
    if (elements.closeAddBookModal) {
        elements.closeAddBookModal.addEventListener('click', closeAddBookModal);
    }
    
    if (elements.cancelAddBook) {
        elements.cancelAddBook.addEventListener('click', closeAddBookModal);
    }
    
    if (elements.addBookModal) {
        elements.addBookModal.addEventListener('click', function(e) {
            if (e.target === elements.addBookModal) {
                closeAddBookModal();
            }
        });
    }
    
    // 책 추가 폼
    if (elements.addBookForm) {
        elements.addBookForm.addEventListener('submit', handleAddBook);
    }
    
    // 더보기 버튼
    if (elements.loadMoreReviews) {
        elements.loadMoreReviews.addEventListener('click', loadMoreReviews);
    }
}

// ===== 가이드 코멘트 토글 시스템 =====

function toggleGuideComments() {
    guideCommentsVisible = !guideCommentsVisible;
    
    const toggleBtn = elements.guideToggleBtn;
    const comments = elements.guideComments;
    
    if (guideCommentsVisible) {
        // 코멘트 표시
        comments.forEach(comment => {
            comment.classList.add('show');
        });
        
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 가이드 설명 숨기기';
        
        showNotification('가이드 활용 설명이 표시되었습니다! 📚', 'success');
        
    } else {
        // 코멘트 숨기기
        comments.forEach(comment => {
            comment.classList.remove('show');
        });
        
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = '<i class="fas fa-info-circle"></i> 가이드 활용 설명 보기';
        
        showNotification('가이드 설명이 숨겨졌습니다.', 'info');
    }
}

// ===== 사용자 인터페이스 업데이트 - 가이드 "UI 상태 관리" =====

function updateUserInterface() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // 로그인 상태
        if (elements.userGreeting) {
            elements.userGreeting.textContent = `${currentUser.username}님 환영합니다! 📚`;
            elements.userGreeting.style.display = 'inline-block';
        }
        
        if (elements.loginBtn) elements.loginBtn.style.display = 'none';
        if (elements.registerBtn) elements.registerBtn.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'inline-block';
        
        // 책 추가 버튼 활성화
        if (elements.addBookBtn) elements.addBookBtn.disabled = false;
        
    } else {
        // 비로그인 상태
        if (elements.userGreeting) elements.userGreeting.style.display = 'none';
        if (elements.loginBtn) elements.loginBtn.style.display = 'inline-block';
        if (elements.registerBtn) elements.registerBtn.style.display = 'inline-block';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
        
        // 책 추가 버튼 비활성화
        if (elements.addBookBtn) {
            elements.addBookBtn.disabled = true;
            elements.addBookBtn.onclick = function() {
                showNotification('로그인 후 책을 추가할 수 있습니다.', 'info');
            };
        }
    }
}

// ===== 대시보드 데이터 로드 - 가이드 "데이터 표시" 섹션 =====

function loadDashboardData() {
    // 통계 업데이트
    updateStats();
    
    // 인기 도서 로드
    loadPopularBooks();
    
    // 최신 리뷰 로드
    loadRecentReviews();
}

function updateStats() {
    const stats = getOverallStats();
    
    if (elements.totalBooks) {
        elements.totalBooks.textContent = stats.totalBooks.toLocaleString();
    }
    
    if (elements.totalReviews) {
        elements.totalReviews.textContent = stats.totalReviews.toLocaleString();
    }
    
    if (elements.totalUsers) {
        elements.totalUsers.textContent = stats.totalUsers.toLocaleString();
    }
    
    if (elements.avgRating) {
        elements.avgRating.textContent = stats.averageRating.toFixed(1);
    }
}

function loadPopularBooks() {
    if (!elements.popularBooksGrid) return;
    
    const popularBooks = getPopularBooks(5);
    
    if (popularBooks.length === 0) {
        elements.popularBooksGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>등록된 도서가 없습니다</h3>
                <p>첫 번째 책을 추가해보세요!</p>
            </div>
        `;
        return;
    }
    
    elements.popularBooksGrid.innerHTML = popularBooks.map(book => `
        <div class="book-card" onclick="viewBookDetails('${book.id}')">
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">저자: ${escapeHtml(book.author)}</div>
                <div class="book-meta">
                    <div class="book-rating">
                        <span class="stars">${generateStars(book.averageRating)}</span>
                        <span>${book.averageRating.toFixed(1)}</span>
                    </div>
                    <div class="review-count">
                        <i class="fas fa-comment"></i> ${book.reviewCount}개
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function loadRecentReviews(limit = 6) {
    if (!elements.recentReviewsContainer) return;
    
    const recentReviews = getRecentReviews(limit);
    
    if (recentReviews.length === 0) {
        elements.recentReviewsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <h3>작성된 리뷰가 없습니다</h3>
                <p>첫 번째 리뷰를 작성해보세요!</p>
            </div>
        `;
        return;
    }
    
    elements.recentReviewsContainer.innerHTML = recentReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-book-title">${escapeHtml(review.bookTitle)}</div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                </div>
            </div>
            <div class="review-content">
                "${escapeHtml(review.content)}"
            </div>
            <div class="review-footer">
                <div class="reviewer-name">
                    <i class="fas fa-user"></i> ${escapeHtml(review.reviewerName)}
                </div>
                <div class="review-date">
                    <i class="fas fa-calendar"></i> ${formatDate(review.reviewDate)}
                </div>
            </div>
            ${review.isRecommended ? '<div class="recommended-badge"><i class="fas fa-thumbs-up"></i> 추천</div>' : ''}
        </div>
    `).join('');
}

// ===== 검색 및 필터링 - 가이드 "검색 기능 구현" =====

function handleSearch() {
    const query = elements.searchInput?.value.trim() || '';
    currentSearchQuery = query;
    
    // 검색 결과가 있으면 결과 페이지로 이동 (추후 구현)
    if (query) {
        console.log('검색 쿼리:', query);
        showNotification(`"${query}" 검색 결과를 확인하세요.`, 'info');
    }
}

function handleFilterChange() {
    currentFilter = elements.genreFilter?.value || '';
    console.log('필터 변경:', currentFilter);
    
    // 필터링된 결과 표시 (추후 구현)
    if (currentFilter) {
        showNotification(`"${currentFilter}" 장르로 필터링되었습니다.`, 'info');
    }
}

function handleSortChange() {
    currentSort = elements.sortBy?.value || 'newest';
    console.log('정렬 변경:', currentSort);
    
    // 정렬된 결과 표시 (추후 구현)
    showNotification('정렬 순서가 변경되었습니다.', 'info');
}

// ===== 책 추가 모달 - 가이드 "모달 다이얼로그" 섹션 =====

function openAddBookModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('로그인 후 책을 추가할 수 있습니다.', 'error');
        return;
    }
    
    if (elements.addBookModal) {
        elements.addBookModal.classList.add('active');
        
        // 제목 필드에 포커스
        const titleField = document.getElementById('bookTitle');
        if (titleField) {
            setTimeout(() => titleField.focus(), 100);
        }
    }
}

function closeAddBookModal() {
    if (elements.addBookModal) {
        elements.addBookModal.classList.remove('active');
    }
    
    // 폼 리셋
    if (elements.addBookForm) {
        elements.addBookForm.reset();
    }
}

function handleAddBook(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookData = {
        title: formData.get('title')?.trim(),
        author: formData.get('author')?.trim(),
        publisher: formData.get('publisher')?.trim(),
        genre: formData.get('genre'),
        publishDate: formData.get('publishDate'),
        description: formData.get('description')?.trim()
    };
    
    // 유효성 검사 - 가이드 "폼 유효성 검사" 활용
    if (!bookData.title) {
        showNotification('책 제목을 입력해주세요.', 'error');
        return;
    }
    
    if (!bookData.author) {
        showNotification('저자를 입력해주세요.', 'error');
        return;
    }
    
    // 책 추가
    try {
        const newBook = addBook(
            bookData.title,
            bookData.author,
            bookData.publisher,
            bookData.genre,
            bookData.publishDate,
            bookData.description
        );
        
        if (newBook) {
            showNotification('새 책이 성공적으로 추가되었습니다!', 'success');
            closeAddBookModal();
            
            // 대시보드 업데이트
            loadDashboardData();
        } else {
            showNotification('책 추가에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('책 추가 오류:', error);
        showNotification('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
}

// ===== 기타 기능들 =====

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logoutUser();
        updateUserInterface();
        showNotification('로그아웃 되었습니다.', 'info');
        
        // 페이지 새로고침
        setTimeout(() => location.reload(), 1000);
    }
}

function viewBookDetails(bookId) {
    // 책 상세 페이지로 이동 (추후 구현)
    console.log('책 상세 보기:', bookId);
    showNotification('책 상세 페이지는 개발 중입니다.', 'info');
}

function loadMoreReviews() {
    // 더 많은 리뷰 로드 (추후 구현)
    console.log('더 많은 리뷰 로드');
    showNotification('더 많은 리뷰를 불러왔습니다.', 'info');
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== 알림 시스템 - 가이드 "사용자 피드백" 섹션 =====

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
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== 유틸리티 함수들 =====

// 페이지 로딩 표시
function showLoading(container) {
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>로딩 중...</p>
            </div>
        `;
    }
}

// 에러 표시
function showError(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>오류가 발생했습니다</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
}

// 키보드 단축키 지원
document.addEventListener('keydown', function(e) {
    // Ctrl + K: 검색 포커스
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        if (elements.searchInput) {
            elements.searchInput.focus();
        }
    }
    
    // ESC: 모달 닫기
    if (e.key === 'Escape') {
        if (elements.addBookModal && elements.addBookModal.classList.contains('active')) {
            closeAddBookModal();
        }
    }
});

// ===== 반응형 처리 =====

function handleResize() {
    // 반응형 처리 로직 (필요시 추가)
}

window.addEventListener('resize', handleResize);

// ===== 도서 상세 페이지 이동 =====

function viewBookDetails(bookId) {
    window.location.href = `book-detail.html?id=${bookId}`;
}

// ===== 개발자 도구 (개발용) =====

// 콘솔에서 사용할 수 있는 디버깅 함수들
window.BookReviewDebug = {
    showAllBooks: () => console.table(getBooks()),
    showAllReviews: () => console.table(getReviews()),
    showAllUsers: () => console.table(getUsers()),
    clearAllData: () => {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
            localStorage.clear();
            location.reload();
        }
    },
    addSampleData: () => {
        initializeSampleData();
        location.reload();
    }
};