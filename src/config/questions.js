module.exports = {
	create: {
		url: [
			{
				type: 'input',
				name: 'url',
				message: 'Enter Watson URL :',
				default: 'https://gateway.watsonplatform.net/assistant/api'
			}
		],
		username: [
			{
				type: 'input',
				name: 'username',
				message: 'Enter Watson username :',
				validate: function (input) {
					return input && input.length > 0;
				},
			},
		],
		password: [
			{
				type: 'input',
				name: 'password',
				message: 'Enter Watson password :',
				validate: function (input) {
					return input && input.length > 0;
				},
			}
		],
		languages: [
			{
				type: 'checkbox',
				name: 'languages',
				message: 'Wich languages ?',
				choices: [
					'French',
					'English',
					'German',
					'Dutch'
				],
				default: [
					'French',
					'English'
				],
				validate: function (answer) {
					if (answer.length < 1) {
						return 'You must choose at least one language.';
					}
					return true;
				}
			}
		],
		types: [
			{
				type: 'checkbox',
				name: 'types',
				message: 'Wich Types ?',
				choices: [
					'Business',
					'Synonyms',
					'Kfold',
					'Definition',
					'Social'
				],
				default: [
					'Business',
					'Synonyms',
					'Kfold',
					'Definition'
				],
				validate: function (answer) {
					if (answer.length < 1) {
						return 'You must choose at least one language.';
					}
					return true;
				}
			}
		]
	},
	delete: [
		{
			type: 'input',
			name: 'url',
			message: 'Enter Watson URL :',
			default: 'https://gateway.watsonplatform.net/assistant/api'
		},
		{
			type: 'input',
			name: 'username',
			message: 'Enter Watson username :',
			validate: function (input) {
				return input && input.length > 0;
			},
		},
		{
			type: 'input',
			name: 'password',
			message: 'Enter Watson password :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}
	],
	listWorkspaces: [
		{
			type: 'input',
			name: 'url',
			message: 'Enter Watson URL :',
			default: 'https://gateway.watsonplatform.net/assistant/api'
		},
		{
			type: 'input',
			name: 'username',
			message: 'Enter Watson username :',
			validate: function (input) {
				return input && input.length > 0;
			},
		},
		{
			type: 'input',
			name: 'password',
			message: 'Enter Watson password :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}
	],
	listSourceWorkspaces: {
		url: [{
			type: 'input',
			name: 'url',
			message: 'Enter Source Watson URL :',
			default: 'https://gateway.watsonplatform.net/assistant/api'
		}],
		username: [{
			type: 'input',
			name: 'username',
			message: 'Enter Source Watson username :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}],
		password: [{
			type: 'input',
			name: 'password',
			message: 'Enter Source Watson password :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}]
	},
	listDestWorkspaces:{
		url: [{
			type: 'input',
			name: 'url',
			message: 'Enter Destination Watson URL :',
			default: 'https://gateway.watsonplatform.net/assistant/api'
		}],
		username: [{
			type: 'input',
			name: 'username',
			message: 'Enter Destination Watson username :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}],
		password: [{
			type: 'input',
			name: 'password',
			message: 'Enter Destination Watson password :',
			validate: function (input) {
				return input && input.length > 0;
			},
		}]
	},
	migrate(workspaces) {
		return [
			{
				type: 'checkbox',
				name: 'names',
				message: 'What are the workspaces you want to migrate?',
				choices: workspaces,

				validate: function (answer) {
					if (answer.length < 1) {
						return 'You must choose at least one workspace.';
					}
					return true;
				}
			},
		]
	}
};
