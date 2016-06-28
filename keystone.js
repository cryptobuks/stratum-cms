// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone'),
	path = require('path'),
	root = process.env.ROOT || './',
	handlebars = require('express-handlebars'),
	fs = require('fs'),
	stratum = require('./' + path.join(root, 'utils/stratum')),
	keystoneWidgets = require('./' + path.join(root, 'utils/keystone-widgets')),
	subPageCount = require('./' + path.join(root, 'utils/sub-page-count')),
	Helpers = require('./' + path.join(root, 'templates/views/helpers')),
	appName = process.env.ROOT ? __dirname.split(path.sep).pop() : 'app',
	pkg = require('./' + path.join(root, 'package.json'));

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({

	'name': process.env.BRAND || 'Stratum',
	'brand': process.env.BRAND || 'Stratum',
	'brand safe': (process.env.BRAND || 'Stratum').trim().replace(/\W+/g, '-').toLowerCase(),
	'static': ['override', path.join(root, 'public')],
	'favicon': path.join(root, 'public/favicon.ico'),
	'views': path.join(root, 'templates/views'),

	//Gets the name of the currently active directory
	'app name': appName,
	'view engine': 'hbs',
	'custom engine': handlebars.create({
		layoutsDir: path.join(root, 'templates/views/layouts'),
		partialsDir: [path.join(root, 'templates/views/partials'), path.join(root, 'templates/views/widgets')],
		defaultLayout: 'default',
		helpers: new Helpers(),
		extname: '.hbs'
	}).engine,
	'show version': !!process.env.SHOW_VERSION,
	// Set https as default for cloudinary resources (override per image with secure=false)
	'cloudinary config': { secure: true },
	'updates': path.join(root, 'updates'),
	'auto update': true,
	'mongo': process.env.MONGO_URI || 'mongodb://localhost/' + pkg.name,

	'session': true,
	'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET || 'stratum-cms',
	'protect all pages': process.env.PROTECT_ALL_PAGES === 'true',
	'stratum api key': process.env.STRATUM_API_KEY,
	'stratum server': process.env.STRATUM_SERVER || 'stratum.registercentrum.se',
	'is portal': process.env.IS_PORTAL === 'true',
	'has login': process.env.HAS_LOGIN === 'true',
	'wysiwyg cloudinary images': true,
	'keystone widgets index': path.join(root, '/client/scripts/widgets/widgets.json'),
	'ga property front': process.env.GA_PROPERTY_FRONT,

	'register id': process.env.CLIENT_REGISTER_ID,
	// Redirect to regular page if whole site is access restricted
	'signin redirect': process.env.PROTECT_ALL_PAGES === 'true' ? '/' : '/keystone',
	'signout redirect': '/',
	'default region': 'SE'
});

// Load your project's Models

keystone.import(path.join(root, 'models'));

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

keystone.set('cloudinary folders', true);
keystone.set('cloudinary prefix', keystone.get('brand safe'));

if (keystone.get('show version') && fs.existsSync('last_commit.json')) {
	try {
		keystone.set('last commit', JSON.parse(fs.readFileSync('last_commit.json', 'utf8')));
	} catch (e) {
		console.log(e);
	}
}
// Load your project's Routes

keystone.set('routes', require('./' + path.join(root, 'routes')));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

// Configure the navigation bar in Keystone's Admin UI

var nav = {
	'global-settings': ['start-pages', 'register-information'],
	'pages': ['pages', 'sub-pages', 'menu-blocks'],
	'news': 'news-items',
	'resources': 'resources',
	'contacts': 'contacts',
	'questions': ['questions', 'question-categories'],

	// Hide users from menu for now
	// 'users': 'users',

	'widgets': ['widgets', 'start-page-widgets']
};

// Portal specific menu items
if (keystone.get('is portal')) {
	nav['global-settings'].push('sub-registers');
}

keystone.set('nav', nav);

// Output environment variable
console.log('Currently running in ' + keystone.get('env'));

keystone.post('updates', function () {
	stratum.loadWidgets();

	// Not used at the present..
	// stratum.loadRegisters();

	keystoneWidgets.loadWidgets();
	// Update Sub Page counter on Pages
	subPageCount.updateCount();
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();
