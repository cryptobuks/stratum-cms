var keystone = require('keystone'),
	_ = require('underscore'),
	importRoutes = keystone.importer(__dirname);

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res),
		locals = res.locals, context = {};
		
	/**
	 * Look for menu blocks matching parameter
	 */
	view.on('init', function(next) {
		keystone.list('MenuBlock').model
			.findOne()
			.where('slug', req.params.menublock)
			.where('static', false)
			.where('registerSpecific').in([locals.registerLoggedIn, false, null])
			.exec(function(err, menu) {
				if (err) {
					next(err);
				} else if (!menu) {
					res.notFound();
					return;
				} else {
					context.menu = menu;
					next();
				}
			});
	});

	/**
	 * Find first page in menu block and redirect to found page 
	 */
	view.on('init', function(next) {
		keystone.list('Page').model
			.findOne()
			.where('menu', context.menu._id)
			.where('state', 'published')
			.where('registerSpecific').in([locals.registerLoggedIn, false, null])
			.sort('sortOrder')
			.exec(function(err, page) {
				if (!err) {
                    if(!page){
						res.notFound();
                    } else {
						res.redirect('/' + context.menu.slug + '/' + page.slug + '/p/' + page.shortId);
					}
				} else {
					res.status(500).send('error');
				}
			});
	});
	
	view.render('page');
};
