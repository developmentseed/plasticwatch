import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PropTypes as T } from 'prop-types';
import get from 'lodash.get';

import { environment } from '../../config';
import { connect } from 'react-redux';
import * as actions from '../../redux/actions/users';
import { wrapApiResult, getFromState } from '../../redux/utils';
import { getUTCDate } from '../../utils/date';

import media from '../../styles/utils/media-queries';
import { themeVal } from '../../styles/utils/general';
import { ScrollWrap } from '../../styles/table';

import App from '../common/app';
import UhOh from '../uhoh';
import { InnerPanel, Panel, PanelStats, PanelStat } from '../../styles/panel';
import Button from '../../styles/button/button';

const FullPagePanel = styled(Panel)`
  ${InnerPanel} {
    max-height: none;
    h2 {
      margin-bottom: 1rem;
    }
    margin: 0;
    &:not(:last-of-type) {
      margin-bottom: 2rem;
    }
  }
  ${media.mediumUp`
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 2rem;
    height: 100vh;
    overflow: hidden;
    width: 36rem;
    ${InnerPanel} {
      max-height: calc(100vh - 6rem);
      &:not(:last-of-type) {
        margin-bottom: 0;
      }
    }
  `};
`;

const UserInfo = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  ${media.mediumUp`
    flex-flow: row wrap;
  `}
`;

const UserName = styled.h2`
  width: 100%;
  text-align: center;
  ${media.mediumUp`
    text-align: left;
  `}
`;

const Avatar = styled.img`
  margin: 1rem 2rem 1rem 1rem;
  border-radius: 50%;
  max-width: 150px;
  border: 2px solid ${themeVal('color.primary')};
  box-shadow: 0 0 0 0.5rem ${themeVal('color.base')};
  margin-bottom: 1rem;
`;

const UserData = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  ${PanelStat} {
    border-right: none;
  }
  small {
    margin-top: 1rem;
  }
`;

const BadgeGrid = styled.ul`
  display: grid;
  margin: 1rem 0;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  list-style: none;
`;

const BadgeItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const BadgeName = styled.h3`
  font-size: 1rem;
  color: ${themeVal('color.secondary')};
  letter-spacing: 0.25px;
  text-transform: uppercase;
  vertical-align: middle;
  position: relative;
  text-align: center;
  margin: 0.5rem 0;

  span {
    display: block;
    font-size: 0.75rem;
    font-weight: ${themeVal('type.base.regular')};
    color: ${themeVal('color.baseMed')};
  }
`;

const BadgeHolder = styled.span`
  background: linear-gradient(135deg, ${themeVal('color.primary')}, ${themeVal('color.base')} 75%);
  border-radius: 50%;
  position: relative;
  width: 160px;
  height: 160px;
`;

const BadgeImg = styled.img`
  border-radius: 50%;
  border: 0.125rem solid ${themeVal('color.surface')};
  position: absolute;
  width: 88%;
  top: 6%;
  left: 6%;
`;

function UserView(props) {
  // Fetch user on page load
  useEffect(() => {
    props.fetchUser(props.match.params.id);
  }, []);

  const [osmImgUrl, setOsmImgUrl] = useState(null);

  useEffect(() => {
    if (!props.user.isReady() || props.user.hasError()) return;
    const user = props.user.getData();

    async function fetchProfilePicUrl() {
      if (user.osmId && gravatar === null) {
        try {
          const res = await fetch(
            `https://www.openstreetmap.org/api/0.6/user/${user.osmId}.json`
          ).then((res) => res.json());
          setOsmImgUrl(get(res, 'user.img.href'));
        } catch (error) {
          // eslint-disable-next-line
          console.log('Could not fetch OSM Profile Picture.');
        }
      }
    }
    fetchProfilePicUrl();
  }, [props.user.isReady()]);

  // Get user data, if available
  if (!props.user.isReady()) return <></>;
  if (props.user.hasError()) return <UhOh />;
  const user = props.user.getData();
  const { badges, observations, gravatar } = user;
  const { id: authId } = props.authenticatedUser.getData();

  const lastSurveyDate = observations
    .map((o) => o.createdAt)
    .sort()
    .pop();

  const campaignsCount = Array.from(
    new Set(observations.map((o) => o.campaignId))
  ).length;

  // Use gravatar > use OSM profile photo > use placeholder
  const profileImageSrc = gravatar
    ? `https://www.gravatar.com/avatar/${gravatar}?s=200&d=mp`
    : (osmImgUrl || `https://via.placeholder.com/150/EDEDED/3D4B74?text=${user.displayName}`);

  return (
    <App pageTitle='User Profile'>
      <FullPagePanel>
        <InnerPanel>
          <UserInfo>
            <Avatar src={profileImageSrc} />
            <UserData>
              <UserName>{user.displayName}</UserName>
              {observations.length === 0 ? (
                <PanelStat>
                  <span>No surveys yet</span>
                </PanelStat>
              ) : (
                <>
                  <PanelStat>
                    <span>Last Survey</span>
                    {getUTCDate(lastSurveyDate)}
                  </PanelStat>
                  {/* The below stat can be re-enabled once campaigns are passed down to the user profile route
                  <PanelStat>
                    <span>Last surveyed in</span>
                    {campaigns.name}
                  </PanelStat> */}
                </>
              )}
              {
                // Only render Edit button on a user's own profile
                authId === user.id &&
                <>
                  <Button
                    as='a'
                    size='small'
                    variation='primary-raised-light'
                    href={user.osmDisplayName
                      ? `https://www.openstreetmap.org/user/${user.osmDisplayName}/account`
                      : 'https://www.gravatar.com'}
                  >
                    Edit profile
                  </Button>
                  {
                    !user.osmDisplayName &&
                    <small>
                      PlasticWatch uses Gravatar for your user profile photo. Click the link above to sign in to Gravatar and edit your profile.
                    </small>
                  }
                </>
              }
            </UserData>
          </UserInfo>
          <PanelStats>
            <PanelStat>
              {observations.length}
              <span>surveys</span>
            </PanelStat>
            <PanelStat>
              {campaignsCount}
              <span>campaigns contributed</span>
            </PanelStat>
            <PanelStat>
              {badges.length}
              <span>Earned Badges</span>
            </PanelStat>
          </PanelStats>
          <h2>Badges</h2>
          <ScrollWrap>
            {badges.length === 0 ? (
              <div>This user has not yet earned any badges.</div>
            ) : (
              <BadgeGrid>
                {badges.map((b) => (
                  <BadgeItem key={b.badgeId}>
                    <BadgeHolder>
                      <BadgeImg src={`data:image/svg+xml;base64,${b.image}`} />
                    </BadgeHolder>
                    <BadgeName>
                      {b.name}
                      <span>Level {b.description.level}</span>
                    </BadgeName>
                    <p>{b.description.text}</p>
                  </BadgeItem>
                ))}
              </BadgeGrid>
            )}
          </ScrollWrap>
        </InnerPanel>
      </FullPagePanel>
    </App>
  );
}

if (environment !== 'production') {
  UserView.propTypes = {
    fetchUser: T.func,
    match: T.object,
    user: T.object,
    authenticatedUser: T.object
  };
}

function mapStateToProps(state, props) {
  const { id } = props.match.params;

  return {
    user: wrapApiResult(getFromState(state, `users.individual.${id}`)),
    authenticatedUser: wrapApiResult(state.authenticatedUser),
    accessToken: get(state, 'authenticatedUser.data.accessToken')
  };
}

function dispatcher(dispatch) {
  return {
    fetchUser: (...args) => dispatch(actions.fetchUser(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(UserView);
