import PropTypes from 'prop-types';

// material-ui
// import { TableCell, Tooltip, Button } from '@mui/material';

// third-party
import { getIn } from 'formik';

// project import
import PurchaseOrderField from './PurchaseOrderField';

// assets
// import { DeleteOutlined } from '@ant-design/icons';

// ==============================|| INVOICE - ITEMS ||============================== //

const PurchaseOrderItem = ({ Material_name, qty, price, onChange, onEditItem, Blur, errors, touched }) => {
  const deleteItemHandler = () => {
    onDeleteItem(index);
  };

  const Name = `Purchase_detail[${index}].Material_name`;
  const touchedName = getIn(touched, Name);
  const errorName = getIn(errors, Name);

  const textFieldItem = [
    {
      placeholder: 'Material',
      label: 'Item Name',
      name: `Material_name`,
      type: 'text',
      id: id,
      value: Material_name,
      errors: errorName,
      touched: touchedName
    },
    { label: 'Qty', type: 'number', name: `qty`, id: id, value: qty, placeholder: 'quantity' },
    { label: 'price', type: 'text', name: `price`, id: id, value: price, placeholder: 'price' }
  ];

  return (
    <>
      {textFieldItem.map((item) => {
        return (
          <PurchaseOrderField
            onEditItem={(event) => onEditItem(event)}
            onChange={(event) => onChange(event)}
            onBlur={(event) => Blur(event)}
            cell={{
              placeholder: item.placeholder,
              name: item.name,
              type: item.type,
              id: item.id,
              value: item.value,
              errors: item.errors,
              touched: item.touched
            }}
            key={item.label}
          />
        );
      })}
      <TableCell>
        <Tooltip title="Remove Item">
          <Button color="error" onClick={deleteItemHandler}>
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </TableCell>
    </>
  );
};

PurchaseOrderItem.propTypes = {
  id: PropTypes.string,
  Material_name: PropTypes.string,
  qty: PropTypes.string,
  price: PropTypes.string,
  onDeleteItem: PropTypes.func,
  onEditItem: PropTypes.func,
  onChange: PropTypes.func,
  index: PropTypes.number,
  Blur: PropTypes.func,
  errors: PropTypes.object,
  touched: PropTypes.object
};

export default PurchaseOrderItem;
