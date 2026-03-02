const conn = require('../mariadb'); // db 모듈
const {StatusCodes} = require('http-status-codes');

// 장바구니 아이템 담기
const addToCart = (req,res)=>{
    let {user_id, quantity, book_id} = req.body;

    sql = `INSERT INTO cartItems (book_id, quantity, user_id) 
    VALUES (?, ?, ?)`;
    let values = [book_id, quantity, user_id];

    conn.query(sql,values,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            res.status(StatusCodes.OK).json(results);
        })
}

// 장바구니 아이템 목록 조회 / 선택된 아이템 조회
const getCartItems = (req,res)=>{
    
    let {user_id, selected} = req.body;
    let values = [user_id];

    sql = `SELECT cartItems.id, book_id, title, summary, quantity, price FROM cartItems 
    LEFT JOIN books ON cartItems.book_id = books.id WHERE user_id = ?`
    
    if (selected.length) {
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

// 장바구니 아이템 삭제
const removeCartItem = (req,res)=>{
    sql = `DELETE FROM cartItems WHERE id = ?`;
    let {id} = req.params; // cartItemId

    conn.query(sql,id,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            res.status(StatusCodes.OK).json(results);
        })
}

module.exports = {
    getCartItems,
    addToCart,
    removeCartItem,
}
