import React, {useContext, useEffect, useMemo} from 'react';

import {InputTypes, InputValidatorTypes, InputFormatterTypes} from 'constants/enums';

import {
    InputValidator,
    CustomInputValidator,
    InputDefaults,
    InputFormatter,
    CustomInputFormatter,
} from 'typings/form';

import {InputProps} from '.';

import {FormDefaultsContext} from '../../context';

import InputValidatorWrapper from './input-validator-wrapper';

import {format} from 'modules/input-formatter';
import {process} from 'modules/input-processor';

export type InputComponentProps = {
    className?: string,

    name: string,

    value?: any,

    type?: InputTypes,

    failedValidators?: Array<InputValidator|CustomInputValidator>,

    disabled?: boolean,
    required?: boolean,

    onChange?: (value: any) => void,
};

type InputComponentWrapperProps = InputProps & {
    value: any,
    onChange?: (value: any) => void,
    onValidate?: (failedValidators: Array<InputValidator|CustomInputValidator>) => void
}

/**
 * Wraps the input component, handling validating, formatting and processing.
 * Furthermore, it wraps the input in a validator wrapper if necessary.
 * @param {InputComponentWrapperProps} props
 * @return {JSX.Element}
 */
export default function InputComponentWrapper(props : InputComponentWrapperProps) : JSX.Element {
    const inputDefaults : InputDefaults = useContext(FormDefaultsContext);

    /**
     * Builds the final array of validators from the 'required', 'validate' properties.
     */
    const validators : Array<InputValidator|CustomInputValidator> =
    useMemo(() : Array<InputValidator|CustomInputValidator> => {
        const validators = [];
        const validate = props.validate ?? inputDefaults.validate ?? false;

        if (validate) {
            if (props.required) {
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
        validators,
    ]);

    const processor = props.process ?? inputDefaults.process ?? false;

    // console.log(formatters, validators, processor);

    /**
     * The event that is called when the input value changes.
     * It will format, and process the value if necessary.
     * @param {any} value The current value, formatted, and processed.
     */
    function onChange(value : any) : void {
        formatters.forEach((formatter) => {
            value = format(formatter, value, props.type);
        });

        if (processor) {
            value = process(processor, value, props.type);
        }

        props.onChange(value);
    }

    /**
     * This is to format and process the default value of the input.
     * It is only called once, when the component mounts.
     */
    useEffect(() => {
        onChange(props.value);
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
        return <InputValidatorWrapper
            value={props.value}
            type={componentProps.type}
            validators={validators}
            hideValidateMessage={
                props.hideValidateMessage ?? inputDefaults.hideValidateMessage
            }
            required={componentProps.required}
            onValidate={props.onValidate}
        >
            {component}
        </InputValidatorWrapper>;
    }

    return component;
}
