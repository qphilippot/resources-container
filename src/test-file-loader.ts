import { generateClassesMetadata } from "./generate-classes-metadata";
import { resolve } from "path";

const mupath = resolve(__dirname, '../test/reflexivity/generate-classes-metadata/fixtures/a/classes');
console.log(mupath);
const classesMetadata = generateClassesMetadata({
    path: mupath,
    debug: true
});

console.log(classesMetadata);