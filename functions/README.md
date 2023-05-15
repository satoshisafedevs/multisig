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
