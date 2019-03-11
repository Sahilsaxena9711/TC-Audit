var msToHMS = ((ms) => {
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return hours + ":" + minutes + ":" + seconds;
});

module.exports = { msToHMS }