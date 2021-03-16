import React from 'react';

import classNames from 'classnames';

import {mapRefs} from 'modules/helpers';

import styles from 'styles/form/layout/input-group-repeater.scss';

import type {InputGroupFailedValidators, InputGroupProps} from './input-group';

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
        inputGroupComponent: InputGroupRepeater
    ) => void,

    inputGroupProps?: InputGroupProps
};

export type InputGroupRepeaterFailedValidators = Array<InputGroupFailedValidators>;

type InputGroupRepeaterState = {
    failedValidators : InputGroupRepeaterFailedValidators,
    entries: Array<number>,
    entryCounter: number
};

type DefaultButtonComponentProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => void,
}

type ButtonComponentProps = DefaultButtonComponentProps & {
    type: string
};

/**
 * The default button component for removing and adding entries.
 * @param {ButtonComponentProps} props
 * @return {JSX.Element}
 */
function ButtonComponent(props : ButtonComponentProps) : JSX.Element {
    return <button
        className={
            classNames(
                styles[`${InputGroupRepeater.baseClassName}-button`],
                styles[`${InputGroupRepeater.baseClassName}-button-${props.type}`],
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
/**
 * The input group repeater component which may contain one or more of the same input group.
 */
export default
class InputGroupRepeater extends React.Component<InputGroupRepeaterProps, InputGroupRepeaterState> {
    public static baseClassName = 'input-group-repeater';
    public inputGroups : React.RefObject<Array<InputGroup>>;

    /**
     * @param {InputGroupRepeaterProps} props
     */
    constructor(props : InputGroupRepeaterProps) {
        super(props);

        this.inputGroups = React.createRef();

        const entryCount = props.defaultValue ?
            props.defaultValue.length :
            (props.entries ?? 1);

        this.state = {
            entries: [...Array(entryCount)].map((_, index) => index),
            entryCounter: entryCount,
            failedValidators: [],
        };

        this.onValidate = this.onValidate.bind(this);
        this.removeEntry = this.removeEntry.bind(this);
        this.addEntry = this.addEntry.bind(this);
    }


    /**
     * Gets the current failed validators of all input groups placed in this repeater.
     */
    get failedValidators() : InputGroupRepeaterFailedValidators {
        return this.state.failedValidators;
    }

    /**
     * Captures the validation of all inputs placed in this group.
     * Additionally, checks whether all inputs are clear of failed validators.
     * Additionally, checks whether all inputs are clear of failed validators.
     * @param {InputGroupFailedValidators} currentfailedValidators The failed validators.
     * @param {InputGroup} inputGroupComponent The group component that was validated.
     */
    onValidate(
        currentfailedValidators: InputGroupFailedValidators,
        inputGroupComponent: InputGroup,
    ) {
        const failedValidators = this.inputGroups.current
            .reduce(
                (previous, current) => [
                    ...(
                        current === inputGroupComponent ?
                            currentfailedValidators :
                            current.failedValidators
                    ),
                    ...previous,
                ],
                [],
            );

        this.setState({
            failedValidators,
        });


        if (typeof this.props.onValidate === 'function') {
            this.props.onValidate(failedValidators, this);
        }
    }

    /**
     * Removes an entry from the targeted index.
     * @param {number} index The targeted inex.
     */
    removeEntry(index: number) {
        const entries = [...this.state.entries];
        entries.splice(index, 1);

        this.setState({
            entries,
        });
    }

    /**
     * Adds a new entry to the end of the list.
     */
    addEntry() {
        const entries = [...this.state.entries];
        entries.push(this.state.entryCounter);

        this.setState({
            entries,
            entryCounter: this.state.entryCounter + 1,
        });
    }

    /**
     * Renders the input group components and wraps it with a div.
     * @return {React.ReactNode}
     */
    render() : React.ReactNode {
        const props = this.props;
        const inputGroups = this.state.entries.map((key, index) => {
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
                <div className={styles[`${InputGroupRepeater.baseClassName}-entry`]}>
                    <span>{inputGroup}</span>
                    {
                        props.removeComponent ?
                            React.cloneElement(props.removeComponent, {
                                onClick: (event: React.MouseEvent<HTMLElement>) => {
                                    event.preventDefault();

                                    this.removeEntry(index);

                                    if (typeof props.removeComponent.props.onClick === 'function') {
                                        props.removeComponent.props.onClick(event);
                                    }
                                },
                            }) :
                            <DefaultRemoveComponent onClick={() => this.removeEntry(index)}/>
                    }
                </div>;
        });

        return <fieldset
            className={
                classNames(
                    InputGroupRepeater.baseClassName,
                    {
                        [`${InputGroupRepeater.baseClassName}-name-${props.name.replace(' ', '')}`]:
                        props.name,
                        [`${InputGroupRepeater.baseClassName}--invalid`]:
                        this.state.failedValidators.length,
                    },
                )
            }
        >
            {
                mapRefs(
                    inputGroups,
                    [InputGroup],
                    this.inputGroups,
                    {
                        onValidate: this.onValidate,
                    },
                )
            }
            {
                (!props.maxEntries || this.state.entries.length < props.maxEntries) ?
                    (
                        props.addComponent ?
                            React.cloneElement(props.addComponent, {
                                onClick: (event: React.MouseEvent<HTMLElement>) => {
                                    event.preventDefault();

                                    this.addEntry();

                                    if (typeof props.addComponent.props.onClick === 'function') {
                                        props.addComponent.props.onClick(event);
                                    }
                                },
                            }) :
                            <DefaultAddComponent onClick={this.addEntry}/>
                    ) :
                    null
            }
        </fieldset>;
    }
}
