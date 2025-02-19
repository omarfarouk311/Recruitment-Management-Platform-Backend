const { role } = require('../../../../config/config')


const seekerSkillAuthorization = async (req, res, next) => {
    const { userRole } = req;
    if(userRole == role.jobSeeker){
       return next(); 
    }
    const error = new Error('not authotized to access this data')
    error.msg = 'Authorization error';
    error.status = 403;
    next(error);
}

module.exports = {
    seekerSkillAuthorization 
}