const mysql = require('mysql2/promise');
const {StatusCodes} = require('http-status-codes')
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

// 주문하기
const order = async (req,res)=>{
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '1234',
        port: 3307,
        database: 'BookShop',
        dateStrings : true
        });
    
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
        let {items, delivery, totalQuantity, totalPrice, firstBookTitle} = req.body;
        
        let delivery_id;
        let order_id;

        // delivery insert
        let sql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;

        let values = [delivery.address, delivery.receiver, delivery.contact];

        let [results] = await conn.execute(sql,values)
        delivery_id = results.insertId

        // orders insert
        sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
                VALUES (?, ?, ?, ?, ?)`;
        values = [firstBookTitle, totalQuantity, totalPrice, authorization.id, delivery_id];

        [results] = await conn.execute(sql,values);
        order_id = results.insertId;


        // items(장바구니 선택된 항목인 cartItemId 배열)를 가지고, 
        // 장바구니에서 book_id, quantity 조회
        sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`
        let [orderItems, fields] = await conn.query(sql, [items]);

        // orderedBook insert
        sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`
        
        // items.. 배열 : 요소들을 하나씩 꺼내서 (foreach문 돌려서) >
        values = [];
        orderItems.forEach((item)=>{
            values.push([order_id, item.book_id, item.quantity]); // 2차원 배열로
        });

        [results] = await conn.query(sql,[values]); 

        // 장바구니에서 선택된 항목 제거
        [results] = await deleteCartItems(conn, items); // deleteCartItems이 async 함수이니 promise 반환. await 사용 가능


        return res.status(StatusCodes.OK).json(results);
    }
};

// 장바구니 선택된 항목 제거
const deleteCartItems = async (conn, items) => {
    let sql = `DELETE FROM cartItems WHERE id IN (?)`;

    let result = await conn.query(sql, [items]);
    return result;
}

// 주문 목록 (내역) 조회
const getOrders = async (req,res)=>{
    const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            port: 3307,
            database: 'BookShop',
            dateStrings : true
            });
            
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
        
        let sql =`SELECT orders.id, created_at, address, receiver, contact, 
                book_title, total_quantity, total_price
                FROM orders
                LEFT JOIN delivery ON orders.delivery_id = delivery.id `;

        let [rows, fields] = await conn.query(sql);

        return res.status(StatusCodes.OK).json(rows);
    }
};

// 주문 상세 조회
const getOrderDetail = async (req,res)=>{
    const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            port: 3307,
            database: 'BookShop',
            dateStrings : true
            });
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
        let orderId = req.params.id;
        
        let sql =`SELECT book_id, title, author, price, quantity FROM BookShop.orderedBook
                LEFT JOIN books ON orderedBook.book_id = books.id
                WHERE order_id = ?`;

        let [rows, fields] = await conn.query(sql, orderId);

        return res.status(StatusCodes.OK).json(rows);
    }
};

module.exports = {
    order,
    getOrders,
    getOrderDetail
}