import React, {useRef, useEffect} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/index.scss';

import type {InputDefaults} from 'typings/form';

import {mapRefsIntoGroups} from 'modules/helpers';

import * as Inputs from './layout/input-types';

import InputGroup from '../form-builder/layout/input-group';

import {FormDefaultsContext} from './context';

const inputTypes = Object.values(Inputs);

export type FormProps = {
    route: string,
    className?: string,
    inputDefaults?: InputDefaults,
    children?: React.ReactElement[]|React.ReactElement
};

/**
 * The component that builds the form.
 * @param {FormProps} props
 * @return {JSX.Element}
 */
export default function Form(props : FormProps) : JSX.Element {
    const inputDefaults = props.inputDefaults ?? {};
    const inputGroups = useRef([]);

    useEffect(() => {
        setInterval(() => console.log(inputGroups.current), 1000);
        // setInterval(() => console.log(inputGroups.current.map((curr) => curr.value)), 1000);
    }, []);

    return (
        <FormDefaultsContext.Provider value={inputDefaults}>
            <form className={classNames(styles.form, props.className)}>
                {
                    mapRefsIntoGroups(
                        props.children,
                        inputTypes,
                        'name',
                        [InputGroup],
                        'name',
                        inputGroups,
                    )
                }
            </form>
        </FormDefaultsContext.Provider>
    );
}
