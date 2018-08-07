const Assistant = require('watson-developer-cloud/assistant/v1');
const _ = require('lodash');

async function createWorkspaces({
    url = 'https://gateway.watsonplatform.net/assistant/api/',
    username,
    password,
    version = '2018-02-16',
    workspaces
}) {
    if (!workspaces || (workspaces && !workspaces.length)) {
        return;
    }

    const assistant = getAssistant({
        username,
        password,
        url,
        version
    });

    return await Promise.all(workspaces.map(async (wks) => {
        try {
            return await createWorkspace({
                assistant,
                name: wks.name,
                description: wks.description || '',
                language: wks.language || 'en'
            })
        } catch (err) {
            console.err(err)
        }
    }));
}

async function deleteWorkspaces({
    url = 'https://gateway.watsonplatform.net/assistant/api/',
    username,
    password,
    version = '2018-02-16',
}) {
    const assistant = getAssistant({
        username,
        password,
        url,
        version
    });

    const workspaces = await listWorkspaces({ assistant });

    await Promise.all(workspaces.map(async (wks) => {
        try {
            await deleteWorkspace({
                assistant,
                id: wks.workspace_id
            })
        } catch (err) {
            console.err(err)
        }
    }));
}


async function createWorkspace({ assistant, name, description, language }) {
    return new Promise((resolve, reject) => {
        const workspace = { name, description, language };

        assistant.createWorkspace(workspace, function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            }

            return resolve(response);
        });
    });
}

async function listWorkspaces({ assistant }) {
    return new Promise((resolve, reject) => {
        assistant.listWorkspaces(function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            } else {
                return resolve(response.workspaces);
            }
        });
    });
}

async function deleteWorkspace({ assistant, id }) {
    return new Promise((resolve, reject) => {
        assistant.deleteWorkspace({ workspace_id: id }, function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            } else {
                return resolve(response.workspaces);
            }
        });
    });
}

function getAssistant({
    username,
    password,
    url,
    version
}) {
    return assistant = new Assistant({
        username,
        password,
        url,
        version
    });
}

async function getWorkspaceAndData({ assistant, workspace_id }){
    return new Promise((resolve, reject) => {
        assistant.getWorkspace({ workspace_id, export: true }, function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            } else {
                return resolve(response);
            }
        });
    });
}

async function createWorkspaceWithData({ assistant, name, description, language, intents = null, entities = null, dialog_nodes = null, counterexamples = null }) {
    return new Promise((resolve, reject) => {
        const workspace = { name, description, language };
        intents ? _.set(workspace, 'intents', intents) : null;
        entities ? _.set(workspace, 'entities', entities) : null;
        dialog_nodes ? _.set(workspace, 'dialog_nodes', dialog_nodes) : null;
        counterexamples ? _.set(workspace, 'counterexamples', counterexamples) : null;

        assistant.createWorkspace(workspace, function (err, response) {
            if (err) {
                console.error(err);
                return reject(err);
            }

            return resolve(response);
        });
    });
}

async function migrateWorkspace({assistantDest, assistantSource, workspace_id, name, description, language}) {

    return getWorkspaceAndData({assistant: assistantSource, workspace_id})
        .then(response => {
            return createWorkspaceWithData({
                name,
                description,
                language,
                assistant: assistantDest,
                intents: _.get(response, 'intents', null),
                entities: _.get(response, 'entities', null),
                dialog_nodes: _.get(response, 'dialog_nodes', null),
                counterexamples: _.get(response, 'counterexamples', null)
            })
        })
}

async function listAllWorkspacesNames({
    url = 'https://gateway.watsonplatform.net/assistant/api/',
    username,
    password,
    version = '2018-02-16' }){

    const assistant = getAssistant({
        username,
        password,
        url,
        version
    });

    return await listWorkspaces({assistant})
        .then(res => {
            return {workspaces : res, assistant}
        })

}

async function migratesWorkspaces({assistantSource, url, username, password, version = '2018-02-16', workspaces, stage}) {
    if (!workspaces || workspaces.length < 1) {
        return;
    }

    const assistantDest = getAssistant({
        username,
        password,
        url,
        version
    });

    return await Promise.all(workspaces.map(async (wks) => {
        try{
            return await migrateWorkspace({
                assistantDest,
                assistantSource,
                name: wks.name,
                workspace_id: wks.workspace_id,
                description: wks.description || '',
                language: wks.language || 'en'
            })
        } catch (err) {
            console.error(err)
        }
    }));
}

module.exports = {
    createWorkspaces,
    deleteWorkspaces,
    migratesWorkspaces,
    listAllWorkspacesNames
};
