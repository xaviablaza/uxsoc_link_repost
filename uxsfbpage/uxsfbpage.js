const request = require('request');

var getLatestUrl = (pageId, appId, appSecret, callback) => {

	request({
		url: `https://graph.facebook.com/v2.8/${pageId}/posts?fields=link&limit=1&access_token=${appId}|${appSecret}`,
		json: true
	}, (error, response, body) => {
		if (error) {
			callback(error);
		} else {
			callback(undefined, {
				link: body.data[0].link
			});
		}
	});
};

module.exports = {
	getLatestUrl
};
