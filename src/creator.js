const program = require('commander');
const { prompt } = require('inquirer');
const { createWorkspaces } = require('./watson');
const questions = require('./config/questions');
const workspaces = require('./config/wks');

const lang = {
    'French': 'fr',
    'English': 'en',
    'German': 'de'
};

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
            console.log('Your workspaces were successfully created :)')
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