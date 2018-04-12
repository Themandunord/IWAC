const program = require('commander');
const { prompt } = require('inquirer');
const { createWorkspaces } = require('./watson');

const lang = {
    'French': 'fr',
    'English': 'en',
    'German': 'de'
};

const workspaces = [
    {
        name: 'business-fr',
        type: 'Business',
        language: 'fr',
        description: 'Business French'
    },
    {
        name: 'business-en',
        type: 'Business',
        language: 'en',
        description: 'Business English'
    },
    {
        name: 'business-de',
        type: 'Business',
        language: 'de',
        description: 'Business German'
    },
    {
        name: 'synonyms-fr',
        type: 'Synonyms',
        language: 'fr',
        description: 'Synonyms French'
    },
    {
        name: 'synonyms-en',
        type: 'Synonyms',
        language: 'en',
        description: 'Synonyms English'
    },
    {
        name: 'synonyms-de',
        type: 'Synonyms',
        language: 'de',
        description: 'Synonyms German'
    },
    {
        name: 'definition-fr',
        type: 'Definition',
        language: 'fr',
        description: 'Definition French'
    },
    {
        name: 'definition-en',
        type: 'Definition',
        language: 'en',
        description: 'Definition English'
    },
    {
        name: 'definition-de',
        type: 'Definition',
        language: 'de',
        description: 'Definition German'
    },
    {
        name: 'kfold-fr',
        type: 'Kfold',
        language: 'fr',
        description: 'Kfold French'
    },
    {
        name: 'kfold-en',
        type: 'Kfold',
        language: 'en',
        description: 'Kfold English'
    },
    {
        name: 'kfold-de',
        type: 'Kfold',
        language: 'de',
        description: 'Kfold German'
    },
    {
        name: 'social-fr',
        type: 'Social',
        language: 'fr',
        description: 'Social French'
    },
    {
        name: 'social-en',
        type: 'Social',
        language: 'en',
        description: 'Social English'
    },
    {
        name: 'social-de',
        type: 'Social',
        language: 'de',
        description: 'Social German'
    },
];

const questions = [
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
        }
    },
    {
        type: 'input',
        name: 'password',
        message: 'Enter Watson password :',
        validate: function (input) {
            return input && input.length > 0;
        }
    },
    {
        type: 'checkbox',
        name: 'languages',
        message: 'Wich languages ?',
        choices: [
            'French',
            'English',
            'German',
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
    },
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
];

program
    .description('CLI to create Watson Assistant Workspaces')
    .version('1.0.0', '-v, --version')

program
    .command('create')
    .alias('c')
    .action(async () => {
        try {
            const answers = await prompt(questions);
            const _langs = answers.languages.map(l => lang[l]);
            const wks = workspaces.filter(w => _langs.includes(w.language) && answers.types.includes(w.type));
            await createWorkspaces({
                url: answers.url,
                username: answers.username,
                password: answers.password,
                workspaces: wks
            });
        }
        catch (err) {
            console.error(err);
        }
    });

program.parse(process.argv);

// Check the program.args obj
const NO_COMMAND_SPECIFIED = program.args.length === 0;

// Handle it however you like
if (NO_COMMAND_SPECIFIED) {
    // e.g. display usage
    program.help();
}