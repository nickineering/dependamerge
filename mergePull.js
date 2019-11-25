// Automatically merges dependabot pull requests if they are low risk.

const axios = require("axios");
const semver = require("semver");

// Arguments provided by CI
const pullRequestId = process.argv[2];
const pullRequestSlug = process.argv[3];
const githubToken = process.argv[4];

// Flag certain updates for manual review
const alwaysReviewRegex = /bump (react |react-dom |react-native |@types\/react |react-redux |@types\/react-test-renderer |react-test-renderer)/g;
const reviewRegex = /bump (expo|react-native-gesture-handler |react-native-svg |react-navigation |react-native-reanimated |lottie-react-native |typescript |react-native-view-shot )/g;

// Axios options
const pullRequestUrl = `https://api.github.com/repos/${pullRequestSlug}/pulls/${pullRequestId}`;
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
    .then(response => {
        const author = response.data.user.login;
        const title = response.data.title;

        // Ignore pull request if not by dependabot
        if (!author.includes("dependabot")) {
            console.log("Pull request was not authored by dependabot");
            process.exit(0);
        }

        // Ignore pull request if title is one known to cause problems
        if (title.match(alwaysReviewRegex)) {
            console.log("Dependency should be reviewed manually");
            process.exit(0);
        }

        // Ignore pull request if upgrade is not a patch and on review list
        if (title.match(reviewRegex)) {
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
