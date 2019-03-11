
var milli = ((time) => {
    var a = time.split(':');
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds * 1000
});

module.exports = { milli }