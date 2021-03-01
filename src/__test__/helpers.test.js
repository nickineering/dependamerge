#!/usr/bin/env node

const isByDependabot = require("../helpers").isByDependabot;
const isNeverUpdate = require("../helpers").isNeverUpdate;
const isTooMajor = require("../helpers").isTooMajor;

jest.mock(
    "../../../../dependamerge.json",
    () => require("../../dependamerge-example.json"),
    {
        virtual: true,
    },
);

describe("isByDependabot", () => {
    const authorAllowed = "Nicholas Ferrara";
    const authorDisallowed = "dependabot-preview";

    it("to correctly return false ", async () => {
        const result = isByDependabot(authorAllowed);
        expect(result).toEqual(false);
    });
    it("to correctly return true ", async () => {
        const result = isByDependabot(authorDisallowed);
        expect(result).toEqual(true);
    });
});

describe("isNeverUpdate", () => {
    const titleAllowed = "chore(deps-dev): bump moment from 1.0.0 to 2.1.1";
    const titleMajor = "chore(deps-dev): bump react from 1.0.0 to 2.0.0";
    const titlePatch = "chore(deps-dev): bump react from 1.0.0 to 1.0.1";

    it("to correctly return true for a major update ", async () => {
        const result = isNeverUpdate(titleMajor);
        expect(result).toEqual(true);
    });
    it("to correctly return true for a patch update", async () => {
        const result = isNeverUpdate(titlePatch);
        expect(result).toEqual(true);
    });
    it("to correctly return false ", async () => {
        const result = isNeverUpdate(titleAllowed);
        expect(result).toEqual(false);
    });
});

describe("isTooMajor * regex", () => {
    const titleAllowed = "chore(deps-dev): bump moment from 1.0.0 to 2.1.1";
    const titleMajor = "chore(deps-dev): bump expo-svg from 1.0.0 to 2.0.0";
    const titlePatch = "chore(deps-dev): bump expo-svg from 1.0.0 to 1.0.1";

    it("to correctly return true for a major update ", async () => {
        const result = isTooMajor(titleMajor);
        expect(result).toEqual(true);
    });
    it("to correctly return false for a patch update", async () => {
        const result = isTooMajor(titlePatch);
        expect(result).toEqual(false);
    });
    it("to correctly return false", async () => {
        const result = isTooMajor(titleAllowed);
        expect(result).toEqual(false);
    });
});

describe("isTooMajor not affected update", () => {
    const titleAllowed = "chore(deps-dev): bump moment from 1.0.0 to 2.1.1";
    const titleMajor =
        "chore(deps-dev): bump react-navigation-stack from 1.0.0 to 2.0.0";
    const titlePatch =
        "chore(deps-dev): bump react-navigation-stack from 1.0.0 to 1.0.1";

    it("to correctly return false for a major update ", async () => {
        const result = isTooMajor(titleMajor);
        expect(result).toEqual(false);
    });
    it("to correctly return false for a patch update", async () => {
        const result = isTooMajor(titlePatch);
        expect(result).toEqual(false);
    });
    it("to correctly return false", async () => {
        const result = isTooMajor(titleAllowed);
        expect(result).toEqual(false);
    });
});
