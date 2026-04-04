module.exports = (res, status, message, data) => {
    return res.status(status).json({
        success: status < 400,
        message,
        ...(data !== undefined && { data }),
    })
}