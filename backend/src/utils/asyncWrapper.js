// Wraps async controller functions to catch errors
// Instead of try/catch in every controller, just wrap with this
// Usage: exports.login = asyncWrapper(async (req, res) => { ... })

const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncWrapper;
