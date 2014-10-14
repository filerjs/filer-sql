// TODO: consider moving to https://github.com/grncdr/node-any-db
// and https://github.com/brianc/node-sql, or just direct driver use.

var Sequelize = require('sequelize');

function DB(options, callback) {
  var self = this;

  switch(options.type) {
    case DB.MYSQL:
      options.dialect = DB.MYSQL;
      options.port = options.port || 3306;
      break;
    case DB.POSTGRES:
      options.dialect = DB.POSTGRES;
      options.port = options.port || 5432;
      break;
    case DB.MARIADB:
      options.dialect = DB.MARIADB;
      options.port = options.port || 3306;
      break;
    case DB.SQLITE:
    /* falls through*/
    default:
      options.dialect = DB.SQLITE;
      options.storage = options.storage || ':memory:';
      break;
  }
  delete options.type;

  options.logging = options.logging || false;

  // MakeDrive username to segment filesystems
  this.user = options.user;

  try {
    var sequelize;

    // Allow db connection URL or passing info direclty on options.
    if(options.url) {
      sequelize = new Sequelize(options.url, options);
    } else {
      options.db = options.db || {};
      options.db.name = options.db.name || 'filer';
      sequelize = new Sequelize(options.db.name,
                                options.db.username,
                                options.db.password,
                                options);
    }

    this.sequelize = sequelize;

    sequelize.authenticate().complete(function(err) {
      if(err) {
        return callback(err);
      }

      var Data = self.Data = sequelize.define('filer_data', {
        // Unique username - login.webmaker.org uses max 20 character usernames.
        user: {
          type: Sequelize.STRING(20),
          primaryKey: true
        },

        // Filer Node ID's are of the form: '00000000-0000-0000-0000-000000000000'
        key: {
          type: Sequelize.STRING(36),
          primaryKey: true
        },

        // Data Node as Buffer (JSON is stored as Object->JSON->Buffer(utf8))
        data: Sequelize.BLOB
      },
      {
        // We don't want updatedAt, createdAt
        timestamps: false
      });

      Data.sync().complete(callback);
    });
  } catch(err) {
    return callback(err);
  }
}

DB.prototype.find = function(key, callback) {
  var user = this.user;
  this.Data.find({
    where: {
      user: user,
      key: key
    }
  }).complete(function(err, record) {
    if(err) {
      return callback(err);
    }

    callback(null, record ? record.data : null);
  });
};

DB.prototype.createOrUpdate = function(key, data, callback) {
  var user = this.user;
  var Data = this.Data;

  Data.find({
    where: {
      user: user,
      key: key
    }
  }).complete(function(err, record) {
    if(err) {
      return callback(err);
    }

    if(!record) {
      Data.create({
        user: user,
        key: key,
        data: data
      }).complete(callback);
    } else {
      record.updateAttributes({data: data}).complete(callback);
    }
  });
};

DB.prototype.remove = function(key, callback) {
  var user = this.user;
  this.Data.find({
    where: {
      user: user,
      key: key
    }
  }).complete(function(err, record) {
    if(err) {
      return callback(err);
    }
    record.destroy().complete(callback);
  });
};

DB.prototype.clearAll = function(callback) {
  var user = this.user;
  this.Data.destroy({user: user}, {truncate: true}).complete(callback);
};

DB.MYSQL = 'mysql';
DB.SQLITE = 'sqlite',
DB.POSTGRES = 'postgres';
DB.MARIADB = 'mariadb';

module.exports = DB;
