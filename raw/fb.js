import Firebird from 'node-firebird'
// import {checkBoberTimes} from './bobers.js'

var options = {}

options.host = '10.37.0.20'
options.port = 3050
options.database = 'C:/ACS/Base/ACS.fdb'
options.user = 'SYSDBA'
options.password = 'masterkey'
options.lowercase_keys = false // set to true to lowercase keys


export const findInBaseByKey = async (key, callback) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            db.detach()
            return callback('error')
        }

        db.query("SELECT * FROM PERSONNEL WHERE KLUCH='" + key + "'", function(err, result) {
            if (err){
                db.detach()
                return callback('error')
            }
            db.detach()
            return callback(result[0])
        })
    })
}


export const findInBaseByFIO = async (bobers, fio_list, callback) => {
    await Firebird.attach(options, async function(err, db) {
        if (err){
            db.detach()
            return callback('error')
        }
        let sql = fio_list.join("' OR FIO ='")

        await db.query("SELECT FIO, LASTDATE FROM PERSONNEL WHERE FIO='" + sql + "'", async function(err, result) {
            if (err){
                db.detach()
                return callback('error')
            }
            db.detach()
            if (result.length == 0)
                return callback(false)
            for (let j in bobers){
                bobers[j].last_date = false
                for (let k in result){
                    if (result[k].FIO == bobers[j].fio){
                        bobers[j].last_date = result[k].LASTDATE?result[k].LASTDATE:''
                        // let bober_times = await checkBoberTimes(bobers[j].fio, result[k].LASTDATE)
                        // bobers[j].time_in = bober_times[0]
                        // bobers[j].time_out = bober_times[1]
                        break
                    }
                }
            }
            return callback(bobers)
        })
    })
}




export const genKey = async (id) => {
    let binary = id.toString(2)

    let ones_count = binary.split('1').length - 1
    if (ones_count % 2 == 0){
        binary += '1'
    }
    else{
        binary += '0'
    }

    let hex = parseInt(binary, 2).toString(16).padStart(12, '0').toUpperCase()
    return hex
    
}


export const findUUID = async (uuid, callback) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            return callback('error')
        }

        db.query(`SELECT PERS_ID FROM PERSONNEL WHERE GPWP='${uuid}'`, function(err, result) {
            if (err){
                db.detach()
                return callback('error')
            }
            db.detach()
            return callback(result[0])
        })
    })
}


export const findAllStudents = async (callback) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            return callback('error')
        }

        db.query(`SELECT FIO, VIHOD, VHOD, GPWP FROM PERSONNEL WHERE STUDENT_STATUS LIKE '%Студент%' AND GPWP  <> ''`, function(err, result) {
            if (err){
                db.detach()
                return callback('error')
            }
            db.detach()
            return callback(result)
        })
    })
}

export const updateKey = async (uuid, key, callback) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            return callback('error')
        }

        db.query(`UPDATE PERSONNEL SET KLUCH2='${key}' WHERE GPWP='${uuid}'`, function(err, result) {
            if (err){
                db.detach()
                return callback('error')
            }
            db.detach()
            return callback(true)
            // return callback('result')
        })
    })
}

export const updateRoute = (key, routes) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            db.detach()
            return 'error'    
        }

        db.query("UPDATE PERSONNEL SET MARSRUT = '"+ routes +"' WHERE KLUCH='" + key + "'", async function(err, result) {
            if (err){
                db.detach()
                return 'error'    
            }
            db.detach()
            console.log(result)
            return result[0]
        })
    })
}

export const addPoolBase = (data) => {
    Firebird.attach(options, function(err, db) {
        if (err){
            db.detach()
            return 'error'    
        }

        db.query("INSERT INTO PERSONNEL (KLUCH, KEYPAD, TABELNOMER, FIO, PGRUPPA, DEPARTMENT, DOLJNOST, FIRMA, NTIMEZONE, TIMEZONE, MARSRUT, DATE1, DATE2, MARSTIMEZONES, WDBEGIN2, WDEND2, IMPORT) VALUES ('" + data.key + "', '0000', '16323259632', '" + data.fio + "', 'Бассейн', '', 'Бассейн', 'ДГТУ', '01', 'Всегда', '1,99', '18.02.2023', '18.04.2027', '', '', '', '')", async function(err, result) {
            if (err){
                db.detach()
                return 'error'    
            }
            db.detach()
            console.log(result)
            return result[0]
        })
    })
}
// function sleep(ms) {
//     return new Promise((resolve) => {
//       setTimeout(resolve, ms);
//     });
//   }

// function blobToFile(theBlob, fileName){
//     //A Blob() is almost a File() - it's just missing the two properties below which we will add
//     theBlob.lastModifiedDate = new Date()
//     theBlob.name = fileName
//     return theBlob
// }
