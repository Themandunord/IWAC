const Assistant = require('watson-developer-cloud/assistant/v1');
const _ = require('lodash');

async function getWorkspaces({
  url = 'https://gateway.watsonplatform.net/assistant/api/',
  username,
  password,
  version = '2018-02-16',
}) {
  const assistant = getAssistant({
    username: "e42ec7bf-c42a-4c3e-b897-8f254eed7d64",
    password: "6YD8P2ddsIBp",
    url: "https://gateway-fra.watsonplatform.net/conversation/api",
    version
  });

  const workspaces = await assistant.listWorkspaces({ assistant });
  return await Promise.all(workspaces.map((wks) => {
    console.log(wks);
    return workspaces;
  });
}

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

async function migrateWorkspace({assistant, workspace_id, name, description, language}) {

    return getWorkspaceAndData({assistant, workspace_id})
        .then(response => {
            return createWorkspaceWithData({
                assistant,
                name,
                description,
                language,
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

async function migratesWorkspaces({assistant, workspaces, stage}) {
    if (!workspaces || workspaces.length < 1) {
        return;
    }

    return await Promise.all(workspaces.map(async (wks) => {
        try{
            return await migrateWorkspace({
                assistant,
                name: wks.name + stage,
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
