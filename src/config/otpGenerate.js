const idchunk = require('idchunk');

const otpGenerate = () => {
    return idchunk(4,'0123456789');
}

module.exports = otpGenerate
