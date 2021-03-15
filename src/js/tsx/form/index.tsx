/* eslint-disable */
import React, {useRef, useState, useCallback, useMemo} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/index.scss';

import type {InputDefaults} from 'typings/form';

import {mapRefs, objectToFormData} from 'modules/helpers';

import * as Inputs from './layout/input-types';

import {InputFailedValidators} from './layout/input';

import InputGroup, {InputGroupFailedValidators} from '../form-builder/layout/input-group';
import InputGroupRepeater, {InputGroupRepeaterFailedValidators} from '../form-builder/layout/input-group-repeater';

import {FormContext} from './context';
import {SubmitPhase} from 'constants/enums';

const inputTypes = Object.values(Inputs);

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

const inputComponentTypes = [...inputTypes, InputGroup, InputGroupRepeater];

/**
 * The component that builds the form.
 * @param {FormProps} props
 * @return {JSX.Element}
 */
export default function Form(props : FormProps) : JSX.Element {
    const inputDefaults = props.inputDefaults ?? {};
    const inputComponents : React.RefObject<Array<Inputs.Input|InputGroup|InputGroupRepeater>> =
    useRef([]);

    const [failedValidators, setFailedValidators] = useState([]);
    const [submitPhase, setSubmitPhase] = useState(SubmitPhase.Stale);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    /**
     * Finds the invalid input if there is any.
     * @param {Array<any>} components
     * @return {Inputs.Input} The invalid input.
     */
    function findInvalidInput(components: Array<any>) : Inputs.Input {
        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            switch (component.constructor) {
            case InputGroup: {
                const invalidInput = findInvalidInput(component.inputComponents.current);
                if (invalidInput) {
                    return invalidInput;
                }
                break;
            }
            case InputGroupRepeater: {
                const invalidInput = findInvalidInput(component.inputGroups.current);
                if (invalidInput) {
                    return invalidInput;
                }
                break;
            }
            default:
                if (component.failedValidators.length) {
                    return component;
                }
            }
        }
    }

    /**
     * Finds the first invalid input.
     * @return {Inputs.Input} The invalid input.
     */
    function findFirstInvalidInput() : Inputs.Input {
        return findInvalidInput(inputComponents.current);
    }

    /**
     * Collects the components form data.
     * @param {object} data The data to collect the values into.
     * @param {Array<any>} components The components to traverse.
     * @returns {object|Array<object>}
     */
     function collectData(components: Array<any>, isObject: boolean) : object|Array<object> {
        const data = isObject ? {} : [];

        components.forEach((component, index) => {
            switch (component.constructor) {
            case InputGroup: {
                const object = collectData(component.inputComponents.current, true);
                if(Object.keys(object).length !== 0){
                    data[isObject ? component.props.name : index] = object;
                }
                break;
            }
            case InputGroupRepeater: {
                const array = collectData(component.inputGroups.current, false) as Array<object>;
                if(array.length !== 0){
                    data[component.props.name] = array;
                }
                break;
            }
            default:
                if(component.props.disabled !== true){
                    data[component.props.name] = component.processedValue;
                }
                break;
            }
        });

        return data;
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
    }, []);

    /**
     * Captures the validation of all inputs placed in this form.
     * Additionally, checks whether all inputs are clear of failed validators.
     * @param {InputFailedValidators|InputGroupFailedValidators|InputGroupRepeaterFailedValidators} failedValidators
     * The failed validators.
     * @param {Inputs.Input|InputGroup|InputGroupRepeater} inputComponent The component that was validated.
     */
    const onValidate = useCallback(
        (
            failedValidators:
                InputFailedValidators |
                InputGroupFailedValidators |
                InputGroupRepeaterFailedValidators,
            inputComponent: Inputs.Input|InputGroup|InputGroupRepeater,
        ) => {

        setFailedValidators(
            inputComponents.current
                .reduce(
                    (previous, current) => [
                        ...(
                            current === inputComponent ?
                                failedValidators :
                                current.failedValidators
                        ),
                        ...previous,
                    ],
                    [],
                ),
        );
    }, []);

    const children = useMemo(() => mapRefs(
        props.children,
        inputComponentTypes,
        inputComponents,
        {
            onValidate,
        },
    ), [props.children]);

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
