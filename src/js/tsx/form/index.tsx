import React, {useRef, useState, useCallback, useMemo, useImperativeHandle} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/index.scss';

import type {InputDefaults} from 'typings/form';

import {mapRefs, objectToFormData} from 'modules/helpers';
import {InputComponents} from 'typings/form';

import {InputHandle} from './layout/input';

import * as Inputs from './layout/input-types';

import {InputFailedValidators} from './layout/input';

import InputGroup, {InputGroupFailedValidators}
    from '../form-builder/layout/input-group';

import InputGroupRepeater, {InputGroupRepeaterFailedValidators}
    from '../form-builder/layout/input-group-repeater';

import {FormContext} from './context';
import {SubmitPhase, InputValidatorTypes} from 'constants/enums';

export type FormProps = {
    route: string,
    method?: string,
    json?: boolean,
    acceptJson?: boolean,

    onSuccess?: (event: ProgressEvent<XMLHttpRequest & {responseJSON?: any}>, data: object) => void,
    onFail?: (event: ProgressEvent<XMLHttpRequest & {responseJSON?: any}>, data: object) => void,

    onSend?: (data: object) => void,
    onSubmit?: () => void,

    processBeforeSend?: (data: collectMapValue) => collectMapValue,

    ref?: React.RefObject<FormHandle>,

    headers?: {[key: string] : string},

    className?: string,

    inputDefaults?: InputDefaults,

    children?: React.ReactNode|React.ReactElement[]|React.ReactElement
};

type InputComponentsFailedValidators =
    InputFailedValidators |
    InputGroupFailedValidators |
    InputGroupRepeaterFailedValidators;

export interface FormHandle {
    shiftFailedValidators: (object) => void
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

    const [failedValidators, setFailedValidators] = useState([]);
    const [submitPhase, setSubmitPhase] = useState(SubmitPhase.Stale);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useImperativeHandle(ref, () : FormHandle => ({
        shiftFailedValidators,
    }));

    /**
     * Shifts temporary failed validators for the input components matched.
     * The object parameter should match the structure of the sent data object.
     * @param {object} messages The object containing the error messages.
     */
    function shiftFailedValidators(messages: object) {
        const components = collect(inputComponents.current, true);
        shiftFailedValidatorsRecursive(components, messages);
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

        if (props.headers) {
            for (const key in props.headers) {
                if (Object.prototype.hasOwnProperty.call(props.headers, key)) {
                    xhr.setRequestHeader(key, props.headers[key]);
                }
            }
        }

        xhr.onloadend = function(event : ProgressEvent<XMLHttpRequest & {responseJSON?: any}>) {
            if (props.acceptJson ?? props.json) {
                try {
                    event.target.responseJSON = JSON.parse(event.target.responseText);
                } catch (error) {
                    event.target.responseJSON = null;
                }
            }

            if (event.target.status == 200) {
                setSubmitPhase(SubmitPhase.Success);

                if (typeof props.onSuccess === 'function') {
                    props.onSuccess(event, data);
                }
            } else {
                setSubmitPhase(SubmitPhase.Fail);

                if (typeof props.onFail === 'function') {
                    props.onFail(event, data);
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

        if (props.json === true) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send(objectToFormData(data));
        }
    }

    /**
     * The handling of the submit event.
     * @param {React.SyntheticEvent} event The original submit or click event.
     * The form is not necessarily submitted with the original submit event, this is just a safe fallback.
     */
    const onSubmit = useCallback((event?: React.SyntheticEvent) => {
        if (typeof props.onSubmit === 'function') {
            props.onSubmit();
        }

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

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
    }, [props, inputComponents]);

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

    const children = useMemo(() => mapRefs(
        props.children,
        inputComponentTypes,
        inputComponents,
        {
            onValidate,
        },
    ), [props.children, onValidate]);

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
                {children}
            </form>
        </FormContext.Provider>
    );
}

export default React.forwardRef(Form);
