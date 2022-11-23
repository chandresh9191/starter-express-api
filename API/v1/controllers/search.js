const request = require('request');

async function searchData(req, res) {
    return new Promise(async(resolve, reject) => {
        try {

            var searchText = req.query.searchText;
            var find = await databaseClass.findDataNew("searchQuery", {
                searchText: searchText
            }, {}, {}, 0, 0);

            if (find.length === 0) {
                console.log("inside if condition --------------------->")
                var response = await doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=' + searchText + '&per_page=30');
                var data = JSON.parse(response);
                var arr = [];
                for (var j = 0; j <= data.results.length - 1; j++) {

                    delete data.results[j].urls.raw;
                    delete data.results[j].urls.thumb;

                    arr.push({
                        urls: data.results[j].urls
                    })
                }
                var select = {}
                select.searchText = searchText;
                select.data = arr;
                select.lastSyncDate = new Date();

                await databaseClass.insertDataNew("searchQuery", select);
            }

            
            var upDate = {
                $set: {
                    lastSyncDate: new Date()
                }
            }
            var up = await databaseClass.updateDataNew("searchQuery", {
                searchText: searchText
            }, upDate, {});


            var find = await databaseClass.findDataNew("searchQuery", {
                searchText: searchText
            }, {}, {}, 0, 0);


            let shuffled = find
                .map((a) => ({
                    sort: Math.random(),
                    value: a
                }))
                .sort((a, b) => a.sort - b.sort)
                .map((a) => a.value)

            return resolve({
                status: 200,
                msg: 'searchQuery wallpaper Data',
                data: shuffled
            });

        } catch (error) {
            return reject(error);
        }
    })
}

async function doRequest(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}
module.exports = {
    searchData
}