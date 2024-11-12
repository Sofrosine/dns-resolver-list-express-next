const {getDomains} = require("../controllers/domain_controller");

const domainRoute = (router, client) => {
    router.get('/', async (req, res) => {
        await getDomains(req, res, client); // Pass getConnection to the controller
    });

    return router;
};

module.exports = {domainRoute};