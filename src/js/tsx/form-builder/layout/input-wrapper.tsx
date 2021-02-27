import React, {useRef, useState} from 'react';

import classNames from 'classnames';

import {mapRefs} from 'modules/helpers';

import styles from 'styles/form/layout/input-wrapper.scss';

import * as Inputs from '../../form/layout/input-types';

const inputTypes = Object.values(Inputs);

export type InputWrapperType = {
    label?: string | JSX.Element,

    wrapperClassName?: string,

    before?: JSX.Element,
    after?: JSX.Element,

    beforeInput?: JSX.Element,
    afterInput?: JSX.Element,
};

type InputWrapperProps = InputWrapperType & {
    key: number,
    children?: React.ReactElement,
};

/**
 * The wrapper around the input, it's label, and additional
 * before and after components.
 * @param {InputWrapper} props
 * @return {JSX.Element}
 */
export default function InputWrapper(props : InputWrapperProps) : JSX.Element {
    const baseClassName = 'input-wrapper';
    const inputs = useRef([]);
    const [hasFailedValidation, setHasFailedValidation] = useState(false);

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     */
    function onValidate() {
        setHasFailedValidation(
            inputs.current.reduce(
                (previous, current) => previous || current.failedValidators.length,
                false,
            ),
        );
    }

    return <React.Fragment>
        {props.before ?? ''}
        <div
            className={
                classNames(
                    styles[baseClassName],
                    {
                        [`${styles[baseClassName]}--invalid`]: hasFailedValidation,
                    },
                    props.wrapperClassName,
                )
            }
        >
            {props.label ? <label>{props.label}</label> : ''}
            {props.beforeInput ?? ''}
            {
                mapRefs(
                    props.children,
                    inputTypes,
                    inputs,
                    {
                        onValidate,
                    },
                )
            }
            {props.afterInput ?? ''}
        </div>
        {props.after ?? ''}
    </React.Fragment>;
}
