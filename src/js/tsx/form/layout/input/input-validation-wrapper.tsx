import React, {useMemo, useEffect, useState, useContext} from 'react';

import classNames from 'classnames';

import {InputTypes} from 'constants/enums';

import {
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import {assertValidation, getValidationMessage} from 'modules/input-validator';

import styles from 'styles/form/layout/inputs/input.scss';

import type {InputFailedValidators} from './index';

import {FormContext} from '../../../form/context';

type InputValidationWrapperProps = {
    innerRef: React.RefObject<HTMLDivElement>,

    value: any,

    dirty: boolean,

    type: InputTypes,

    validators: Array<InputValidator|CustomInputValidator>,
    hideValidateMessage: boolean,

    required?: boolean,

    children: React.ReactElement,

    onValidate?: (failedValidators: InputFailedValidators) => void
}

/**
 * An immediate wrapper around the input and the validation message.
 * @param {InputValidationWrapperProps} props
 * @return {React.ReactNode}
 */
export default function InputValidationWrapper(props : InputValidationWrapperProps) {
    const submitAttempted : boolean = useContext(FormContext).submitAttempted;
    const [failedValidators, setFailedValidators] = useState([]);

    /**
     * Validates the input and fires the 'onValidate' callback
     * to notify all parent components of the validation.
     */
    useEffect(() => {
        const validators = props.validators.filter(
            (validation) => !assertValidation(validation, props.value),
        );

        props.onValidate(validators);

        setFailedValidators(validators);
    }, [props.validators, props.value, props.onValidate]);

    /**
     * The first failed validator's message to display.
     */
    const validationMessage = useMemo(() : React.ReactNode | null => {
        if (
            failedValidators.length &&
            props.hideValidateMessage !== true &&
            (props.dirty || submitAttempted)
        ) {
            return <label>
                {
                    getValidationMessage(
                        failedValidators[0],
                        props.value,
                    )
                }
            </label>;
        }
    }, [
        failedValidators,
        props.hideValidateMessage,
        props.dirty,
        submitAttempted,
    ]);

    return (
        <div
            className={
                classNames(
                    styles['input-validation-wrapper'],
                    {
                        [`${styles['input-validation-wrapper']}--invalid`]:
                        validationMessage,
                    },
                )
            }
            ref={props.innerRef}
        >
            {
                React.cloneElement(props.children, {
                    failedValidators,
                    validationMessage,
                })
            }
            {validationMessage}
        </div>
    );
}
