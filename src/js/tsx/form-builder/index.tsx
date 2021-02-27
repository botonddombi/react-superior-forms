import React from 'react';

import {InputTypes} from 'constants/enums';

import type {InputType} from '../form/layout/input';
import type {InputWrapperType} from './layout/input-wrapper';

import {Input, TextInput, NumberInput, EmailInput, PasswordInput} from '../form/layout/input-types';

import Form, {FormProps} from '../form';

import InputGroup from './layout/input-group';
import InputWrapper from './layout/input-wrapper';

export type InputOptions = Omit<InputType, 'type'> & InputWrapperType & {
    type: InputTypes.Text|InputTypes.Email|InputTypes.Number|InputTypes.Password,

    className?: string,
};

export type CustomInputOptions = Omit<InputOptions, 'type'> & {
    type: InputTypes.Custom,
    component: React.ReactElement
};

export type InputGroupOptions = {
    legend?: string | JSX.Element,

    className?: string,

    name?: string,

    before?: JSX.Element,
    after?: JSX.Element,

    beforeInputs?: JSX.Element,
    inputs?: Array<InputOptions|CustomInputOptions>,
    afterInputs?: JSX.Element,

    inputGroups?: Array<InputGroupOptions>,
};

type FormBuilderProps = Omit<FormProps, 'children'> & {
    inputGroups: Array<InputGroupOptions>
};

/**
 * Resolves the input type into a component.
 * @param {InputOptions|CustomInputOptions} input
 * @return {JSX.Element}
 */
function resolveInput(input : InputOptions|CustomInputOptions) : JSX.Element {
    switch (input.type) {
    case InputTypes.Text:
        return <TextInput {...input}/>;
    case InputTypes.Number:
        return <NumberInput {...input}/>;
    case InputTypes.Email:
        return <EmailInput {...input}/>;
    case InputTypes.Password:
        return <PasswordInput {...input}/>;
    default:
        return <Input {...input}/>;
    }
}

/**
 * Builds the a form from the specified options.
 * @param {FormBuilderProps} props
 * @return {JSX.Element}
 */
export default function FormBuilder(props : FormBuilderProps) : JSX.Element {
    const {inputGroups, ...formProps} = props;

    return <Form
        {...formProps}
    >
        {
            inputGroups.map((inputGroup, index) => {
                const {inputs, ...inputGroupProps} = inputGroup;

                return <InputGroup
                    key={index}
                    {...inputGroupProps}
                >
                    {
                        inputs.map((input, index) => {
                            const {
                                label, before, after, beforeInput, afterInput, wrapperClassName,
                                ...inputProps
                            } = input;

                            return <InputWrapper
                                key={index}
                                label={label}
                                before={before}
                                after={after}
                                beforeInput={beforeInput}
                                afterInput={afterInput}
                                wrapperClassName={wrapperClassName}
                            >
                                {resolveInput(inputProps)}
                            </InputWrapper>;
                        })
                    }
                </InputGroup>;
            })
        }
    </Form>;
}
