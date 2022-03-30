/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

class ApiController {

    static index(req, res) {
        ApiController.JSONResponse(res, {
            software: 'CAPS API Server', 
            version: '3.0.0'
        });
    }

    static errorResponse(res, message) {
        res.json({
            code: 500, 
            message: message
        })
    }

    static JSONResponse(res, data = null) {
        var response = {
            code: 200, 
            message: 'OK'
        }

        if (data !== null) {
            response['data'] = data;
        }

        res.json(response)
    }

}

module.exports = ApiController;