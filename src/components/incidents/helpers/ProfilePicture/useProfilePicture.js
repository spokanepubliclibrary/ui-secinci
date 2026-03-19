import { useEffect, useRef, useState, useCallback } from 'react';
import { useStripes } from '@folio/stripes/core';

// lightweight uuid check
const looksLikeUUID = (s) =>
  typeof s === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

const API_BASE = 'users/profile-picture';

// session cache
const cache = new Map();

/**
 * fetch profile picture for a given UUID.
 * returns { isFetching, isLoading, profilePictureData (base64), error, reload }
 *
 * - returns base64 only; <ProfilePicture /> caller builds 
 *  the data: URI at its profilePictureSrc 
 * 
 * - 404 is treated as "no picture", not an error (returns empty string).
 * - uses Okapi headers from stripes context by default; can be overridden via options -> Track app doesn't make use of these options, but keeping as a zero cost potential future alignment with FOLIO upstream
 */
export default function useProfilePicture(
  { profilePictureId },
  options = {} // { baseUrl, tenant, token, enabled, disableCache }
) {
  const stripes = typeof useStripes === 'function' ? useStripes() : null;

  const okapiUrl = options.baseUrl ?? stripes?.okapi?.url;
  const okapiTenant = options.tenant ?? stripes?.okapi?.tenant;
  const okapiToken = options.token ?? stripes?.okapi?.token;
  const disableCache = Boolean(options.disableCache);

  const enabled =
    (options.enabled ?? true) &&
    Boolean(profilePictureId) &&
    looksLikeUUID(profilePictureId) &&
    Boolean(okapiUrl) &&
    Boolean(okapiTenant);

  const [isFetching, setIsFetching] = useState(false);
  const [profilePictureData, setProfilePictureData] = useState(
    (!disableCache && cache.get(profilePictureId)) || ''
  );
  const [error, setError] = useState(null);

  // bump this to force re-fetch
  const [nonce, setNonce] = useState(0);
  const abortRef = useRef(null);

  const reload = useCallback(() => {
    if (!disableCache) cache.delete(profilePictureId);
    setNonce((n) => n + 1);
  }, [profilePictureId, disableCache]);

  useEffect(() => {
    if (!enabled) {
      setIsFetching(false);
      setError(null);
      // don't wipe data; allows graceful fallback
      return;
    }

    if (!disableCache && cache.has(profilePictureId)) {
      setProfilePictureData(cache.get(profilePictureId));
      setIsFetching(false);
      setError(null);
      return;
    }

    setIsFetching(true);
    setError(null);

    // cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `${okapiUrl.replace(/\/$/, '')}/${API_BASE}/${profilePictureId}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'X-Okapi-Tenant': okapiTenant,
        ...(okapiToken ? { 'X-Okapi-Token': okapiToken } : {}),
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) return null; // no picture set
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`GET ${API_BASE}/${profilePictureId} failed: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!json) {
          setProfilePictureData('');
          return;
        }
        // payload key in Users: profile_picture_blob
        const b64 = json.profile_picture_blob ?? '';
        const val = typeof b64 === 'string' ? b64 : '';
        if (!disableCache) cache.set(profilePictureId, val);
        setProfilePictureData(val);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e);
      })
      .finally(() => setIsFetching(false));

    return () => controller.abort();
  }, [
    enabled,
    okapiUrl,
    okapiTenant,
    okapiToken,
    profilePictureId,
    disableCache,
    nonce, // triggers reload
  ]);

  return { isFetching, isLoading: isFetching, profilePictureData, error, reload };
}
