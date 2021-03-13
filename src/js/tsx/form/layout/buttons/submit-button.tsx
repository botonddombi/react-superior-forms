import React, {useContext} from 'react';

import classNames from 'classnames';

import styles from 'styles/form/layout/buttons/submit-button.scss';

import {FormContext} from '../../context';

type SubmitButtonProps = {
    children?: React.ReactNode
};

/**
 * The submit button, usually placed at the bottom of the form.
 * It will fire the 'onSubmit' event of the parent form.
 * @param {SubmitButtonProps} props
 * @return {JSX.Element}
 */
export default function SubmitButton(props: SubmitButtonProps) : JSX.Element {
    const baseClassName = 'submit-button';
    const formContext = useContext(FormContext);

    return <button
        className={
            classNames(
                styles[baseClassName],
                styles[`${baseClassName}--${formContext.submitPhase}`],
            )
        }
        onClick={formContext.onSubmit}
        type="submit"
    >
        {props.children ?? 'Submit'}
    </button>;
}
