## Deploying

To deploy functions manually from cli create a file - `functions/.env` with the following env variables:

```
OPENAI_KEY=VALUE_FROM_GITLAB_VARIABLES
TWILIO_ACCOUNT_SID=VALUE_FROM_GITLAB_VARIABLES
TWILIO_AUTH_TOKEN=VALUE_FROM_GITLAB_VARIABLES
TWILIO_NUMBER=VALUE_FROM_GITLAB_VARIABLES
TYPEFORM_SECRET=VALUE_FROM_GITLAB_VARIABLES
```

Deploy command example cli:
`GOOGLE_APPLICATION_CREDENTIALS=/PATH_TO_KEY/serviceAccountKey.json firebase deploy --only functions --project playground`

Service key can be found in GitLab CI/CD variables.

To deploy a particular function provide its name: `functions:functionName`.

## VS Code

If you want to throw debuggers into the node code and run it locally, use the following launch.json file:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Mocha Tests",
            "program": "${workspaceFolder}/functions/node_modules/mocha/bin/_mocha",
            "args": [
                "-u",
                "bdd",
                "--timeout",
                "999999",
                "--colors",
                "${workspaceFolder}/functions/src/**/*.test.js"
            ],
            "internalConsoleOptions": "openOnSessionStart",
            "envFile": "${workspaceFolder}/functions/.env"
        },
                {
            "type": "node",
            "request": "launch",
            "name": "Mocha Current File",
            "program": "${workspaceFolder}/functions/node_modules/mocha/bin/_mocha",
            "args": [
                "-u",
                "bdd",
                "--timeout",
                "999999",
                "--colors",
                "${file}"
            ],
            "internalConsoleOptions": "openOnSessionStart",
            "envFile": "${workspaceFolder}/functions/.env"
        },
        {
            "type": "node",
            "request": "attach",
            "name": "Attach to Firebase Functions",
            "port": 9229,
            "timeout": 30000,
            "restart": true,
            "sourceMaps": true,
            "outFiles": ["${workspaceFolder}/functions/lib/**/*.js"],
            "cwd": "${workspaceFolder}/functions",
            "skipFiles": ["<node_internals>/**"]
        }
    ]
}
```
