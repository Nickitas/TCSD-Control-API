import * as Firebird from 'node-firebird';
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
        Firebird.attach(this.options, (err, db) => {
        if (err) {
            console.error(`ERROR >>> Firebird connection at [${this.options.host} ${this.options.database}]:`, err);
        }
        console.log(`>>> Firebird connected successfully at [${this.options.host} ${this.options.database}]!`);
        cb(db, null);
    });
    }
}