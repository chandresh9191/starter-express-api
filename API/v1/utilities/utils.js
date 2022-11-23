function sendResponse(res, statusCode, msg, data) {
    return res./*status(statusCode).*/json({ data, msg, statusCode});
}

module.exports = { sendResponse }
