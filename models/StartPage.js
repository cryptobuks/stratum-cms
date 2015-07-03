var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Start Page Model
 * ==========
 */

var StartPage = new keystone.List('StartPage', {
	nocreate: true,
	nodelete: true,
	map: { name: 'header' },
	plural: 'Start Page'
	// autokey: { path: 'slug', from: 'title', unique: true }
});

StartPage.add({
	header: { type: String, required: true },
	description: { type: Types.Textarea, height: 150 }},
	'Information Blurb', 
	{
		informationBlurb: {
			type: {
				type: Types.Select,
				note: 'Select which type of information that should be shown in the "blurb" on the top right' + 
				'\n- **Image**: Displays the selected image and text if any'+
				'\n- **News Item**: Displays the latest news item with corresponding picture'+
				'\n- **News Roll**: Displays the 3 latest news items in a compressed format'+
				'\n- **Meeting**: Select important meetings which should be shown',
				options: [{
					value: 'image',
					label: 'Image'
				}, {
					value: 'newsRoll',
					label: 'News Roll'
				}, {
					value: 'newsItem',
					label: 'News Item'
				}, {
					value: 'meeting',
					label: 'Meeting'
				}]
			},
			image: {
				label: 'Image',
				type: Types.CloudinaryImage,
				dependsOn: {
					'informationBlurb.type': 'image'
				}
			},
			imageText: {
				label: 'Image Text',
				type: String,
				dependsOn: {
					'informationBlurb.type': 'image'
				}
			},
			meeting: {
				label: 'Meeting',
				type: String,
				dependsOn: {
					'informationBlurb.type': 'meeting'
				}
			}
		}
	// }, 'Widgets', {
	// 	widgets: {
	// 		'1': { type: Types.Relationship, label: 'Widget', ref: 'Widget', collapse: true },
	// 		'2': { type: Types.Relationship, label: 'Widget', ref: 'Widget', collapse: true },
	// 		'3': { type: Types.Relationship, label: 'Widget', ref: 'Widget', collapse: true },
	// 		'4': { type: Types.Relationship, label: 'Widget', ref: 'Widget', collapse: true },
	// 		'5': { type: Types.Relationship, label: 'Widget', ref: 'Widget', collapse: true }
	// }
});
 
StartPage.register();