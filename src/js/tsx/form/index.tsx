import React, {useRef, useState, useCallback, useImperativeHandle, useContext} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/index.scss';

import type {InputDefaults, InputComponents} from '../../includes/typings/form';

import {mapRefs, objectToFormData} from 'modules/helpers';

import {InputHandle} from './layout/input';

import * as Inputs from './layout/input-types';

import {InputFailedValidators} from './layout/input';

import InputGroup, {InputGroupFailedValidators}
    from '../form-builder/layout/input-group';

import InputGroupRepeater, {InputGroupRepeaterFailedValidators}
    from '../form-builder/layout/input-group-repeater';

import {FormContext, FormDefaultsContext} from './context';
import {SubmitPhase, InputValidatorTypes} from '../../includes/constants/enums';

type Callback = (
    response: string|object,
    event: ProgressEvent<XMLHttpRequest>,
    data: object
) => void;

export type FormProps = {
    route: string,
    method?: string,
    json?: boolean,
    acceptJson?: boolean,

    onSuccess?: Callback,
    onFail?: Callback,

    onSend?: (data: object) => void,
    onSubmit?: (onSubmitCallback: () => void) => void|boolean,

    processBeforeSend?: (data: collectMapValue) => collectMapValue,

    ref?: React.RefObject<FormHandle>,

    headers?: {[key: string] : string | (() => string)},

    className?: string,

    inputDefaults?: InputDefaults,

    children?: React.ReactNode|React.ReactElement[]|React.ReactElement
};

type InputComponentsFailedValidators =
    InputFailedValidators |
    InputGroupFailedValidators |
    InputGroupRepeaterFailedValidators;

export interface FormHandle {
    shiftFailedValidators: (object) => void,
    submit: () => void
}

const inputTypes = Object.values(Inputs);
const inputComponentTypes = [...inputTypes, InputGroup, InputGroupRepeater];

type collectMapValue = {
    [key: string]: collectMapValue|any
};

type collectMap = {
    [key: string]: collectMap|InputComponents
};

type collectArray = Array<collectMap>;

/**
 * Collects the form input components.
 * @param {Array<InputComponents>} components The components to traverse.
 * @param {boolean} isObject The data to collect the values into.
 * @param {string} grabKey The key to grab from the input component.
 * @return {collectMap | collectArray | collectMapValue}
 */
function collect(
    components: Array<InputComponents>,
    isObject: boolean,
    grabKey: string = null,
) : collectMap | collectArray | collectMapValue {
    let data = isObject ? {} : [];

    components.forEach((component, index) => {
        if ('inputComponents' in component) {
            /**
             * When the component is an InputGroup.
             */
            const object = collect(component.inputComponents.current, true, grabKey);
            if (Object.keys(object).length !== 0) {
                if (isObject) {
                    if (component.name === undefined) {
                        data = {...data, ...object};
                    } else {
                        data[component.name] = object;
                    }
                } else {
                    data[index] = object;
                }
            }
        } else if ('inputGroups' in component) {
            /**
             * When the component is an InputGroupRepeater.
             */
            const array = collect(component.inputGroups.current, false, grabKey) as Array<object>;
            if (array.length !== 0) {
                data[component.name] = array;
            }
        } else {
            /**
             * When the component is an Input.
             */
            if (component.disabled !== true) {
                data[component.name] = grabKey ? component[grabKey] : component;
            }
        }
    });

    return data;
}

/**
 * Finds the invalid input if there is any.
 * @param {object|Array<object>} components
 * @return {InputHandle} The invalid input.
 */
function findInvalidInput(components: object|Array<object>) : InputHandle {
    for (const key in components) {
        if (Object.prototype.hasOwnProperty.call(components, key)) {
            const component = components[key];

            if ('failedValidators' in component) {
                if (component.failedValidators.length) {
                    return component;
                }
            } else {
                const invalidInput = findInvalidInput(component);
                if (invalidInput) return invalidInput;
            }
        }
    }
}

/**
 * Shifts failed validators based on an object map.
 * @param {object|Array<object>} componentsMap The components to shift the validators to.
 * @param {object|Array<object>} messagesMap The messages to use for the validators.
 */
