const { DataTransformError } = require('../types/errors');

class DataTransformer {
  static encode(data) {
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw new DataTransformError(error);
    }
  }

  static decode(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new DataTransformError(error);
    }
  }
}

module.exports = DataTransformer;