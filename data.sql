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

