import React from 'react';

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
    onValidate?: (failedValidators: InputFailedValidators) => void
};

export type InputProps = InputType & {
    component: React.ReactElement,
};

type InputState = {
    value: any,
    processedValue: any,
    dirty: boolean,

    failedValidators: InputFailedValidators
};

/**
 * The input component which all other inputs of the form share.
 */
export default class Input extends React.Component<InputProps, InputState> {
    public component : React.RefObject<InputComponent>;
    public wrapper : React.RefObject<HTMLDivElement>;

    /**
     * Initializes the value of the input and binds the necessary scope.
     * @param {InputProps} props
     */
    constructor(props : InputProps) {
        super(props);

        this.state = {
            value: this.props.defaultValue ?? null,
            processedValue: this.props.defaultValue ?? null,
            dirty: false,

            failedValidators: [],
        };

        this.component = React.createRef();
        this.wrapper = React.createRef();

        this.onChange = this.onChange.bind(this);
        this.onValidate = this.onValidate.bind(this);
    }

    /**
     * Gets the current failed validators of the input.
     * @return {InputFailedValidators} The current failed validators of the input.
     */
    get failedValidators() : InputFailedValidators {
        return this.state.failedValidators;
    }

    /**
     * Gets the current value of the input.
     * @return {any} The current value of the input.
     */
    get value() : any {
        return this.state.value;
    }

    /**
     * Gets the current processed value of the input.
     * @return {any} The current processed value of the input.
     */
    get processedValue() : any {
        return this.state.processedValue;
    }

    /**
     * The change event that should be called whenever the input component's value has changed.
     * @param {any} value The new value.
     * @param {any} processedValue The processed new value.
     * @param {boolean} initialCall Whether this is the initial change call.
     */
    onChange(value : any, processedValue : any, initialCall : boolean = false) : void {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }

        this.setState({
            value,
            processedValue,
            dirty: this.state.dirty || !initialCall,
        });
    }

    /**
     * The validation event that is called whenever the input component's value has been validated.
     * @param {InputFailedValidators} failedValidators The failed validators.
     */
    onValidate(failedValidators : InputFailedValidators) {
        this.setState({
            failedValidators,
        });

        if (typeof this.props.onValidate === 'function') {
            this.props.onValidate(failedValidators);
        }
    }

    /**
     * Renders the true input component and wraps it with validation if needed.
     * @return {React.ReactNode}
     */
    render() : React.ReactNode {
        const component = React.cloneElement(this.props.component, {
            ref: this.component,
        });

        return <InputComponentWrapper
            {...this.props}
            component={component}

            value={this.state.value}
            dirty={this.state.dirty}
            onChange={this.onChange}
            onValidate={this.onValidate}

            innerRef={this.wrapper}
        />;
    }
}
