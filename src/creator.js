const program = require('commander');
const { prompt } = require('inquirer');
const { 
    createWorkspaces, 
    deleteWorkspaces, 
    migratesWorkspaces, 
    listAllWorkspacesNames,
	  dumpWorkspaces
} = require('IWAC-utils');

const questions = require('./config/questions');
const workspaces = require('./config/wks');
const yaml = require('js-yaml');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const lang = {
    'French': 'fr',
    'English': 'en',
    'German': 'de'
};

program
    .description('CLI to create Watson Assistant Workspaces')
    .version('1.1.0', '-v, --version');

program
    .command('create')
    .alias('c')
    .option('-y, --yml', 'Output yml format')
    .option('-a, --url <url>', 'Url of watson assistant')
    .option('-u, --username <username>', 'Username of watson assistant')
    .option('-p, --password <password>', 'Password of watson assistant')
    .option('-l, --languages <a>,<b>', 'Languages of workspaces', val => val.split(',').map(String))
    .option('-t, --types <a>,<b>', 'Types of workspaces', val => val.split(',').map(String))
    .description('Create Watson Assistant Workspaces')
    .action(async (options) => {
        try {
            const outputType = options.yml ? 'yml' : 'json';
            const url = options.url;
            const username = options.username;
            const password = options.password;
            const languages = options.languages;
            const types = options.types;
            const answers = {};

            if (url) {
                answers.url = url
            } else {
                const answer = await prompt(questions.create.url);
                answers.url = answer.url;
            }

            if (username) {
                answers.username = username
            } else {
                const answer = await prompt(questions.create.username);
                answers.username = answer.username;
            }

            if (password) {
                answers.password = password
            } else {
                const answer = await prompt(questions.create.password);
                answers.password = answer.password;
            }

            if (languages) {
                answers.languages = languages
            } else {
                const answer = await prompt(questions.create.languages);
                answers.languages = answer.languages;
            }

            if (types) {
                answers.types = types
            } else {
                const answer = await prompt(questions.create.types);
                answers.types = answer.types;
            }

            const _langs = answers.languages.map(l => lang[l]);
            const wks = workspaces.filter(w => _langs.includes(w.language) && answers.types.includes(w.type));

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
    .command('remove')
    .alias('r')
    .description('Remove all Watson Assistant Workspaces')
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

program
  .command('migrate')
  .alias('m')
  .description('Migrate Watson Assistant Workspaces')
  .action(async (options) => {
    try {
			const answersSource = await prompt(questions.listSourceWorkspaces);

			const listResponse = await listAllWorkspacesNames({
				url: answersSource.url,
				username: answersSource.username,
				password: answersSource.password
			});

			const workspacesNames = _.map(listResponse.workspaces, wk => wk.name);
			const selectedWorkspacesNames = await prompt(questions.migrate(workspacesNames));

			const selectedWorkspaces = _.reduce(selectedWorkspacesNames.names, (result, name) => {
				const wk = _.find(listResponse.workspaces, workspace => name === workspace.name);
				if (wk && !_.isUndefined(wk)) result.push(wk);
				return result;
			}, []);

			const answersDest = await prompt(questions.listDestWorkspaces);

			const watsonWks = await migratesWorkspaces({
				url: answersDest.url,
				username: answersDest.username,
				password: answersDest.password,
				assistantSource: listResponse.assistant,
				workspaces: selectedWorkspaces,
			});

			if (watsonWks && !_.isEmpty(watsonWks) && !watsonWks.every(_.isEmpty)) {
				console.log('Your workspace(s) were successfully migrated :) \nhere is/are the new workspace(s) :\n', watsonWks);
			} else {
				console.log('Oops, a problem occurred ! No workspaces were returned :/');
			}
    } catch (err) {
        console.error(err);
    }
  });

program
  .command('list')
  .alias('l')
  .option('-y, --yml', 'Output yml format')
  .description('List all Watson Assistant Workspaces')
  .action(async (options) => {
    try {
      const answers = await prompt(questions.listWorkspaces);
      const outputType = options.yml ? 'yml' : 'json';

      const listResponse = await listAllWorkspacesNames({
        url: answers.url,
        username: answers.username,
        password: answers.password
      });
      const workspaces = (_.get(listResponse, 'workspaces', []));
      switch (outputType) {
        case 'yml':
          console.log(yaml.dump({
            env: workspaces.map((obj) => {
              return {
                name: obj.name,
                value: obj.workspace_id,
              }
            })
          }));
          break;
        default:
          console.log(workspaces);
      }

    } catch (err) {
      console.error(err);
    }
  });

program
  .command('dump')
  .alias('d')
	.option('-o, --output-directory <path>', 'Specifies where to create dump files')
  .description('Download Watson Assistant Workspaces')
  .action(async (options) => {
    const outputDirectory = options.outputDirectory ? options.outputDirectory : '.';
    try {
			if (fs.existsSync(outputDirectory) && !fs.lstatSync(outputDirectory).isDirectory()) {
				console.error('Bad output directory');
			} else {
				if (!fs.existsSync(outputDirectory)) {
					fs.mkdirSync(outputDirectory);
				}

				const answers = await prompt(questions.listWorkspaces);
				const listResponse = await listAllWorkspacesNames({
					url: answers.url,
					username: answers.username,
					password: answers.password
				});
				const workspaces = (_.get(listResponse, 'workspaces', []));
				const dumps = await dumpWorkspaces({
					url: answers.url,
					username: answers.username,
					password: answers.password,
					workspaces
				});

				_.forEach(dumps, workspace => fs.writeFileSync(path.format({
					dir: outputDirectory,
					name: workspace.workspace_id,
					ext: '.json'
				}), JSON.stringify(workspace)));
			}
		} catch (e) {
      console.error('An error occurred');
      console.error(e);
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
