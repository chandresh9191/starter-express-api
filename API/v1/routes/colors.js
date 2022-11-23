const express = require('express');
const router = express.Router()
const controller = require('../controllers/colors');
const utils = require('../utilities/utils');

router.get('/dataCollection', dataCollection);


async function dataCollection(req, res){
    controller.dataCollection(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
    	if( error == null)
            return utils.sendResponse(res, 505, "Rate Limit Exceeded", {});

        else if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while getting dataCollection data', { });
    });
}

module.exports = router