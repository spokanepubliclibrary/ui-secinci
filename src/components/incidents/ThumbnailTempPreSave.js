import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@folio/stripes/components';
import { 
  thumbnailContainerStyle, 
  thumbnailTextStyle,
  buttonContainerStyle,
  thumbnailStyle,
  buttonStyle
} from './ThumbnailStyles';
import { FormattedMessage } from 'react-intl';
const ThumbnailTempPreSave = React.memo(({ 
  mediaId, 
  src, 
  alt, 
  imageDescription, 
  handleRemoveUnsavedMedia,
  handleRemoveUnsavedMediaCreate,
  context
  }) => {

  return (
    <>
    <div style={thumbnailContainerStyle}>
      {src === 'isVideo' ? (
        <div style={thumbnailStyle}>
          <Icon icon='play' size='large'></Icon>
        </div>
      ) 
      : src === 'isPdf' ? (
        <div style={thumbnailStyle}>
          <Icon icon='report' size='large'></Icon>
        </div>
      ) :(<img 
        src={src} 
        alt={alt} 
        style={thumbnailStyle} 
      />)}
      

      <div style={thumbnailTextStyle}>
        <p>{imageDescription}</p>
      </div>

      <div style={buttonContainerStyle}>
        <Button
          buttonStyle='default'
          style={buttonStyle}
          onClick={context === 'create' ? 
            () => handleRemoveUnsavedMediaCreate(mediaId) 
            : () => handleRemoveUnsavedMedia(mediaId)}
          type="button"
          aria-label={`Remove ${imageDescription}`}
        >
        <FormattedMessage id="remove-button" />
        </Button>
      </div>
    </div>
    </>
  );
}); 

ThumbnailTempPreSave.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  imageDescription: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  handleRemoveUnsavedMedia: PropTypes.func,
};

export default ThumbnailTempPreSave;