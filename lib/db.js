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

  try {
    var sequelize = this.sequelize = new Sequelize(options.name,
                                                   options.username,
                                                   options.password,
                                                   options);
    sequelize.authenticate().complete(function(err) {
      if(err) {
        return callback(err);
      }

      var Data = self.Data = sequelize.define('Data', {
        key: {
          type: Sequelize.STRING,
          primaryKey: true
        },
        value: Sequelize.BLOB
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
  this.Data.find(key).complete(function(err, record) {
    if(err) {
      return callback(err);
    }

    callback(null, record ? record.value : null);
  });
};

DB.prototype.createOrUpdate = function(key, value, callback) {
  this.Data.create({
    key: key,
    value: value
  }).complete(callback);
};

DB.prototype.remove = function(key, callback) {
  this.Data.find(key).complete(function(err, record) {
    if(err) {
      return callback(err);
    }
    record.destroy().complete(callback);
  });
};

DB.prototype.clearAll = function(keyPrefix, callback) {
  this.Data.destroy({where: ['key like ?', keyPrefix + '%']},
                    {truncate: true}).complete(callback);
};

DB.MYSQL = 'mysql';
DB.SQLITE = 'sqlite',
DB.POSTGRES = 'postgres';
DB.MARIADB = 'mariadb';

module.exports = DB;
