import {ClassMetadata} from "../generate-classes-metadata";

export type InheritanceTree = {
    extendsClass: Record<string, string[]>,
    implementsInterface: Record<string, string[]>
};

export const buildInheritanceTreeFromClassMetadataCollection = (
    classMetadataCollection: Record<string, ClassMetadata>
): InheritanceTree => {
    const classes = Object.keys(classMetadataCollection);
    const inheritanceTree: InheritanceTree = {
        extendsClass: {},
        implementsInterface: {}
    };

    // add class node to tree
    classes.forEach(_class => {
        const meta = classMetadataCollection[_class];
        inheritanceTree.implementsInterface[_class] = meta.implements.map(
            interfaceLocation => interfaceLocation.namespace
        );

        inheritanceTree.extendsClass[_class] = meta.superClass ? [meta.superClass.namespace] : [];
    });

    // build interface inheritance tree
    classes.forEach(_class => {
        let ancestors = inheritanceTree.extendsClass[_class];
        if (ancestors.length > 0) {
            let oldestAncestor = ancestors[ancestors.length - 1];
            ancestors = inheritanceTree.extendsClass[oldestAncestor];

            while (ancestors.length > 0) {
                inheritanceTree.extendsClass[_class] = inheritanceTree.extendsClass[_class].concat(ancestors);
                oldestAncestor = ancestors[ancestors.length - 1];
                ancestors = inheritanceTree.extendsClass[oldestAncestor];
            }
        }

        let interfacesToCheck: string[] = inheritanceTree.implementsInterface[_class] ?? [];
        const interfacesSeen = {};


        // resolve interface inheritance
        while (Array.isArray(interfacesToCheck) && interfacesToCheck.length > 0) {
            let newInterfaceToCheck: string[] = [];
            for (const interfaceName of interfacesToCheck) {
                if (interfacesSeen[interfaceName]) {
                    continue;
                }

                interfacesSeen[interfaceName] = true;
                const candidates = inheritanceTree.implementsInterface[interfaceName] ?? [];

                if (candidates.length > 0) {
                    newInterfaceToCheck = newInterfaceToCheck.concat(candidates);
                }
            }

            inheritanceTree.implementsInterface[_class] = inheritanceTree.implementsInterface[_class].concat(newInterfaceToCheck);
            interfacesToCheck = newInterfaceToCheck;
        }
    });

    // resolve all interface implementation from super class to sub-classes
    classes.forEach(_class => {
        const interfacesSeen = {};
        inheritanceTree.implementsInterface[_class].forEach(_interface => {
            interfacesSeen[_interface] = true;
        })

        const candidates = inheritanceTree.extendsClass[_class].map(superClass => inheritanceTree.implementsInterface[superClass]).flat();

        for (const candidate of candidates) {
            if (!interfacesSeen[candidate]) {
                interfacesSeen[candidate] = true;
                inheritanceTree.implementsInterface[_class].push(candidate);
            }
        }
    });

    return inheritanceTree;
}
