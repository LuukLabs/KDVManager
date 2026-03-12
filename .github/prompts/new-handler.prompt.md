---
description: "Add a new command or query handler to an existing entity following Clean Architecture conventions"
agent: "agent"
argument-hint: "Action and entity (e.g., 'GetPhoneList for Children in CRM')"
---
Add a new command or query handler to the specified entity. Follow project conventions:

1. Create the feature folder: `Application/Features/{Entity}/Commands/{Action}/` or `Queries/{Action}/`
2. Create the request class (`{Action}Command.cs` or `{Action}Query.cs`)
3. For commands: create `{Action}CommandValidator.cs` with FluentValidation rules
4. Create the handler (`{Action}CommandHandler.cs` or `{Action}QueryHandler.cs`) with `Handle()` method
5. For queries: create a view model `{Action}VM.cs` if returning projected data
6. Register the handler in DI
7. Add the API endpoint (Minimal API for CRM, Controller for Scheduling)
8. For commands that change state: publish a domain event via MassTransit `IPublishEndpoint`

Look at existing handlers in the same entity folder for reference patterns.
