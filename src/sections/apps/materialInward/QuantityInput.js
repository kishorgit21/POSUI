

// React apis
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { TextField, Stack, Tooltip, FormHelperText } from '@mui/material';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';

const QuantityInput = ({ name, poQuantity, id, helperText, isPoAvailable, hasProductWithQuantityOne, disabled, className, value, onValueChange, setFilteredPurchase_detailErrMsg }) => {
    //count state
    const [count, setCount] = useState(value);

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
        setFilteredPurchase_detailErrMsg('')
    };

    //Handle value decrement
    const handleDecrement = () => {

        const compareCount = !hasProductWithQuantityOne ? 1 : 0
        if (count > compareCount) {
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
            onValueChange(0);
        } else if (inputValue <= poQuantity) {
            setCount(inputValue);
            onValueChange(inputValue);
        }
        else if (!isPoAvailable) {
            setCount(inputValue);
            onValueChange(inputValue);
        }
        setFilteredPurchase_detailErrMsg('')
    };
    return (
        <>
            <Stack
                direction={'row'}
                justifyContent={'center'}
                alignItems={'center'}>
                {count == 0 || !hasProductWithQuantityOne || disabled?
                    <MinusCircleOutlined className='quantity-disable-icon' /> :
                    <Tooltip title={intl.formatMessage({ id: 'DecrementQty' })}>
                        <MinusCircleOutlined className="quantity--icon" onClick={handleDecrement} />
                    </Tooltip>}
                <TextField
                    className={className}
                    sx={{ width: '85px', marginLeft: '5px', marginRight: '5px' }}
                    name={name}
                    value={count}
                    onChange={handleChange}
                    fullWidth
                    id={id}
                    placeholder={intl.formatMessage({ id: 'Quantity' })}
                    disabled={disabled}
                    error={Boolean(helperText)}
                    inputProps={{
                        style: { textAlign: 'right' },
                    }}
                />
                {((poQuantity == count) && isPoAvailable) || disabled ?
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
    isPoAvailable: PropTypes.bool,
    disabled: PropTypes.bool,
    name: PropTypes.string,
    onValueChange: PropTypes.func
}
export default QuantityInput;