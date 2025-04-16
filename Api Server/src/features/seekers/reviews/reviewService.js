const SeekerReview = require('./reviewModel');

exports.getSeekerReviews = (seekerId, filters) => {
    return SeekerReview.getSeekerReviews(seekerId, filters);
};