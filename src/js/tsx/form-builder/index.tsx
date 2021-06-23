import React from 'react';

import {InputTypes} from '../../includes/constants/enums';

import type {InputType} from '../form/layout/input';
import type {InputWrapperType} from './layout/input-wrapper';
import {InputGroupOptions} from './layout/input-group';

import {
    Input, TextInput, NumberInput, EmailInput, PasswordInput, CheckboxInput, SwitchInput,
} from '../form/layout/input-types';

import Form, {FormProps, FormHandle} from '../form';

import InputGroup from './layout/input-group';
import InputGroupRepeater from './layout/input-group-repeater';
import InputWrapper from './layout/input-wrapper';

import SubmitButton from '../form/layout/buttons/submit-button';
import SubmitStatus from '../form/layout/status/submit-status';

export type InputOptions = Omit<InputType, 'type'> & InputWrapperType & {
    type:
        InputTypes.Text|InputTypes.Email|InputTypes.Number|
        InputTypes.Password|InputTypes.Checkbox|InputTypes.Switch

    className?: string,
};

export type CustomInputOptions = Omit<InputOptions, 'type'> & {
    type: InputTypes.Custom,
    component: React.ReactElement
};

export type FormBuilderProps = Omit<FormProps, 'children'> & {
    inputGroups: Array<InputGroupOptions>,
    submitText?: string,
    submitStatus?: boolean
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
    case InputTypes.Checkbox:
        return <CheckboxInput {...input}/>;
    case InputTypes.Switch:
        return <SwitchInput {...input}/>;
    default:
        return <Input {...input}/>;
    }
}

/**
 * Builds the a form from the specified options.
 * @param {FormBuilderProps} props
 * @param {React.RefObject<FormHandle>} ref
 * @return {JSX.Element}
 */
function FormBuilder(props: FormBuilderProps, ref: React.RefObject<FormHandle>) : JSX.Element {
    const {inputGroups, ...formProps} = props;

    /**
     * Renders the input groups.
     * This function is calling itself recursively to render the sub input groups as well.
     * @param {Array<InputGroupOptions>} inputGroups
     * @param {number} groupIndexOffset
     * @return {React.ReactElement}
     */
    function renderInputGroups(
        inputGroups : Array<InputGroupOptions> = [],
        groupIndexOffset : number = 0,
    ) : JSX.Element[] {
        return inputGroups.map((inputGroup : InputGroupOptions, groupIndex) => {
            const {inputs, repeater, ...inputGroupProps} = inputGroup;

            const children = [
                ...inputs.map((input, inputIndex) => {
                    const {
                        label, before, after, beforeInput, afterInput, wrapperClassName,
                        ...inputProps
                    } = input;

                    return <InputWrapper
                        key={inputIndex}
                        name={inputProps.name}
                        label={label}
                        before={before}
                        after={after}
                        beforeInput={beforeInput}
                        afterInput={afterInput}
                        wrapperClassName={wrapperClassName}
                    >
                        {resolveInput(inputProps)}
                    </InputWrapper>;
                }),
                ...renderInputGroups(inputGroup.inputGroups, inputs.length),
            ];

            if (repeater) {
                return <InputGroupRepeater
                    {...repeater}
                    name={inputGroupProps.name}
                    inputGroupProps={inputGroupProps}
                    key={groupIndexOffset + groupIndex}
                >
                    {children}
                </InputGroupRepeater>;
            }

            return <InputGroup
                key={groupIndexOffset + groupIndex}
                {...inputGroupProps}
            >
                {children}
            </InputGroup>;
        });
    }

    return <Form
        {...formProps}
        ref={ref}
    >
        {renderInputGroups(inputGroups)}
        {props.submitText ? <SubmitButton>{props.submitText}</SubmitButton> : <SubmitButton/>}
        {(props.submitStatus ?? true) ? <SubmitStatus/> : null}
    </Form>;
}

export default React.forwardRef(FormBuilder);
