const program = require('commander');
const { prompt } = require('inquirer');
const { createWorkspaces, deleteWorkspaces } = require('./watson');
const questions = require('./config/questions');
const workspaces = require('./config/wks');
const yaml = require('js-yaml');
const _ = require('lodash');

const lang = {
    'French': 'fr',
    'English': 'en',
    'German': 'de'
};

program
    .description('CLI to create Watson Assistant Workspaces')
    .version('1.0.4', '-v, --version');

program
    .command('create')
    .alias('c')
    .option('-y, --yml', 'Output yml format')
    .description('Create Watson Assistant Workspaces')
    .action(async (options) => {
        try {
            const answers = await prompt(questions.create);
            const _langs = answers.languages.map(l => lang[l]);
            const wks = workspaces.filter(w => _langs.includes(w.language) && answers.types.includes(w.type));
            const outputType = options.yml ? 'yml' : 'json';
            const watsonWks = await createWorkspaces({
                url: answers.url,
                username: answers.username,
                password: answers.password,
                workspaces: wks
            });

            if (watsonWks && !_.isEmpty(watsonWks) && !watsonWks.every(_.isEmpty)) {
                switch (outputType) {
                    case 'yml':
                        console.log(yaml.dump({
                            env : watsonWks.map((obj) => {
                                return {
                                    name: _.get(_.find(workspaces, { name: obj.name }), 'varName'),
                                    value: obj.workspace_id,
                                }
                            })
                        }));
                        break;
                    default:
                        console.log(watsonWks);
                    console.log('Your workspaces were successfully created :)');
                }
            } else {
                console.log('Oops, a problem occurred ! No workspaces were returned :/')
            }
        }
        catch (err) {
            console.error(err);
        }
    });
   
program
    .command('delete')
    .alias('d')
    .description('Delete all Watson Assistant Workspaces')   
    .action(async () => {
        const answers = await prompt(questions.delete);
        try {
            await deleteWorkspaces({
                url: answers.url,
                username: answers.username,
                password: answers.password,
            });
            console.log('Your workspaces were successfully deleted :)')
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