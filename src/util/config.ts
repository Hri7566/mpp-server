import { existsSync, readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";
import { z } from "zod";

/**
 * Load a YAML config file and set default values if config path is nonexistent
 *
 * Usage:
 * ```ts
 * const config = loadConfig("config/services.yml", {
 *     enableMPP: false
 * });
 * ```
 * @param configPath Path to load config from
 * @param defaultConfig Config to use if none is present (will save to path if used)
 * @returns Parsed YAML config
 */
export function loadConfig<T>(configPath: string, defaultConfig: T): T {
    // Config exists?
    if (existsSync(configPath)) {
        // Load config
        const data = readFileSync(configPath);
        const config = parse(data.toString());

        const defRecord = defaultConfig as Record<string, any>;
        let changed = false;

        function mix(
            obj: Record<string, unknown>,
            obj2: Record<string, unknown>
        ) {
            for (const key of Object.keys(obj2)) {
                if (typeof obj[key] == "undefined") {
                    obj[key] = obj2[key];
                    changed = true;
                }

                if (typeof obj[key] == "object" && !Array.isArray(obj[key])) {
                    mix(
                        obj[key] as Record<string, unknown>,
                        obj2[key] as Record<string, unknown>
                    );
                }
            }
        }

        // Apply any missing default values
        mix(config, defRecord);

        // Save config if modified
        if (changed) writeConfig(configPath, config);

        return config as T;
    } else {
        // Write default config to disk and use that
        writeConfig(configPath, defaultConfig);
        return defaultConfig as T;
    }
}

/**
 * Write a YAML config to disk
 * @param configPath
 * @param config
 */
export function writeConfig<T>(configPath: string, config: T) {
    writeFileSync(
        configPath,
        stringify(config, {
            indent: 4
        })
    );
}
