import { Injectable } from '@angular/core';
import * as sqlite from 'sqlite';
import SQL from 'sql-template-strings';
import { IProfile } from './profile.service';

const dbPromise = Promise.resolve()
  .then(() => sqlite.open('./database.sqlite'))
  .then(db => db.migrate({}));

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor() { }

  async getProfiles(): IProfile[] {

  }

  async getProfile(userId: string) {
    const db = await dbPromise;
    const [post, categories] = await Promise.all([
      db.get(SQL`SELECT * FROM Post WHERE id = ${req.params.id}`),
      db.all('SELECT * FROM Category')
    ]);
  }
}
