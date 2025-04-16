const { role } = require('../../../../config/config');


module.exports.authorizeSeeker=async(req,res,next)=>{
    if(req.userRole==role.jobSeeker){
        next()
    }
    else{
        let err=new Error();
        err.msg="unauthorized"
        err.status=401;
        throw err;
    }

}