import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Icon } from '@folio/stripes/components';

const IncidentTypeCard = ({
  handleTypeToggle,
  id,
  category_id,
  title,
  description,
  isSelected,
}) => {
  const typeData = {
    id,
    title,
    category_id,
    description,
  };

  const handleClick = () => {
    handleTypeToggle(typeData);
  };

  return (
    <Card
      style={{ height: '210px', overflow: 'auto' }}
      roundedBorder
      headerStart={<b>{title}</b>}
      headerEnd={
        <Button
          buttonStyle={isSelected ? 'success' : 'primary'}
          style={{ marginTop: '10px' }}
          onClick={handleClick}
        >
          {isSelected ? <Icon icon="check-circle" size="large" /> : 'Add'}
        </Button>
      }
    >
      {description}
    </Card>
  );
};

IncidentTypeCard.propTypes = {
  handleTypeToggle: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  category_id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default IncidentTypeCard;
