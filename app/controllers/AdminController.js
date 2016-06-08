var userLogin = function (req, res, next) {
    var userToken = (JSON.parse(JSON.stringify(req.body))).data;

    if (process.env.BM_ADMIN_TOKEN === userToken) {
        res.status(201).json({isAuthenticated: true});
    } else {
        res.status(403).json({isAuthenticated: false});
    }
};

module.exports = function () {
    return {
        userLogin: userLogin
    }
};
