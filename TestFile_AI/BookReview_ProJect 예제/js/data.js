// ===== BookReview 데이터 관리 시스템 - 가이드 Step2 기반 =====

// 로컬스토리지 키 상수 - 가이드 "localStorage 활용" 섹션
const STORAGE_KEYS = {
    USERS: 'bookreview_users',
    BOOKS: 'bookreview_books', 
    REVIEWS: 'bookreview_reviews',
    CURRENT_USER: 'bookreview_current_user'
};

// ===== 유틸리티 함수들 - 가이드 "헬퍼 함수" 활용 =====

// 고유 ID 생성
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// 날짜 포맷팅
function formatDate(date) {
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    });
}

// HTML 이스케이프 처리
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 별점 HTML 생성
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - rating < 1) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// ===== 사용자 관리 - 가이드 "사용자 인증" 섹션 =====

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function registerUser(username, email, password) {
    const users = getUsers();
    
    // 이메일 중복 확인 - 가이드 "유효성 검사" 참조
    if (users.find(user => user.email === email)) {
        return { success: false, message: '이미 존재하는 이메일입니다.' };
    }
    
    // 새 사용자 생성
    const newUser = {
        id: generateId(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: btoa(password), // 간단한 인코딩 (실제론 해싱 필요)
        joinDate: new Date().toISOString(),
        profileImage: null
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => 
        u.email === email.toLowerCase() && 
        u.password === btoa(password)
    );
    
    if (user) {
        setCurrentUser(user);
        return { success: true, user };
    }
    
    return { success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' };
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ===== 책 관리 - 가이드 "CRUD 기능" 섹션 =====

function getBooks() {
    const books = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return books ? JSON.parse(books) : [];
}

function saveBooks(books) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

function addBook(title, author, publisher, genre, publishDate, description) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const books = getBooks();
    
    const newBook = {
        id: generateId(),
        title: title.trim(),
        author: author.trim(),
        publisher: publisher?.trim() || '',
        genre: genre || '',
        publishDate: publishDate || null,
        description: description?.trim() || '',
        coverImage: null, // 추후 이미지 업로드 기능
        addedBy: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    books.push(newBook);
    saveBooks(books);
    
    return newBook;
}

function updateBook(bookId, updates) {
    const books = getBooks();
    const bookIndex = books.findIndex(book => book.id === bookId);
    
    if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], ...updates };
        saveBooks(books);
        return books[bookIndex];
    }
    
    return null;
}

function deleteBook(bookId) {
    const books = getBooks();
    const filteredBooks = books.filter(book => book.id !== bookId);
    
    if (filteredBooks.length < books.length) {
        saveBooks(filteredBooks);
        
        // 해당 책의 모든 리뷰도 삭제
        const reviews = getReviews();
        const filteredReviews = reviews.filter(review => review.bookId !== bookId);
        saveReviews(filteredReviews);
        
        return true;
    }
    
    return false;
}

function getBookById(bookId) {
    const books = getBooks();
    return books.find(book => book.id === bookId) || null;
}

// ===== 리뷰 관리 - 가이드 "리뷰 시스템" 섹션 =====

function getReviews() {
    const reviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return reviews ? JSON.parse(reviews) : [];
}

function saveReviews(reviews) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

function addReview(bookId, rating, content, isRecommended) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const reviews = getReviews();
    
    // 이미 리뷰를 작성했는지 확인
    const existingReview = reviews.find(r => 
        r.bookId === bookId && r.userId === currentUser.id
    );
    
    if (existingReview) {
        return { success: false, message: '이미 이 책에 리뷰를 작성하셨습니다.' };
    }
    
    const newReview = {
        id: generateId(),
        bookId: bookId,
        userId: currentUser.id,
        rating: parseInt(rating),
        content: content.trim(),
        isRecommended: isRecommended,
        reviewDate: new Date().toISOString()
    };
    
    reviews.push(newReview);
    saveReviews(reviews);
    
    return { success: true, review: newReview };
}

