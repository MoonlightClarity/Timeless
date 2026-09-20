const config = require('config');

module.exports = async (ctx, next) => {
	let headersSet = {};
	function set(key, value) {
		ctx.set(key, value);
		headersSet[key] = value;
	}
	if (ctx.headers.origin) {
		let allowedOrigins = config.get('allowedOrigins').filter(x => x);
		let allAllowed = allowedOrigins.includes('*');
		let isAllowed = allAllowed || allowedOrigins.includes(ctx.headers.origin);
		if (!isAllowed) {
			ctx.status = 403;
			ctx.body = '';
			return;
		}
		set("Access-Control-Allow-Origin", allAllowed ? '*' : ctx.headers.origin);
		set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
		set("Access-Control-Allow-Headers", "Content-Type");
		set("Access-Control-Expose-Headers", "Link");
		// Force a 200 on API Gateway
		ctx.body = '';
	}
	try {
		await next();
	}
	catch (e) {
		e.headers = Object.assign({}, e.headers, headersSet);
		throw e;
	}
};
