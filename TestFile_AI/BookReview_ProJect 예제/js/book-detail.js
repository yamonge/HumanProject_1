// ===== BookReview 도서 상세 페이지 - 가이드 기반 =====

// 전역 변수
let currentBook = null;
let bookReviews = [];
let currentUser = null;
let reviewsDisplayCount = 5; // 한 번에 표시할 리뷰 수
let totalDisplayedReviews = 0;

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
    
    // 페이지 요소
    breadcrumbTitle: document.getElementById('breadcrumbTitle'),
    bookLoading: document.getElementById('bookLoading'),
    bookNotFound: document.getElementById('bookNotFound'),
    bookDetailContent: document.getElementById('bookDetailContent'),
    
    // 도서 정보
    bookTitle: document.getElementById('bookTitle'),
    bookAuthor: document.getElementById('bookAuthor'),
    bookPublisher: document.getElementById('bookPublisher'),
    bookPublisherInfo: document.getElementById('bookPublisherInfo'),
    bookGenre: document.getElementById('bookGenre'),
    bookGenreInfo: document.getElementById('bookGenreInfo'),
    bookPublishDate: document.getElementById('bookPublishDate'),
    bookDateInfo: document.getElementById('bookDateInfo'),
    bookDescription: document.getElementById('bookDescription'),
    bookDescriptionSection: document.getElementById('bookDescriptionSection'),
    
    // 평점 정보
    bookRatingStars: document.getElementById('bookRatingStars'),
    bookAverageRating: document.getElementById('bookAverageRating'),
    bookReviewCount: document.getElementById('bookReviewCount'),
    
    // 액션 버튼
    writeReviewBtn: document.getElementById('writeReviewBtn'),
    writeReviewBtn2: document.getElementById('writeReviewBtn2'),
    editBookBtn: document.getElementById('editBookBtn'),
    deleteBookBtn: document.getElementById('deleteBookBtn'),
    
    // 리뷰 섹션
    bookReviewsSection: document.getElementById('bookReviewsSection'),
    reviewsCount: document.getElementById('reviewsCount'),
    reviewsSortBy: document.getElementById('reviewsSortBy'),
    reviewsLoading: document.getElementById('reviewsLoading'),
    reviewsList: document.getElementById('reviewsList'),
    loadMoreSection: document.getElementById('loadMoreSection'),
    loadMoreReviewsBtn: document.getElementById('loadMoreReviewsBtn'),
    
    // 리뷰 작성 모달
    writeReviewModal: document.getElementById('writeReviewModal'),
    closeWriteReviewModal: document.getElementById('closeWriteReviewModal'),
    writeReviewForm: document.getElementById('writeReviewForm'),
    cancelWriteReview: document.getElementById('cancelWriteReview'),
    writeBookInfo: document.getElementById('writeBookInfo'),
    writeStarRating: document.getElementById('writeStarRating'),
    writeRating: document.getElementById('writeRating'),
    writeContent: document.getElementById('writeContent'),
    writeIsRecommended: document.getElementById('writeIsRecommended')
};

// ===== 페이지 초기화 =====

document.addEventListener('DOMContentLoaded', function() {
    // 가이드 토글 시스템 초기화
    initGuideToggleSystem();
    
    // 사용자 인증 상태 확인
    currentUser = getCurrentUser();
    updateUserInterface();
    
    // URL에서 bookId 추출
    const bookId = getBookIdFromURL();
    
    if (bookId) {
        // 도서 데이터 로드
        loadBookData(bookId);
    } else {
        // bookId가 없으면 도서 목록으로 리다이렉트
        showNotification('잘못된 접근입니다.', 'error');
        setTimeout(() => {
            window.location.href = 'books.html';
        }, 2000);
    }
    
    // 이벤트 리스너 설정
    setupEventListeners();
});

// ===== URL 파라미터 처리 - 가이드 "URL 파라미터" 활용 =====

function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

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

// ===== 사용자 인터페이스 업데이트 =====

