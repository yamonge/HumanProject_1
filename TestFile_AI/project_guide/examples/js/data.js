// ===== 데이터 관리 함수들 =====

// localStorage에서 데이터 가져오기
function getUsers() {
    const users = localStorage.getItem('bookReviewUsers');
    return users ? JSON.parse(users) : [];
}

function getBooks() {
    const books = localStorage.getItem('bookReviewBooks');
    return books ? JSON.parse(books) : [];
}

function getReviews() {
    const reviews = localStorage.getItem('bookReviewReviews');
    return reviews ? JSON.parse(reviews) : [];
}

// 데이터 저장하기
function saveUsers(users) {
    localStorage.setItem('bookReviewUsers', JSON.stringify(users));
}

function saveBooks(books) {
    localStorage.setItem('bookReviewBooks', JSON.stringify(books));
}

function saveReviews(reviews) {
    localStorage.setItem('bookReviewReviews', JSON.stringify(reviews));
}

// ===== 사용자 관리 함수들 =====

// 새로운 사용자 추가
function addUser(name, email, password) {
    const users = getUsers();
    
    // 이메일 중복 확인
    if (users.find(user => user.email === email)) {
        return null; // 이미 존재하는 이메일
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // 실제 프로젝트에서는 암호화 필요
        joinDate: new Date().toISOString(),
        profileImage: null
    };
    
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

// 로그인 확인
function loginUser(email, password) {
    const users = getUsers();
    return users.find(user => user.email === email && user.password === password);
}

// 현재 로그인한 사용자 가져오기
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// 로그아웃
function logoutUser() {
    localStorage.removeItem('currentUser');
}

// ===== 책 관리 함수들 =====

// 새로운 책 추가
function addBook(title, author, publisher, publishDate, genre, description) {
    const books = getBooks();
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return null; // 로그인 필요
    }
    
    const newBook = {
        id: Date.now(),
        title: title,
        author: author,
        publisher: publisher,
        publishDate: publishDate,
        genre: genre,
        description: description,
        addedBy: currentUser.id,
        addedDate: new Date().toISOString(),
        coverImage: null
    };
    
    books.push(newBook);
    saveBooks(books);
    return newBook;
}

// 책 검색
function searchBooks(keyword) {
    const books = getBooks();
    if (!keyword) return books;
    
    const lowerKeyword = keyword.toLowerCase();
    return books.filter(book => 
        book.title.toLowerCase().includes(lowerKeyword) ||
        book.author.toLowerCase().includes(lowerKeyword) ||
        book.genre.toLowerCase().includes(lowerKeyword)
    );
}

// 특정 책 가져오기
function getBookById(bookId) {
    const books = getBooks();
    return books.find(book => book.id == bookId);
}

// 책 수정
function updateBook(bookId, updatedData) {
    const books = getBooks();
    const bookIndex = books.findIndex(book => book.id == bookId);
    
    if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], ...updatedData };
        saveBooks(books);
        return books[bookIndex];
    }
    return null;
}

// 책 삭제
function deleteBook(bookId) {
    const books = getBooks();
    const filteredBooks = books.filter(book => book.id != bookId);
    
    if (filteredBooks.length < books.length) {
        saveBooks(filteredBooks);
        
        // 해당 책의 모든 리뷰도 삭제
        const reviews = getReviews();
        const filteredReviews = reviews.filter(review => review.bookId != bookId);
        saveReviews(filteredReviews);
        
        return true;
    }
    return false;
}

// ===== 리뷰 관리 함수들 =====

// 새로운 리뷰 추가
function addReview(bookId, rating, content) {
    const reviews = getReviews();
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return null; // 로그인 필요
    }
    
    const newReview = {
        id: Date.now(),
        bookId: parseInt(bookId),
        userId: currentUser.id,
        userName: currentUser.name,
        rating: parseInt(rating),
        content: content,
        reviewDate: new Date().toISOString()
    };
    
    reviews.push(newReview);
    saveReviews(reviews);
    return newReview;
}

// 특정 책의 리뷰들 가져오기
function getReviewsByBook(bookId) {
    const reviews = getReviews();
    return reviews.filter(review => review.bookId == bookId);
}

// 최신 리뷰들 가져오기
function getRecentReviews(limit = 5) {
    const reviews = getReviews();
    return reviews
        .sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate))
        .slice(0, limit);
}

// 내가 쓴 리뷰들 가져오기
function getMyReviews() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const reviews = getReviews();
    return reviews.filter(review => review.userId === currentUser.id);
}

// 리뷰 수정
function updateReview(reviewId, rating, content) {
    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(review => review.id == reviewId);
    
    if (reviewIndex !== -1) {
        reviews[reviewIndex].rating = parseInt(rating);
        reviews[reviewIndex].content = content;
        reviews[reviewIndex].updatedDate = new Date().toISOString();
        saveReviews(reviews);
        return reviews[reviewIndex];
    }
    return null;
}

// 리뷰 삭제
function deleteReview(reviewId) {
    const reviews = getReviews();
    const filteredReviews = reviews.filter(review => review.id != reviewId);
    
    if (filteredReviews.length < reviews.length) {
        saveReviews(filteredReviews);
        return true;
    }
    return false;
}

// ===== 유틸리티 함수들 =====

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 평점 별표 표시
function getStarRating(rating) {
    const fullStars = '⭐'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return fullStars + emptyStars;
}

// 초기 데이터 설정 (개발용)
function initSampleData() {
    const users = getUsers();
    const books = getBooks();
    const reviews = getReviews();
    
    // 샘플 사용자가 없으면 생성
    if (users.length === 0) {
        addUser('홍길동', 'hong@example.com', 'password123');
        addUser('김영희', 'kim@example.com', 'password123');
    }
    
    // 샘플 책이 없으면 생성
    if (books.length === 0) {
        const sampleBooks = [
            ['해리 포터와 마법사의 돌', 'J.K. 롤링', '문학수첩', '2000-01-01', '판타지', '마법 세계의 모험 이야기'],
            ['1984', '조지 오웰', '민음사', '1949-01-01', '디스토피아', '전체주의 사회를 그린 소설'],
            ['어린왕자', '생텍쥐페리', '열린책들', '1943-01-01', '소설', '어른들을 위한 동화']
        ];
        
        sampleBooks.forEach(book => {
            addBook(...book);
        });
    }
}