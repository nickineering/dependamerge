# Automatically merge Dependabot pull requests

Github includes an awesome feature called [Dependabot](https://dependabot.com/), which
automatically creates pull requests to update your outdated dependencies. Unfortunately,
as of this writing, it does not automatically merge those pull requests.

Behold, Dependamerge! Dependamerge lets you push Dependabot to its limits by
automatically merging all pull requests. You can run it only when your tests pass on
continuous integration, or, for the more adventurous, you could have it merge anything
no matter what. Importantly, it also allows you to blacklist pesky updates.

## Install

### Step 1:

```bash
npm install --save-dev dependamerge
```

### Step 2:

Create a `dependamerge.json` file in your project's root directory. It accepts the
following fields:

| Field             | Description                                                                                    | Type     | Required |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------- | -------- |
| githubUsername    | The project owner's Github username.                                                           | string   | Yes      |
| neverUpdate       | Dependencies that should never be automatically updated. Accepts regular expressions.          | string[] | No       |
| onlyUpdatePatches | Dependencies that should only have patches automatically updated. Accepts regular expressions. | string[] | No       |
| repoName          | The name of your project's Github repository.                                                  | string   | Yes      |

### Step 3:

Create a
[personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)
on Github that has access to your repository. Then add it as an environment variable in
your continuous integration software.

### Step 4:

Invoke Dependamerge after your continuous integration software successfully finishes
testing pull requests. Don't worry, it will ignore pull requests by users other than
Dependabot. Be sure to pass it the pull request's number and the Github token created in
step 3. On [Travis CI](https://travis-ci.com/) this is accomplished by adding the
following snippet to `travis.yml`.

```yml
after_success:
    - 'if [ $TRAVIS_PULL_REQUEST != "false" ]; then node
      node_modules/dependamerge/src/index.js $TRAVIS_PULL_REQUEST $GITHUB_TOKEN; fi'
```

### Step 5:

Perfect your origami skills with all that time you saved.

## A word of caution

Automatically updating your dependencies can easily introduce bugs without you noticing.
Ensure that you have strong test coverage before installing Dependamerge, or make
liberal use of the `neverUpdate` and the `onlyUpdatePatches` settings to avoid
accidentally introducing bugs.

## Contributing

Contributions would be much appreciated! Please open an issue to get started.
