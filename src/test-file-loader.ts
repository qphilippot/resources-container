import * as dree from 'dree';
import { readFileSync } from 'fs';

const mappemonde = {};

const tree = dree.scan(
    '',
    {
        exclude: /node_modules/,
        hash: false,
        depth:2,
        size: false,
        extensions:['ts']
    },
    function(element, stat)   {
        console.log(element);
        console.log(readFileSync(element.path, 'utf-8'));
        // console.log(stat);
    }
);

// console.log(dree.parseTree(tree));