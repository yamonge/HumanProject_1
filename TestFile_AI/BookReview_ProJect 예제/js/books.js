// ===== BookReview 도서 목록 페이지 - 가이드 기반 =====

// 전역 변수
let currentBooks = [];
let filteredBooks = [];
let currentPage = 1;
let booksPerPage = 12;
let currentView = 'grid';

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
    
    // 검색 및 필터
    bookSearchInput: document.getElementById('bookSearchInput'),
    bookSearchBtn: document.getElementById('bookSearchBtn'),
    genreFilter: document.getElementById('genreFilter'),
    sortBy: document.getElementById('sortBy'),
    
    // 도서 관련
    booksCount: document.getElementById('booksCount'),
    booksGrid: document.getElementById('booksGrid'),
    booksLoading: document.getElementById('booksLoading'),
    
    // 뷰 토글
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    
    // 페이지네이션
    booksPagination: document.getElementById('booksPagination'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    paginationInfo: document.getElementById('paginationInfo'),
    
    // 모달
    addBookBtn: document.getElementById('addBookBtn'),
    addBookModal: document.getElementById('addBookModal'),
    closeAddBookModal: document.getElementById('closeAddBookModal'),
    addBookForm: document.getElementById('addBookForm'),
    cancelAddBook: document.getElementById('cancelAddBook')
};

// ===== 페이지 초기화 =====

