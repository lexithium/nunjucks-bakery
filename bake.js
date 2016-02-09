var nunjucks = require('nunjucks');
var fs = require('fs-extra');
var chokidar = require('chokidar');
var glob = require('glob');
var path = require('path');
var livereload = require('livereload');
var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');


function renderIndTemplate(path) {
	//globbing patterns to get views and templates
	var pages = new nunjucks.FileSystemLoader('views/');
	var templates = new nunjucks.FileSystemLoader('bits/');

	//nunjucks environment
	var env = new nunjucks.Environment([templates, pages]);

	//name of the file we're creating
	var file_path = path.split('/').slice(1).join();

	//render templates relative to the environment
	var result = env.render(file_path);

	//bake the rendered html
	fs.outputFileSync('build/' + file_path, result);
}

//render all templates when you first run the command
var pages_to_render = glob.sync('views/**/*.html');
pages_to_render.forEach(function(element, index, list) {
	renderIndTemplate(element);
});

//initialize watcher
var watcher = chokidar.watch('views/**/*.html', {
	ignored: /[\/\\]\./,
	persistent: true
});

//something to use when events are received.
var log = console.log.bind(console);

//add event listeners
watcher
	.on('add', path => {
		log(`File ${path} has been added`);
		// console.log(path);
		renderIndTemplate(path);
	})
	.on('change', path => {
		log(`File ${path} has been changed`);
		renderIndTemplate(path);
	})
	.on('unlink', path => {
		log(`File ${path} has been removed`);
	});




//start up a localhost server
var app = connect();
// console.log(__dirname);
app.use(serveStatic(__dirname + '/build'));
app.listen(8000);
console.log('Connected at http://localhost:8000/');




// //set up the livereload server
// var server = livereload.createServer();
// server.watch(__dirname + '/build');