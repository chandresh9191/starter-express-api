
module.exports = {
	ConnectDatabase : function (callback) {

        // var ConnectionString = "mongodb+srv://dhavalsojitra8866:eIipZwmnabyyhaaA@clusterwallpaper-w1xke.mongodb.net/test?retryWrites=true&w=majority";
        var ConnectionString = process.env.CONNECTION_STRING
        MongoClient.connect(ConnectionString, { useUnifiedTopology: true, useNewUrlParser: true }, {
            auto_reconnect: true
        }, function(err, DClient) {
            try {
                if (err)
                    console.log(err);
                else {
                    db = module.exports = DClient.db('wallpaper');
                    console.log("Connected to Mongo DB : ",new Date());
                }
            } catch (e) {
                console.log("ConnectDatabase : Connection : Exception ", e);
            }
            callback();
        });
	},
    saveDataNew: function(table_name, sData, callback) {
        try {
            return new Promise(function(resolve,reject){
                var arg=arguments;            
                delete sData._id;
                console.log("saveDataNew table_name --->",table_name,sData)
                db.collection(table_name).save(sData, function(err, res) {
                    try {

                        if (err) {
                            console.log("MongoDBError saveData Error:", err, arg);
                            resolve(false);
                        }
                        var res = typeof res.ops != 'undefined' && typeof res.ops[0] != 'undefined' ? res.ops[0]: {};
                        resolve(res);
                    } catch (e) {
                        console.log("saveData : Exception : 2 : ", e, arg,res.result);
                    }
                });
            });
                
        } catch (e) {
            console.log("saveData : Exception : 1 : ", e, arg);
        }
    },
    findDataNew: function(table_name, wh, fields, sort, no_limit, skip, callback) {
        try {
            return new Promise(function(resolve,reject){
                var arg=JSON.stringify(arguments);
                console.log("table_name--findDataNew-->",table_name)
                console.log("no_limit--findDataNew-->",no_limit)
                console.log("skip--findDataNew-->",skip)
                db.collection(table_name.toString()).find(wh).project(fields).limit(no_limit).skip(skip).sort(sort).toArray((err,res)=>{
                    try{
                        if (err) {
                            console.log("MongoDBError findData Error:", err, arg); 
                            res = []                           
                        }                               
                        resolve(res);
                    }catch(e){
                        console.log("findDataNew : Exception : 2 : ", e, arg);
                    }
                })                                    
            })            
        } catch (e) {
            console.log("findData : Exception : 1 : ", e, arg);
        }
    },
    findDataNewCount: function(table_name) {
        try {
            return new Promise(function(resolve,reject){
                var arg=JSON.stringify(arguments);
                console.log("table_name--findDataNew-->",table_name)
                db.collection(table_name.toString()).count({}, function(err, res){
                    try{
                        if (err) {
                            console.log("MongoDBError CountData Error:", err, arg); 
                            res = []                           
                        }                               
                        resolve(res);
                    }catch(e){
                        console.log("CountData : Exception : 2 : ", e, arg);
                    }
                });
            })            
        } catch (e) {
            console.log("findData : Exception : 1 : ", e, arg);
        }
    },
    insertDataNew: function(table_name, iData, callback) {
        try {
            return new Promise(function(resolve,reject){
                var arg=JSON.stringify(arguments);
                if (Array.isArray(iData) && iData.length == 0)
                    resolve({});

                if (Array.isArray(iData)) {
                    iData = iData.map(function(e){
                        delete e._id;
                        return e;
                    })
                }
                console.log("iData --->",iData)
                db.collection(table_name).insertOne(iData, function(err, res) {
                    
                    try {
                        if (err) {
                            console.log("MongoDBError insertData Error:", err, arg);
                            res={};
                        }
                        delete iData;
                        resolve(res);
                    } catch (e) {
                        console.log("insertData : Exception : 2 : ", e, arg, res);
                    }
                });
            });
        } catch (e) {
            console.log("insertData : Exception : 1 : ", e, arg);
        }
    },
    updateDataNew: function(table_name, wh, uData, option, callback) {
        try {
            return new Promise(function(resolve,reject){
                var arg=JSON.stringify(arguments);
                db.collection(table_name).update(wh, uData, option, function(err, res) {
                    try {
                        if (err) {
                            console.log("MongoDBError updateData Error:", err, arg);
                            res = {
                                result: {
                                    nModified: 0
                                }
                            }
                        }
                        resolve(res.result.nModified);
                    } catch (e) {
                        console.log("updateData : Exception : 2 : ", e, arg);
                    }
                });
            });
        } catch (e) {
            console.log("updateData : Exception : 1 : ", e, arg);
        }
    },
    removeData: function(table_name, wh, callback) {
        try {
            return new Promise(function(resolve,reject){
            var arg=JSON.stringify(arguments);
            db.collection(table_name).deleteMany(wh, function(err, res) {
                try {
                    if (err) {
                        console.log("MongoDBError removeData Error:", err, arg);
                    }
                    resolve(res);
                } catch (e) {
                    console.log("removeData : Exception : 2 : ", e, arg);
                }
            })
        })
        } catch (e) {
            console.log("removeData : Exception : 1 : ", e, arg);
        }
    },
}