/* eslint-disable react/no-access-state-in-setstate */
import React from 'react';

import App from '../common/app';
import styled from 'styled-components';
import { appPathname } from '../../config';
import media from '../../styles/utils/media-queries';

import { SidebarWrapper } from '../common/view-wrappers';
import Introduction from './introduction';
import { StyledLink } from '../common/link';

const HomeWrapper = styled(SidebarWrapper)`
  height: inherit;
`;

const FakeMap = styled.div`
  background: url(${appPathname}/assets/graphics/content/dc-map.png);
  box-shadow: inset 0 0 0 2000px rgba(0, 0, 0, 0.1);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  height: 20rem;
  ${media.mediumUp`
    height: 100%;
  `};

  h4 {
    text-transform: uppercase;
    background: rgba(240,240,240, 0.85);
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    font-weight: normal;
    letter-spacing: 0.5px;
  }
`;

export default class Home extends React.Component {
  render () {
    return (
      <App pageTitle='Welcome' hideFooter>
        <HomeWrapper>
          <Introduction />
          <FakeMap as={StyledLink} to='/explore'>
            <h4>Click the map to start exploring</h4>
          </FakeMap>
        </HomeWrapper>
      </App>
    );
  }
}
