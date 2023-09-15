# Contributing guide

## Code style

- Variables, functions and filenames should be `lowerCamelCase`
- Global constants should be `CONSTANT_CASE`
- Don't use `var` keyword in TypeScript, always use `let` or `const`
- Always use string templates (```const greeting = `Hello ${name}!`;```) instead of (`const greeting = 'Hello ' + name + '!';`)
- Other code style rules are enforced by ESLint and prettier (see `.eslintrc.json` and `.prettierrc` for details)
  - Make sure to install [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extensions in VSCode

## Commits

- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), mainly `feat`, `docs`, `fix`.
- Short and precise messages
- Commit often

## Workflow

#### Summary

1. Create a new feature branch for every issue, based on the `develop` branch, with branch name `<id>-issue-title` (there is a "create branch" button on each issue to easily do this).
2. Create a pull request to `develop` when the branch is ready for code review (CR) and merge it only when it is approved by at least one reviewer.
3. At the end of a sprint, the `develop` branch will be merged to `main` and a release will be created

#### Issues

- Should have a description that explains everything necessary to start working on it. Think "how can I explain this issue such that other group members understand what to do" or "... such that I know what to do in 2 weeks from now".
- Add relevant labels
  - `feature`: new functionality for the product or development process
  - `documentation`
  - `bug`
  - `research`: indicates that research is necessary to solve the issue, e.g. read documentation, experiment, etc.
- Assign a priority and size to the issue from one of the existing labels
- Issues should be assigned to a developer before work begins on it. It should then move to the **In progress** column in the Kanban board.
- When issues are ready for review, they should be moved to the **In review** column, and be assigned reviewer(s) on its pull request.
- After the pull request is merged to `develop`, the issue can move to **Done**.
- If an issue cannot be solved because it depends on another issue being solved first, move it to the **Blocked** column, and indicate in the issue description which issue is blocking it
- The **Ready** column should be used for issues that are a part of the current sprint, but have not been started yet

#### Branches

- Try to keep branches small (preferably less than 200 lines changed)
- Always create a pull request before merging the branch to `develop`, and never pull request directly to `main` from a feature branch

#### Code review

- Every pull request that contains code changes needs to be code reviewed and accepted by at least one other member
- The reviewer should add comments on the pull request and reference code snippets to detail what needs to be fixed to approve the PR.
