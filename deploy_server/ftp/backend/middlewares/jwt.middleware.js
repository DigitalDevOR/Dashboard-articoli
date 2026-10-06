"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../utils/jwt");
const requestHasValidAccessToken = (req, res, next) => {
    var _a, _b;
    const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
    if (!((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.accessToken)) {
        return res.status(401).json({
            message: "Accesso negato. Token mancante.",
        });
    }
    try {
        const decodedToken = (0, jwt_1.verifyAccessToken)(accessToken);
        req.userDecoded = decodedToken;
        return next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Accesso negato. Token non valido.",
        });
    }
};
exports.default = requestHasValidAccessToken;
