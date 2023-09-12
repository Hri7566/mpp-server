import YAML from "yaml";
import fs from "fs";

export function loadConfig<T>(filepath: string, def: T) {
    try {
        const data = fs.readFileSync(filepath).toString();
        const parsed = YAML.parse(data);
        return parsed as T;
    } catch (err) {
        console.error("Unable to load config:", err);
        return def;
    }
}
