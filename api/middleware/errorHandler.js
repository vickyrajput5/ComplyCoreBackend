const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode == 200 ? 500 : res.statusCode;
  res.statusCode = statusCode;
  return res.status(500).send({
    status: "failed",
    message: "something went wrong, " + error.message,
  });
};
module.exports = errorHandler;
