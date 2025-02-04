const {query} = require('express-validator')

exports.page = query("page", "page error")