const { NotFoundError, ValidationError } = require('../errors/customErrors');
const StaticPage = require('../models/StaticPage');
const catchAsync = require('../utils/catchAsync'); 

// Fetch page content (e.g., GET /pages/about)
exports.getPage = async (req, res) => {
  const page = await StaticPage.findOne({
    where: { name: req.params.pageName },
    logging: console.log,  // Log the SQL query
    transaction: null
  });
  if (!page) throw new NotFoundError(`Page '${req.params.pageName}'`);
  res.json(page);
};

// Update page content (Admin-only, e.g., PATCH /pages/about)
exports.updatePage = async (req, res) => {
  const [updated] = await StaticPage.update(
    { content: req.body.content },
    { 
      where: { name: req.params.pageName.toLowerCase() },
      returning: true
    }
  );
  if (updated === 0) throw new NotFoundError(`Page '${req.params.pageName}'`);
  const page = await StaticPage.findOne({ where: { name: req.params.pageName } });
  res.json(page);
};