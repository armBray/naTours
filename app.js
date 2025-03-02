//CORE MODULES
//DEV MODULES
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
//3RD LIBRARIES
const express = require('express');
const morgan = require('morgan');
const app = express();

//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

//ROUTES
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
