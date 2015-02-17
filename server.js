var express = require('express');
var compress =  require('compression');
var app = express();

app.listen(process.env.PORT || 4001);
app.use(express.static(__dirname + '/dist'));
app.use(compress()); 
console.log("Listening on port 4001...");