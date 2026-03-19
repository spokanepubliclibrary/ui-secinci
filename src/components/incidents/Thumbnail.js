import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@folio/stripes/components';
import { 
  thumbnailContainerStyle, 
  thumbnailTextStyle,
  buttonContainerStyle,
  thumbnailStyle,
  buttonStyle
} from './ThumbnailStyles';
import playButton from '../../../icons/playButton.png';

import { FormattedMessage } from 'react-intl';
const Thumbnail = React.memo(({ 
  handler, 
  mediaId, 
  src, 
  alt, 
  imageDescription, 
  handleMarkForRemoval,
  context
  }) => {

  return (
    <>
    <div style={thumbnailContainerStyle}>
       <button onClick={handler} type="button">
        {src === 'isVideo' ? (
         <img 
            src={playButton} 
            alt={alt} 
            style={thumbnailStyle} 
          />
        ) : (<img 
            src={src} 
            alt={alt} 
            style={thumbnailStyle} 
          />)}
      </button>

      <div style={thumbnailTextStyle}>
        <p>{imageDescription}</p>
      </div>

      {context === 'details' ? 
      <></> : (<div style={buttonContainerStyle}>
        <Button
          buttonStyle='default'
          style={buttonStyle}
          onClick={() => handleMarkForRemoval(mediaId)}
          type="button"
          aria-label={`Remove ${imageDescription}`}
        >
          <FormattedMessage id="remove-button" />
        </Button>
      </div>)}
    </div>
     
    </>
  );
}); 

Thumbnail.propTypes = {
  handler: PropTypes.func.isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  imageDescription: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  contentType: PropTypes.string.isRequired
};

export default Thumbnail;