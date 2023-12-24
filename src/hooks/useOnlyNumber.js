// Number only hook
const useNumberInput = (onSetField, field) => {

    // Method to avoid non-number input
    const handleChange = (event) => {
        // Filter input to digits only value
        const inputValue = event.target.value.replace(/\D/g, '');

        // Set field value input method
        onSetField(field, inputValue);
    };

    return [handleChange];
};

export default useNumberInput;