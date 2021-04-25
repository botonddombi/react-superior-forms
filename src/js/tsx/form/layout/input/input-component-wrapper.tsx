import React, {useContext, useEffect, useMemo, useCallback} from 'react';

import {
    InputTypes,
    InputValidatorTypes,
    InputFormatterTypes,
} from '../../../../includes/constants/enums';

import {
    InputValidator,
    CustomInputValidator,
    InputDefaults,
    InputFormatter,
    CustomInputFormatter,
} from '../../../../includes/typings/form';

import {InputFailedValidators, InputProps} from './index';

import {FormContext} from '../../context';

import InputValidationWrapper from './input-validation-wrapper';

import {format} from '../../../../includes/modules/input-formatter';
import {process} from '../../../../includes/modules/input-processor';

export interface InputComponent {
    ref?: React.RefObject<any>,
    focus: () => void,
}

export type InputComponentProps = {
    className?: string,

    name: string,

    value?: any,

    type?: InputTypes,

    failedValidators?: Array<InputValidator|CustomInputValidator>,
    validationMessage?: string|JSX.Element,

    disabled?: boolean,
    required?: boolean,

    onChange?: (value: any) => void,
};

type InputComponentWrapperProps = Omit<InputProps, 'onChange'> & {
    innerRef: React.RefObject<HTMLDivElement>,

    value: any,
    dirty: boolean,

    failedValidators: InputFailedValidators,

    onChange?: (value: any, processedValue: any, initialCall: boolean) => void,
    onValidate?: (failedValidators: Array<InputValidator|CustomInputValidator>) => void
}

/**
 * Wraps the input component, handling validating, formatting and processing.
 * Furthermore, it wraps the input in a validator wrapper if necessary.
 * @param {InputComponentWrapperProps} props
 * @return {JSX.Element}
 */
