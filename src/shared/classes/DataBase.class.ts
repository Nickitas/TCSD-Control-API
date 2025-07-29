import Firebird from 'node-firebird';
import { ConfigService } from 'src/config/config.service';

export class DataBase {
    private readonly options: Firebird.Options;

    constructor(private readonly config: ConfigService) {
        this.options = {
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.user,
            password: this.config.password,
            lowercase_keys: this.config.lowercase_keys,
        }
    }

    connection = (cb: (db: Firebird.Database, err: any) => void) => {
        Firebird.attach(this.options, function (err, db) {
            if (err) throw err;

            cb(db, err);
        })
    }
}