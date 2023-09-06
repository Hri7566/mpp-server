import YAML from "yaml";
import { readFileSync } from "fs";

export function loadConfig<T>(filepath: string, def: T) {
    try {
        const data = readFileSync(filepath).toString();
        const parsed = YAML.parse(data);

        return parsed as T || def;
    } catch (err) {
        console.error("Unable to load config:", err);
    } finally {
        return def;
    }
}
