
const mongoose = require('mongoose');
const SectionArticleSchema = new mongoose.Schema({
  sectionCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SectionCard',
    required: true,
  },
  titleArticle: {
    type: String,
    required: true,
  },
  bodyArticle: {
    type: String,
    required: true,
  },
  imgArticle: {
    url: { type: String, required: false },
    description: { type: String, required: false },
  },
  videoArticles: [
    {
      url: { type: String, required: false },
      description: { type: String, required: false },
    }
  ],
  pdfArticles: [
    {
      url: { type: String, required: false },
      description: { type: String, required: false },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SectionArticle', SectionArticleSchema);
