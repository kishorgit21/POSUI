

// React apis
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { TextField, Stack, Tooltip, FormHelperText } from '@mui/material';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';

const QuantityInput = ({ name, id, helperText, disabled, className, value, onValueChange }) => {

    //Count state
    const [count, setCount] = useState(value||'');

    // Localizations - multilingual
    const intl = useIntl();


    // Update the local count state when the value prop changes
    useEffect(() => {
        setCount(value);
    }, [value]);

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
        // const inputValue = parseInt(event.target.value, 10);

        // if (!isNaN(sanitizedValue)) {
        //     setCount(sanitizedValue);
        //     onValueChange(sanitizedValue);
        // } else {
        //     // Handle the case where input is not a valid number
        //     setCount(''); // Set the count to 1 as the minimum valid value
        //     onValueChange(''); // You might want to update the parent with a default value of 1
        // }
        const value = event.target.value;

        const sanitizedValue = value.replace(/^0+|[^0-9]/g, '');

        setCount(sanitizedValue);
        onValueChange(sanitizedValue)
    };

    return (
        <>
            <Stack
                direction={'row'}
                justifyContent={'center'}
                alignItems={'center'}
            // spacing={0.8}
            >

                {disabled || count == 1 || count==''?
                    <MinusCircleOutlined className='quantity-disable-icon' />
                    :
                    <Tooltip title={intl.formatMessage({ id: 'DecrementQty' })}>
                        <MinusCircleOutlined className="quantity--icon" onClick={handleDecrement} />
                    </Tooltip>}
                <TextField
                    sx={{ width: '85px', marginLeft: '5px', marginRight: '5px' }}
                    name={name}
                    value={count}
                    onChange={handleChange}
                    fullWidth
                    id={id}
                    // placeholder={intl.formatMessage({ id: 'Quantity' })}
                    placeholder='0'
                    disabled={disabled}
                    className={className}
                    error={Boolean(helperText)}
                    inputProps={{
                        style: { textAlign: 'right' },
                    }}
                />
                {disabled ?
                    <PlusCircleOutlined className='quantity-disable-icon' /> :
                    <Tooltip title={intl.formatMessage({ id: 'IncrementQty' })}>
                        <PlusCircleOutlined className="quantity--icon" onClick={handleIncrement} />
                    </Tooltip>
                }
            </Stack>
            <FormHelperText error={true} sx={{ width: '100%', textAlign: 'right' }}>
                {helperText}
            </FormHelperText>
        </>
    );
};
QuantityInput.propTypes = {
    value: PropTypes.number,
    id: PropTypes.any,
    name: PropTypes.string,
    onValueChange: PropTypes.func
}
export default QuantityInput;