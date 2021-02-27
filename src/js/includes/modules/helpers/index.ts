import React from 'react';

/**
 * A non-complex way of cloning objects & arrays recursively.
 * @param {any} target The object to clone.
 * @return {any} The cloned object.
 */
export function cloneDeep(target : any) : any {
    const matchType = Object.prototype.toString.call(target).match(/ ([a-zA-Z]+)\]$/);
    if (matchType) {
        if (matchType[1] == 'Array') {
            return [...target].map((item) => cloneDeep(item));
        }

        if (matchType[1] == 'Object') {
            const object = {...target};

            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    object[key] = cloneDeep(object[key]);
                }
            }

            return object;
        }
    }

    return target;
}

/**
 * The recursive helpers function for mapRefs.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} types The types the component should match.
 * @param {React.MutableRefObject<any>} targetRef The target ref which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
function mapRefsRecursive(
    children : any,
    types : Array<any>,
    targetRef : React.MutableRefObject<any>,
    additionalFunctionProps : object = {},
) : React.ReactChildren {
    return React.Children.map(children, (child) => {
        if (types.indexOf(child.type) !== -1) {
            const additionalProps = {};

            for (const key in additionalFunctionProps) {
                if (Object.prototype.hasOwnProperty.call(additionalFunctionProps, key)) {
                    additionalProps[key] = (...args) => {
                        if (typeof child.props[key] === 'function') {
                            child.props[key](...args);
                        }

                        additionalFunctionProps[key](...args);
                    };
                }
            }

            return React.cloneElement(child, {
                ref: (node) => {
                    if (node && targetRef.current.indexOf(node) === -1) {
                        targetRef.current.push(node);

                        const {ref} = child;

                        if (typeof ref === 'function') {
                            ref(node);
                        }
                    }
                },
                ...additionalProps,
            });
        } else {
            if (child.props.children && typeof child.props.children !== 'string') {
                return React.cloneElement(child, {
                    children: mapRefs(
                        child.props.children,
                        types,
                        targetRef,
                        additionalFunctionProps,
                    ),
                });
            }

            return child;
        }
    });
}


/**
 * Maps the children and applies refs to those that match the specified types.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} types The types the component should match.
 * @param {React.MutableRefObject<any>} targetRef The target ref which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
export function mapRefs(
    children : any,
    types : Array<any>,
    targetRef : React.MutableRefObject<any>,
    additionalFunctionProps : object = {},
) : React.ReactChildren {
    targetRef.current = [];
    return mapRefsRecursive(children, types, targetRef, additionalFunctionProps);
}

/**
 * The recursive helpers function for mapRefs.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} componentTypes The component types the component should match.
 * @param {string} componentKeyProp The component's property key to assign as the key inside the group.
 * @param {Array<any>} groupTypes The group types the group component should match.
 * @param {string} groupKeyProp The group component's property key to assign as the group key.
 * @param {object} target The target which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
function mapRefsIntoGroupsRecursive(
    children : any,
    componentTypes : Array<any>,
    componentKeyProp : string,
    groupTypes : Array<any>,
    groupKeyProp : string,
    target : object,
    additionalFunctionProps : object = {},
) : React.ReactChildren {
    return React.Children.map(children, (child) => {
        if (groupTypes.indexOf(child.type) !== -1 && child.props.children) {
            const newTarget = target[child.props[groupKeyProp] ?? ''] = {};

            return React.cloneElement(child, {
                children: mapRefsIntoGroupsRecursive(
                    child.props.children,
                    componentTypes,
                    componentKeyProp,
                    groupTypes,
                    groupKeyProp,
                    newTarget,
                    additionalFunctionProps,
                ),
            });
        }

        if (componentTypes.indexOf(child.type) !== -1) {
            const additionalProps = {};

            for (const key in additionalFunctionProps) {
                if (Object.prototype.hasOwnProperty.call(additionalFunctionProps, key)) {
                    additionalProps[key] = (...args) => {
                        if (typeof child.props[key] === 'function') {
                            child.props[key](...args);
                        }

                        additionalFunctionProps[key](...args);
                    };
                }
            }

            return React.cloneElement(child, {
                ref: (node) => {
                    if (node && !target[child.props[componentKeyProp]]) {
                        target[child.props[componentKeyProp]] = node;

                        const {ref} = child;

                        if (typeof ref === 'function') {
                            ref(node);
                        }
                    }
                },
                ...additionalProps,
            });
        } else {
            if (child.props.children && typeof child.props.children !== 'string') {
                return React.cloneElement(child, {
                    children: mapRefsIntoGroupsRecursive(
                        child.props.children,
                        componentTypes,
                        componentKeyProp,
                        groupTypes,
                        groupKeyProp,
                        target,
                        additionalFunctionProps,
                    ),
                });
            }

            return child;
        }
    });
}


/**
 * Maps the children and applies refs to those that match the specified types.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} componentTypes The component types the component should match.
 * @param {string} componentKeyProp The component's property key to assign as the key inside the group.
 * @param {Array<any>} groupTypes The group types the group component should match.
 * @param {string} groupKeyProp The group component's property key to assign as the group key.
 * @param {React.MutableRefObject<any>} targetRef The target ref which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
export function mapRefsIntoGroups(
    children : any,
    componentTypes : Array<any>,
    componentKeyProp : string,
    groupTypes : Array<any>,
    groupKeyProp : string,
    targetRef : React.MutableRefObject<any>,
    additionalFunctionProps : object = {},
) : React.ReactChildren {
    targetRef.current = {};
    return mapRefsIntoGroupsRecursive(
        children,
        componentTypes,
        componentKeyProp,
        groupTypes,
        groupKeyProp,
        targetRef.current,
        additionalFunctionProps,
    );
}
