var env = process.env.NODE_ENV;
console.log(`Enviornment :: ${env}`);

if (env == "development") {
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
} else if (env == "production") {
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
} else {
    process.env.MONGODB_URI = 'mongodb://Sahil9711:Sahil1058@ds235180.mlab.com:35180/audit';
}

module.exports = { env };