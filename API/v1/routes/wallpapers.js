const express = require('express');
const router = express.Router()
const controller = require('../controllers/wallpapers');
const utils = require('../utilities/utils');

router.get('/applist', applist);
router.get('/tableData', tableData);
router.get('/wallpaperData', wallpaperData);
router.get('/select_image', select_image);
router.get('/update_thumbnail', update_thumbnail);
router.get('/thumbnail', thumbnail);
router.get('/getDataAPI', getDataAPI);

async function applist(req, res){
    controller.applist(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while getting applist data', { });
    });
}

async function tableData(req, res){
    controller.tableData(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while getting table data', { });
    });
}

async function wallpaperData(req, res){
    controller.wallpaperData(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while getting wallpaper data', { });
    });
}

async function select_image(req, res){
    controller.select_image(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while getting selected image ', { });
    });
}

async function update_thumbnail(req, res){
    controller.update_thumbnail(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while updating thumbnail image ', { });
    });
}

async function thumbnail(req, res){
    controller.thumbnail(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while fetching thumbnail image ', { });
    });
}

async function getDataAPI(req, res){
    controller.getDataAPI(req, res).then(response => {
        return utils.sendResponse(res, response.status, response.msg, response.data);
    }).catch(error => {
    	console.log("error -->",error)
        if(error.status && error.msg)
            return utils.sendResponse(res, error.status, error.msg, error.data);
        else
            return utils.sendResponse(res, 500, 'Error while Inserting data ', { });
    });
}


module.exports = router