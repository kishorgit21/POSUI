// Number only hook
const useNumberInputList = (onSetField, onCustomerChange, field) => {

    // Method to avoid non-number input
    const handleChange = (event) => {
        // Filter input to digits only value
        const inputValue = event.target.value.replace(/\D/g, '');

        onCustomerChange(inputValue);
        
        // Set field value input method
        onSetField(field, inputValue);
    };

    return [handleChange];
};

export default useNumberInputList;