import React, {useImperativeHandle, useRef, useState, useCallback} from 'react';

import classNames from 'classnames';

import {mapRefs} from 'modules/helpers';

import styles from 'styles/form/layout/input-group-repeater.scss';

import type {InputGroupFailedValidators, InputGroupProps, InputGroupHandle} from './input-group';

import InputGroup from './input-group';

export type InputGroupRepeaterOptions = {
    defaultValue?: Array<object>,

    entries?: number,
    minEntries?: number,
    maxEntries?: number,

    legend?: string|((props: {index: number}) => JSX.Element),

    addComponent?: React.ReactElement,
    removeComponent?: React.ReactElement,
};

type InputGroupRepeaterProps = InputGroupRepeaterOptions & {
    name: string,

    onValidate?: (
        failedValidators: InputGroupRepeaterFailedValidators,
        inputGroupComponent: React.RefObject<any>
    ) => void,

    inputGroupProps?: InputGroupProps,

    children?: React.ReactElement|React.ReactElement[]
};

export type InputGroupRepeaterFailedValidators = Array<InputGroupFailedValidators>;

type DefaultButtonComponentProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => void,
}

type ButtonComponentProps = DefaultButtonComponentProps & {
    type: string
};

const baseClassName = 'input-group-repeater';

/**
 * The default button component for removing and adding entries.
 * @param {ButtonComponentProps} props
 * @return {JSX.Element}
 */
function ButtonComponent(props : ButtonComponentProps) : JSX.Element {
    return <button
        className={
            classNames(
                styles[`${baseClassName}-button`],
                styles[`${baseClassName}-button-${props.type}`],
            )
        }
        onClick={
            (event : React.MouseEvent<HTMLElement>) => {
                event.preventDefault();
                props.onClick(event);
            }
        }
        type="button"
        tabIndex={-1}
    />;
}

const DefaultAddComponent = (props : DefaultButtonComponentProps) =>
    <ButtonComponent type={'add'} {...props}/>;

const DefaultRemoveComponent = (props : DefaultButtonComponentProps) =>
    <ButtonComponent type={'remove'} {...props}/>;

export interface InputGroupRepeaterHandle {
    ref: React.RefObject<any>,
    inputGroups: React.RefObject<Array<InputGroupHandle>>,

    failedValidators: InputGroupRepeaterFailedValidators

    name: string,
}

/**
 * The input group repeater component which may contain one or more of the same input group.
 * @param {InputGroupRepeaterProps} props
 * @param {React.RefObject<InputGroupRepeaterHandle>} ref
 * @return {JSX.Element}
 */
function InputGroupRepeater(
    props: InputGroupRepeaterProps,
    ref: React.RefObject<InputGroupRepeaterHandle>,
) : JSX.Element {
    const fieldset : React.RefObject<HTMLFieldSetElement> = useRef();
    const inputGroups : React.RefObject<Array<InputGroupHandle>> = useRef();

    const entryCount = props.defaultValue ?
        props.defaultValue.length :
        (props.entries ?? 1);

    const [entries, setEntries] = useState<Array<number>>(
        [...Array(entryCount)].map((_, index) => index),
    );
    const [entryCounter, setEntryCounter] = useState<number>(entryCount);
    const [failedValidators, setFailedValidators] =
    useState<InputGroupRepeaterFailedValidators>([]);

    useImperativeHandle(ref, () : InputGroupRepeaterHandle => ({
        ref: fieldset,
        inputGroups,

        failedValidators,

        name: props.name,
    }));

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     * @param {InputGroupFailedValidators} currentfailedValidators The failed validators.
     * @param {React.RefObject<InputGroupHandle>} inputGroupComponent The group component that was validated.
     */
    const onValidate = useCallback((
        currentfailedValidators: InputGroupFailedValidators,
        inputGroupComponent: React.RefObject<InputGroupHandle>,
    ) => {
        const newFailedValidators = inputGroups.current
            .reduce(
                (previous, current) => [
                    ...(
                        current.ref.current === inputGroupComponent.current ?
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
    }, []);

    /**
     * Removes an entry from the targeted index.
     * @param {number} index The targeted inex.
     */
    function removeEntry(index: number) {
        const newEntries = [...entries];
        newEntries.splice(index, 1);

        setEntries(newEntries);
    }

    /**
     * Adds a new entry to the end of the list.
     */
    const addEntry = useCallback(() => {
        const newEntries = [...entries];
        newEntries.push(entryCounter);

        setEntries(newEntries);
        setEntryCounter(entryCounter + 1);
    }, []);

    const renderedInputGroups = entries.map((key, index) => {
        const inputGroup = <InputGroup
            {...props.inputGroupProps}
            legend= {
                props.legend ?
                    (
                        (typeof props.legend === 'function') ?
                            props.legend({index}) :
                            `${props.legend} ${index + 1}`
                    ) :
                    (
                        props.inputGroupProps ?
                            props.inputGroupProps.legend :
                            null
                    )
            }
            name={props.name}
            defaultValue={
                (typeof props.defaultValue !== 'undefined') ?
                    props.defaultValue[key] ?? undefined :
                    undefined
            }
            key={key}
        >
            {props.children}
        </InputGroup>;

        return (props.minEntries !== undefined && props.maxEntries === props.minEntries) ?
            inputGroup :
            <div className={styles[`${baseClassName}-entry`]}>
                <span>{inputGroup}</span>
                {
                    props.removeComponent ?
                        React.cloneElement(props.removeComponent, {
                            onClick: (event: React.MouseEvent<HTMLElement>) => {
                                event.preventDefault();

                                removeEntry(index);

                                if (typeof props.removeComponent.props.onClick === 'function') {
                                    props.removeComponent.props.onClick(event);
                                }
                            },
                        }) :
                        <DefaultRemoveComponent onClick={() => removeEntry(index)}/>
                }
            </div>;
    });

    return <fieldset
        className={
            classNames(
                baseClassName,
                {
                    [`${baseClassName}-name-${props.name.replace(' ', '')}`]:
                    props.name,
                    [`${baseClassName}--invalid`]:
                    failedValidators.length,
                },
            )
        }
        ref={fieldset}
    >
        {
            mapRefs(
                renderedInputGroups,
                [InputGroup],
                inputGroups,
                {
                    onValidate,
                },
            )
        }
        {
            (!props.maxEntries || entries.length < props.maxEntries) ?
                (
                    props.addComponent ?
                        React.cloneElement(props.addComponent, {
                            onClick: (event: React.MouseEvent<HTMLElement>) => {
                                event.preventDefault();

                                addEntry();

                                if (typeof props.addComponent.props.onClick === 'function') {
                                    props.addComponent.props.onClick(event);
                                }
                            },
                        }) :
                        <DefaultAddComponent onClick={addEntry}/>
                ) :
                null
        }
    </fieldset>;
}

export default React.forwardRef(InputGroupRepeater);
