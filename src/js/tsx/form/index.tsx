import React, {useRef, useState, useCallback, useMemo} from 'react';
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
import {SubmitPhase} from 'constants/enums';

export type FormProps = {
    route: string,
    method?: string,
    json?: boolean,

    onSuccess?: (event: ProgressEvent<XMLHttpRequest>, data: object) => void,
    onFail?: (event: ProgressEvent<XMLHttpRequest>, data: object) => void,

    onSend?: (data: object) => void,
    onSubmit?: () => void,

    processBeforeSend?: (data: object) => object,

    headers?: {[key: string] : string},

    className?: string,

    inputDefaults?: InputDefaults,

    children?: React.ReactNode|React.ReactElement[]|React.ReactElement
};

type InputComponentsFailedValidators =
    InputFailedValidators |
    InputGroupFailedValidators |
    InputGroupRepeaterFailedValidators;

const inputTypes = Object.values(Inputs);
const inputComponentTypes = [...inputTypes, InputGroup, InputGroupRepeater];

/**
 * Finds the invalid input if there is any.
 * @param {Array<InputComponents>} components
 * @return {InputHandle} The invalid input.
 */
function findInvalidInput(components: Array<InputComponents>) : InputHandle {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];

        if ('inputComponents' in component) {
            /**
             * When the component is an InputGroup.
             */
            const invalidInput = findInvalidInput(component.inputComponents.current);
            if (invalidInput) {
                return invalidInput;
            }
        } else if ('inputGroups' in component) {
            /**
             * When the component is an InputGroupRepeater.
             */
            const invalidInput = findInvalidInput(component.inputGroups.current);
            if (invalidInput) {
                return invalidInput;
            }
        } else {
            /**
             * When the component is an Input.
             */
            if (component.failedValidators.length) {
                return component;
            }
        }
    }

    return null;
}

/**
 * Collects the components form data.
 * @param {Array<InputComponents>} components The components to traverse.
 * @param {boolean} isObject The data to collect the values into.
 * @return {object|Array<object>}
 */
function collectData(
    components: Array<InputComponents>,
    isObject: boolean,
) : object|Array<object> {
    let data = isObject ? {} : [];

    components.forEach((component, index) => {
        if ('inputComponents' in component) {
            /**
             * When the component is an InputGroup.
             */
            const object = collectData(component.inputComponents.current, true);
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
            const array = collectData(component.inputGroups.current, false) as Array<object>;
            if (array.length !== 0) {
                data[component.name] = array;
            }
        } else {
            if (component.disabled !== true) {
                data[component.name] = component.processedValue;
            }
        }
    });

    return data;
}

/**
 * The component that builds the form.
 * @param {FormProps} props
 * @return {JSX.Element}
 */
export default function Form(props : FormProps) : JSX.Element {
    const inputDefaults = props.inputDefaults ?? {};
    const inputComponents : React.RefObject<Array<InputComponents>> = useRef([]);

    const [failedValidators, setFailedValidators] = useState([]);
    const [submitPhase, setSubmitPhase] = useState(SubmitPhase.Stale);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    /**
     * Finds the first invalid input.
     * @return {InputHandle} The invalid input.
     */
    function findFirstInvalidInput() : InputHandle {
        return findInvalidInput(inputComponents.current);
    }

    /**
     * Collects the entire form data.
     * @return {object} The form data packed into an object.
     */
    function collectFormData() {
        return collectData(inputComponents.current, true);
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

        xhr.onloadend = function(event : ProgressEvent<XMLHttpRequest>) {
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
    }, [props]);

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
