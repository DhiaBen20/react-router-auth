import { type DB, type Tx } from "~/db/client";

export abstract class BaseRepository {
    protected db: DB | Tx;

    constructor(db: DB | Tx) {
        this.db = db;
    }
}
