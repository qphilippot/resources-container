import { generateClassesMetadata } from "./generate-classes-metadata";
import { resolve } from "path";

const mupath = resolve(__dirname, '../test/reflexivity/generate-classes-metadata/fixtures/a/classes');
const classesMetadata = generateClassesMetadata({
    path: mupath,
    debug: true,
    aliasRules: [
        {
            replace: mupath,
            by: 'app'
        }
    ]

});