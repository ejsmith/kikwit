'use strict';

import querystring from 'querystring';
import url from 'url';

import appSettingsDefault from './appSettingsDefault';
import * as results from './actionResults';

const queryProp = Symbol('query');
const bodyProp = Symbol('body');

let mixins = {

	download(path, filename, contentType, options) {
		this.result = new results.DownloadResult(this, path, filename, contentType, options);
		this.resolve();
	},
	
	throw(err) {	
		this.result = null;
		this.reject(err);
	},
    
	next() {
		this.result = null;
		this.resolve();
	},

	send(body, contentType) {
		this.result = new results.ContentResult(this, body, contentType);
		this.resolve();
	},

	sendJSON(body) {
		this.result = new results.JSONResult(this, body);
		this.resolve();
	},

	sendJSONP(data) {
		this.result = new results.JSONPResult(this, data);
		this.resolve();
	},

	sendFile(path, contentType, options) {
		this.result = new results.FileResult(this, path, contentType, options);
		this.resolve();
	},

	skipToAction() {
		this.result = new results.SkipToActionResult()
		this.resolve();
	},
    
	redirect(url, statusCode) {
		this.result = new results.RedirectResult(this, url, statusCode);
		this.resolve();
	},

	render(viewPath, locals, contentType) {
        
        if (arguments.length == 0) {
            viewPath = {};
        }

		if (viewPath && (typeof viewPath == 'object')) {

			if (arguments.length > 2) {
				throw new TypeError('Wrong Arguments: render([viewPath], [locals], [contentType])');
			}

			if (arguments.length == 2) {

				if (typeof locals != 'string') {
					throw new TypeError('Argument error: [contentType]');
				}

				contentType = locals;
			}

			locals = viewPath;
			viewPath = undefined;
		}

		this.result = new results.ViewResult(this, viewPath, locals, contentType);
		this.resolve();
	},

	routeURL(name, params, query, validate=true) {

		const route = this.routes.find(x => x.actionRoute.name == name);

		if (!route) {
			return undefined;
		}

		let url;

		if (params && route.groupNames && route.groupNames.length) {

			const paramsPatternSource = route.groupNames
											 .map(x => `\`\\s*(${x})\\s*(?:\\s+([^\`]+)\\s*)?\``)
											 .reduce((a, b) => a + '|' + b);

			const pattern = new RegExp(paramsPatternSource, 'g');

			let matchIndex = 0;
			
			url = route.routePath.replace(pattern, (...args) => { 

				let paramName = args[++matchIndex];
				let paramPattern = args[++matchIndex];
				let paramValue = params[paramName];
				
				if (validate 
					&& paramPattern
					&& String(paramValue).search(paramPattern) < 0) {
					
					throw new TypeError(`Invalid route param value: ${paramValue}`);
				}
				
				return params[paramName]; 
			});

		} else {
			url = route.routePath;
		}

		if (query) {

			let formattedQuery = querystring.stringify(query);

			if (!url.endsWith('?')) {
				url += '?';
			}

			url += formattedQuery;
		}

		return url;
	}
};

export default mixins;