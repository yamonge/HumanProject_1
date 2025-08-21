// ===== BookReview 내 리뷰 페이지 - 가이드 기반 =====

// 전역 변수
let currentUser = null;
let userReviews = [];
let userStats = {};

// DOM 요소 참조
const elements = {
    // 가이드 토글
    guideToggleBtn: document.getElementById('guideToggleBtn'),
    guideComments: document.querySelectorAll('.guide-comment'),
    
    // 사용자 관련
    userGreeting: document.getElementById('userGreeting'),
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // 섹션들
    loginRequiredSection: document.getElementById('loginRequiredSection'),
    userStatsSection: document.getElementById('userStatsSection'),
    reviewsManagementSection: document.getElementById('reviewsManagementSection'),
    
    // 통계 표시
    totalUserReviews: document.getElementById('totalUserReviews'),
    avgUserRating: document.getElementById('avgUserRating'),
    recommendedCount: document.getElementById('recommendedCount'),
    favoriteGenre: document.getElementById('favoriteGenre'),
    
    // 리뷰 관리
    reviewSortBy: document.getElementById('reviewSortBy'),
    writeNewReviewBtn: document.getElementById('writeNewReviewBtn'),
    reviewsLoading: document.getElementById('reviewsLoading'),
    myReviewsList: document.getElementById('myReviewsList'),
    
    // 모달
    editReviewModal: document.getElementById('editReviewModal'),
    closeEditReviewModal: document.getElementById('closeEditReviewModal'),
    editReviewForm: document.getElementById('editReviewForm'),
    cancelEditReview: document.getElementById('cancelEditReview'),
    editReviewId: document.getElementById('editReviewId'),
    editBookInfo: document.getElementById('editBookInfo'),
    editStarRating: document.getElementById('editStarRating'),
    editRating: document.getElementById('editRating'),
    editContent: document.getElementById('editContent'),
    editIsRecommended: document.getElementById('editIsRecommended')
};

// ===== 페이지 초기화 =====

document.addEventListener('DOMContentLoaded', function() {
    // 가이드 토글 시스템 초기화
    initGuideToggleSystem();
    
    // 사용자 인증 상태 확인
    checkUserAuthentication();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 데이터 로드
    if (currentUser) {
        loadUserData();
    }
});

// ===== 가이드 토글 시스템 =====

function initGuideToggleSystem() {
    let guideCommentsVisible = false;

    if (elements.guideToggleBtn) {
        elements.guideToggleBtn.addEventListener('click', function() {
            guideCommentsVisible = !guideCommentsVisible;
            
            if (guideCommentsVisible) {
                elements.guideComments.forEach(comment => {
                    comment.classList.add('show');
                });
                
                elements.guideToggleBtn.classList.add('active');
                elements.guideToggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 가이드 설명 숨기기';
                showNotification('가이드 활용 설명이 표시되었습니다! 📚', 'success');
                
            } else {
                elements.guideComments.forEach(comment => {
                    comment.classList.remove('show');
                });
                
                elements.guideToggleBtn.classList.remove('active');
                elements.guideToggleBtn.innerHTML = '<i class="fas fa-info-circle"></i> 가이드 활용 설명 보기';
                showNotification('가이드 설명이 숨겨졌습니다.', 'info');
            }
        });
    }
}

// ===== 사용자 인증 확인 =====

function checkUserAuthentication() {
    currentUser = getCurrentUser();
    
    if (currentUser) {
        // 로그인 상태
        showLoggedInSections();
        updateUserInterface();
    } else {
        // 비로그인 상태
        showLoginRequiredSection();
    }
}

function showLoginRequiredSection() {
    if (elements.loginRequiredSection) {
        elements.loginRequiredSection.style.display = 'block';
    }
    if (elements.userStatsSection) {
        elements.userStatsSection.style.display = 'none';
    }
    if (elements.reviewsManagementSection) {
        elements.reviewsManagementSection.style.display = 'none';
    }
}

function showLoggedInSections() {
    if (elements.loginRequiredSection) {
        elements.loginRequiredSection.style.display = 'none';
    }
    if (elements.userStatsSection) {
        elements.userStatsSection.style.display = 'block';
    }
    if (elements.reviewsManagementSection) {
        elements.reviewsManagementSection.style.display = 'block';
    }
}

function updateUserInterface() {
    if (currentUser) {
        if (elements.userGreeting) {
            elements.userGreeting.textContent = `${currentUser.username}님`;
            elements.userGreeting.style.display = 'inline-block';
        }
        
        if (elements.loginBtn) elements.loginBtn.style.display = 'none';
        if (elements.registerBtn) elements.registerBtn.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'inline-block';
    }
}

// ===== 이벤트 리스너 설정 =====