function shiftFailedValidatorsRecursive(
    componentsMap: object|Array<object>,
    messagesMap: object|Array<object>,
) {
    for (const key in componentsMap) {
        if (Object.prototype.hasOwnProperty.call(componentsMap, key)) {
            let messages = messagesMap[key];
            const components = componentsMap[key];

            if (typeof messages !== 'undefined') {
                if ('setFailedValidators' in components) {
                    if (typeof messages === 'string') {
                        messages = [messages];
                    }

                    components.setFailedValidators([
                        ...messages.map(
                            (message) => ({type: InputValidatorTypes.External, message}),
                        ),
                        ...components.failedValidators,
                    ]);
                } else {
                    if (typeof messages === 'object') {
                        shiftFailedValidatorsRecursive(components, messages);
                    }
                }
            }
        }
    }
}

/**
 * The component that builds the form.
 * @param {FormProps} props
 * @param {React.RefObject<FormHandle>} ref
 * @return {JSX.Element}
 */
function Form(props: FormProps, ref: React.RefObject<FormHandle>) : JSX.Element {
    const inputDefaults = props.inputDefaults ?? {};
    const inputComponents : React.RefObject<Array<InputComponents>> = useRef([]);
    const formDefaults = useContext(FormDefaultsContext);

    const [failedValidators, setFailedValidators] = useState([]);
    const [submitPhase, setSubmitPhase] = useState(SubmitPhase.Stale);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useImperativeHandle(ref, () : FormHandle => ({
        shiftFailedValidators,
        submit: () => onSubmit(),
    }));

    /**
     * Deep merges message objects.
     * @param {object} a
     * @param {object} b
     * @return {object} Param a and b merged.
     */
    function deepMergeMessages(a:object, b: object): object {
        for (const key in b) {
            if (Object.prototype.hasOwnProperty.call(b, key)) {
                if (typeof a[key] === 'undefined') {
                    a[key] = b[key];
                } else {
                    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
                        if (Array.isArray(a[key]) && Array.isArray(b[key])) {
                            a[key] = [...a[key], ...b[key]];
                        } else {
                            a[key] = deepMergeMessages(a[key], b[key]);
                        }
                    }
                }
            }
        }

        return a;
    }

    /**
     * Extracts message keys to true object.
     * As an example, extracts: users.0.name to {users: [{name: ...}]}
     * @param {object} messages The object containing the error messages.
     * @return {object} The extracted messages.
     */
    function extractMessages(messages: object): object {
        const finalMessages = {};

        for (const key in messages) {
            if (Object.prototype.hasOwnProperty.call(messages, key)) {
                const value = messages[key];
                const match = key.match(/^(.*?)\.(.*)$/);

                if (match) {
                    const extractedMessages = extractMessages({[match[2]]: value});

                    if (typeof finalMessages[match[1]] === 'object') {
                        finalMessages[match[1]] = deepMergeMessages(
                            messages[match[1]],
                            extractedMessages,
                        );
                    } else {
                        finalMessages[match[1]] = extractedMessages;
                    }
                } else {
                    finalMessages[key] = value;
                }
            }
        }

        return finalMessages;
    }

    /**
     * Shifts temporary failed validators for the input components matched.
     * The object parameter should match the structure of the sent data object.
     * @param {object} messages The object containing the error messages.
     */
    function shiftFailedValidators(messages: object) {
        const components = collect(inputComponents.current, true);
        const extractedMessages = extractMessages(messages);
        console.log(components, extractedMessages);
        shiftFailedValidatorsRecursive(components, extractedMessages);
    }

    /**
     * Finds the first invalid input.
     * @return {InputHandle} The invalid input.
     */
    function findFirstInvalidInput() : InputHandle {
        const components = collect(inputComponents.current, true);
        return findInvalidInput(components);
    }

    /**
     * Collects the entire form data.
     * @return {collectMapValue} The form data packed into an object.
     */
    function collectFormData() : collectMapValue {
        return collect(inputComponents.current, true, 'processedValue') as collectMapValue;
    }

    /**
     * Creates the XMLHTTPRequest and sends the data.
     */
    function sendXhr() {
        setSubmitPhase(SubmitPhase.Loading);

        const xhr = new XMLHttpRequest();
        xhr.open(props.method ?? 'POST', props.route ?? '/');

        const headers = props.headers ?? formDefaults.headers;

        if (headers) {
            for (const key in headers) {
                if (Object.prototype.hasOwnProperty.call(headers, key)) {
                    const header = headers[key];

                    if (typeof header === 'function') {
                        xhr.setRequestHeader(key, header());
                    } else {
                        xhr.setRequestHeader(key, header);
                    }
                }
            }
        }

        xhr.onloadend = function(event : ProgressEvent<XMLHttpRequest>) {
            let response = event.target.responseText;

            if (props.acceptJson ?? formDefaults.acceptJson ?? props.json) {
                try {
                    response = JSON.parse(response);
                } catch (error) {
                    response = null;
                }
            }

            if (event.target.status == 200) {
                setSubmitPhase(SubmitPhase.Success);

                if (typeof props.onSuccess === 'function') {
                    props.onSuccess(response, event, data);
                }
            } else {
                setSubmitPhase(SubmitPhase.Fail);

                if (typeof props.onFail === 'function') {
                    props.onFail(response, event, data);
                }
            }
        };

        let data = collectFormData();

        if (typeof props.processBeforeSend === 'function') {
            data = props.processBeforeSend(data) || data;
        }

        if (typeof props.onSend === 'function') {
            props.onSend(data);
        }

        if ((props.json ?? formDefaults.json) === true) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send(objectToFormData(data));
        }
    }

    const onSubmitWithoutCallback = () => {
        if (submitPhase === SubmitPhase.Loading) {
            return;
        }

        setSubmitAttempted(true);

        const firstInvalidInput = findFirstInvalidInput();

        if (firstInvalidInput) {
            /**
             * If the input component has the 'focus' function implemented, it is called.
             * As a fallback the validation wrapper is scrolled into view.
             */
            if ('focus' in firstInvalidInput.component.current) {
                firstInvalidInput.component.current.focus();
            } else {
                firstInvalidInput.wrapper.current.scrollIntoView();
            }

            return;
        }

        sendXhr();
    };

    /**
     * The handling of the submit event.
     * @param {React.SyntheticEvent} event The original submit or click event.
     * The form is not necessarily submitted with the original submit event, this is just a safe fallback.
     */
    const onSubmit = useCallback((event?: React.SyntheticEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const onSubmitCallback = props.onSubmit ?? formDefaults.onSubmit;

        if (typeof onSubmitCallback === 'function') {
            if (onSubmitCallback(onSubmitWithoutCallback) === false) {
                return;
            }
        }

        onSubmitWithoutCallback();
    }, [props, formDefaults, inputComponents]);

    /**
     * Captures the validation of all inputs placed in this form.
     * Additionally, checks whether all inputs are clear of failed validators.
     * @param {InputComponentsFailedValidators} failedValidators The failed validators.
     * @param {React.RefObject<InputComponents>} inputComponent The component that was validated.
     */
    const onValidate = useCallback((
        failedValidators: InputComponentsFailedValidators,
        inputComponent: React.RefObject<InputComponents>,
    ) => {
        setFailedValidators(
            inputComponents.current
                .reduce(
                    (previous, current) => [
                        ...(
                            current.ref.current === inputComponent.current ?
                                failedValidators :
                                current.failedValidators
                        ),
                        ...previous,
                    ],
                    [],
                ),
        );
    }, [inputComponents]);

    return (
        <FormContext.Provider
            value={{
                inputDefaults,
                submitPhase,
                submitAttempted,
                onSubmit,
            }}
        >
            <form
                className={
                    classNames(
                        styles.form,
                        {
                            [`${styles.form}--invalid`]: failedValidators.length,
                        },
                        props.className,
                    )
                }
                onSubmit={onSubmit}
            >
                {
                    mapRefs(
                        props.children,
                        inputComponentTypes,
                        inputComponents,
                        {
                            onValidate,
                        },
                    )
                }
            </form>
        </FormContext.Provider>
    );
}

export default React.forwardRef(Form);
