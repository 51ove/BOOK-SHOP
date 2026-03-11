const conn = require('../mariadb'); // db 모듈
const {StatusCodes} = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

// 장바구니 아이템 담기
const addToCart = (req,res)=>{
    let {quantity, book_id} = req.body;

    let authorization = ensureAuthorization(req)

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else {
        let sql = `INSERT INTO cartItems (book_id, quantity, user_id) 
        VALUES (?, ?, ?)`;
        let values = [book_id, quantity, authorization.id];

        conn.query(sql,values,
            (err, results)=>{
                if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
                }

                res.status(StatusCodes.OK).json(results);
            })
    }
}

// 장바구니 아이템 목록 조회 / 선택된 아이템 조회
const getCartItems = (req,res)=>{

    let authorization = ensureAuthorization(req);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else { // error 없을시 코드 실행
        let selected = req.body?.selected;
        // body 있으면 selected 꺼냄, 없으면 undefined

        let values = [authorization.id];

        let sql = `SELECT cartItems.id, book_id, title, summary, quantity, price FROM cartItems 
        LEFT JOIN books ON cartItems.book_id = books.id WHERE user_id = ?`
        
        if (selected) { // selected 값 있으면 선택한 항목 조회
            sql += ` AND cartItems.id IN (?)`;
            values.push(selected);
        }
        
        conn.query(sql, values,
            (err, results)=>{
                if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
                }

                res.status(StatusCodes.OK).json(results);
            })
    }
}

// 장바구니 아이템 삭제
const removeCartItem = (req,res)=>{
    let authorization = ensureAuthorization(req)

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            "message" : "로그인 세션이 만료되었습니다. 다시 로그인 하세요."
        });
    } else if (authorization instanceof jwt.JsonWebTokenError){
        return res.status(StatusCodes.BAD_REQUEST).json({
            "message" : "잘못된 토큰입니다."
        });
    } else {
    let sql = `DELETE FROM cartItems WHERE id = ?`;
    let cartItemId = req.params.id; // cartItemId

    conn.query(sql,cartItemId,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            res.status(StatusCodes.OK).json(results);
        })
    }
}

module.exports = {
    getCartItems,
    addToCart,
    removeCartItem,
}
