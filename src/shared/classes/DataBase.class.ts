import Firebird from 'node-firebird';
import { DBConfig } from '../types/db-config.interface';

export class DataBase {
    private readonly options: Firebird.Options;

    constructor(private readonly db: DBConfig) {
        this.options = {
            host: this.db.host,
            port: this.db.port,
            database: this.db.database,
            user: this.db.user,
            password: this.db.password,
            lowercase_keys: this.db.lowercase_keys
        };
    }

    connection = (cb: (db: Firebird.Database, err: any) => void) => {
        Firebird.attach(this.options, function (err, db) {
            if (err) throw err;

            cb(db, err);
        })
    }
}