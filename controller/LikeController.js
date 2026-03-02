const conn = require('../mariadb'); // db 모듈
const {StatusCodes} = require('http-status-codes')

const addLike = (req,res)=>{
    // 좋아요 추가
    const {id} = req.params;
    const {user_id} = req.body;

    sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?,?)';
    let values = [user_id, id];
    conn.query(sql,values,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            res.status(StatusCodes.OK).json(results);
        })
};

const removeLike = (req,res)=>{
    // 좋아요 취소
    const {id} = req.params;
    const {user_id} = req.body;

    sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
    let values = [user_id, id];
    conn.query(sql,values,
        (err, results)=>{
            if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
            }

            res.status(StatusCodes.OK).json(results);
        })
};


module.exports = {
    addLike,
    removeLike 
}