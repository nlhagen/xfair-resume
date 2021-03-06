require('dotenv').load();

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_ENDPOINT);

var Record = require('../models/Record');

function recordToFilename(record) {
  var unsanitizedName = record.year_name + '_' + record.name + '_' + (record.uuid.substr(0,4));
  return unsanitizedName.replace(/[^a-zA-Z0-9]/g,'_') + '.pdf';
}

Record.find({ filled_out: true }).exec(function(err, records) {
  var hash = {};

  if (err)
    throw err;

  for (var i = 0; i < records.length; i += 1) {
    id = records[i].mit_id;
    email = records[i].email;
    createdAt = records[i].createdAt;
    if (hash[id] === undefined
     || hash[id].email !== email
     || hash[id].createdAt < createdAt) {
       var record = records[i];
       hash[id] = {
         email: records.email,
         createdAt: records.createdAt,
         record: record
       };
    }
  }

  var result = [];
  Object.keys(hash).forEach( function(key) {
    var record = hash[key].record;
    console.log([record.major_name[0], record.s3_url, recordToFilename(record)].join(','));
  })

  process.exit();
});
