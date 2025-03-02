const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

//FILE-DONE WITH MONGOOSE
//router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  //FILE-DONE WITH MONGOOSE
  //.post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
