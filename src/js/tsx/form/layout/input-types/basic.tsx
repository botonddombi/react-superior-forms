import React from 'react';
import classNames from 'classnames';

import styles from 'styles/form/layout/inputs/input.scss';

import type {InputComponentProps} from '../input/input-component-wrapper';

import type {InputType} from '../input';

import Input, {InputHandle} from '../input';
import {InputTypes} from 'constants/enums';
import {InputComponent} from '../input/input-component-wrapper';

type DefaultInputTypes = 'text' | 'password';

type InputWrapperProps = Omit<InputType, 'component'>;

type BasicInputProps = InputWrapperProps & {
    defaultType: DefaultInputTypes,
};

type BasicInputComponentProps = InputComponentProps & {
    defaultType: DefaultInputTypes,
};

/**
 * The input tag for the basic input.
 */
class BasicInputComponent
    extends React.Component<BasicInputComponentProps>
    implements InputComponent {
    private input : React.RefObject<HTMLInputElement>;

    /**
     * @param {BasicInputComponentProps} props
     */
    constructor(props : BasicInputComponentProps) {
        super(props);

        this.input = React.createRef();

        this.onChange = this.onChange.bind(this);
        this.focus = this.focus.bind(this);
    }

    /**
     * Focuses the input element.
     */
    focus() {
        this.input.current.focus();
    }

    /**
     * Calls the parent onChange event to update the current value of the input.
     * @param {React.ChangeEvent<HTMLInputElement>} event The original 'change' event.
     */
    onChange(event : React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(event.target.value);
    }

    /**
     * Renders the input element and applies a ref to it.
     * @return {React.ReactNode}
     */
    render() : React.ReactNode {
        const props = this.props;

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

            value={props.value ?? ''}

            type={props.defaultType}

            required={props.required}
            disabled={props.disabled}

            onChange={this.onChange}

            ref={this.input}
        />;
    }
}

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
