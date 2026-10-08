/*
    REQUIRE LOGIN

    Blocks the request unless the user is logged in.
    Sets req.currentUserId (the logged-in user's _id)
    for the route to use.
*/

function requireAuth(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            message: "You must be logged in"
        });

    }

    req.currentUserId = req.session.userId;

    next();

}

module.exports = requireAuth;