function updateReview(reviewId, updates) {
    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(review => review.id === reviewId);
    
    if (reviewIndex !== -1) {
        reviews[reviewIndex] = { ...reviews[reviewIndex], ...updates };
        saveReviews(reviews);
        return reviews[reviewIndex];
    }
    
    return null;
}

function deleteReview(reviewId) {
    const reviews = getReviews();
    const filteredReviews = reviews.filter(review => review.id !== reviewId);
    
    if (filteredReviews.length < reviews.length) {
        saveReviews(filteredReviews);
        return true;
    }
    
    return false;
}

function getReviewsByBook(bookId) {
    const reviews = getReviews();
    return reviews.filter(review => review.bookId === bookId);
}

function getReviewsByUser(userId) {
    const reviews = getReviews();
    return reviews.filter(review => review.userId === userId);
}

// ===== 검색 및 필터링 - 가이드 "검색 기능" 활용 =====

function searchBooks(query) {
    const books = getBooks();
    const lowerQuery = query.toLowerCase();
    
    return books.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.genre.toLowerCase().includes(lowerQuery)
    );
}

function filterBooksByGenre(genre) {
    const books = getBooks();
    return genre ? books.filter(book => book.genre === genre) : books;
}

function sortBooks(books, sortBy) {
    switch (sortBy) {
        case 'newest':
            return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return books.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'title':
            return books.sort((a, b) => a.title.localeCompare(b.title));
        case 'author':
            return books.sort((a, b) => a.author.localeCompare(b.author));
        case 'rating':
            return books.sort((a, b) => getBookAverageRating(b.id) - getBookAverageRating(a.id));
        case 'reviews':
            return books.sort((a, b) => getReviewsByBook(b.id).length - getReviewsByBook(a.id).length);
        default:
            return books;
    }
}

// ===== 통계 및 분석 - 가이드 "통계 기능" 섹션 =====

function getBookAverageRating(bookId) {
    const reviews = getReviewsByBook(bookId);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
}

function getBookReviewCount(bookId) {
    return getReviewsByBook(bookId).length;
}

function getPopularBooks(limit = 5) {
    const books = getBooks();
    return books
        .map(book => ({
            ...book,
            reviewCount: getBookReviewCount(book.id),
            averageRating: getBookAverageRating(book.id)
        }))
        .sort((a, b) => {
            // 리뷰 수가 같으면 평점으로, 평점도 같으면 최신순으로
            if (b.reviewCount === a.reviewCount) {
                if (b.averageRating === a.averageRating) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return b.averageRating - a.averageRating;
            }
            return b.reviewCount - a.reviewCount;
        })
        .slice(0, limit);
}

function getRecentReviews(limit = 10) {
    const reviews = getReviews();
    const books = getBooks();
    const users = getUsers();
    
    return reviews
        .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
        .slice(0, limit)
        .map(review => {
            const book = books.find(b => b.id === review.bookId);
            const user = users.find(u => u.id === review.userId);
            return {
                ...review,
                bookTitle: book?.title || '삭제된 책',
                bookAuthor: book?.author || '',
                reviewerName: user?.username || '탈퇴한 회원'
            };
        });
}

function getUserStats(userId = null) {
    const targetUserId = userId || getCurrentUser()?.id;
    if (!targetUserId) return null;
    
    const userReviews = getReviewsByUser(targetUserId);
    const totalReviews = userReviews.length;
    
    if (totalReviews === 0) {
        return {
            totalReviews: 0,
            averageRating: 0,
            recommendedBooks: 0,
            favoriteGenres: []
        };
    }
    
    const averageRating = userReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const recommendedBooks = userReviews.filter(review => review.isRecommended).length;
    
    // 장르별 통계
    const books = getBooks();
    const genreCount = {};
    
    userReviews.forEach(review => {
        const book = books.find(b => b.id === review.bookId);
        if (book && book.genre) {
            genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
        }
    });
    
    const favoriteGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre, count]) => ({ genre, count }));
    
    return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        recommendedBooks,
        favoriteGenres
    };
}

