

// React apis
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TextField, Stack, Tooltip } from '@mui/material';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';

const QuantityInput = ({ name, id, error, disabled, value, onValueChange, incrementDisableFlag }) => {

    //Count state
    const [count, setCount] = useState(value);

    // Localizations - multilingual
    const intl = useIntl();

    //Handle value increment
    const handleIncrement = () => {
        setCount(count + 1);
        onValueChange(count + 1);
    };

    //Handle value decrement
    const handleDecrement = () => {
        if (count > 1) {
            setCount(count - 1);
            onValueChange(count - 1);
        }
    };

    // Handle value change
    const handleChange = (event) => {
        const inputValue = parseInt(event.target.value)
        if (isNaN(inputValue)) {
            // Handle non-numeric input, e.g., display an error message or reset the count
            // For simplicity, we are resetting the count to 0 here
            setCount(0);
        } else if (inputValue <= value && incrementDisableFlag) {
            setCount(inputValue);
        }
        else if (!incrementDisableFlag) {
            setCount(inputValue);
            onValueChange(inputValue);
        }
    };

    return (
        <Stack
            direction={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            spacing={0.8}
        >
            {disabled ?
                <MinusCircleOutlined className='quantity-disable-icon' />
                :
                <Tooltip title={intl.formatMessage({ id: 'DecrementQty' })}>
                    <MinusCircleOutlined className="quantity--icon" onClick={handleDecrement} />
                </Tooltip>}
            <TextField
                sx={{ width: '85px' }}
                name={name}
                value={count}
                onChange={handleChange}
                fullWidth
                id={id}
                placeholder={intl.formatMessage({ id: 'Quantity' })}
                disabled={disabled}
                error={error}
                inputProps={{
                    style: { textAlign: 'right' },
                }}
            />
            {incrementDisableFlag || disabled ?
                <PlusCircleOutlined className='quantity-disable-icon' /> :
                <Tooltip title={intl.formatMessage({ id: 'IncrementQty' })}>
                    <PlusCircleOutlined className="quantity--icon" onClick={handleIncrement} />
                </Tooltip>
            }
        </Stack>
    );
};
QuantityInput.propTypes = {
    value: PropTypes.number,
    id: PropTypes.any,
    name: PropTypes.string,
    onValueChange: PropTypes.func
}
export default QuantityInput;