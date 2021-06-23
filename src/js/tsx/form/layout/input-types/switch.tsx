import React, {useImperativeHandle, useRef, useCallback} from 'react';
import classNames from 'classnames';

import styles from 'styles/form/layout/input.scss';
import switchStyles from 'styles/form/layout/input-types/switch.scss';

import type {InputComponentProps} from '../input/input-component-wrapper';

import type {InputType} from '../input';

import Input, {InputHandle} from '../input';
import {InputComponent} from '../input/input-component-wrapper';

import {InputTypes} from 'constants/enums';

type InputWrapperProps = Omit<InputType, 'component'>;

const baseClassName = 'switch';

/**
 * The input tag for the switch input.
 * @param {InputComponentProps} props
 * @param {React.RefObject<InputComponent>} ref
 * @returns {JSX.Element}
 */
const SwitchInputComponent = React.forwardRef((
    props: InputComponentProps,
    ref: React.RefObject<InputComponent>,
) : JSX.Element => {
    const wrapper : React.RefObject<HTMLDivElement> = useRef();

    useImperativeHandle(ref, () : InputComponent => ({
        ref: wrapper,
        /**
         * Focuses the input element.
         */
        focus: () => {
            wrapper.current.focus();
        },
    }));

    /**
     * Calls the parent onChange event to update the current value of the input.
     */
    const onClick = useCallback(() => {
        props.onChange(!props.value);
    }, [props.onChange, props.value]);

    return (
        <div
            className={
                classNames(
                    styles.input,
                    `${styles.input}-type-${props.type}`,
                    {
                        [`${styles.input}--invalid`]:
                        props.validationMessage,
                    },
                    switchStyles[baseClassName],
                    {
                        [switchStyles[`${baseClassName}--on`]]:
                        props.value,
                    },
                    props.className,
                )
            }
            data-name={props.name}
            data-disabled={props.disabled}
            onClick={onClick}
        >
            <div className={switchStyles[`${baseClassName}-fill-wrapper`]}>
                <div className={switchStyles[`${baseClassName}-fill`]}/>
            </div>
        </div>
    );
});

SwitchInputComponent.displayName = 'SwitchInputComponent';

/**
 * The switch input.
 */
const SwitchInput = React.forwardRef(
    (props : InputWrapperProps, ref : React.RefObject<InputHandle>) => {
        const component = <SwitchInputComponent {...props} />;
        return <Input component={component} ref={ref} {...props} type={InputTypes.Switch}/>;
    });

SwitchInput.displayName = 'SwitchInput';

export default SwitchInput;
