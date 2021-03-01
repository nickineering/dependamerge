// Automatically merges Dependabot pull requests if they are low risk

const axios = require("axios");
const settings = require("../../../dependamerge.json");

const isByDependabot = require("./helpers").isByDependabot;
const isNeverUpdate = require("./helpers").isNeverUpdate;
const isTooMajor = require("./helpers").isTooMajor;

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

// Check contents of pull request via the Github API
axios
    .get(pullRequestUrl, options)
    .then((response) => {
        const author = response.data.user.login;
        const title = response.data.title;

        // Ignore pull request if not by Dependabot
        if (!isByDependabot(author)) {
            console.log("Pull request was not authored by dependabot");
            process.exit(0);
        }

        // Ignore pull request if title is one known to cause problems
        if (isNeverUpdate(title)) {
            console.log("Dependency should be reviewed manually");
            process.exit(0);
        }

        // Ignore pull request if upgrade is not a patch and on review list
        if (isTooMajor(title)) {
            console.log(
                "Dependency should be reviewed manually because it is not a patch",
            );
            process.exit(0);
        }

        // Since script has not exited it is safe to merge
        axios
            .put(pullRequestUrl + "/merge", mergeInput, options)
            .then(() => {
                console.log("Pull request merged successfully");
            })
            .catch((error) => {
                console.error("Error merging pull request: " + error.message);
                process.exit(1);
            });
    })
    .catch((error) => {
        console.error("Error fetching pull request: " + error.message);
        process.exit(1);
    });
