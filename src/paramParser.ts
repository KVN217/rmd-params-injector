import * as yaml from 'js-yaml';

export interface RmdParams {
    [key: string]: any;
}

export interface ParsedFrontMatter {
    params: RmdParams | null;
    title: string | null;
}

/**
 * Extracts the YAML front matter from an .Rmd / .qmd file's text content
 */
export function parseFrontMatter(content: string): ParsedFrontMatter {
    // Match the --- ... --- YAML block at the top of the file
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match) {
        return { params: null, title: null };
    }

    try {
        const frontMatter = yaml.load(match[1]) as any;

        // Params can be defined in two ways in R Markdown:
        //   params:
        //     region: "North"          ← simple value
        //     threshold:               ← value with label/input type
        //       label: "Threshold"
        //       value: 100
        const rawParams = frontMatter?.params ?? null;
        const resolvedParams = rawParams
            ? resolveParams(rawParams)
            : null;

        return {
            params: resolvedParams,
            title: frontMatter?.title ?? null,
        };
    } catch (e) {
        console.error('[RMD Params] Failed to parse YAML front matter:', e);
        return { params: null, title: null };
    }
}

/**
 * Resolves both simple and complex param formats:
 *   simple:  region: "North"
 *   complex: threshold: { label: "...", value: 100 }
 */
function resolveParams(rawParams: Record<string, any>): RmdParams {
    const resolved: RmdParams = {};

    for (const [key, val] of Object.entries(rawParams)) {
        if (
            val !== null &&
            typeof val === 'object' &&
            !Array.isArray(val) &&
            'value' in val
        ) {
            // Complex format — extract the value field
            resolved[key] = val.value;
        } else {
            resolved[key] = val;
        }
    }

    return resolved;
}