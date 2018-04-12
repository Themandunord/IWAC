const Assistant = require('watson-developer-cloud/assistant/v1');


async function createWorkspaces({
    url = 'https://gateway.watsonplatform.net/assistant/api/',
    username,
    password,
    version = '2018-02-16',
    workspaces
}) 
{
    if(!workspaces || (workspaces && !workspaces.length)){
        return;
    }
    
    const assistant = new Assistant({
        username,
        password,
        url,
        version
    });



    // await Promise.all(workspaces.map(async (wks) => {
    //     console.log(wks)
    //     await createWorkspace({
    //         assistant,
    //         name: wks.name,
    //         description: wks.description || '',
    //         language: wks.language || 'en'
    //     })
    // }));
}

async function createWorkspace({ assistant, name, description}) {
    return new Promise((resolve, reject) => {
        const workspace = { name, description };

        assistant.createWorkspace(workspace, function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            } else {
                console.log(JSON.stringify(response, null, 2));
                return resolve(response);
            }
        });
    });
}

module.exports = {
    createWorkspaces,
    createWorkspace
}