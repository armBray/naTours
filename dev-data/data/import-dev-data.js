const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((connection) => {
    //console.log(connection.connections);
    console.log('DB connection successful!');
  });

// Seeding data into DB
// node dev-data/data/importData.js --import
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported successfully!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete all data from DB
// node dev-data/data/import-dev-data.js --delete
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted successfully!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// node dev-data/data/import-dev-data.js --import
