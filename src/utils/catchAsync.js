module.exports = (fn) => {
  return (req, res, next) => {
  // Wraps async functions and catches errors + forwards to errorHandler
  fn(req, res, next).catch(next);
};};