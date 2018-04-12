const program = require('commander');

const { createWorkspaces } = require('./watson');

const workspaces = [{
    name: 'business-fr',
    language: 'fr',
    description: 'Business French'
},
    // {
    //     name: 'business-en',
    //     language: 'en',
    //     description: 'Business English'    
    // },
    // {
    //     name: 'business-de',
    //     language: 'de',
    //     description: 'Business German'    
    // }
];

program
    .version('1.0.0')

program
    .command('create')
    .alias('c')
    .action(async () => {
        try {
            await createWorkspaces({
                url: "https://gateway.watsonplatform.net/assistant/api",
                username: "77efea60-a92e-4a7c-979c-7ae4af3f0042",
                password: "BkANQkhV6z5P",
                workspaces
            });
        }
        catch (err) {
            console.error(err);
        }
    });

program.parse(process.argv);