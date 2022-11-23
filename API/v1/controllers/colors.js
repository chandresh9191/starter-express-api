const request = require('request');

async function dataCollection(req, res) {
    return new Promise(async(resolve, reject) => {
        try {
            var page = req.query.page;
            var category = req.query.category;

            for(var i = 1; i <=page; i++){
                var response = await doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query='+category+'&per_page=30&page=' + i);
                var data = JSON.parse(response);

                console.log(" count i ------------------------->",i)
                
                for (var j = 0; j <= data.results.length - 1; j++) {
                    var select = {
                        id: data.results[j].id,
                        urls: data.results[j].urls
                    }
                    select.category = category;
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew(category, {
                        id: select.id
                    }, {}, {}, 0, 0);
                    // console.log("find -->", find.length);
                    if (find.length == 0) {
                        // console.log("inside find -->");
                        await databaseClass.insertDataNew(category, select);
                    }
                }
            }

            return resolve({
                status: 200,
                msg: 'dataCollection Data saved successfully',
                data: {}
            });
        } catch (error) {
            return reject(error);
        }
    })
}

async function doRequest (url) {
        return new Promise(function (resolve, reject) {
            request(url, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
}
module.exports = {
    dataCollection
}