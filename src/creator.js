const program = require('commander');
const { prompt } = require('inquirer');
const {
    createWorkspaces,
    deleteWorkspaces,
    migratesWorkspaces,
    listAllWorkspacesNames,
	  dumpWorkspaces
} = require('iwac-utils');
const ResourceGroupsService = require('./ResourceGroupsService');
const ResourceInstancesService = require('./ResourceInstancesService');
const questions = require('./config/questions');
const workspaces = require('./config/wks');
const yaml = require('js-yaml');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const lang = {
    'French': 'fr',
    'English': 'en',
    'German': 'de',
    'Dutch': 'nl'
};

program
    .description('CLI to create Watson Assistant Workspaces')
    .version('1.2.0', '-v, --version');

program
    .command('create')
    .alias('c')
    .option('-y, --yml', 'Output yml format')
    .option('-j, --json', 'Output json format')
    .option('-a, --url <url>', 'Url of watson assistant')
    .option('-u, --username <username>', 'Username of watson assistant')
    .option('-p, --password <password>', 'Password of watson assistant')
    .option('-l, --languages <a>,<b>', 'Languages of workspaces', val => val.split(',').map(String))
    .option('-t, --types <a>,<b>', 'Types of workspaces', val => val.split(',').map(String))
    .description('Create Watson Assistant Workspaces')
    .action(async (options) => {
        try {
            const outputType = options.yml ? 'yml' : options.json ? 'json' : 'array';
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
                    case 'json':
                            console.log(JSON.stringify(watsonWks.reduce((acc, wk) => {
                                    acc[wk.name] = wk;
                                    return acc;
                            }, {})));
                        break;
                    default:
                        console.log(watsonWks);
                }
            } else {
                console.error('Oops, a problem occurred ! No workspaces were returned :/')
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
	.option('--url-source <urlSource>', 'Source url')
	.option('--pwd-source <pwdSource>', 'Source password')
	.option('--user-source <userSource>', 'Source user')
	.option('--url-dest <urlDest>', 'Destination url')
	.option('--pwd-dest <pwdDest>', 'Destination Password')
	.option('--user-dest <userDest>', 'Destination user')
	.option('-a --all', 'Migrate all workspaces')
  .description('Migrate Watson Assistant Workspaces')
  .action(async (options) => {
    try {
			const urlSource = options.urlSource;
			const usernameSource = options.userSource;
			const passwordSource = options.pwdSource;

			const urlDest = options.urlDest;
			const usernameDest = options.userDest;
			const passwordDest = options.pwdDest;

			const shouldMigrateAll = options.all;

			const answersSource = {};

			if (urlSource) {
				answersSource.url = urlSource
			} else {
				const answer = await prompt(questions.listSourceWorkspaces.url);
				answersSource.url = answer.url;
			}

			if (usernameSource) {
				answersSource.username = usernameSource
			} else {
				const answer = await prompt(questions.listSourceWorkspaces.username);
				answersSource.username = answer.username;
			}

			if (passwordSource) {
				answersSource.password = passwordSource
			} else {
				const answer = await prompt(questions.listSourceWorkspaces.password);
				answersSource.password = answer.password;
			}

			const listResponse = await listAllWorkspacesNames({
				url: answersSource.url,
				username: answersSource.username,
				password: answersSource.password
			});

			const workspacesNames = _.map(listResponse.workspaces, wk => wk.name);
			let selectedWorkspacesNames = [];
			if (shouldMigrateAll) {
				selectedWorkspacesNames = { names: workspacesNames };
			} else {
				selectedWorkspacesNames = await prompt(questions.migrate(workspacesNames));
			}

			const selectedWorkspaces = _.reduce(selectedWorkspacesNames.names, (result, name) => {
				const wk = _.find(listResponse.workspaces, workspace => name === workspace.name);
				if (wk && !_.isUndefined(wk)) result.push(wk);
				return result;
			}, []);

			const answersDest = {};

			if (urlSource) {
				answersDest.url = urlDest
			} else {
				const answer = await prompt(questions.listDestWorkspaces.url);
				answersDest.url = answer.url;
			}

			if (usernameSource) {
				answersDest.username = usernameDest
			} else {
				const answer = await prompt(questions.listDestWorkspaces.username);
				answersDest.username = answer.username;
			}

			if (passwordSource) {
				answersDest.password = passwordDest
			} else {
				const answer = await prompt(questions.listDestWorkspaces.password);
				answersDest.password = answer.password;
			}

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
				console.error('Oops, a problem occurred ! No workspaces were returned :/');
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
	.option('-a, --url <url>', 'Url of watson assistant')
	.option('-u, --username <username>', 'Username of watson assistant')
	.option('-p, --password <password>', 'Password of watson assistant')
  .description('Download Watson Assistant Workspaces')
  .action(async (options) => {
		const outputDirectory = options.outputDirectory ? options.outputDirectory : '.';
		const url = options.url;
		const username = options.username;
		const password = options.password;
		const answers = {};

    try {
			if (fs.existsSync(outputDirectory) && !fs.lstatSync(outputDirectory).isDirectory()) {
				console.error('Bad output directory');
			} else {
				if (!fs.existsSync(outputDirectory)) {
					fs.mkdirSync(outputDirectory);
				}

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

program
	.command('listResourceGroups')
	.alias('lrg')
	.option('-k, --apikey <apikey>', 'Specifies the platform api')
	.description('List all resource groups which can be used by the key')
	.action(async (options) => {
		const apikey = options.apikey;
		const params = {};
		try {

			if (apikey) {
				params.iam_apikey = apikey;
			} else {
				const answer = await prompt(questions.iam.apikey);
				params.iam_apikey = answer.apikey;
			}

			const service = new ResourceGroupsService(params);
			service.list({}, (err, resources) => {
				if (err) {
					return console.log(err);
				} // else
				console.log((resources && resources.resources || []).map(resource => ({
				  id: resource.id,
					name: resource.name,
				})));
			});
		} catch (error) {
			console.error('An error occurred');
			console.error(error);
		}
	});

program
	.command('listResourceInstances')
	.alias('lri')
	.option('-k, --apikey <apikey>', 'Specifies the platform api')
	.description('List all resource instances which can be used by the key')
	.action(async (options) => {
		const apikey = options.apikey;
		const _options = {};
		try {

			if (apikey) {
				_options.iam_apikey = apikey;
			} else {
				const answer = await prompt(questions.iam.apikey);
				_options.iam_apikey = answer.apikey;
			}

			const service = new ResourceInstancesService(_options);
			service.list({}, (err, results) => {
				if (err) {
					return console.log(err);
				} // else
				console.log((results.resources || []).map(instance => ({
					id: instance.id,
					guid: instance.guid,
					name: instance.name,
					resource_plan_id: instance.resource_plan_id,
					resource_group_id: instance.resource_group_id,
					resource_group_crn: instance.resource_group_crn,
				})));
			});
		} catch (error) {
			console.error('An error occurred');
			console.error(error);
		}
	});

program
	.command('createResourceInstance')
	.alias('cri')
	.option('-k, --apikey <apikey>', 'Specifies the platform api')
	.option('-n, --name <name>', 'Specifies the name of the resource to create')
	.option('-t, --target <target>', 'Specifies the target of the resource to create')
	.option('-g, --resource_group <resource_group>', 'Specifies the resource group of the resource to create')
	.option('-p, --resource_plan_id <resource_plan_id>', 'Specifies the plan id of the resource to create')
	.description('Create a resource instance')
	.action(async (options) => {
		const _options = {};
		const apikey = options.apikey;

		const name = options.name;
		const target = options.target || 'eu-de';
		const resource_group = options.resource_group;
		const resource_plan_id = options.resource_plan_id || "d9c80e46-3195-11e6-a92b-54ee7514918e";
		const params = {
			name,
			target,
			resource_group,
			resource_plan_id
		};
		try {
			if (apikey) {
				_options.iam_apikey = apikey;
			} else {
				const answer = await prompt(questions.iam.apikey);
				_options.iam_apikey = answer.apikey;
			}

			if (!name) {
				const answer = await prompt(questions.createResourceInstance.name);
				params.name = answer.name;
			}

			if (!resource_group) {
				const answer = await prompt(questions.createResourceInstance.resource_group);
				params.resource_group = answer.resource_group;
			}

			const service = new ResourceInstancesService(_options);
			service.createInstance(params, (err, resource) => {
				if (err) {
					return console.log(err);
				} // else
				service.listResourceKeys({
					resource_id: resource.resource_id,
				}, (err, results) => {
					console.log({
						id: resource.id,
						guid: resource.id,
						name: resource.name,
						region_id: resource.region_id,
						resource_plan_id: resource.resource_plan_id,
					  resource_group_id: resource.resource_group_id,
						resource_group_crn: resource.resource_group_crn,
						type: resource.type,
						credentials: (results.resources || []).map(resourceKey => resourceKey.credentials ),
					});
				});
			});
		} catch (error) {
			console.error('An error occurred');
			console.error(error);
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