function setupEventListeners() {
    // 로그아웃
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 정렬
    if (elements.reviewSortBy) {
        elements.reviewSortBy.addEventListener('change', handleSortChange);
    }
    
    // 새 리뷰 작성
    if (elements.writeNewReviewBtn) {
        elements.writeNewReviewBtn.addEventListener('click', function() {
            window.location.href = 'books.html';
        });
    }
    
    // 리뷰 수정 모달
    if (elements.closeEditReviewModal) {
        elements.closeEditReviewModal.addEventListener('click', closeEditReviewModal);
    }
    
    if (elements.cancelEditReview) {
        elements.cancelEditReview.addEventListener('click', closeEditReviewModal);
    }
    
    if (elements.editReviewModal) {
        elements.editReviewModal.addEventListener('click', function(e) {
            if (e.target === elements.editReviewModal) {
                closeEditReviewModal();
            }
        });
    }
    
    if (elements.editReviewForm) {
        elements.editReviewForm.addEventListener('submit', handleEditReview);
    }
    
    // 별점 입력
    if (elements.editStarRating) {
        setupStarRating();
    }
}

// ===== 데이터 로드 - 가이드 "사용자별 데이터" 활용 =====

function loadUserData() {
    showLoading();
    
    // 가이드 data.js의 getReviewsByUser() 함수 활용
    userReviews = getReviewsByUser(currentUser.id);
    
    // 가이드 data.js의 getUserStats() 함수 활용
    userStats = getUserStats(currentUser.id);
    
    setTimeout(() => {
        hideLoading();
        updateUserStats();
        renderUserReviews();
    }, 500);
}

function showLoading() {
    if (elements.reviewsLoading) {
        elements.reviewsLoading.style.display = 'block';
    }
    if (elements.myReviewsList) {
        elements.myReviewsList.style.display = 'none';
    }
}

function hideLoading() {
    if (elements.reviewsLoading) {
        elements.reviewsLoading.style.display = 'none';
    }
    if (elements.myReviewsList) {
        elements.myReviewsList.style.display = 'block';
    }
}

// ===== 사용자 통계 업데이트 - 가이드 "통계 계산" 활용 =====

function updateUserStats() {
    if (!userStats) return;
    
    // 총 리뷰 수
    if (elements.totalUserReviews) {
        elements.totalUserReviews.textContent = userStats.totalReviews.toLocaleString();
    }
    
    // 평균 평점
    if (elements.avgUserRating) {
        elements.avgUserRating.textContent = userStats.averageRating.toFixed(1);
    }
    
    // 추천한 책 수
    if (elements.recommendedCount) {
        elements.recommendedCount.textContent = userStats.recommendedBooks.toLocaleString();
    }
    
    // 선호 장르
    if (elements.favoriteGenre) {
        if (userStats.favoriteGenres && userStats.favoriteGenres.length > 0) {
            elements.favoriteGenre.textContent = userStats.favoriteGenres[0].genre;
        } else {
            elements.favoriteGenre.textContent = '-';
        }
    }
}

// ===== 리뷰 렌더링 =====

function renderUserReviews() {
    if (!elements.myReviewsList) return;
    
    if (userReviews.length === 0) {
        showEmptyReviewsState();
        return;
    }
    
    // 정렬 적용
    const sortBy = elements.reviewSortBy?.value || 'newest';
    const sortedReviews = sortUserReviews(userReviews, sortBy);
    
    elements.myReviewsList.innerHTML = sortedReviews.map(review => {
        const book = getBookById(review.bookId);
        if (!book) return ''; // 삭제된 책의 경우
        
        return `
            <div class="my-review-item">
                <div class="review-item-header">
                    <div class="review-book-info">
                        <div class="review-book-title">${escapeHtml(book.title)}</div>
                        <div class="review-book-author">저자: ${escapeHtml(book.author)}</div>
                        <div class="review-book-meta">
                            ${book.publisher ? `<span><i class="fas fa-building"></i> ${escapeHtml(book.publisher)}</span>` : ''}
                            ${book.genre ? `<span><i class="fas fa-tag"></i> ${escapeHtml(book.genre)}</span>` : ''}
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="review-action-btn edit-review-btn" onclick="openEditReviewModal('${review.id}')">
                            <i class="fas fa-edit"></i> 수정
                        </button>
                        <button class="review-action-btn delete-review-btn" onclick="deleteReviewConfirm('${review.id}')">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </div>
                
                <div class="review-item-rating">
                    <div class="review-rating-stars">
                        ${generateStars(review.rating)}
                    </div>
                    <div class="review-rating-text">
                        ${review.rating}점
                    </div>
                </div>
                
                <div class="review-item-content">
                    ${escapeHtml(review.content)}
                </div>
                
                <div class="review-item-footer">
                    <div class="review-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(review.reviewDate)}
                    </div>
                    <div class="${review.isRecommended ? 'review-recommended' : 'review-not-recommended'}">
                        <i class="fas fa-${review.isRecommended ? 'thumbs-up' : 'thumbs-down'}"></i>
                        ${review.isRecommended ? '추천' : '비추천'}
                    </div>
                </div>
            </div>
        `;
    }).filter(html => html).join('');
}

