// Helper functions

const semver = require("semver");
const settings = require("../../dependamerge.json");

const getCommitRegex = modules => new RegExp("bump (" + modules.join(" |") + " )", "g");
const isByDependabot = author => author.includes("dependabot");
const isNeverUpdate = title =>
    title.match(getCommitRegex(settings.neverUpdate)) !== null;
const isTooMajor = title => {
    if (title.match(getCommitRegex(settings.onlyUpdatePatches))) {
        const versions = title.match(/[0-9]+\.[0-9]+\.[0-9]+/g);
        const sameMajorVersion =
            semver.major(versions[0]) === semver.major(versions[1]);
        const sameMinorVersion =
            semver.minor(versions[0]) === semver.minor(versions[1]);
        return !sameMajorVersion || !sameMinorVersion;
    }
    return false;
};

exports.isByDependabot = isByDependabot;
exports.isNeverUpdate = isNeverUpdate;
exports.isTooMajor = isTooMajor;
