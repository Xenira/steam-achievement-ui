--up
CREATE TABLE User (
  steamID64 INTEGER PRIMARY KEY,
  steamID : TEXT,
  onlineState : TEXT,
  stateMessage : TEXT,
  privacyState : TEXT,
  visibilityState : INTEGER,
  avatarIcon : TEXT,
  avatarMedium : TEXT,
  avatarFull : TEXT,
  vacBanned : INTEGER,
  tradeBanState : TEXT,
  isLimitedAccount : INTEGER,
  customURL : TEXT,
  memberSince : INTEGER,
  hoursPlayed2Wk : REAL,
  headline : TEXT,
  location : TEXT,
  realname : TEXT,
  summary : TEXT,
  mostPlayedGames : IMostPlayedGame [],
  groups : IGroup [],
  steamRating : TEXT,
  fetched : INTEGER
);
CREATE TABLE MostPlayedGame (steamID64 INTEGER) CREATE TABLE Game (
  appId INTEGER PRIMARY KEY name : TEXT,
  logo : TEXT,
  storeLink : TEXT,
  hoursLast2Weeks ? : REAL,
  hoursOnRecord ? : REAL,
  statsLink ? : TEXT,
  globalStatsLink ? : TEXT,
);
CREATE TABLE Achievement (
  gameId INTEGER,
  closed : INTEGER,
  apiname : TEXT,
  description : TEXT,
  iconClosed TEXT,
  iconOpen : TEXT,
  name : TEXT,
  unlockTimestamp ? : INTEGER,
  globalCompletion ? : REAL,
  FOREIGN KEY(gameId) REFERENCES Game(id) ON DELETE CASCADE,
);
--down
DROP TABLE Profile;
DROP TABLE Game;