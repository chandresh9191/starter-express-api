const express = require('express');
const bodyParser = require('body-parser');
var mongod = require('mongodb');
const cors = require('cors');
require('dotenv').config({path: __dirname + '/.env'})

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/v1/color', require('./API/v1/routes/colors'));
app.use('/v1/wally', require('./API/v1/routes/wallpapers'));
app.use('/v1/search', require('./API/v1/routes/search'));
app.use('/v1/live', require('./API/v1/routes/wallpaper'));

MongoClient = mongod.MongoClient;
MongoID = module.exports = mongod.ObjectID; //reporting conversion class instavle to global for convert string to object
databaseClass = module.exports = require("./API/v1/classes/database.class.js");
databaseClass.ConnectDatabase(function(){
});

port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log(`Listening on 3000`);
})



// express = module.exports = require('express');
// request = module.exports = require('request');
// const http = require('http')
// const path = require('path')
// var mongod = require('mongodb');
// 	//server start configuration here.
// app = module.exports = express();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// var secureServer = require('http').createServer(app);

// urlHanlder 	 = module.exports = require('./classes/urlHandler.class.js');
// urlHanlder.BindWithCluster();

// app.use('/wally', require('./classes/urlHandler.class.js'));

// colorHanlder 	 = module.exports = require('./classes/color.class.js');
// colorHanlder.BindWithCluster();
// app.use('/color', require('./classes/color.class.js'));

// databaseClass = module.exports = require("./classes/database.class.js");

// 	//mongod db connection starting here.
// MongoClient = mongod.MongoClient;
// MongoID = module.exports = mongod.ObjectID; //reporting conversion class instavle to global for convert string to object
// databaseClass.ConnectDatabase(function(){
// });

// // express()
// //   .use(express.static(path.join(__dirname, 'public')))
// //   .set('views', path.join(__dirname, 'views'))
// //   .set('view engine', 'ejs')
// //   .get('/', (req, res) => res.render('pages/index'))
// //   .listen(SERVER_PORT, () => console.log(`Listening on ${ SERVER_PORT }`))	 
// //

// const SERVER_PORT = process.env.PORT || 5000;
// secureServer.listen(SERVER_PORT,function(){
//     console.log("Server lisen on "+SERVER_PORT);
// });

