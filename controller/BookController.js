const conn = require('../mariadb'); // db 모듈
const {StatusCodes} = require('http-status-codes')
const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');

// (카테고리 별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req,res)=>{
    let allBooksRes = {};
    let {category_id, news, limit, currentPage} = req.query;

    // limit : page 당 도서 수.    ex. 3
    // currentPage : 현재 및 페이지 ex. 1, 2, 3 ...
    // offset :                      0, 3, 6, 9 ...
    // limit * (currentPage - 1)
    let offset = limit * (currentPage - 1);

    let sql = `SELECT SQL_CALC_FOUND_ROWS * , 
	(SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes 
    FROM books`;
    // 좋아요 수 포함한 전체 도서 조회
    // 조건(카테고리, 신간여부)에 따라 sql 덧붙여서 사용

    let values = [];

    if(category_id && news) {
        sql += ' WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(),INTERVAL 1 MONTH) AND NOW() ';
        values = [category_id];
    }
    else if(category_id) {
        sql += ' WHERE category_id = ?';
        values = [category_id];
    }
    else if(news) {
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(),INTERVAL 1 MONTH) AND NOW()';
    }
    
    sql += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit), offset);


    conn.query(sql,values,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }
            console.log(results);
            if(results.length)
                allBooksRes.books = results;
            else 
                res.status(StatusCodes.NOT_FOUND).end();
        })
    
    sql = 'SELECT found_rows()';
    conn.query(sql,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }
            let pagination = {};
            pagination.totalCount = results[0]["found_rows()"]; // "found_rows()": 11 가 배열에 쌓여있음
            pagination.currentPage = parseInt(currentPage);

            allBooksRes.pagination = pagination;

            return res.status(StatusCodes.OK).json(allBooksRes);
        })
};

// 개별 도서 조회
const bookDetail = (req,res)=>{
    let authorization = ensureAuthorization(req);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else { 
        // 로그인 상태면 => liked(좋아요 여부) 추가해서
        let book_id = req.params.id;
        let sql = 
        `SELECT *,
            (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes,
            (SELECT EXISTS(SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked
        FROM BookShop.books
        LEFT JOIN category 
        ON books.category_id = category.category_id  
        WHERE books.id=?`;
        let values = [authorization.id, book_id, book_id];

        if (authorization instanceof ReferenceError) { // 로그인 상태 아니면 ReferenceError
            sql = 
            `SELECT *,
                (SELECT count(*) FROM likes WHERE books.id = liked_book_id) AS likes
            FROM BookShop.books
            LEFT JOIN category 
            ON books.category_id = category.category_id  
            WHERE books.id=?`;
            values = [book_id];
            // 로그인 상태가 아니면 => liked(좋아요 여부) 빼고 보내줌
        };

        conn.query(sql,values,(err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if(results[0])
                res.status(StatusCodes.OK).json(results[0]);
            else 
                res.status(StatusCodes.NOT_FOUND).end();
        })
    }
}


module.exports = {
    allBooks,
    bookDetail
};