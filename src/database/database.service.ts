import Firebird from 'node-firebird';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { DataBase } from 'src/shared/classes/DataBase.class';

@Injectable()
export class DatabaseService {

    constructor(private readonly configService: ConfigService) { }

    async withConnection<T>(callback: (db: Firebird.Database) => Promise<T>): Promise<T[]> {
        const dbMap = this.configService.getDbMap();
        const results: T[] = [];

        for (const dbConfig of dbMap) {
            const db = new DataBase(dbConfig);
            try {
                const result = await new Promise<T>((resolve, reject) => {
                    db.connection((connection, err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        callback(connection)
                            .then(resolve)
                            .catch(reject)
                            .finally(() => {
                                connection.detach();
                            });
                    });
                });
                results.push(result);
            } catch (error) {
                console.error(`Error with database ${dbConfig.database}:`, error);
                results.push(null as unknown as T);
            }
        }

        return results;
    }

}