function getOverallStats() {
    const books = getBooks();
    const reviews = getReviews();
    const users = getUsers();
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    return {
        totalBooks: books.length,
        totalReviews: reviews.length,
        totalUsers: users.length,
        averageRating: Math.round(averageRating * 10) / 10
    };
}

// ===== 샘플 데이터 초기화 - 가이드 "테스트 데이터" 활용 =====

function initializeSampleData() {
    // 이미 데이터가 있으면 스킵
    if (getBooks().length > 0) return;
    
    // 샘플 사용자 생성
    const sampleUsers = [
        { username: '독서왕김씨', email: 'kim@example.com', password: 'password123' },
        { username: '책벌레이씨', email: 'lee@example.com', password: 'password123' },
        { username: '리뷰어박씨', email: 'park@example.com', password: 'password123' }
    ];
    
    sampleUsers.forEach(userData => {
        registerUser(userData.username, userData.email, userData.password);
    });
    
    // 첫 번째 사용자로 로그인
    const firstUser = getUsers()[0];
    setCurrentUser(firstUser);
    
    // 샘플 책 데이터
    const sampleBooks = [
        {
            title: '클린 코드',
            author: '로버트 C. 마틴',
            publisher: '인사이트',
            genre: '컴퓨터',
            description: '애자일 소프트웨어 장인 정신'
        },
        {
            title: '데미안',
            author: '헤르만 헤세',
            publisher: '민음사',
            genre: '소설',
            description: '청년의 성장을 그린 고전 명작'
        },
        {
            title: '7가지 습관',
            author: '스티븐 코비',
            publisher: '김영사',
            genre: '자기계발',
            description: '성공적인 삶을 위한 원칙들'
        },
        {
            title: '사피엔스',
            author: '유발 하라리',
            publisher: '김영사',
            genre: '역사',
            description: '인류의 역사를 새롭게 조명한 책'
        },
        {
            title: '코스모스',
            author: '칼 세이건',
            publisher: '사이언스북스',
            genre: '과학',
            description: '우주의 신비를 탐구하는 과학 교양서'
        }
    ];
    
    // 책 추가
    const addedBooks = [];
    sampleBooks.forEach(bookData => {
        const book = addBook(
            bookData.title,
            bookData.author, 
            bookData.publisher,
            bookData.genre,
            null,
            bookData.description
        );
        if (book) addedBooks.push(book);
    });
    
    // 샘플 리뷰 추가
    if (addedBooks.length > 0) {
        const users = getUsers();
        
        // 각 책에 랜덤 리뷰 추가
        addedBooks.forEach((book, index) => {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            setCurrentUser(randomUser);
            
            const sampleReviews = [
                '정말 좋은 책이었습니다! 강력 추천합니다.',
                '흥미롭게 읽었어요. 다시 읽고 싶네요.',
                '생각해볼 거리가 많은 책입니다.',
                '쉽게 읽히지만 깊이 있는 내용이네요.',
                '기대했던 것보다 더 좋았습니다.'
            ];
            
            const randomRating = Math.floor(Math.random() * 2) + 4; // 4-5점
            const randomContent = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
            const randomRecommended = Math.random() > 0.3; // 70% 확률로 추천
            
            addReview(book.id, randomRating, randomContent, randomRecommended);
        });
        
        // 원래 사용자로 복원
        setCurrentUser(firstUser);
    }
}

// ===== 데이터 검증 및 정리 =====

function validateData() {
    // 고아 리뷰 정리 (존재하지 않는 책이나 사용자의 리뷰)
    const reviews = getReviews();
    const books = getBooks();
    const users = getUsers();
    
    const bookIds = books.map(book => book.id);
    const userIds = users.map(user => user.id);
    
    const validReviews = reviews.filter(review => 
        bookIds.includes(review.bookId) && userIds.includes(review.userId)
    );
    
    if (validReviews.length !== reviews.length) {
        saveReviews(validReviews);
    }
}

// 페이지 로드시 데이터 검증
document.addEventListener('DOMContentLoaded', () => {
    validateData();
    // 샘플 데이터는 필요시에만 초기화
    // initializeSampleData();
});