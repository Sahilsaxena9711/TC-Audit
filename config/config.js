var env = process.env.NODE_ENV;
console.log(`Enviornment :: ${env}`);

if (env == "development") {
    process.env.PORT = process.env.PORT || 8080;
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
} else if (env == "production") {
    console.log(process.env.PORT);
    
    process.env.PORT = process.env.PORT;
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
} else {
    console.log(process.env.PORT);
    process.env.PORT = process.env.PORT;
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
}

module.exports = { env };