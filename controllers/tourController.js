//const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeature = require('./../utils/apiFeatures');

//CACHE DATA
//FILE-DONE WITH MONGOOSE
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

//FUNCTIONS
//FILE-DONE WITH MONGOOSE
// exports.checkID = (req, res, next, value) => {
//   console.log(`Tour ID: ${value} being checked...`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Tour not found',
//     });
//   }
//   next();
// };
//FILE-DONE WITH MONGOOSE
// exports.checkBody = (req, res) => {
//   if (!req.body.name || !req.body.price || !req.body.duration) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name, price and duration - required fields',
//     });
//     next();
//   }
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//FILE-DONE WITH MONGOOSE
// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// };
exports.getAllTours = async (req, res) => {
  try {
    //SIMPLE EXAMPLES TO BUILD THE MONGODB QUERY
    // EX1
    // const query = Tour.find(
    //   {
    //     duration: { $gte: 5 },
    //     difficulty: { $ne: 'easy' },
    //   }
    // );
    // EX2
    // const query = Tour.find()
    //   .where('difficulty')
    //   .equalTo('easy')
    //   .where('price')
    //   .lte(500);

    // BUILD QUERY-DONE WITH API CLASS
    // // A1) Filtering
    // const queryObj = { ...req.query };
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((element) => delete queryObj[element]);

    // // A2) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    // let queryMongo = Tour.find(JSON.parse(queryStr));

    // // B) Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   // query = query.sort('-price ratingsAverage');
    //   queryMongo = queryMongo.sort(sortBy);
    // } else {
    //   queryMongo = queryMongo.sort('-createdAt');
    // }

    // // C) Limiting results
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   //query = query.select('name duration price'); // projection
    //   queryMongo = queryMongo.select(fields); // projection
    // } else {
    //   queryMongo = queryMongo.select('-__v'); // exclude virtual fields from mongoDB query
    // }

    // // D) Pagination
    // //page=2&limit=10
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // queryMongo = queryMongo.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    //BUILD QUERY (before done from A1 to D)
    const features = new APIFeature(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //EXECUTE QUERY (with await)
    // const tours = await queryMongo;
    const tours = await features.queryMongo;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

//FILE-DONE WITH MONGOOSE
// exports.getTour = (req, res) => {
//   const id = req.params.id * 1; // convert string to number
//   const tour = tours.find((el) => el.id === id);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Tour not found',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found',
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 3 } } },
      {
        $group: {
          // _id: null,
          // _id: '$difficulty',
          // _id: '$ratingsAverage',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 6,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

//FILE-DONE WITH MONGOOSE
// exports.createTour = (req, res) => {
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

exports.createTour = async (req, res) => {
  try {
    //useful for Model.prototype.
    // const newTour = new Tour(req.body);
    // newTour.save();

    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data',
    });
  }
};

//FILE-DONE WITH MONGOOSE
// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: '<Tour updated here...>',
//   });
// };

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Tour not found',
    });
  }
};

//FILE-DONE WITH MONGOOSE
// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
