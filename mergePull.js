// Automatically merges dependabot pull requests if they are low risk.

const axios = require("axios");
const semver = require("semver");
const settings = require("../../dependamerge.json");

// Arguments provided by CI
const pullRequestId = process.argv[2];
const githubToken = process.argv[3];

// Axios options
const pullRequestUrl = `https://api.github.com/repos/${settings.githubUsername}/${settings.repoName}/pulls/${pullRequestId}`;
const options = {
    headers: {
        "User-Agent": "node/https",
        Authorization: `token ${githubToken}`,
    },
};
const mergeInput = {merge_method: "rebase"};

const getCommitRegex = modules =>
    new RegExp("bumps (" + modules.join(" |") + " )", "g");

// Check contents of pull request via the Github API
axios
    .get(pullRequestUrl, options)
    .then(response => {
        const author = response.data.user.login;
        const title = response.data.title;

        // Ignore pull request if not by dependabot
        if (!author.includes("dependabot")) {
            console.log("Pull request was not authored by dependabot");
            process.exit(0);
        }

        // Ignore pull request if title is one known to cause problems
        if (title.match(getCommitRegex(settings.neverUpdate))) {
            console.log("Dependency should be reviewed manually");
            process.exit(0);
        }

        // Ignore pull request if upgrade is not a patch and on review list
        if (title.match(getCommitRegex(settings.onlyUpdatePatches))) {
            const versions = title.match(/[0-9]+\.[0-9]+\.[0-9]+/g);
            const sameMajorVersion =
                semver.major(versions[0]) === semver.major(versions[1]);
            const sameMinorVersion =
                semver.minor(versions[0]) === semver.minor(versions[1]);
            if (!sameMajorVersion || !sameMinorVersion) {
                console.log(
                    "Dependency should be reviewed manually because it is not a patch",
                );
                process.exit(0);
            }
        }

        // Since script has not exited it is safe to merge
        axios
            .put(pullRequestUrl + "/merge", mergeInput, options)
            .then(response => {
                console.log("Pull request merged successfully");
            })
            .catch(err => {
                console.error("Error: " + err.message);
            });
    })
    .catch(err => {
        console.error("Error: " + err.message);
    });
