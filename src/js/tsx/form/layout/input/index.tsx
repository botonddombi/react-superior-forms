import React, {useCallback, useState, useRef, useImperativeHandle} from 'react';

import {InputTypes} from 'constants/enums';

import {
    Validator,
    Formatter,
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import InputComponentWrapper, {InputComponent} from './input-component-wrapper';

export type InputFailedValidator = InputValidator | CustomInputValidator;

export type InputFailedValidators = Array<InputFailedValidator>;

export type InputType = {
    className?: string,

    name: string,

    defaultValue?: any,

    type?: InputTypes,

    validate?: boolean | Validator,
    hideValidateMessage?: boolean,

    process?: boolean | ((value : any) => any),

    format?: Formatter,

    required?: boolean,
    disabled?: boolean,

    onChange?: (value : any) => void
    onValidate?: (
        failedValidators: InputFailedValidators,
        inputComponent: React.RefObject<InputComponent>
    ) => void
};

export type InputProps = InputType & {
    component: React.ReactElement,
};

export interface InputHandle {
    ref?: React.RefObject<any>,

    value: any,
    processedValue: any,
    failedValidators: InputFailedValidators,

    name: string,
    disabled: boolean,

    component: React.RefObject<InputComponent>,
    wrapper: React.RefObject<HTMLDivElement>,
}

/**
 * The input component which all other inputs of the form share.
 * @param {InputProps} props
 * @param {React.RefObject<InputHandle>} ref
 * @return {JSX.Element}
 */
function Input(
    props: InputProps,
    ref: React.RefObject<InputHandle>,
) : JSX.Element {
    const [value, setValue] = useState<any>(props.defaultValue ?? null);
    const [processedValue, setProcessedValue] = useState<any>(value);
    const [dirty, setDirty] = useState<boolean>(false);
    const [failedValidators, setFailedValidators] = useState<InputFailedValidators>([]);

    const component : React.RefObject<InputComponent> = useRef();
    const wrapper : React.RefObject<HTMLDivElement> = useRef();

    useImperativeHandle(ref, () : InputHandle => ({
        ref: component,

        value,
        processedValue,
        failedValidators,

        name: props.name,
        disabled: props.disabled,

        component,
        wrapper,
    }));

    /**
     * The change event that should be called whenever the input component's value has changed.
     * @param {any} value The new value.
     * @param {any} processedValue The processed new value.
     * @param {boolean} initialCall Whether this is the initial change call.
    */
    const onChange = useCallback((
        value : any,
        processedValue : any,
        initialCall : boolean = false,
    ) : void => {
        if (typeof props.onChange === 'function') {
            props.onChange(value);
        }

        setValue(value);
        setProcessedValue(processedValue);
        setDirty(dirty || !initialCall);
    }, []);

    /**
     * The validation event that is called whenever the input component's value has been validated.
     * @param {InputFailedValidators} newFailedValidators The failed validators.
     */
    const onValidate = useCallback((newFailedValidators : InputFailedValidators) : void => {
        setFailedValidators(newFailedValidators);

        if (typeof props.onValidate === 'function') {
            props.onValidate(newFailedValidators, component);
        }
    }, []);

    return <InputComponentWrapper
        {...props}
        component={
            React.cloneElement(props.component, {
                ref: component,
            })
        }

        value={value}
        dirty={dirty}
        onChange={onChange}
        onValidate={onValidate}

        innerRef={wrapper}
    />;
}

export default React.forwardRef(Input);
