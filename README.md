filer-sql
=========

Support for MySQL, MariaDB, SQLite or PostgreSQL Filer providers.

### Usage

The `SQLProvider` can be used with Filer on node.js (i.e., this won't work in
browser) like so:

```js
var provider = new SQLProvider({
  // The db type to use, see below for other options
  type: SQLProvider.MYSQL,

  // If you want SQL debug logging, pass a logging function
  //logging: console.log,

  // A unique string to identify this user's filesystem (e.g., username)
  user: 'something-unique',

  // Database options
  db: {
    // Name of Database to use, defaults to 'filer'
    name: name,
    // DB authentication info, if necessary
    username: username,
    password: password
  }
});

var fs = new Filer.FileSystem({provider: provider});
```

### Database Types

The `type` of database can be one of:

* SQLProvider.MYSQL
* SQLProvider.SQLITE
* SQLProvider.POSTGRES
* SQLProvider.MARIADB

NOTE: some database types require you to pre-create your database. The default
database name is `filer` unless you specify something else.

### Database Options

If you want to pass extra options to `Sequelize`, add them to the options object.
See the list of [valid options](http://sequelizejs.com/docs/1.7.8/usage#options).

### Database Schema

The database will have a single table, named `filer_data` with the following columns:

|Name|Type                  |Details                                                           |
-----|----------------------|------------------------------------------------------------------|
|user|STRING(20) Primary Key|Unique username for this user's filesystem                        |
|key |STRING(36) Primary Key|Filer Node ID's of the form '00000000-0000-0000-0000-000000000000'|
|data|BLOB                  |binary data with JSON stored as Object->JSON->Buffer(utf8))       |
