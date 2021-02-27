import React from 'react';

import {InputTypes} from 'constants/enums';

import {
    Validator,
    Formatter,
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import InputComponentWrapper from './input-component-wrapper';

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
    onValidate?: (failedValidators: Array<InputValidator|CustomInputValidator>) => void
};

export type InputProps = InputType & {
    ref?: React.RefObject<Input>,
    component: React.ReactElement,
};

type InputState = {
    value: any,
};

/**
 * The input component which all other inputs of the form share.
 */
export default class Input extends React.Component<InputProps, InputState> {
    failedValidators: Array<InputValidator|CustomInputValidator>;

    /**
     * Initializes the value of the input and binds the necessary scope.
     * @param {InputProps} props
     */
    constructor(props : InputProps) {
        super(props);

        this.failedValidators = [];

        this.state = {
            value: this.props.defaultValue ?? null,
        };

        this.onChange = this.onChange.bind(this);
        this.onValidate = this.onValidate.bind(this);
    }

    /**
     * Gets the current value of the input.
     * @return {any} The current value of the input.
     */
    get value() : any {
        return this.state.value;
    }

    /**
     * The change event that should be called whenever the input component's value has changed.
     * @param {any} value The new value.
     */
    onChange(value : any) : void {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }

        this.setState({
            value,
        });
    }

    /**
     * The validation event that is called whenever the input component's value has been validated.
     * @param {InputValidator|CustomInputValidator} failedValidators The failed validators.
     */
    onValidate(failedValidators : Array<InputValidator|CustomInputValidator>) {
        this.failedValidators = failedValidators;

        if (typeof this.props.onValidate === 'function') {
            this.props.onValidate(failedValidators);
        }
    }

    /**
     * Renders the true input component and wraps it with validation if needed.
     * @return {React.ReactNode}
     */
    render() : React.ReactNode {
        return <InputComponentWrapper
            {...this.props}
            value={this.state.value}
            onChange={this.onChange}
            onValidate={this.onValidate}
        />;
    }
}
