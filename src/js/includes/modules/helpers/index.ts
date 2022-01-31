import React from 'react';

/**
 * The recursive helpers function for mapRefs.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} types The types the component should match.
 * @param {React.MutableRefObject<any>} targetRef The target ref which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @param {object} additionalCalculatedProps Additional calculated props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
function mapRefsRecursive(
    children : any,
    types : Array<any>,
    targetRef : React.MutableRefObject<any>,
    additionalFunctionProps : object = {},
    additionalCalculatedProps : object = {},
) : React.ReactChildren {
    return React.Children.map(children, (child) => {
        if (child) {
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

                for (const key in additionalCalculatedProps) {
                    if (Object.prototype.hasOwnProperty.call(additionalCalculatedProps, key)) {
                        additionalProps[key] = additionalCalculatedProps[key](child);
                    }
                }

                return React.cloneElement(child, {
                    ref: (node) => {
                        if (node) {
                            if (node.ref) {
                                const index = targetRef.current.map(
                                    (current) => current.ref,
                                ).indexOf(node.ref);

                                if (index === -1) {
                                    targetRef.current.push(node);
                                } else {
                                    targetRef.current[index] = node;
                                }
                            } else if (!node.ref && targetRef.current.indexOf(node) === -1) {
                                targetRef.current.push(node);
                            }

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
                            additionalCalculatedProps,
                        ),
                    });
                }

                return child;
            }
        }
    });
}


/**
 * Maps the children and applies refs to those that match the specified types.
 * @param {any} children The children of the parent component.
 * @param {Array<any>} types The types the component should match.
 * @param {React.MutableRefObject<any>} targetRef The target ref which should collect the components.
 * @param {object} additionalFunctionProps Additional function props to replace on the matched components.
 * @param {object} additionalCalculatedProps Additional calculated props to replace on the matched components.
 * @return {React.ReactChildren} The children of the parent component but with refs applied to them.
 */
export function mapRefs(
    children : any,
    types : Array<any>,
    targetRef : React.MutableRefObject<any>,
    additionalFunctionProps : object = {},
    additionalCalculatedProps : object = {},
) : React.ReactChildren {
    targetRef.current = [];
    return mapRefsRecursive(
        children,
        types,
        targetRef,
        additionalFunctionProps,
        additionalCalculatedProps,
    );
}

/**
 * A recursive helper function to fill the form data.
 * @param {any} data The current object to traverse.
 * @param {FormData} formData The form data to fill.
 * @param {string} parentKey The parent key of the current data.
 */
function fillFormData(data: any, formData: FormData, parentKey: string = null) {
    if (typeof data === 'object' && data !== null) {
        if (data instanceof FileList) {
            Array.from(data).forEach((file) => formData.append((data.length > 1) ? `${parentKey}[]` : parentKey, file));
        }

        Object.keys(data).forEach((key) => {
            fillFormData(data[key], formData, parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        formData.append(parentKey, (data === null) ? '' : data);
    }
}

/**
 * Transforms the object parameter into a form data.
 * @param {object} object The object to transform into a form data.
 * @return {FormData} The created form data.
 */
export function objectToFormData(object: object) : FormData {
    const data = new FormData();

    fillFormData(object, data);

    return data;
}
