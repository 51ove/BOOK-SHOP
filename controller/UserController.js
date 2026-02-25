const conn = require('../mariadb'); // db 모듈
const {StatusCodes} = require('http-status-codes')
const jwt =require('jsonwebtoken'); //jwt 모듈
const crypto = require('crypto') // crypto 모듈 : 암호화
const dotenv = require('dotenv') //dotenv 모듈
dotenv.config();

const join = (req,res)=>{
        const {email, password} = req.body;
        
        let sql = 'INSERT INTO users (email, password, salt) VALUES (?, ?, ?)';

        // 회원가입 시 비밀번호를 암호화해서 암호화된 비밀번호와, salt 값을 같이 저장
        const salt = crypto.randomBytes(10).toString('base64');
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

        let values = [email, hashPassword, salt];

        conn.query(sql, values,
            (err, results)=>{
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }

                return res.status(StatusCodes.CREATED).json(results);
            }
        )
    
};

const login = (req,res)=>{
        const {email, password} = req.body;
        let sql = 'SELECT * FROM users WHERE email = ?'

        conn.query(sql, email,
            (err, results)=>{
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
                
                let loginUser = results[0];

                // salt값 꺼내서 날 것으로 들어온 비밀번호 암호화 해보고
                const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');
                // => db에 저장된 비밀번호랑 비교
                

                if (loginUser && loginUser.password == hashPassword) {
                    // token 발급
                    const token = jwt.sign({
                        email : loginUser.email,
                    }, process.env.PRIVATE_KEY,{
                        expiresIn : '30m',
                        issuer : "yeeun"
                    });

                    // token cookie에 담기
                    res.cookie("token", token, {
                        httpOnly : true
                    });
                    console.log(token);

                    res.status(StatusCodes.OK).json({ //200
                        message : `${loginUser.email}님 로그인 되었습니다`
                    })
                } else {
                    res.status(StatusCodes.UNAUTHORIZED).json({ // 401 미인증
                        message : "이메일 또는 비밀번호가 틀렸습니다."
                    })
                }
            }
        )
};

const passwordResetRequest = (req,res)=>{
        const {email} = req.body;
        let sql = 'SELECT * FROM users WHERE email = ?';

        conn.query(sql, email,
            (err, results)=>{
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                };
                
                // email로 유저가 있는지 찾기
                const user = results[0];
                if (user) {
                    return res.status(StatusCodes.OK).json({
                        email : email,
                    });
                } else {
                    return res.status(StatusCodes.UNAUTHORIZED).end();
                };
            }
        );
};

const passwordReset = (req,res)=>{
        const {password, email} = req.body;
        let sql = 'UPDATE users SET password = ?, salt = ? WHERE email = ?';

        // 암호화된 비밀번호와 (새로운)salt 값을 같이 DB에 저장
        const salt = crypto.randomBytes(10).toString('base64');
        const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
        
        let values = [hashPassword, salt, email];
        
        conn.query(sql, values,
            (err,results)=>{
                if (err) {
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }

                if (results.affectedRows == 0) {
                    return res.status(StatusCodes.BAD_REQUEST).end();
                } else {
                    return res.status(StatusCodes.OK).json(results);
                }
                
            })
};

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
};