"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = require("fs");
function loadConfig(filepath, def) {
    try {
        const data = (0, fs_1.readFileSync)(filepath).toString();
        const parsed = yaml_1.default.parse(data);
        return parsed || def;
    }
    catch (err) {
        console.error("Unable to load config:", err);
    }
    finally {
        return def;
    }
}
exports.loadConfig = loadConfig;
