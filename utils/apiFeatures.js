// APIFeature(queryMongo, queryString)
class APIFeature {
  constructor(queryMongo, queryString) {
    this.queryMongo = queryMongo;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((element) => delete queryObj[element]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    this.queryMongo = this.queryMongo.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.queryMongo = this.queryMongo.sort(sortBy);
    } else {
      this.queryMongo = this.queryMongo.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.queryMongo = this.queryMongo.select(fields); // projection
    } else {
      this.queryMongo = this.queryMongo.select('-__v'); // exclude virtual fields from mongoDB query
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;
    this.queryMongo = this.queryMongo.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
