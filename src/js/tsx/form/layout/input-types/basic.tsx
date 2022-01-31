import React, {useImperativeHandle, useRef, useCallback} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/layout/input.scss';

import type {InputComponentProps} from '../input/input-component-wrapper';

import type {InputType} from '../input';

import Input, {InputHandle} from '../input';
import {InputTypes} from '../../../../includes/constants/enums';
import {InputComponent} from '../input/input-component-wrapper';

type DefaultInputTypes = 'text' | 'password' | 'checkbox';

type Target = EventTarget & HTMLInputElement;

type InputWrapperProps = Omit<InputType, 'component'>;

type BasicInputExtendProps = {
    resolveValue?: (target: Target) => boolean|string,
    defaultType: DefaultInputTypes,
}

type BasicInputProps = InputWrapperProps & BasicInputExtendProps;

type BasicInputComponentProps = InputComponentProps & BasicInputExtendProps;

/**
 * The input tag for the basic input.
 * @param {BasicInputComponentProps} props
 * @param {React.RefObject<InputComponent>} ref
 * @returns {JSX.Element}
 */
const BasicInputComponent = React.forwardRef((
    props: BasicInputComponentProps,
    ref: React.RefObject<InputComponent>,
) : JSX.Element => {
    const input : React.RefObject<HTMLInputElement> = useRef();

    useImperativeHandle(ref, () : InputComponent => ({
        ref: input,
        /**
         * Focuses the input element.
         */
        focus: () => {
            input.current.focus();
        },
    }));

    /**
     * Calls the parent onChange event to update the current value of the input.
     * @param {React.ChangeEvent<HTMLInputElement>} event The original 'change' event.
     */
    const onChange = useCallback((event : React.ChangeEvent<HTMLInputElement>) => {
        const {target} = event;
        props.onChange(props.resolveValue ? props.resolveValue(target) : target.value);
    }, [props.onChange, props.resolveValue]);

    return <input
        className={
            classNames(
                styles.input,
                `${styles.input}-type-${props.type}`,
                {
                    [`${styles.input}--invalid`]:
                    props.validationMessage,
                },
                props.className,
            )
        }

        name={props.name}

        value={String(props.value ?? '')}

        type={props.defaultType}

        required={props.required}
        disabled={props.disabled}

        onChange={onChange}

        ref={input}
    />;
});

BasicInputComponent.displayName = 'BasicInputComponent';

/**
 * A basic input to extend.
 */
const BasicInput = React.forwardRef(
    (props : BasicInputProps, ref : React.RefObject<InputHandle>) => {
        const {defaultType, ...inputProps} = props;

        const component = <BasicInputComponent defaultType={defaultType} {...inputProps}/>;

        return <Input component={component} ref={ref} {...inputProps}/>;
    });

BasicInput.displayName = 'BasicInput';

/**
 * A simple number input.
 * @param {InputWrapperProps} props
 * @return {JSX.Element}
 */
export const NumberInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        return <BasicInput defaultType={'text'} ref={ref} type={InputTypes.Number} {...props}/>;
    },
);

NumberInput.displayName = 'NumberInput';

/**
 * A simple text input.
 */
export const TextInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        return <BasicInput defaultType={'text'} ref={ref} type={InputTypes.Text} {...props}/>;
    },
);

TextInput.displayName = 'TextInput';

/**
 * A simple email input.
 * @param {InputWrapperProps} props
 * @return {JSX.Element}
 */
export const EmailInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        return <BasicInput defaultType={'text'} ref={ref} type={InputTypes.Email} {...props}/>;
    },
);

EmailInput.displayName = 'EmailInput';

/**
 * A simple password input.
 * @param {InputWrapperProps} props
 * @return {JSX.Element}
 */
export const PasswordInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        return <BasicInput
            defaultType={'password'}
            ref={ref}
            type={InputTypes.Password}
            {...props}
        />;
    },
);

PasswordInput.displayName = 'PasswordInput';

/**
 * A simple password input.
 * @param {InputWrapperProps} props
 * @return {JSX.Element}
 */
export const CheckboxInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        const resolveValue = useCallback((target: Target) => target.checked, []);

        return <BasicInput
            defaultType={'checkbox'}
            ref={ref}
            type={InputTypes.Checkbox}
            resolveValue={resolveValue}
            {...props}
        />;
    },
);

CheckboxInput.displayName = 'CheckboxInput';
