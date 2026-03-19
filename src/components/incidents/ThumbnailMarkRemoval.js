import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Icon, Button } from '@folio/stripes/components'
import { 
  thumbnailContainerStyle, 
  thumbnailTextStyle,
  buttonContainerStyle,
  thumbnailStyle,
  buttonStyle
} from './ThumbnailStyles';
const ThumbnailMarkRemoval = ({ handleUndo, undoId }) => {
  return (
    <>
    <div style={thumbnailContainerStyle}>
      
      <div style={thumbnailStyle}>
        <Icon icon='dash'></Icon>
      </div>

      <div style={thumbnailTextStyle}>
        <p><FormattedMessage id="media-marked-for-removal"/></p>
      </div>

      <div style={buttonContainerStyle}>
        <Button 
          buttonStyle='default'
          style={buttonStyle}
          onClick={() => handleUndo(undoId)}
        >
        <FormattedMessage id="undo-button"/>
      </Button>
      </div>
    </div>
    </>
  );
};

export default ThumbnailMarkRemoval;