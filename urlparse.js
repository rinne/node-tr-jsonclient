'use strict';

function urlParse(url) {
	if (typeof(url) !== 'string') {
		return undefined;
	}
    var m = url.match(/^([a-z0-9]([a-z0-9-]*[a-z0-9])?):\/\/(([^@:]*)(:([^@]*))?\@)?([^\/:]+)(:(\d{1,5}))?(\/.*|)$/i);
    if (! m) {
        return undefined;
    }
    var rv = {
        proto: m[1].toLowerCase(),
        user: m[4],
        pass: m[6],
        host: m[7],
        port: undefined,
        path: ((m[10] === '') ? '/' : m[10])
    };
    if (m[8] === undefined) {
        switch (rv.proto) {
        case 'http':
            rv.port = 80;
            break;
        case 'https':
            rv.port = 443;
            break;
        }
    } else {
        rv.port = Number.parseInt(m[9]);
        if ((rv.port < 1) || (rv.port > 65535)) {
            return undefined;
        }
    }
    return rv;
}

module.exports = urlParse;
