import React from 'react';
import classNames from 'classnames';

import styles from 'styles/form/layout/inputs/input.scss';

import type {InputComponentProps} from '../input/input-component-wrapper';

import type {InputProps} from '../input';

import Input from '../input';
import {InputTypes} from 'constants/enums';

type DefaultInputTypes = 'text' | 'password';

type InputWrapperProps = Omit<InputProps, 'component'>;

type BasicInputProps = InputWrapperProps & {
    defaultType: DefaultInputTypes,
};

type BasicInputComponentProps = InputComponentProps & {
    defaultType: DefaultInputTypes,
};

/**
 * The input tag for the basic input.
 * @param {BasicInputComponentProps} props
 * @return {JSX.Element}
 */
function BasicInputComponent(props : BasicInputComponentProps) : JSX.Element {
    /**
     * Calls the parent onChange event to update the current value of the input.
     * @param {React.ChangeEvent<HTMLInputElement>} event The original 'change' event.
     */
    function onChange(event : React.ChangeEvent<HTMLInputElement>) {
        props.onChange(event.target.value);
    }

    return <input
        className={
            classNames(
                styles.input,
                `${styles.input}-type-${props.type}`,
                {
                    [`${styles.input}--invalid`]:
                    props.failedValidators && props.failedValidators.length,
                },
                props.className,
            )
        }

        name={props.name}

        value={props.value ? props.value : ''}

        type={props.defaultType}

        required={props.required}
        disabled={props.disabled}

        onChange={onChange}
    />;
}

/**
 * A basic input to extend.
 */
const BasicInput = React.forwardRef((props : BasicInputProps, ref : React.RefObject<Input>) => {
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
    (props : InputWrapperProps, ref : React.RefObject<Input>) => {
        return <BasicInput defaultType={'text'} ref={ref} type={InputTypes.Number} {...props}/>;
    },
);

NumberInput.displayName = 'NumberInput';

/**
 * A simple text input.
 */
export const TextInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<Input>) => {
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
    (props : InputWrapperProps, ref : React.RefObject<Input>) => {
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
    (props : InputWrapperProps, ref : React.RefObject<Input>) => {
        return <BasicInput
            defaultType={'password'}
            ref={ref}
            type={InputTypes.Password}
            {...props}
        />;
    },
);

PasswordInput.displayName = 'PasswordInput';
