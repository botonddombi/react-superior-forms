import React, {useRef, useState, useCallback, useImperativeHandle} from 'react';

import classNames from 'classnames';

import type {InputFailedValidators} from '../../form/layout/input';
import type {InputGroupRepeaterOptions} from './input-group-repeater';
import type {InputOptions, CustomInputOptions} from '../index';

import styles from 'styles/form/layout/input-group.scss';

import {mapRefs} from 'modules/helpers';
import {InputComponents} from 'typings/form';

import {
    InputValidator,
    CustomInputValidator,
} from 'typings/form';

import * as Inputs from '../../form/layout/input-types';

import InputGroupRepeater, {InputGroupRepeaterFailedValidators}
    from './input-group-repeater';

const inputTypes = Object.values(Inputs);

export type InputGroupOptions = {
    legend?: string | JSX.Element,

    className?: string,

    name?: string,

    defaultValue?: object,

    before?: JSX.Element,
    after?: JSX.Element,

    beforeInputs?: JSX.Element,
    inputs?: Array<InputOptions|CustomInputOptions>,
    afterInputs?: JSX.Element,

    inputGroups?: Array<InputGroupOptions>,

    repeater?: boolean|InputGroupRepeaterOptions
};

export type InputGroupProps = InputGroupOptions & {
    key?: number,
    children?: React.ReactNode|JSX.Element|JSX.Element[],
    onValidate?: (
        failedValidators : InputGroupFailedValidators,
        inputComponent: React.RefObject<any>
    ) => void,
};

export type InputGroupFailedValidators = Array<
    InputFailedValidators |
    InputGroupFailedValidators |
    Array<Array<InputValidator|CustomInputValidator>>
>;

export interface InputGroupHandle {
    ref: React.RefObject<any>,
    inputComponents : React.RefObject<Array<InputComponents>>,

    failedValidators: InputGroupFailedValidators

    name: string,
}

const baseClassName = 'input-group';
const inputComponentTypes = [...inputTypes, InputGroup, InputGroupRepeater];

/**
 * A group that wraps one or multiple inputs.
 * @param {InputGroupProps} props
 * @param {React.RefObject<InputGroupHandle>} ref
 * @return {JSX.Element}
 */
function InputGroup(props: InputGroupProps, ref: React.RefObject<InputGroupHandle>) : JSX.Element {
    const fieldset : React.RefObject<HTMLFieldSetElement> = useRef();
    const inputComponents : React.RefObject<Array<InputComponents>> = useRef();
    const [failedValidators, setFailedValidators] = useState<InputGroupFailedValidators>([]);

    useImperativeHandle(ref, () : InputGroupHandle => ({
        ref: fieldset,
        inputComponents,

        failedValidators,

        name: props.name,
    }));

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     * @param {
     *  InputFailedValidators|
     *  InputGroupFailedValidators|
     *  InputGroupRepeaterFailedValidators
     * } currentfailedValidators The failed validators.
     * @param {InputComponents} inputComponent The component that was validated.
     */
    const onValidate = useCallback((
        currentfailedValidators:
            InputFailedValidators |
            InputGroupFailedValidators |
            InputGroupRepeaterFailedValidators,
        inputComponent: React.RefObject<InputComponents>,
    ) => {
        const newFailedValidators = inputComponents.current
            .reduce(
                (previous, current) => [
                    ...(
                        current.ref.current === inputComponent.current ?
                            currentfailedValidators :
                            current.failedValidators
                    ),
                    ...previous,
                ],
                [],
            );

        setFailedValidators(newFailedValidators);

        if (typeof props.onValidate === 'function') {
            props.onValidate(newFailedValidators, fieldset);
        }
    }, [
        props.onValidate,
    ]);

    return <React.Fragment>
        {props.before ?? ''}
        <fieldset
            className={
                classNames(
                    styles[baseClassName],
                    {
                        [`${styles[baseClassName]}--invalid`]:
                        failedValidators.length,
                        [`${baseClassName}-name-${String(props.name).replace(' ', '')}`]:
                        props.name,
                    },
                    props.className,
                )
            }

            ref={fieldset}
        >
            {props.legend ? <legend>{props.legend}</legend> : ''}
            {props.beforeInputs ?? ''}
            {
                mapRefs(
                    props.children,
                    inputComponentTypes,
                    inputComponents,
                    {
                        onValidate,
                    },
                    {
                        defaultValue: (child) =>
                            child.props.defaultValue ??
                            (
                                (typeof props.defaultValue !== 'undefined') ?
                                    (
                                        props.defaultValue[child.props.name] ??
                                        undefined
                                    ) :
                                    undefined
                            ),
                    },
                )
            }
            {props.afterInputs ?? ''}
        </fieldset>
        {props.after ?? ''}
    </React.Fragment>;
}

export default React.forwardRef(InputGroup);
