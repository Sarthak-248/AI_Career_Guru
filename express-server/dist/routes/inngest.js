"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("inngest/express");
const client_1 = require("../lib/inngest/client");
const functions_1 = require("../lib/inngest/functions");
exports.default = (0, express_1.serve)({
    client: client_1.inngest,
    functions: [functions_1.generateIndustryInsights],
});