function showEmptyReviewsState() {
    elements.myReviewsList.innerHTML = `
        <div class="empty-reviews">
            <i class="fas fa-star"></i>
            <h3>작성한 리뷰가 없습니다</h3>
            <p>좋아하는 책에 대한 첫 번째 리뷰를 작성해보세요!</p>
            <button class="btn-primary" onclick="window.location.href='books.html'">
                <i class="fas fa-plus"></i> 리뷰 작성하러 가기
            </button>
        </div>
    `;
}

// ===== 정렬 함수 =====

function sortUserReviews(reviews, sortBy) {
    return reviews.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.reviewDate) - new Date(a.reviewDate);
            case 'oldest':
                return new Date(a.reviewDate) - new Date(b.reviewDate);
            case 'rating-high':
                return b.rating - a.rating;
            case 'rating-low':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });
}

function handleSortChange() {
    renderUserReviews();
}

// ===== 리뷰 수정 모달 =====

function openEditReviewModal(reviewId) {
    const review = userReviews.find(r => r.id === reviewId);
    const book = getBookById(review.bookId);
    
    if (!review || !book) return;
    
    // 모달 필드 채우기
    if (elements.editReviewId) {
        elements.editReviewId.value = reviewId;
    }
    
    if (elements.editBookInfo) {
        elements.editBookInfo.innerHTML = `
            <h4>${escapeHtml(book.title)}</h4>
            <p>저자: ${escapeHtml(book.author)}</p>
        `;
    }
    
    // 별점 설정
    setStarRating(review.rating);
    
    if (elements.editContent) {
        elements.editContent.value = review.content;
    }
    
    if (elements.editIsRecommended) {
        elements.editIsRecommended.checked = review.isRecommended;
    }
    
    // 모달 표시
    if (elements.editReviewModal) {
        elements.editReviewModal.classList.add('active');
        
        setTimeout(() => {
            if (elements.editContent) {
                elements.editContent.focus();
            }
        }, 100);
    }
}

function closeEditReviewModal() {
    if (elements.editReviewModal) {
        elements.editReviewModal.classList.remove('active');
    }
    
    if (elements.editReviewForm) {
        elements.editReviewForm.reset();
    }
    
    // 별점 리셋
    resetStarRating();
}

// ===== 별점 입력 시스템 =====

function setupStarRating() {
    const stars = elements.editStarRating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            setStarRating(rating);
        });
        
        star.addEventListener('mouseenter', function() {
            highlightStars(parseInt(this.dataset.rating));
        });
    });
    
    elements.editStarRating.addEventListener('mouseleave', function() {
        const currentRating = parseInt(elements.editRating.value) || 0;
        highlightStars(currentRating);
    });
}

function setStarRating(rating) {
    if (elements.editRating) {
        elements.editRating.value = rating;
    }
    highlightStars(rating);
}

function highlightStars(rating) {
    const stars = elements.editStarRating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        const starRating = parseInt(star.dataset.rating);
        const icon = star.querySelector('i');
        
        if (starRating <= rating) {
            star.classList.add('active');
            icon.className = 'fas fa-star';
        } else {
            star.classList.remove('active');
            icon.className = 'far fa-star';
        }
    });
}

function resetStarRating() {
    if (elements.editRating) {
        elements.editRating.value = '';
    }
    highlightStars(0);
}

// ===== 리뷰 수정/삭제 =====

function handleEditReview(e) {
    e.preventDefault();
    
    const reviewId = elements.editReviewId.value;
    const rating = parseInt(elements.editRating.value);
    const content = elements.editContent.value.trim();
    const isRecommended = elements.editIsRecommended.checked;
    
    // 유효성 검사
    if (!rating || rating < 1 || rating > 5) {
        showNotification('평점을 선택해주세요.', 'error');
        return;
    }
    
    if (!content) {
        showNotification('리뷰 내용을 입력해주세요.', 'error');
        return;
    }
    
    // 리뷰 업데이트 - 가이드 data.js의 updateReview() 함수 활용
    const updatedReview = updateReview(reviewId, {
        rating: rating,
        content: content,
        isRecommended: isRecommended
    });
    
    if (updatedReview) {
        showNotification('리뷰가 성공적으로 수정되었습니다!', 'success');
        closeEditReviewModal();
        loadUserData(); // 데이터 새로고침
    } else {
        showNotification('리뷰 수정에 실패했습니다.', 'error');
    }
}

function deleteReviewConfirm(reviewId) {
    const review = userReviews.find(r => r.id === reviewId);
    const book = getBookById(review.bookId);
    
    if (!review || !book) return;
    
    if (confirm(`"${book.title}"에 대한 리뷰를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        // 가이드 data.js의 deleteReview() 함수 활용
        const success = deleteReview(reviewId);
        
        if (success) {
            showNotification('리뷰가 삭제되었습니다.', 'success');
            loadUserData(); // 데이터 새로고침
        } else {
            showNotification('리뷰 삭제에 실패했습니다.', 'error');
        }
    }
}

// ===== 기타 기능 =====

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logoutUser();
        showNotification('로그아웃 되었습니다.', 'info');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}