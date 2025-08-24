# Contributing to optisharp

Thank you for considering contributing to optisharp! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others when participating in our community.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers understand your report, reproduce the issue, and find related reports.

Before creating bug reports, please check [this list](#before-submitting-a-bug-report) as you might find out that you don't need to create one. When you are creating a bug report, please [include as many details as possible](#how-do-i-submit-a-good-bug-report).

#### Before Submitting A Bug Report

* **Perform a [search](https://github.com/deepakness/optisharp/issues)** to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one.
* **Check if the issue is related to Sharp itself**. If your issue is with the underlying Sharp library functionality, it may be better to [report it to Sharp directly](https://github.com/lovell/sharp/issues).

#### How Do I Submit A (Good) Bug Report?

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots or animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.
* **Include details about your configuration and environment**:
  * Which version of Node.js are you using?
  * What's the name and version of the OS you're using?
  * Any other relevant details about your computing environment.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

#### Before Submitting An Enhancement Suggestion

* **Check if the enhancement is already available**. You might not be aware of it if you haven't explored all the options in the configuration.
* **Perform a [search](https://github.com/yourusername/sharp-optimize/issues)** to see if the enhancement has already been suggested. If it has, add a comment to the existing issue instead of opening a new one.

#### How Do I Submit A (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/). Create an issue and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps** or point to similar features in other projects.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots or animated GIFs** which help you demonstrate the steps or point out what the suggestion is related to.
* **Explain why this enhancement would be useful** to most optisharp users.
* **Specify which version of Node.js and Sharp you're using.**
* **Specify the name and version of the OS you're using.**

### Pull Requests

The process described here has several goals:

- Maintain optisharp's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible tool
- Enable a sustainable system for the maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. **Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)**
2. **Follow the [styleguides](#styleguides)**
3. **After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing**

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * ⚡️ `:zap:` when improving performance
    * 🔥 `:fire:` when removing code or files
    * 🐛 `:bug:` when fixing a bug
    * ✨ `:sparkles:` when adding a new feature

### JavaScript Styleguide

* Prefer const over let or var when the variable is not going to be reassigned
* Use descriptive variable names - be explicit rather than terse
* Use camelCase for variable names and functions
* Include JSDoc comments for all functions and complex code sections
* Follow the general style found in the project code

## Additional Notes

### Issue and Pull Request Labels

This section lists the labels we use to help us track and manage issues and pull requests.

* `bug` - Issues confirmed as bugs or pull requests that fix bugs
* `documentation` - Issues or pull requests for improving or updating documentation
* `enhancement` - Issues suggesting enhancements or pull requests implementing new features or enhancements
* `good first issue` - Issues which are good for beginners
* `help wanted` - Issues where we need or would like help from the community
* `question` - Requests for information that aren't necessarily bugs or enhancements

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 