function updateUserInterface() {
    if (currentUser) {
        if (elements.userGreeting) {
            elements.userGreeting.textContent = `${currentUser.username}님`;
            elements.userGreeting.style.display = 'inline-block';
        }
        
        if (elements.loginBtn) elements.loginBtn.style.display = 'none';
        if (elements.registerBtn) elements.registerBtn.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'inline-block';
        
    } else {
        if (elements.userGreeting) elements.userGreeting.style.display = 'none';
        if (elements.loginBtn) elements.loginBtn.style.display = 'inline-block';
        if (elements.registerBtn) elements.registerBtn.style.display = 'inline-block';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
    }
}

// ===== 이벤트 리스너 설정 =====

function setupEventListeners() {
    // 로그아웃
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 리뷰 작성 버튼들
    if (elements.writeReviewBtn) {
        elements.writeReviewBtn.addEventListener('click', openWriteReviewModal);
    }
    
    if (elements.writeReviewBtn2) {
        elements.writeReviewBtn2.addEventListener('click', openWriteReviewModal);
    }
    
    // 도서 수정/삭제 버튼들
    if (elements.editBookBtn) {
        elements.editBookBtn.addEventListener('click', editBook);
    }
    
    if (elements.deleteBookBtn) {
        elements.deleteBookBtn.addEventListener('click', deleteBookConfirm);
    }
    
    // 리뷰 정렬
    if (elements.reviewsSortBy) {
        elements.reviewsSortBy.addEventListener('change', handleReviewSortChange);
    }
    
    // 더 보기 버튼
    if (elements.loadMoreReviewsBtn) {
        elements.loadMoreReviewsBtn.addEventListener('click', loadMoreReviews);
    }
    
    // 리뷰 작성 모달
    if (elements.closeWriteReviewModal) {
        elements.closeWriteReviewModal.addEventListener('click', closeWriteReviewModal);
    }
    
    if (elements.cancelWriteReview) {
        elements.cancelWriteReview.addEventListener('click', closeWriteReviewModal);
    }
    
    if (elements.writeReviewModal) {
        elements.writeReviewModal.addEventListener('click', function(e) {
            if (e.target === elements.writeReviewModal) {
                closeWriteReviewModal();
            }
        });
    }
    
    if (elements.writeReviewForm) {
        elements.writeReviewForm.addEventListener('submit', handleWriteReview);
    }
    
    // 별점 입력
    if (elements.writeStarRating) {
        setupStarRating();
    }
}

// ===== 도서 데이터 로드 - 가이드 "데이터 로드" 활용 =====

function loadBookData(bookId) {
    showBookLoading();
    
    // 가이드 data.js의 getBookById() 함수 활용
    currentBook = getBookById(bookId);
    
    if (!currentBook) {
        showBookNotFound();
        return;
    }
    
    // 가이드 data.js의 getReviewsByBook() 함수 활용
    bookReviews = getReviewsByBook(bookId);
    
    setTimeout(() => {
        hideBookLoading();
        renderBookDetails();
        checkUserPermissions();
        loadReviews();
    }, 800);
}

function showBookLoading() {
    if (elements.bookLoading) {
        elements.bookLoading.style.display = 'block';
    }
    if (elements.bookDetailContent) {
        elements.bookDetailContent.style.display = 'none';
    }
    if (elements.bookReviewsSection) {
        elements.bookReviewsSection.style.display = 'none';
    }
}

function hideBookLoading() {
    if (elements.bookLoading) {
        elements.bookLoading.style.display = 'none';
    }
    if (elements.bookDetailContent) {
        elements.bookDetailContent.style.display = 'block';
    }
    if (elements.bookReviewsSection) {
        elements.bookReviewsSection.style.display = 'block';
    }
}

function showBookNotFound() {
    if (elements.bookLoading) {
        elements.bookLoading.style.display = 'none';
    }
    if (elements.bookNotFound) {
        elements.bookNotFound.style.display = 'block';
    }
}

// ===== 도서 상세 정보 렌더링 =====