export default function InputComponentWrapper(props : InputComponentWrapperProps) : JSX.Element {
    const inputDefaults : InputDefaults = useContext(FormContext).inputDefaults;

    /**
     * Builds the final array of validators from the 'required', 'validate' properties.
     */
    const validators : Array<InputValidator|CustomInputValidator> =
    useMemo(() : Array<InputValidator|CustomInputValidator> => {
        const validators = [];
        const validate = props.validate ?? inputDefaults.validate ?? false;

        if (validate) {
            if (props.required ?? inputDefaults.required ?? false) {
                validators.push({
                    type: InputValidatorTypes.Required,
                });
            }

            if (validate === true) {
                if (
                    (Object.values(InputValidatorTypes) as string[])
                        .indexOf(props.type) !== -1
                ) {
                    validators.push({
                        type: props.type,
                    });
                } else {
                    console.warn(`There is no default validation for type ${props.type}`);
                }
            } else {
                const validateArr = Array.isArray(validate) ? validate : [validate];

                validateArr.forEach((validation) => {
                    switch (typeof validation) {
                    case 'string': {
                        const match = validation.match(/^([a-z_]+?)(:(.+))?$/);
                        const type = match[1];

                        if (
                            (Object.values(InputValidatorTypes) as string[])
                                .indexOf(type) !== -1
                        ) {
                            validators.push({
                                type,
                                arguments: match[3] ? match[3].split(',') : [],
                            });
                        }
                    }
                        break;
                    case 'function':
                        validators.push({
                            type: InputValidatorTypes.Custom,
                            assert: validation,
                        });
                        break;
                    default:
                        if (validation.type === undefined) {
                            validation.type = InputValidatorTypes.Custom;
                        }

                        validators.push(validation);
                    }
                });
            }
        }

        return validators;
    }, [
        props.validate,
        props.required,
        inputDefaults.validate,
    ]);

    /**
     * Builds the final array of formatters from the 'format' property
     * and additionally from the existing 'validators'.
     */
    const formatters : Array<InputFormatter|CustomInputFormatter> =
    useMemo(() : Array<InputFormatter|CustomInputFormatter> => {
        const formatters = [];
        const format = props.format ?? inputDefaults.format ?? false;

        if (format) {
            if (format === true) {
                if (
                    (Object.values(InputFormatterTypes) as string[])
                        .indexOf(props.type) !== -1
                ) {
                    formatters.push({
                        type: props.type,
                    });
                }

                validators.forEach((validator) => {
                    if (
                        validator.type !== InputValidatorTypes.Custom &&
                        (!formatters.length || formatters[0].type !== validator.type)
                    ) {
                        if (
                            (Object.values(InputFormatterTypes) as string[])
                                .indexOf(validator.type) !== -1
                        ) {
                            formatters.push({
                                type: validator.type,
                                arguments: validator.arguments,
                            });
                        }

                        if (
                            validator.type === InputValidatorTypes.BetweenRange &&
                            validator.arguments &&
                            validator.arguments.length >= 2
                        ) {
                            formatters.push({
                                type: InputFormatterTypes.Maximum,
                                arguments: [validator.arguments[1]],
                            });
                        }
                    }
                });
            } else {
                const formatArr = Array.isArray(format) ? format : [format];

                formatArr.forEach((format) => {
                    switch (typeof format) {
                    case 'string': {
                        const match = format.match(/^([a-z_]+?)(:(.+))?$/);
                        if (match) {
                            const type = match[1];

                            if (
                                (Object.values(InputFormatterTypes) as string[])
                                    .indexOf(type) !== -1
                            ) {
                                formatters.push({
                                    type,
                                    arguments: match[3] ? match[3].split(',') : [],
                                });
                            }
                        }
                    }
                        break;
                    case 'function':
                        formatters.push({
                            type: InputFormatterTypes.Custom,
                            format: format,
                        });
                        break;
                    default:
                        if (format.type === undefined) {
                            format.type = InputFormatterTypes.Custom;
                        }

                        formatters.push(format);
                    }
                });
            }
        }

        return formatters;
    }, [
        props.format,
        inputDefaults.format,
        validators,
    ]);

    const processor = props.process ?? inputDefaults.process ?? false;

    /**
     * Formats the value if necessary.
     * @param {any} value The current value to format.
     * @return {any} The current value formatted.
     */
    function formatValue(value : any) {
        return formatters.reduce(
            (currentValue, formatter) => format(formatter, currentValue, props.type),
            value,
        );
    }

    /**
     * Processes the value if necessary.
     * @param {any} value The current value to process.
     * @return {any} The current value processed.
     */
    function processValue(value : any) {
        if (processor) {
            return process(processor, value, props.type);
        }

        return value;
    }

    const processedValue = useMemo(
        () : any => processValue(formatValue(props.value)),
        [props.value],
    );

    /**
     * The event that is called when the input value changes.
     * It will format, and process the value if necessary.
     * @param {any} value The current value to format and process.
     * @param {boolean} initialCall Whether this is the initial change call.
     */
    const onChange = useCallback((value : any, initialCall : boolean = false) : void => {
        value = formatValue(value);
        const processedValue = processValue(value);

        props.onChange(value, processedValue, initialCall);
    }, [props.onChange]);

    /**
     * This is to format and process the default value of the input.
     * It is only called once, when the component mounts.
     */
    useEffect(() => {
        onChange(props.value, true);
    }, []);

    const componentProps : InputComponentProps = {
        name: props.name,
        value: props.value,
        type: props.type ?? InputTypes.Custom,
        disabled: props.disabled ?? inputDefaults.disabled,
        required: props.required ?? inputDefaults.required,
        className: props.className ?? undefined,
        onChange,
    };

    const component = React.cloneElement(props.component, componentProps);

    if (validators.length) {
        return <InputValidationWrapper
            value={processedValue}
            dirty={props.dirty}
            type={componentProps.type}
            validators={validators}
            hideValidateMessage={
                props.hideValidateMessage ?? inputDefaults.hideValidateMessage
            }
            failedValidators={props.failedValidators}
            required={componentProps.required}
            onValidate={props.onValidate}

            innerRef={props.innerRef}
        >
            {component}
        </InputValidationWrapper>;
    }

    return component;
}
