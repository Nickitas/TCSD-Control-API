import fastify from "fastify";
import cors from "fastify-cors"
import { addUser, getRules, getUsers, getUser, authUser, editUser, checkAuth, isAuthF, deleteUser } from "./logic/user.js";
import {getRoomsList, getElJournal, getSubunits, getUserKeyList, updateKeyStatus, updateSignalStatus, getDisturbers, addRoom } from "./logic/housekeeper.js";
import {addPermission, deletePermission, getRoomPermissions } from "./logic/permissions.js";
import {getAllBobers, getBober, downloadBobers, downloadBober, downloadAllBobers} from "./logic/bobers.js";
import {downloadArchive } from "./logic/logs.js";
import {generateQr } from "./logic/qrcodes.js";
import {getStudents, getStudentsUpload } from "./logic/monitoring.js";
import { addPool, getPools, editPool, deletePool } from "./logic/pool.js";

const app = fastify()
app.register(cors)


const isAuthMethod = async(res, type, body) => {
    if (type == "getRules") {
        return getRules((response) => {
            res.send(response)
        })
    } else if (type == "addUser") {
        return addUser(body, (response) => {
            res.send(response)
        })
    } else if (type == "getUsers") {
        return getUsers((response) => {
            res.send(response)
        })
    }else if (type == "getUser") {
        return getUser(body, (response) => {
            res.send(response)
        })
    } else if (type == "editUser") {
        return editUser((response) => {
            res.send(response)  
        })
    } else if (type == "getRoomsList") {
        return getRoomsList((response) => {
            res.send(response)
        })
    }else if (type == "getElJournal") {
        return getElJournal(body, (response) => {
            res.send(response)
        })
    }else if (type == "deleteUser") {
        return deleteUser(body, (response) => {
            res.send(response)
        })
    }else if (type == "getDisturbers") {
        return getDisturbers((response) => {
            res.send(response)
        })
    }else if (type == "getUserKeyList") {
        return getUserKeyList(body, (response) => {
            res.send(response)
        })
    }else if (type == "updateKeyStatus") {
        return updateKeyStatus(body, (response) => {
            res.send(response)
        })
    }else if (type == "updateSignalStatus") {
        return updateSignalStatus(body, (response) => {
            res.send(response)
        })
    }else if (type == "getSubunits") {
        return getSubunits((response) => {
            res.send(response)
        })
    }else if (type == "addPermission") {
        return addPermission(body, (response) => {
            res.send(response)
        })
    }else if (type == "deletePermission") {
        return deletePermission(body, (response) => {
            res.send(response)
        })
    }else if (type == "getRoomPermissions") {
        return getRoomPermissions(body, (response) => {
            res.send(response)
        })
    }else if (type == "addRoom") {
        return addRoom(body, (response) => {
            res.send(response)
        })
    }else if (type == "getAllBobers") {
        return getAllBobers((response) => {
            res.send(response)
        })
    }else if (type == "getBober") {
        return getBober(body, (response) => {
            res.send(response)
        })
    }
}

const notIsAuthMethod = async(res, type, body, ip) => {
    if (type == "authUser") {
        return authUser(body, ip, (response) => {
            res.send(response)
        })
    }
}


const request = async(res, type, body, ip) => {
    const isAuth = await isAuthF(body.token)
    // console.log(type, body, isAuth)
    if (type == "checkAuth") {
        return checkAuth(body, (response) => {
            res.send(response)
        })
    }
    // console.log(2, type, body, isAuth)

    if (isAuth) {
        isAuthMethod(res, type, body)
    } else {
        notIsAuthMethod(res, type, body, ip)
    }

}

app.post('/api/pool', async (req, res) => {
    await addPool(req, res)
}) 

app.get('/api/pool', async (req, res) => {
    await getPools(req, res)
}) 

app.post('/api/pool/edit', async (req, res) => {
    await editPool(req, res)
}) 

app.post('/api/pool/delete', async (req, res) => {
    await deletePool(req, res)
}) 

app.post('/api/monitoring/students_upload/:date', async (req, res) => {
    await getStudentsUpload(req, (response) => {
        res.send(response)
    })
}) 

app.post('/api/monitoring/students', async (req, res) => {
    await getStudents(req, (response) => {
        res.send(response)
    })
}) 

app.get('/api/qrcodes/:uid', async (req, res) => {
    await generateQr(req, res)
}) 

app.get('/api/download_logs/:date_from-:date_to', async (req, res) => {
    await downloadArchive(req, res)
}) 

app.get('/api/download_bobers', async (req, res) => {
    await downloadBobers(e =>{
        res.type('text/plain').send(e)
    })
}) 

app.get('/api/download_all_bobers', async (req, res) => {
    await downloadAllBobers(e =>{
        res.type('text/plain').send(e)
    })
}) 

app.get('/api/download_bober/:id/:date_from/:date_to/archive', async (req, res) => {
    let id = req.params.id
    let date_from = req.params.date_from
    let date_to = req.params.date_to
    await downloadBober({id, date_from, date_to}, e =>{
        res.type('text/plain').send(e)
    })
}) 


app.post("/api", {
    schema: {
        body: {
            type: "object",
            required: ["type"],
            propertion: {
                type: {
                    type: "string",
                    minLength: 3,
                    maxLength: 20,
                    default: "error"
                },
                body: {
                    type: "object"
                }
            },
        }
    }
}, (req, res) => {
    const body = req.body
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress
    if (body.type == "error") {
        return res.send({
            state: 0
        })
    }
    return request(res, body.type, body.body, ip)
})



app.listen(3000).then(e => {
    console.log(e)
})

