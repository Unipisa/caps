/*
 * Controller for generic routes on top of the APIs, and from which 
 * other controllers inherit. 
 */

class ApiController {
    static index(req) {
        return {
            software: 'CAPS API Server', 
            version: '3.0.0'
        };
    }
}

module.exports = ApiController;