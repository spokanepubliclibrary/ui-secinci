/* 
  ProfilePicture - a Track app vendored and slightly scoped down copy 
  of the ProfilePicture as seen in the @folio/stripes-smart-components v10.0.2.
*/
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Img } from 'react-image';
import { Loading } from '@folio/stripes/components';
import { isAValidURL } from './isAValidURL';
import profilePicThumbnail from '../../../../../icons/profilePicThumbnail.png';
import useProfilePicture from './useProfilePicture';
import css from './ProfilePicture.css';

const ProfilePicture = ({ profilePictureLink, croppedLocalImage }) => {
  /* 
    croppedLocalImage is not used in Track (read only for ProfilePicture)
    keeping prop and logic path for API parity so potential future comparisons or upgrades remain predictable. 
  */
  const intl = useIntl();

  const { isFetching, profilePictureData } = useProfilePicture({ profilePictureId: profilePictureLink });

  const hasProfilePicture = Boolean(croppedLocalImage) || Boolean(profilePictureLink);

  const isProfilePictureLinkAURL = hasProfilePicture && isAValidURL(profilePictureLink);

  const profilePictureSrc = croppedLocalImage || (isProfilePictureLinkAURL ? profilePictureLink : 'data:;base64,' + profilePictureData);
  
  const imgSrc = !hasProfilePicture ? profilePicThumbnail : profilePictureSrc;

  if (isFetching) {
    return <span data-testid="profile-picture-loader"> <Loading /> </span>;
  }

  return (
    <Img
      data-testid="profile-picture"
      className={css.profilePlaceholder}
      alt={intl.formatMessage({ id: 'ui-users.information.profilePicture' })}
      src={imgSrc}
      loader={<Loading />}
    />
  );
};

ProfilePicture.propTypes = {
  profilePictureLink: PropTypes.string,
  croppedLocalImage: PropTypes.string,
};

export default ProfilePicture;