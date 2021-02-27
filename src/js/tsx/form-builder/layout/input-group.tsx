import React, {useRef, useState} from 'react';

import classNames from 'classnames';

import styles from 'styles/form/layout/input-group.scss';

import {mapRefs} from 'modules/helpers';

import {InputGroupOptions} from '../index';

import * as Inputs from '../../form/layout/input-types';

const inputTypes = Object.values(Inputs);

type InputGroupProps = InputGroupOptions & {
    key: number,
    children?: React.ReactElement[]
};

/**
 * A group that wraps one or multiple inputs.
 * @param {InputGroupProps} props
 * @return {JSX.Element}
 */
export default function InputGroup(props : InputGroupProps) : JSX.Element {
    const baseClassName = 'input-group';
    const inputs = useRef([]);
    const [failedValidators, setFailedValidators] = useState([]);

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     */
    function onValidate() {
        setFailedValidators(
            inputs.current.filter((current) => current.failedValidators.length),
        );
    }

    return <React.Fragment>
        {props.before ?? ''}
        <fieldset
            className={
                classNames(
                    styles[baseClassName],
                    {
                        [`${styles[baseClassName]}--invalid`]: failedValidators.length,
                    },
                    props.className,
                )
            }
        >
            {props.legend ? <legend>{props.legend}</legend> : ''}
            {props.beforeInputs ?? ''}
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
            {props.afterInputs ?? ''}
        </fieldset>
        {props.after ?? ''}
    </React.Fragment>;
}
