'use strict'

let MarkdownIt = require('markdown-it');
let _ = require('lodash');
let path = require('path');

module.exports = function (mikser, context) {

	let config = mikser.config['markdown-it'];
	let options = _.clone(config);
	delete options.use;
	let md = new MarkdownIt(options);

	function loadPlugins() {
		if (config && config.use) {
			for (let plugin of config.use) {
				let pluginName = '',
					pluginOptions = {}
				if (_.isString(plugin)) {
					pluginName = plugin;
				} else {
					pluginName = _.keys(plugin)[0];
					pluginOptions = plugin;
				}
				if (pluginName.indexOf('markdown-it') == -1) {
					pluginName = 'markdown-it-' + pluginName;
				}
				pluginName = path.join(mikser.options.workingFolder, 'node_modules', pluginName)
				md.use(require(pluginName), pluginOptions);
			}
		}
	}
	loadPlugins();

	if (context) {
		context.markdownIt = function (content) {
			if (!content) return '';
			if (typeof content != 'string' && content != undefined) {
				throw new Error('Argument is not a string');
			}
			return md.render(content);
		}
		if (config.default) context.markdown = context.markdownIt;
	} else {
		mikser.manager.extensions['.md'] = '.html';
		var defaultMarkdownEngine = mikser.generator.engines.findIndex((engine) => engine.pattern == '**/*.md');
		if (defaultMarkdownEngine > -1)	mikser.generator.engines.splice(defaultMarkdownEngine, 1);
		mikser.generator.engines.push({
			extensions: ['md'],
			pattern: '**/*.md',
			render: function(context) {
				return md.render(context.content);
			}
		});		
	}
};