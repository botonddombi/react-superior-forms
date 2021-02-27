import React, {useMemo} from 'react';

import classNames from 'classnames';

import {InputTypes} from 'constants/enums';

import {
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import {assertValidation, getValidationMessage} from 'modules/input-validator';

import styles from 'styles/form/layout/inputs/input.scss';

type InputValidationWrapperProps = {
    value: any,

    type: InputTypes,

    validators: Array<InputValidator|CustomInputValidator>,
    hideValidateMessage: boolean,

    required?: boolean,

    children: React.ReactElement,

    onValidate?: (failedValidators: Array<InputValidator|CustomInputValidator>) => void
}

/**
 * An immediate wrapper around the input and the validation message.
 * @param {InputValidationWrapperProps} props
 * @return {React.ReactNode}
 */
export default function InputValidationWrapper(props : InputValidationWrapperProps) {
    const failedValidators = useMemo(() : Array<InputValidator|CustomInputValidator> => {
        const validators = props.validators.filter(
            (validation) => !assertValidation(validation, props.value),
        );

        setTimeout(() => props.onValidate(validators));

        return validators;
    }, [props.validators, props.value]);

    const memoizedValidationMessage = useMemo(() : React.ReactNode | null => {
        if (
            failedValidators.length &&
            props.hideValidateMessage !== true
        ) {
            return <label>
                {getValidationMessage(failedValidators[0], props.value)}
            </label>;
        }
    }, [
        props.validators,
        props.hideValidateMessage,
        props.value,
    ]);

    return (
        <div className={classNames(
            styles['input-validation-wrapper'],
            {
                [`${styles['input-validation-wrapper']}--invalid`]: failedValidators.length,
            },
        )}>
            {
                React.cloneElement(props.children, {
                    failedValidators,
                })
            }
            {memoizedValidationMessage}
        </div>
    );
}
