import * as mysql from 'mysql';

export async function executeSql(sql: string, values?: any): Promise<any[]> {
    const dbConnection = mysql.createConnection({
        host: process.env.SQL_SERVER,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME
    })
    return new Promise((resolve, reject) => { 
        dbConnection.connect((err, args) => {
            if (err) return reject(err)
            dbConnection.query(sql, values, (err, rows,fields) => {
                if (err) return reject(err)
                dbConnection.end(() => {
                    resolve(rows)
                })
            })
        })
    })
}