document.addEventListener('DOMContentLoaded', function() {
    // 가이드 토글 시스템 초기화
    initGuideToggleSystem();
    
    // 사용자 인증 상태 확인
    updateUserInterface();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 도서 데이터 로드
    loadBooks();
    
    // 샘플 데이터 확인
    if (getBooks().length === 0) {
        initializeSampleData();
        loadBooks();
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

// ===== 이벤트 리스너 설정 =====

function setupEventListeners() {
    // 로그아웃
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 검색 및 필터
    if (elements.bookSearchInput) {
        elements.bookSearchInput.addEventListener('input', handleSearch);
        elements.bookSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    if (elements.bookSearchBtn) {
        elements.bookSearchBtn.addEventListener('click', handleSearch);
    }
    
    if (elements.genreFilter) {
        elements.genreFilter.addEventListener('change', handleFilter);
    }
    
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', handleSort);
    }
    
    // 뷰 토글
    if (elements.gridViewBtn) {
        elements.gridViewBtn.addEventListener('click', () => switchView('grid'));
    }
    
    if (elements.listViewBtn) {
        elements.listViewBtn.addEventListener('click', () => switchView('list'));
    }
    
    // 페이지네이션
    if (elements.prevPageBtn) {
        elements.prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    }
    
    if (elements.nextPageBtn) {
        elements.nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
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
    
    if (elements.addBookForm) {
        elements.addBookForm.addEventListener('submit', handleAddBook);
    }
}

// ===== 사용자 인터페이스 업데이트 =====

function updateUserInterface() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        if (elements.userGreeting) {
            elements.userGreeting.textContent = `${currentUser.username}님`;
            elements.userGreeting.style.display = 'inline-block';
        }
        
        if (elements.loginBtn) elements.loginBtn.style.display = 'none';
        if (elements.registerBtn) elements.registerBtn.style.display = 'none';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'inline-block';
        
        if (elements.addBookBtn) elements.addBookBtn.disabled = false;
        
    } else {
        if (elements.userGreeting) elements.userGreeting.style.display = 'none';
        if (elements.loginBtn) elements.loginBtn.style.display = 'inline-block';
        if (elements.registerBtn) elements.registerBtn.style.display = 'inline-block';
        if (elements.logoutBtn) elements.logoutBtn.style.display = 'none';
        
        if (elements.addBookBtn) {
            elements.addBookBtn.disabled = true;
            elements.addBookBtn.onclick = function() {
                showNotification('로그인 후 책을 추가할 수 있습니다.', 'info');
            };
        }
    }
}

// ===== 도서 데이터 로드 - 가이드 "데이터 로드" 활용 =====

function loadBooks() {
    showLoading();
    
    // 가이드 data.js의 getBooks() 함수 활용
    currentBooks = getBooks();
    filteredBooks = [...currentBooks];
    
    // 기본 정렬 적용
    applyFiltersAndSort();
    
    setTimeout(() => {
        hideLoading();
        renderBooks();
        updateBooksCount();
        updatePagination();
    }, 500); // 로딩 효과를 위한 지연
}

function showLoading() {
    if (elements.booksLoading) {
        elements.booksLoading.style.display = 'block';
    }
    if (elements.booksGrid) {
        elements.booksGrid.style.display = 'none';
    }
}

function hideLoading() {
    if (elements.booksLoading) {
        elements.booksLoading.style.display = 'none';
    }
    if (elements.booksGrid) {
        elements.booksGrid.style.display = 'grid';
    }
}

// ===== 검색 및 필터링 - 가이드 "검색 기능" 활용 =====

function handleSearch() {
    applyFiltersAndSort();
}

function handleFilter() {
    applyFiltersAndSort();
}

function handleSort() {
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let books = [...currentBooks];
    
    // 검색 적용 - 가이드 searchBooks() 함수 활용
    const searchQuery = elements.bookSearchInput?.value.trim();
    if (searchQuery) {
        books = searchBooks(searchQuery);
    }
    
    // 장르 필터 적용 - 가이드 filterBooksByGenre() 함수 활용
    const selectedGenre = elements.genreFilter?.value;
    if (selectedGenre) {
        books = filterBooksByGenre(selectedGenre);
        if (searchQuery) {
            // 검색과 필터를 동시에 적용
            books = books.filter(book => 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    }
    
    // 정렬 적용 - 가이드 sortBooks() 함수 활용
    const sortBy = elements.sortBy?.value || 'newest';
    books = sortBooks(books, sortBy);
    
    filteredBooks = books;
    currentPage = 1;
    
    renderBooks();
    updateBooksCount();
    updatePagination();
}

// ===== 도서 렌더링 =====

function renderBooks() {
    if (!elements.booksGrid) return;
    
    if (filteredBooks.length === 0) {
        showEmptyState();
        return;
    }
    
    // 페이지네이션 적용
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);
    
    elements.booksGrid.innerHTML = booksToShow.map(book => {
        const averageRating = getBookAverageRating(book.id);
        const reviewCount = getBookReviewCount(book.id);
        const currentUser = getCurrentUser();
        const canEdit = currentUser && book.addedBy === currentUser.id;
        
        return `
            <div class="book-card" onclick="viewBookDetails('${book.id}')">
                ${canEdit ? `
                    <div class="book-actions">
                        <button class="action-btn edit-btn" onclick="event.stopPropagation(); editBook('${book.id}')" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteBookConfirm('${book.id}')" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
                
                <div class="book-cover">
                    <i class="fas fa-book"></i>
                </div>
                
                <div class="book-info">
                    <div class="book-title">${escapeHtml(book.title)}</div>
                    <div class="book-author">저자: ${escapeHtml(book.author)}</div>
                    ${book.publisher ? `<div class="book-publisher">${escapeHtml(book.publisher)}</div>` : ''}
                    ${book.description ? `<div class="book-description">${escapeHtml(book.description)}</div>` : ''}
                    
                    <div class="book-meta">
                        <div class="book-rating">
                            <span class="stars">${generateStars(averageRating)}</span>
                            <span>${averageRating.toFixed(1)} (${reviewCount}개)</span>
                        </div>
                        ${book.genre ? `<div class="book-genre">${escapeHtml(book.genre)}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showEmptyState() {
    const searchQuery = elements.bookSearchInput?.value.trim();
    const selectedGenre = elements.genreFilter?.value;
    
    let message = '등록된 도서가 없습니다.';
    let submessage = '첫 번째 책을 추가해보세요!';
    
    if (searchQuery || selectedGenre) {
        message = '검색 결과가 없습니다.';
        submessage = '다른 검색어나 필터를 시도해보세요.';
    }
    
    elements.booksGrid.innerHTML = `
        <div class="empty-books">
            <i class="fas fa-search"></i>
            <h3>${message}</h3>
            <p>${submessage}</p>
            ${!searchQuery && !selectedGenre ? `
                <button class="btn-primary" onclick="openAddBookModal()">
                    <i class="fas fa-plus"></i> 첫 번째 책 추가하기
                </button>
            ` : ''}
        </div>
    `;
}

// ===== 뷰 전환 =====

function switchView(view) {
    currentView = view;
    
    if (view === 'grid') {
        elements.booksGrid.classList.remove('list-view');
        elements.gridViewBtn.classList.add('active');
        elements.listViewBtn.classList.remove('active');
    } else {
        elements.booksGrid.classList.add('list-view');
        elements.listViewBtn.classList.add('active');
        elements.gridViewBtn.classList.remove('active');
    }
}

// ===== 페이지네이션 =====

function updatePagination() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    if (totalPages <= 1) {
        if (elements.booksPagination) {
            elements.booksPagination.style.display = 'none';
        }
        return;
    }
    
    if (elements.booksPagination) {
        elements.booksPagination.style.display = 'flex';
    }
    
    // 버튼 상태 업데이트
    if (elements.prevPageBtn) {
        elements.prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (elements.nextPageBtn) {
        elements.nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    // 페이지 정보 업데이트
    if (elements.paginationInfo) {
        elements.paginationInfo.innerHTML = `<span>${currentPage} / ${totalPages} 페이지</span>`;
    }
}

function changePage(newPage) {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    renderBooks();
    updatePagination();
    
    // 페이지 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== 도서 관련 액션 =====

function updateBooksCount() {
    if (elements.booksCount) {
        const searchQuery = elements.bookSearchInput?.value.trim();
        const selectedGenre = elements.genreFilter?.value;
        
        let countText = `전체 ${filteredBooks.length.toLocaleString()}권`;
        
        if (searchQuery || selectedGenre) {
            countText = `검색결과 ${filteredBooks.length.toLocaleString()}권`;
        }
        
        elements.booksCount.textContent = countText;
    }
}

function viewBookDetails(bookId) {
    // 도서 상세 페이지로 이동
    window.location.href = `book-detail.html?id=${bookId}`;
}

function editBook(bookId) {
    // 도서 수정 기능 (추후 구현)
    showNotification('도서 수정 기능은 개발 중입니다.', 'info');
    console.log('도서 수정:', bookId);
}

function deleteBookConfirm(bookId) {
    const book = getBookById(bookId);
    if (!book) return;
    
    if (confirm(`"${book.title}" 책을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        const success = deleteBook(bookId);
        
        if (success) {
            showNotification('책이 삭제되었습니다.', 'success');
            loadBooks();
        } else {
            showNotification('책 삭제에 실패했습니다.', 'error');
        }
    }
}

// ===== 책 추가 모달 =====

function openAddBookModal() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('로그인 후 책을 추가할 수 있습니다.', 'error');
        return;
    }
    
    if (elements.addBookModal) {
        elements.addBookModal.classList.add('active');
        
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
    
    // 유효성 검사
    if (!bookData.title) {
        showNotification('책 제목을 입력해주세요.', 'error');
        return;
    }
    
    if (!bookData.author) {
        showNotification('저자를 입력해주세요.', 'error');
        return;
    }
    
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
            loadBooks();
        } else {
            showNotification('책 추가에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('책 추가 오류:', error);
        showNotification('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
}

// ===== 기타 기능 =====

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logoutUser();
        updateUserInterface();
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