function renderBookDetails() {
    if (!currentBook) return;
    
    // 브레드크럼 업데이트
    if (elements.breadcrumbTitle) {
        elements.breadcrumbTitle.textContent = currentBook.title;
    }
    
    // 페이지 타이틀 업데이트
    document.title = `${currentBook.title} - BookReview`;
    
    // 도서 기본 정보
    if (elements.bookTitle) {
        elements.bookTitle.textContent = currentBook.title;
    }
    
    if (elements.bookAuthor) {
        elements.bookAuthor.textContent = currentBook.author;
    }
    
    // 선택적 정보들
    if (currentBook.publisher) {
        if (elements.bookPublisher) {
            elements.bookPublisher.textContent = currentBook.publisher;
        }
        if (elements.bookPublisherInfo) {
            elements.bookPublisherInfo.style.display = 'block';
        }
    }
    
    if (currentBook.genre) {
        if (elements.bookGenre) {
            elements.bookGenre.textContent = currentBook.genre;
        }
        if (elements.bookGenreInfo) {
            elements.bookGenreInfo.style.display = 'block';
        }
    }
    
    if (currentBook.publishDate) {
        if (elements.bookPublishDate) {
            elements.bookPublishDate.textContent = formatDate(currentBook.publishDate);
        }
        if (elements.bookDateInfo) {
            elements.bookDateInfo.style.display = 'block';
        }
    }
    
    if (currentBook.description) {
        if (elements.bookDescription) {
            elements.bookDescription.textContent = currentBook.description;
        }
        if (elements.bookDescriptionSection) {
            elements.bookDescriptionSection.style.display = 'block';
        }
    }
    
    // 평점 정보 - 가이드 "평점 계산" 활용
    updateRatingDisplay();
}

function updateRatingDisplay() {
    const averageRating = getBookAverageRating(currentBook.id);
    const reviewCount = getBookReviewCount(currentBook.id);
    
    if (elements.bookRatingStars) {
        elements.bookRatingStars.innerHTML = generateStars(averageRating);
    }
    
    if (elements.bookAverageRating) {
        elements.bookAverageRating.textContent = averageRating.toFixed(1);
    }
    
    if (elements.bookReviewCount) {
        elements.bookReviewCount.textContent = reviewCount.toLocaleString();
    }
}

// ===== 사용자 권한 확인 =====

function checkUserPermissions() {
    if (!currentUser || !currentBook) return;
    
    // 도서 작성자만 수정/삭제 가능
    const canEdit = currentBook.addedBy === currentUser.id;
    
    if (elements.editBookBtn) {
        elements.editBookBtn.style.display = canEdit ? 'inline-block' : 'none';
    }
    
    if (elements.deleteBookBtn) {
        elements.deleteBookBtn.style.display = canEdit ? 'inline-block' : 'none';
    }
    
    // 리뷰 작성 버튼 활성화/비활성화
    const hasUserReviewed = bookReviews.some(review => review.userId === currentUser.id);
    
    if (elements.writeReviewBtn) {
        if (hasUserReviewed) {
            elements.writeReviewBtn.textContent = '리뷰 수정';
            elements.writeReviewBtn.innerHTML = '<i class="fas fa-edit"></i> 리뷰 수정';
        } else {
            elements.writeReviewBtn.innerHTML = '<i class="fas fa-star"></i> 리뷰 작성';
        }
    }
    
    if (elements.writeReviewBtn2) {
        if (hasUserReviewed) {
            elements.writeReviewBtn2.innerHTML = '<i class="fas fa-edit"></i> 리뷰 수정';
        } else {
            elements.writeReviewBtn2.innerHTML = '<i class="fas fa-plus"></i> 리뷰 작성';
        }
    }
}

// ===== 리뷰 로드 및 렌더링 =====

function loadReviews() {
    showReviewsLoading();
    
    setTimeout(() => {
        hideReviewsLoading();
        renderReviews();
        updateReviewsCount();
    }, 500);
}

function showReviewsLoading() {
    if (elements.reviewsLoading) {
        elements.reviewsLoading.style.display = 'block';
    }
    if (elements.reviewsList) {
        elements.reviewsList.style.display = 'none';
    }
}

function hideReviewsLoading() {
    if (elements.reviewsLoading) {
        elements.reviewsLoading.style.display = 'none';
    }
    if (elements.reviewsList) {
        elements.reviewsList.style.display = 'block';
    }
}

