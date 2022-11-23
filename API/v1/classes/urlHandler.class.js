bodyParser = require('body-parser');
module.exports = {

    BindWithCluster: function () {

        var selfInst = this;
        app.use(express.static('./views'));
        app.set('view engine', 'html');
        // if (Number(SERVER_PORT) == 443) {
        app.set('views', './views');

        app.use(bodyParser.json({
            limit: '50mb'
        }));
        app.use(bodyParser.urlencoded({
            limit: '50mb',
            extended: true
        }));

        //Test API
        app.get('/', async function (req, res) {
            res.send("HELLO WORLD");
        });

        //For Movie Application Data
        app.get('/applist', async function (req, res) {
            var app=[{
                "icon": "https://lh3.googleusercontent.com/UUCaahZfyC5wxzIyMNkzJx3OlGKfh3EsvCrViMmaknxUJGLUXZfX-WAC_uMdo3m3uLg=s180-rw",
                "title": "4K HD Wallpapers",
                "package": "hd.uhd.best.quality.wallpaper"
            }]
            res.send(app)
        });
        
        app.get('/tableData', async function (req, res) {
            var find = await databaseClass.findDataNew(req.query.tb_name, {}, { _id: 0 }, {}, 0, 0);
            console.log("find ---->",find.length);

            res.send(find)
        });

        //For Applicatio Data
        app.get('/wallpaperData', async function (req, res) {
            console.log("wallpaperData -->", req.query);
            var page = Number(req.query.page)
            var cal = (300 * page) - 300;
            var find = await databaseClass.findDataNew(req.query.category, {}, { _id: 0 }, { _id: -1 }, 300, cal);
           
            let shuffled = find
                  .map((a) => ({sort: Math.random(), value: a}))
                  .sort((a, b) => a.sort - b.sort)
                  .map((a) => a.value)

            res.send(shuffled)
        });
        //get particular image form id
        app.get('/select_image', async function (req, res) {

            var find = await databaseClass.findDataNew(req.query.category, { id: req.query.id }, { _id: 0 }, {}, 0, 0);
            res.send(find)

        });
        //Get front image
        app.get('/update_thumbnail', async function (req, res) {

            var thumbnail = await databaseClass.findDataNew('thumbnail', {}, {
                _id: 0,
                page: 0,
                total_pages: 0
            }, {}, 0, 0);
            var arr = [];
            for (var i = 0; i <= thumbnail.length - 1; i++) {
                var count = await databaseClass.findDataNewCount(thumbnail[i].category);
                var r = Math.floor(Math.random() * count);
                console.log("r --->",r)
                const data = await databaseClass.findDataNew(thumbnail[i].category, {}, {
                    _id: 0,
                    id: 0,
                    category: 0
                }, {}, 1, r);

                const up = await databaseClass.updateDataNew('thumbnail', {
                    category: thumbnail[i].category
                }, {
                    $set: { urls: data[0].urls.regular }
                }, {});

                //arr.push({category:thumbnail[i].category,urls:data[0].urls.small})
            }

            res.send("SAVE")
        })

        app.get('/thumbnail', async function (req, res) {

            const data = await databaseClass.findDataNew('thumbnail', {}, { _id: 0 }, {}, 0, 0);
            res.send(data);

        })
        app.get('/reset', async function (req, res) {
            const data = await databaseClass.findDataNew('thumbnail', {}, { _id: 0 }, {}, 0, 0);
            for (var i = 0; i <= data.length - 1; i++) {
                const removed = await databaseClass.removeData(data[i].category, {});
                if (data[i].category != "random") {
                    const up = await databaseClass.updateDataNew('history', {
                        category: data[i].category
                    }, {
                        $set: { page: 0, total_pages: 0, record_count: 0 }
                    }, {});
                }
            }
            res.send("removed")
        });
        //Get Data from unplash
        app.get('/getDataAPI', async function (req, res) {

            /****
                random 
            ****/

            var response = await urlHanlder.doRequest('https://api.unsplash.com/photos/random/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&count=30');
            var data = JSON.parse(response);
            var arr = [];
            for (var i = 0; i <= data.length - 1; i++) {
                var select = {
                    id: data[i].id,
                    urls: data[i].urls
                }
                select.category = "random";
                delete select.urls.raw;
                delete select.urls.thumb;
                var find = await databaseClass.findDataNew("random", { id: select.id }, {}, {}, 0, 0);
                console.log("find -->", find.length);
                if (find.length == 0) {
                    console.log("inside find -->");
                    await databaseClass.insertDataNew("random", select);
                }
            }

            /****
             architecture 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "architecture"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=architecture&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);
            if (data.total_pages >= page) {
                if (data.results.length > 0) {

                    console.log("data.total_pages  --->", data.total_pages)
                    console.log(" history.total_pages --->", history[0].total_pages)
                    if (data.total_pages > history[0].total_pages) {
                        var upDate = {
                            $set: {
                                total_pages: data.total_pages
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "architecture"
                        }, upDate, {});
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "architecture"
                    }, {
                        $set: {
                            page: page
                        }
                    }, {});
                    var arr = [];
                    for (var i = 0; i <= data.results.length - 1; i++) {
                        var select = {
                            id: data.results[i].id,
                            urls: data.results[i].urls
                        }
                        select.category = "architecture";
                        delete select.urls.raw;
                        delete select.urls.thumb;
                        var find = await databaseClass.findDataNew("architecture", {
                            id: select.id
                        }, {}, {}, 0, 0);
                        console.log("find -->", find.length);
                        if (find.length == 0) {
                            console.log("inside find -->");
                            await databaseClass.insertDataNew("architecture", select);
                            var count = await databaseClass.findDataNewCount("architecture");
                            console.log("count -------->", count);
                            var upDate = {
                                $set: {
                                    record_count: count
                                }
                            }
                            var up = await databaseClass.updateDataNew('history', {
                                category: "architecture"
                            }, upDate, {});
                            console.log("up -------->", up);
                        }
                    }
                }
            } else {
                var upDate = {
                    $set: {
                        total_pages: 0
                    }
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "architecture"
                }, upDate, {});
            }

            /////////////////////////////////////////////////////////////
            /****
                 animal 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "animal"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=animal&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "animal"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "animal"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "animal";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("animal", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("animal", select);
                        var count = await databaseClass.findDataNewCount("animal");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "animal"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            ////////////////////////////////////////////////////////////////////////////
            /****
             birds 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "birds"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=birds&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "birds"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "birds"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "birds";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("birds", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("birds", select);
                        var count = await databaseClass.findDataNewCount("birds");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "birds"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            ocean 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "ocean"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=ocean&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "ocean"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "ocean"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "ocean";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("ocean", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("ocean", select);
                        var count = await databaseClass.findDataNewCount("ocean");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "ocean"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            nature 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "nature"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=nature&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "nature"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "nature"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "nature";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("nature", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("nature", select);
                        var count = await databaseClass.findDataNewCount("nature");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "nature"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            winter 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "winter"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=winter&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "winter"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "winter"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "winter";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("winter", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("winter", select);
                        var count = await databaseClass.findDataNewCount("winter");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "winter"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            beach 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "beach"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=beach&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "beach"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "beach"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "beach";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("beach", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("beach", select);
                        var count = await databaseClass.findDataNewCount("beach");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "beach"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            lights 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "lights"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=lights&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "lights"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "lights"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "lights";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("lights", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("lights", select);
                        var count = await databaseClass.findDataNewCount("lights");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "lights"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            flowers 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "flowers"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=flowers&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "flowers"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "flowers"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "flowers";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("flowers", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("flowers", select);
                        var count = await databaseClass.findDataNewCount("flowers");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "flowers"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /***
            reflection 
            ***/
            var history = await databaseClass.findDataNew("history", {
                category: "reflection"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=reflection&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "reflection"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "reflection"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "reflection";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("reflection", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("reflection", select);
                        var count = await databaseClass.findDataNewCount("reflection");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "reflection"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            love 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "love"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=love&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "love"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "love"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "love";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("love", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("love", select);
                        var count = await databaseClass.findDataNewCount("love");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "love"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            fireworks 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "fireworks"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=fireworks&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "fireworks"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "fireworks"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "fireworks";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("fireworks", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("fireworks", select);
                        var count = await databaseClass.findDataNewCount("fireworks");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "fireworks"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            galaxy 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "galaxy"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=galaxy&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "galaxy"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "galaxy"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "galaxy";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("galaxy", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("galaxy", select);
                        var count = await databaseClass.findDataNewCount("galaxy");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "galaxy"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            vehicle 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "vehicle"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=vehicle&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "vehicle"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "vehicle"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "vehicle";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("vehicle", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("vehicle", select);
                        var count = await databaseClass.findDataNewCount("vehicle");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "vehicle"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            aircraft 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "aircraft"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=aircraft&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "aircraft"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "aircraft"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "aircraft";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("aircraft", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("aircraft", select);
                        var count = await databaseClass.findDataNewCount("aircraft");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "aircraft"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            music 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "music"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=music&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "music"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "music"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "music";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("music", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("music", select);
                        var count = await databaseClass.findDataNewCount("music");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "music"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }
            /////////////////////////////////////////////////////////////////////////////
            /****
            food 
            ****/
            var history = await databaseClass.findDataNew("history", {
                category: "food"
            }, {}, {}, 0, 0);
            console.log("history.page -->", history);
            var page = history[0].page + 1;
            console.log("page -->", page);

            var response = await urlHanlder.doRequest('https://api.unsplash.com/search/photos/?client_id=7d24b048ee77412a6c0ef802e337a07b3bf76a41aa2bb2985b2319b581c8d138&query=food&per_page=30&page=' + page);
            var data = JSON.parse(response);
            console.log("data.result.length -->", data.results.length);

            if (data.results.length > 0) {

                console.log("data.total_pages  --->", data.total_pages)
                console.log(" history.total_pages --->", history[0].total_pages)
                if (data.total_pages > history[0].total_pages) {
                    var upDate = {
                        $set: {
                            total_pages: data.total_pages
                        }
                    }
                    var up = await databaseClass.updateDataNew('history', {
                        category: "food"
                    }, upDate, {});
                }
                var up = await databaseClass.updateDataNew('history', {
                    category: "food"
                }, {
                    $set: {
                        page: page
                    }
                }, {});
                var arr = [];
                for (var i = 0; i <= data.results.length - 1; i++) {
                    var select = {
                        id: data.results[i].id,
                        urls: data.results[i].urls
                    }
                    select.category = "food";
                    delete select.urls.raw;
                    delete select.urls.thumb;
                    var find = await databaseClass.findDataNew("food", {
                        id: select.id
                    }, {}, {}, 0, 0);
                    console.log("find -->", find.length);
                    if (find.length == 0) {
                        console.log("inside find -->");
                        await databaseClass.insertDataNew("food", select);
                        var count = await databaseClass.findDataNewCount("food");
                        console.log("count -------->", count);
                        var upDate = {
                            $set: {
                                record_count: count
                            }
                        }
                        var up = await databaseClass.updateDataNew('history', {
                            category: "food"
                        }, upDate, {});
                        console.log("up -------->", up);
                    }
                }
            }

            res.send("Data set")
        });
    },
    doRequest: async function (url) {
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
}