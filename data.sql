INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("어린왕자들", "종이책", 0, "어리다..", "많이 어리다..", "김어림", 100, "목차입니다.", 20000, "2025-01-01");

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("신데렐라들", "종이책", 1, "유리구두..", "투명한 유리구두..", "김구두", 100, "목차입니다.", 20000, "2026-01-01");

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("백설공주들", "종이책", 2, "사과..", "빨간 사과..", "김사과", 100, "목차입니다.", 20000, "2026-02-01");

INSERT INTO books (title, form, isbn, summary, detail, author, pages, contents, price, pub_date)
VALUES ("흥부와 놀부들", "종이책", 3, "제비..", "까만 제비..", "김제비", 100, "목차입니다.", 20000, "2026-02-01");

SELECT * FROM BookShop.books LEFT JOIN category ON books.category_id = category.id  WHERE books.id=1;

-- 좋아요 추가
INSERT INTO likes (user_id, liked_book_id) VALUES (1,1);
INSERT INTO likes (user_id, liked_book_id) VALUES (1,2);
INSERT INTO likes (user_id, liked_book_id) VALUES (1,3);
INSERT INTO likes (user_id, liked_book_id) VALUES (3,1);
INSERT INTO likes (user_id, liked_book_id) VALUES (4,4);
INSERT INTO likes (user_id, liked_book_id) VALUES (2,1);
INSERT INTO likes (user_id, liked_book_id) VALUES (2,2);
INSERT INTO likes (user_id, liked_book_id) VALUES (2,3);
INSERT INTO likes (user_id, liked_book_id) VALUES (2,5);
-- 좋아요 삭제
DELETE FROM likes WHERE user_id = 1 AND liked_book_id = 1;

SELECT count(*) FROM likes WHERE liked_book_id=1;

-- 장바구니 담기
INSERT INTO cartItems (book_id, quantity, user_id) 
VALUES (1, 1, 1);

-- 장바구니 조회
SELECT cartItems.id, book_id, title, summary, quantity, price FROM cartItems LEFT JOIN books ON cartItems.book_id = books.id WHERE book_id = 1

-- 장바구니 삭제
DELETE FROM cartItems WHERE id = ?;

-- 장바구니에서 선택한(장바구니 도서 id) 아이템 목록 조회
SELECT * FROM BookShop.cartItems
WHERE user_id = 1
AND id IN (2,3);

-- 주문하기
-- 배송 정보 입력
INSERT INTO delivery (address, receiver, contact) VALUES ("서울시 중구", "이예은", "010-1234-5678");

-- 주문 정보 입력
INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id);
VALUES ("어린왕자", 3, 60000, 1, delivery_id);

-- 주문 상세 정보 입력
INSERT INTO orderedBook (order_id, book_id, quantity) 
VALUES (1,1,1);

INSERT INTO orderedBook (order_id, book_id, quantity) 
VALUES (1,3,2);

--
SELECT max(id) FROM BookShop.orderedBook;

SELECT last_insert_id();


-- 결제된 도서 장바구니 삭제
DELETE FROM cartItems WHERE id IN (1,2,3);


-- 주문 목록 조회
SELECT orders.id, book_title, total_quantity, total_price, created_at, address, receiver, contact 
FROM orders
LEFT JOIN delivery ON orders.delivery_id = delivery.id 

-- 주문 상세 조회
SELECT book_id, title, author, price, quantity FROM BookShop.orderedBook
LEFT JOIN books ON orderedBook.book_id = books.id
WHERE order_id = ?