function renderReviews() {
    if (!elements.reviewsList) return;
    
    if (bookReviews.length === 0) {
        showEmptyReviewsState();
        return;
    }
    
    // 정렬 적용
    const sortBy = elements.reviewsSortBy?.value || 'newest';
    const sortedReviews = sortBookReviews(bookReviews, sortBy);
    
    // 표시할 리뷰 수 결정
    totalDisplayedReviews = Math.min(reviewsDisplayCount, sortedReviews.length);
    const reviewsToShow = sortedReviews.slice(0, totalDisplayedReviews);
    
    elements.reviewsList.innerHTML = reviewsToShow.map(review => {
        const user = getUserById(review.userId);
        const canEdit = currentUser && review.userId === currentUser.id;
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="reviewer-details">
                            <h4 class="reviewer-name">${escapeHtml(user ? user.username : '익명')}</h4>
                            <div class="review-meta">
                                <div class="review-rating">
                                    ${generateStars(review.rating)}
                                    <span class="rating-text">${review.rating}점</span>
                                </div>
                                <div class="review-date">
                                    <i class="fas fa-calendar"></i>
                                    ${formatDate(review.reviewDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                    ${canEdit ? `
                        <div class="review-actions">
                            <button class="review-action-btn edit-btn" onclick="editReview('${review.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="review-action-btn delete-btn" onclick="deleteReviewConfirm('${review.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="review-content">
                    ${escapeHtml(review.content)}
                </div>
                
                <div class="review-footer">
                    <div class="review-recommendation ${review.isRecommended ? 'recommended' : 'not-recommended'}">
                        <i class="fas fa-${review.isRecommended ? 'thumbs-up' : 'thumbs-down'}"></i>
                        ${review.isRecommended ? '추천' : '비추천'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 더 보기 버튼 표시/숨김
    updateLoadMoreButton();
}

function showEmptyReviewsState() {
    elements.reviewsList.innerHTML = `
        <div class="empty-reviews">
            <i class="fas fa-star"></i>
            <h3>아직 리뷰가 없습니다</h3>
            <p>이 책의 첫 번째 리뷰를 작성해보세요!</p>
            ${currentUser ? `
                <button class="btn-primary" onclick="openWriteReviewModal()">
                    <i class="fas fa-star"></i> 첫 번째 리뷰 작성하기
                </button>
            ` : `
                <a href="login.html" class="btn-primary">
                    <i class="fas fa-sign-in-alt"></i> 로그인 후 리뷰 작성
                </a>
            `}
        </div>
    `;
    
    if (elements.loadMoreSection) {
        elements.loadMoreSection.style.display = 'none';
    }
}

function updateReviewsCount() {
    if (elements.reviewsCount) {
        elements.reviewsCount.textContent = `(${bookReviews.length.toLocaleString()})`;
    }
}

function updateLoadMoreButton() {
    if (elements.loadMoreSection) {
        if (totalDisplayedReviews < bookReviews.length) {
            elements.loadMoreSection.style.display = 'block';
        } else {
            elements.loadMoreSection.style.display = 'none';
        }
    }
}

// ===== 리뷰 정렬 =====

function sortBookReviews(reviews, sortBy) {
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

function handleReviewSortChange() {
    renderReviews();
}

function loadMoreReviews() {
    reviewsDisplayCount += 5;
    renderReviews();
}

// ===== 리뷰 작성 모달 =====

function openWriteReviewModal() {
    if (!currentUser) {
        showNotification('로그인 후 리뷰를 작성할 수 있습니다.', 'error');
        return;
    }
    
    // 기존 리뷰가 있는지 확인
    const existingReview = bookReviews.find(review => review.userId === currentUser.id);
    
    if (existingReview) {
        // 기존 리뷰 수정
        window.location.href = `my-reviews.html`;
        return;
    }
    
    // 모달 필드 초기화
    if (elements.writeBookInfo && currentBook) {
        elements.writeBookInfo.innerHTML = `
            <h4>${escapeHtml(currentBook.title)}</h4>
            <p>저자: ${escapeHtml(currentBook.author)}</p>
        `;
    }
    
    resetStarRating();
    
    if (elements.writeContent) {
        elements.writeContent.value = '';
    }
    
    if (elements.writeIsRecommended) {
        elements.writeIsRecommended.checked = false;
    }
    
    // 모달 표시
    if (elements.writeReviewModal) {
        elements.writeReviewModal.classList.add('active');
        
        setTimeout(() => {
            if (elements.writeContent) {
                elements.writeContent.focus();
            }
        }, 100);
    }
}

function closeWriteReviewModal() {
    if (elements.writeReviewModal) {
        elements.writeReviewModal.classList.remove('active');
    }
    
    if (elements.writeReviewForm) {
        elements.writeReviewForm.reset();
    }
    
    resetStarRating();
}

// ===== 별점 입력 시스템 =====

function setupStarRating() {
    const stars = elements.writeStarRating.querySelectorAll('.star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            setStarRating(rating);
        });
        
        star.addEventListener('mouseenter', function() {
            highlightStars(parseInt(this.dataset.rating));
        });
    });
    
    elements.writeStarRating.addEventListener('mouseleave', function() {
        const currentRating = parseInt(elements.writeRating.value) || 0;
        highlightStars(currentRating);
    });
}

function setStarRating(rating) {
    if (elements.writeRating) {
        elements.writeRating.value = rating;
    }
    highlightStars(rating);
}

function highlightStars(rating) {
    const stars = elements.writeStarRating.querySelectorAll('.star');
    
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
    if (elements.writeRating) {
        elements.writeRating.value = '';
    }
    highlightStars(0);
}

// ===== 리뷰 작성/수정/삭제 =====

function handleWriteReview(e) {
    e.preventDefault();
    
    const rating = parseInt(elements.writeRating.value);
    const content = elements.writeContent.value.trim();
    const isRecommended = elements.writeIsRecommended.checked;
    
    // 유효성 검사
    if (!rating || rating < 1 || rating > 5) {
        showNotification('평점을 선택해주세요.', 'error');
        return;
    }
    
    if (!content) {
        showNotification('리뷰 내용을 입력해주세요.', 'error');
        return;
    }
    
    // 리뷰 추가 - 가이드 data.js의 addReview() 함수 활용
    const newReview = addReview(currentBook.id, rating, content, isRecommended);
    
    if (newReview) {
        showNotification('리뷰가 성공적으로 작성되었습니다! 🎉', 'success');
        closeWriteReviewModal();
        
        // 데이터 새로고침
        bookReviews = getReviewsByBook(currentBook.id);
        loadReviews();
        updateRatingDisplay();
        checkUserPermissions();
        
    } else {
        showNotification('리뷰 작성에 실패했습니다.', 'error');
    }
}

function editReview(reviewId) {
    // 내 리뷰 페이지로 이동
    window.location.href = 'my-reviews.html';
}

function deleteReviewConfirm(reviewId) {
    if (confirm('이 리뷰를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        const success = deleteReview(reviewId);
        
        if (success) {
            showNotification('리뷰가 삭제되었습니다.', 'success');
            
            // 데이터 새로고침
            bookReviews = getReviewsByBook(currentBook.id);
            loadReviews();
            updateRatingDisplay();
            checkUserPermissions();
            
        } else {
            showNotification('리뷰 삭제에 실패했습니다.', 'error');
        }
    }
}

// ===== 도서 수정/삭제 =====

function editBook() {
    // 도서 수정 기능 (추후 구현 또는 books.html로 이동)
    showNotification('도서 수정 기능은 개발 중입니다.', 'info');
}

function deleteBookConfirm() {
    if (confirm(`"${currentBook.title}" 책을 삭제하시겠습니까?\n관련된 모든 리뷰도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)) {
        const success = deleteBook(currentBook.id);
        
        if (success) {
            showNotification('책이 삭제되었습니다.', 'success');
            
            setTimeout(() => {
                window.location.href = 'books.html';
            }, 2000);
            
        } else {
            showNotification('책 삭제에 실패했습니다.', 'error');
        }
    }
}

// ===== 기타 기능 =====

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logoutUser();
        currentUser = null;
        updateUserInterface();
        checkUserPermissions();
        showNotification('로그아웃 되었습니다.', 'info');
        
        setTimeout(() => location.reload(), 1000);
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