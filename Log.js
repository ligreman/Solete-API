const winston = require('winston');

function setLevel(lvl) {
    winston.level = lvl;
}

function log(msg, variable) {
    if (variable) {
        winston.log('log', msg, variable);
    } else {
        winston.log('log', msg);
    }
}

function debug(msg, variable) {
    if (variable) {
        winston.log('debug', msg, variable);
    } else {
        winston.log('debug', msg);
    }
}

function error(msg, variable) {
    if (variable) {
        winston.log('error', msg, variable);
    } else {
        winston.log('error', msg);
    }
}

function info(msg, variable) {
    if (variable) {
        winston.log('info', msg, variable);
    } else {
        winston.log('info', msg);
    }
}

module.exports = {
    log: log,
    debug: debug,
    error: error,
    info: info,
    setLevel: setLevel
};
