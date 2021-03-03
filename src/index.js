#!/usr/bin/env node

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
        "content-type": "application/json",
        "User-Agent": "node/https",
        Authorization: `token ${githubToken}`,
    },
};
const mergeInput = {merge_method: "rebase"};

const displayPrettyError = (error, errorCategory, errorHelpText) => {
    console.error(errorCategory + ": " + error.message);
    if (error.response?.data?.message) {
        console.log(error.response.data.message);
        console.log("More information: " + error.response.data?.documentation_url);
    }
    console.log(errorHelpText);
    process.exit(1);
};

// Check contents of pull request via the Github API
axios
    .get(pullRequestUrl, options)
    .then((response) => {
        const author = response.data.user.login;
        const title = response.data.title;

        // Ignore pull request if not by Dependabot
        if (!isByDependabot(author)) {
            console.log("Not merged: Pull request was not authored by dependabot.");
            process.exit(0);
        }

        // Ignore pull request if title is one known to cause problems
        if (isNeverUpdate(title)) {
            console.log(
                "Not merged: Dependency should be reviewed manually because it is set to never update.",
            );
            process.exit(0);
        }

        // Ignore pull request if upgrade is not a patch and on review list
        if (isTooMajor(title)) {
            console.log(
                "Not merged: Dependency should be reviewed manually because it is not a patch.",
            );
            process.exit(0);
        }

        // Since script has not exited it is safe to merge
        axios
            .put(pullRequestUrl + "/merge", mergeInput, options)
            .then(() => {
                console.log("Pull request merged successfully.");
            })
            .catch((error) => {
                displayPrettyError(
                    error,
                    "Error merging pull request",
                    "Are you sure the pull request number you provided is correct and the Github token you provided has merge permission?",
                );
            });
    })
    .catch((error) => {
        displayPrettyError(
            error,
            "Error fetching pull request",
            "Are you sure you provided a valid pull request number and Github token?",
        );
    });
