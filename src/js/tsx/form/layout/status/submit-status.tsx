import React, {useContext} from 'react';

import classNames from 'classnames';

import styles from 'styles/form/layout/status/submit-status.scss';

import {SubmitPhase} from 'constants/enums';

import {FormContext} from '../../context';


/**
 * Displays the current status of the form, in text.
 * @return {JSX.Element}
 */
export default function SubmitStatus() : JSX.Element {
    const baseClassName = 'submit-status';
    const submitPhase = useContext(FormContext).submitPhase;

    if (submitPhase !== SubmitPhase.Stale) {
        let text = '';

        switch (submitPhase) {
        case SubmitPhase.Success:
            text = 'Successfully submitted';
            break;
        case SubmitPhase.Fail:
            text = 'Failed to submit';
            break;
        }

        return <span
            className={
                classNames(
                    styles[baseClassName],
                    styles[`${baseClassName}--${submitPhase}`],
                )
            }
        >
            {text}
        </span>;
    }

    return null;
}
