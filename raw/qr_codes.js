import { findUUID, updateKey, genKey } from './fb.js'

const scheduledTimeouts = {};

export const generateQr = async (req, res) => {
    const uid = req.params.uid;

    findUUID(uid, async (user) => {
        if (!user || user == 'error') {
            return res.code(400).send({
                state: 0,
                message: 'user not found'
            });
        }

        let pers_id = user['PERS_ID'];

        // pers_id = Math.floor(pers_id / 1000);
        pers_id = Math.floor(Math.random() * (1000 - 100 + 1)) + 100

        genKey(pers_id).then(new_key => {
            updateKey(uid, new_key, async (update_res) => {
                if (pers_id && update_res) {
                    if (scheduledTimeouts[uid]) {
                        clearTimeout(scheduledTimeouts[uid]);
                    }

                    scheduledTimeouts[uid] = setTimeout(async () => {
                        await updateKey(uid, '', () => {});
                        delete scheduledTimeouts[uid];
                    }, 1 * 60 * 1000);

                    res.send({
                        state: 1,
                        key: pers_id
                    });
                } else {
                    res.send({
                        state: 0,
                        message: 'error'
                    });
                }
            });
        });
    });
};